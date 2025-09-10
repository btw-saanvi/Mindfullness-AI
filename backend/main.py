from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from datetime import datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = FastAPI()

# ✅ Allowed origins (local + deployed frontend)
origins = [
    "http://localhost:5173",                  # local Vite frontend
    "http://localhost:3000",                  # local CRA frontend
    "https://mindfullness-ai.netlify.app",    # deployed frontend (Netlify)
]

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # you can restrict to ["GET", "POST"] if needed
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Conversation memory (temporary, per-session)
conversation_history: Dict[str, List[str]] = {}

# Session log storage (in-memory)
user_sessions: Dict[str, List[Dict[str, Any]]] = {}

class ChatRequest(BaseModel):
    user_id: str
    message: str
    gender: str = "female"   # "male" or "female"
    persona: str = "calm"    # calm | motivational | cbt | mindfulness
    genz: bool = False       # toggle Gen Z mode
    journaling: bool = False # toggle journaling mode

# Slang dictionary (Gen Z mode, reduced emojis)
slang_dict = {
    "hello": "yo fam",
    "sad": "lowkey down bad",
    "happy": "vibin’",
    "good": "goated fr",
    "anxious": "anxious af",
    "alone": "solo dolo",
    "talk": "spill the tea",
    "strong": "built different",
}

def to_genz_mode(text: str) -> str:
    words = text.split()
    converted = [slang_dict.get(word.lower(), word) for word in words]
    return " ".join(converted)

def detect_crisis(message: str) -> bool:
    crisis_keywords = ["suicide", "kill myself", "end it", "self harm", "die", "worthless"]
    return any(word in message.lower() for word in crisis_keywords)

def generate_reply(user_id: str, message: str, gender: str, persona: str, journaling: bool) -> str:
    # Crisis detection first
    if detect_crisis(message):
        return (
            "I hear your pain, and it’s important to know you’re not alone. "
            "If you are thinking of harming yourself, please reach out to a trusted person or professional immediately. "
            "If you're in India, you can call AASRA at +91-9820466726. "
            "If elsewhere, please find your local crisis hotline. You matter, and your life is valuable."
        )

    # Therapist role base
    therapist_role = (
        "You are a compassionate AI therapist who gives supportive, calming, and empathetic replies. "
        "Keep answers short, conversational, and human-like."
    )

    # Gender tone
    if gender == "male":
        therapist_role += " Speak in a warm but direct tone, like a male therapist."
    else:
        therapist_role += " Speak in a soft and nurturing tone, like a female therapist."

    # Persona customization
    if persona == "motivational":
        therapist_role += " Your style is uplifting, encouraging, and confidence-boosting."
    elif persona == "cbt":
        therapist_role += " Use a CBT (Cognitive Behavioral Therapy) approach: help reframe negative thoughts."
    elif persona == "mindfulness":
        therapist_role += " Use mindfulness techniques: grounding, breathing, and awareness exercises."
    else:
        therapist_role += " Stay calm, gentle, and reassuring."

    # Journaling mode
    if journaling:
        therapist_role += " Encourage self-reflection. Offer affirmations and journaling prompts."

    # Use conversation history
    history = "\n".join(conversation_history.get(user_id, []))
    prompt = f"{therapist_role}\nConversation so far:\n{history}\nUser: {message}\nTherapist:"

    # If API key missing
    if not GOOGLE_API_KEY:
        return "I’m here to listen. Please share what’s on your mind."

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        reply = response.text.strip() if getattr(response, "text", None) else "I'm here for you."
    except Exception:
        reply = "I might be having trouble responding right now, but I’m here with you."

    # Save conversation (short-term memory, last 10 messages)
    conversation_history.setdefault(user_id, []).append(f"User: {message}")
    conversation_history[user_id].append(f"Therapist: {reply}")
    conversation_history[user_id] = conversation_history[user_id][-10:]

    # Persist to session log
    now_iso = datetime.utcnow().isoformat()
    sessions = user_sessions.setdefault(user_id, [])
    if not sessions:
        sessions.append({
            "id": f"{user_id}-{int(datetime.utcnow().timestamp())}",
            "started_at": now_iso,
            "last_updated": now_iso,
            "style": persona,
            "messages": [],
        })
    current_session = sessions[-1]
    current_session["style"] = persona
    current_session["messages"].append({"sender": "user", "text": message, "timestamp": now_iso})
    current_session["messages"].append({"sender": "ai", "text": reply, "timestamp": now_iso})
    current_session["last_updated"] = now_iso

    return reply

@app.post("/chat")
def chat(request: ChatRequest, authorization: Optional[str] = Header(default="")):
    if authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            info = id_token.verify_oauth2_token(token, google_requests.Request())
            request.user_id = info.get("sub", request.user_id)
        except Exception:
            pass
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=503, detail="Server not configured with GOOGLE_API_KEY")

    reply = generate_reply(
        request.user_id,
        request.message,
        request.gender,
        request.persona,
        request.journaling
    )

    if request.genz:
        reply = to_genz_mode(reply)

    return {"reply": reply}

@app.get("/history/{user_id}")
def get_history(user_id: str, authorization: Optional[str] = Header(default="")):
    if authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            info = id_token.verify_oauth2_token(token, google_requests.Request())
            user_id = info.get("sub", user_id)
        except Exception:
            pass
    sessions = user_sessions.get(user_id, [])
    summaries = []
    for s in sessions:
        summaries.append({
            "id": s["id"],
            "started_at": s.get("started_at"),
            "last_updated": s.get("last_updated"),
            "style": s.get("style"),
            "messages_count": len(s.get("messages", [])),
            "preview": next((m["text"] for m in s.get("messages", []) if m.get("sender") == "ai"), ""),
        })
    return {"sessions": summaries}

@app.get("/auth/me")
def auth_me(authorization: Optional[str] = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        info = id_token.verify_oauth2_token(token, google_requests.Request())
        return {"user_id": info.get("sub"), "email": info.get("email"), "name": info.get("name")}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
