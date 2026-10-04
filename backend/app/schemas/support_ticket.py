from pydantic import BaseModel, Field

class SupportTicketCreate(BaseModel):
    customer_id: int
    subject: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=1000)
    status: str = Field(default="Open", max_length=50)

class SupportTicketResponse(BaseModel):
    id: int
    customer_id: int
    subject: str
    description: str
    status: str
    
    class Config:
        from_attributes = True
