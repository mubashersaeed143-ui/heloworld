
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus, GameState, Lane, Entity, EntityType } from './types';
import * as gemini from './services/geminiService';
import Visualizer from './components/Visualizer';

const GRAVITY = 0.008;
const JUMP_STRENGTH = 0.25;

const App: React.FC = () => {
  const [game, setGame] = useState<GameState>({
    status: GameStatus.IDLE,
    score: 0,
    lane: 0,
    jumpY: 0,
    speed: 0.6,
    entities: [],
    phase: 1,
    currentWorld: "Downtown Highway",
    narrative: "Systems online. Clear the road ahead.",
    bgUrl: ""
  });

  const requestRef = useRef<number>(0);
  const lastUpdate = useRef<number>(0);
  const spawnTimer = useRef<number>(0);
  const jumpVelocity = useRef<number>(0);
  const isJumping = useRef<boolean>(false);

  const handlePhaseShift = useCallback(async (newPhase: number) => {
    const data = await gemini.generatePhaseShift(newPhase, game.currentWorld);
    const img = await gemini.generateWorldImage(data.imagePrompt + ", urban asphalt road, city highway, realistic street");
    setGame(prev => ({
      ...prev,
      phase: newPhase,
      currentWorld: data.sectorName,
      narrative: data.narrative,
      bgUrl: img || prev.bgUrl,
      speed: prev.speed + 0.05
    }));
    gemini.playVoiceLine(`Sector ${newPhase} entry. Beware of traffic.`);
  }, [game.currentWorld]);

  const gameLoop = useCallback((time: number) => {
    if (lastUpdate.current !== 0) {
      const delta = time - lastUpdate.current;
      const step = delta / 16.67; // Normalize to 60fps

      setGame(prev => {
        if (prev.status !== GameStatus.PLAYING) return prev;

        // Physics: Jumping
        let nextJumpY = prev.jumpY;
        if (isJumping.current) {
          nextJumpY += jumpVelocity.current * step;
          jumpVelocity.current -= GRAVITY * step;
          if (nextJumpY <= 0) {
            nextJumpY = 0;
            isJumping.current = false;
            jumpVelocity.current = 0;
          }
        }

        // Update entities position
        let newEntities = prev.entities
          .map(e => ({ ...e, z: e.z - prev.speed * step }))
          .filter(e => e.z > -10);

        // Spawn new entities
        spawnTimer.current += delta;
        if (spawnTimer.current > 1200 / prev.speed) {
          spawnTimer.current = 0;
          const lane: Lane = (Math.floor(Math.random() * 3) - 1) as Lane;
          const rand = Math.random();
          let type: EntityType = 'OBSTACLE_LOW';
          let model: Entity['model'] = 'CONE';

          if (rand > 0.8) {
            type = 'COIN';
            model = 'COIN';
          } else if (rand > 0.4) {
            type = 'OBSTACLE_HIGH';
            model = 'CAR';
          } else if (rand > 0.2) {
            type = 'OBSTACLE_LOW';
            model = 'BARRIER';
          }

          newEntities.push({
            id: Math.random().toString(),
            lane,
            z: 100,
            type,
            model
          });
        }

        // Collision Check
        let scoreBonus = 0;
        let hitObstacle = false;
        const collisionDepth = 3;

        newEntities = newEntities.filter(e => {
          if (e.z > -collisionDepth && e.z < collisionDepth && e.lane === prev.lane) {
            if (e.type === 'COIN') {
              scoreBonus += 100;
              return false;
            } else {
              // Obstacle collision logic
              // Low obstacles (CONE, BARRIER) can be jumped over
              if (e.type === 'OBSTACLE_LOW' && nextJumpY > 0.5) {
                scoreBonus += 50; // Points for jumping over
                return false;
              }
              // High obstacles (CAR) require a higher jump or lane switch
              // Let's make cars require a lane switch for realism (mostly)
              if (e.type === 'OBSTACLE_HIGH' && nextJumpY < 1.5) {
                hitObstacle = true;
                return false;
              }
              
              if (e.type === 'OBSTACLE_LOW' && nextJumpY <= 0.5) {
                hitObstacle = true;
                return false;
              }
            }
          }
          return true;
        });

        if (hitObstacle) {
          gemini.playVoiceLine("Collision detected. Medical team dispatched.");
          return { ...prev, status: GameStatus.GAMEOVER, jumpY: nextJumpY };
        }

        const newScore = prev.score + scoreBonus + 1;
        
        if (Math.floor(newScore / 1000) > Math.floor(prev.score / 1000)) {
           handlePhaseShift(prev.phase + 1);
        }

        return {
          ...prev,
          entities: newEntities,
          score: newScore,
          jumpY: nextJumpY
        };
      });
    }
    lastUpdate.current = time;
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [handlePhaseShift]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (game.status !== GameStatus.PLAYING) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setGame(p => ({ ...p, lane: Math.max(-1, p.lane - 1) as Lane }));
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setGame(p => ({ ...p, lane: Math.min(1, p.lane + 1) as Lane }));
      }
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && !isJumping.current) {
        isJumping.current = true;
        jumpVelocity.current = JUMP_STRENGTH;
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [game.status]);

  const startGame = () => {
    setGame(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      lane: 0,
      jumpY: 0,
      entities: [],
      speed: 0.6,
      phase: 1
    }));
    isJumping.current = false;
    jumpVelocity.current = 0;
    handlePhaseShift(1);
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden select-none">
      <Visualizer game={game} />

      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-50">
        <div className="flex flex-col">
          <h1 className="text-white font-black text-4xl italic tracking-tighter drop-shadow-lg">STREETRUNNER</h1>
          <div className="bg-sky-500 text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest inline-block self-start mt-1">
            {game.currentWorld} // SECTOR_{game.phase}
          </div>
        </div>
        <div className="text-right glass p-4 rounded-xl border-white/10">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Distance Recovered</div>
          <div className="text-4xl font-black text-white mono leading-none">{game.score.toLocaleString().padStart(6, '0')}</div>
        </div>
      </div>

      <div className="absolute top-32 left-8 w-72 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-lg border-l-4 border-amber-500 animate-in slide-in-from-left duration-500">
             <p className="text-xs text-amber-200 leading-relaxed font-bold italic uppercase tracking-tighter">MISSION LOG:</p>
             <p className="text-sm text-white font-light mt-1">"{game.narrative}"</p>
          </div>
      </div>

      {game.status !== GameStatus.PLAYING && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass p-12 rounded-3xl border-slate-700 max-w-md w-full text-center space-y-6 shadow-2xl">
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">
              {game.status === GameStatus.IDLE ? 'READY TO START' : 'CRITICAL CRASH'}
            </h2>
            {game.status === GameStatus.GAMEOVER && (
              <div className="space-y-1">
                 <p className="text-slate-400 text-sm uppercase font-bold tracking-widest">Score Achieved</p>
                 <p className="text-5xl font-black text-sky-400 mono">{game.score}</p>
              </div>
            )}
            <div className="text-xs text-slate-500 uppercase font-mono space-y-1">
              <p>← → / A D : Switch Lanes</p>
              <p>Space / W : Jump Hurdles</p>
            </div>
            <button 
              onClick={startGame}
              className="w-full py-5 bg-white text-black font-black rounded-xl uppercase tracking-[0.3em] transition-all hover:bg-sky-400 hover:scale-105 active:scale-95 shadow-xl"
            >
              {game.status === GameStatus.IDLE ? 'Ignition' : 'Respawn'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-12 left-0 w-full px-8 flex justify-between z-50 lg:hidden">
         <div className="flex gap-4">
          <button onPointerDown={() => setGame(p => ({ ...p, lane: Math.max(-1, p.lane - 1) as Lane }))} className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-3xl text-white">←</button>
          <button onPointerDown={() => setGame(p => ({ ...p, lane: Math.min(1, p.lane + 1) as Lane }))} className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-3xl text-white">→</button>
         </div>
         <button onPointerDown={() => { if (!isJumping.current) { isJumping.current = true; jumpVelocity.current = JUMP_STRENGTH; } }} className="w-24 h-24 bg-sky-500/80 backdrop-blur-md rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg">JUMP</button>
      </div>
    </div>
  );
};

export default App;
