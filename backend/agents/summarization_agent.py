import os
import httpx
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import settings

class SummarizationAgent:
    def __init__(self):
        # Set up headers for authentication if API key is provided
        headers = {}
        if settings.ollama_api_key:
            headers["Authorization"] = f"Bearer {settings.ollama_api_key}"

        self.llm = ChatOllama(
            model=settings.ollama_model, 
            base_url=settings.ollama_base_url,
            client_kwargs={"headers": headers},
            timeout=60.0 # Increased timeout for longer videos/slower local LLMs
        )
        self.summary_prompt = PromptTemplate.from_template(
            """You are an expert summarizer. Below is a video transcript.
            Please provide a concise summary and extract key insights as bullet points.
            
            Transcript:
            {transcript}
            
            Output STRICTLY in the following JSON format:
            {{ "summary": "brief summary content", "key_points": ["point 1", "point 2"] }}
            """
        )
        # Using a simpler chain for generation with a string parser
        self.chain = self.summary_prompt | self.llm | StrOutputParser()

    def summarize(self, transcript_chunks: list[str]) -> str:
        combined_text = " ".join(transcript_chunks)
        print(f"Generating summary for text of length: {len(combined_text)}")
        
        try:
            # We might need to handle token overflow here if the video is too long.
            # Limiting to 10k characters for demo purposes
            response = self.chain.invoke({"transcript": combined_text[:10000]})
            return response
        except httpx.ConnectError:
            raise Exception(f"Connection Error: Ollama is not running at {settings.ollama_base_url}. Please ensure Ollama is started.")
        except Exception as e:
            if "not found" in str(e).lower():
                raise Exception(f"Model Error: Model '{settings.ollama_model}' not found in Ollama. Please run 'ollama pull {settings.ollama_model}'.")
            raise Exception(f"Summarization Error: {str(e)}")
