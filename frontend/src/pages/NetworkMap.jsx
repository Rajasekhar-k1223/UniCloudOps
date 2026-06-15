import React, { useState, useEffect } from 'react';
import { Globe, Share2, Activity, Shield, Layers, RefreshCw, Zap, Server, Box, Cpu, HardDrive, Wifi, Lock, ExternalLink } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import HolographicGlobe from '../components/intelligence/HolographicGlobe';

const NetworkMap = () => {
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState(null);

  const fetchTopology = async () => {
    setLoading(true);
    try {
      const res = await api.get('/network/topology');
      setTopology(res.data);
    } catch (err) {
      console.error("Neural Intelligence failure:", err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        
        {/* Neural Command Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-indigo-500">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                  <Globe className="animate-pulse" size={24} />
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/70">Neural Operational Layer</span>
                  <h1 className="text-4xl font-black text-white tracking-tight uppercase">Global <span className="text-slate-500">Mesh HQ</span></h1>
               </div>
            </div>
            <p className="text-slate-500 max-w-xl text-sm font-medium leading-relaxed italic">
              Real-time situational awareness across multi-cloud mission boundaries. Visualizing VPC clusters, subnet propagation, and tactical connectivity mesh.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 shrink-0">
             {[
               { label: 'Active Zones', value: topology?.nodes?.length || 0, icon: Box },
               { label: 'Subnets', value: topology?.subnets?.length || 0, icon: Layers },
               { label: 'Latency', value: '12ms', icon: Activity }
             ].map((stat, i) => (
                <div key={i} className="px-4 py-2 border-r border-white/10 last:border-0">
                   <div className="flex items-center gap-2 mb-1">
                      <stat.icon size={10} className="text-indigo-400" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                   </div>
                   <p className="text-sm font-black text-white tabular-nums">{stat.value}</p>
                </div>
             ))}
             <button 
               onClick={fetchTopology}
               disabled={loading}
               className="ml-2 w-12 h-12 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
             >
                <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
             </button>
          </div>
        </div>

        {/* 🚀 3D-Isometric Canvas Container 🚀 */}
        <div className="relative glass-panel bg-white/[0.01] border-2 border-white/5 rounded-[3rem] min-h-[750px] flex items-center justify-center overflow-hidden">
          
          {/* CyberGrid Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" 
               style={{ 
                  backgroundImage: `radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)`,
                  backgroundSize: '40px 40px',
                  perspective: '1000px'
               }} />
          
          {loading ? (
             <div className="flex flex-col items-center gap-6 relative z-50">
                <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-500/50" />
                <span className="text-xs font-black uppercase tracking-[0.6em] text-white animate-pulse">Initializing_Neural_Mapping</span>
             </div>
          ) : topology ? (
             <div className="relative w-full h-full flex flex-col items-center justify-center gap-32 p-20 z-20">
                
                {/* 🌎 THE HOLOGRAPHIC GLOBE 🌎 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                   <HolographicGlobe nodes={topology.nodes} />
                </div>

                {/* Tactical Links (Global Mesh) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                  {topology.links?.map((link, i) => (
                    <g key={link.id}>
                      <path 
                        d="M 25% 50% Q 50% 10% 75% 50%" 
                        fill="none" 
                        stroke="url(#laser)" 
                        strokeWidth="1" 
                        strokeDasharray="5 5"
                        className="opacity-20"
                      />
                      <circle r="3" fill="#6366f1" className="animate-ping">
                        <animateMotion path="M 25% 50% Q 50% 10% 75% 50%" dur="4s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  ))}
                </svg>

                {topology.nodes.map((node, idx) => (
                   <div 
                     key={node.id} 
                     className="relative perspective-1000 group transition-all duration-700" 
                     onMouseEnter={() => setHoverNode(node.id)}
                     onMouseLeave={() => setHoverNode(null)}
                   >
                      {/* Node Perspective Wrap */}
                      <div className="relative preserve-3d transform group-hover:translate-z-10 group-hover:rotate-y-[-10deg] transition-all duration-700">
                         
                         {/* VPC Command Node Card */}
                         <div className={clsx(
                            "w-72 bg-[#0a0f1e] border-2 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group-hover:scale-105 transition-all",
                            hoverNode === node.id ? "border-indigo-500/50 shadow-indigo-500/20" : "border-white/5"
                         )}>
                            {/* Inner Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[50px] rounded-full" />
                            
                            <div className="flex items-center justify-between mb-8">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white shadow-xl">
                                     <Shield size={20} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{node.provider}</p>
                                     <p className="text-sm font-black text-white uppercase tracking-tight">{node.label}</p>
                                  </div>
                               </div>
                               <div className="w-4 h-4 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: node.color, boxShadow: `0 0 15px ${node.color}` }} />
                            </div>

                            <div className="space-y-5">
                               <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network CIDR</span>
                                     <Lock size={12} className="text-indigo-400" />
                                  </div>
                                  <p className="text-xs font-mono font-bold text-indigo-300 tracking-wider bg-indigo-500/5 px-2 py-1 rounded-lg w-fit">{node.cidr}</p>
                               </div>

                               <div className="space-y-2">
                                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                     <Layers size={12} /> Active Mission Zones
                                  </p>
                                  {topology.subnets.filter(s => s.vpc_id === node.id).map(subnet => (
                                    <div key={subnet.id} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/5 transition-all group/subnet">
                                       <div className="flex items-center gap-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/subnet:bg-indigo-500" />
                                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight group-hover/subnet:text-white transition-colors">{subnet.label}</span>
                                       </div>
                                       <p className="text-[9px] font-mono text-slate-600 group-hover/subnet:text-slate-400">{subnet.cidr || 'DHCP-MTU'}</p>
                                    </div>
                                  ))}
                               </div>
                            </div>

                            <button className="mt-8 w-full py-4 bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600">
                               Manage Routing <ExternalLink size={12} />
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          ) : (
             <div className="text-center opacity-30 flex flex-col items-center gap-4">
                <Share2 size={64} className="text-slate-500 mb-2" />
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Tactical Silence Mode</h3>
                <p className="text-sm font-medium">No strategic network topology established for current mission boundary.</p>
             </div>
          )}
        </div>

        {/* 🔍 Dynamic Telemetry Trace 🔍 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'Neural Analysis', desc: 'Predicting VPC peering latency based on regional propagation signatures.', icon: Cpu },
             { title: 'Storage Integrity', desc: 'Cross-cloud block storage mounting points identified and audited.', icon: HardDrive },
             { title: 'Backbone Mesh', desc: 'Sovereign VPN tunnels synchronized with 256-bit AES encryption.', icon: Wifi }
           ].map((trace, i) => (
             <div key={i} className="glass-panel p-8 bg-white/[0.01] border-white/5 hover:border-indigo-500/20 transition-all rounded-[2rem] group">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                      <trace.icon className="text-indigo-400" size={20} />
                   </div>
                   <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{trace.title}</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                   {trace.desc}
                </p>
             </div>
           ))}
        </div>

      </div>
      
      {/* Visual Decorations */}
      <div className="fixed -bottom-64 -left-64 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -top-64 -right-64 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default NetworkMap;
