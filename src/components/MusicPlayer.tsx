import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { TRACKS } from '../constants';
import { Track } from '../types';

interface MusicPlayerProps {
  isSidebar?: boolean;
  isFooter?: boolean;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  progress: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  handleNext: () => void;
  handlePrev: () => void;
  handleTimeUpdate: () => void;
  currentTrack: Track;
}

export default function MusicPlayer({ 
  isSidebar, 
  isFooter, 
  currentTrackIndex, 
  setCurrentTrackIndex, 
  isPlaying, 
  setIsPlaying, 
  progress, 
  audioRef, 
  handleNext, 
  handlePrev,
  currentTrack 
}: MusicPlayerProps) {

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / (audioRef.current?.duration || 1) * 0); // Placeholder mins
    // Real calculation would need duration which is in currentTrack
    const duration = currentTrack.duration;
    const currentSeconds = (progress / 100) * duration;
    const m = Math.floor(currentSeconds / 60);
    const s = Math.floor(currentSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = () => {
    const m = Math.floor(currentTrack.duration / 60);
    const s = Math.floor(currentTrack.duration % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (isSidebar) {
    return (
      <aside className="w-80 flex flex-col gap-6 shrink-0 h-full overflow-hidden bg-black border-r-4 border-white p-4">
        <h2 className="text-[12px] font-pixel text-glitch-magenta uppercase tracking-tighter mb-2 border-b-2 border-glitch-magenta pb-2">STORAGE_UNIT::PLAYLIST</h2>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-glitch-cyan">
          {TRACKS.map((track, index) => (
            <div 
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(index);
                setIsPlaying(true);
              }}
              className={`p-4 transition-all group cursor-pointer flex items-center gap-4 border-2 ${
                currentTrackIndex === index 
                ? 'bg-glitch-cyan text-black border-white translate-x-2' 
                : 'hover:bg-white/10 border-transparent'
              }`}
            >
              <div className="w-12 h-12 bg-black border-2 border-current rounded-none flex items-center justify-center relative overflow-hidden shrink-0">
                {currentTrackIndex === index && isPlaying ? (
                  <div className="flex gap-1 items-end h-6">
                    {[1, 2, 3].map(v => (
                      <motion.div 
                        key={v}
                        animate={{ height: [10, 20, 15, 20, 10] }}
                        transition={{ repeat: Infinity, duration: 0.3 + Math.random(), ease: "steps(4)" }}
                        className="w-1.5 bg-black"
                      />
                    ))}
                  </div>
                ) : (
                  <Play className="w-5 h-5" fill="currentColor" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-pixel truncate uppercase tracking-tighter">{track.title}</p>
                <p className="text-[14px] text-current opacity-60 font-mono truncate">{track.artist}::ID_{track.id}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto p-4 bg-glitch-cyan text-black border-t-8 border-glitch-magenta">
          <p className="text-[10px] font-pixel uppercase mb-2">RAW_DATA_INTEL</p>
          <p className="text-[14px] font-mono leading-none lowercase">velocity_multiplier += 0.05 per_beat_drop. maintain_sync.</p>
        </div>
      </aside>
    );
  }

  if (isFooter) {
    return (
      <footer className="h-28 bg-black border-t-8 border-glitch-cyan px-10 flex items-center shrink-0">
        <div className="w-1/3 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-none overflow-hidden border-4 border-glitch-magenta group relative shrink-0 tear-effect">
            <img src={currentTrack.cover} className="w-full h-full object-cover grayscale brightness-150 contrast-200" alt="" />
            <div className="absolute inset-0 bg-glitch-cyan/30 mix-blend-color"></div>
          </div>
          <div className="min-w-0">
            <p className="text-lg font-pixel truncate text-white uppercase tracking-tighter decoration-glitch-magenta underline decoration-4 underline-offset-4">{currentTrack.title}</p>
            <p className="text-[14px] text-glitch-cyan font-mono tracking-widest uppercase mt-2">{currentTrack.artist} // ACCESS_GRANTED</p>
          </div>
        </div>

        <div className="w-1/3 flex flex-col items-center gap-4">
          <div className="flex items-center gap-10">
            <button 
              onClick={handlePrev}
              className="text-white hover:text-glitch-magenta transition-transform hover:-translate-x-2 active:scale-95"
            >
              <SkipBack className="w-8 h-8" fill="currentColor" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-white text-black rounded-none flex items-center justify-center hover:bg-glitch-cyan hover:scale-110 transition-all shadow-[8px_8px_0_0_#ff00ff] active:shadow-none translate-y-0 active:translate-y-2"
            >
              {isPlaying ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8 ml-1" fill="currentColor" />}
            </button>
            <button 
              onClick={handleNext}
              className="text-white hover:text-glitch-cyan transition-transform hover:translate-x-2 active:scale-95"
            >
              <SkipForward className="w-8 h-8" fill="currentColor" />
            </button>
          </div>
          <div className="w-full max-w-lg flex items-center gap-4 font-mono">
            <span className="text-[16px] text-glitch-cyan w-16 text-center bg-white/10">{formatTime(0)}</span>
            <div className="flex-1 h-4 bg-white/20 rounded-none overflow-hidden cursor-pointer relative group"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const pct = (e.clientX - rect.left) / rect.width;
                   if (audioRef.current) audioRef.current.currentTime = pct * audioRef.current.duration;
                 }}>
              <div 
                className="h-full bg-glitch-magenta shadow-[0_0_20px_#ff00ff] transition-all duration-100 ease-linear" 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 w-2 h-full bg-white animate-pulse" />
              </div>
            </div>
            <span className="text-[16px] text-glitch-magenta w-16 text-center bg-white/10">{totalTime()}</span>
          </div>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-6">
          <div className="flex items-center gap-4 group cursor-pointer bg-white/5 p-2 border-2 border-transparent hover:border-glitch-cyan">
            <Volume2 className="w-6 h-6 text-white" />
            <div className="w-32 h-2 bg-white/20 rounded-none overflow-hidden underline divide-x-4 divide-white/20 flex">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-full flex-1 ${i < 7 ? 'bg-glitch-cyan' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return null;
}
