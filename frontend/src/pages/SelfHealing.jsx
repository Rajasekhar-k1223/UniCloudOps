import React, { useState, useEffect } from 'react';
import { HeartPulse, Activity, Zap, RefreshCw, CheckCircle, Shield, History, PlayCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const SelfHealing = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/governance/repair/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const triggerRepair = async () => {
    setFixing(true);
    try {
      const res = await api.post('/governance/repair');
      alert(`Autonomous mission complete. ${res.data.repaired_count} assets were successfully recovered.`);
      fetchHistory();
    } catch (err) {
      alert('Repair mission failed.');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Autonomous Self-Healing</h1>
          <p className="text-gray-500">Autonomous repair agents (HEAL-01) for proactive recovery of failed infrastructure missions.</p>
        </div>
        <button 
          onClick={triggerRepair}
          disabled={fixing}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg ${
            fixing ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {fixing ? <RefreshCw className="animate-spin" size={18} /> : <PlayCircle size={18} />}
          {fixing ? 'Repairing Grid...' : 'Initiate Self-Healing Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status HUD */}
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-8 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[80px] rounded-full" />
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <HeartPulse className="text-emerald-400 w-10 h-10 animate-pulse" />
                    <h3 className="text-lg font-bold">Grid Health Monitor</h3>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Survival Node Integrity</span>
                          <span className="text-[10px] font-bold text-emerald-400">ONLINE</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 animate-[pulse_2s_infinite]" style={{ width: '92%' }} />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Uptime</p>
                          <p className="text-lg font-bold">99.98%</p>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Repairs</p>
                          <p className="text-lg font-bold">{history.length}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-6 border-dashed border-2 border-slate-200 bg-slate-50">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-4">
                 <Shield className="w-4 h-4 text-indigo-500" /> HEAL-01 Protocols
              </h4>
              <ul className="space-y-3">
                 {[
                   'Critical Asset Priority Recovery',
                   'Resource State Validation Check',
                   'Autonomous Mission Relaunch',
                   'Situational Anomaly Detection'
                 ].map((t, i) => (
                   <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      <CheckCircle size={14} className="text-emerald-500" /> {t}
                   </li>
                 ))}
              </ul>
           </div>
        </div>

        {/* Repair History */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <History size={14} /> Autonomous Mission History
           </h3>
           <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center text-gray-400 italic">Reading mission trace...</div>
              ) : history.length === 0 ? (
                <div className="glass-panel p-12 bg-white border-slate-100 text-center">
                   <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-sm font-bold text-slate-400">No autonomous repairs recorded in this mission cycle.</p>
                </div>
              ) : history.map((log) => (
                <div key={log.id} className="glass-panel p-6 bg-white border border-slate-100 hover:border-emerald-200 transition-all flex gap-6">
                   <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl shrink-0 h-fit">
                      <Zap size={24} />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-gray-800 leading-tight">{log.message || 'Autonomous Self-Healing Repair Mission'}</h4>
                         <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-widest">{log.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={10} /> Healing Trace: {log.id}
                         </span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(log.timestamp).toLocaleString()}
                         </span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SelfHealing;
