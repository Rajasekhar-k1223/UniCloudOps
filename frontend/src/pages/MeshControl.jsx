import React, { useState, useEffect } from 'react';
import { Globe, Shield, RefreshCw, Activity, Share2, Map, Server, Zap, Radio } from 'lucide-react';
import api from '../services/api';

const MeshControl = () => {
  const [nodes, setNodes] = useState([
    { id: 'HQ-LONDON-01', name: 'London Sovereign Node', status: 'synced', latency: '22ms', load: '12%' },
    { id: 'HQ-SINGAPORE-05', name: 'Singapore Tactical Hub', status: 'synced', latency: '84ms', load: '45%' },
    { id: 'HQ-NY-SECURE', name: 'New York Mesh Node', status: 'standby', latency: '14ms', load: '0%' }
  ]);
  const [syncing, setSyncing] = useState(false);

  const startSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sovereign Mesh HQ</h1>
          <p className="text-gray-500">Decentralized synchronization across geographically distributed UniOS platform instances.</p>
        </div>
        <button 
          onClick={startSync}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          {syncing ? <RefreshCw className="animate-spin" size={18} /> : <Share2 size={18} />}
          {syncing ? 'Gossip Sync Active...' : 'Manual Mesh Sync'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Mesh Topology Visualization */}
         <div className="lg:col-span-3 glass-panel p-8 bg-slate-900 text-white relative overflow-hidden h-[600px] flex items-center justify-center">
            {/* Background Map Simulation */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            
            <div className="relative w-full h-full flex items-center justify-center">
               {/* 🛡️ Central Mesh Link 🛡️ */}
               <div className="w-[400px] h-[400px] border border-indigo-500/20 rounded-full absolute animate-pulse" />
               <div className="w-[300px] h-[300px] border border-indigo-500/10 rounded-full absolute animate-spin-slow" />
               
               {/* Local HQ Node */}
               <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-600 border-4 border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.4)] flex items-center justify-center relative">
                     <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0A0C10] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                     </div>
                     <Globe size={48} className="text-white" />
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-black uppercase tracking-widest">LOCAL_PRIME_HQ</p>
                     <p className="text-[10px] text-indigo-400 font-bold">STATE: 100% NOMINAL</p>
                  </div>
               </div>

               {/* Remote Mesh Nodes */}
               <div className="absolute top-20 left-40 flex flex-col items-center gap-2 group cursor-crosshair">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl group-hover:border-indigo-500 transition-all">
                     <Radio size={24} className="text-slate-500 group-hover:text-emerald-400" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-500">HQ-SINGAPORE</span>
               </div>

               <div className="absolute bottom-40 right-60 flex flex-col items-center gap-2 group cursor-crosshair">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl group-hover:border-indigo-500 transition-all">
                     <Radio size={24} className="text-slate-500 group-hover:text-emerald-400" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-500">HQ-LONDON</span>
               </div>
            </div>

            <div className="absolute bottom-10 left-10 p-4 glass-hud bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono text-slate-400 space-y-1">
               <p className="text-indigo-400 font-bold mb-2">MESH_DIAGNOSTICS_UP</p>
               <p>GOSSIP_FREQ: 5.0S</p>
               <p>ACTIVE_PEERS: 2/3</p>
               <p>GLOBAL_SYNC: VERIFIED</p>
            </div>
         </div>

         {/* Peer Status Sidebar */}
         <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Activity size={14} /> Peer Vitality Trace
            </h3>
            {nodes.map(n => (
              <div key={n.id} className="p-5 glass-panel bg-white border border-slate-100 hover:border-indigo-300 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-slate-800">{n.name}</h4>
                    <div className={`w-2 h-2 rounded-full ${n.status === 'synced' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Latency</p>
                       <p className="text-xs font-bold text-slate-700">{n.latency}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HQ Load</p>
                       <p className="text-xs font-bold text-slate-700">{n.load}</p>
                    </div>
                 </div>
                 <button className="w-full mt-6 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                    Peer Diagnostics
                 </button>
              </div>
            ))}

            <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield size={64} />
               </div>
               <h4 className="text-sm font-bold mb-2">Mesh Resilience</h4>
               <p className="text-[10px] text-slate-400 leading-relaxed mb-6">
                  In case of primary HQ catastrophic failure, autonomous state allows the mission boundary to shift instantly to the healthiest standby peer.
               </p>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  <span className="text-[9px] font-black uppercase text-indigo-400">Mesh Recovery READY</span>
               </div>
            </div>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow {
          animation: spin 60s linear infinite;
        }
      `}} />
    </div>
  );
};

export default MeshControl;
