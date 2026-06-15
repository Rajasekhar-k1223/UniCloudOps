import React, { useState, useEffect } from 'react';
import { Box, Layers, Zap, Radio, Target, RefreshCw, Eye, Move, Maximize2, Cpu, Globe, Compass } from 'lucide-react';
import api from '../services/api';

const ImmersiveOps = () => {
  const [mesh, setMesh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState({ x: 60, y: 0, z: 45 });

  const fetchMesh = async () => {
    try {
      const res = await api.get('/immersive/mesh');
      setMesh(res.data);
    } catch (err) {
      console.error("Spatial Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesh();
    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, y: (prev.y + 1) % 360 }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-indigo-500 w-12 h-12" />
       <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Initializing_Spatial_Command_Deck...</p>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] relative overflow-hidden bg-[#020617] rounded-[3rem] border border-white/5 shadow-2xl">
      {/* 3D Simulation Container */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[2000px]">
         <div 
           className="relative w-[800px] h-[800px] transition-transform duration-500 preserve-3d"
           style={{ transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg) rotateY(${rotation.y}deg)` }}
         >
            {/* Grid Floor */}
            <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full [background-image:radial-gradient(circle_at_center,transparent_0%,rgba(79,70,229,0.05)_100%),linear-gradient(rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.1)_1px,transparent_1px)] [background-size:100%_100%,40px_40px,40px_40px]" />
            
            {/* Center Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full border border-indigo-500 shadow-[0_0_100px_rgba(79,70,229,0.4)] flex items-center justify-center">
               <Globe className="text-indigo-400 animate-pulse" size={48} />
            </div>

            {/* Spatial Nodes */}
            {mesh.nodes.map((node) => (
              <div 
                key={node.id}
                className="absolute w-24 h-24 preserve-3d transition-all duration-1000"
                style={{ 
                  left: `calc(50% + ${node.x}px)`, 
                  top: `calc(50% + ${node.y}px)`,
                  transform: `translateZ(${node.z}px)` 
                }}
              >
                 <div className="w-full h-full bg-slate-900 border-2 border-indigo-500 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:scale-110 hover:border-emerald-500 transition-all cursor-pointer group">
                    <Cpu className="text-indigo-400 group-hover:text-emerald-400" size={24} />
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">{node.name}</span>
                    <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500" style={{ width: `${node.load}%` }} />
                    </div>
                 </div>
                 {/* Vertical Connector Line to floor */}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent" style={{ height: '300px', transformOrigin: 'top' }} />
              </div>
            ))}

            {/* Corridors (Simulated via SVG overlay or lines) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
               {/* Simplified connection logic for visualization */}
            </svg>
         </div>
      </div>

      {/* HUD Overlays */}
      <div className="absolute top-10 left-10 z-20 space-y-6">
         <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
            <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20"><Layers size={24} /></div>
            <div>
               <h1 className="text-xl font-black text-white uppercase tracking-tight">Immersive Operations</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spatial Meta-Command Mode Active</p>
            </div>
         </div>
         <div className="flex gap-4">
            {['Tactical', 'Security', 'Traffic'].map(m => (
              <button key={m} className="px-6 py-2 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-indigo-500 transition-all">
                 {m} Overlay
              </button>
            ))}
         </div>
      </div>

      <div className="absolute top-10 right-10 z-20 flex flex-col gap-4">
         <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Compass size={12} className="text-indigo-400" /> Navigation
            </h3>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setRotation(r => ({ ...r, x: r.x + 5 }))} className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-all"><Move size={14} className="rotate-90" /></button>
               <button onClick={() => setRotation(r => ({ ...r, x: r.x - 5 }))} className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-all"><Move size={14} className="-rotate-90" /></button>
            </div>
         </div>
         <button className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
            <Maximize2 size={24} />
         </button>
      </div>

      {/* Bottom Telemetry */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[600px] bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center font-black">AI</div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spatial Sync Status</p>
               <p className="text-sm font-black text-white uppercase tracking-widest">Quantum Link: STABLE</p>
            </div>
         </div>
         <div className="flex gap-10">
            <div className="text-center">
               <p className="text-[9px] font-black text-slate-500 uppercase">Latency</p>
               <p className="text-lg font-black text-emerald-400">0.4ms</p>
            </div>
            <div className="text-center">
               <p className="text-[9px] font-black text-slate-500 uppercase">Complexity</p>
               <p className="text-lg font-black text-indigo-400">Tier-6</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ImmersiveOps;
