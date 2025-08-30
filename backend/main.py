from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv


load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="What-If Predictor")

class Question(BaseModel):
    question: str

@app.post("/predict")
async def predict(question: Question):
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(question.question)

        return {
            "question": question.question,
            "prediction": response.text
        }
    except Exception as e:
        return {"error": str(e)}
