import React from 'react';
import { Sparkles, List, FileText } from 'lucide-react';

export default function SummaryView({ data }) {
  if (!data) return null;

  return (
    <div className="w-full glass-panel rounded-3xl p-8 space-y-10 animate-fade-in-up mt-12 bg-surface/40">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-white/10">
        <div className="bg-primary/20 p-3 rounded-xl border border-primary/30 shadow-inner">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted tracking-tight">AI Generated Summary</h2>
      </div>

      {/* Main Summary Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3">
          <FileText className="text-secondary" size={24} />
          <h3 className="text-2xl font-semibold text-white/90">Abstract</h3>
        </div>
        <p className="text-lg text-textMuted leading-relaxed pl-9">
          {data.summary || "No summary available."}
        </p>
      </div>

      {/* Key Insights Section */}
      <div className="space-y-4 bg-black/20 p-6 rounded-2xl border border-white/5 mx-2 shadow-inner">
        <div className="flex items-center gap-3 mb-6">
          <List className="text-primary" size={24} />
          <h3 className="text-2xl font-semibold text-white/90">Key Insights</h3>
        </div>
        
        {data.key_points && data.key_points.length > 0 ? (
          <ul className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 pl-4">
            {data.key_points.map((point, idx) => (
              <li key={idx} className="flex gap-4 group">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex flex-col items-center justify-center border border-primary/40 text-primary font-bold shadow-lg group-hover:bg-primary group-hover:text-white transition-all">
                  {idx + 1}
                </span>
                <span className="text-textMuted text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-textMuted pl-9 italic">No key points extracted.</p>
        )}
      </div>
    </div>
  );
}
