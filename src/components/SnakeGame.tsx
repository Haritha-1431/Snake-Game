import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Point, GameState } from '../types';
import { GRID_SIZE, INITIAL_SPEED, MIN_SPEED, SPEED_INCREMENT } from '../constants';

const SNAKE_COLOR = '#22d3ee';
const FOOD_COLOR = '#d946ef';
const GRID_COLOR = 'rgba(255, 255, 255, 0.03)';

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
}

export default function SnakeGame({ onScoreUpdate }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [nextDirection, setNextDirection] = useState<Point>({ x: 0, y: -1 });
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('snake-high-score') || '0'),
    isGameOver: false,
    isPaused: true,
  });

  useEffect(() => {
    onScoreUpdate(gameState.score);
  }, [gameState.score, onScoreUpdate]);

  useEffect(() => {
    const handleGlobalReset = () => resetGame();
    window.addEventListener('reset-game', handleGlobalReset);
    return () => window.removeEventListener('reset-game', handleGlobalReset);
  }, []);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f3ff', '#ff00ff', '#39ff14']
    });
  }, []);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isColliding = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isColliding) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 0, y: -1 });
    setNextDirection({ x: 0, y: -1 });
    setGameState((prev) => ({ ...prev, score: 0, isGameOver: false, isPaused: false }));
  };

  const gameOver = () => {
    setGameState((prev) => {
      const isNewHighScore = prev.score > prev.highScore;
      const newHighScore = Math.max(prev.score, prev.highScore);
      localStorage.setItem('snake-high-score', newHighScore.toString());
      if (isNewHighScore && prev.score > 0) {
        fireConfetti();
      }
      return { ...prev, isGameOver: true, highScore: newHighScore };
    });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
          break;
        case 'arrowdown':
        case 's':
          if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
          break;
        case 'arrowleft':
        case 'a':
          if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
          break;
        case 'arrowright':
        case 'd':
          if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: (head.x + nextDirection.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + nextDirection.y + GRID_SIZE) % GRID_SIZE,
        };

        // Self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          gameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = gameState.score + 10;
          setGameState((prev) => ({ ...prev, score: newScore }));
          
          // Milestone confetti
          if (newScore > 0 && newScore % 100 === 0) {
            fireConfetti();
          }

          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        setDirection(nextDirection);
        return newSnake;
      });
    };

    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - gameState.score / SPEED_INCREMENT);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isPaused, nextDirection, food, generateFood, gameState.score, fireConfetti]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#010101';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (Scanline Grid)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    // Draw snake (Glitch Cyan)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#ffffff' : '#00ffff';
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });

    // Draw food (Glitch Magenta Square)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(
      food.x * cellSize + 2,
      food.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );

    // Reset shadow
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="relative flex flex-col items-center group/game overflow-visible">
      {/* Game Board */}
      <div className="relative p-1 bg-white border-2 border-glitch-magenta shadow-[10px_10px_0_0_#00ffff]">
        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          className="bg-black cursor-crosshair tear-effect"
          onClick={() => gameState.isGameOver ? resetGame() : setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
        />

        <AnimatePresence>
          {(gameState.isGameOver || (gameState.isPaused && gameState.score === 0)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-20"
            >
              <div className="noise-overlay" />
              {gameState.isGameOver ? (
                <>
                  <h2 className="text-6xl font-pixel text-white mb-4 glitch-text" data-text="K_O">K_O</h2>
                  <p className="text-glitch-magenta font-pixel text-[12px] mb-8 animate-glitch uppercase">SEGMENTATION_FAULT::MEMORY_LEAK_DETECTED</p>
                  <div className="space-y-2 mb-10 w-64">
                    <div className="flex justify-between font-mono bg-white/10 p-2">
                        <span className="text-white/40">YIELD_TOTAL</span>
                        <span className="text-glitch-cyan">{gameState.score}</span>
                    </div>
                  </div>
                  <button
                    onClick={resetGame}
                    className="px-12 py-4 bg-white text-black font-pixel text-[14px] hover:bg-glitch-magenta hover:text-white transition-all shadow-[8px_8px_0_0_#00ffff] active:shadow-none translate-y-0 active:translate-y-2"
                  >
                    RE_INITIALIZE
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setGameState(prev => ({ ...prev, isPaused: false }))}
                  className="flex flex-col items-center gap-6 group"
                >
                  <div className="w-24 h-24 bg-white border-4 border-glitch-magenta flex items-center justify-center group-hover:scale-110 group-hover:bg-glitch-cyan transition-all shadow-[8px_8px_0_0_#00ffff]">
                    <Play className="text-black" size={48} fill="currentColor" />
                  </div>
                  <span className="text-white font-pixel text-[10px] uppercase tracking-widest animate-pulse">PRESS_TO_INIT_STREAM</span>
                </button>
              )}
            </motion.div>
          )}

          {gameState.isPaused && !gameState.isGameOver && gameState.score > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20"
            >
              <div className="noise-overlay" />
              <div className="w-20 h-20 border-8 border-glitch-cyan border-t-glitch-magenta animate-spin mb-4" />
              <p className="text-white font-pixel text-[14px] glitch-text" data-text="HALT_SEQUENCE::ACTIVE">HALT_SEQUENCE::ACTIVE</p>
              <p className="text-white/40 font-mono text-[10px] mt-4">[ SPACE ] RE_ENGAGE</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Help */}
      <div className="mt-8 flex gap-8 text-[12px] font-mono text-glitch-cyan uppercase tracking-widest animate-glitch">
        <span>&lt;W_A_S_D&gt; STEER_VEC</span>
        <span>&lt;SPACE&gt; HALT_EXEC</span>
      </div>
    </div>
  );
}
