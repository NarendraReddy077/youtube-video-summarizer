from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

class TranscriptAgent:
    @staticmethod
    def _get_transcript_data(video_id: str) -> list:
        try:
            api = YouTubeTranscriptApi()
            transcript_list = api.list(video_id)
            
            try:
                # Try English first (manual or generated)
                fetched = transcript_list.find_transcript(['en']).fetch()
            except:
                # Fallback: try to translate any available transcript to English
                fetched = None
                for trans in transcript_list:
                    if trans.is_translatable:
                        try:
                            fetched = trans.translate('en').fetch()
                            break
                        except:
                            continue
                
                # Final fallback: just get the first one available in its native language
                if not fetched:
                    all_transcripts = list(transcript_list)
                    if not all_transcripts:
                        return []
                    fetched = all_transcripts[0].fetch()
            
            if hasattr(fetched, 'to_raw_data'):
                return fetched.to_raw_data()
            else:
                # fetched is iterable of FetchedTranscriptSnippet
                return [{"start": s.start, "text": s.text, "duration": s.duration} for s in fetched]
                
        except Exception as e:
            print(f"Error listing transcripts for {video_id}: {e}")
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

