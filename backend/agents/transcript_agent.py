from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

class TranscriptAgent:
    @staticmethod
    def get_transcript(video_id: str) -> str:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            formatter = TextFormatter()
            return formatter.format_transcript(transcript)
        except Exception as e:
            print(f"Error fetching transcript: {e}")
            return ""

    @staticmethod
    def get_transcript_with_timestamps(video_id: str) -> list:
        try:
            return YouTubeTranscriptApi.get_transcript(video_id)
        except Exception as e:
            print(f"Error fetching timed transcript: {e}")
            return []
