import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, Search, Filter, Database, User, Calendar, ExternalLink, AlertCircle, CheckCircle2, Terminal, Activity } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import clsx from 'clsx';

const Governance = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total_events: 0, failed_missions: 0, recent_mission_launches: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [logsRes, summaryRes] = await Promise.all([
        api.get('/audit/', { params: { limit: 100 } }),
        api.get('/audit/summary')
      ]);
      setLogs(logsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Governance core offline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
    const interval = setInterval(fetchAuditData, 30000); // Radar sweep every 30s
    return () => clearInterval(interval);
  }, []);

  const getActionBadge = (action) => {
    const baseClass = "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border";
    if (action.includes('MISSION')) return <span className={clsx(baseClass, "bg-blue-500/10 text-blue-400 border-blue-500/20")}>Mission</span>;
    if (action.includes('AUTH')) return <span className={clsx(baseClass, "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>Auth</span>;
    if (action.includes('PROJECT')) return <span className={clsx(baseClass, "bg-indigo-500/10 text-indigo-400 border-indigo-500/20")}>Project</span>;
    return <span className={clsx(baseClass, "bg-slate-500/10 text-slate-400 border-slate-500/20")}>System</span>;
  };

  const actions = ['ALL', 'MISSION_LAUNCH', 'AUTH_LOGIN', 'PROJECT_CREATE', 'PROJECT_GUARDRAIL_UPDATE', 'PROJECT_DECOMMISSION'];

  const filteredLogs = logs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
      return matchesSearch && matchesAction;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        
        {/* Cinematic Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="text-blue-500" size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Compliance & Governance</span>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">Audit <span className="text-slate-500">Trail</span></h1>
              </div>
            </div>
            <p className="text-slate-500 max-w-xl text-sm font-medium leading-relaxed">
              Real-time forensic surveillance of the UniCloudOps fabric. Monitoring all structural, financial, and tactical missions within the sovereign boundary.
            </p>
          </div>

          <div className="flex gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-xl">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Telemetry</p>
               <p className="text-2xl font-black text-white tabular-nums">{summary.total_events.toLocaleString()}</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-6 py-4 backdrop-blur-xl">
               <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Failed Missions</p>
               <p className="text-2xl font-black text-rose-400 tabular-nums">{summary.failed_missions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Tactical Filters */}
          <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-8">
            <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Search size={12} /> Search Matrix
                  </label>
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter by logs..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                  />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Filter size={12} /> Action Filter
                  </label>
                  <div className="space-y-2">
                    {actions.map(action => (
                      <button 
                        key={action}
                        onClick={() => setSelectedAction(action)}
                        className={clsx(
                          "w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          selectedAction === action ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-500 hover:bg-white/5"
                        )}
                      >
                        {action.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4 text-emerald-500/60 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <Activity size={16} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Surveillance Active</span>
                  </div>
               </div>
            </section>
          </div>

          {/* Log Stream */}
          <div className="lg:col-span-9 space-y-4">
             {loading ? (
               <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-30">
                  <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Establishing Bridge...</span>
               </div>
             ) : filteredLogs.length === 0 ? (
               <div className="py-32 bg-white/[0.02] border border-white/5 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <History size={32} className="text-slate-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest">Zero telemetry detected</h3>
               </div>
             ) : (
               <div className="space-y-3">
                 {filteredLogs.map((log) => (
                   <div 
                    key={log.id} 
                    className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex items-center gap-6 transition-all animate-in slide-in-from-bottom-2 duration-300"
                   >
                     {/* Status Icon */}
                     <div className={clsx(
                       "w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0",
                       log.status === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                     )}>
                       {log.status === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                     </div>

                     <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-8 space-y-1">
                           <div className="flex items-center gap-3">
                              {getActionBadge(log.action)}
                              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tight">{format(new Date(log.created_at), 'HH:mm:ss:SSS')}</span>
                           </div>
                           <h4 className="text-sm font-black text-white tracking-tight uppercase leading-snug">{log.message}</h4>
                        </div>

                        <div className="md:col-span-4 flex flex-col items-end gap-2">
                           <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                              <User size={10} className="text-blue-400" />
                              <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[100px]">{log.user?.email || 'SYSTEM'}</span>
                           </div>
                           <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                              <Terminal size={10} className="text-slate-600" />
                              <span className="text-[9px] font-medium text-slate-500 font-mono italic">{log.ip_address || 'Internal Fabric'}</span>
                           </div>
                        </div>
                     </div>

                     {/* Tactical Peek Button */}
                     <button className="opacity-0 group-hover:opacity-100 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                        <ExternalLink size={16} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Governance;
