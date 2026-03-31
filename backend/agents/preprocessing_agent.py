from langchain_text_splitters import RecursiveCharacterTextSplitter

class PreprocessingAgent:
    def __init__(self, chunk_size: int = 1500, chunk_overlap: int = 200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def chunk_transcript(self, transcript_text: str) -> list[str]:
        if not transcript_text:
            return []
        chunks = self.text_splitter.split_text(transcript_text)
        return chunks
