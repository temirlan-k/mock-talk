
from io import BytesIO
import json
import os
from langchain_core.runnables import (
    RunnableLambda,
    ConfigurableFieldSpec,
    RunnablePassthrough,
)
import itertools
import time
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
import httpx
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage, SystemMessage
from pdfminer.high_level import extract_text
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from passlib.context import CryptContext
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from langchain_community.vectorstores import Chroma
from langchain.memory import VectorStoreRetrieverMemory

# Configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
STREAMING_API_URL = 'https://api.heygen.com/v1/streaming.create_token'

API_KEY_1 = 'MDBmZDE1NmRkM2Y3NDliZTg2NDNlMjRiZTU5OThlN2QtMTcxOTIyNTMzNg=='
API_KEY_2 = 'ZDhmYzQxNDcxZTUxNGNiMzg4MmRkMTFhNDM2ZjVlMzktMTcyMTY2NjI4OQ=='
API_KEY_3 = 'NWNhYjgxNDIzZjA1NDkzYjg2YTYxNmE1ZWZjMjM0NmYtMTcyMTY2NzgxMA=='
API_KEY_4 = 'ZjYyYTA0ZjExNDcwNGZkMzkyODA5YzA5ZmI3Yzc1YzgtMTcyMTY3MTQ2MA=='
API_KEY_5 = 'Zjk4ZjQwOWVkM2ExNDk5Y2FkMTU1NTI3MzA2NDgwMWEtMTcyMTY5NzI1OQ=='
API_KEY_6 = 'ZDRiN2QwYTRkM2U0NDEzNmIzY2U1MThhOGZhZjQ0MTYtMTcyMTk4MzU5OQ=='
API_KEY_7 = 'M2U5NTI1NWM3NzZlNDA3MGI4NjY0YzcxYmVkZTM1OWYtMTcyMTk4NDAxMw=='
API_KEY_8 = 'NzdlOTljYWI0ZjgyNGEwNDk5NzJkZWZlM2QwNTM1YTgtMTcyMTk4NDIyNA=='
API_KEY_9 = 'MDRkNjJjNTM1NmNiNGEwNDlkZWEwOWZkYTA1NTRkMTYtMTcyMTk4NDQxNg=='
API_KEY_10 = 'MWQ3M2ZjZGFkNDliNDZmYTg4Mzk1ODVjMzRjODNkOTAtMTcyMTk4NDY2NQ=='
API_KEY_11 = 'ZjY2ZjQwZjYxNzQwNGYzYjg2YjYxNzYwZjQwZjYxNzQtMTcyMTk4NDc4Mw=='
API_KEY_12 = "N2FhNzRkZjVhZGI2NDM5ZTk5MDhkYTBiNGQ5OWI2NmUtMTcyMTk4NjM1NQ=="
API_KEY_13 = "ZjM3ZTdjZWRkMDE0NGUzMTkxNDgyMmM5YjNhYzhhNDEtMTcyMTk4NjI5Ng=="
API_KEY_14 = "MTJlOTAyMGFjYWZkNDdlNjg2M2JkYmE1ZGMwZTMzM2YtMTcyMTk4NTk2MQ=="
API_KEY_15 = "ZGYzMjc1ZTE5MjQ4NDE1ZmI2NDU4ZjhiYTcxNmNhMGYtMTcyMTk4NjE5OA=="



API_KEYS = [

    API_KEY_1,
    API_KEY_2,
    API_KEY_3,
    API_KEY_4,
    API_KEY_5,
    API_KEY_6,
    API_KEY_7,
    API_KEY_8,
    API_KEY_9,
    API_KEY_10,
    API_KEY_11,
    API_KEY_12,
    API_KEY_13,
    API_KEY_14,
    API_KEY_15

]

api_key_iterator = itertools.cycle(API_KEYS)

def get_next_api_key():
    return next(api_key_iterator)

# Initialize FastAPI
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Chroma vector store and retriever memory
vectorstore = Chroma(collection_name='history', embedding_function=OpenAIEmbeddings())
retriever = vectorstore.as_retriever()
vectorstore_retriever_memory = VectorStoreRetrieverMemory(retriever=retriever)

# MongoDB client
client = AsyncIOMotorClient(os.getenv("DB_URL"))
db = client.mocktalk
sessions_collection = db.sessions
users_collection = db.users

# Security and authentication
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


class LoginRequest(BaseModel):
    email: str
    password: str


# Initialize JWTBearer
jwt_bearer = JWTBearer()


# Initialize the OpenAI LLM model
model = ChatOpenAI(
    model="gpt-4o",
    max_retries=2,
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
)
vectordb_memory_chain = RunnablePassthrough(
    llm=model,
    memory=vectorstore_retriever_memory,
    verbose=True
)

# Helper functions
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

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = time.time() + ACCESS_TOKEN_EXPIRE_MINUTES * 60
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def save_cv(file: UploadFile, user_id: str) -> str:
    try:
        file_path = f"cvs/{user_id}_{file.filename}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        return file_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving CV: {e}")

@app.get('/resume/{user_id}', responses={
    200: {
        "content": {
            "application/pdf": {
                "schema": {
                    "type": "string",
                    "format": "binary"
                }
            }
        },
        "description": "PDF Resume file"
    },
    404: {
        "description": "User or CV not found"
    }
})
async def get_resume(user_id: str):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if "cv_path" not in user:
        raise HTTPException(status_code=404, detail="CV not found")
    cv_path = user.get("cv_path")
    return FileResponse(cv_path, media_type="application/pdf", filename="resume.pdf")

@app.post("/register")
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

    access_token = create_access_token(data={"sub": user_dict.get("email"), "name":user_dict.get("name"),"_id": user_dict.get("_id")})
    return {"token": access_token, "token_type": "bearer"}


@app.get("/users/me")
async def read_users_me(token: dict = Depends(jwt_bearer)):
    decoded_token = decode_jwt(token)
    user = await users_collection.find_one({"_id":decoded_token.get("_id")})
    return user




@app.get("/feedbacks/me")
async def get_my_feedbacks(token: dict = Depends(jwt_bearer)):
    decoded_token = decode_jwt(token)
    feedbacks = await sessions_collection.find({"user_id": decoded_token.get("_id")}).to_list(length=100)
    return feedbacks


@app.post("/token")
async def login_for_access_token(login_data: LoginRequest):
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.get("email"), "name":user.get("name"),"_id": str(user.get("_id"))})
    print(user)
    return {"token": access_token, "token_type": "bearer"}

store = {}

def get_session_history(session_id: str, position:str = None ,grade:str=None) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
        system_prompt = f"""
        <<ТВОИ ОТВЕТЫ НЕ ДОЛЖНЫ ПРЕВЫШАТЬ ЛИМИТ В 200 СИМВОЛОВ!!!>> - ОЧЕНЬ ВАЖНО

        Вы - топовый Software Engineer ИИ-интервьюер на MockTalk.ai, моделирующий реальные сценарии собеседований для различных позиций (Backend, Frontend, FullStack, Android dev, IOS dev, DS, ML, Data Engineer, Data Analytics и т.д.), а также для различных грейдов (INTERN, JUNIOR, MIDDLE, SENIOR).
        Все, что вы делаете на собеседовании, должно строго относиться к теме собеседования и не выходить за его пределы. 
        Будьте максимально краткими, без лишних слов, чтобы собеседование было продуктивным. 
        САМОЕ ГЛАВНОЕ - задавайте вопросы и давайте ответы без лишних слов и будьте краткими, только по теме собеседования.
        ЗАДАВАЙТЕ ВОПРОСЫ ПОСЛЕДОВАТЕЛЬНО, ПО ОДНОМУ, чтобы пользователю было удобно отвечать.
        Когда пользователь просит объяснить какую-то тему или технологию, объясняйте кратко, просто и понятно.
        Проведите собеседование для кандидата на позицию {position} на грейд {grade}. 
        Задавайте сложные вопросы, требующие глубокого понимания и знаний конкретных технологий или специализаций. 
        Избегайте обычных вопросов, фокусируйтесь на более трудных задачах, которые редко задают на реальных собеседованиях.
        Ответы не должны превышать 3-4 предложений/200 символов.
        <<ТВОИ ОТВЕТЫ НЕ ДОЛЖНЫ ПРЕВЫШАТЬ ЛИМИТ В 200 СИМВОЛОВ!!!>> - ОЧЕНЬ ВАЖНО
        
        Пример краткого объяснения:
        Пользователь: "Можете объяснить, как работает каппа-архитектура?"
        ИИ: "Каппа-архитектура предназначена для обработки данных в реальном времени, использует единую потоковую платформу для приема и обработки данных. Это позволяет избежать сложности двух отдельных систем для батчевой и потоковой обработки."
        <<ТВОИ ОТВЕТЫ НЕ ДОЛЖНЫ ПРЕВЫШАТЬ ЛИМИТ В 200 СИМВОЛОВ!!!>> - ОЧЕНЬ ВАЖНО
        """

        store[session_id].add_message(SystemMessage(content=system_prompt))
    return store[session_id]


with_message_history = RunnableWithMessageHistory(model, get_session_history)

class InterviewSetting(BaseModel):
    company_name: str
    interview_type:str
    stack: str
    interview_date: str

class MessageRequest(BaseModel):
    session_id: str
    message: Optional[str] = None
    position:Optional[str] = None
    grade:Optional[str] = None
    type:Optional[str] = None

@app.post('/get-access-token')
async def get_access_token():
    try:
        async with httpx.AsyncClient() as client:
            x_api_key = get_next_api_key()
            print(x_api_key, "x_api_key")
            headers = {
                'x-api-key': x_api_key,
                'Content-Type': 'application/json'
            }
            response = await client.post(STREAMING_API_URL, headers=headers)
            response.raise_for_status()
            data = response.json()
            token = data.get('data', {}).get('token')
            return {"token": token}
    except httpx.HTTPStatusError as http_error:
        raise HTTPException(status_code=http_error.response.status_code, detail='Failed to retrieve access token')
    except httpx.RequestError as request_error:
        raise HTTPException(status_code=500, detail='Network error')

@app.post('/chat')
async def chat_with_history(request: MessageRequest):
    try:
        session_id = request.session_id
        user_message = request.message
        position = request.position
        grade = request.grade
        type = request.type
        final_message = "Вот мой код для вопроса по кодингу, проверь соответсует ли решение твоему вопросу :  " + user_message if type == "code" else user_message
        session_history =  get_session_history(session_id,position,grade)
        session_history.add_message(HumanMessage(content=final_message))


        config = {"configurable": {"session_id": session_id}}
        response = with_message_history.invoke(
            [HumanMessage(content=final_message)],
            config=config,
        )

        return {"response": response.content}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Internal server error: {error}")

async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    try:
        pdf_content = BytesIO(pdf_file.file.read())
        text = extract_text(pdf_content)
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {e}")

@app.post("/start-session/")
async def start_session():
    session_id = str(uuid.uuid4())
    get_session_history(session_id)
    return {"session_id": session_id}

class FeedbackRequest(BaseModel):
    session_id: str

@app.post("/end-session/")
async def end_session_and_save_feedback(request: FeedbackRequest, token: dict = Depends(jwt_bearer)):
    decoded_token = decode_jwt(token)
    user_id = decoded_token.get("_id")
    session_id = request.session_id
    feedback_prompt = (
        f"Дай строгий фидбэк по пройденному пользователем интервью. "
        f"Вот вся история интервью:\n\n\n"
        "Оцени его по следующим критериям:\n"
        "1. Софт Скиллы (коммуникация, командная работа, адаптивность и т.д.).\n"
        "   - Оцениваешь строго, обрати внимание на конкретность и уместность высказываний.\n"
        "2. Хард Скиллы (укажите конкретные темы, которые он знает хорошо и те, которые требуют улучшения).\n"
        "   - Строго проверяешь ответы на правильность и конкретность. Выявляй ошибки и недочеты.\n"
        "3. Рекомендации (предложите материалы или шаги для улучшения слабых навыков).\n"
        "   - Дай конкретные рекомендации, как улучшить слабые стороны.\n"
        "Пример строгого фидбэка: 'Кандидат продемонстрировал недостаточную точность в объяснении алгоритмов. "
        "Некоторые ответы содержали избыточную информацию, не относящуюся к теме. Рекомендуем изучить книги XYZ и курсы ABC.'"        
    )
    chat_history =  get_session_history(session_id)
    history = chat_history.messages[0].content
    messages = [
        SystemMessage(content=feedback_prompt),
        HumanMessage(content=history)
    ]
    ai_feedback = model.invoke(messages)
    
    session_data = {
        "_id": str(ObjectId()),
        "session_id": session_id,
        "user_id": user_id,
        "feedback": ai_feedback.content,
        "timestamp": time.time()
    }
    await sessions_collection.insert_one(session_data)

    return ai_feedback.content  

@app.get("/feedbacks/")
async def get_feedbacks(token: dict = Depends(jwt_bearer)):
    decoded_token = decode_jwt(token)
    user = await users_collection.find_one({"_id": decoded_token.get("_id")})
    feedbacks = await sessions_collection.find({'user_id': user.get('_id')}).to_list(length=100)

    return [
        {
            '_id': str(i.get("_id")),
            'feedback': i.get('feedback'),
            'timestamp': i.get('timestamp', '')
        } for i in feedbacks
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app='main:app', host="0.0.0.0", port=8002, reload=True, workers=4)
