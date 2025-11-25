# Stock Agent Application

This application consists of a FastAPI backend and a Next.js frontend.

## Prerequisites

- Python 3.8+
- Node.js 18+
- Google Gemini API Key

## Setup & Running

### 1. Backend (FastAPI)

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the server:
```bash
python main.py
```
The backend will run on `http://localhost:8000`.

### 2. Frontend (Next.js)

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`.

## Usage

Open `http://localhost:3000` in your browser. You can now chat with the financial assistant.
Example query: "What is the market cap of Reliance?"
