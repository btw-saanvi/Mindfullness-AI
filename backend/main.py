from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from datetime import datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mindfulai")

app = FastAPI(title="MindfulAI API", version="2.0.0")

# Allowed origins
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mindfullness-ai.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# --- Constants ---
MAX_MESSAGE_LENGTH = 5000
AI_MODEL_NAME = "gemini-1.5-flash"

# Storage (In-Memory Data Structures)
conversation_history: Dict[str, List[str]] = {}
user_sessions: Dict[str, List[Dict[str, Any]]] = {}
user_mood_logs: Dict[str, List[Dict[str, Any]]] = {}
user_preferences_store: Dict[str, Dict[str, Any]] = {}


# --- Structured AI Call Helper ---
def call_ai(prompt: str, fallback: str) -> str:
    """
    Wraps Google Generative AI calls with structured error handling.
    Returns the AI response text on success, or the fallback text on failure.
    Logs errors for debugging without exposing internals to the client.
    """
    if not GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set — returning fallback response")
        return fallback

    try:
        model = genai.GenerativeModel(AI_MODEL_NAME)
        response = model.generate_content(prompt)

        # Handle empty or blocked responses
        if response is None:
            logger.warning("AI returned None response")
            return fallback

        if not getattr(response, "text", None):
            # Check if response was blocked by safety filters
            if hasattr(response, "prompt_feedback") and response.prompt_feedback:
                logger.warning(f"AI response blocked by safety filters: {response.prompt_feedback}")
            else:
                logger.warning("AI returned empty text response")
            return fallback

        return response.text.strip()

    except Exception as e:
        error_type = type(e).__name__
        error_module = type(e).__module__ or ""

        # Rate limit / quota exceeded
        if "ResourceExhausted" in error_type or "429" in str(e):
            logger.error(f"AI API rate limit exceeded: {error_type}")
            raise HTTPException(
                status_code=429,
                detail="The AI service is temporarily busy. Please wait a moment and try again."
            )

        # Permission / authentication errors
        if "PermissionDenied" in error_type or "403" in str(e):
            logger.error(f"AI API permission denied: {error_type}")
            raise HTTPException(
                status_code=503,
                detail="AI service configuration issue. Please try again later."
            )

        # Invalid request (bad prompt, etc.)
        if "InvalidArgument" in error_type or "400" in str(e):
            logger.error(f"AI API invalid argument: {error_type}")
            return fallback

        # Network / timeout errors
        if any(term in error_type for term in ["Timeout", "ConnectionError", "NetworkError"]):
            logger.error(f"AI API network error: {error_type}")
            raise HTTPException(
                status_code=503,
                detail="Unable to reach the AI service. Please check your connection and try again."
            )

        # Generic fallback — log full error, return safe message
        logger.error(f"Unexpected AI error ({error_type}): {e}")
        return fallback

# Pydantic Schemas with Input Validation
class ChatRequest(BaseModel):
    user_id: str
    message: str
    gender: str = "female"
    persona: str = "calm"   # calm | motivational | cbt | mindfulness
    genz: bool = False
    journaling: bool = False
    vibe: Optional[str] = "chill" # chill | hype | grounded

    @field_validator("user_id")
    @classmethod
    def user_id_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("user_id must not be empty")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_valid(cls, v):
        if not v or not v.strip():
            raise ValueError("message must not be empty")
        if len(v) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters")
        return v.strip()

class SessionStartRequest(BaseModel):
    user_id: str
    need: str # vent | reframe | calm | intention
    mood_score: int # 1 to 10
    stressor: Optional[str] = None

    @field_validator("mood_score")
    @classmethod
    def mood_score_in_range(cls, v):
        if v < 1 or v > 10:
            raise ValueError("mood_score must be between 1 and 10")
        return v

class SessionEndRequest(BaseModel):
    user_id: str
    session_id: str

class CBTReframeRequest(BaseModel):
    user_id: str
    automatic_thought: str
    evidence_against: str
    balanced_thought: str

class OnboardingRequest(BaseModel):
    user_id: str
    primary_goal: str
    vibe: str
    biggest_stressor: Optional[str] = None

# Crisis Detection & Hotline Data
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", 
    "self harm", "cutting myself", "overdose", "no reason to live", "end it all"
]

CRISIS_RESPONSE = {
    "is_crisis": True,
    "reply": (
        "I hear how deeply painful things are right now. Because I am an AI companion and not a human crisis counselor, "
        "I want to make sure you get immediate, compassionate human support.\n\n"
        "Please connect with people who can help right now:\n"
        "• Suicide & Crisis Lifeline: Call or text 988 (US & Canada, free & 24/7)\n"
        "• Crisis Text Line: Text HOME to 741741\n"
        "• India AASRA Helpline: Call +91-9820466726\n"
        "• International Lifelines: https://findahelpline.com/\n\n"
        "You do not have to carry this alone. Please reach out to one of these resources or a professional near you."
    ),
    "resources": [
        {"name": "988 Lifeline (US/CA)", "contact": "Call or text 988"},
        {"name": "Crisis Text Line", "contact": "Text HOME to 741741"},
        {"name": "AASRA (India)", "contact": "+91-9820466726"},
        {"name": "Find a Helpline (Global)", "contact": "https://findahelpline.com/"}
    ]
}

def detect_crisis(message: str) -> bool:
    msg_lower = message.lower()
    return any(keyword in msg_lower for keyword in CRISIS_KEYWORDS)

# System Prompt Generator (Wellness Companion Positioning)
def build_companion_prompt(user_id: str, message: str, gender: str, persona: str, vibe: str, journaling: bool) -> str:
    user_pref = user_preferences_store.get(user_id, {})
    stressor_context = f" User's main stressor: {user_pref.get('biggest_stressor')}." if user_pref.get('biggest_stressor') else ""

    system_instruction = (
        "You are MindfulAI, a warm, grounding mental wellness reflection companion (NOT a doctor, therapist, or medical provider). "
        "Your role is to offer empathetic active listening, gentle encouragement, and practical reflection prompts. "
        "Never offer medical diagnoses or prescribe clinical treatments. Keep responses concise, warm, and conversational."
        f"{stressor_context}"
    )

    if vibe == "hype":
        system_instruction += " Speak in an energetic, encouraging, uplifting tone."
    elif vibe == "grounded":
        system_instruction += " Speak in a steady, direct, and mindful tone."
    else:
        system_instruction += " Speak in a calm, relaxed, and comforting tone."

    if persona == "cbt":
        system_instruction += " Help the user reframe unhelpful assumptions and explore alternative balanced perspectives."
    elif persona == "mindfulness":
        system_instruction += " Offer grounding techniques and present-moment awareness."
    elif persona == "motivational":
        system_instruction += " Highlight the user's resilience and small steps of progress."

    history = "\n".join(conversation_history.get(user_id, []))
    return f"{system_instruction}\n\nRecent context:\n{history}\nUser: {message}\nMindfulAI Companion:"

# --- API Endpoints ---

@app.post("/chat")
def chat(request: ChatRequest, authorization: Optional[str] = Header(default="")):
    if authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            info = id_token.verify_oauth2_token(token, google_requests.Request())
            request.user_id = info.get("sub", request.user_id)
        except Exception:
            pass

    # Safety check first
    if detect_crisis(request.message):
        return CRISIS_RESPONSE

    prompt = build_companion_prompt(
        request.user_id,
        request.message,
        request.gender,
        request.persona,
        request.vibe or "chill",
        request.journaling
    )

    reply = call_ai(
        prompt,
        fallback="I'm having a brief connection pause, but I am right here listening."
    )

    # Update conversation history
    conversation_history.setdefault(request.user_id, []).append(f"User: {request.message}")
    conversation_history[request.user_id].append(f"Companion: {reply}")
    conversation_history[request.user_id] = conversation_history[request.user_id][-10:]

    # Log message to session
    now_iso = datetime.utcnow().isoformat()
    sessions = user_sessions.setdefault(request.user_id, [])
    if not sessions:
        sessions.append({
            "id": f"sess_{request.user_id}_{int(datetime.utcnow().timestamp())}",
            "started_at": now_iso,
            "last_updated": now_iso,
            "style": request.persona,
            "need": "reflection",
            "messages": [],
            "summary": None
        })
    current = sessions[-1]
    current["messages"].append({"sender": "user", "text": request.message, "timestamp": now_iso})
    current["messages"].append({"sender": "ai", "text": reply, "timestamp": now_iso})
    current["last_updated"] = now_iso

    return {"is_crisis": False, "reply": reply}

@app.post("/onboarding")
def save_onboarding(req: OnboardingRequest):
    user_preferences_store[req.user_id] = {
        "primary_goal": req.primary_goal,
        "vibe": req.vibe,
        "biggest_stressor": req.biggest_stressor
    }
    return {"status": "success", "preferences": user_preferences_store[req.user_id]}

@app.post("/session/start")
def start_session(req: SessionStartRequest):
    now_iso = datetime.utcnow().isoformat()
    sess_id = f"sess_{req.user_id}_{int(datetime.utcnow().timestamp())}"
    
    new_sess = {
        "id": sess_id,
        "started_at": now_iso,
        "last_updated": now_iso,
        "need": req.need,
        "initial_mood": req.mood_score,
        "style": "calm",
        "messages": [],
        "summary": None
    }
    user_sessions.setdefault(req.user_id, []).append(new_sess)

    # Log mood score
    user_mood_logs.setdefault(req.user_id, []).append({
        "timestamp": now_iso,
        "score": req.mood_score,
        "need": req.need
    })

    # Return starter message
    starters = {
        "vent": "I'm ready to listen. Take all the space you need to vent about what's pressing on your heart.",
        "reframe": "Let's examine a thought together. What's the situation or thought that's weighing on you right now?",
        "calm": "Let's pause and breathe together. Tell me how your body and mind are feeling right in this moment.",
        "intention": "Setting an intention is a powerful step. What would you like to focus your energy on today?"
    }
    first_msg = starters.get(req.need, "Welcome to your reflection session. How can I best support you right now?")

    new_sess["messages"].append({"sender": "ai", "text": first_msg, "timestamp": now_iso})
    return {"session_id": sess_id, "starter_message": first_msg}

@app.post("/session/end")
def end_session(req: SessionEndRequest):
    sessions = user_sessions.get(req.user_id, [])
    session = next((s for s in sessions if s["id"] == req.session_id), None)
    
    if not session:
        # Fallback to last session
        session = sessions[-1] if sessions else None

    if not session:
        return {"summary": "Completed session.", "takeaway": "Took time for quiet reflection."}

    user_msgs = [m["text"] for m in session.get("messages", []) if m["sender"] == "user"]
    context_text = " ".join(user_msgs[-5:]) if user_msgs else "General reflection"

    default_summary = "Session focused on emotional reflection and mindful awareness. Takeaway: Practice gentle self-compassion today."

    if user_msgs:
        prompt = (
            f"Summarize this reflection session in 2 short bullet sentences.\n"
            f"1. Core topic discussed\n"
            f"2. One actionable, compassionate takeaway for the user.\n"
            f"User messages: {context_text}"
        )
        summary_text = call_ai(prompt, fallback=default_summary)
    else:
        summary_text = "Session focused on processing thoughts. Takeaway: Remember to check in with yourself gently."

    session["summary"] = summary_text
    return {"summary": summary_text}

@app.post("/cbt-reframe")
def process_cbt(req: CBTReframeRequest):
    prompt = (
        f"Act as a CBT reflection companion. The user filled out a reframing worksheet:\n"
        f"- Automatic Thought: {req.automatic_thought}\n"
        f"- Evidence Against: {req.evidence_against}\n"
        f"- Balanced Thought: {req.balanced_thought}\n\n"
        f"Provide 2-3 sentences of warm validation praising their effort to reframe and affirming their balanced thought."
    )
    analysis = call_ai(
        prompt,
        fallback="Great work reframing! You identified the evidence against your automatic thought and established a balanced perspective."
    )

    return {"analysis": analysis, "status": "success"}

@app.get("/dashboard/{user_id}")
def get_dashboard(user_id: str):
    moods = user_mood_logs.get(user_id, [])
    sessions = user_sessions.get(user_id, [])
    
    # Calculate streak (simple mock count based on distinct dates)
    dates = set(m["timestamp"][:10] for m in moods if "timestamp" in m)
    streak = len(dates)

    # Soft pattern insight
    insight = "You've taken time for self-care. Regular check-ins build emotional resilience."
    if len(moods) >= 3:
        avg_mood = sum(m["score"] for m in moods[-3:]) / 3
        if avg_mood <= 4:
            insight = "Notice: You've experienced some heavy moments recently. Remember to take gentle breathing breaks."
        elif avg_mood >= 7:
            insight = "Pattern Insight: Your mood trend shows positive grounding! Keep nourishing what brings you peace."

    return {
        "user_id": user_id,
        "mood_logs": moods[-14:], # last 14 entries
        "streak_days": streak,
        "total_sessions": len(sessions),
        "pattern_insight": insight,
        "recent_sessions": [
            {
                "id": s["id"],
                "started_at": s["started_at"],
                "need": s.get("need", "reflection"),
                "summary": s.get("summary")
            } for s in sessions[-5:]
        ]
    }

@app.get("/history/{user_id}")
def get_history(user_id: str):
    sessions = user_sessions.get(user_id, [])
    summaries = []
    for s in sessions:
        summaries.append({
            "id": s["id"],
            "started_at": s.get("started_at"),
            "last_updated": s.get("last_updated"),
            "style": s.get("style", "calm"),
            "need": s.get("need", "reflection"),
            "messages_count": len(s.get("messages", [])),
            "preview": next((m["text"] for m in s.get("messages", []) if m.get("sender") == "ai"), ""),
            "summary": s.get("summary")
        })
    return {"sessions": summaries}

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
