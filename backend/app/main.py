from fastapi import FastAPI
from app.core.redis import get_redis
from app.api.router import api_router
from app.core.database import Base, engine
from app.api.auth import router as auth_router

redis = get_redis()
app = FastAPI(title='Business Operations ERP', version='1.0.0')
Base.metadata.create_all(bind = engine)
app.include_router(api_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Nexora API is running"
    }