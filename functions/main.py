"""
Brisbane Handewa Cricket Hub — Firebase Cloud Functions (Python)
REST API endpoints served as HTTP Cloud Functions v2
"""

from firebase_functions import https_fn, options
from firebase_admin import initialize_app, firestore
import json
from datetime import datetime, timezone

# Initialize Firebase Admin
initialize_app()

# CORS options — allow Firebase Hosting domain
cors = options.CorsOptions(
    cors_origins=[
        "https://brisbane-handewa-cricket-hub.web.app",
        "https://brisbane-handewa-cricket-hub.firebaseapp.com",
        "http://localhost:9000",
        "http://localhost:3000",
        "*",
    ],
    cors_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)


# ── GET /api/health ────────────────────────────────────────────────
@https_fn.on_request(cors=cors, region="us-central1")
def health(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response(
        json.dumps({
            "app": "Brisbane Handewa Cricket Hub API",
            "version": "2.0.0",
            "status": "live",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }),
        content_type="application/json",
    )


# ── GET /api/matches ───────────────────────────────────────────────
@https_fn.on_request(cors=cors, region="us-central1")
def get_matches(req: https_fn.Request) -> https_fn.Response:
    try:
        db = firestore.client()
        matches_ref = db.collection("matches")
        docs = matches_ref.order_by("date", direction=firestore.Query.DESCENDING).limit(20).stream()
        matches = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            matches.append(d)
        return https_fn.Response(
            json.dumps({"matches": matches}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            content_type="application/json",
        )


# ── GET /api/players ───────────────────────────────────────────────
@https_fn.on_request(cors=cors, region="us-central1")
def get_players(req: https_fn.Request) -> https_fn.Response:
    try:
        db = firestore.client()
        players_ref = db.collection("players")
        docs = players_ref.stream()
        players = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            players.append(d)
        return https_fn.Response(
            json.dumps({"players": players}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            content_type="application/json",
        )


# ── GET /api/teams ─────────────────────────────────────────────────
@https_fn.on_request(cors=cors, region="us-central1")
def get_teams(req: https_fn.Request) -> https_fn.Response:
    try:
        db = firestore.client()
        teams_ref = db.collection("teams")
        docs = teams_ref.stream()
        teams = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            teams.append(d)
        return https_fn.Response(
            json.dumps({"teams": teams}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            content_type="application/json",
        )


# ── POST /api/delivery ─────────────────────────────────────────────
@https_fn.on_request(cors=cors, region="us-central1")
def register_delivery(req: https_fn.Request) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405)
    try:
        data = req.get_json()
        match_id = data.get("match_id")
        runs = int(data.get("runs", 0))
        extras = int(data.get("extras", 0))
        extra_type = data.get("extra_type")
        wicket = bool(data.get("wicket", False))
        comment = data.get("comment", "")

        db = firestore.client()
        match_ref = db.collection("matches").document(str(match_id))
        match_doc = match_ref.get()
        if not match_doc.exists:
            return https_fn.Response(
                json.dumps({"error": "Match not found"}),
                status=404,
                content_type="application/json",
            )

        # Determine ball label
        if wicket:
            ball_label = "W"
        elif extra_type == "wide":
            ball_label = "Wd"
        elif extra_type == "noball":
            ball_label = "NB"
        elif extra_type in ("bye", "legbye"):
            ball_label = f"B{extras}" if extras else "B"
        else:
            ball_label = str(runs)

        # Log delivery to Firestore subcollection
        delivery_ref = match_ref.collection("deliveries").document()
        delivery_ref.set({
            "ball": ball_label,
            "runs": runs,
            "extras": extras,
            "extraType": extra_type,
            "wicket": wicket,
            "comment": comment,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        return https_fn.Response(
            json.dumps({"success": True, "ball": ball_label}),
            content_type="application/json",
        )
    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            content_type="application/json",
        )
