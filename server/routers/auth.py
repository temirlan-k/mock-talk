from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile
from pydantic import EmailStr
from auth import create_access_token, authenticate_user, get_password_hash, jwt_bearer
from schemas import LoginRequest
from database import users_collection

router = APIRouter()

@router.post("/register")
async def register(
    name: str = Form(...),
    email: EmailStr = Form(...),
    job_title: str = Form(...),
    experience: str = Form(...),
    password: str = Form(...),
    cv: UploadFile = File(None)
):
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")

    user_dict = {
        "name": name,
        "email": email,
        "job_title": job_title,
        "experience": experience,
        "hashed_password": get_password_hash(password),
        "_id": str(ObjectId())
    }

    result = await users_collection.insert_one(user_dict)
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Registration failed")

    if cv:
        try:
            cv_path = await save_cv(cv, str(result.inserted_id))
            await users_collection.update_one({"_id": result.inserted_id}, {"$set": {"cv_path": cv_path}})
        except HTTPException as e:
            await users_collection.delete_one({"_id": result.inserted_id})
            raise e

    access_token = create_access_token(data={"sub": user_dict.get("email"), "name": user_dict.get("name"), "_id": user_dict.get("_id")})
    return {"token": access_token, "token_type": "bearer"}

@router.post("/token")
async def login_for_access_token(login_data: LoginRequest):
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.get("email"), "name": user.get("name"), "_id": str(user.get("_id"))})
    return {"token": access_token, "token_type": "bearer"}

@router.get("/users/me")
async def read_users_me(token: dict = Depends(jwt_bearer)):
    decoded_token = decode_jwt(token)
    user = await users_collection.find_one({"_id": decoded_token.get("_id")})
    return user
