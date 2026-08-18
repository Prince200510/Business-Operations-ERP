from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

class PurchaseCreate(BaseModel):
    supplier_id: int
    product_name: str
    quantity: int = Field(gt = 0)
    purchase_price: Decimal = Field(gt = 0)
    sale_price: Decimal = Field(default = 0, ge = 0)
    discount: Decimal = Field(default = 0, ge = 0)
    payment_method: str 

class PurchaseResponse(BaseModel):
    id: int
    supplier_id: int
    product_id: int
    quantity: int
    purchase_price: Decimal
    item_total: Decimal
    discount: Decimal
    final_total: Decimal
    payment_method: str
    added_to_inventory_at: datetime | None = None
    created_at: datetime
    
    class Config:
        from_attributes = True