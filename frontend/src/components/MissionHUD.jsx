import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const MissionHUD = ({ label, value, unit, data = [], color = 'emerald' }) => {
  const colorMap = {
    emerald: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    rose: 'text-rose-500 border-rose-500/20 bg-rose-500/5',
    indigo: 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5',
    amber: 'text-amber-500 border-amber-500/20 bg-amber-500/5'
  };

  const chartColor = {
    emerald: '#10b981',
    rose: '#f43f5e',
    indigo: '#6366f1',
    amber: '#f59e0b'
  };

  // Simple sparkline calculation
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.value)) : 100;
  const points = data.length > 1 
    ? data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.value / maxVal) * 100}`).join(' ')
    : '0,50 100,50';

  const trend = data.length > 1 ? Math.round(((data[data.length - 1].value - data[0].value) / (data[0].value || 1)) * 100) : 0;

  return (
    <div className={clsx("p-6 rounded-[2rem] border transition-all hover:scale-[1.02] relative overflow-hidden group bg-white/[0.01]", colorMap[color])}>
      <div className="flex justify-between items-start mb-6">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{label}</p>
          <h3 className="text-2xl font-black tabular-nums flex items-baseline gap-1 text-white">
            {value} <span className="text-[10px] opacity-40 uppercase font-medium">{unit}</span>
          </h3>
        </div>
        <div className={clsx("p-3 rounded-xl relative z-10", colorMap[color])}>
          <Activity size={18} />
        </div>
      </div>

      <div className="h-16 w-full mb-4 relative z-10">
        {data.length > 0 ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartColor[color]} stopOpacity="0.2" />
                <stop offset="100%" stopColor={chartColor[color]} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,100 L ${points} L 100,100 Z`}
              fill={`url(#grad-${label})`}
              className="animate-pulse"
            />
            <polyline
              fill="none"
              stroke={chartColor[color]}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        ) : (
          <div className="w-full h-full border-b border-white/5 border-dashed flex items-center justify-center">
            <span className="text-[8px] font-black uppercase opacity-20">establishing_datalink...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest relative z-10">
        <div className="flex items-center gap-1 opacity-60">
          {trend >= 0 ? <TrendingUp size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-rose-500" />}
          {trend >= 0 ? '+' : ''}{trend}% Drift
        </div>
        <span className="opacity-40">Live Matrix Scan</span>
      </div>

      {/* Decorative background glow */}
      <div className={clsx("absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-10 group-hover:opacity-20 transition-opacity", colorMap[color].split(' ')[2])} />
    </div>
  );
};

export default MissionHUD;
