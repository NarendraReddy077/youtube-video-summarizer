import React, { useState } from 'react';
import VideoInput from './components/VideoInput';
import SummaryView from './components/SummaryView';
import ChatInterface from './components/ChatInterface';
import { processVideo } from './services/api';
import { Info } from 'lucide-react';

function App() {
  const [videoId, setVideoId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVideoSubmit = async (url) => {
    setIsLoading(true);
    setError(null);
    setVideoId(null);
    setSummaryData(null);
    setTimeline([]);

    try {
      const response = await processVideo(url);
      if (response.status === 'success') {
        setVideoId(response.video_id);
        setSummaryData(response.data);
        setTimeline(response.timeline || []);
      } else {
        setError(response.detail || "Failed to process video");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An unexpected error occurred while processing the video. Please verify the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain relative overflow-hidden selection:bg-primary/30">
      {/* Background ambient accents */}
      <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none" />

      {/* Dynamic Floating Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-80 h-80 bg-secondary/15 rounded-full blur-[100px] animate-blob-slow pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-blob pointer-events-none" />

      <main className="container mx-auto px-6 py-16 relative z-10 max-w-7xl">
        {/* Fancy Logo/Header if needed */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-6 group transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 mb-4">
            YT Summarizer <span className="text-primary text-glow">AI</span>
          </h1>
          <p className="text-xl text-textMuted max-w-2xl mx-auto font-light leading-relaxed">
            Transform long videos into <span className="text-white font-medium">instant insights</span>.
            Ask questions, navigate timestamps, and master content faster than ever.
          </p>
        </div>

        <VideoInput onSubmit={handleVideoSubmit} isLoading={isLoading} />

        {error && (
          <div className="mt-8 max-w-3xl mx-auto glass-card border-red-500/20 text-red-400 p-6 rounded-3xl flex items-center gap-4 animate-fade-in-up">
            <div className="p-3 rounded-full bg-red-500/10">
              <Info size={24} className="flex-shrink-0" />
            </div>
            <p className="text-lg leading-relaxed">{error}</p>
          </div>
        )}

        {summaryData && (
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-5 gap-10 items-start pb-20">
            <div className="lg:col-span-3 h-full">
              <SummaryView data={summaryData} timeline={timeline} videoId={videoId} />
            </div>
            <div className="lg:col-span-2 h-full">
              <ChatInterface videoId={videoId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
