from sqlalchemy import DateTime, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from datetime import datetime

class Business(Base):
    __tablename__ = "business"
    
    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    name: Mapped[str] = mapped_column(String(100), nullable = False)
    business_name: Mapped[str] = mapped_column(String(100), nullable = False)
    phone_no1: Mapped[str] = mapped_column(String(11), nullable = False)
    phone_no2: Mapped[str] = mapped_column(String(11), nullable = False)
    email_id: Mapped[str] = mapped_column(String(100), nullable = False)
    website_link: Mapped[str] = mapped_column(String(100), nullable = False)
    address: Mapped[str] = mapped_column(String(200), nullable = False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default = datetime.utcnow, nullable = False)
    