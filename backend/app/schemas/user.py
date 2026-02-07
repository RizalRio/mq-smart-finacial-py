from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Base Schema (Field yang umum)
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

# Schema untuk Register (Input dari Frontend)
class UserCreate(UserBase):
    password: str

# Schema untuk Response (Output ke Frontend - Password jangan dikasih!)
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True # Dulu namanya orm_mode = True