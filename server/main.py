from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

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
            response.raise_for_status()  # Raise HTTPError for non-2xx responses
            
            data = response.json()
            return {"token": data.get('data', {}).get('token')}
        
    except httpx.HTTPStatusError as http_error:
        # Handle HTTP errors (non-2xx responses)
        raise HTTPException(status_code=http_error.response.status_code, detail='Failed to retrieve access token')
    
    except httpx.RequestError as request_error:
        # Handle network-related errors
        raise HTTPException(status_code=500, detail='Network error occurred')
    
    except Exception as error:
        # Handle any other unexpected errors
        raise HTTPException(status_code=500, detail='Internal server error')
