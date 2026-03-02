from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio
from datetime import datetime

# ── Auth & protected routes ───────────────────────────────────────
from api.auth import router as auth_router
from api.user_data import router as user_data_router

app = FastAPI(
    title="Brisbane Handewa Cricket Hub API",
    description="Real-time ball-by-ball cricket scoring API + JWT Auth",
    version="2.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:9000",
        "http://localhost:9001",
        "http://localhost:3000",
        # Firebase Hosting domains
        "https://brisbane-handewa-cricket-hub.web.app",
        "https://brisbane-handewa-cricket-hub.firebaseapp.com",
        # Allow all in dev (remove in strict production)
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(user_data_router)


# ── WebSocket Connection Manager ──────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS] Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"[WS] Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.active_connections.remove(conn)

manager = ConnectionManager()

# ── In-Memory Data Store ──────────────────────────────────────────
live_match_state = {
    "match_id": 1,
    "team_a": "Brisbane Handewa",
    "team_b": "Colombo Kings",
    "innings": [{
        "batting_team": "Brisbane Handewa",
        "runs": 142,
        "wickets": 4,
        "overs": 16.3,
    }],
    "current_batsmen": [
        {"name": "Nawod Sanjana", "runs": 58, "balls": 42, "fours": 6, "sixes": 2},
        {"name": "Dinesh Fernando", "runs": 31, "balls": 22, "fours": 3, "sixes": 1},
    ],
    "current_bowler": {
        "name": "Asanka Bandara", "overs": 3, "maidens": 0, "runs": 28, "wickets": 1
    },
    "recent_balls": ["1", "4", "W", "0", "6", "2"],
    "status": "live",
    "events": []
}

# ── Pydantic Models ───────────────────────────────────────────────
class DeliveryInput(BaseModel):
    match_id: int
    runs: int = 0
    extras: int = 0
    extra_type: Optional[str] = None  # "wide", "noball", "bye"
    wicket: bool = False
    comment: Optional[str] = ""
    bowler_name: Optional[str] = None
    batsman_name: Optional[str] = None

class PlayerCreate(BaseModel):
    name: str
    role: str
    team: str
    age: int
    batting_style: str
    bowling_style: str

# ── REST ENDPOINTS ────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "app": "Brisbane Handewa Cricket Hub",
        "edition": "Softball",
        "version": "1.0.0",
        "status": "live",
        "endpoints": [
            "/api/matches",
            "/api/matches/{match_id}",
            "/api/matches/{match_id}/live",
            "/api/delivery",
            "/api/players",
            "/api/teams",
            "/ws/live/{match_id}",
        ]
    }

@app.get("/api/matches")
def get_matches():
    return {
        "matches": [
            {
                "id": 1,
                "team_a": "Brisbane Handewa",
                "team_b": "Colombo Kings",
                "date": "2026-03-01",
                "status": "live",
                "venue": "Handewa Ground, Brisbane"
            },
            {
                "id": 2,
                "team_a": "Kandy Warriors",
                "team_b": "Brisbane Handewa",
                "date": "2026-02-22",
                "status": "completed",
                "result": "Brisbane Handewa won by 28 runs"
            },
            {
                "id": 3,
                "team_a": "Brisbane Handewa",
                "team_b": "Kandy Warriors",
                "date": "2026-03-08",
                "status": "upcoming"
            }
        ]
    }

@app.get("/api/matches/{match_id}/live")
def get_live_state(match_id: int):
    if match_id != live_match_state["match_id"]:
        raise HTTPException(status_code=404, detail="Match not found")
    return live_match_state

@app.post("/api/delivery")
async def register_delivery(delivery: DeliveryInput):
    """Register a ball-by-ball delivery and broadcast to all WebSocket clients."""
    state = live_match_state

    if delivery.match_id != state["match_id"]:
        raise HTTPException(status_code=404, detail="Match not found")

    innings = state["innings"][0]

    # Update score
    innings["runs"] += delivery.runs + delivery.extras
    if delivery.wicket:
        innings["wickets"] += 1

    # Ball label
    if delivery.wicket:
        ball_label = "W"
    elif delivery.extra_type == "wide":
        ball_label = "Wd"
    elif delivery.extra_type == "noball":
        ball_label = "Nb"
    elif delivery.extra_type == "bye":
        ball_label = "B"
    else:
        ball_label = str(delivery.runs)

    # Recent balls (keep last 12)
    state["recent_balls"].insert(0, ball_label)
    if len(state["recent_balls"]) > 12:
        state["recent_balls"].pop()

    # Update current batsman
    if state["current_batsmen"] and not delivery.extra_type:
        batsman = state["current_batsmen"][0]
        batsman["runs"] += delivery.runs
        batsman["balls"] += 1
        if delivery.runs == 4: batsman["fours"] += 1
        if delivery.runs == 6: batsman["sixes"] += 1

    if delivery.wicket and state["current_batsmen"]:
        state["current_batsmen"].pop(0)

    # Update bowler
    if state["current_bowler"]:
        state["current_bowler"]["runs"] += delivery.runs + delivery.extras
        if delivery.wicket:
            state["current_bowler"]["wickets"] += 1

    # Log event
    event = {
        "timestamp": datetime.now().isoformat(),
        "ball": ball_label,
        "runs": delivery.runs,
        "wicket": delivery.wicket,
        "comment": delivery.comment,
        "score": f"{innings['runs']}/{innings['wickets']}",
    }
    state["events"].insert(0, event)
    if len(state["events"]) > 50:
        state["events"].pop()

    # Broadcast via WebSocket
    await manager.broadcast({
        "type": "delivery",
        "data": {
            "ball": ball_label,
            "score": f"{innings['runs']}/{innings['wickets']}",
            "runs": delivery.runs,
            "wicket": delivery.wicket,
            "comment": delivery.comment,
            "state": state,
        }
    })

    return {"success": True, "ball": ball_label, "score": f"{innings['runs']}/{innings['wickets']}"}

@app.get("/api/players")
def get_players():
    return {
        "players": [
            {"id": 1, "name": "Nawod Sanjana", "role": "Batsman", "team": "Brisbane Handewa", "runs": 1840, "wickets": 12},
            {"id": 2, "name": "Kamal Perera", "role": "Bowler", "team": "Brisbane Handewa", "runs": 210, "wickets": 67},
            {"id": 3, "name": "Dinesh Fernando", "role": "All-rounder", "team": "Brisbane Handewa", "runs": 920, "wickets": 45},
            {"id": 4, "name": "Ruwan Jayasinghe", "role": "Batsman", "team": "Brisbane Handewa", "runs": 2100, "wickets": 8},
        ]
    }

@app.get("/api/teams")
def get_teams():
    return {
        "teams": [
            {"id": 1, "name": "Brisbane Handewa", "short_name": "BHW", "wins": 31, "points": 64, "nrr": "+1.24"},
            {"id": 2, "name": "Colombo Kings",    "short_name": "CLK", "wins": 24, "points": 50, "nrr": "+0.67"},
            {"id": 3, "name": "Kandy Warriors",   "short_name": "KWR", "wins": 18, "points": 38, "nrr": "-0.12"},
        ]
    }

# ── WebSocket ──────────────────────────────────────────────────────
@app.websocket("/ws/live/{match_id}")
async def websocket_live(websocket: WebSocket, match_id: int):
    await manager.connect(websocket)
    # Send initial state on connect
    await websocket.send_text(json.dumps({
        "type": "init",
        "data": live_match_state
    }))
    try:
        while True:
            # Keep connection alive, listen for ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ── Run ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
