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
            
            IMPORTANT: If the transcript is not in English, you MUST still provide the summary and key points in English.
            
            Transcript:
            {transcript}
            
            Output STRICTLY in the following JSON format:
            {{ "summary": "concise English summary", "key_points": ["English point 1", "English point 2"] }}
            """
        )
        # Using a simpler chain for generation with a string parser
        self.chain = self.summary_prompt | self.llm | StrOutputParser()

    def summarize(self, transcript_chunks: list[str]) -> str:
        combined_text = " ".join(transcript_chunks)
        print(f"[SummarizationAgent] Generating summary for text of length: {len(combined_text)}")
        
        try:
            # Limiting to 12k characters for demo purposes, roughly 3000-4000 tokens
            response = self.chain.invoke({"transcript": combined_text[:12000]})
            print(f"[SummarizationAgent] Response received: {response[:200]}...")
            return response
        except httpx.ConnectError:
            raise Exception(f"Connection Error: Ollama is not running at {settings.ollama_base_url}. Please ensure Ollama is started.")
        except Exception as e:
            err_str = str(e)
            if "not found" in err_str.lower():
                raise Exception(f"Model '{settings.ollama_model}' not found in Ollama. Please run 'ollama pull {settings.ollama_model}'.")
            # Avoid redundant prefixing
            if "summarization error" in err_str.lower():
                raise Exception(err_str)
            raise Exception(f"Summarization Error: {err_str}")
