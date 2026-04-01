from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Video
from agents.input_agent import InputAgent
from agents.transcript_agent import TranscriptAgent
from agents.preprocessing_agent import PreprocessingAgent
from agents.summarization_agent import SummarizationAgent
from agents.qna_agent import QnAAgent
from agents.timestamp_agent import TimestampAgent
from utils.health_utils import check_ollama_health, check_model_availability
from config import settings
import json
import re

router = APIRouter()

# Initialize Agents
input_agent = InputAgent()
transcript_agent = TranscriptAgent()
preprocessing_agent = PreprocessingAgent()
summarization_agent = SummarizationAgent()
qna_agent = QnAAgent()
timestamp_agent = TimestampAgent()

class VideoRequest(BaseModel):
    url: str

class QueryRequest(BaseModel):
    video_id: str
    query: str

@router.get("/health")
async def health_check():
    ollama_ok, ollama_msg = check_ollama_health()
    model_ok, model_msg = check_model_availability(settings.ollama_model)
    return {
        "status": "ok" if ollama_ok and model_ok else "degraded",
        "services": {
            "ollama": {"status": "up" if ollama_ok else "down", "message": ollama_msg},
            "model": {"status": "available" if model_ok else "missing", "message": model_msg}
        }
    }

@router.post("/process-video")
async def process_video(request: VideoRequest, db: Session = Depends(get_db)):
    # 1. Validate URL and Extract ID
    if not input_agent.validate_youtube_url(request.url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    video_id = input_agent.extract_video_id(request.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Could not extract video ID")

    # Check if we already processed this video
    existing_video = db.query(Video).filter(Video.id == video_id).first()
    if existing_video:
         return {
             "status": "success", 
             "video_id": existing_video.id, 
             "data": json.loads(existing_video.summary_json),
             "timeline": json.loads(existing_video.timeline_json) if existing_video.timeline_json else []
         }

    # 2. Get Transcript
    transcript_raw = transcript_agent.get_transcript(video_id)
    if not transcript_raw:
        raise HTTPException(status_code=400, detail="Could not fetch transcript for this video. Please ensure the video has captions available.")

    transcript_timed = transcript_agent.get_transcript_with_timestamps(video_id)
    key_moments = timestamp_agent.extract_key_moments(transcript_timed)
    
    # 3. Preprocess
    chunks = preprocessing_agent.chunk_transcript(transcript_raw)

    # 4. Summarize
    try:
        summary_response = summarization_agent.summarize(chunks)
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"Summarization Error: {error_msg}")
        traceback.print_exc() # Log the full traceback to terminal
        raise HTTPException(status_code=503, detail=f"LLM Error: {error_msg}")
    
    # Extract content if it's an AIMessage object (just in case)
    if hasattr(summary_response, "content"):
        summary_response = summary_response.content
    
    # Clean up JSON if necessary
    processed_response = summary_response.strip()
    try:
        # 1. Try to find JSON block in markdown
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', processed_response, re.DOTALL)
        if json_match:
            try:
                summary_data = json.loads(json_match.group(1))
            except:
                # Fallback to the whole cleaned content inside backticks
                content_inside = json_match.group(1)
                summary_data = {"summary": content_inside, "key_points": []}
        else:
            # 2. Try to find any curly brace structure
            json_match = re.search(r'(\{.*\})', processed_response, re.DOTALL)
            if json_match:
                try:
                    summary_data = json.loads(json_match.group(1))
                except:
                    summary_data = {"summary": processed_response, "key_points": []}
            else:
                # 3. Fallback to raw string
                summary_data = {"summary": processed_response, "key_points": []}
        
        # Ensure it has the required fields and they are the right types
        if not isinstance(summary_data, dict):
            summary_data = {"summary": str(summary_data), "key_points": []}
            
        if "summary" not in summary_data:
             summary_data["summary"] = processed_response
        
        if "key_points" not in summary_data or not isinstance(summary_data["key_points"], list):
            summary_data["key_points"] = []
            
    except Exception as e:
        print(f"JSON Parsing fully failed: {e}")
        summary_data = {
            "summary": summary_response,
            "key_points": []
        }

    # 5. RAG Storage
    chunk_metadatas = [{"source": video_id} for _ in chunks]
    qna_agent.generate_embeddings(chunks, chunk_metadatas, video_id)

    # 6. SQL Storage
    new_video = Video(
        id=video_id,
        url=request.url,
        summary_json=json.dumps(summary_data),
        timeline_json=json.dumps(key_moments)
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return {
        "status": "success", 
        "video_id": video_id, 
        "data": summary_data,
        "timeline": key_moments
    }

@router.post("/query")
async def query_video(request: QueryRequest):
    answer = qna_agent.query_video(request.video_id, request.query)
    # Even if QnA agent catches the error, we still want to indicate Success here unless it's a catastrophic failure
    return {"status": "success", "answer": answer}
