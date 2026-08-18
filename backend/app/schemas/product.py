from decimal import Decimal
from pydantic import BaseModel, Field

class ProductCreate(BaseModel):
    supplier_id: int
    name: str = Field(min_length = 1, max_length = 100)
    purchase_price: Decimal = Field(gt = 0)
    sale_price: Decimal = Field(gt = 0)
    quantity: int = Field(gt = 0)

class ProductResponse(BaseModel):
    id: int
    supplier_id: int
    name: str
    purchase_price: Decimal
    sale_price: Decimal
    quantity: int
    
    class Config:
        from_attributes = True