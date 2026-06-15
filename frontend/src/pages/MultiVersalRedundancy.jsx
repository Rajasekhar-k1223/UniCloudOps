import React, { useState, useEffect } from 'react';
import { Share2, Zap, ShieldCheck, RefreshCw, Layers, Activity, Brain, Info, Network, Server, Ship, Ghost, Sparkles, Orbit } from 'lucide-react';
import api from '../services/api';

const MultiVersalRedundancy = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/multiversal/realities');
      setData(res.data);
    } catch (err) {
      console.error("Multiversal Sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwitch = async (realityId) => {
    if (!window.confirm(`INITIATE REALITY SWITCH? The entire empire will warp to ${realityId} architecture.`)) return;
    setIsSwitching(realityId);
    try {
      const res = await api.post('/multiversal/switch', { target_reality_id: realityId });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Switch Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSwitching(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-fuchsia-500 w-12 h-12" />
       <p className="text-xs font-black text-fuchsia-400 uppercase tracking-[0.4em]">Synchronizing_Multi-Versal_Orbits...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#4c0519] p-10 rounded-[3rem] border border-rose-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shadow-lg shadow-rose-500/10"><Ghost size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Multi-Versal Redundancy</h1>
          </div>
          <p className="text-rose-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-10 Parallel Reality Orbits. Maintain active "Ghost" versions of your entire empire across different architectural foundations. 100% survival probability against fundamental system failure.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Share2 size={250} className="text-rose-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Survival HUD */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Empire Survival Probability</h3>
               
               <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full border-8 border-rose-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                     <div>
                        <p className="text-4xl font-black text-rose-600">{data.survival_probability}%</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total_Redundancy_Index</p>
                     </div>
                  </div>
                  <div className="absolute inset-0 border-t-8 border-rose-500 rounded-full animate-spin duration-[8000ms]" style={{ opacity: 0.3 }} />
               </div>

               <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Takeover Readiness</p>
                  <p className="text-sm font-black text-white">{data.takeover_readiness.toUpperCase()}</p>
               </div>
            </div>

            <div className="bg-rose-900/10 p-8 rounded-[3rem] border border-rose-500/20 flex gap-4">
               <div className="p-3 bg-rose-500 text-white rounded-2xl h-fit shadow-lg shadow-rose-500/20"><Sparkles size={20} /></div>
               <p className="text-[10px] text-rose-900 font-medium leading-relaxed uppercase tracking-tight">
                  Ghost Orbits run "shadow missions" in parallel. If K8s fails, the Serverless orbit takes over in 12ms with zero data loss.
               </p>
            </div>
         </div>

         {/* Reality Codex */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <Orbit size={14} className="text-rose-500" />
                 Active Parallel Reality Orbits
               </h3>

               <div className="space-y-4">
                  {data.active_realities.map((reality) => (
                    <div key={reality.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-rose-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-2xl shadow-xl bg-slate-900 text-white`}>
                             <Ghost size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reality.id} | Stability: {reality.stability}%</p>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                   reality.status === 'Primary' ? 'bg-emerald-100 text-emerald-700' : 
                                   reality.status === 'Ghost-Active' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                   {reality.status}
                                </span>
                             </div>
                             <h4 className="text-sm font-black text-slate-800">{reality.architecture}</h4>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleSwitch(reality.id)}
                         disabled={isSwitching === reality.id || reality.status === 'Primary'}
                         className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-rose-600 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-30"
                       >
                          {isSwitching === reality.id ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                          {reality.status === 'Primary' ? 'Current Reality' : (isSwitching === reality.id ? 'Warping Reality...' : 'Switch Reality')}
                       </button>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-slate-900 rounded-[3rem] border border-white/5 flex gap-6 items-center">
                  <div className="p-4 bg-white/5 text-rose-400 rounded-2xl border border-white/10"><Brain size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest">Multi-Versal Sovereign Stability</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-medium">
                        The platform is no longer tied to a single architectural fate. By existing in parallel realities simultaneously, UniCloudOps achieves a state of absolute immortality.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MultiVersalRedundancy;
