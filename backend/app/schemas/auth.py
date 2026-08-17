from pydantic import BaseModel, EmailStr, Field

class Register(BaseModel):
    name: str = Field(min_length = 2, max_length = 100)
    username: str = Field(min_length = 6, max_length = 16)
    email: EmailStr
    mobile: str = Field(min_length = 10, max_length = 20)
    password: str = Field(min_length = 8, max_length = 32)

class Login(BaseModel):
    username: str
    password: str
    