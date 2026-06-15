import React, { useState } from 'react';
import { Hammer, Sparkles, Code, Box, Ship, RefreshCw, Send, Zap, Activity, Info, FileCode, Terminal } from 'lucide-react';
import api from '../services/api';

const MissionForge = () => {
  const [prompt, setPrompt] = useState('');
  const [isForging, setIsForging] = useState(false);
  const [artifacts, setArtifacts] = useState(null);
  const [activeTab, setActiveTab] = useState('app_code');

  const handleForge = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsForging(true);
    setArtifacts(null);
    try {
      const res = await api.post('/forge/generate', { requirement: prompt });
      setArtifacts(res.data.artifacts);
    } catch (err) {
      alert("Forge Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#020617] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl shadow-lg shadow-amber-500/10"><Hammer size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Mission Forge</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-6 Autonomous Code-to-Cloud Singularity. Instantly synthesize production-ready microservices, container images, and K8s manifests from natural language requirements.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={250} className="text-amber-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Forge */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles size={120} className="text-amber-500" /></div>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2 relative z-10">
                <Hammer size={14} className="text-amber-500" />
                Forge Requirement
              </h3>

              <form onSubmit={handleForge} className="flex-1 flex flex-col gap-6 relative z-10">
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium text-slate-800 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 custom-scrollbar"
                   placeholder="e.g. 'Build a high-performance Python FastAPI service for inventory management with Redis caching and health endpoints.'"
                 />
                 <button 
                   type="submit"
                   disabled={isForging || !prompt.trim()}
                   className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                    {isForging ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                    {isForging ? 'Forging Neural Artifacts...' : 'Initiate Mission Forge'}
                 </button>
              </form>
           </div>

           <div className="bg-amber-900/10 p-8 rounded-[3rem] border border-amber-500/20 flex gap-5">
              <div className="p-4 bg-amber-500 text-white rounded-2xl h-fit shadow-xl shadow-amber-500/30"><Info size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Neural Forge Protocol</h4>
                 <p className="text-[10px] text-amber-700/80 leading-relaxed mt-2 font-medium">
                    Mission Forge utilizes Sovereign-AI to generate production-grade code, optimized Dockerfiles, and fully-compliant K8s manifests for immediate deployment.
                 </p>
              </div>
           </div>
        </div>

        {/* Generated Artifacts */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[600px] flex flex-col">
              {!artifacts ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <Box size={80} className="text-slate-200 mb-6" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Awaiting Forge Cycle</h3>
                    <p className="text-sm font-medium italic mt-2">Enter your mission requirement to begin the code-to-cloud synthesis.</p>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-700">
                   <div className="flex gap-4 mb-8">
                      {['app_code', 'dockerfile', 'k8s_manifest'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            activeTab === tab ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                           {tab.replace('_', ' ')}
                        </button>
                      ))}
                   </div>

                   <div className="flex-1 bg-slate-950 rounded-[2.5rem] p-8 font-mono text-[11px] text-emerald-400 overflow-auto custom-scrollbar relative border-4 border-slate-900">
                      <pre className="whitespace-pre-wrap">{artifacts[activeTab]}</pre>
                      <button className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all border border-white/10">
                         <FileCode size={16} />
                      </button>
                   </div>

                   <div className="mt-8 flex gap-6 items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <div className="flex gap-4 items-center">
                         <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
                         <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Ready for Deployment</p>
                      </div>
                      <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95">
                         Deploy Mission Orbit
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ size, className }) => <Activity size={size} className={className} />;

export default MissionForge;
