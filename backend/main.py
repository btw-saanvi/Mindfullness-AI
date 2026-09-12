"""
MindfulAI Backend Application
FastAPI application defining API routes, session management, and state handling.
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from config import CORS_ORIGINS, MAX_MESSAGE_LENGTH, APP_TITLE, APP_VERSION, GOOGLE_CLIENT_ID
from ai_service import (
    detect_crisis,
    CRISIS_RESPONSE,
    build_companion_prompt,
    call_ai,
    generate_daily_affirmation,
    generate_session_summary,
    generate_cbt_feedback,
)

try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
    _google_auth_available = True
except ImportError:
    _google_auth_available = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mindfulai")

app = FastAPI(title=APP_TITLE, version=APP_VERSION)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory State Storage
conversation_history: Dict[str, List[str]] = {}
user_sessions: Dict[str, List[Dict[str, Any]]] = {}
user_mood_logs: Dict[str, List[Dict[str, Any]]] = {}
user_preferences_store: Dict[str, Dict[str, Any]] = {}


# --- Pydantic Schemas with Input Validation ---
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
    def user_id_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("user_id must not be empty")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_valid(cls, v: str) -> str:
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

    @field_validator("user_id")
    @classmethod
    def user_id_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("user_id must not be empty")
        return v.strip()

    @field_validator("mood_score")
    @classmethod
    def mood_score_in_range(cls, v: int) -> int:
        if v < 1 or v > 10:
            raise ValueError("mood_score must be between 1 and 10")
        return v


class SessionEndRequest(BaseModel):
    user_id: str
    session_id: str

    @field_validator("user_id")
    @classmethod
    def user_id_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("user_id must not be empty")
        return v.strip()


class CBTReframeRequest(BaseModel):
    user_id: str
    automatic_thought: str
    evidence_against: str
    balanced_thought: str

    @field_validator("user_id")
    @classmethod
    def user_id_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("user_id must not be empty")
        return v.strip()


class OnboardingRequest(BaseModel):
    user_id: str
    primary_goal: str
    vibe: str
    biggest_stressor: Optional[str] = None

    @field_validator("user_id")
    @classmethod
    def user_id_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("user_id must not be empty")
        return v.strip()


class GoogleAuthRequest(BaseModel):
    id_token: str


# --- API Route Handlers ---

@app.post("/chat")
async def chat(request: ChatRequest):
    """Primary chat endpoint with crisis detection, prompt building, and conversational logging."""
    # Safety Check: Intercept crisis language immediately
    if detect_crisis(request.message):
        logger.warning(f"Crisis language intercepted for user_id={request.user_id}")
        return CRISIS_RESPONSE

    # Retrieve user conversation context and preferences
    history = conversation_history.get(request.user_id, [])
    prefs = user_preferences_store.get(request.user_id, {})

    prompt = build_companion_prompt(
        user_id=request.user_id,
        message=request.message,
        gender=request.gender,
        persona=request.persona,
        vibe=request.vibe or "chill",
        journaling=request.journaling,
        conversation_history=history,
        user_preferences=prefs
    )

    reply = await call_ai(
        prompt,
        fallback="I'm having a brief connection pause, but I am right here listening."
    )

    # Maintain recent conversation history window
    conversation_history.setdefault(request.user_id, []).append(f"User: {request.message}")
    conversation_history[request.user_id].append(f"Companion: {reply}")
    conversation_history[request.user_id] = conversation_history[request.user_id][-10:]

    # Log interaction to current active session
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
    """Persists user reflection preferences from the initial onboarding flow."""
    user_preferences_store[req.user_id] = {
        "primary_goal": req.primary_goal,
        "vibe": req.vibe,
        "biggest_stressor": req.biggest_stressor
    }
    return {"status": "success", "preferences": user_preferences_store[req.user_id]}


@app.post("/session/start")
def start_session(req: SessionStartRequest):
    """Initiates a structured reflection session with mood check-in and targeted starter."""
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

    # Log mood score for trend analysis
    user_mood_logs.setdefault(req.user_id, []).append({
        "timestamp": now_iso,
        "score": req.mood_score,
        "need": req.need
    })

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
async def end_session(req: SessionEndRequest):
    """Concludes a session and generates an AI recap with actionable takeaway."""
    sessions = user_sessions.get(req.user_id, [])
    session = next((s for s in sessions if s["id"] == req.session_id), None)
    
    if not session:
        session = sessions[-1] if sessions else None

    if not session:
        return {"summary": "Completed session.", "takeaway": "Took time for quiet reflection."}

    user_msgs = [m["text"] for m in session.get("messages", []) if m["sender"] == "user"]
    summary_text = await generate_session_summary(user_msgs)

    session["summary"] = summary_text
    return {"summary": summary_text}


@app.post("/cbt-reframe")
async def process_cbt(req: CBTReframeRequest):
    """Evaluates a 3-step CBT thought reframing worksheet and generates warm validation."""
    analysis = await generate_cbt_feedback(
        automatic_thought=req.automatic_thought,
        evidence_against=req.evidence_against,
        balanced_thought=req.balanced_thought
    )
    return {"analysis": analysis, "status": "success"}


@app.get("/daily-affirmation/{user_id}")
async def get_daily_affirmation_route(user_id: str):
    """Generates a personalized, context-aware daily affirmation based on user history and stressors."""
    moods = user_mood_logs.get(user_id, [])
    prefs = user_preferences_store.get(user_id, {})
    affirmation_text = await generate_daily_affirmation(moods, prefs)

    return {
        "user_id": user_id,
        "affirmation": affirmation_text,
        "context_applied": bool(moods or prefs),
        "generated_at": datetime.utcnow().isoformat()
    }


@app.get("/dashboard/{user_id}")
def get_dashboard(user_id: str):
    """Retrieves analytics summary including mood history, streaks, and soft pattern insights."""
    moods = user_mood_logs.get(user_id, [])
    sessions = user_sessions.get(user_id, [])
    
    # Calculate streak based on distinct active dates
    dates = set(m["timestamp"][:10] for m in moods if "timestamp" in m)
    streak = len(dates)

    insight = "You've taken time for self-care. Regular check-ins build emotional resilience."
    if len(moods) >= 3:
        avg_mood = sum(m["score"] for m in moods[-3:]) / 3
        if avg_mood <= 4:
            insight = "Notice: You've experienced some heavy moments recently. Remember to take gentle breathing breaks."
        elif avg_mood >= 7:
            insight = "Pattern Insight: Your mood trend shows positive grounding! Keep nourishing what brings you peace."

    return {
        "user_id": user_id,
        "mood_logs": moods[-14:],
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
    """Returns past reflection sessions with preview and summary cards."""
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
    """Health check endpoint confirming API status and version."""
    return {"status": "ok", "version": APP_VERSION}


@app.post("/auth/google")
async def google_auth(req: GoogleAuthRequest):
    """Verifies a Google OAuth ID token and returns user profile information."""
    if not _google_auth_available:
        raise HTTPException(status_code=503, detail="Google auth library not available on server.")
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="GOOGLE_CLIENT_ID not configured on server.")

    try:
        idinfo = google_id_token.verify_oauth2_token(
            req.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        return {
            "status": "success",
            "user": {
                "id": idinfo.get("sub"),
                "email": idinfo.get("email"),
                "name": idinfo.get("name", idinfo.get("given_name", "User")),
                "picture": idinfo.get("picture"),
                "email_verified": idinfo.get("email_verified", False),
            }
        }
    except ValueError as e:
        logger.warning(f"Google token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google ID token.")
