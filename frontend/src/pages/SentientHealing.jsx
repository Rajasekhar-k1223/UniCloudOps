import React, { useState, useEffect } from 'react';
import { Heart, Zap, ShieldCheck, RefreshCw, Dna, Activity, Brain, Info, Code2, Sparkles, TrendingUp, Microscope } from 'lucide-react';
import api from '../services/api';

const SentientHealing = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEvolving, setIsEvolving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/evolution/status');
      setData(res.data);
    } catch (err) {
      console.error("Evolution Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEvolve = async () => {
    setIsEvolving(true);
    try {
      const res = await api.post('/evolution/refactor');
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Evolution Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsEvolving(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-emerald-500 w-12 h-12" />
       <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Synchronizing_Sentient_Evolution_Engine...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#064e3b] p-10 rounded-[3rem] border border-emerald-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10"><Dna size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Sentient Self-Healing</h1>
          </div>
          <p className="text-emerald-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-10 Biological Autonomy. Genetic refactoring of the platform's source code to achieve absolute immunity against entire classes of software defects.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Microscope size={250} className="text-emerald-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Purity HUD */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Source Code Purity</h3>
               
               <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full border-8 border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                     <div>
                        <p className="text-4xl font-black text-emerald-600">{data.code_purity_index}%</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Purity_Index</p>
                     </div>
                  </div>
                  <div className="absolute inset-0 border-t-8 border-emerald-500 rounded-full animate-pulse duration-[3000ms]" style={{ opacity: 0.3 }} />
               </div>

               <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Evolution Mode</p>
                  <p className="text-xs font-black text-emerald-400">{data.evolution_mode.toUpperCase()}</p>
               </div>
            </div>

            <button 
              onClick={handleEvolve}
              disabled={isEvolving}
              className="w-full py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
               {isEvolving ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
               {isEvolving ? 'Evolving Architecture...' : 'Trigger Genetic Refactor'}
            </button>

            <div className="bg-emerald-900/10 p-8 rounded-[3rem] border border-emerald-500/20 flex gap-4">
               <div className="p-3 bg-emerald-500 text-white rounded-2xl h-fit shadow-lg shadow-emerald-500/20"><Heart size={20} /></div>
               <p className="text-[10px] text-emerald-900 font-medium leading-relaxed uppercase tracking-tight">
                  Genetic refactoring redesigns the fundamental logic gates of the platform to physically prevent the existence of bugs.
               </p>
            </div>
         </div>

         {/* Immunity Stats */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <Code2 size={14} className="text-emerald-500" />
                 Source-Code Class-Level Immunity Analysis
               </h3>

               <div className="space-y-4">
                  {data.immune_classes.map((c, i) => (
                    <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-2xl shadow-xl bg-slate-900 text-white`}>
                             <ShieldCheck size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.class} | Purity: {c.purity}%</p>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                   c.status === 'Immune' ? 'bg-emerald-100 text-emerald-700' : 
                                   c.status === 'Hardening' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                   {c.status}
                                </span>
                             </div>
                             <h4 className="text-sm font-black text-slate-800">{c.class} Class</h4>
                             <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Refactoring Cycles: {c.refactors}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase">Resilience</p>
                             <p className="text-xs font-black text-emerald-600">ABSOLUTE</p>
                          </div>
                          <div className="h-10 w-0.5 bg-slate-200" />
                          <div className="p-2 text-emerald-500"><TrendingUp size={24} /></div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-emerald-950 rounded-[2.5rem] border border-white/5 flex gap-6 items-center">
                  <div className="p-4 bg-white/5 text-emerald-400 rounded-2xl border border-white/10"><Brain size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest">Biological Self-Evolution</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-medium">
                        The platform is now evolving its own source code. It doesn't just fix errors; it removes the *possibility* of their existence. This is the final state of software sovereignty.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SentientHealing;
