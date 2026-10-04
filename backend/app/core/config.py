from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str 
    REDIS_URL: str 
    SECRET_KEY: str 
    EMAILJS_SERVICE_ID: str | None = None
    EMAILJS_TEMPLATE_ID: str | None = None
    EMAILJS_PUBLIC_KEY: str | None = None
    EMAILJS_PRIVATE_KEY: str | None = None
    
    class Config:
        env_file = ".env"

settings = Settings()