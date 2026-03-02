"""
api/user_data.py
────────────────
Protected routes — ONLY the authenticated user's data is returned.
All routes require a valid Bearer JWT (via get_current_user dependency).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from api.auth import get_current_user, require_role
from core.database import User

router = APIRouter(prefix="/api", tags=["protected"])

# ── Simulated per-user data store ─────────────────────────────────
# In production this would be: SELECT * FROM stats WHERE owner_id = current_user.id
_PLAYER_STATS_DB = {
    1: {  # admin
        "owner_id": 1,
        "player_name": "GN Sanjana (Admin)",
        "career": {"matches": 48, "runs": 2840, "wickets": 32, "avg": 59.2, "sr": 142.1, "economy": 6.8},
        "recent_scores": [78, 45, 112, 23, 91],
    },
    2: {  # scorer
        "owner_id": 2,
        "player_name": "Scorer Player",
        "career": {"matches": 22, "runs": 940, "wickets": 8, "avg": 42.7, "sr": 118.3, "economy": 7.2},
        "recent_scores": [34, 12, 56, 78, 21],
    },
    3: {  # viewer
        "owner_id": 3,
        "player_name": "Viewer Player",
        "career": {"matches": 5, "runs": 120, "wickets": 2, "avg": 24.0, "sr": 105.0, "economy": 8.1},
        "recent_scores": [10, 32, 8, 45, 25],
    },
}


# ── GET /api/my-stats ─────────────────────────────────────────────
@router.get("/my-stats")
async def get_my_stats(current_user: User = Depends(get_current_user)):
    """
    Returns ONLY the calling user's player stats.
    Enforces owner_id == current_user.id at the DB level.
    """
    stats = _PLAYER_STATS_DB.get(current_user.id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No stats found for your account.",
        )
    # Double-check: never leak another user's data
    assert stats["owner_id"] == current_user.id, "Owner mismatch — security violation!"
    return {
        "user": current_user.to_dict(),
        "stats": stats,
    }


# ── GET /api/my-matches ───────────────────────────────────────────
@router.get("/my-matches")
async def get_my_matches(current_user: User = Depends(get_current_user)):
    """All matches that the current user participated in."""
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "matches": [
            {
                "match_id": 101,
                "opponent": "Colombo Kings",
                "date": "2026-03-01",
                "runs": 78,
                "wickets": 2,
                "result": "Won",
            }
        ],
    }


# ── GET /api/admin/all-stats ──────────────────────────────────────
@router.get("/admin/all-stats")
async def admin_all_stats(current_user: User = Depends(require_role("admin"))):
    """
    Admin-only: returns ALL users' stats.
    Regular users receive HTTP 403 Forbidden.
    """
    return {
        "requested_by": current_user.username,
        "all_stats": list(_PLAYER_STATS_DB.values()),
    }
