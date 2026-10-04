from pydantic import BaseModel, Field

class CustomerCreate(BaseModel):
    name: str = Field(min_length = 1, max_length = 100)
    email: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    address: str = Field(min_length = 1, max_length = 200)

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str | None = None
    phone: str | None = None
    address: str
    
    class Config:
        from_attributes = True