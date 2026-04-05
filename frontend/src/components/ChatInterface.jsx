import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, Sparkles, Info } from 'lucide-react';
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
      setMessages((prev) => [...prev, { text: "I encountered an error while analyzing that part of the video. Please try another question.", isBot: true, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[700px] flex flex-col glass-card rounded-[2.5rem] overflow-hidden group transition-all duration-500 border-white/10 relative animate-fade-in-up aurora-border">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.03] relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
            <MessageCircle className="text-accent" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-yellow-300 tracking-tight leading-none mb-1">Video Chat</h3>
            <p className="text-[8px] text-textMuted font-black uppercase tracking-[0.2em] opacity-60">AI Context Active</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative bg-white/[0.01]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-10">
            <div className="p-5 rounded-full bg-white/5 border border-white/10">
              <Bot size={40} className="text-textMuted" />
            </div>
            <p className="text-base font-bold text-white tracking-tight">How can I help?</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
              <div className={`group/msg relative flex flex-col gap-2 max-w-[85%] ${msg.isBot ? 'items-start' : 'items-end'}`}>
                <div className={`flex items-center gap-2 mb-0.5 px-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  <span className="text-[9px] font-black tracking-widest uppercase opacity-40">{msg.isBot ? 'AI' : 'YOU'}</span>
                </div>

                <div className={`rounded-2xl p-4 transition-all duration-300 border ${msg.isError
                  ? 'bg-red-500/15 border-red-500/30 text-red-200'
                  : msg.isBot
                    ? 'bg-white/5 border-white/10 text-textMuted rounded-tl-none font-medium'
                    : 'bg-accent/20 border-accent/30 text-white rounded-tr-none font-semibold'
                  }`}>
                  <p className="text-sm leading-relaxed tracking-tight">
                    {msg.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 rounded-tl-none flex items-center gap-4">
              <span className="flex gap-1.5 focus-within:">
                <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce"></div>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted/40">Processing...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/[0.04] border-t border-white/10 backdrop-blur-3xl">
        <div className="relative flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-accent/40 transition-all duration-300">
          <input
            type="text"
            className="flex-1 bg-transparent px-5 py-4 text-white placeholder-textMuted/40 focus:outline-none text-sm font-semibold"
            placeholder={isLoading ? "Analyzing..." : "Ask a question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!videoId || isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!videoId || !input.trim() || isLoading}
            className="mr-2 p-3 bg-accent hover:brightness-110 text-white rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)] disabled:opacity-20 transition-all duration-300"
          >
            <Send size={18} className="stroke-[2.5px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
