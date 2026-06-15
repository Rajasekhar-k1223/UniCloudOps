import React, { useState, useEffect } from 'react';
import { Power, RefreshCw, ShieldAlert, CheckCircle2, Cloud, Server, ArrowRight, Sparkles, Zap, Activity, Info } from 'lucide-react';
import api from '../services/api';

const MissionContinuity = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFailingOver, setIsFailingOver] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [targetProvider, setTargetProvider] = useState('azure');
  const [failoverResult, setFailoverResult] = useState(null);

  const fetchDeployments = async () => {
    try {
      const res = await api.get('/terraform/deployments');
      setDeployments(res.data);
    } catch (err) {
      console.error("Mission Data Retrieval Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const handleFailover = async () => {
    if (!selectedMission) return;
    setIsFailingOver(true);
    setFailoverResult(null);
    try {
      const res = await api.post('/continuity/failover', { 
        source_deployment_id: selectedMission.id, 
        target_provider: targetProvider 
      });
      setFailoverResult(res.data);
      alert("Continuity Pulse Detected: AI has synthesized the failover blueprint.");
    } catch (err) {
      alert("Failover Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsFailingOver(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shadow-lg shadow-rose-500/10"><Power size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Mission Continuity Engine</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-5 Autonomous Disaster Recovery. Replicate and relocate entire infrastructure missions across cloud boundaries in the event of regional blackout.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={250} className="text-rose-500" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mission Selector */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={14} className="text-rose-500" />
                Select Mission for Failover
              </h3>
              
              <div className="space-y-3">
                 {loading ? (
                   <div className="animate-pulse space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
                   </div>
                 ) : deployments.map(d => (
                   <button 
                     key={d.id}
                     onClick={() => setSelectedMission(d)}
                     className={`w-full text-left p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
                       selectedMission?.id === d.id ? 'bg-rose-50 border-rose-500 shadow-lg shadow-rose-100' : 'bg-slate-50 border-slate-100 hover:border-rose-200'
                     }`}
                   >
                      <div>
                         <p className={`text-xs font-black uppercase ${selectedMission?.id === d.id ? 'text-rose-700' : 'text-slate-400'}`}>{d.provider}</p>
                         <p className="text-sm font-black text-slate-800">{d.name}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${d.has_drift ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-rose-900/10 p-8 rounded-[3rem] border border-rose-500/20 flex gap-5">
              <div className="p-4 bg-rose-500 text-white rounded-2xl h-fit shadow-xl shadow-rose-500/30"><ShieldAlert size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Critical Failover Mode</h4>
                 <p className="text-[10px] text-rose-700/80 leading-relaxed mt-2 font-medium">
                    Initiating failover will trigger the Sovereign AI to synthesize a new mission blueprint for the target provider and begin immediate reconstruction.
                 </p>
              </div>
           </div>
        </div>

        {/* Failover Orchestration */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Cloud size={150} className="text-indigo-500" /></div>
              
              <div className="space-y-10 relative z-10">
                 <div className="flex items-center gap-10">
                    <div className="text-center space-y-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Region</p>
                       <div className="px-6 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase">
                          {selectedMission ? `${selectedMission.provider}-Primary` : 'Select Mission'}
                       </div>
                    </div>
                    <ArrowRight className="text-slate-300" size={32} />
                    <div className="text-center space-y-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Continuity Vector</p>
                       <div className="flex gap-3">
                          {['azure', 'oci', 'aws'].map(p => (
                            <button 
                              key={p}
                              onClick={() => setTargetProvider(p)}
                              className={`px-6 py-4 rounded-3xl border-2 font-black text-xs uppercase transition-all ${
                                targetProvider === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                              }`}
                            >
                               {p}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleFailover}
                   disabled={isFailingOver || !selectedMission}
                   className="w-full py-6 bg-rose-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.3em] shadow-2xl shadow-rose-500/40 hover:bg-rose-500 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                 >
                    {isFailingOver ? <RefreshCw size={24} className="animate-spin" /> : <Power size={24} />}
                    {isFailingOver ? 'Synchronizing Cross-Cloud Warp...' : 'Initiate Mission Continuity'}
                 </button>
              </div>

              {failoverResult && (
                <div className="mt-10 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-200 animate-in slide-in-from-bottom-8">
                   <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="text-emerald-500" size={24} />
                      <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Warp Blueprint Synthesized</h4>
                   </div>
                   <div className="bg-slate-900 rounded-3xl p-6 font-mono text-[11px] text-emerald-400 h-48 overflow-auto custom-scrollbar">
                      <pre>{failoverResult.hcl}</pre>
                   </div>
                   <div className="mt-6 flex gap-4">
                      <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200">Deploy Failover Mission</button>
                      <button className="px-6 py-4 bg-white border border-emerald-200 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest">Review HCL</button>
                   </div>
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-4 items-center">
                 <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><Activity size={24} /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DR Readiness</p>
                    <p className="text-lg font-black text-slate-800">99.9% Optimal</p>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-4 items-center">
                 <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Info size={24} /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Latency</p>
                    <p className="text-lg font-black text-slate-800">12ms Global</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MissionContinuity;
