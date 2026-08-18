from sqlalchemy import String, Numeric, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete = "CASCADE"), nullable = False, index = True)
    name: Mapped[str] = mapped_column(String(100), nullable = False)
    purchase_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable = False)
    sale_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable = False)
    quantity: Mapped[int] = mapped_column(Integer, nullable = False, default = 0)
    