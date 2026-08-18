from decimal import Decimal
from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class SaleOrderItem(Base):
    __tablename__ = "sale_order_items"
    
    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    sale_order_id: Mapped[int] = mapped_column(ForeignKey("sale_orders.id", ondelete = "CASCADE"), nullable = False, index = True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable = False, index = True)
    quantity: Mapped[int] = mapped_column(Integer, nullable = False)
    sale_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    item_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable = False)
    