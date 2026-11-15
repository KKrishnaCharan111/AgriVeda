from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    full_name: str
    preferred_language: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    role: str = Field("farmer", pattern="^(farmer|labour|buyer|shop|admin)$")
    preferred_language: str = Field("te", pattern="^(te|en)$")
    state: str = "Andhra Pradesh"
    district: str = "Guntur"
    village: Optional[str] = ""
    email: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    password: str
