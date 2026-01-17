
import React from 'react';
import { RunData, RunStatus } from '../types';

interface Props {
  data: RunData;
  status: RunStatus;
}

const StatCard: React.FC<{ label: string, value: string | number, unit?: string, accent?: string }> = ({ label, value, unit, accent = 'sky' }) => (
  <div className="glass p-3 md:p-5 rounded-2xl border-slate-700/50 min-w-[120px] md:min-w-[150px] flex flex-col items-center">
    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl md:text-3xl font-black mono text-${accent}-400`}>{value}</span>
      {unit && <span className="text-xs font-bold text-slate-600">{unit}</span>}
    </div>
  </div>
);

const RunStats: React.FC<Props> = ({ data, status }) => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number) => {
    if (isNaN(pace) || !isFinite(pace)) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <StatCard label="Distance" value={(data.distance / 1000).toFixed(2)} unit="KM" />
      <StatCard label="Time" value={formatTime(data.elapsedTime)} accent="emerald" />
      <StatCard label="Pace" value={formatPace(data.pace)} unit="/KM" accent="amber" />
      <StatCard label="Burn" value={Math.floor(data.calories)} unit="KCAL" accent="rose" />
    </div>
  );
};

export default RunStats;
