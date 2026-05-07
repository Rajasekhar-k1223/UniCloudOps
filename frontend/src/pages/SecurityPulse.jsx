import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Globe, Zap, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';

const SecurityPulse = () => {
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [threatsRes, statsRes, findingsRes] = await Promise.all([
        api.get('/security-pulse/threats'),
        api.get('/security-pulse/stats'),
        api.get('/security/findings/1') // Assuming project ID 1 for now
      ]);
      
      // Merge findings into the threat feed for a unified view
      const combinedThreats = [
        ...threatsRes.data,
        ...findingsRes.data.map(f => ({
          id: f.id,
          type: f.title,
          severity: f.severity,
          source_ip: f.category,
          target: f.resource_name,
          status: 'detected',
          timestamp: 'LIVE SCAN'
        }))
      ];
      
      setThreats(combinedThreats);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch security data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchData();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500 text-white shadow-rose-200';
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tactical Security Pulse</h1>
          <p className="text-gray-500">Real-time threat matrix and multi-cloud attack mitigation telemetry.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Blocked Attacks (24h)', value: stats.blocked_attacks_24h, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Threats', value: stats.active_threats, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Mitigation Speed', value: stats.avg_mitigation_time, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Protected Mission Endpoints', value: stats.protected_endpoints, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 bg-white border-slate-100 flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{loading ? '...' : stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🛸 Neural-Mesh Threat Feed 🛸 */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]" />
                 Tactical Threat Matrix
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none bg-slate-100 px-2 py-1 rounded-md">LIVE_SEC_LINK_v2.1</span>
           </div>
           
           <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-300 space-y-4 glass-panel bg-white/50 border-slate-100">
                   <RefreshCw className="w-8 h-8 animate-spin opacity-40" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Security Uplink...</p>
                </div>
              ) : threats.length > 0 ? (
                threats.map((threat) => (
                  <div 
                    key={threat.id} 
                    className={clsx(
                      "glass-panel p-5 bg-white border-slate-100 hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col md:flex-row items-center gap-6",
                      threat.severity === 'critical' && "shadow-[0_0_20px_rgba(244,63,94,0.05)] border-rose-100/50"
                    )}
                  >
                    {/* Severity Pulse Ring */}
                    <div className={clsx(
                       "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                       threat.severity === 'critical' ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-amber-50 text-amber-500 border border-amber-100"
                    )}>
                       <ShieldAlert size={20} className={threat.severity === 'critical' ? "animate-pulse" : ""} />
                    </div>

                    <div className="flex-1 space-y-1">
                       <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-800 tracking-tight">{threat.type}</p>
                          <span className={clsx(
                             "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                             threat.severity === 'critical' ? "bg-rose-500 text-white border-rose-400" : "bg-amber-100 text-amber-700 border-amber-200"
                          )}>
                            {threat.severity}
                          </span>
                       </div>
                       <div className="flex items-center gap-3">
                          <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter flex items-center gap-1.5">
                             <Globe size={10} /> {threat.source_ip}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{threat.target}</p>
                       </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{threat.timestamp}</p>
                       <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                             Mitigate
                          </button>
                          <button className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                             <X size={14} />
                          </button>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-300 italic glass-panel bg-white/50 border-slate-100 rounded-3xl">
                   No tactical threats detected in current trajectory.
                </div>
              )}
           </div>
        </div>

        {/* Regional Risk Map (Simulated) */}
        <div className="glass-panel p-6 bg-slate-900 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
           <h3 className="font-bold mb-6 flex items-center gap-2">
              <Globe className="text-emerald-400 w-5 h-5" />
              Global Risk Matrix
           </h3>
           
           <div className="space-y-6 relative z-10">
              {[
                { region: 'US-East (N. Virginia)', risk: 12, color: 'bg-emerald-400' },
                { region: 'EU-Central (Frankfurt)', risk: 45, color: 'bg-amber-400' },
                { region: 'AP-South (Mumbai)', risk: 85, color: 'bg-rose-400' },
                { region: 'UK-West (London)', risk: 22, color: 'bg-emerald-400' }
              ].map((r, i) => (
                <div key={i}>
                   <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{r.region}</span>
                      <span className="text-xs font-bold font-mono">{r.risk}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color}`} style={{ width: `${r.risk}%` }} />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-20 p-4 border border-slate-800 rounded-2xl bg-white/5 flex items-start gap-3">
              <AlertCircle className="text-emerald-400 w-5 h-5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                AI Intelligence performing automated traffic analysis across mission boundaries. Tactical countermeasures are active.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPulse;
