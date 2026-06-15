import React, { useState, useEffect } from 'react';
import { Radio, Zap, AlertTriangle, CheckCircle2, Info, RefreshCw, Activity } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MissionPulseHUD = () => {
  const { user } = useAuth();
  const [signals, setSignals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPulse = async () => {
    if (!user?.project_id) return;
    try {
      const res = await api.get(`/mission/pulse/${user.project_id}`);
      setSignals(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Pulse link failure:", err);
    }
  };

  useEffect(() => {
    fetchPulse();
    const interval = setInterval(fetchPulse, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, [user?.project_id]);

  useEffect(() => {
    if (signals.length === 0) return;
    const ticker = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % signals.length);
    }, 6000); // Rotate every 6s
    return () => clearInterval(ticker);
  }, [signals]);

  if (loading || signals.length === 0) return null;

  const currentSignal = signals[currentIndex];

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={14} className="text-rose-400" />;
      case 'warning': return <Zap size={14} className="text-amber-400" />;
      case 'intelligence': return <Activity size={14} className="text-indigo-400" />;
      case 'success': return <CheckCircle2 size={14} className="text-emerald-400" />;
      default: return <Info size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="fixed bottom-0 left-64 right-0 h-10 bg-slate-950/90 backdrop-blur-md border-t border-white/5 z-50 flex items-center px-6 overflow-hidden">
      <div className="flex items-center gap-3 shrink-0 border-r border-white/10 pr-6 mr-6">
         <Radio size={14} className="text-rose-500 animate-pulse" />
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Pulse</span>
      </div>

      <div className="flex-1 flex items-center gap-4 animate-in slide-in-from-right-8 duration-500 key={currentIndex}">
         <div className="shrink-0 p-1 bg-white/5 rounded-lg border border-white/10">
            {getIcon(currentSignal.type)}
         </div>
         <p className="text-[11px] font-bold text-slate-300 tracking-wide truncate">
            <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
            {currentSignal.message}
         </p>
      </div>

      <div className="flex items-center gap-6 shrink-0 ml-6 pl-6 border-l border-white/10">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Sync: Operational</span>
         </div>
         <button onClick={fetchPulse} className="hover:text-white transition-colors">
            <RefreshCw size={12} className="text-slate-600" />
         </button>
      </div>
      
      {/* Neural Scan Line Animation */}
      <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-scan-horizontal pointer-events-none" />

      <style jsx>{`
        @keyframes scan-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(1000%); }
        }
        .animate-scan-horizontal {
          animation: scan-horizontal 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MissionPulseHUD;
