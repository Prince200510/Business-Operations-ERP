from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import (hash_password, verify_password, create_access_token)
from app.modules.user import User
from app.schemas.auth import (Register, Login, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest)
import urllib.request
import json
from app.core.config import settings
import random

router = APIRouter(prefix = "/api/v1/auth", tags = ["Authenication"])

@router.post("/register")
def register(request: Register, db: Session = Depends(get_db)):
    existing_user = (db.query(User).filter(User.username == request.username).first())
    
    if existing_user:
        raise HTTPException(status_code = 409, detail = "Username is already exists")
    
    existing_email = (db.query(User).filter(User.email == request.email).first())
    
    if existing_email:
        raise HTTPException(status_code = 409, detail = "Email id already registered")
    
    hashed_password = hash_password(request.password)
    user = User(
        name = request.name, 
        username = request.username,
        email = request.email,
        mobile = request.mobile,
        password_hash = hashed_password
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"message": "Registration Successful", "user_id": user.id}

@router.post("/login")
def login(request: Login, db: Session = Depends(get_db)):
    redis = get_redis()
    attempts_key = (f"login_attempts:{request.username}")
    attempts = redis.get(attempts_key)
    
    if attempts and int(attempts) >= 5:
        raise HTTPException(status_code=429, detail = "Too many login attempts. Try again later.")
    
    user = (db.query(User).filter(User.username == request.username).first())
    
    if not user:
        redis.incr(attempts_key)
        redis.expire(attempts_key, 300)
        
        raise HTTPException(status_code=401, detail = "Invaild Username")
    
    if not verify_password(request.password, user.password_hash):
        redis.incr(attempts_key)
        redis.expire(attempts_key, 300)
        
        raise HTTPException(status_code=401, detail = "Invaild password")
    
    redis.delete(attempts_key)
    
    access_token = create_access_token(data = {
        "sub": str(user.id),
        "username": user.username
    })
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email
        }
    }

@router.post("/token")
def token(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    redis = get_redis()
    attempts_key = f"login_attempts:{request.username}"
    attempts = redis.get(attempts_key)

    if attempts and int(attempts) >= 5:
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")

    user = db.query(User).filter(User.username == request.username).first()

    if not user or not verify_password(request.password, user.password_hash):
        redis.incr(attempts_key)
        redis.expire(attempts_key, 300)
        raise HTTPException(status_code=401, detail="Invalid username or password")

    redis.delete(attempts_key)
    access_token = create_access_token(data={
        "sub": str(user.id),
        "username": user.username
    })

    return {"access_token": access_token, "token_type": "bearer"}

def send_emailjs(to_email: str, username: str, otp: str):
    service_id = settings.EMAILJS_SERVICE_ID
    template_id = settings.EMAILJS_TEMPLATE_ID
    user_id = settings.EMAILJS_PUBLIC_KEY
    access_token = settings.EMAILJS_PRIVATE_KEY
    
    if not all([service_id, template_id, user_id]):
        return False, "Missing EmailJS credentials in .env"
        
    url = "https://api.emailjs.com/api/v1.0/email/send"
    data = {
        "service_id": service_id,
        "template_id": template_id,
        "user_id": user_id,
        "accessToken": access_token,
        "template_params": {
            "to_name": username,
            "to_email": to_email,
            "otp": otp
        }
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'), 
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    )
    try:
        urllib.request.urlopen(req)
        return True, ""
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"EmailJS Error: {err}")
        return False, err
    except Exception as e:
        print(f"EmailJS Exception: {e}")
        return False, str(e)

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(or_(User.username == request.username, User.email == request.username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    redis = get_redis()
    cooldown_key = f"otp_cooldown:{user.username}"
    
    if redis.exists(cooldown_key):
        ttl = redis.ttl(cooldown_key)
        raise HTTPException(status_code=429, detail=f"Please wait {ttl} seconds before requesting a new OTP")
        
    otp = str(random.randint(100000, 999999))
    redis.setex(f"pwd_reset:{user.username}", 300, otp)
    redis.setex(cooldown_key, 60, "1")
    
    success, err_msg = send_emailjs(user.email, user.username, otp)
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {err_msg}")
    
    return {"message": "OTP sent to registered email", "username": user.username}

@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(or_(User.username == request.username, User.email == request.username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    redis = get_redis()
    stored_otp = redis.get(f"pwd_reset:{user.username}")
    
    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    return {"message": "OTP verified successfully", "username": user.username}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(or_(User.username == request.username, User.email == request.username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    redis = get_redis()
    stored_otp = redis.get(f"pwd_reset:{user.username}")
    
    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user.password_hash = hash_password(request.new_password)
    db.commit()
    
    redis.delete(f"pwd_reset:{user.username}")
    
    return {"message": "Password reset successful"}