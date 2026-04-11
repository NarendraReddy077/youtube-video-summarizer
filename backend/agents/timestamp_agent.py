import json
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from config import settings

class TimestampAgent:
    def __init__(self):
        headers = {}
        if settings.ollama_api_key:
            headers["Authorization"] = f"Bearer {settings.ollama_api_key}"

        self.llm = ChatOllama(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            client_kwargs={"headers": headers},
            timeout=60.0
        )
        self.timestamp_prompt = PromptTemplate.from_template(
            """You are a video editor and content analyst.
            Below is a YouTube transcript with timestamps (seconds).
            
            IMPORTANT: If the transcript is not in English, you MUST still provide the labels in English.
            Identify 5-7 key moments or sections in the video and provide a clear English subtitle/label for each marker.
            
            Transcript Data:
            {transcript_data}
            
            Output STRICTLY as a JSON array of objects:
            [ {{ "time": 0.0, "label": "Introduction" }}, {{ "time": 120.5, "label": "Deep Dive into Topic A" }} ]
            """
        )

    def extract_key_moments(self, transcript_timed: list[dict]) -> list[dict]:
        # Sample every 5th segment to give the LLM more context while staying within budget
        sampled_data = []
        for i in range(0, len(transcript_timed), 5):
            seg = transcript_timed[i]
            start = seg.get('start', 0.0) if isinstance(seg, dict) else getattr(seg, 'start', 0.0)
            text = seg.get('text', '') if isinstance(seg, dict) else getattr(seg, 'text', '')
            sampled_data.append({
                "t": round(start, 1),
                "txt": text[:100]
            })
        
        # Limit to first 100 sampled segments for better coverage
        input_data = json.dumps(sampled_data[:100])
        
        try:
             chain = self.timestamp_prompt | self.llm
             response = chain.invoke({"transcript_data": input_data})
             
             content = response.content if hasattr(response, "content") else str(response)
             print(f"[TimestampAgent] LLM Response: {content[:100]}...")

             # Robust JSON Extraction
             moments = []
             
             # 1. Try markdown code block
             import re
             code_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', content, re.DOTALL)
             if code_match:
                 try:
                     moments = json.loads(code_match.group(1))
                 except:
                     pass
             
             # 2. Try raw array match if not found or failed
             if not moments:
                 array_match = re.search(r'(\[.*\])', content, re.DOTALL)
                 if array_match:
                     try:
                         moments = json.loads(array_match.group(1))
                     except:
                         pass
             
             if moments and isinstance(moments, list):
                 print(f"[TimestampAgent] Extracted {len(moments)} key moments")
                 return moments
             
             print("[TimestampAgent] No key moments found in LLM response")
             return []
        except Exception as e:
            print(f"Timestamp Agent Error: {e}")
            return []

    def format_transcript_with_timestamps(self, transcript_list: list[dict]) -> tuple[str, list[dict]]:
        # This remains for backward compatibility in routing if needed, but we'll prioritize extract_key_moments
        formatted_text = ""
        metadata = []
        for segment in transcript_list:
            text = segment.get('text', '') if isinstance(segment, dict) else getattr(segment, 'text', '')
            start_val = segment.get('start', 0.0) if isinstance(segment, dict) else getattr(segment, 'start', 0.0)
            start = round(start_val, 2)
            formatted_text += f"{text} "
            metadata.append({"start_time": start, "source_text": text})
        return formatted_text.strip(), metadata
