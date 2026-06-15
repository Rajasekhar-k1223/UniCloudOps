import React, { useState, useEffect } from 'react';
import { Hammer, Zap, Globe, RefreshCw, Send, Target, Activity, ShieldCheck, Info, Layers, Network, Server, Ship, Cpu } from 'lucide-react';
import api from '../services/api';

const MacroForge = () => {
  const [description, setDescription] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [platform, setPlatform] = useState(null);

  const handleSynthesize = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSynthesizing(true);
    setPlatform(null);
    try {
      const res = await api.post('/macro-forge/synthesize', { description: description });
      setPlatform(res.data.platform);
    } catch (err) {
      alert("Macro-Synthesis Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleDeploy = () => {
    alert("Galactic Deployment Sequence Initiated. All orbits synchronized.");
    setPlatform(null);
    setDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e1b4b] p-10 rounded-[3rem] border border-indigo-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><Hammer size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Macro-Forge Synthesis</h1>
          </div>
          <p className="text-indigo-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-9 Planetary Scale. Synthesize entire multi-cloud ecosystems from a single natural language description. Microservices, databases, and global mesh links created instantly.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Layers size={250} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Synthesis Input */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={120} className="text-indigo-500" /></div>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2 relative z-10">
                <Target size={14} className="text-indigo-500" />
                Synthesize Platform
              </h3>

              <form onSubmit={handleSynthesize} className="flex-1 flex flex-col gap-6 relative z-10">
                 <textarea 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                   placeholder="e.g. Build a global decentralized video streaming mesh with sub-millisecond latency..."
                 />
                 <button 
                   type="submit"
                   disabled={isSynthesizing || !description.trim()}
                   className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                    {isSynthesizing ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                    {isSynthesizing ? 'Synthesizing Platform...' : 'Synthesize Macro-Ecosystem'}
                 </button>
              </form>
           </div>

           <div className="bg-indigo-900/10 p-8 rounded-[3rem] border border-indigo-500/20 flex gap-5">
              <div className="p-4 bg-indigo-500 text-white rounded-2xl h-fit shadow-xl shadow-indigo-500/30"><ShieldCheck size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Planetary Scale</h4>
                 <p className="text-[10px] text-indigo-700/80 leading-relaxed mt-2 font-medium">
                    Macro-Forge synthesizes all code, container images, and K8s manifests required for a global deployment across multiple clouds.
                 </p>
              </div>
           </div>
        </div>

        {/* Synthesis Results */}
        <div className="lg:col-span-2 space-y-6">
           {platform ? (
              <div className="bg-white p-10 rounded-[3rem] border-2 border-indigo-500 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 flex flex-col">
                 <div className="flex justify-between items-start mb-10 pb-10 border-b border-slate-100">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase rounded-full tracking-widest">Synthesis Ready</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness: {platform.deployment_readiness}%</span>
                       </div>
                       <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{platform.platform_name}</h2>
                    </div>
                    <button 
                      onClick={handleDeploy}
                      className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center gap-3 active:scale-95"
                    >
                       <Ship size={18} /> Launch Platform
                    </button>
                 </div>

                 <div className="mb-12">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Layers size={12} className="text-indigo-500" /> Synthesized Architecture</h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{platform.architecture_summary}"</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {platform.components.map((c, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                         <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-white text-indigo-600 shadow-sm border border-indigo-50`}>
                               {c.type.includes('Database') ? <Server size={18} /> : <Cpu size={18} />}
                            </div>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-black uppercase rounded">{c.cloud}</span>
                         </div>
                         <h5 className="text-xs font-black text-slate-800 mb-1">{c.name}</h5>
                         <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{c.purpose}</p>
                      </div>
                    ))}
                 </div>

                 <div className="mt-auto p-8 bg-indigo-950 rounded-[3rem] border border-white/5 flex gap-6 items-center">
                    <div className="p-4 bg-white/5 text-indigo-400 rounded-2xl border border-white/10"><Network size={24} /></div>
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Linkage Synthesis</p>
                       <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1 italic">"{platform.global_linkage}"</p>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[600px] flex flex-col items-center justify-center text-center opacity-30">
                 <Hammer size={80} className="text-slate-200 mb-6" />
                 <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Awaiting Macro-Synthesis</h3>
                 <p className="text-sm font-medium italic mt-2">Describe an entire multi-cloud ecosystem to begin the Macro-Forge loop.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MacroForge;
