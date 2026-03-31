from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms.ollama import Ollama
from langchain.chains import RetrievalQA
from config import settings

class QnAAgent:
    def __init__(self):
        # We'll use SentenceTransformers for embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.llm = Ollama(
            model=settings.ollama_model, 
            base_url=settings.ollama_base_url
        )

    def generate_embeddings(self, chunks: list[str], chunk_metadatas: list[dict], video_id: str):
        # Store embeddings specifically for a video
        persist_directory = f"{settings.chromadb_dir}/{video_id}"
        vectorstore = Chroma.from_texts(
            texts=chunks,
            embedding=self.embeddings,
            metadatas=chunk_metadatas,
            persist_directory=persist_directory
        )
        return vectorstore

    def query_video(self, video_id: str, query: str) -> str:
        persist_directory = f"{settings.chromadb_dir}/{video_id}"
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=self.embeddings
        )
        # Check if empty
        if not vectorstore.get()['documents']:
            return "No vector data found for this video. Please process it first."
            
        retriever = vectorstore.as_retriever()
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever
        )
        response = qa_chain.invoke(query)
        return response.get('result', "No result matching the query.")
