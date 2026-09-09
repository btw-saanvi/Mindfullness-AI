"""
MindfulAI AI Service Module
Decoupled service handling Google Generative AI integration, prompt engineering,
safety boundary enforcement, crisis intervention cues, and specialized generation.
"""

import logging
import random
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import google.generativeai as genai
from config import GOOGLE_API_KEY, AI_MODEL_NAME

logger = logging.getLogger("mindfulai.ai_service")

# Initialize Generative AI SDK if API key is present
if GOOGLE_API_KEY:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        logger.info("Google Generative AI configured successfully.")
    except Exception as e:
        logger.error(f"Failed to configure Google Generative AI: {e}")
else:
    logger.warning("GOOGLE_API_KEY is not configured. Service will operate in offline/fallback mode.")

# --- Crisis Detection Cues & Safety Directives ---
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", 
    "self harm", "cutting myself", "overdose", "no reason to live", "end it all"
]

CRISIS_RESPONSE = {
    "is_crisis": True,
    "reply": (
        "I hear how deeply painful things are right now. Because I am an AI companion and not a human crisis counselor, "
        "I want to make sure you get immediate, compassionate human support.\n\n"
        "Please connect with trained people who care and want to help you through this:\n"
        "• 988 Suicide & Crisis Lifeline: Call or Text 988 (US & Canada, Free, 24/7)\n"
        "• Crisis Text Line: Text HOME to 741741\n"
        "• AASRA India Helpline: +91-9820466726\n"
        "• International Lifelines: https://findahelpline.com/\n\n"
        "You do not have to carry this alone. Please reach out to one of these resources right now."
    )
}

def detect_crisis(message: str) -> bool:
    """Evaluates message against crisis intervention triggers."""
    if not message:
        return False
    msg_lower = message.lower()
    return any(keyword in msg_lower for keyword in CRISIS_KEYWORDS)


# --- Core AI Request Wrapper ---
def call_ai(prompt: str, fallback: str) -> str:
    """
    Executes a prompt against Google Generative AI with resilient error handling.
    Differentiates between rate limits, permission faults, and network timeouts.
    Never leaks API keys or internal stack traces to the caller.
    """
    if not GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not configured — returning fallback response.")
        return fallback

    try:
        model = genai.GenerativeModel(AI_MODEL_NAME)
        response = model.generate_content(prompt)

        if response is None:
            logger.warning("AI model returned None response.")
            return fallback

        if not getattr(response, "text", None):
            if hasattr(response, "prompt_feedback") and response.prompt_feedback:
                logger.warning(f"AI response blocked by safety filters: {response.prompt_feedback}")
            else:
                logger.warning("AI returned empty text response.")
            return fallback

        return response.text.strip()

    except Exception as e:
        error_type = type(e).__name__

        # 429: Rate Limit / Quota Exceeded
        if "ResourceExhausted" in error_type or "429" in str(e):
            logger.error(f"AI API rate limit exceeded: {error_type}")
            raise HTTPException(
                status_code=429,
                detail="The AI service is temporarily busy due to high demand. Please wait a moment and try again."
            )

        # 403: Permission / Authentication
        if "PermissionDenied" in error_type or "403" in str(e):
            logger.error(f"AI API permission denied: {error_type}")
            raise HTTPException(
                status_code=503,
                detail="AI service configuration issue. Please verify backend credentials."
            )

        # 400: Invalid Request
        if "InvalidArgument" in error_type or "400" in str(e):
            logger.error(f"AI API invalid argument: {error_type}")
            return fallback

        # 503: Network / Timeout
        if any(term in error_type for term in ["Timeout", "ConnectionError", "NetworkError"]):
            logger.error(f"AI API network error: {error_type}")
            raise HTTPException(
                status_code=503,
                detail="Unable to connect to the AI service. Please check your internet connection."
            )

        # Generic Fallback
        logger.error(f"Unexpected AI error ({error_type}): {e}")
        return fallback


# --- Persona & Prompt Builders ---
def build_companion_prompt(
    user_id: str,
    message: str,
    gender: str = "female",
    persona: str = "calm",
    vibe: str = "chill",
    journaling: bool = False,
    conversation_history: Optional[List[str]] = None,
    user_preferences: Optional[Dict[str, Any]] = None
) -> str:
    """Builds a contextual prompt incorporating persona, tone vibe, and past dialogue."""
    gender_tone = "gentle, compassionate, warm" if gender == "female" else "steady, supportive, grounded"

    persona_instructions = {
        "calm": "Focus on presence, emotional soothing, gentle pacing, and accepting how the user feels without rushing to fix.",
        "motivational": "Focus on resilience, encouraging progress, empowering self-belief, and recognizing inner strengths.",
        "cbt": "Gently help the user notice thought patterns, examine cognitive distortions, and consider balanced alternative perspectives.",
        "mindfulness": "Encourage sensory awareness, breath anchoring, observing feelings as passing clouds, and staying in the present moment."
    }.get(persona, "Provide warm, compassionate listening and thoughtful reflection.")

    vibe_instructions = {
        "chill": "Use relaxed, modern language. Be calm, low-pressure, and conversational.",
        "grounded": "Use steady, rooted, wise, and centering language. Focus on physical and emotional anchoring.",
        "hype": "Be encouraging, uplifting, energizing, and enthusiastic about their resilience and steps forward."
    }.get(vibe, "Keep the tone calm, thoughtful, and natural.")

    history_text = ""
    if conversation_history:
        history_text = "\nRecent Conversation:\n" + "\n".join(conversation_history[-6:])

    pref_text = ""
    if user_preferences:
        goal = user_preferences.get("primary_goal")
        stressor = user_preferences.get("biggest_stressor")
        if goal or stressor:
            pref_text = f"\nUser Background: Goal: {goal or 'General well-being'} | Main Stressor: {stressor or 'Daily pressure'}"

    journal_note = "\nOffer a brief, reflective journal prompt at the end of your response." if journaling else ""

    return (
        f"You are MindfulAI, an empathetic reflection companion (not a therapist or licensed doctor).\n"
        f"Tone style: {gender_tone}.\n"
        f"Persona focus: {persona_instructions}\n"
        f"Vibe style: {vibe_instructions}\n"
        f"Safety rules: Never diagnose illness or prescribe clinical treatments. Speak conversationally in 2-4 sentences.{pref_text}{history_text}\n\n"
        f"User says: {message}{journal_note}\n\n"
        f"MindfulAI:"
    )


# --- Specialized Generation Functions ---
def generate_daily_affirmation(moods: List[Dict[str, Any]], prefs: Dict[str, Any]) -> str:
    """Generates a contextual daily affirmation based on mood history and stressors."""
    last_mood = moods[-1]["score"] if moods else None
    last_need = moods[-1].get("need") if moods else None
    stressor = prefs.get("biggest_stressor")
    goal = prefs.get("primary_goal")

    context_hints = []
    if last_mood is not None:
        if last_mood <= 4:
            context_hints.append("The user has been feeling somewhat heavy, overwhelmed, or tired.")
        elif last_mood >= 7:
            context_hints.append("The user is feeling grounded, peaceful, or positive.")
        else:
            context_hints.append("The user is feeling balanced and seeking mindful consistency.")

    if last_need:
        context_hints.append(f"Their recent focus was on {last_need}.")
    if stressor:
        context_hints.append(f"Their main source of tension is {stressor}.")
    if goal:
        context_hints.append(f"Their aspiration is {goal}.")

    context_str = " ".join(context_hints) if context_hints else "The user is taking a gentle moment for daily self-care."

    prompt = (
        f"You are a mindful reflection companion. Generate a single, grounded daily affirmation (1-2 sentences, max 25 words).\n"
        f"Context: {context_str}\n"
        f"Tone: Compassionate, calming, realistic, and non-toxic. Avoid hollow clichés like 'You can do anything!'\n"
        f"Affirmation:"
    )

    fallbacks = [
        "You do not have to carry everything all at once. Taking this moment to breathe is more than enough.",
        "Your worth is not defined by productivity. You are allowed to move gently through today.",
        "Notice what is present right now, without judgment. Give yourself space to simply be.",
        "Small steps taken with awareness build enduring peace. Trust the pace of your journey."
    ]
    res = call_ai(prompt, fallback=random.choice(fallbacks))
    return res.strip().strip('"').strip("'")


def generate_session_summary(user_msgs: List[str]) -> str:
    """Summarizes user session messages into key reflection and actionable takeaway."""
    default_summary = "Session focused on emotional reflection and mindful awareness. Takeaway: Practice gentle self-compassion today."
    if not user_msgs:
        return "Session focused on processing thoughts. Takeaway: Remember to check in with yourself gently."

    context_text = " ".join(user_msgs[-5:])
    prompt = (
        f"Summarize this reflection session in 2 short bullet sentences.\n"
        f"1. Core topic discussed\n"
        f"2. One actionable, compassionate takeaway for the user.\n"
        f"User messages: {context_text}"
    )
    return call_ai(prompt, fallback=default_summary)


def generate_cbt_feedback(automatic_thought: str, evidence_against: str, balanced_thought: str) -> str:
    """Generates warm, validating feedback for a completed CBT thought reframing worksheet."""
    prompt = (
        f"Act as a CBT reflection companion. The user filled out a reframing worksheet:\n"
        f"- Automatic Thought: {automatic_thought}\n"
        f"- Evidence Against: {evidence_against}\n"
        f"- Balanced Thought: {balanced_thought}\n\n"
        f"Provide 2-3 sentences of warm validation praising their effort to reframe and affirming their balanced thought."
    )
    return call_ai(
        prompt,
        fallback="Great work reframing! You identified the evidence against your automatic thought and established a balanced perspective."
    )
