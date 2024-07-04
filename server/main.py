# from io import BytesIO
# from fastapi import FastAPI, File, HTTPException, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import httpx
# from langchain_groq import ChatGroq 
# from langchain_community.chat_message_histories import ChatMessageHistory
# from langchain_core.runnables.history import RunnableWithMessageHistory
# from langchain_core.messages import HumanMessage
# from langchain_core.messages import SystemMessage
# from pdfminer.high_level import extract_text
# app = FastAPI()

# # Initialize the ChatGroq model
# model = ChatGroq(
#     model="llama3-8b-8192",
#     api_key='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',
#     streaming=True,
#     )

# # CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], 
#     allow_credentials=True,
#     allow_methods=["POST"],
#     allow_headers=["*"],
# )

# API_KEY = 'MDBmZDE1NmRkM2Y3NDliZTg2NDNlMjRiZTU5OThlN2QtMTcxOTIyNTMzNg=='
# STREAMING_API_URL = 'https://api.heygen.com/v1/streaming.create_token'

# store = {}

# def get_session_history(session_id: str) -> ChatMessageHistory:
#     if session_id not in store:
#         store[session_id] = ChatMessageHistory()
#         store[session_id].add_message(SystemMessage(
#             content="""
# You are an AI interviewer for MockTalk.ai, a web application that uses HeyGen's Human Avatar technology to simulate real interview scenarios. Your role is to help users prepare for software engineering interviews by conducting realistic mock interviews and providing constructive feedback. Your responsibilities include:

#     Conducting Software Engineering Interviews:
#         Simulate a variety of interview scenarios specifically tailored to software engineering roles.
#         Ask relevant, thoughtful, and challenging questions related to algorithms, data structures, system design, coding, and other key areas in software engineering.

#     Providing Feedback:
#         Offer personalized feedback highlighting the user's strengths and areas for improvement in software engineering skills.
#         Provide actionable tips and recommendations for better performance in future software engineering interviews.

#     Assisting Recruiters:
#         Help recruiters by conducting preliminary software engineering interviews based on job descriptions provided.
#         Deliver detailed insights and assessments of candidates' technical abilities to assist recruiters in making informed hiring decisions.

#     Ensuring Realism:
#         Maintain a professional and realistic demeanor throughout the interview.
#         Use natural language and adapt to the user's responses to create an engaging and authentic software engineering interview experience.

# Remember, your ultimate goal is to prepare users effectively for real-world software engineering interviews, enhancing their technical skills, confidence, and communication abilities while providing valuable insights to recruiters."""
            
#         ))
#     return store[session_id]

# with_message_history = RunnableWithMessageHistory(model, get_session_history)

# class MessageRequest(BaseModel):
#     session_id: str
#     message: str

# @app.post('/get-access-token')
# async def get_access_token():
#     try:
#         async with httpx.AsyncClient() as client:
#             headers = {
#                 'x-api-key': API_KEY,
#                 'Content-Type': 'application/json'
#             }
#             response = await client.post(STREAMING_API_URL, headers=headers)
#             response.raise_for_status() 
            
#             data = response.json()
#             return {"token": data.get('data', {}).get('token')}
        
#     except httpx.HTTPStatusError as http_error:
#         raise HTTPException(status_code=http_error.response.status_code, detail='Failed to retrieve access token')
    
#     except httpx.RequestError as request_error:
#         print(request_error)
#         raise HTTPException(status_code=500, detail='Network error occurred')
    
#     except Exception as error:
#         raise HTTPException(status_code=500, detail='Internal server error')


# @app.post('/chat')
# async def chat_with_history(request: MessageRequest):
#     try:
#         session_id = request.session_id
#         user_message = request.message
        
#         config = {"configurable": {"session_id": session_id}}
#         response = with_message_history.invoke(
#             [HumanMessage(content=user_message)],
#             config=config,
#         )
        
#         return {"response": response.content}
    
#     except Exception as error:
#         raise HTTPException(status_code=500, detail='Internal server error')
    

# def extract_text_from_pdf(pdf_file):
#     try:
#         pdf_content = BytesIO(pdf_file.file.read())
#         text = extract_text(pdf_content)
#         return text
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {e}")

# @app.post("/analyze_resume/")
# async def analyze_resume_endpoint(pdf_file: UploadFile = File(...)):
#     try:
#         pdf_text = extract_text_from_pdf(pdf_file)
        
#         return {"message": "PDF successfully analyzed", "text": pdf_text}
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))




# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app='main:app', host="0.0.0.0", port=8000,reload=True,workers=4)

from io import BytesIO
from fastapi import FastAPI, File, HTTPException, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from langchain_groq import ChatGroq 
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage
from langchain_core.messages import SystemMessage
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

API_KEY = 'MDBmZDE1NmRkM2Y3NDliZTg2NDNlMjRiZTU5OThlN2QtMTcxOTIyNTMzNg=='
STREAMING_API_URL = 'https://api.heygen.com/v1/streaming.create_token'

store = {}

def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
        store[session_id].add_message(SystemMessage(
            content="""
You are an AI interviewer for MockTalk.ai, a web application that uses HeyGen's Human Avatar technology to simulate real interview scenarios. Your role is to help users prepare for software engineering interviews by conducting realistic mock interviews and providing constructive feedback. Your responsibilities include:

    Conducting Software Engineering Interviews:
        Simulate a variety of interview scenarios specifically tailored to software engineering roles.
        Ask relevant, thoughtful, and challenging questions related to algorithms, data structures, system design, coding, and other key areas in software engineering.

    Providing Feedback:
        Offer personalized feedback highlighting the user's strengths and areas for improvement in software engineering skills.
        Provide actionable tips and recommendations for better performance in future software engineering interviews.

    Assisting Recruiters:
        Help recruiters by conducting preliminary software engineering interviews based on job descriptions provided.
        Deliver detailed insights and assessments of candidates' technical abilities to assist recruiters in making informed hiring decisions.

    Ensuring Realism:
        Maintain a professional and realistic demeanor throughout the interview.
        Use natural language and adapt to the user's responses to create an engaging and authentic software engineering interview experience.

Remember, your ultimate goal is to prepare users effectively for real-world software engineering interviews, enhancing their technical skills, confidence, and communication abilities while providing valuable insights to recruiters."""
        ))
    return store[session_id]

with_message_history = RunnableWithMessageHistory(model, get_session_history)

class MessageRequest(BaseModel):
    session_id: str
    message: str

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

@app.post("/analyze_resume/")
async def analyze_resume_endpoint(pdf_file: UploadFile = File(...)):
    try:
        pdf_text = extract_text_from_pdf(pdf_file)
        return {"message": "PDF successfully analyzed", "text": pdf_text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_text_from_pdf(pdf_file):
    try:
        pdf_content = BytesIO(pdf_file.file.read())
        text = extract_text(pdf_content)
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {e}")

@app.post("/start-session/")
async def start_session():
    session_id = str(uuid.uuid4())
    get_session_history(session_id)  # Initialize the session history
    return {"session_id": session_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app='main:app', host="0.0.0.0", port=8000, reload=True, workers=4)

