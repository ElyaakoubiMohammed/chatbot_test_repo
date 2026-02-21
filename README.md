# 🤖 AI Conversational Assistant — LLM-Powered Chatbot

A prototype of an intelligent conversational agent built with **Next.js**, **Python**, and **Ollama**. This project served as the foundation for a production chatbot deployed at LPEE (Laboratoire Public d'Essais et d'Études), integrated with SharePoint for internal document querying.

---

## ✨ Features

- 💬 **Conversational AI** — Natural language interaction powered by a local LLM via Ollama
- 🔐 **JWT Authentication** — Secure user authentication and role-based access control
- 💾 **Conversation Persistence** — Full conversation history saved and retrievable per user
- 📄 **Multi-file Document Search** — Query across multiple internal documents in natural language
- 🖼️ **Image Analysis** — LLM-powered image understanding capabilities
- 🔗 **REST API Backend** — Secure Python API handling all AI interactions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, TypeScript, React |
| Backend | Python, Flask |
| AI / LLM | Ollama (local LLM inference) |
| Auth | JWT (JSON Web Tokens) |
| Styling | Tailwind CSS, shadcn/ui |

---

## 📁 Project Structure

```
chatbot/
├── app/                  # Next.js app router pages
├── components/           # Reusable UI components
├── lib/                  # Utility functions
├── public/               # Static assets
├── styles/               # Global styles
├── app.py                # Python Flask backend
├── requirements.txt      # Python dependencies
└── next.config.mjs       # Next.js configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Ollama](https://ollama.ai/) installed and running locally
- pnpm

### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the Python backend
python app.py
```

### Frontend Setup

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Then open your browser at `http://localhost:3000`

---

## 🧠 How It Works

1. User sends a message through the chat interface
2. The Next.js frontend sends the request to the Python REST API
3. The API authenticates the user via JWT and checks role permissions
4. The request is forwarded to the local LLM (via Ollama) for processing
5. The LLM response is returned, and the conversation is persisted
6. The response is displayed in the chat interface

---

## 👨‍💻 Author

**Mohammed Elyaakoubi**  
---

## 📄 License

This project is a prototype developed for research and educational purposes.
