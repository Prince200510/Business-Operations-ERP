from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import (hash, verify)
from app.modules.user import User
from app.schemas.auth import (Register, Login)

router = APIRouter(prefix = "/api/v1/auth", tags = ["Authenication"])

@router.post("/register")
def register(request: Register, db: Session = Depends(get_db)):
    existing_user = (db.query(User).filter(User.username == request.username).first())
    
    if existing_user:
        raise HTTPException(status_code=409, detail = "Username is already exists")
    
    existing_email = (db.query(User).filter(User.email == request.email).first())
    
    if existing_email:
        raise HTTPException(status_code=409, detail = "Email id already registered")
    
    hashed_password = hash(request.password)
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
    
    if not verify(request.password, user.password_hash):
        redis.incr(attempts_key)
        redis.expire(attempts_key, 300)
        
        raise HTTPException(status_code=401, detail = "Invaild password")
    
    redis.delete(attempts_key)
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email
        }
    }