'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Inter } from 'next/font/google'; // Next.js Font Optimization
import {
  Send,
  Sparkles,
  Loader2,
  Shield,
  Zap,
  Terminal,
  Search,
  BarChart3,
  FileText,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Baby,
  Play,
  Square
} from 'lucide-react';

// Initialize Font
const inter = Inter({ subsets: ['latin'] });

// Message type definition
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isReport?: boolean;
}

/**
 * --- BACKEND API INTEGRATION ---
 * Calls the FastAPI backend which handles Gemini API requests securely
 */
const BACKEND_URL = "http://localhost:8001";

const callBackend = async (prompt: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "Analysis unavailable.";
  } catch (error) {
    console.error("Backend API Error:", error);
    return "I apologize, but I'm having trouble connecting to the analysis backend. Please ensure the backend server is running on port 8001.";
  }
};

// Legacy function name for compatibility
const callGemini = callBackend;

// TTS Feature temporarily disabled - requires direct API access
// To enable: implement a backend endpoint for TTS or add API key configuration
const callGeminiTTS = async (text: string) => {
  console.log("TTS feature is currently disabled. Text to read:", text.substring(0, 100));
  return null;
};

// WAV Header Helper
function getWavHeader(dataLength, sampleRate, numChannels, bitsPerSample) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  return header;
}
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * --- VISUAL COMPONENTS ---
 */

const MathBubbleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Ensure this only runs on client side
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Bubble {
      radius!: number;
      x!: number;
      y!: number;
      speed!: number;
      opacity!: number;
      color!: string;
      angle!: number;
      amplitude!: number;
      frequency!: number;
      initialX!: number;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.radius = Math.random() * 4 + 1;
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + this.radius;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.6 ? '100, 149, 237' : '147, 51, 234';

        // Math properties for Sine wave
        this.angle = Math.random() * Math.PI * 2;
        this.amplitude = Math.random() * 20 + 10;
        this.frequency = Math.random() * 0.02 + 0.01;
        this.initialX = this.x;
      }

      update() {
        this.y -= this.speed;
        // x = x0 + A * sin(frequency * y + phase)
        this.x = this.initialX + Math.sin(this.y * this.frequency + this.angle) * this.amplitude;

        if (this.y < -this.radius) {
          this.reset(false);
        }
      }

      draw() {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${this.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity + 0.2})`;
        ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particleCount = 60;
    const particles = Array.from({ length: particleCount }, () => new Bubble());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const SplitText = ({ text, className }: { text: string; className?: string }) => {
  return <h1 className={`${className} animate-in fade-in zoom-in duration-1000`}>{text}</h1>;
};

const WorkflowVis = () => {
  const steps = [
    { icon: Search, label: 'Retrieving Data' },
    { icon: BarChart3, label: 'Analyzing Trends' },
    { icon: FileText, label: 'Drafting Report' },
  ];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 py-4 overflow-hidden">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx === activeStep;
        return (
          <div key={idx} className="flex items-center gap-2 transition-all duration-300">
            <div className={`p-2 rounded-lg border transition-all duration-300 ${isActive
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
              : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}>
              <Icon className="w-4 h-4" />
            </div>
            {idx < steps.length - 1 && (
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const ReportRenderer = ({ content }: { content: string }) => {
  const cleanContent = typeof content === 'string' ? content : String(content || "");

  // Check if content is HTML (contains HTML tags)
  const isHTML = /<[a-z][\s\S]*>/i.test(cleanContent);

  if (isHTML) {
    // Render HTML content with custom styling
    return (
      <div
        className="financial-report space-y-4 font-sans text-[15px] leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    );
  }

  // Fallback: Render as Markdown (for backward compatibility)
  const parts = cleanContent.split('\n').filter((p: string) => p.trim() !== '');

  return (
    <div className="space-y-4 font-sans text-[15px] leading-relaxed text-gray-800">
      {parts.map((line, idx) => {
        if (line.startsWith('# '))
          return <h1 key={idx} className="text-xl font-bold text-black mt-4 mb-2 pb-2 border-b border-black/10">{line.replace(/^#\s+/, '')}</h1>;
        if (line.startsWith('## '))
          return <h2 key={idx} className="text-lg font-semibold text-blue-600 mt-6 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> {line.replace(/^##\s+/, '')}</h2>;
        if (line.startsWith('### '))
          return <h3 key={idx} className="text-md font-semibold text-gray-800 mt-4 mb-1">{line.replace(/^###\s+/, '')}</h3>;
        if (line.trim().startsWith('- ') || line.trim().startsWith('* '))
          return <li key={idx} className="ml-4 list-disc marker:text-gray-500 pl-1 mb-1">{line.replace(/^[-*]\s+/, '')}</li>;
        if (line.match(/^\d\./))
          return <div key={idx} className="ml-4 mb-1 flex gap-2"><span className="text-blue-500 font-mono">{line.split('.')[0]}.</span> <span>{line.split('.').slice(1).join('.')}</span></div>;

        const boldParts = line.split('**');
        if (boldParts.length > 1) {
          return (
            <p key={idx} className="min-h-[1em]">
              {boldParts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-black font-semibold">{part}</strong> : part))}
            </p>
          );
        }
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
};

const FinancialReportCard = ({ title, content, onAction }: {
  title: string;
  content: string;
  onAction: (type: string, content: string) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleTTS = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const textToRead = content.replace(/[#*]/g, '');
    const audio = await callGeminiTTS(`Read this financial report professionally: ${textToRead.substring(0, 600)}...`);
    if (audio) {
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-100 transition-all duration-500 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-medium text-gray-900 text-sm tracking-wide">{title}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTTS}
            className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
            title="Read Report"
          >
            {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <ReportRenderer content={content} />
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mr-auto">AI Actions</span>

        <button
          onClick={() => onAction('eli5', content)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 hover:bg-blue-500/20 transition-all"
        >
          <Baby className="w-3 h-3" />
          <span>Explain Simply</span>
        </button>

        <button
          onClick={() => onAction('bull', content)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-300 hover:bg-green-500/20 transition-all"
        >
          <TrendingUp className="w-3 h-3" />
          <span>Bull Case</span>
        </button>

        <button
          onClick={() => onAction('bear', content)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 hover:bg-red-500/20 transition-all"
        >
          <TrendingDown className="w-3 h-3" />
          <span>Bear Case</span>
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAction = async (type, content) => {
    if (isLoading) return;
    setIsLoading(true);

    let prompt = "";
    let label = "";

    switch (type) {
      case 'eli5':
        label = "Explain Like I'm 5";
        prompt = `Explain the following financial report to me like I am a 5 year old. Use simple analogies. Keep it short.\n\nReport:\n${content}`;
        break;
      case 'bull':
        label = "Bull Case";
        prompt = `Based on the following report, act as a chaotic optimist and give me the absolute best-case scenario "Bull Case" for this stock. Be concise.\n\nReport:\n${content}`;
        break;
      case 'bear':
        label = "Bear Case";
        prompt = `Based on the following report, act as a pessimistic skeptic and give me the "Bear Case" risks for this stock. Be concise.\n\nReport:\n${content}`;
        break;
      default:
        return;
    }

    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, {
      id: userMsgId,
      role: 'user',
      content: `✨ ${label}`,
      timestamp: new Date(),
    }]);

    try {
      const text = await callGemini(prompt);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        isReport: false
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const userMessage = {
      id: userMsgId,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `
        You are an elite Wall Street financial analyst agent. 
        Analyze the following request: "${currentInput}".
        
        If the user asks for a specific stock (like AAPL, NVDA, BTC), provide a "Strategic Analysis Report" in Markdown format.
        Include these sections (use ## for headers):
        1. **Market Sentiment & Outlook**: Quick summary of how the market feels about this asset.
        2. **Technical Deep Dive**: Mention RSI, Moving Averages, or Volume if relevant (invent plausible data for the demo if you don't have real-time access, but make it sound professional).
        3. **Key Risks**: What could go wrong?
        4. **AI Prediction**: A probabilistic prediction for the next 14 days.
        
        If the user asks a general question, answer it concisely but professionally.
      `;

      const responseText = await callGemini(prompt);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        isReport: responseText.includes('##')
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error connecting to the AI models. Please try again.',
        timestamp: new Date(),
        isReport: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen bg-white text-gray-900 font-sans overflow-hidden selection:bg-blue-200 ${inter.className}`}>
      {/* <MathBubbleBackground /> */}

      <main className="flex-1 flex flex-col relative z-10 max-w-3xl mx-auto w-full h-full">
        {/* Header */}
        <div className="pt-8 pb-4 flex items-center justify-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-default">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group">
            <Zap className="w-5 h-5 text-white fill-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Stock Agent <span className="text-xs font-normal text-blue-600 align-top ml-1">AI</span>
          </span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-0 pb-4 custom-scrollbar scroll-smooth">
          <div className="space-y-8 py-8">
            {messages.length === 0 ? (
              <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-6 max-w-md flex flex-col items-center">
                  <SplitText
                    text="Market Intelligence"
                    className="text-5xl font-bold text-gray-900 tracking-tight"
                  />
                  <WorkflowVis />
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <p className="text-gray-600 font-light leading-relaxed text-lg">
                      Powered by <strong>Gemini 2.5 Flash</strong>. Real-time generation, TTS, and strategic analysis.
                      <span className="block text-sm text-blue-500 font-medium mt-1">Thinking with Gemini...</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {[
                    'AAPL Q4 Outlook',
                    'Bitcoin Risks',
                    'NVDA vs AMD',
                    'Gold Price Analysis'
                  ].map((query, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(query);
                        setTimeout(() => document.getElementById('submit-btn')?.click(), 0);
                      }}
                      className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:border-blue-500 text-sm text-gray-700 hover:text-gray-900 transition-all hover: scale-105 active:scale-95"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                  >
                    <div className="flex items-center gap-2 px-1 opacity-50">
                      <span className="text-[10px] font-semibold tracking-wider uppercase">
                        {message.role === 'user' ? 'You' : 'Agent'}
                      </span>
                    </div>

                    {message.isReport ? (
                      <div className="w-full pl-0 md:pl-4">
                        <FinancialReportCard
                          title="Strategic Analysis"
                          content={message.content}
                          onAction={handleAction}
                        />
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] rounded-2xl px-6 py-4 text-[15px] leading-relaxed shadow-lg ${message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                      >
                        <ReportRenderer content={message.content} />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex flex-col items-start gap-3 pl-0 md:pl-4 animate-in fade-in w-full">
                    <div className="flex items-center gap-2 px-1 opacity-50">
                      <span className="text-[10px] font-semibold tracking-wider uppercase">Agent Workflow</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-6 w-full md:w-auto shadow-lg">
                      <WorkflowVis />
                      <div className="flex items-center gap-3 mt-4 text-xs text-gray-500 border-t border-white/5 pt-3">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                        Thinking with Gemini...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 pt-0 z-20">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2 p-2 bg-white/95 backdrop-blur-xl rounded-full border border-gray-300 shadow-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all group"
          >
            <div className="pl-4 pr-2">
              <Terminal className="w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any asset..."
              className="flex-1 bg-transparent border-none outline-none py-3 text-gray-900 placeholder:text-gray-500 text-[15px]"
            />
            <button
              id="submit-btn"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-gray-600 font-medium">Analysis generated by Gemini 2.5 Flash. Verify all financial data.</span>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation-fill-mode: forwards;
        }
        
        /* Financial Report HTML Styling */
        .financial-report h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #000000;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .financial-report h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2563eb;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .financial-report h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1rem;
          margin-bottom: 0.25rem;
        }
        .financial-report p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
          color: #374151;
        }
        .financial-report ul {
          margin-left: 1rem;
          margin-bottom: 0.75rem;
          list-style-type: disc;
        }
        .financial-report li {
          margin-bottom: 0.25rem;
          padding-left: 0.25rem;
          color: #1f2937;
        }
        .financial-report li::marker {
          color: #6b7280;
        }
        .financial-report strong {
          color: #000000;
          font-weight: 600;
        }
        .financial-report em {
          color: #2563eb;
          font-style: italic;
        }
        .financial-report code {
          background: rgba(0, 0, 0, 0.05);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
          color: #1f2937;
        }
      `}</style>
    </div>
  );
}