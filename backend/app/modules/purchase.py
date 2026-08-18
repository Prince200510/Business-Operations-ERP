from sqlalchemy import String, Numeric, Integer, ForeignKey, DateTime, Column
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from decimal import Decimal
from app.core.database import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable = False, index = True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), nullable = False, index = True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable = False, index = True)
    quantity: Mapped[int] = mapped_column(Integer, nullable = False)
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    item_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    # purchase_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False, default = 0)
    final_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable = False)
    added_to_inventory_at: Mapped[datetime] = mapped_column(DateTime, nullable = True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default = datetime.utcnow, nullable = False)
    