from fastapi import APIRouter, HTTPException
from schemas import MessageRequest
from utils.chat_utils import get_session_history, HumanMessage, with_message_history

router = APIRouter()

@router.post('/chat')
async def chat_with_history(request: MessageRequest):
    try:
        session_id = request.session_id
        user_message = request.message
        type = request.type
        final_message = "Вот мой код для вопроса по кодингу, проверь соответсует ли решение твоему вопросу: " + user_message if type == "code" else user_message
        session_history = get_session_history(session_id)
        session_history.add_message(HumanMessage(content=final_message))

        config = {"configurable": {"session_id": session_id}}
        response = with_message_history.invoke(
            [HumanMessage(content=final_message)],
            config=config,
        )

        return {"response": response.content}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Internal server error: {error}")
