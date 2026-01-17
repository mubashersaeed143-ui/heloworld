
import React, { useEffect, useRef } from 'react';
import { Encounter } from '../types';

interface Props {
  encounters: Encounter[];
  loading: boolean;
}

const NarrativeFeed: React.FC<Props> = ({ encounters, loading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [encounters, loading]);

  return (
    <div className="flex-grow relative overflow-hidden rounded-2xl glass border border-slate-700/50 flex flex-col p-6 shadow-inner pointer-events-auto">
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-sky-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          Neural Link Log
        </h3>
        {loading && (
          <span className="text-[10px] font-mono text-amber-500 animate-pulse">
            DOWNLOAD_STREAMING...
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-8 pr-2 custom-scrollbar scroll-smooth">
        {encounters.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
             <div className="w-12 h-12 mb-4 opacity-20 border-2 border-slate-600 rounded-full animate-spin border-t-transparent" />
             <p className="text-sm italic">Waiting for connection to the Astra network...</p>
          </div>
        )}

        {encounters.map((e, idx) => (
          <div key={e.id} className={`group animate-in slide-in-from-bottom-4 duration-700 opacity-0 fill-mode-forwards`} style={{ animationDelay: '0.1s', opacity: 1 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono text-slate-500">[{new Date(e.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
              <span className="h-px flex-grow bg-slate-800 group-last:bg-sky-500/30" />
              <span className="text-[10px] font-black text-sky-600">KM: {(e.distanceMarker/1000).toFixed(2)}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg font-light italic">
              "{e.narrative}"
            </p>
            {e.choice && (
              <div className="mt-4 flex gap-2">
                 <div className="px-3 py-1 bg-sky-900/30 border border-sky-500/30 rounded text-[10px] font-bold text-sky-400 uppercase tracking-tighter">
                   Objective: {e.choice.text}
                 </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
           <div className="flex flex-col gap-2 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-800 rounded w-1/2"></div>
           </div>
        )}
      </div>
      
      <div className="mt-4 text-[10px] text-slate-600 font-mono flex justify-between">
        <span>STR_END_PACKET: 0x4F92</span>
        <span>LATENCY: 14ms</span>
      </div>
    </div>
  );
};

export default NarrativeFeed;
