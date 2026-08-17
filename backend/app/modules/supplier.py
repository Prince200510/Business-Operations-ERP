from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    name: Mapped[str] = mapped_column(String(100), nullable = False)
    email: Mapped[str] = mapped_column(String(255), nullable = False)
    phone_number: Mapped[str] = mapped_column(String(11), nullable = False)
    address: Mapped[str] = mapped_column(Text, nullable = False)
    