from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    name: str
    email: EmailStr
    job_title: str
    experience: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

class UserInDB(User):
    hashed_password: str
