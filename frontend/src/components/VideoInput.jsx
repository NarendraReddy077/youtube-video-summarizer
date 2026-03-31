import React, { useState } from 'react';
import { Youtube, Search, ArrowRight, Loader } from 'lucide-react';

export default function VideoInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-3xl p-8 transform transition-all duration-500 hover:scale-[1.01]">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl mb-6 shadow-lg shadow-primary/30">
          <Youtube className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-center tracking-tight mb-4">
          YouTube Intelligence
        </h1>
        <p className="text-textMuted text-lg text-center max-w-xl font-light">
          Unlock the critical insights of any video instantly. Paste a URL below to generate summaries and chat directly with the content.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-textMuted group-focus-within:text-primary transition-colors" size={24} />
        </div>
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube Video URL here..." 
          className="w-full bg-surface/50 text-textMain placeholder-textMuted/70 text-lg rounded-2xl py-5 pl-16 pr-20 border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl px-4 flex items-center justify-center hover:shadow-lg hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : <ArrowRight size={24} />}
        </button>
      </form>
    </div>
  );
}
