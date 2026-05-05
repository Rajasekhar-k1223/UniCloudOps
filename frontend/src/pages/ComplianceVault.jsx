import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, AlertTriangle, Zap, RefreshCw, Filter, Search, ShieldAlert, CheckCircle2, ChevronRight, Activity, Terminal } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';
import { format } from 'date-fns';
import MissionHUD from '../components/MissionHUD';

const ComplianceVault = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [remediatingId, setRemediatingId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      const res = await api.get('/governance/results');
      setResults(res.data);
    } catch (err) {
      console.error("Governance core offline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000); // Pulse every 20s
    return () => clearInterval(interval);
  }, []);

  const triggerScan = async () => {
    setIsScanning(true);
    try {
      await api.post('/governance/scan');
      setTimeout(fetchData, 2000); // Wait for scan to propagate
    } catch (err) {
      console.error("Scan mission aborted:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemediate = async (resultId) => {
    setRemediatingId(resultId);
    try {
      const res = await api.post(`/governance/remediate/${resultId}`);
      if (res.data.status === 'success') {
        // Notification logic would go here
      }
      fetchData();
    } catch (err) {
      console.error("Remediation mission failed:", err);
    } finally {
      setRemediatingId(null);
    }
  };

  const stats = {
    total: results.length,
    failed: results.filter(r => r.status === 'fail').length,
    critical: results.filter(r => r.severity === 'critical' && r.status === 'fail').length,
    health: results.length > 0 ? Math.round(((results.length - results.filter(r => r.status === 'fail').length) / results.length) * 100) : 100
  };

  const filteredResults = results.filter(r => {
    if (filter === 'ALL') return true;
    if (filter === 'FAILED') return r.status === 'fail';
    if (filter === 'CRITICAL') return r.severity === 'critical';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        
        {/* Superior Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                <ShieldCheck className="text-indigo-500" size={24} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">Compliance <span className="text-slate-500 font-medium">Vault</span></h1>
            </div>
            <p className="text-slate-500 max-w-xl text-sm font-medium">
              Autonomous mission boundaries for the sovereign cloud. Enforcing multi-cloud security policies and tactical infrastructure governance.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={triggerScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all disabled:opacity-50"
             >
                {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
                {isScanning ? 'Scanning Fabric...' : 'Initiate Scan Mission'}
             </button>
             <button className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
                <ShieldAlert size={20} />
             </button>
             <button 
                className="flex items-center gap-2 px-6 py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl"
                onClick={() => {
                  const failed = results.filter(r => r.status === 'fail');
                  failed.forEach(r => handleRemediate(r.id));
                }}
             >
                <Zap size={14} /> Batch Remediate
             </button>
          </div>
        </div>

        {/* Global Health HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <MissionHUD 
              label="Sovereign Compliance" 
              value={`${stats.health}%`} 
              unit="Mission Grade" 
              color={stats.health > 90 ? 'emerald' : stats.health > 70 ? 'amber' : 'rose'}
              data={[
                {value: 85}, {value: 88}, {value: 92}, {value: 90}, {value: stats.health}
              ]}
            />
            <MissionHUD 
              label="Active Violations" 
              value={stats.failed} 
              unit="Tactical Gaps" 
              color="rose"
              data={results.filter(r => r.status === 'fail').map((r, i) => ({ value: i + 1 }))}
            />
            <MissionHUD 
              label="Critical Risks" 
              value={stats.critical} 
              unit="Security Alerts" 
              color="amber"
              data={results.filter(r => r.severity === 'critical').map((r, i) => ({ value: i + 1 }))}
            />
            <MissionHUD 
              label="Policy Registry" 
              value={stats.total} 
              unit="Active Directives" 
              color="indigo"
              data={[
                {value: 10}, {value: 12}, {value: 11}, {value: 13}, {value: stats.total}
              ]}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Tactical List */}
          <div className="lg:col-span-9 space-y-4">
             <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Terminal size={14} /> Mission Results Trace
                </h3>
                <div className="flex gap-4">
                   {['ALL', 'FAILED', 'CRITICAL'].map(t => (
                     <button 
                        key={t}
                        onClick={() => setFilter(t)}
                        className={clsx(
                          "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all border",
                          filter === t ? "bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/20" : "text-slate-500 border-white/5 hover:bg-white/5"
                        )}
                      >
                        {t}
                     </button>
                   ))}
                </div>
             </div>

             {loading ? (
               <div className="py-32 flex flex-col items-center justify-center space-y-6 opacity-30">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white">establishing_secure_link</span>
               </div>
             ) : filteredResults.length === 0 ? (
               <div className="py-40 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={64} className="text-emerald-500/20 mb-6" />
                  <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Sovereign Boundary Intact</h3>
                  <p className="text-sm text-slate-600 mt-2">Zero compliance violations detected in the current mission trajectory.</p>
               </div>
             ) : (
               <div className="space-y-4">
                  {filteredResults.map(res => (
                    <div key={res.id} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-8 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className={clsx(
                         "w-16 h-16 rounded-2xl flex items-center justify-center border-2 shrink-0 transition-all group-hover:scale-110",
                         res.status === 'fail' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
                       )}>
                          {res.status === 'fail' ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                       </div>

                       <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                             <span className={clsx(
                               "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                               res.severity === 'critical' ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                             )}>
                               {res.severity}
                             </span>
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                <Activity size={10} /> {res.provider}
                             </span>
                             <span className="text-[10px] font-mono text-slate-500">{format(new Date(res.timestamp), 'MM/dd HH:mm:ss')}</span>
                          </div>
                          <h4 className="text-lg font-black text-white tracking-tight uppercase leading-none">{res.policy_name}</h4>
                          <p className="text-sm text-slate-500 font-medium">{res.message}</p>
                          <div className="flex items-center gap-4 pt-2">
                             <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-600 uppercase">Resource</span>
                                <span className="text-[10px] font-bold text-white uppercase">{res.resource_name}</span>
                             </div>
                             <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-600 uppercase">Artifact</span>
                                <span className="text-[10px] font-bold text-indigo-400 uppercase">{res.resource_type}</span>
                             </div>
                          </div>
                       </div>

                       <div className="shrink-0 flex flex-col md:items-end gap-4">
                          {res.status === 'fail' && (
                             <button 
                                onClick={() => handleRemediate(res.id)}
                                disabled={remediatingId === res.id}
                                className="group/btn relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 overflow-hidden"
                             >
                                <span className="relative z-10 flex items-center gap-2">
                                  {remediatingId === res.id ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} className="group-hover/btn:animate-pulse" />}
                                  {remediatingId === res.id ? 'Fixing...' : 'Autonomous Fix'}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                             </button>
                          )}
                          <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">
                             View Forensics <ChevronRight size={12} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {/* Intelligent Insights */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xl font-black uppercase mb-4 relative z-10">Sovereign <br/>Remediation</h3>
                <p className="text-sm text-indigo-100/70 font-medium leading-relaxed relative z-10">
                   Autonomous agents are trained to fix identity exposure, insecure networking, and resource tagging gaps automatically.
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest">Automation Ready</span>
                      <span className="text-xs font-mono">100%</span>
                   </div>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-full animate-[shimmer_2s_infinite]" />
                   </div>
                </div>
             </div>

             <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Target size={14} /> Mission Directives
                </h3>
                <div className="space-y-4">
                   {[
                     { label: 'Security hardening', status: 'Optimal' },
                     { label: 'Cloud governance', status: 'Stable' },
                     { label: 'Cost optimization', status: 'Active' }
                   ].map((d, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{d.label}</span>
                        <span className="text-[9px] font-black text-emerald-500 uppercase px-2 py-0.5 bg-emerald-500/10 rounded-full">{d.status}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ComplianceVault;
