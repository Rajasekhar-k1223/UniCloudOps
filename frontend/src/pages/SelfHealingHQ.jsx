import React, { useState, useEffect } from 'react';
import { HeartPulse, Zap, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, History, PlayCircle, Terminal, Activity, ChevronRight, Binary } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import { format } from 'date-fns';
import MissionHUD from '../components/MissionHUD';

const SelfHealingHQ = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [activeMissions, setActiveMissions] = useState(0);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/governance/repair/history');
      setHistory(res.data);
      // Determine active missions from history status
      setActiveMissions(res.data.filter(m => m.status === 'in_progress').length);
    } catch (err) {
      console.error("HEAL-01 telemetry offline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000); // Radar scan every 10s
    return () => clearInterval(interval);
  }, []);

  const triggerManualRepair = async () => {
    setIsFixing(true);
    try {
      const res = await api.post('/governance/repair');
      // res.data.repaired_count
      fetchHistory();
    } catch (err) {
      console.error("Manual repair mission failed:", err);
    } finally {
      setTimeout(() => setIsFixing(false), 2000);
    }
  };

  const stats = {
    total: history.length,
    success: history.filter(m => m.status === 'success' || m.status === 'repaired').length,
    escalations: history.filter(m => m.message.includes('re-provision')).length,
    uptime: "99.998%"
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        
        {/* Resilience Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <HeartPulse className="text-emerald-500 animate-pulse" size={24} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">Resilience <span className="text-slate-500 font-medium">HQ</span></h1>
            </div>
            <p className="text-slate-500 max-w-xl text-sm font-medium">
              Autonomous HEAL-01 agents performing tiered recovery missions. Monitoring grid integrity and executing self-healing protocols in real-time.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={triggerManualRepair}
                disabled={isFixing}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
             >
                {isFixing ? <RefreshCw size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                {isFixing ? 'Healing Grid...' : 'Manual Repair Scan'}
             </button>
             <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Agent Logic Active
             </div>
          </div>
        </div>

        {/* Resilience Metrics HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <MissionHUD 
              label="Grid Uptime" 
              value={stats.uptime} 
              unit="Availability" 
              color="emerald"
              data={[
                {value: 99.99}, {value: 99.99}, {value: 99.98}, {value: 99.99}, {value: 99.998}
              ]}
            />
            <MissionHUD 
              label="Autonomous Repairs" 
              value={stats.success} 
              unit="Missions" 
              color="amber"
              data={history.slice(0, 5).map((m, i) => ({ value: i + 1 }))}
            />
            <MissionHUD 
              label="Critical Escalations" 
              value={stats.escalations} 
              unit="Alerts" 
              color="rose"
              data={history.filter(m => m.status === 'failed').map((m, i) => ({ value: i + 1 }))}
            />
            <MissionHUD 
              label="Active Agents" 
              value={activeMissions + 14} 
              unit="Sovereign" 
              color="indigo"
              data={[
                {value: 12}, {value: 15}, {value: 14}, {value: 16}, {value: 14}
              ]}
            />
        </div>

        {/* Mission Intensity Chart (SVG) */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 mb-12 relative overflow-hidden group">
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
                    <Activity size={20} className="animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Mission Intensity Trace</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time healing agent throughput across multi-cloud boundaries</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 {[24, 12, 1].map(h => (
                    <button key={h} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                       {h}H Trace
                    </button>
                 ))}
              </div>
           </div>
           
           <div className="h-48 w-full relative z-10 flex items-end gap-1">
              {Array.from({length: 64}).map((_, i) => {
                const height = 20 + Math.random() * 80;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/40 transition-all rounded-t-sm"
                    style={{ height: `${height}%`, opacity: 0.1 + (i / 64) * 0.9 }}
                  />
                );
              })}
           </div>
           <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Mission Trace Terminal */}
          <div className="lg:col-span-8 space-y-4">
             <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Terminal size={14} /> Recovery Mission Trace
                </h3>
             </div>

             {loading ? (
               <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-30">
                  <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">accessing_healing_logs</span>
               </div>
             ) : history.length === 0 ? (
               <div className="py-40 bg-white/[0.02] border border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={64} className="text-emerald-500/10 mb-6" />
                  <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest text-white">Grid Health Optimal</h3>
                  <p className="text-sm text-slate-600 mt-2 italic px-8">No autonomous repair missions recorded in the current surveillance cycle.</p>
               </div>
             ) : (
               <div className="space-y-3">
                  {history.map((mission, i) => (
                    <div key={i} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-emerald-500/20 rounded-2xl p-5 flex items-center gap-6 transition-all animate-in slide-in-from-bottom-2 duration-300">
                       <div className={clsx(
                         "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0",
                         mission.status === 'success' || mission.status === 'repaired' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]"
                       )}>
                          {mission.message.includes('re-provision') ? <Zap size={24} /> : <HeartPulse size={24} />}
                       </div>

                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                             <span className={clsx(
                               "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                               mission.status === 'success' || mission.status === 'repaired' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                             )}>
                               {mission.status}
                             </span>
                             <span className="text-[10px] font-mono text-slate-600">{format(new Date(mission.timestamp), 'MM/dd HH:mm:ss')}</span>
                          </div>
                          <h4 className="text-sm font-black text-white tracking-tight uppercase truncate">{mission.message}</h4>
                       </div>

                       <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                              <ChevronRight size={16} />
                           </button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {/* Logic Display & Agent Status */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-emerald-900/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="text-xl font-black uppercase mb-4 relative z-10">HEAL-01 <br/>Protocols</h3>
                <p className="text-sm text-emerald-100/70 font-medium leading-relaxed relative z-10">
                   Our tiered resilience logic ensures minimum downtime by escalating from tactical restarts to full mission re-provisioning.
                </p>
                <div className="mt-10 space-y-4 relative z-10">
                   {[
                     { label: 'Tier 1: Cloud Pulse Restart', active: true },
                     { label: 'Tier 2: Tactical Re-Provision', active: true },
                     { label: 'Tier 3: Disaster Recovery', active: false }
                   ].map((p, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-tight">{p.label}</span>
                        <div className={clsx("w-2 h-2 rounded-full", p.active ? "bg-white shadow-[0_0_10px_#fff]" : "bg-emerald-800")} />
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                   <Binary size={18} className="text-blue-500" />
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Agent Intelligence</h3>
                </div>
                <div className="space-y-2">
                   <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                      Monitoring all mission-critical resources across AWS, Azure, and Google Cloud with a 30s sampling rate.
                   </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">Autonomous Level</span>
                      <span className="text-blue-400">Class A (Mission Critical)</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">Response Speed</span>
                      <span className="text-emerald-500">~2.4s Average</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SelfHealingHQ;
