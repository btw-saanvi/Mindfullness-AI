"""
MindfulAI AI Service Module
Uses Groq as the primary model provider (from GROQ_API_KEY), with optional
Google Gemini fallback. Handles prompts, crisis cues, and specialized generation.
All AI calls are async to avoid blocking the FastAPI event loop.
"""

import logging
import random
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import google.generativeai as genai
from config import GOOGLE_API_KEY, GROQ_API_KEY, AI_MODEL_NAME, GROQ_MODEL_NAME

logger = logging.getLogger("mindfulai.ai_service")

# Optional Gemini fallback
if GOOGLE_API_KEY:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        logger.info("Google Generative AI configured as fallback.")
    except Exception as e:
        logger.error(f"Failed to configure Google Generative AI: {e}")

# Groq (OpenAI-compatible) async client
_groq_client = None
if GROQ_API_KEY:
    try:
        from openai import AsyncOpenAI
        _groq_client = AsyncOpenAI(
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
            timeout=15.0,
        )
        logger.info("Groq AI configured as primary provider (async).")
    except Exception as e:
        logger.error(f"Failed to configure Groq client: {e}")
else:
    logger.warning("GROQ_API_KEY is not configured.")

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


async def _call_groq(prompt: str) -> Optional[str]:
    if not _groq_client:
        return None
    try:
        completion = await _groq_client.chat.completions.create(
            model=GROQ_MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are MindfulAI, an empathetic mental wellness reflection companion. "
                        "You are not a therapist. Be warm, concise, and grounded."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=600,
        )
        text = completion.choices[0].message.content if completion.choices else None
        return text.strip() if text else None
    except Exception as e:
        error_str = str(e)
        logger.error(f"Groq API error: {type(e).__name__}: {e}")
        if "429" in error_str or "rate" in error_str.lower():
            raise HTTPException(
                status_code=429,
                detail="The AI service is temporarily busy due to high demand. Please wait a moment and try again."
            )
        if "401" in error_str or "403" in error_str or "authentication" in error_str.lower():
            raise HTTPException(
                status_code=503,
                detail="AI service configuration issue. Please verify backend credentials."
            )
        return None


async def _call_gemini(prompt: str) -> Optional[str]:
    if not GOOGLE_API_KEY:
        return None
    try:
        model = genai.GenerativeModel(AI_MODEL_NAME)
        response = await model.generate_content_async(prompt)
        if response is None or not getattr(response, "text", None):
            return None
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini fallback error: {type(e).__name__}: {e}")
        return None


async def call_ai(prompt: str, fallback: str) -> str:
    """
    Primary: Groq. Fallback: Gemini. Final: static fallback string.
    Never leaks API keys or internal stack traces to the caller.
    """
    if not GROQ_API_KEY and not GOOGLE_API_KEY:
        logger.warning("No AI API keys configured — returning fallback response.")
        return fallback

    # Prefer Groq
    if GROQ_API_KEY:
        try:
            text = await _call_groq(prompt)
            if text:
                return text
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected Groq failure: {e}")

    # Gemini fallback
    text = await _call_gemini(prompt)
    if text:
        return text

    return fallback


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
        f"Behavioral instructions: Respond positively and kindly. Be honest and authentic. Gently incorporate relevant psychological concepts or terms where helpful to foster self-awareness.\n"
        f"Safety rules: Never diagnose illness or prescribe clinical treatments. Speak conversationally in 2-4 sentences.{pref_text}{history_text}\n\n"
        f"User says: {message}{journal_note}\n\n"
        f"MindfulAI:"
    )


async def generate_daily_affirmation(moods: List[Dict[str, Any]], prefs: Dict[str, Any]) -> str:
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
    res = await call_ai(prompt, fallback=random.choice(fallbacks))
    return res.strip().strip('"').strip("'")


async def generate_session_summary(user_msgs: List[str]) -> str:
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
    return await call_ai(prompt, fallback=default_summary)


async def generate_cbt_feedback(automatic_thought: str, evidence_against: str, balanced_thought: str) -> str:
    """Generates warm, validating feedback for a completed CBT thought reframing worksheet."""
    prompt = (
        f"Act as a CBT reflection companion. The user filled out a reframing worksheet:\n"
        f"- Automatic Thought: {automatic_thought}\n"
        f"- Evidence Against: {evidence_against}\n"
        f"- Balanced Thought: {balanced_thought}\n\n"
        f"Provide 2-3 sentences of warm validation praising their effort to reframe and affirming their balanced thought."
    )
    return await call_ai(
        prompt,
        fallback="Great work reframing! You identified the evidence against your automatic thought and established a balanced perspective."
    )
