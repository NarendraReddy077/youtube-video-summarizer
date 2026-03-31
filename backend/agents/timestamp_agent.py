class TimestampAgent:
    def format_transcript_with_timestamps(self, transcript_list: list[dict]) -> tuple[str, list[dict]]:
        # Returns a combined string for summarization / embedding
        # and a list of segment metadata (start time, text segment)
        formatted_text = ""
        metadata = []
        for segment in transcript_list:
            text = segment.get('text', '')
            start = round(segment.get('start', 0.0), 2)
            formatted_text += f"{text} "
            metadata.append({"start_time": start, "source_text": text})
        return formatted_text.strip(), metadata
