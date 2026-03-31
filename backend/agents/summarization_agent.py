import os
from langchain_community.llms.ollama import Ollama
from langchain_core.prompts import PromptTemplate
from config import settings

class SummarizationAgent:
    def __init__(self):
        self.llm = Ollama(
            model=settings.ollama_model, 
            base_url=settings.ollama_base_url
        )
        self.summary_prompt = PromptTemplate.from_template(
            """You are an expert transcriber and summarizer. You will be given a transcript of a YouTube video.
            Please provide a comprehensive summary and extract the key insights as bullet points.
            
            Transcript:
            {transcript}
            
            Output strictly in the following JSON-like format:
            {{ "summary": "...", "key_points": ["point 1", "point 2"] }}
            """
        )
        # Using a simpler chain for generation
        self.chain = self.summary_prompt | self.llm

    def summarize(self, transcript_chunks: list[str]) -> str:
        # Combining chunks here (could also use Langchain summarize chains like map_reduce, but for simplicity we join them if they fit)
        # A full system might want Map-Reduce for very long transcripts. 
        # For simplicity in this step, we'll try to join and summarize.
        combined_text = " ".join(transcript_chunks)
        # We might need to handle token overflow here if the video is too long.
        print(f"Generating summary for text of length: {len(combined_text)}")
        return self.chain.invoke({"transcript": combined_text[:10000]}) # Arbitrary cut-off to fit in context window temporarily
