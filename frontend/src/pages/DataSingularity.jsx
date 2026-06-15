import React, { useState, useEffect } from 'react';
import { Database, Zap, ShieldCheck, RefreshCw, Layers, Activity, Brain, Info, Network, Server, Ship, Gauge } from 'lucide-react';
import api from '../services/api';

const DataSingularity = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWarping, setIsWarping] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/data-singularity/sync');
      setData(res.data);
    } catch (err) {
      console.error("Data Sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWarp = async (orbitName) => {
    setIsWarping(orbitName);
    try {
      const res = await api.post('/data-singularity/warp', { target_orbit: orbitName });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Data Warp Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsWarping(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-blue-500 w-12 h-12" />
       <p className="text-xs font-black text-blue-400 uppercase tracking-[0.4em]">Synchronizing_Universal_Data_Singularity...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e3a8a] p-10 rounded-[3rem] border border-blue-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl shadow-lg shadow-blue-500/10"><Database size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Universal Data Singularity</h1>
          </div>
          <p className="text-blue-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-10 Global Memory Mesh. Unification of every multi-cloud database into a single, sub-millisecond memory space through AI-driven predictive caching.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Network size={250} className="text-blue-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Latency HUD */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Average Global Data Latency</h3>
               
               <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full border-8 border-blue-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                     <div>
                        <p className="text-4xl font-black text-blue-600">{data.average_latency}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Sub_MS_Mesh_Status</p>
                     </div>
                  </div>
                  <div className="absolute inset-0 border-t-8 border-blue-500 rounded-full animate-spin duration-[2000ms]" style={{ opacity: 0.3 }} />
               </div>

               <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Global Memory</p>
                  <p className="text-xl font-black text-white">{data.global_memory_space}</p>
               </div>
            </div>

            <div className="bg-blue-900/10 p-8 rounded-[3rem] border border-blue-500/20 flex gap-4">
               <div className="p-3 bg-blue-500 text-white rounded-2xl h-fit shadow-lg shadow-blue-500/20"><Gauge size={20} /></div>
               <p className="text-[10px] text-blue-900 font-medium leading-relaxed uppercase tracking-tight">
                  Predictive caching moves state to the next mission orbit 500ms *before* the workload arrives, eliminating data transfer latency.
               </p>
            </div>
         </div>

         {/* Orbit Mesh */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <Server size={14} className="text-blue-500" />
                 Global Memory Mesh Orbits
               </h3>

               <div className="space-y-4">
                  {data.orbits.map((orbit) => (
                    <div key={orbit.name} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-2xl shadow-xl bg-slate-900 text-white`}>
                             <Database size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{orbit.status}</p>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                   orbit.sync_level > 99 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                   {orbit.sync_level}% SYNC
                                </span>
                             </div>
                             <h4 className="text-sm font-black text-slate-800">{orbit.name}</h4>
                             <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Orbit Latency: {orbit.latency}</p>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleWarp(orbit.name)}
                         disabled={isWarping === orbit.name}
                         className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center gap-3 active:scale-95"
                       >
                          {isWarping === orbit.name ? <RefreshCw className="animate-spin" size={16} /> : <Ship size={16} />}
                          {isWarping === orbit.name ? 'Warping Data...' : 'Warm Cache'}
                       </button>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-blue-950 rounded-[2.5rem] border border-white/5 flex gap-6 items-center">
                  <div className="p-4 bg-white/5 text-blue-400 rounded-2xl border border-white/10"><Brain size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest">Universal Synchronicity</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-medium">
                        The Universal Data Singularity treats the entire planet's storage as a single, local memory space. Data is never "moved" late; it is always where the AI predicts it will be needed next.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DataSingularity;
