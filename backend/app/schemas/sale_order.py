from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

class SaleOrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt = 0)

class SaleOrderCreate(BaseModel):
    customer_name: str = Field(min_length = 1, max_length = 100)
    customer_address: str = Field(min_length = 1, max_length = 200)
    items: list[SaleOrderItemCreate]
    discount: Decimal = Field(defult = 0, ge = 0)
    payment_method: str


class SaleOrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    sale_price: Decimal
    item_total: Decimal
    
    class Config:
        from_attributes = True

class SaleOrderResponse(BaseModel):
    id: int
    customer_id: int
    order_total: Decimal
    discount: Decimal
    cgst: Decimal
    sgst: Decimal
    final_total: Decimal
    payment_method: str
    created_at: datetime
    items: list[SaleOrderItemResponse]
    
    class Config:
        from_attributes = True