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
import json

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
             "data": json.loads(existing_video.summary_json)
         }

    # 2. Get Transcript
    transcript_raw = transcript_agent.get_transcript(video_id)
    if not transcript_raw:
        raise HTTPException(status_code=400, detail="Could not fetch transcript for this video")

    transcript_timed = transcript_agent.get_transcript_with_timestamps(video_id)
    _, segment_metadata = timestamp_agent.format_transcript_with_timestamps(transcript_timed)
    
    # 3. Preprocess
    chunks = preprocessing_agent.chunk_transcript(transcript_raw)

    # 4. Summarize
    # Note: We are doing a synchronous call here, which might take time
    summary_response = summarization_agent.summarize(chunks)
    
    # Clean up JSON if necessary, simplistic approach assuming LLM returns JSON as asked
    try:
        summary_data = json.loads(summary_response)
    except:
        # Fallback if Ollama didn't return strict JSON
        summary_data = {
            "summary": summary_response,
            "key_points": []
        }

    # 5. RAG Storage
    # Prepare metadata for ChromaDB
    chunk_metadatas = [{"source": video_id} for _ in chunks]
    qna_agent.generate_embeddings(chunks, chunk_metadatas, video_id)

    # 6. SQL Storage
    new_video = Video(
        id=video_id,
        url=request.url,
        summary_json=json.dumps(summary_data)
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return {
        "status": "success", 
        "video_id": video_id, 
        "data": summary_data,
        "timeline": segment_metadata
    }

@router.post("/query")
async def query_video(request: QueryRequest):
    answer = qna_agent.query_video(request.video_id, request.query)
    return {"status": "success", "answer": answer}
