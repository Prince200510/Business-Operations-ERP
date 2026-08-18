from pydantic import BaseModel, Field

class CustomerCreate(BaseModel):
    name: str = Field(min_length = 1, max_length = 100)
    address: str = Field(min_length = 1, max_length = 200)

class CustomerResponse(BaseModel):
    id: int
    name: str
    address: str
    
    class Config:
        from_attributes = True