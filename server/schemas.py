from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    password: str

class FeedbackRequest(BaseModel):
    session_id: str
    user_id: str

class InterviewSetting(BaseModel):
    company_name: str
    interview_type: str
    stack: str
    interview_date: str

class MessageRequest(BaseModel):
    session_id: str
    message: str
    type: Optional[str] = None
