import React, { useState, useEffect } from 'react';
import { Server, Activity, Disc, Cpu, Shield, Plus, RefreshCw, Zap, Wifi, Signal } from 'lucide-react';
import api from '../services/api';

const EdgeNodes = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const fetchNodes = async () => {
    try {
      const res = await api.get('/resources');
      // Filter for Edge nodes only
      setNodes(res.data.filter(r => r.provider === 'edge' || r.type.includes('Edge')));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sovereign Edge Orchestrator</h1>
          <p className="text-gray-500">Manage bare-metal and on-premise industrial assets via tactical agent mesh.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition shadow-lg shadow-slate-200"
        >
          <Plus size={18} />
          Register Edge Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic font-medium uppercase tracking-widest text-xs">Awaiting Agent Handshake...</div>
        ) : nodes.length === 0 ? (
          <div className="col-span-full py-20 glass-panel bg-slate-50 border-dashed border-2 border-slate-200 text-center">
             <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="font-bold text-slate-600">No Edge Nodes Registered</h3>
             <p className="text-sm text-slate-400 mt-2">Scale your mission boundary beyond the cloud by registering industrial assets.</p>
          </div>
        ) : nodes.map((node) => (
          <div key={node.id} className="glass-panel p-6 bg-white border border-slate-100 hover:border-indigo-300 transition-all group">
             <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg ring-4 ring-slate-100 group-hover:ring-indigo-50 transition-all">
                   <Cpu size={24} className="group-hover:animate-pulse" />
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2 mb-1">
                      <Signal size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Link</span>
                   </div>
                   <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{node.private_ip}</span>
                </div>
             </div>

             <h3 className="font-bold text-gray-800 text-lg mb-1">{node.name}</h3>
             <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Wifi size={10} /> Sovereign Mesh Node • US-HQ-01
             </p>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Compute Archetype</p>
                   <p className="text-xs font-bold text-slate-700 uppercase">{node.instance_type}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Uptime Trace</p>
                   <p className="text-xs font-bold text-slate-700">99.9% Operational</p>
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                   <Activity size={14} className="text-indigo-400" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase">HEARTBEAT NOMINAL</span>
                </div>
                <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Agent Console</button>
             </div>
          </div>
        ))}
      </div>

      {/* Industrial Hardening Notice */}
      <div className="mt-12 glass-panel p-8 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
               <Shield size={48} className="text-emerald-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h3 className="text-xl font-bold mb-2">Industrial Grid Hardening</h3>
               <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                 UniOS Sovereign Edge nodes are cryptographically verified via mutual TLS. Each agent maintains a tactical heartbeat mission, ensuring near-zero latency for mission-critical industrial workloads.
               </p>
            </div>
            <button className="px-8 py-4 bg-emerald-500 text-black font-black text-sm rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10">
               Download Tactical Agent
            </button>
         </div>
      </div>
    </div>
  );
};

export default EdgeNodes;
