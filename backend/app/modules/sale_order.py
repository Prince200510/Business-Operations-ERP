from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class SaleOrder(Base):
    __tablename__ = "sale_orders"
    
    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_id", ondelete = "CASCADE"), nullable = False, index = True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable = False, index = True)
    order_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default = 0, nullable = False)
    cgst: Mapped[Decimal] = mapped_column(Numeric(12, 2), default = 0, nullable = False)
    sgst: Mapped[Decimal] = mapped_column(Numeric(12, 2), default = 0, nullable = False)
    final_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable = False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default = datetime.utcnow, nullable = False)
    