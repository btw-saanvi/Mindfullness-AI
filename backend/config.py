"""
MindfulAI Backend Configuration Module
Centralizes application settings, environment variables, and security constants.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys (prefer Groq when present; Gemini as optional fallback)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# AI Service Configuration
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "llama-3.1-8b-instant")
AI_MODEL_NAME = os.getenv("AI_MODEL_NAME", "gemini-1.5-flash")
MAX_MESSAGE_LENGTH = 5000

# Application Metadata
APP_TITLE = "MindfulAI API"
APP_VERSION = "2.2.0"

# Allowed CORS Origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mindfullness-ai.netlify.app",
]
