from pydantic import BaseModel, EmailStr

class SupplierCreate(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    address: str

class SupplierResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone_number: str
    address: str
    
    class Config:
        from_attributes = True
        