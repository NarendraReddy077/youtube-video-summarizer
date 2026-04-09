import httpx
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.schema import Document
from config import settings

class QnAAgent:
    def __init__(self):
        # We'll use SentenceTransformers via LangChain HuggingFace for embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        # Set up headers for authentication if API key is provided
        headers = {}
        if settings.ollama_api_key:
            headers["Authorization"] = f"Bearer {settings.ollama_api_key}"

        self.llm = ChatOllama(
            model=settings.ollama_model, 
            base_url=settings.ollama_base_url,
            client_kwargs={"headers": headers},
            timeout=60.0 # Increased timeout
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
        try:
            vectorstore = Chroma(
                persist_directory=persist_directory,
                embedding_function=self.embeddings
            )
        except Exception:
            return "No vector data found for this video. Please process it first."
            
        # Check if empty
        if not vectorstore.get()['documents']:
            return "No vector data found for this video. Please process it first."
            
        retriever = vectorstore.as_retriever()
        
        # Define the Q&A prompt using the classic approach
        system_prompt = (
            "You are an AI assistant that answers questions based on a video transcript context. "
            "Use the provided context to answer the question concisely. "
            "If the context doesn't contain the answer, say you don't know. "
            "Context:\n{context}"
        )
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}"),
            ]
        )
        try:
            retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
            docs = retriever.invoke(query)
            print(f"Retrieved {len(docs)} documents for query: {query}")
            
            # Fallback: if no docs found, try to get anything from the store
            if not docs:
                all_docs = vectorstore.get()
                if all_docs['documents']:
                   docs = [Document(page_content=d) for d in all_docs['documents'][:5]]
                   print(f"Fallback: Using {len(docs)} non-searched documents as context.")

            # Create the classic chain
            question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
            rag_chain = create_retrieval_chain(retriever, question_answer_chain)
            
            # Invoke the chain with manual injection if fallback was used
            if docs:
                # We use a custom call if we have documents manually retrieved
                # But to keep it simple, we'll just use the rag_chain if possible
                response = rag_chain.invoke({"input": query})
                answer = response.get("answer", "")
                
                # Ensure answer is a string (handle AIMessage if necessary)
                final_answer = ""
                if hasattr(answer, "content"):
                    final_answer = answer.content
                else:
                    final_answer = str(answer) if answer else "Could not generate an answer."
                
                print(f"[QnAAgent] Answer generated: {final_answer[:150]}...")
                return final_answer
            else:
                print("[QnAAgent] No context found to answer.")
                return "The transcript for this video seems too short or empty. I cannot find enough context to answer."
        except httpx.ConnectError:
            return f"Ollama Connection Error: Please ensure Ollama is running at {settings.ollama_base_url}."
        except Exception as e:
            if "not found" in str(e).lower():
                return f"Ollama Model Error: Please pull the model '{settings.ollama_model}' by running 'ollama pull {settings.ollama_model}'."
            return f"Query Error: {str(e)}"

