import React, { useState, useEffect } from 'react';
import { Eye, Zap, ShieldAlert, RefreshCw, Fingerprint, Activity, Brain, Info, Lock, Key, Target, Heart, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const NeuralBioLink = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/biolink/telemetry');
      setData(res.data);
    } catch (err) {
      console.error("Neural Sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLockdown = async () => {
    if (!window.confirm("CONFIRM SOVEREIGN LOCKDOWN? All mission control interfaces will be secured.")) return;
    setIsLocking(true);
    try {
      const res = await api.post('/biolink/lockdown');
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Lockdown Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLocking(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-indigo-500 w-12 h-12" />
       <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Establishing_Neural_BioLink...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><Fingerprint size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Neural Bio-Link</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-9 Cognitive Security. Analysis of operator behavioral telemetry, command rhythm, and decision latency to prevent unauthorized control or duress.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={250} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Stability HUD */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Operator Cognitive Stability</h3>
               
               <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full border-8 border-indigo-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.1)]">
                     <div>
                        <p className="text-4xl font-black text-indigo-600">{data.cognitive_stability}%</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Stability_Index</p>
                     </div>
                  </div>
                  <div className="absolute inset-0 border-t-8 border-indigo-500 rounded-full animate-spin duration-[4000ms]" style={{ opacity: 0.3 }} />
               </div>

               <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lockdown Status</p>
                  <p className={`text-sm font-black ${data.lockdown_status === 'Unlocked' ? 'text-emerald-400' : 'text-rose-400'}`}>{data.lockdown_status.toUpperCase()}</p>
               </div>
            </div>

            <button 
              onClick={handleLockdown}
              disabled={isLocking || data.lockdown_status !== 'Unlocked'}
              className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
               {isLocking ? <RefreshCw className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
               {isLocking ? 'Engaging Lockdown...' : 'Sovereign Lockdown'}
            </button>
         </div>

         {/* Behavioral Telemetry */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <Activity size={14} className="text-indigo-500" />
                 Operator Behavioral Telemetry
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                     <div className="flex gap-6 items-center">
                        <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm border border-indigo-50"><Target size={24} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Command Rhythm</p>
                           <p className="text-sm font-black text-slate-800">{data.command_rhythm}</p>
                        </div>
                     </div>
                     <Activity size={24} className="text-indigo-500 opacity-20" />
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                     <div className="flex gap-6 items-center">
                        <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm border border-indigo-50"><Zap size={24} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Decision Latency</p>
                           <p className="text-sm font-black text-slate-800">{data.decision_latency}</p>
                        </div>
                     </div>
                     <Activity size={24} className="text-indigo-500 opacity-20" />
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                     <div className="flex gap-6 items-center">
                        <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm border border-indigo-50"><Heart size={24} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stress Marker</p>
                           <p className="text-sm font-black text-slate-800">{data.stress_marker}</p>
                        </div>
                     </div>
                     <Activity size={24} className="text-indigo-500 opacity-20" />
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                     <div className="flex gap-6 items-center">
                        <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm border border-indigo-50"><Fingerprint size={24} /></div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity Anchor</p>
                           <p className="text-sm font-black text-slate-800">{data.operator_id}</p>
                        </div>
                     </div>
                     <ShieldCheck size={24} className="text-emerald-500" />
                  </div>
               </div>

               <div className="mt-12 p-10 bg-slate-900 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row gap-8 items-center">
                  <div className="p-6 bg-white/5 text-indigo-400 rounded-[2rem] border border-white/10"><Brain size={48} /></div>
                  <div>
                     <h4 className="text-xl font-black text-white uppercase tracking-tight">Cognitive Sovereign Defense</h4>
                     <p className="text-sm text-slate-500 leading-relaxed mt-2 font-medium italic">
                        "The Neural Bio-Link is the final shield. It ensures that only the authorized commander can wield the power of the Sovereign Singularity. Any deviation in cognitive pattern results in an immediate global orbit freeze."
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NeuralBioLink;
