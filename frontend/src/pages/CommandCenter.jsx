import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, Activity, Globe, Zap, Server, MessageSquare, AlertTriangle, RefreshCw, BarChart, Maximize2, Minimize2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import '../styles/HolographicOverlay.css';
import StrategicBriefing from '../components/intelligence/StrategicBriefing';

const CommandCenter = () => {
  const [stats, setStats] = useState({});
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, threatsRes, projectsRes] = await Promise.all([
        api.get('/security-pulse/stats'),
        api.get('/security-pulse/threats'),
        api.get('/projects')
      ]);
      setStats(statsRes.data);
      setThreats(threatsRes.data);
      setProjects(projectsRes.data);
      if (projectsRes.data.length > 0 && !activeProjectId) {
        setActiveProjectId(projectsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-[#0A0C10] text-[#00E5FF] z-[200] flex flex-col font-mono transition-all duration-700 ${isFullscreen ? 'p-0' : 'p-0'}`}>
      
      {/* Cinematic Header */}
      <header className="p-6 border-b border-[#00E5FF]/10 flex justify-between items-center bg-[#0D1117] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center animate-pulse">
                <Globe className="w-6 h-6 text-[#00E5FF]" />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase tracking-[0.2em] leading-none glitch-text">UniOS Operations HQ</h1>
                <p className="text-[10px] text-cyan-500/60 mt-1 font-bold uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" /> Unified Mission Command v8.01
                </p>
              </div>
           </div>
           
           <div className="h-10 w-px bg-[#00E5FF]/10 hidden md:block" />
           
           <div className="hidden md:flex gap-8">
              {[
                { label: 'Active Missions', value: '48/50', icon: Server },
                { label: 'Network Latency', value: '14ms', icon: Activity },
                { label: 'Security Uplink', value: 'Nominal', icon: ShieldCheck }
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                   <s.icon size={16} className="text-cyan-500/40" />
                   <div>
                      <p className="text-[9px] text-cyan-500/40 uppercase font-bold tracking-widest leading-none">{s.label}</p>
                      <p className="text-xs font-bold text-white mt-1">{s.value}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] text-cyan-500/40 font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
              <p className="text-sm font-bold text-white tabular-nums">{new Date().toLocaleTimeString()}</p>
           </div>
           <button 
             onClick={toggleFullscreen}
             className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/30 transition text-cyan-400"
           >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
           </button>
        </div>
      </header>

      {/* Main Command Grid */}
      <main className="flex-1 overflow-hidden grid grid-cols-12 gap-1 p-1 bg-black">
         
         {/* Threat Matrix (Left) */}
         <div className="col-span-12 lg:col-span-3 bg-[#0D1117] flex flex-col border border-white/5 h-full overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
               <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Shield className="w-3 h-3 text-rose-500" /> Tactical Threat Feed
               </h2>
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
               {threats.map((t) => (
                 <div key={t.id} className="p-3 bg-white/5 border-l-2 border-rose-600 rounded-r-md hover:bg-white/10 transition group cursor-crosshair relative overflow-hidden">
                    <div className="scanning-ray opacity-10" />
                    <div className="flex justify-between items-start mb-1.5">
                       <span className="text-[10px] font-bold text-rose-500 uppercase">{t.type}</span>
                       <span className="text-[9px] text-white/40 font-mono italic">{t.timestamp.split('T')[1]}</span>
                    </div>
                    <p className="text-xs text-white font-bold mb-2 group-hover:text-cyan-400">TARGET: {t.target}</p>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-white/40 font-mono">{t.source_ip}</span>
                       <span className="text-[9px] font-black uppercase text-rose-600">{t.status}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Central Visualization (Center) */}
         <div className="col-span-12 lg:col-span-6 bg-[#0D1117] flex flex-col relative overflow-hidden border border-white/5">
            {/* 🛡️ Phase 28: Holographic Tactical Overlays 🛡️ */}
            <div className="hud-ring w-[400px] h-[400px] scale-150 opacity-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="hud-ring hud-ring-outer w-[450px] h-[450px] scale-150 opacity-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="scanning-ray" />

            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20 relative z-10">
               <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 glitch-text">
                 <Globe className="w-3 h-3 text-cyan-400" /> Multi-Cloud Network Telemetry
               </h2>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#FF9900] rounded-full" /><span className="text-[8px] font-bold">AWS</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#0089D6] rounded-full" /><span className="text-[8px] font-bold">AZURE</span></div>
               </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center">
               {/* Simulated Data Stream Overlay */}
               <div className="absolute top-10 left-10 text-[9px] text-cyan-500/40 font-mono space-y-1 z-10 glass-hud p-4">
                  <p>SYS.UPLINK: ACTIVE</p>
                  <p>LATENCY: 12.04MS</p>
                  <p>PACKET_LOSS: 0.00%</p>
                  <p>MISSION_AUTH: PASS</p>
               </div>

               {/* Center Glow */}
               <div className="w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full absolute animate-pulse" />
               
               {/* Strategic Nodes Visualization (Simulated) */}
               <div className="relative z-10 flex flex-col items-center gap-10">
                  <div className="flex gap-20">
                     {[1,2].map(i => (
                        <div key={i} className="holographic-card w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:scale-110 hover:border-cyan-500 transition-all cursor-crosshair">
                           <Zap size={20} className="text-cyan-500 group-hover:animate-bounce" />
                           <span className="text-[8px] font-black">VPC_{i}</span>
                        </div>
                     ))}
                  </div>
                  <div className="w-24 h-24 rounded-full border-2 border-cyan-500/50 flex items-center justify-center animate-spin-slow relative">
                     <div className="w-20 h-20 rounded-full border border-cyan-500/20" />
                     <Globe className="absolute text-cyan-500 w-10 h-10" />
                  </div>
                  <div className="flex gap-20">
                     {[3,4].map(i => (
                        <div key={i} className="holographic-card w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:scale-110 hover:border-cyan-500 transition-all cursor-crosshair">
                           <Server size={20} className="text-cyan-400" />
                           <span className="text-[8px] font-black">RES_{i}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            {/* Bottom Status Ticker */}
            <div className="p-3 bg-black/40 border-t border-white/5 flex gap-8 items-center overflow-hidden h-10 relative z-10">
               <div className="text-[9px] font-black text-white/40 uppercase whitespace-nowrap shrink-0">Global Stream:</div>
               <div className="text-[9px] text-cyan-500/60 whitespace-nowrap animate-marquee flex gap-12">
                  <span>[00:15:20] US-EAST-1: Mission Start Success</span>
                  <span>[00:15:22] EU-CENTRAL-1: Governance Scan NOMINAL</span>
                  <span>[00:15:25] US-WEST-2: Scaling Event Initiated - Cluster size +2</span>
                  <span>[00:15:30] GLOBAL-CDN: Cache Invalidation Mission Complete (148ms)</span>
               </div>
            </div>
         </div>

         {/* Tactical Metrics (Right) */}
         <div className="col-span-12 lg:col-span-3 bg-[#0D1117] flex flex-col border border-white/5">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
               <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <BarChart className="w-3 h-3 text-emerald-500" /> Mission Telemetry
               </h2>
               <span className="text-[8px] text-emerald-500 font-bold uppercase animate-pulse">Live</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar h-full">
               
               {/* Metrics Ring Blocks */}
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'CPU LOAD', value: '42%', color: 'text-cyan-500' },
                    { label: 'MEM UTIL', value: '68%', color: 'text-indigo-500' },
                    { label: 'IOPS', value: '4.2k', color: 'text-emerald-500' },
                    { label: 'UPTIME', value: '99.9%', color: 'text-cyan-400' }
                  ].map((m, i) => (
                    <div key={i} className="holographic-card p-4 rounded-xl flex flex-col items-center justify-center gap-2">
                       <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{m.label}</p>
                       <p className={`text-xl font-black ${m.color} tabular-nums`}>{m.value}</p>
                    </div>
                  ))}
               </div>

               {/* Strategic Alerts */}
               <div className="space-y-4">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                     <AlertTriangle size={12} className="text-amber-500" /> Priority Alerts
                  </p>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl relative overflow-hidden">
                     <div className="scanning-ray opacity-10" />
                     <p className="text-[11px] font-bold text-amber-500 leading-tight">VPC-PEERING LATENCY SPIKE</p>
                     <p className="text-[9px] text-amber-500/60 mt-1 uppercase italic">AP-SOUTH-1 Mission Area</p>
                     <div className="flex gap-2 mt-3">
                        <button className="text-[8px] font-black px-2 py-1 bg-amber-500 text-black rounded uppercase hover:bg-amber-400 transition">Analyze</button>
                        <button className="text-[8px] font-black px-2 py-1 bg-white/10 text-white rounded uppercase hover:bg-white/20 transition">Dismiss</button>
                     </div>
                  </div>
               </div>

               {/* Activity Log */}
               <div className="space-y-3">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                     <MessageSquare size={12} className="text-indigo-500" /> Comm Log
                  </p>
                  <div className="bg-black/40 rounded-xl p-3 h-40 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-2 glass-hud">
                     <p><span className="text-indigo-500">[OPERATOR]</span> Manual Remediation triggered on AWS-RDS-01</p>
                     <p><span className="text-emerald-500">[SYSTEM]</span> Backup routine mission complete for CLOUD-VOL-9</p>
                     <p><span className="text-amber-500">[GOVERNANCE]</span> New Policy "Strict-vCPU-8" Authoring Session Start</p>
                     <p><span className="text-[#00E5FF]">[AI-CMD]</span> Optimizing ingress routes for EU-CENTRAL-1...</p>
                  </div>
               </div>
            </div>

            {/* Bottom Strategic Summary */}
            <div className="p-5 border-t border-white/5 bg-black/60">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-bold text-white/40 uppercase">Sovereign Intelligence</span>
                  <button 
                    onClick={() => setShowBriefing(!showBriefing)}
                    className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 hover:text-white transition"
                  >
                    <Brain size={12} /> {showBriefing ? 'Close Advisor' : 'Request Briefing'}
                  </button>
               </div>
               
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-bold text-white/40 uppercase">HQ Boundary Integrity</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">100% Operational</span>
               </div>
               <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full py-3 bg-[#00E5FF] text-black font-black text-[10px] uppercase tracking-[0.1em] rounded group flex items-center justify-center gap-2 hover:bg-[#00E5FF]/90 transition shadow-[0_0_20px_rgba(0,229,255,0.4)]"
               >
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Return to Command Terminal
               </button>
            </div>
         </div>
         
         {/* Strategic Briefing Overlay */}
         {showBriefing && (
           <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 sm:p-20">
              <div className="w-full max-w-4xl h-full max-h-[80vh] relative">
                 <button 
                   onClick={() => setShowBriefing(false)}
                   className="absolute -top-12 right-0 text-white/40 hover:text-white flex items-center gap-2 uppercase text-[10px] font-black tracking-widest"
                 >
                   Terminate Uplink <Maximize2 size={16} />
                 </button>
                 <StrategicBriefing projectId={activeProjectId} />
              </div>
           </div>
         )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 30s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,229,255,0.2);
          border-radius: 2px;
        }
      `}} />
    </div>
  );
};

export default CommandCenter;
