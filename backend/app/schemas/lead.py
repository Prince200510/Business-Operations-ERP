from pydantic import BaseModel, Field
from typing import Optional

class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    status: str = Field(default="New", max_length=50)

class LeadResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str
    
    class Config:
        from_attributes = True
