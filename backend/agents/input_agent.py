import re

class InputAgent:
    @staticmethod
    def validate_youtube_url(url: str) -> bool:
        youtube_regex = (
            r'(https?://)?(www\.)?'
            r'(youtube|youtu|youtube-nocookie)\.(com|be)/'
            r'(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
        )
        match = re.match(youtube_regex, url)
        return bool(match)

    @staticmethod
    def extract_video_id(url: str) -> str:
        youtube_regex = (
            r'(https?://)?(www\.)?'
            r'(youtube|youtu|youtube-nocookie)\.(com|be)/'
            r'(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
        )
        match = re.match(youtube_regex, url)
        if match:
            return match.group(6)
        return ""
