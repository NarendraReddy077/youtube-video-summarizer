from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

class TranscriptAgent:
    @staticmethod
    def _get_best_transcript(video_id: str):
        """
        Helper to find the best available transcript for a video.
        Prioritizes:
        1. Manually created English
        2. Auto-generated English
        3. Manually created in any language (translated to English)
        4. Auto-generated in any language (translated to English)
        """
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # 1 & 2: Try to find English naturally
            try:
                return transcript_list.find_transcript(['en'])
            except:
                pass
            
            # 3 & 4: Find first available and translate to English
            # youtube-transcript-api handles translation for most languages including auto-generated ones
            try:
                # Get the first available transcript (any language)
                transcript = next(iter(transcript_list))
                return transcript.translate('en')
            except Exception as e:
                print(f"Translation/Fallback failed: {e}")
                return None
                
        except Exception as e:
            print(f"Error accessing transcript list: {e}")
            return None

    @staticmethod
    def get_transcript(video_id: str) -> str:
        transcript_obj = TranscriptAgent._get_best_transcript(video_id)
        if not transcript_obj:
            return ""
        
        try:
            transcript = transcript_obj.fetch()
            formatter = TextFormatter()
            return formatter.format_transcript(transcript)
        except Exception as e:
            print(f"Error formatting transcript: {e}")
            return ""

    @staticmethod
    def get_transcript_with_timestamps(video_id: str) -> list:
        transcript_obj = TranscriptAgent._get_best_transcript(video_id)
        if not transcript_obj:
            return []
        
        try:
            # fetch() returns a list of dictionaries with 'text', 'start', 'duration'
            return transcript_obj.fetch()
        except Exception as e:
            print(f"Error fetching timed transcript: {e}")
            return []
