/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { motion } from 'motion/react';
import { Music } from 'lucide-react';
import { TRACKS } from './constants';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snake-high-score') || '0'));
  
  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('snake-high-score', newScore.toString());
    }
  };

  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('reset-game'));
  };

  const musicProps = {
    currentTrackIndex,
    setCurrentTrackIndex,
    isPlaying,
    setIsPlaying,
    progress,
    audioRef,
    handleNext,
    handlePrev,
    handleTimeUpdate,
    currentTrack
  };

  return (
    <div className="w-full h-screen bg-black text-white font-sans overflow-hidden relative flex flex-col selection:bg-glitch-magenta selection:text-black">
      <div className="noise-overlay" />
      <div className="scanline" />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />

      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b-4 border-glitch-cyan bg-black shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-glitch-magenta flex items-center justify-center shadow-[4px_4px_0_0_#00ffff] animate-pulse">
            <Music className="text-black" size={32} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-3xl font-pixel tracking-tighter uppercase glitch-text" data-text="SYSTEM_SNAKE">SYSTEM_SNAKE</h1>
            <p className="text-[10px] text-glitch-cyan font-mono animate-glitch tracking-[0.3em]">VERSION::4.0.4_BETA</p>
          </div>
        </div>
        
        <div className="flex gap-12 items-center">
          <div className="text-right hidden md:flex gap-8 items-center border-l-2 border-white/20 pl-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-glitch-magenta uppercase font-pixel tracking-tighter mb-1">SCORE_BUFFER</span>
              <span className="text-4xl font-mono text-white leading-none">
                {score.toString().padStart(6, '0')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-glitch-cyan uppercase font-pixel tracking-tighter mb-1">MAX_YIELD</span>
              <span className="text-4xl font-mono text-white leading-none opacity-50">
                {highScore.toString().padStart(6, '0')}
              </span>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="px-8 py-3 bg-white text-black font-pixel text-[12px] hover:bg-glitch-magenta hover:text-white transition-all active:translate-y-1 shadow-[6px_6px_0_0_#00ffff] hover:shadow-[2px_2px_0_0_#00ffff] active:shadow-none"
          >
            FLUSH_CACHE
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex p-4 gap-4 overflow-hidden bg-black z-10">
        <MusicPlayer isSidebar {...musicProps} />

        {/* Game Window */}
        <section className="flex-1 relative flex flex-col bg-black border-4 border-white overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[12px] border-black z-20" />
          
          <div className="flex-1 flex items-center justify-center p-8 bg-[#050505]">
            <div className="relative w-full h-full max-w-[800px] max-h-[600px] border-2 border-glitch-cyan/30 flex items-center justify-center tear-effect">
              <SnakeGame onScoreUpdate={handleScoreUpdate} />
              
              {/* Internal HUD */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-glitch-cyan text-right leading-tight">
                CPU_LOAD::88%<br/>
                LATENCY::0.2ms<br/>
                CORE_TEMP::42C
              </div>
            </div>
          </div>

          {/* Glitch Overlay Elements */}
          <div className="absolute bottom-4 left-4 flex gap-4 z-30">
            <div className="px-4 py-1 bg-glitch-magenta text-black font-pixel text-[10px] animate-bounce">
              SIGNAL::STABLE
            </div>
            <div className="px-4 py-1 border-2 border-glitch-cyan text-glitch-cyan font-pixel text-[10px] animate-pulse">
              INPUT::A_STREAM
            </div>
          </div>
        </section>
      </main>

      {/* Player Controls */}
      <div className="z-10 shadow-[0_-8px_0_0_#ff00ff]">
        <MusicPlayer isFooter {...musicProps} />
      </div>
    </div>
  );
}
