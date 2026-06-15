import React, { useState, useEffect } from 'react';
import { Globe, Zap, ShieldCheck, RefreshCw, Ship, Activity, Brain, Info, Satellite, Target, Rocket, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

const SpaceMesh = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWarping, setIsWarping] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/space-mesh/nodes');
      setData(res.data);
    } catch (err) {
      console.error("Orbital Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWarp = async (nodeId) => {
    setIsWarping(nodeId);
    try {
      const res = await api.post('/space-mesh/warp', { node_id: nodeId, mission_id: 'MISSION-Z' });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Warp Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsWarping(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-purple-500 w-12 h-12" />
       <p className="text-xs font-black text-purple-400 uppercase tracking-[0.4em]">Synchronizing_Orbital_Mesh_Orbits...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e1b4b] p-10 rounded-[3rem] border border-purple-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl shadow-lg shadow-purple-500/10"><Satellite size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Multi-Dimensional Mesh</h1>
          </div>
          <p className="text-purple-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-9 Interstellar Compute. Integration of LEO Satellite nodes into the galactic mesh. Warp mission workloads to orbital nodes to bypass terrestrial disruptions.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Globe size={250} className="text-purple-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Orbital HUD */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Interstellar Connectivity</h3>
               
               <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full border-8 border-purple-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                     <div>
                        <p className="text-4xl font-black text-purple-600">{data.terrestrial_connectivity}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Uptime_Index</p>
                     </div>
                  </div>
                  <div className="absolute inset-0 border-t-8 border-purple-500 rounded-full animate-spin duration-[6000ms]" style={{ opacity: 0.3 }} />
               </div>

               <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Space Warps</p>
                  <p className="text-xl font-black text-purple-400">{data.active_space_warps}</p>
               </div>
            </div>

            <div className="bg-purple-900/10 p-8 rounded-[3rem] border border-purple-500/20 flex gap-4">
               <div className="p-3 bg-purple-500 text-white rounded-2xl h-fit shadow-lg shadow-purple-500/20"><Rocket size={20} /></div>
               <p className="text-[10px] text-purple-900 font-medium leading-relaxed uppercase tracking-tight">
                  Orbital nodes provide high-availability compute paths that are physically decoupled from terrestrial fiber networks.
               </p>
            </div>
         </div>

         {/* Orbital Nodes */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <Satellite size={14} className="text-purple-500" />
                 LEO Orbital Compute Nodes
               </h3>

               <div className="space-y-4">
                  {data.orbital_nodes.map((node) => (
                    <div key={node.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-purple-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-2xl shadow-xl bg-slate-900 text-white`}>
                             <Satellite size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.id} | Alt: {node.altitude}</p>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                   node.status === 'optimal' ? 'bg-emerald-100 text-emerald-700' : 
                                   node.status === 'stable' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                   {node.status}
                                </span>
                             </div>
                             <h4 className="text-sm font-black text-slate-800">{node.name}</h4>
                             <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Latency: {node.latency} | Capacity: {node.capacity}</p>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleWarp(node.id)}
                         disabled={isWarping === node.id}
                         className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-purple-600 transition-all flex items-center gap-3 active:scale-95"
                       >
                          {isWarping === node.id ? <RefreshCw className="animate-spin" size={16} /> : <ArrowUpRight size={16} />}
                          {isWarping === node.id ? 'Warping to Orbit...' : 'Warp to Node'}
                       </button>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex gap-6 items-center">
                  <div className="p-4 bg-purple-600 text-white rounded-2xl h-fit shadow-xl shadow-purple-200"><Info size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest">Planetary-Disruption Defense</h4>
                     <p className="text-[11px] text-purple-800/70 leading-relaxed mt-2 font-medium">
                        The Multi-Dimensional Mesh ensures that mission continuity is maintained even during global internet outages. Workloads can warp to orbit and synchronize via inter-satellite laser links.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SpaceMesh;
