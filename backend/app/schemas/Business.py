from pydantic import BaseModel, Field

class BusinessCreate(BaseModel):
    name: str = Field(min_length = 1, max_length = 100)
    business_name: str = Field(min_length = 1, max_length = 100)
    address: str = Field(min_length = 1, max_length = 200)
    phone_no1: str = Field(min_length = 1, max_length = 11)
    phone_no2: str = Field(min_length = 1, max_length = 11)
    email_id: str = Field(min_length = 1, max_length = 100)
    website_link: str = Field(min_length = 1, max_length = 100)

class BusinessResponse(BaseModel):
    id: int
    name: str
    business_name: str
    address: str
    phone_no1: str
    phone_no2: str
    email_id: str
    website_link: str
    
    class Config:
        from_attributes = True