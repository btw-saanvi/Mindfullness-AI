"""
MindfulAI Backend Configuration Module
Centralizes application settings, environment variables, and security constants.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# AI Service Configuration
AI_MODEL_NAME = "gemini-1.5-flash"
MAX_MESSAGE_LENGTH = 5000

# Application Metadata
APP_TITLE = "MindfulAI API"
APP_VERSION = "2.0.0"

# Allowed CORS Origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mindfullness-ai.netlify.app",
]
