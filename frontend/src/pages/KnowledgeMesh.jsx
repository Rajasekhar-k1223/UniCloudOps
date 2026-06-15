import React, { useState, useEffect } from 'react';
import { Share2, Zap, Brain, RefreshCw, Network, Radio, Target, Activity, ShieldCheck, Info, ArrowRight } from 'lucide-react';
import api from '../services/api';

const KnowledgeMesh = () => {
  const [mesh, setMesh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(null);

  const fetchMesh = async () => {
    try {
      const res = await api.get('/knowledge/mesh');
      setMesh(res.data);
    } catch (err) {
      console.error("Mesh Synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesh();
  }, []);

  const handleBroadcast = async (signalId) => {
    setBroadcasting(signalId);
    try {
      const res = await api.post('/knowledge/broadcast', { signal_id: signalId });
      alert(res.data.message);
      fetchMesh();
    } catch (err) {
      alert("Broadcast Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setBroadcasting(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-indigo-500 w-12 h-12" />
       <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Synchronizing_Global_Knowledge_Mesh...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e1b4b] p-10 rounded-[3rem] border border-indigo-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><Network size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Global Knowledge Mesh</h1>
          </div>
          <p className="text-indigo-200/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-6 Autonomous Cross-Mission Learning. Every tactical event (failover, patch, or optimization) in one project orbit is automatically propagated to the entire mission fleet.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Share2 size={250} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mesh Stats */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Mesh Integrity</h3>
              
              <div className="relative mb-8">
                 <div className="w-48 h-48 rounded-full border-8 border-indigo-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.1)]">
                    <div>
                       <p className="text-5xl font-black text-indigo-600">{mesh.mesh_integrity}%</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Neural Sync</p>
                    </div>
                 </div>
                 <div className="absolute inset-0 border-t-8 border-indigo-500 rounded-full animate-spin duration-[4000ms]" style={{ opacity: 0.3 }} />
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] w-full flex items-center justify-between px-8">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">Active Nodes</p>
                    <p className="text-2xl font-black text-white">{mesh.active_nodes}</p>
                 </div>
                 <div className="h-8 w-1 bg-indigo-500/50 rounded-full" />
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Latency</p>
                    <p className="text-2xl font-black text-emerald-400">4ms</p>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-900/10 p-8 rounded-[3rem] border border-indigo-500/20 flex gap-5">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl h-fit shadow-xl shadow-indigo-500/30"><Brain size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Collective Intelligence</h4>
                 <p className="text-[10px] text-indigo-800/80 leading-relaxed mt-2 font-medium">
                    The Global Mesh ensures that a failure in one mission orbit becomes a protective guardrail for all others instantly.
                 </p>
              </div>
           </div>
        </div>

        {/* Intelligence Signals */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Activity size={14} className="text-indigo-500" />
                Live Intelligence Broadcasts
              </h3>

              <div className="space-y-4">
                 {mesh.signals.map((s) => (
                   <div key={s.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-100"><Radio size={16} className={s.status === 'broadcasting' ? 'animate-pulse' : ''} /></div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.id} | {s.source_mission}</p>
                               <p className="text-sm font-black text-slate-800">{s.event}</p>
                            </div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${s.status === 'propagated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {s.status}
                         </div>
                      </div>

                      <div className="p-5 bg-white rounded-2xl border border-slate-100 mb-6">
                         <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Extracted Learning</p>
                         <p className="text-xs font-bold text-slate-600 italic">"{s.learning}"</p>
                      </div>

                      <div className="flex items-center justify-between">
                         <div className="flex gap-2">
                            {s.targets.map((t, i) => (
                               <span key={i} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">{t}</span>
                            ))}
                         </div>
                         <button 
                           onClick={() => handleBroadcast(s.id)}
                           disabled={broadcasting === s.id}
                           className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2"
                         >
                            {broadcasting === s.id ? <RefreshCw className="animate-spin" size={12} /> : <Zap size={12} />}
                            {broadcasting === s.id ? 'Propagating...' : 'Re-Broadcast Signal'}
                         </button>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex gap-6 items-center">
                 <div className="p-4 bg-indigo-600 text-white rounded-2xl h-fit shadow-xl shadow-indigo-200"><ShieldCheck size={24} /></div>
                 <div>
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Immune System Synchronization</h4>
                    <p className="text-[11px] text-indigo-800/70 leading-relaxed mt-2 font-medium">
                       The Knowledge Mesh acts as a global immune system. New threats are identified once and protected against globally.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeMesh;
