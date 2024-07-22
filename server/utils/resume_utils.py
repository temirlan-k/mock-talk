from fastapi import HTTPException, UploadFile
from PyPDF2 import PdfReader
import aiofiles
import os

async def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        reader = PdfReader(file.file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {e}")

async def save_cv(file: UploadFile, user_id: str) -> str:
    try:
        file_location = f"uploads/{user_id}/{file.filename}"
        os.makedirs(os.path.dirname(file_location), exist_ok=True)
        async with aiofiles.open(file_location, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        return file_location
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving CV: {e}")
