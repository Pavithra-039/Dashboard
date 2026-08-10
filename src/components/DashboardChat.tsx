import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, X, Minimize2, ChevronRight, CornerDownLeft } from 'lucide-react';
import { Dataset, DashboardConfig } from '../types';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface DashboardChatProps {
  dataset: Dataset;
  currentDashboard: DashboardConfig;
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardChat({
  dataset,
  currentDashboard,
  isOpen,
  onClose
}: DashboardChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Data Analyst Co-pilot. I have scanned the schema for **"${dataset.name}"**. 

Ask me any business analytical question about your metrics! For example:
- *What is the average performance across columns?*
- *Highlight any anomalies in our trends.*
- *Identify our most profitable categorical divisions.*`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userQuery = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userQuery, timestamp: new Date() }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          schema: dataset.schema,
          sampleRows: dataset.rows.slice(0, 10),
          currentDashboard
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: data.answer || "I encountered an error querying the model. Please check the schema formatting.", 
        timestamp: new Date() 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "My communication layer is experiencing latency. Please try again in a moment.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div id="ai-chat-sidebar" className="w-80 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-40 shrink-0 no-print animate-in slide-in-from-right duration-200">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-xs text-white leading-none">AI Data Co-Pilot</h3>
            <span className="text-[9px] text-indigo-300 font-mono">GPT/Gemini Intelligence</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex gap-2.5 items-start ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 uppercase ${
              msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
            }`}>
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>
              <span className={`text-[8px] mt-1.5 block text-right ${
                msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-6.5 h-6.5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Inputs */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Query your database..."
            className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 disabled:opacity-40 disabled:hover:bg-slate-900 transition duration-150 shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-[10px] text-slate-400 text-center mt-1.5 font-mono">
          Dynamic state syncing is active
        </div>
      </form>
    </div>
  );
}
