import React, { useState, useEffect } from 'react';
import { HeartPulse, Zap, Brain, RefreshCw, GitBranch, Target, Activity, ShieldCheck, Info, ArrowUpRight, Workflow } from 'lucide-react';
import api from '../services/api';

const SelfEvolvingEngine = () => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorizing, setAuthorizing] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/evolution/status');
      setState(res.data);
    } catch (err) {
      console.error("Evolution Synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAuthorize = async (mutationId) => {
    setAuthorizing(mutationId);
    try {
      const res = await api.post('/evolution/authorize', { mutation_id: mutationId });
      alert(res.data.message);
      fetchStatus();
    } catch (err) {
      alert("Mutation Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setAuthorizing(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-emerald-500 w-12 h-12" />
       <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Synchronizing_Evolutionary_Orbits...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#064e3b] p-10 rounded-[3rem] border border-emerald-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10"><HeartPulse size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Self-Evolving Engine</h1>
          </div>
          <p className="text-emerald-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-6 Autonomous Infrastructure Singularity. Sovereign-AI constantly experiments with structural mutations to find the "Global Optimum" for performance, cost, and resilience.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><RefreshCw size={250} className="text-emerald-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Evolution Stats */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Optimization Generation</h3>
               <p className="text-6xl font-black text-slate-800 mb-2">{state.generation}</p>
               <div className="px-4 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Active Evolution</div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Global Optimum Delta</h4>
               <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-emerald-600">{state.global_optimum_delta}%</p>
                  <ArrowUpRight className="text-emerald-500 mb-1" size={24} />
               </div>
               <p className="text-[9px] text-slate-400 font-medium mt-2">Improvement since last cycle</p>
            </div>

            <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-4 items-center">
               <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><Brain size={24} /></div>
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Mutation Velocity</p>
                  <p className="text-lg font-black text-white">{state.evolution_velocity} Cycles/Hr</p>
               </div>
            </div>
         </div>

         {/* Structural Mutations */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <Workflow size={14} className="text-emerald-500" />
                 Pending Structural Mutations
               </h3>

               <div className="space-y-4">
                  {state.mutations.map((m) => (
                    <div key={m.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-2xl shadow-xl ${
                             m.status === 'active' ? 'bg-indigo-600 text-white shadow-indigo-200' : 
                             m.status === 'pending' ? 'bg-emerald-600 text-white shadow-emerald-200' : 
                             'bg-slate-200 text-slate-400'
                          }`}>
                             <GitBranch size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.id} | {m.type}</p>
                                <span className="text-emerald-600 font-black text-[10px]">{m.impact}</span>
                             </div>
                             <p className="text-sm font-black text-slate-800">{m.name}</p>
                             <p className="text-xs text-slate-500 font-medium mt-1">{m.description}</p>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleAuthorize(m.id)}
                         disabled={authorizing === m.id || m.status === 'completed'}
                         className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                            m.status === 'completed' ? 'bg-emerald-100 text-emerald-600 cursor-default' : 
                            'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-emerald-600 active:scale-95'
                         }`}
                       >
                          {authorizing === m.id ? <RefreshCw className="animate-spin" size={14} /> : m.status === 'completed' ? <ShieldCheck size={14} /> : <Zap size={14} />}
                          {authorizing === m.id ? 'Synthesizing...' : m.status === 'completed' ? 'Mutation Applied' : 'Authorize Mutation'}
                       </button>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 flex gap-6 items-center">
                  <div className="p-4 bg-emerald-500 text-white rounded-2xl h-fit shadow-xl shadow-emerald-500/20"><Target size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Genetic Optimization Horizon</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-medium">
                        The engine constantly rebuilds mission orbits to hit the "Global Optimum." Mutations are validated via high-fidelity simulation before structural commitment.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SelfEvolvingEngine;
