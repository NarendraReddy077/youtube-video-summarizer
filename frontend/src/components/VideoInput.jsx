import React, { useState } from 'react';
import { Search, ArrowRight, Loader, Video } from 'lucide-react';

export default function VideoInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="glass-card rounded-3xl p-2 md:p-3 relative overflow-hidden group transition-all duration-700 hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)]">
        {/* Subtle internal glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
        
        <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row items-center gap-3 bg-surface/40 p-4 md:p-6 rounded-[calc(1.5rem-2px)]">
          <div className="flex items-center gap-4 flex-1 w-full">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-focus-within:border-primary/50 group-focus-within:text-primary transition-all duration-500">
              <Video size={28} />
            </div>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any YouTube video link here..." 
              className="flex-1 bg-transparent text-white placeholder-textMuted/60 text-xl md:text-2xl font-light focus:outline-none transition-all duration-300 min-w-0"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="w-full md:w-auto premium-gradient text-white font-semibold text-lg py-4 px-10 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-500 transform active:scale-95 group/btn"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" size={24} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Summarize</span>
                <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Search Hints/Sub-info */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-textMuted/60 font-medium tracking-wide animate-fade-in-up [animation-delay:200ms]">
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Analysis
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Instant Extraction
         </div>
         <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Interactive Chat
         </div>
      </div>
    </div>
  );
}
