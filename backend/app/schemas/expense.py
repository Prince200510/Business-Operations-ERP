from pydantic import BaseModel, condecimal
from typing import Optional
from datetime import datetime

class ExpenseBase(BaseModel):
    category: str
    description: Optional[str] = None
    amount: condecimal(max_digits = 12, decimal_places = 2)
    expense_date: Optional[datetime] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    expense_date: datetime

    class Config:
        from_attributes = True
