import React, { useState, useRef, useEffect } from 'react';
import VideoInput from './components/VideoInput';
import SummaryView from './components/SummaryView';
import ChatInterface from './components/ChatInterface';
import { processVideo } from './services/api';
import { Info } from 'lucide-react';
import Logo from './assets/Logo.png';

function App() {
  const [videoId, setVideoId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (summaryData) {
      window.scrollTo(0, 0);
      mainRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [summaryData]);

  const handleVideoSubmit = async (url) => {
    window.scrollTo(0, 0);
    mainRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
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
    <div className="min-h-screen bg-background text-textMain relative selection:bg-primary/30">
      {/* Dynamic Aurora Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/15 rounded-full blur-[100px] animate-blob-slow pointer-events-none" />

      {/* Modern Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none contrast-150 brightness-100"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <main ref={mainRef} className="container mx-auto px-6 py-10 relative z-10 max-w-7xl">
        {/* Large Header - Landing Only */}
        {!summaryData && (
          <header className="text-center mb-16 pt-10 animate-fade-in-up">
            <div className="inline-block mb-8">
              <img src={Logo} alt="Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain animate-float" />
            </div>

            <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">YT Summarizer</span>
              <br />
              <span className="text-primary text-glow-primary">Intelligence</span>
            </h1>

            <p className="text-xl text-textMuted max-w-3xl mx-auto font-medium leading-relaxed">
              Unlock the power of search, summarization, and interactive deep-dives for any YouTube video.
              Powered by advanced AI models.
            </p>
          </header>
        )}

        {/* Compact Header - Post-Summary */}
        {summaryData && (
          <div className="flex items-center justify-between mb-8 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-black tracking-tight text-white">
                YT <span className="text-primary text-glow-primary">Intelligence</span>
              </h1>
            </div>
            <button
              onClick={() => {
                setSummaryData(null);
                setVideoId(null);
              }}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-textMuted hover:text-white transition-all"
            >
              New Search
            </button>
          </div>
        )}

        <section className={`relative z-20 transition-all duration-700 ${summaryData ? 'mb-10' : ''}`}>
          <VideoInput onSubmit={handleVideoSubmit} isLoading={isLoading} />
        </section>

        {error && (
          <div className="mt-8 max-w-3xl mx-auto glass-card border-red-500/30 text-red-200 p-6 rounded-3xl flex items-start gap-4 animate-fade-in-up">
            <Info size={24} className="text-red-400 mt-1" />
            <p className="text-lg opacity-80">{error}</p>
          </div>
        )}

        {summaryData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-32">
            <div className="lg:col-span-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <SummaryView data={summaryData} timeline={timeline} videoId={videoId} />
            </div>
            <div className="lg:col-span-4 sticky top-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <ChatInterface videoId={videoId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
