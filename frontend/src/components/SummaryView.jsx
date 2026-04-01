import React from 'react';
import { Sparkles, List, Clock, PlayCircle, Zap } from 'lucide-react';

export default function SummaryView({ data, timeline, videoId }) {
  if (!data) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeClick = (time) => {
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(time)}s`, '_blank');
    }
  };

  return (
    <div className="w-full h-full space-y-10 animate-fade-in-up">
      <div className="glass-card rounded-[2.5rem] p-8 md:p-14 overflow-hidden relative group h-full bg-surface/20">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-colors duration-1000 group-hover:bg-primary/10 pointer-events-none" />
        
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="premium-gradient p-5 rounded-[2rem] shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">Video Intelligence</h2>
              <p className="text-textMuted font-medium tracking-widest text-xs uppercase opacity-50 mt-1">Gemma 3 Powered Analysis</p>
            </div>
          </div>
          {timeline && timeline.length > 0 && (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-primary tracking-[0.2em] uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1" />
              Timeline Active
            </div>
          )}
        </div>

        {/* Content Stack */}
        <div className="space-y-16 relative">
          {/* Abstract / Summary */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-primary rounded-full" />
              <h3 className="text-3xl font-bold text-white tracking-tight">Executive Summary</h3>
            </div>
            <div className="relative pl-6 border-l-2 border-white/5">
               <p className="text-xl text-textMuted/90 leading-[1.9] font-light max-w-5xl text-justify">
                 {data.summary || "Generating your video abstract..."}
               </p>
            </div>
          </section>

          {/* Key Insights List */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-secondary rounded-full" />
              <h3 className="text-3xl font-bold text-white tracking-tight">Core Takeaways</h3>
            </div>
            
            {data.key_points && data.key_points.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.key_points.map((point, idx) => (
                  <div 
                    key={idx} 
                    className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 flex gap-6 group/item hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="flex-shrink-0 w-14 h-14 rounded-2xl bg-surface-lighter flex items-center justify-center border border-white/10 text-primary font-black text-xl shadow-2xl group-hover/item:scale-110 group-hover/item:bg-primary group-hover/item:text-white transition-all duration-500">
                      {idx + 1}
                    </span>
                    <p className="text-lg text-textMuted/90 group-hover/item:text-white transition-colors duration-300 leading-relaxed font-light">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-dashed border-white/10 text-center italic text-textMuted/40">
                Awaiting key moment extraction...
              </div>
            )}
          </section>

          {/* New Timeline Section */}
          {timeline && timeline.length > 0 && (
            <section className="space-y-8 pt-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-accent rounded-full" />
                <h3 className="text-3xl font-bold text-white tracking-tight">Content Timeline</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 relative">
                {timeline.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTimeClick(item.time)}
                    className="flex items-center gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:border-primary/30 group/time transition-all duration-300 text-left w-full animate-fade-in-up"
                    style={{ animationDelay: `${(data.key_points?.length || 0) * 100 + idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-primary font-mono font-bold group-hover/time:bg-primary group-hover/time:text-white transition-all">
                      <Clock size={16} />
                      {formatTime(item.time)}
                    </div>
                    <span className="text-xl font-light text-textMuted group-hover/time:text-white transition-colors flex-1">
                      {item.label}
                    </span>
                    <PlayCircle className="opacity-0 group-hover/time:opacity-100 text-primary transition-all transform group-hover/time:scale-110" size={28} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
