from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

class TranscriptAgent:
    @staticmethod
    def _get_transcript_data(video_id: str) -> list:
        try:
            api = YouTubeTranscriptApi()
            transcript_list = api.list(video_id)
            
            fetched = None
            
            # 1. Try to find English transcripts (manual OR generated)
            try:
                fetched = transcript_list.find_transcript(['en']).fetch()
            except:
                # 2. Try to translate ANY existing transcript to English
                for trans in transcript_list:
                    if trans.is_translatable:
                        try:
                            fetched = trans.translate('en').fetch()
                            break
                        except:
                            continue
                
                # 3. Final fallback: just get the first one available in its native language
                if not fetched:
                    all_transcripts = list(transcript_list)
                    if all_transcripts:
                        fetched = all_transcripts[0].fetch()
            
            if not fetched:
                return []
                
            # Consistent data normalization: ensure it's a list of dicts
            normalized = []
            for s in fetched:
                if isinstance(s, dict):
                    normalized.append({
                        "start": s.get('start', 0.0),
                        "text": s.get('text', ''),
                        "duration": s.get('duration', 0.0)
                    })
                else:
                    normalized.append({
                        "start": getattr(s, 'start', 0.0),
                        "text": getattr(s, 'text', ''),
                        "duration": getattr(s, 'duration', 0.0)
                    })
            return normalized
                
        except Exception as e:
            print(f"Transcript Error for {video_id}: {e}")
            return []

    @staticmethod
    def get_transcript(video_id: str) -> str:
        data = TranscriptAgent._get_transcript_data(video_id)
        if not data:
            return ""
        
        try:
            # Try standard formatter
            formatter = TextFormatter()
            return formatter.format_transcript(data)
        except Exception as e:
            # Manual fallback formatting if TextFormatter fails or data structure is unexpected
            if isinstance(data, list):
                return " ".join([seg.get('text', '') if isinstance(seg, dict) else getattr(seg, 'text', '') for seg in data])
            return str(data)

    @staticmethod
    def get_transcript_with_timestamps(video_id: str) -> list:
        return TranscriptAgent._get_transcript_data(video_id)

