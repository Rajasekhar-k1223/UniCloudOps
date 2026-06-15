import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Target, RefreshCw, ShieldCheck, Activity, Brain, Info, Lock, Bug, Search, Eye } from 'lucide-react';
import api from '../services/api';

const ThreatHunting = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/threats/active');
      setData(res.data);
    } catch (err) {
      console.error("Neural Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post('/threats/simulate');
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Simulation Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-rose-500 w-12 h-12" />
       <p className="text-xs font-black text-rose-400 uppercase tracking-[0.4em]">Engaging_Predatory_Hunter_AI...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#450a0a] p-10 rounded-[3rem] border border-rose-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shadow-lg shadow-rose-500/10"><ShieldAlert size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Autonomous Threat Hunting</h1>
          </div>
          <p className="text-rose-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-9 Proactive Defense. Sovereign-AI continuously "dreams" of zero-day exploits and synthesizes preemptive patches to secure the galactic mesh before threats manifest.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={250} className="text-rose-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hunter HUD */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Eye size={120} className="text-rose-500" /></div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 relative z-10">Hunter Mode: {data.hunter_mode}</h3>
              
              <div className="relative mb-8 z-10">
                 <div className="w-48 h-48 rounded-full border-8 border-rose-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                    <div>
                       <p className="text-4xl font-black text-rose-600">{data.zero_day_preempted}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Preempted_Threats</p>
                    </div>
                 </div>
                 <div className="absolute inset-0 border-t-8 border-rose-500 rounded-full animate-spin duration-[2000ms]" style={{ opacity: 0.3 }} />
              </div>

              <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 relative z-10"
              >
                 {isSimulating ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                 {isSimulating ? 'Simulating Attack...' : 'Simulate Zero-Day'}
              </button>
           </div>

           <div className="bg-rose-900/10 p-8 rounded-[3rem] border border-rose-500/20 flex gap-5">
              <div className="p-4 bg-rose-500 text-white rounded-2xl h-fit shadow-xl shadow-rose-500/30"><Brain size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Dream-State Intelligence</h4>
                 <p className="text-[10px] text-rose-800/80 leading-relaxed mt-2 font-medium">
                    Sovereign-AI performs 10,000 simulations per hour to identify theoretical vulnerabilities before they are discovered by human adversaries.
                 </p>
              </div>
           </div>
        </div>

        {/* Active Hunts */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Search size={14} className="text-rose-500" />
                Proactive Vulnerability Analysis
              </h3>

              <div className="space-y-4">
                 {data.active_hunts.map((hunt) => (
                   <div key={hunt.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-rose-200 transition-all flex items-center justify-between">
                      <div className="flex gap-6 items-center">
                         <div className={`p-4 rounded-2xl shadow-sm border ${
                            hunt.status === 'patched' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-amber-50 text-amber-500 border-amber-100'
                         }`}>
                            {hunt.status === 'patched' ? <ShieldCheck size={24} /> : <Bug size={24} />}
                         </div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{hunt.id} | Confidence: {hunt.confidence}%</p>
                               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  hunt.status === 'patched' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                               }`}>
                                  {hunt.status}
                               </span>
                            </div>
                            <p className="text-sm font-black text-slate-800">{hunt.vector}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Target: {hunt.target}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Defense Status</p>
                         <p className="text-xs font-black text-slate-800">PREEMPTED</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 flex gap-6 items-center">
                 <div className="p-4 bg-white/5 text-rose-400 rounded-2xl border border-white/10"><Lock size={24} /></div>
                 <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">Immutable Sovereignty</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2 font-medium">
                       Autonomous Threat Hunting ensures that your galactic empire is always one step ahead of the threat landscape. Patching is autonomous, global, and verified.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatHunting;
