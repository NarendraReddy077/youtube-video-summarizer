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
    <div className="w-full h-full min-h-[600px] flex flex-col glass-card rounded-[2rem] overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-white/5 relative bg-surface/30 backdrop-blur-3xl animate-fade-in-up">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20">
            <MessageCircle className="text-secondary" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Chat with Video</h3>
            <p className="text-xs text-textMuted font-bold uppercase tracking-widest opacity-60">AI Assistant Active</p>
          </div>
        </div>
        <div className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40">
           <Sparkles size={18} />
        </div>
        {/* Header background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16" />
      </div>
      
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40 py-20 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="p-6 rounded-full bg-white/5 border border-white/10 animate-bounce-slow">
              <Bot size={48} className="text-textMuted" />
            </div>
            <div className="space-y-2">
               <p className="text-xl font-medium text-white">The video is processed.</p>
               <p className="text-textMuted max-w-xs mx-auto">Ask me anything about the content, specific moments, or key concepts.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
              <div className={`group/msg relative flex flex-col gap-2 max-w-[85%] ${msg.isBot ? 'items-start' : 'items-end'}`}>
                 <div className={`flex items-center gap-2 mb-1 px-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`p-1.5 rounded-lg border border-white/10 ${msg.isBot ? 'bg-white/5' : 'bg-primary/20 text-primary'}`}>
                       {msg.isBot ? <Bot size={14} /> : <User size={14} />}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">{msg.isBot ? 'Assistant' : 'You'}</span>
                 </div>
                 
                 <div className={`rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${
                    msg.isError 
                      ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm' 
                      : msg.isBot 
                        ? 'bg-white/5 border border-white/5 text-textMuted rounded-tl-sm hover:bg-white/[0.08] hover:border-white/10' 
                        : 'premium-gradient text-white rounded-tr-sm shadow-[0_10px_30px_rgba(139,92,246,0.3)]'
                  }`}>
                    {/* User bubble internal shine */}
                    {!msg.isBot && <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />}
                    
                    <p className="text-[17px] leading-relaxed relative z-10 whitespace-pre-wrap font-light">
                      {msg.text}
                    </p>
                 </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 rounded-tl-sm flex items-center gap-3">
              <span className="flex gap-1.5">
                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-textMuted/60 ml-2">Analysing video...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 pt-4 bg-white/[0.01] border-t border-white/5 backdrop-blur-xl">
        <div className="relative group/input">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-700" />
          <div className="relative flex items-center bg-surface/50 rounded-2xl border border-white/10 focus-within:border-primary/50 transition-all duration-300 overflow-hidden">
            <input
              type="text"
              className="flex-1 bg-transparent px-8 py-5 text-white placeholder-textMuted/50 focus:outline-none text-lg font-light"
              placeholder={isLoading ? "Please wait..." : "Ask me anything about the content..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!videoId || isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!videoId || !input.trim() || isLoading}
              className="mr-3 p-4 premium-gradient text-white rounded-xl shadow-xl hover:shadow-primary/50 disabled:opacity-30 disabled:grayscale transition-all duration-500 active:scale-95 flex items-center justify-center transform focus:outline-none group/btn"
            >
              <Send size={22} className={`${isLoading ? "animate-pulse" : "group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"} transition-transform duration-300`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
