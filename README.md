# 📺 YouTube Video Summarizer Agent

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![LangChain](https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com/)
[![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.ai/)

The **YouTube Video Summarizer Agent** is an advanced, multi-agent AI system that transforms long-form YouTube videos into structured, interactive knowledge. By leveraging Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG), users can summarize content, navigate via timestamps, and directly "chat" with any video.

---

## ✨ Key Features

- 📑 **Instant Summarization**: Generate concise, high-level summaries and key insights in seconds.
- 🕒 **Timestamp Integration**: Directly jump to specific video segments based on the summary and timeline.
- 💬 **Interactive Q&A (Chat with Video)**: Ask any question about the video's content and get context-aware answers.
- 🤖 **Multi-Agent Architecture**: Modular design with specialized agents for transcripts, preprocessing, summarization, and RAG.
- 🛡️ **Privacy-First (Local LLM)**: Full support for local models via **Ollama** (e.g., Gemma2) for private and efficient processing.
- 🌍 **Multi-Language Support**: Handles various transcript types and attempts auto-translation or speech-to-text (Whisper integration).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **AI/ML Orchestration**| ![LangChain](https://img.shields.io/badge/LangChain-white?style=flat-square&logo=chainlink&logoColor=black) ![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=flat-square&logo=huggingface&logoColor=black) |
| **LLM Provider** | ![Ollama](https://img.shields.io/badge/Ollama-black?style=flat-square&logo=ollama&logoColor=white) |
| **Vector Database** | ![ChromaDB](https://img.shields.io/badge/ChromaDB-336791?style=flat-square&logo=postgresql&logoColor=white) |
| **Storage & Auth** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) |

---

## 🏗️ System Architecture

The system operates as a pipeline of specialized agents:

1.  **Input Agent**: Validates YouTube URLs and fetches metadata.
2.  **Transcript Agent**: Retrieves subtitles or generates transcripts.
3.  **Preprocessing Agent**: Semantically chunks text for LLM processing.
4.  **Summarization Agent**: Generates key points and structured summaries.
5.  **Timestamp Agent**: Maps insights back to the video timeline.
6.  **Q&A Agent (RAG)**: Uses ChromaDB and LLMs to answer player queries.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Ollama** installed and running (with `gemma2` or compatible model).
- **Supabase Account** (if using persistent storage/auth).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NarendraReddy077/youtube-video-summarizer.git
    cd youtube-video-summarizer
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Environment Variables:**
    Create a `.env` file in the `backend/` directory with:
    ```env
    SUPABASE_URL=your_url
    SUPABASE_KEY=your_key
    OLLAMA_MODEL=gemma2
    ```

---

## 🏁 Running the Application

You can use the provided batch script to launch both servers simultaneously:

```bash
# In the root directory
run.bat
```

Alternatively, launch them manually:

- **Backend**: `uvicorn main:app --reload --port 8001` (inside `backend/`)
- **Frontend**: `npm run dev` (inside `frontend/`)

Access the UI at **http://localhost:5173**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Built with ❤️ for better video learning.*
