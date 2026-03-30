from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class VideoRequest(BaseModel):
    url: str

class QueryRequest(BaseModel):
    video_id: str
    query: str

@router.post("/process-video")
async def process_video(request: VideoRequest):
    # TODO: Connect to Input Agent, Transcript Agent, etc.
    return {"status": "success", "message": f"Processing video from URL: {request.url}"}

@router.post("/query")
async def query_video(request: QueryRequest):
    # TODO: Connect to Q&A Agent using ChromaDB and Ollama
    return {"status": "success", "answer": f"Simulated answer for query '{request.query}'"}
