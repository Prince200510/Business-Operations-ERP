import bcrypt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt  
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_text: str, hash_pass: str) -> bool:
    try:
        return bcrypt.checkpw(plain_text.encode('utf-8'), hash_pass.encode('utf-8'))
    except ValueError:
        return False

algorithms = "HS256"
access_toke_expire = 60

def create_access_token(data: dict, expire_delta: timedelta | None = None):
    to_encode = data.copy()
    
    if expire_delta:
        expire = datetime.now(timezone.utc) + expire_delta
    else:
        expire = (datetime.now(timezone.utc) + timedelta(minutes=access_toke_expire))
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=algorithms)
    
    return encoded_jwt