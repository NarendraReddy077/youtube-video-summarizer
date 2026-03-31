import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle } from 'lucide-react';
import { queryVideo } from '../services/api';

export default function ChatInterface({ videoId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !videoId) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await queryVideo(videoId, userMessage.text);
      const botMessage = { text: resp.answer, isBot: true };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { text: "Failed to fetch response.", isBot: true, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[600px] flex flex-col glass-panel rounded-3xl mt-12 overflow-hidden bg-surface/80 shadow-2xl border-white/5 relative">
      <div className="bg-gradient-to-r from-surface to-surface/40 p-6 flex items-center gap-4 border-b border-white/5 shadow-sm">
        <MessageCircle className="text-secondary" size={28} />
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted tracking-tight">Chat with Video</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-surface scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
            <div className={`max-w-[75%] rounded-2xl p-5 flex gap-4 ${msg.isBot ? 'bg-black/30 border border-white/5 text-textMuted rounded-bl-sm shadow-md' : 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-br-sm shadow-lg'}`}>
              <div className="flex-shrink-0 mt-1">
                {msg.isBot ? <Bot size={20} className="text-secondary" /> : <User size={20} />}
              </div>
              <p className="text-[17px] leading-relaxed break-words whitespace-pre-wrap">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 rounded-bl-sm">
              <span className="flex space-x-2">
                <span className="animate-bounce. delay-75 w-2 h-2 bg-textMuted rounded-full"></span>
                <span className="animate-bounce delay-150 w-2 h-2 bg-textMuted rounded-full"></span>
                <span className="animate-bounce delay-300 w-2 h-2 bg-textMuted rounded-full"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-6 bg-surface/50 border-t border-white/5 backdrop-blur-md">
        <div className="relative flex items-center bg-black/40 rounded-full border border-white/10 focus-within:border-secondary/50 focus-within:ring-2 ring-secondary/20 transition-all p-2 pr-3">
          <input
            type="text"
            className="flex-1 bg-transparent px-6 py-3 text-white placeholder-textMuted focus:outline-none text-lg"
            placeholder="Ask anything about the video..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!videoId || isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!videoId || !input.trim() || isLoading}
            className="p-3 bg-secondary text-white rounded-full hover:shadow-lg hover:shadow-secondary/40 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center transform focus:outline-none"
          >
            <Send size={20} className={isLoading ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
