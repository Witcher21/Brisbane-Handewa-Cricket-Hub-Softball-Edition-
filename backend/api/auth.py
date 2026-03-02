"""
api/auth.py
───────────
POST /auth/login   → returns JWT
GET  /auth/me      → returns current user (token required)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

from core.security import verify_password, create_access_token, decode_access_token
from core.database import get_user_by_username, get_user_by_id, User, create_user

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Pydantic response schema ──────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserSignup(BaseModel):
    username: str
    password: str

@router.post("/signup", response_model=TokenResponse)
async def signup(form_data: UserSignup):
    """
    Creates a new user and logs them in automatically.
    """
    user = get_user_by_username(form_data.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    new_user = create_user(form_data.username, form_data.password)
    
    # Auto login
    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=new_user.to_dict(),
    )

# ── OAuth2 scheme — looks for "Authorization: Bearer <token>" ─────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── FastAPI dependency: get the currently authenticated user ──────
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Decode the Bearer JWT and return the active User.
    Raises HTTP 401 on any failure (missing / expired / invalid token).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    # "sub" stores the user id as a string
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = get_user_by_id(int(user_id))
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_role(*roles: str):
    """
    Dependency factory — requires the user to have one of the given roles.

    Usage:
        @router.get("/admin-only")
        def admin_page(user=Depends(require_role("admin"))):
            ...
    """
    def _dep(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not permitted here.",
            )
        return current_user
    return _dep


# ── POST /auth/login ──────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticates username + password and returns a signed JWT.

    Body (form-encoded):
        username  = your username
        password  = your password
    """
    user = get_user_by_username(form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user.to_dict(),
    )


# ── GET /auth/me ──────────────────────────────────────────────────
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile."""
    return current_user.to_dict()
