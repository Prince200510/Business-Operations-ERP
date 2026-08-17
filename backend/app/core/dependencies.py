from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt 
from app.core.config import settings
from app.core.security import algorithms

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/auth/login")

def get_current_user_id(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials",
        headers = {"WWW-Authenticate": "Bearer"}
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[algorithms])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
        return int(user_id)
    except(JWTError, ValueError):
        raise credentials_exception