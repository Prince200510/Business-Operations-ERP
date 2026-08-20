from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Expense(Base):
    __tablename__ = "expenses"
    
    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    category: Mapped[str] = mapped_column(String(100), nullable = False)
    description: Mapped[str] = mapped_column(String(255), nullable = True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    expense_date: Mapped[datetime] = mapped_column(DateTime, default = datetime.utcnow, nullable = False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default = datetime.utcnow, nullable = False)
