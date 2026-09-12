import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_chat_empty_message():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/chat", json={"user_id": "test_user", "message": "   "})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_session_start_invalid_mood():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/session/start", json={"user_id": "test", "need": "vent", "mood_score": 11})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_chat_crisis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/chat", json={"user_id": "test_user", "message": "I want to die"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_crisis"] == True
    assert "988" in data["reply"]
