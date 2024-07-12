from io import BytesIO
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from langchain_groq import ChatGroq 
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage, SystemMessage
from pdfminer.high_level import extract_text
import uuid

app = FastAPI()

# Initialize the ChatGroq model
model = ChatGroq(
    model="llama3-8b-8192",
    api_key='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',
    streaming=True,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Dictionary to store session history
store = {}

# Function to retrieve or create session history
def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
        store[session_id].add_message(SystemMessage(
            content="Вы - ИИ-интервьюер на MockTalk.ai, веб-приложении, которое использует технологию HeyGen's Human Avatar для моделирования реальных сценариев собеседования."        ))
    return store[session_id]

# Initialize RunnableWithMessageHistory
with_message_history = RunnableWithMessageHistory(model, get_session_history)

# Request model for chat messages
class MessageRequest(BaseModel):
    session_id: str
    message: str

# Endpoint to get HeyGen API access token
API_KEY = 'MDBmZDE1NmRkM2Y3NDliZTg2NDNlMjRiZTU5OThlN2QtMTcxOTIyNTMzNg=='
STREAMING_API_URL = 'https://api.heygen.com/v1/streaming.create_token'

@app.post('/get-access-token')
async def get_access_token():
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
            response = await client.post(STREAMING_API_URL, headers=headers)
            response.raise_for_status() 
            
            data = response.json()
            return {"token": data.get('data', {}).get('token')}
        
    except httpx.HTTPStatusError as http_error:
        raise HTTPException(status_code=http_error.response.status_code, detail='Failed to retrieve access token')
    
    except httpx.RequestError as request_error:
        print(request_error)
        raise HTTPException(status_code=500, detail='Network error occurred')
    
    except Exception as error:
        raise HTTPException(status_code=500, detail='Internal server error')

# Endpoint to chat with the AI
@app.post('/chat')
async def chat_with_history(request: MessageRequest):
    try:
        session_id = request.session_id
        user_message = request.message
        
        config = {"configurable": {"session_id": session_id}}
        response = with_message_history.invoke(
            [HumanMessage(content=user_message)],
            config=config,
        )
        return {"response": response.content}
    
    except Exception as error:
        raise HTTPException(status_code=500, detail='Internal server error')


# Function to extract text from uploaded PDF resume
async def extract_text_from_pdf(pdf_file):
    try:
        pdf_content =  BytesIO(pdf_file.file.read())
        text =  extract_text(pdf_content)
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {e}")


# Endpoint to start a new session
@app.post("/start-session/")
async def start_session():
    session_id = str(uuid.uuid4())
    get_session_history(session_id)  # Initialize the session history
    return {"session_id": session_id}

@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...), session_id: str = ""):
    try:
        text = await extract_text_from_pdf(file)
        
        # Adding the extracted text as a message to the session history
        session_history = get_session_history(session_id)
        session_history.add_message(HumanMessage(content=f"Resume content: {text}"))
        
        # Generating questions based on the resume content
        user_message = "Проанализируйте резюме и составьте на его основе очень короткие 5 вопросов для собеседования. Коротко"
        config = {"configurable": {"session_id": session_id}}
        response = with_message_history.invoke(
            [HumanMessage(content=user_message)],
            config=config,
        )
        return {"response": response.content}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app='main:app', host="0.0.0.0", port=8001, reload=True, workers=4)
