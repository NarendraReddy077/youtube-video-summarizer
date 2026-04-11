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
    print("\n[Workflow] 1. Fetching transcript...")
    transcript_raw = transcript_agent.get_transcript(video_id)
    if not transcript_raw or len(transcript_raw.strip()) < 5:
        raise HTTPException(status_code=400, detail="This video does not have available captions. Please try a video with manual or auto-generated subtitles.")

    print("[Workflow] 2. Extracting key moments...")
    transcript_timed = transcript_agent.get_transcript_with_timestamps(video_id)
    key_moments = timestamp_agent.extract_key_moments(transcript_timed)
    
    # 3. Preprocess
    print("[Workflow] 3. Chunking transcript for RAG...")
    chunks = preprocessing_agent.chunk_transcript(transcript_raw)

    # 4. Summarize
    print("[Workflow] 4. Generating summary with LLM...")
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
    summary_data = {"summary": processed_response, "key_points": []}
    
    # 1. Try to find JSON block in markdown
    content_inside = processed_response
    if content_inside.startswith("```"):
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', content_inside, re.DOTALL)
        if match: content_inside = match.group(1).strip()
    else:
        start = content_inside.find('{')
        end = content_inside.rfind('}')
        if start != -1 and end != -1 and end > start:
            content_inside = content_inside[start:end+1]

    try:
        data = json.loads(content_inside)
        if isinstance(data, dict):
            summary_data = data
    except:
        # Robust fallback parsing for summary and key_points if json.loads fails
        parsed_summary = ""
        parsed_points = []
        
        sum_match = re.search(r'"summary"\s*:\s*"(.*?)"\s*(?:,\s*"key_points"|}*$)', content_inside, re.DOTALL | re.IGNORECASE)
        if sum_match:
            parsed_summary = sum_match.group(1).replace('\\"', '"').replace('\\n', '\n')
        else:
            sum_match = re.search(r'"summary"\s*:\s*"(.*)', content_inside, re.DOTALL | re.IGNORECASE)
            if sum_match:
                val = sum_match.group(1)
                val = re.sub(r'",\s*"key_points"\s*:.*$', '', val, flags=re.DOTALL)
                if val.endswith('"'): val = val[:-1]
                if val.endswith('"}'): val = val[:-2]
                parsed_summary = val.replace('\\"', '"').replace('\\n', '\n')
            else:
                parsed_summary = content_inside
                
        kp_match = re.search(r'"key_points"\s*:\s*\[(.*?)\]', content_inside, re.DOTALL | re.IGNORECASE)
        if not kp_match:
            kp_match = re.search(r'"key_points"\s*:\s*\[(.*)', content_inside, re.DOTALL | re.IGNORECASE)
            
        if kp_match:
            points_str = kp_match.group(1)
            pts = re.findall(r'"(.*?)"', points_str)
            parsed_points = [p.replace('\\"', '"') for p in pts]
            
        summary_data = {"summary": parsed_summary, "key_points": parsed_points}

    if not isinstance(summary_data, dict):
        summary_data = {"summary": str(summary_data), "key_points": []}
        
    if "summary" not in summary_data:
        summary_data["summary"] = processed_response
    
    if "key_points" not in summary_data or not isinstance(summary_data["key_points"], list):
        summary_data["key_points"] = []

    # 5. RAG Storage
    print("[Workflow] 5. Storing embeddings in Vector DB...")
    chunk_metadatas = [{"source": video_id} for _ in chunks]
    qna_agent.generate_embeddings(chunks, chunk_metadatas, video_id)

    # 6. SQL Storage
    print("[Workflow] 6. Saving to SQL Database...")
    new_video = Video(
        id=video_id,
        url=request.url,
        summary_json=json.dumps(summary_data),
        timeline_json=json.dumps(key_moments)
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    print(f"[Workflow] SUCCESS: Video {video_id} processed completely.\n")

    return {
        "status": "success", 
        "video_id": video_id, 
        "data": summary_data,
        "timeline": key_moments
    }

@router.post("/query")
async def query_video(request: QueryRequest):
    print(f"\n[Workflow] Processing query for video {request.video_id}: '{request.query}'")
    answer = qna_agent.query_video(request.video_id, request.query)
    print(f"[Workflow] Query process complete.\n")
    return {"status": "success", "answer": answer}
