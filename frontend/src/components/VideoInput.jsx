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
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <div className="relative group p-[2px] rounded-[3rem] transition-all duration-1000 bg-gradient-to-tr from-primary/20 via-secondary/20 to-accent/20 hover:from-primary/60 hover:via-secondary/60 hover:to-accent/60">
        <div className="bg-background/80 backdrop-blur-3xl rounded-[calc(3rem-2px)] p-3 md:p-4 overflow-hidden relative">
          {/* Subtle inner sweep animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row items-center gap-4 bg-surface/40 p-4 md:p-8 rounded-[2.2rem] aurora-border">
            <div className="flex items-center gap-5 flex-1 w-full pl-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-focus-within:border-primary group-focus-within:text-primary transition-all duration-500 transform group-focus-within:scale-110">
                <Video size={30} className="stroke-[1.5px]" />
              </div>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Drop a YouTube link to begin the magic..." 
                className="flex-1 bg-transparent text-white placeholder-textMuted text-xl md:text-3xl font-bold tracking-tight focus:outline-none transition-all duration-300 min-w-0"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="w-full md:w-auto premium-gradient text-white font-bold text-xl py-5 px-14 rounded-2xl flex items-center justify-center gap-4 shadow-2xl hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 transform active:scale-95 group/btn"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin text-white" size={28} />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Summarize</span>
                  <ArrowRight size={28} className="group-hover/btn:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Search Hints/Sub-info */}
      <div className="flex flex-wrap justify-center gap-10 mt-12 text-md text-textMuted font-bold uppercase tracking-widest animate-fade-in-up [animation-delay:300ms]">
         <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
            AI Synthesis
         </div>
         <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
            Semantic Engine
         </div>
         <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
            Context Aware
         </div>
      </div>
    </div>
  );
}
