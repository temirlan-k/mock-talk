from fastapi import APIRouter, HTTPException, Depends
from schemas import FeedbackRequest, InterviewSetting
from database import sessions_collection
from auth import jwt_bearer

router = APIRouter()

@router.post("/start-session/")
async def start_session(interview_setting: InterviewSetting, token: str = Depends(jwt_bearer)):
    # Logic to start a session
    session_data = {
        "interview_setting": interview_setting.dict(),
        "history": [],
        "feedback": None,
        "status": "ongoing"
    }
    result = await sessions_collection.insert_one(session_data)
    if result.inserted_id:
        return {"session_id": str(result.inserted_id)}
    else:
        raise HTTPException(status_code=500, detail="Failed to start session")

@router.post("/end-session/")
async def end_session(feedback_request: FeedbackRequest, token: str = Depends(jwt_bearer)):
    session_id = feedback_request.session_id
    user_id = feedback_request.user_id

    session = await sessions_collection.find_one({"_id": session_id, "user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Generate feedback
    feedback = generate_feedback(session)  # Assuming a function to generate feedback
    update_result = await sessions_collection.update_one({"_id": session_id}, {"$set": {"feedback": feedback, "status": "completed"}})

    if update_result.modified_count == 1:
        return {"message": "Session ended and feedback saved successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to end session")

# Assuming a function that generates feedback based on the session history
def generate_feedback(session):
    # Implement feedback generation logic
    return "Generated feedback based on session history"
