import time
from typing import Optional
import jwt
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from config import SECRET_KEY, ALGORITHM
from database import users_collection

ACCESS_TOKEN_EXPIRE_MINUTES=200

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def decode_jwt(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_token if decoded_token["exp"] >= time.time() else {}
    except:
        return {}

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if credentials.scheme != "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> bool:
        try:
            payload = decode_jwt(jwtoken)
            return bool(payload)
        except:
            return False

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def get_user(email: str) -> Optional[dict]:
    user = await users_collection.find_one({"email": email})
    return user

async def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = await get_user(email)
    if not user or not verify_password(password, user.get("hashed_password")):
        return None
    return user

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = time.time() + ACCESS_TOKEN_EXPIRE_MINUTES * 60
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

jwt_bearer = JWTBearer()
