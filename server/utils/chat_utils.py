import os
from fastapi import HTTPException
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.memory import VectorStoreRetrieverMemory
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage, SystemMessage
import uuid
import time

# Initialize the OpenAI LLM model
model = ChatOpenAI(
    model="gpt-4o",
    max_tokens=1500,
    timeout=60,
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.5,
)

# Setup memory for session management
memory = VectorStoreRetrieverMemory(
    vectorstore=Chroma(
        embedding_function=OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY")),
        collection_name="mocktalk",
    )
)

def with_message_history(messages, config):
    # Initialize the ConversationalRetrievalChain with a retriever
    retriever = memory.as_retriever()
    chain = RunnableWithMessageHistory(
        retriever=retriever,
        memory=memory,
        llm=model
    )
    response = chain.invoke(messages, config=config)
    return response

from langchain_core.runnables import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage

async def generate_feedback(session):
    # Extract relevant details for feedback generation
    session_history = session.get("history", [])
    interview_type = session.get("interview_setting", {}).get("interview_type", "General")

    # Construct prompt for LLM based on interview type and history
    prompt = f"Based on the interview type: {interview_type}, provide feedback on the following conversation:\n\n"
    for entry in session_history:
        prompt += f"{entry['type'].capitalize()}: {entry['content']}\n"

    # Create LLM request
    response = await with_message_history([HumanMessage(content=prompt)], {"configurable": {"session_id": str(session["_id"])}})

    # Extract and return feedback from the response
    return response.content

from database import sessions_collection
from bson import ObjectId
from langchain_core.messages import HumanMessage, AIMessage

async def get_session_history(session_id: str):
    session = await sessions_collection.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Extract and prepare session history
    history = session.get("history", [])
    messages = []
    for entry in history:
        if entry["type"] == "human":
            messages.append(HumanMessage(content=entry["content"]))
        elif entry["type"] == "ai":
            messages.append(AIMessage(content=entry["content"]))
    
    return messages

