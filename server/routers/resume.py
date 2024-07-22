from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from database import users_collection
from resume_utils import extract_text_from_pdf, save_cv
from schemas import MessageRequest

router = APIRouter()

@router.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...), session_id: str):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF files are accepted.")

    try:
        text = await extract_text_from_pdf(file)
        # Assuming there's a function to save resume text to a session or user record
        await save_resume_text(session_id, text)
        return {"message": "Resume uploaded and processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {e}")
