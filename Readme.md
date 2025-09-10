# MindfulAI: What-If Simulator

MindfulAI is a compassionate AI-powered therapy simulator that provides users with a safe, judgment-free space to talk, reflect, and grow. Built with FastAPI (backend) and React (frontend), MindfulAI offers personalized mental health support using evidence-based therapeutic approaches, including CBT, mindfulness, motivational interviewing, and more.

---

## Features

- **AI Therapist:** Empathetic, human-like responses tailored to user preferences and mood.
- **Therapy Styles:** Choose from Calm, Motivational, CBT, or Mindfulness approaches.
- **Gen Z Mode:** Fun, relatable slang for younger users.
- **Journaling Mode:** Encourages self-reflection and growth.
- **Session History:** Track your progress and revisit past conversations.
- **24/7 Availability:** Always ready to listen, anytime, anywhere.
- **Private & Secure:** No data is shared; all conversations are confidential.

---

## Tech Stack

- **Frontend:** React, Vite, Lucide Icons
- **Backend:** FastAPI, Google Generative AI, Python-dotenv
- **Authentication:** Google OAuth (ID tokens)
- **Styling:** CSS Modules / Custom CSS

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+
- [Google Generative AI API Key](https://ai.google.dev/)

### Backend Setup

1. **Install dependencies:**
   ```sh
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   - Create a `.env` file in `backend/`:
     ```
     GOOGLE_API_KEY=your_google_api_key_here
     ```

3. **Run FastAPI server:**
   ```sh
   uvicorn main:app --reload
   ```

### Frontend Setup

1. **Install dependencies:**
   ```sh
   cd frontend/client
   npm install
   ```

2. **Start the frontend:**
   ```sh
   npm run dev
   ```

3. **Open your browser:**  
   Visit [http://localhost:5173](http://localhost:5173)

---

## Usage

- **Start Talking:** Click "Start Talking" to begin a session with the AI therapist.
- **Sign In:** Use Google authentication for personalized session history.
- **Choose Style:** Select your preferred therapy approach and start chatting.
- **Track Progress:** View your session history and monitor your growth.

---

## Project Structure

```
backend/
  main.py
  requirements.txt
  .env
frontend/
  client/
    src/
      components/
        LandingPage.jsx
      utils/
        auth.js
    package.json
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is for educational and demonstration purposes only.

---

## Disclaimer

MindfulAI is **not a substitute for professional mental health care**. If you are in crisis or need immediate help, please contact a mental health professional or a crisis hotline