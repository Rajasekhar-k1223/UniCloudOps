import React, { useState, useEffect } from 'react';
import { AlertTriangle, Power, Shield, Activity, RefreshCw, Layers, Globe, Zap, CheckCircle } from 'lucide-react';
import api from '../services/api';

const DisasterRecovery = () => {
  const [standbys, setStandbys] = useState([]);
  const [resources, setResources] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState('');
  const [targetAccount, setTargetAccount] = useState('');
  const [failoverInProgress, setFailoverInProgress] = useState(false);

  const fetchData = async () => {
    try {
      const [drPairsRes, resourcesRes, accountsRes] = await Promise.all([
        api.get('/dr/status/1'),
        api.get('/resources'),
        api.get('/cloud-accounts')
      ]);
      setStandbys(drPairsRes.data);
      setResources(resourcesRes.data);
      setAccounts(accountsRes.data);
    } catch (err) {
      console.error("Failed to fetch DR data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFailover = async () => {
    if (!selectedResource) return alert('Select a DR mission to initiate.');
    if (!window.confirm('WARNING: You are about to initiate a high-priority Disaster Recovery mission. Workloads will be moved to the standby boundary. Proceed?')) return;
    
    setFailoverInProgress(true);
    try {
      const res = await api.post(`/dr/failover/${selectedResource}`);
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert('Failover mission failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setFailoverInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DR Command & Control</h1>
          <p className="text-gray-500">Autonomous failover and cross-cloud boundary recovery missions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Failover Form */}
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-8 bg-white border-2 border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full" />
              
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200">
                    <Power size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-800">Mission Failover</h3>
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Tactical Red Button</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Active DR Mission</label>
                    <select 
                      value={selectedResource}
                      onChange={(e) => setSelectedResource(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-medium text-gray-700 bg-white"
                    >
                       <option value="">Select Mission...</option>
                       {standbys.map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                       ))}
                    </select>
                 </div>

                 <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <div className="flex gap-3">
                       <AlertTriangle className="text-rose-600 shrink-0 w-5 h-5" />
                       <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                         Initiating failover will provision new resources and update global DNS records. Estimated recovery time: ~180s.
                       </p>
                    </div>
                 </div>

                 <button 
                   onClick={handleFailover}
                   disabled={failoverInProgress || !selectedResource}
                   className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
                     failoverInProgress ? 'bg-slate-200 text-slate-500' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
                   }`}
                 >
                    {failoverInProgress ? <RefreshCw className="animate-spin w-5 h-5" /> : <Shield size={18} />}
                    {failoverInProgress ? 'Initiating Failover...' : 'Trigger DR Failover'}
                 </button>
              </div>
           </div>
        </div>

        {/* Standby Readiness */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-panel p-6 shadow-xl border-slate-200/60 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="text-indigo-500 w-5 h-5" />
                    Shadow-Standby Readiness Matrix
                 </h3>
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">All Nodes Ready</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {standbys.map((s) => (
                    <div key={s.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-indigo-300 transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:text-indigo-600 transition-colors">
                             <Layers size={20} />
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            s.primary?.status === 'healthy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                          }`}>
                            {s.sync_status}
                          </span>
                       </div>
                       <h4 className="font-bold text-gray-800 text-sm mb-1">{s.name}</h4>
                       <p className="text-[11px] text-gray-400 font-medium mb-4">
                         {s.primary?.provider.toUpperCase()} ({s.primary?.region}) → {s.standby?.provider.toUpperCase()} ({s.standby?.region})
                       </p>
                       
                       <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                          <div className="flex items-center gap-1.5">
                             <RefreshCw size={12} className="text-slate-300" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Sync: {s.last_sync}</span>
                          </div>
                          <button 
                            onClick={() => setSelectedResource(s.id)}
                            className="text-[10px] font-bold text-indigo-600 hover:underline px-2 py-1"
                          >
                            Select for Failover
                          </button>
                       </div>
                    </div>
                  ))}
              </div>

              <div className="mt-8 p-6 bg-slate-900 rounded-3xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full" />
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/10 rounded-2xl">
                       <Globe size={24} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-bold text-white mb-1">Global Replication Active</h4>
                       <p className="text-[11px] text-slate-400 leading-tight">UniOS is currently synchronizing stateful tactical logs across 4 geographic mission boundaries.</p>
                    </div>
                    <CheckCircle className="text-emerald-500" size={24} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterRecovery;
