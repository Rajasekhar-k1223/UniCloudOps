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
      const [threatsRes, statsRes] = await Promise.all([
        api.get('/security-pulse/threats'),
        api.get('/security-pulse/stats')
      ]);
      setThreats(threatsRes.data);
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
        {/* Threat Feed */}
        <div className="lg:col-span-2 glass-panel shadow-xl border-slate-200/60 overflow-hidden flex flex-col">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <ShieldAlert className="text-rose-500 w-5 h-5" />
                 Tactical Threat Feed
              </h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">mission_integrity.log</span>
           </div>
           
           <div className="flex-1 overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="py-20 text-center text-gray-400 italic">Accessing security uplink...</div>
              ) : threats.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-50">
                  <tbody className="bg-white">
                    {threats.map((threat) => (
                      <tr key={threat.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${threat.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'}`} />
                              <div>
                                 <p className="text-sm font-bold text-gray-800">{threat.type}</p>
                                 <p className="text-[10px] text-gray-400 font-mono leading-none">{threat.timestamp}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {threat.source_ip}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs font-bold text-slate-600">{threat.target}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityStyle(threat.severity)}`}>
                             {threat.severity}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                              {threat.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center text-gray-400 italic">No tactical threats detected in current trajectory.</div>
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
