# Stock Agent Frontend

A beautiful, modern Next.js frontend for the Stock Agent AI financial assistant.

## Features

- 🤖 **AI-Powered Chat Interface** - Natural language queries for stock information
- 💎 **Premium Design** - Glassmorphism, gradients, and smooth animations
- 📊 **Real-time Data** - Live stock data from Screener.in via the backend API
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast** - Built with Next.js 14 and React 18
- 🎨 **Beautiful UI** - Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

Simply type your question about any Indian stock in the chat interface:

- "Get financial data for Reliance Industries"
- "Show me TCS stock information"
- "What is the P/E ratio of HDFC Bank?"
- "Compare Infosys and Wipro"

The AI assistant will fetch real-time data from Screener.in and provide detailed financial insights.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **HTTP Client**: Axios
- **Markdown**: React Markdown with GitHub Flavored Markdown
- **Animations**: Framer Motion

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main chat interface
│   └── globals.css      # Global styles
├── lib/
│   ├── api.ts           # API utilities
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Backend Integration

This frontend connects to the FastAPI backend at `http://localhost:8000/chat`. Make sure the backend is running before using the application.

Backend endpoint:
```
POST /chat
Body: { "message": "your query here" }
Response: { "response": "AI response" }
```

## License

MIT
