import hashlib
import random
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory OTP store: { email: { otp, expires, signup_data } }
_otp_store = {}


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "LEADER"
    department: str = ""


class OTPVerifyRequest(BaseModel):
    email: str
    otp: str


class LoginRequest(BaseModel):
    email: str
    password: str


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    """Step 1: Validate info and send OTP."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        return {"success": False, "error": "Email already registered"}

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    _otp_store[req.email] = {
        "otp": otp,
        "expires": time.time() + 300,  # 5 min expiry
        "signup_data": {
            "name": req.name,
            "email": req.email,
            "password": req.password,
            "role": req.role,
            "department": req.department,
        },
    }

    # In production: send via email/SMS service
    # For demo: OTP is returned in response (and printed to console)
    print(f"[OTP] Verification code for {req.email}: {otp}")

    return {
        "success": True,
        "otp_sent": True,
        "message": "OTP sent to your email",
        "demo_otp": otp,  # Remove in production
    }


@router.post("/verify-otp")
def verify_otp(req: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Step 2: Verify OTP and create account."""
    stored = _otp_store.get(req.email)

    if not stored:
        return {"success": False, "error": "No OTP requested for this email. Please sign up again."}

    if time.time() > stored["expires"]:
        del _otp_store[req.email]
        return {"success": False, "error": "OTP has expired. Please sign up again."}

    if stored["otp"] != req.otp:
        return {"success": False, "error": "Invalid OTP. Please try again."}

    # OTP verified — create the user
    data = stored["signup_data"]
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=_hash_password(data["password"]),
        role=data["role"],
        department=data["department"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Clean up OTP
    del _otp_store[req.email]
    print(f"[AUTH] User {data['email']} registered successfully")

    return {
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
        },
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"success": False, "error": "Invalid email or password"}

    if user.password_hash != _hash_password(req.password):
        return {"success": False, "error": "Invalid email or password"}

    if not user.is_active:
        return {"success": False, "error": "Account is deactivated"}

    return {
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
        },
    }
