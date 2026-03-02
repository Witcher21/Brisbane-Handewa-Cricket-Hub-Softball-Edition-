"""
core/database.py
────────────────
Tiny in-memory user store.
Swap this for a real SQLAlchemy / Firestore DB in production.
"""
from typing import Optional
from core.security import hash_password

# ── User model ────────────────────────────────────────────────────
class User:
    def __init__(self, id: int, username: str, email: str,
                 hashed_password: str, role: str = "viewer"):
        self.id = id
        self.username = username
        self.email = email
        self.hashed_password = hashed_password
        self.role = role            # "admin" | "scorer" | "viewer"
        self.is_active = True

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
        }


# ── Seed users (replace with real DB rows) ───────────────────────
_USERS: list[User] = [
    User(
        id=1,
        username="admin",
        email="admin@brisbanecricket.au",
        hashed_password=hash_password("Admin@2026!"),
        role="admin",
    ),
    User(
        id=2,
        username="scorer",
        email="scorer@brisbanecricket.au",
        hashed_password=hash_password("Scorer@2026!"),
        role="scorer",
    ),
    User(
        id=3,
        username="viewer",
        email="viewer@brisbanecricket.au",
        hashed_password=hash_password("Viewer@2026!"),
        role="viewer",
    ),
]


def get_user_by_username(username: str) -> Optional[User]:
    return next((u for u in _USERS if u.username == username), None)


def get_user_by_id(user_id: int) -> Optional[User]:
    return next((u for u in _USERS if u.id == user_id), None)


def get_user_by_email(email: str) -> Optional[User]:
    return next((u for u in _USERS if u.email == email), None)


def create_user(username: str, password: str) -> User:
    """Create a new user and add them to the mock DB."""
    new_id = len(_USERS) + 1
    new_user = User(
        id=new_id,
        username=username,
        email=f"{username}@brisbanecricket.au",
        hashed_password=hash_password(password),
        role="viewer"  # Default signups get viewer access
    )
    _USERS.append(new_user)
    return new_user
