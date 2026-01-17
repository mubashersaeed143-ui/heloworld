
import React from 'react';
import { GameState } from '../types';

interface Props {
  game: GameState;
}

const Visualizer: React.FC<Props> = ({ game }) => {
  return (
    <div className="relative w-full h-full perspective-[1000px] bg-slate-900 overflow-hidden">
      {/* Background Environment */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms]"
        style={{ 
          backgroundImage: `url(${game.bgUrl || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop'})`,
          opacity: 0.5,
          transform: 'scale(1.1)'
        }}
      />

      {/* Atmospheric Fog */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/50" />

      {/* 3D Road Perspective */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1600px] h-[80%] origin-bottom" style={{ transform: 'rotateX(55deg)' }}>
        {/* Road Surface */}
        <div className="w-full h-[500%] bg-zinc-800 relative shadow-inner" style={{ 
          background: `
            linear-gradient(90deg, #111 2%, transparent 2%, transparent 98%, #111 98%),
            linear-gradient(90deg, transparent 33.3%, #555 33.3%, #555 34%, transparent 34%, transparent 66.3%, #555 66.3%, #555 67%, transparent 67%),
            repeating-linear-gradient(0deg, #ffd700 0px, #ffd700 40px, transparent 40px, transparent 120px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 20px 200px',
          backgroundPosition: `center ${(Date.now() / 8 * game.speed) % 200}px` 
        }}>
          {/* Asphalt Texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]" />
        </div>

        {/* Entities */}
        {game.entities.map(entity => (
          <div 
            key={entity.id}
            className="absolute bottom-0 w-1/3 flex items-center justify-center transition-transform duration-75 origin-bottom"
            style={{ 
              left: `${(entity.lane + 1) * 33.33}%`,
              transform: `translateY(-${entity.z * 10}px) scale(${entity.z / 80})`,
              opacity: Math.min(1, entity.z / 10),
              zIndex: Math.floor(100 - entity.z)
            }}
          >
            {entity.model === 'COIN' && (
              <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-yellow-200 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-spin" />
            )}
            
            {entity.model === 'CONE' && (
              <div className="relative w-12 h-16">
                <div className="absolute bottom-0 left-0 w-12 h-2 bg-orange-700 rounded-sm" />
                <div className="absolute bottom-1 left-2 w-8 h-14 bg-orange-500 clip-cone" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
                   <div className="absolute top-4 w-full h-3 bg-white/80" />
                </div>
              </div>
            )}

            {entity.model === 'BARRIER' && (
              <div className="w-32 h-12 bg-white border-4 border-red-600 flex items-center justify-center font-black text-red-600 text-[8px] overflow-hidden">
                <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#cc0000_10px,#cc0000_20px)] opacity-50" />
                <span className="absolute">DANGER</span>
              </div>
            )}

            {entity.model === 'CAR' && (
              <div className="relative w-48 h-20 bg-slate-800 rounded-lg shadow-2xl border-b-4 border-black group">
                <div className="absolute -top-4 left-4 w-40 h-10 bg-slate-700 rounded-t-xl overflow-hidden">
                   <div className="absolute right-0 top-0 w-12 h-full bg-sky-300/30" />
                </div>
                <div className="absolute bottom-0 left-4 w-8 h-4 bg-red-600 blur-sm animate-pulse" />
                <div className="absolute bottom-0 right-4 w-8 h-4 bg-red-600 blur-sm animate-pulse" />
                <div className="absolute top-2 left-2 w-2 h-2 bg-amber-400 rounded-full" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full" />
                <div className="absolute -bottom-2 flex w-full justify-around">
                   <div className="w-10 h-4 bg-black rounded-full" />
                   <div className="w-10 h-4 bg-black rounded-full" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Player Character Container */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-32 h-64 flex flex-col items-center z-[200] pointer-events-none">
         {/* Shadow */}
         <div 
           className="w-16 h-4 bg-black/40 rounded-full blur-md transition-all duration-200" 
           style={{ 
             transform: `translateX(${game.lane * 250}%) scale(${1 - game.jumpY / 5})`,
             opacity: 1 - game.jumpY / 3
           }}
         />
         
         {/* Runner */}
         <div 
           className="relative w-16 h-32 transition-all duration-200 ease-out" 
           style={{ 
             transform: `translateX(${game.lane * 250}%) translateY(-${game.jumpY * 120}px) rotate(${game.lane * 10}deg)`,
           }}
         >
            {/* Simple Runner Silhouette */}
            <div className="absolute top-0 left-4 w-8 h-8 bg-sky-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
            <div className="absolute top-8 left-2 w-12 h-16 bg-gradient-to-b from-sky-400 to-sky-600 rounded-t-2xl shadow-xl" />
            
            {/* Motion Lines when fast */}
            {game.speed > 0.8 && (
              <div className="absolute -left-4 top-1/2 w-2 h-12 bg-white/20 blur-sm animate-pulse" />
            )}
            
            {/* Legs animation - simple css bounce */}
            <div className="absolute bottom-0 left-2 flex gap-4">
               <div className="w-4 h-10 bg-sky-700 rounded-full origin-top animate-runner-leg" style={{ animationDelay: '0s' }} />
               <div className="w-4 h-10 bg-sky-700 rounded-full origin-top animate-runner-leg" style={{ animationDelay: '0.2s' }} />
            </div>
         </div>
      </div>

      {/* Screen Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
        {/* Speed blur effect */}
        {game.speed > 0.8 && (
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(56,189,248,0.1)]" />
        )}
      </div>

      <style>{`
        @keyframes runner-leg {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }
        .animate-runner-leg {
          animation: runner-leg 0.4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Visualizer;
