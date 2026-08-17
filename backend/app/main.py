from fastapi import FastAPI
from app.core.redis import get_redis
from app.api.router import api_router

redis = get_redis()
app = FastAPI(title='Business Operations ERP', version='1.0.0')
app.include_router(api_router)
