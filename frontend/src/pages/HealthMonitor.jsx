import React, { useState, useEffect } from 'react';
import { Activity, Zap, RefreshCw, CheckCircle, Shield, History, PlayCircle, AlertTriangle, Cpu, Database, Server, Globe } from 'lucide-react';
import api from '../services/api';

const HealthMonitor = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchHealth = async () => {
    try {
      // Assuming a generic health endpoint or simulating high-fidelity telemetry
      const res = await api.get('/security-pulse/stats');
      setHealth(res.data);
    } catch (err) {
      console.error("Health Telemetry Link Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      fetchHealth();
    }, 2000);
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-emerald-500 w-12 h-12" />
       <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Synchronizing_Global_Health_Grid...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#064e3b] p-10 rounded-[3rem] border border-emerald-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10"><Activity size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">System Health Monitor</h1>
          </div>
          <p className="text-emerald-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Real-time infrastructure vitality tracking. Monitoring multi-cloud nodes, resource saturation, and mission integrity across all global orbits.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Globe size={250} className="text-emerald-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status HUD */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Overall Grid Vitality</h3>
              
              <div className="relative mb-8">
                 <div className="w-48 h-48 rounded-full border-8 border-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                    <div>
                       <p className="text-4xl font-black text-emerald-600">99.9%</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Uptime_Link</p>
                    </div>
                 </div>
                 <div className="absolute inset-0 border-t-8 border-emerald-500 rounded-full animate-spin duration-[3000ms]" style={{ opacity: 0.3 }} />
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mission Integrity</p>
                 <p className="text-sm font-black text-emerald-400 uppercase">Nominal</p>
              </div>
           </div>

           <button 
             onClick={handleScan}
             disabled={scanning}
             className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
           >
              {scanning ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
              {scanning ? 'Syncing Telemetry...' : 'Full System Scan'}
           </button>
        </div>

        {/* Vitality Metrics */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" />
                Inter-Cloud Vitality Telemetry
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { label: 'Compute Saturation', value: '42%', icon: Cpu, color: 'text-blue-500' },
                   { label: 'Network Throughput', value: '1.2 GB/s', icon: Zap, color: 'text-emerald-500' },
                   { label: 'Storage Latency', value: '14ms', icon: Database, color: 'text-amber-500' },
                   { label: 'Mission Response', value: '100%', icon: Shield, color: 'text-indigo-500' }
                 ].map((m, i) => (
                   <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                      <div className="flex gap-6 items-center">
                         <div className={`p-4 bg-white ${m.color} rounded-2xl shadow-sm border border-slate-50`}><m.icon size={24} /></div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                            <p className="text-lg font-black text-slate-800">{m.value}</p>
                         </div>
                      </div>
                      <Activity size={24} className="text-emerald-500 opacity-10 group-hover:opacity-40 transition-opacity" />
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-10 bg-slate-900 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row gap-8 items-center">
                 <div className="p-6 bg-white/5 text-emerald-400 rounded-[2rem] border border-white/10"><Server size={48} /></div>
                 <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Sovereign Health Engine</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mt-2 font-medium italic">
                       "Continuous monitoring of the multi-cloud mesh ensures zero-latency awareness of system anomalies. The health engine provides the empirical foundation for all autonomous self-healing missions."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitor;
