import React, { useState, useEffect } from 'react';
import { Globe, Zap, Ship, RefreshCw, Cpu, HardDrive, Server, Activity, ShieldCheck, Info, Map, Terminal, Network } from 'lucide-react';
import api from '../services/api';

const GalacticMesh = () => {
  const [mesh, setMesh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warping, setWarping] = useState(null);

  const fetchMesh = async () => {
    try {
      const res = await api.get('/galactic/nodes');
      setMesh(res.data);
    } catch (err) {
      console.error("Galactic synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesh();
  }, []);

  const handleWarp = async (workloadId, targetNode) => {
    setWarping(workloadId);
    try {
      const res = await api.post('/galactic/warp', { workload_id: workloadId, target_node: targetNode });
      alert(res.data.message);
      fetchMesh();
    } catch (err) {
      alert("Warp Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setWarping(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-purple-500 w-12 h-12" />
       <p className="text-xs font-black text-purple-400 uppercase tracking-[0.4em]">Synchronizing_Galactic_Compute_Mesh...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#2e1065] p-10 rounded-[3rem] border border-purple-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl shadow-lg shadow-purple-500/10"><Globe size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Galactic Compute Mesh</h1>
          </div>
          <p className="text-purple-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-7 Absolute Abstraction. A unified compute fabric merging Cloud, Edge, and Private DC into a single "Galactic Computer" with seamless workload mobility.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Network size={250} className="text-purple-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Galactic Stats */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Mesh Capacity</h3>
               <p className="text-4xl font-black text-slate-800">{mesh.total_capacity}</p>
               <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 animate-pulse" style={{ width: '68%' }} />
               </div>
            </div>

            <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[9px] font-black text-slate-500 uppercase">Active Workloads</p>
                     <p className="text-xl font-black text-white">{mesh.active_workloads}</p>
                  </div>
                  <Activity className="text-emerald-500" size={24} />
               </div>
               <div className="h-px bg-white/5" />
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[9px] font-black text-slate-500 uppercase">Global Warp Status</p>
                     <p className="text-xl font-black text-purple-400">READY</p>
                  </div>
                  <Ship className="text-purple-400" size={24} />
               </div>
            </div>

            <div className="bg-purple-900/10 p-8 rounded-[3rem] border border-purple-500/20 flex gap-4">
               <div className="p-3 bg-purple-500 text-white rounded-2xl h-fit shadow-lg shadow-purple-500/20"><Info size={20} /></div>
               <p className="text-[10px] text-purple-900 font-medium leading-relaxed uppercase tracking-tight">
                  Workloads are automatically warped between node types based on latency, cost, and mission priority.
               </p>
            </div>
         </div>

         {/* Mesh Nodes */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <Map size={14} className="text-purple-500" />
                 Unified Galactic Infrastructure
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mesh.nodes.map((node) => (
                    <div key={node.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-purple-200 transition-all flex flex-col justify-between">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-4">
                             <div className={`p-4 rounded-2xl shadow-xl ${
                                node.type === 'Cloud' ? 'bg-indigo-600 text-white shadow-indigo-100' : 
                                node.type === 'Edge' ? 'bg-emerald-600 text-white shadow-emerald-100' : 
                                'bg-slate-900 text-white shadow-slate-200'
                             }`}>
                                {node.type === 'Cloud' ? <Server size={24} /> : node.type === 'Edge' ? <Cpu size={24} /> : <HardDrive size={24} />}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.type} | {node.provider}</p>
                                <h4 className="text-sm font-black text-slate-800">{node.name}</h4>
                                <p className="text-[10px] font-bold text-slate-500 italic">{node.region}</p>
                             </div>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${node.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {node.status}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                             <span className="text-slate-400">Node Load</span>
                             <span className="text-slate-800">{node.load}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${node.load > 80 ? 'bg-rose-500' : 'bg-purple-500'}`} style={{ width: `${node.load}%` }} />
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                             <button 
                               onClick={() => handleWarp('MISSION-X', node.id)}
                               disabled={warping === 'MISSION-X'}
                               className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
                             >
                                {warping === 'MISSION-X' ? <RefreshCw className="animate-spin" size={12} /> : <Ship size={12} />}
                                {warping === 'MISSION-X' ? 'Warping...' : 'Warp Workload'}
                             </button>
                             <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-purple-600 transition-all">
                                <Terminal size={14} />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex gap-6 items-center">
                  <div className="p-4 bg-purple-600 text-white rounded-2xl h-fit shadow-xl shadow-purple-200"><ShieldCheck size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest">Absolute Compute Sovereignty</h4>
                     <p className="text-[11px] text-purple-800/70 leading-relaxed mt-2 font-medium">
                        The Galactic Mesh provides a single global interface for every compute resource in your empire. Hardware is abstracted; only mission execution remains.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GalacticMesh;
