import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Target, RefreshCw, ShieldCheck, AlertCircle, Cpu, Eye, Lock, Brain, Activity } from 'lucide-react';
import api from '../services/api';

const ActiveDefense = () => {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patching, setPatching] = useState(null);

  const fetchScan = async () => {
    try {
      const res = await api.get('/defense/scan');
      setScan(res.data);
    } catch (err) {
      console.error("Defense synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const handlePatch = async (vulnId) => {
    setPatching(vulnId);
    try {
      const res = await api.post('/defense/patch', { vuln_id: vulnId });
      alert(res.data.message);
      fetchScan();
    } catch (err) {
      alert("Neural Patching Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setPatching(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-rose-500 w-12 h-12" />
       <p className="text-xs font-black text-rose-400 uppercase tracking-[0.4em]">Engaging_Red_Team_Scan...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#450a0a] p-10 rounded-[3rem] border border-rose-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shadow-lg shadow-rose-500/10"><ShieldAlert size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Active Neural Defense</h1>
          </div>
          <p className="text-rose-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-6 Autonomous Active Defense. Sovereign-AI acts as a continuous red-team auditor, proactively scanning mission infrastructure and automatically patching vulnerabilities.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={250} className="text-rose-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Defense Status */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Defense Readiness</h3>
              
              <div className="relative mb-8">
                 <div className="w-48 h-48 rounded-full border-8 border-rose-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                    <div>
                       <p className="text-5xl font-black text-rose-500">{scan.defense_readiness}%</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sovereign Shield</p>
                    </div>
                 </div>
                 <div className="absolute inset-0 border-t-8 border-rose-500 rounded-full animate-spin duration-[2000ms]" style={{ opacity: 0.3 }} />
              </div>

              <div className="flex gap-4 w-full">
                 <div className="flex-1 p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Detected</p>
                    <p className="text-xl font-black text-slate-800">{scan.detected.length}</p>
                 </div>
                 <div className="flex-1 p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Patched (24h)</p>
                    <p className="text-xl font-black text-emerald-600">12</p>
                 </div>
              </div>
           </div>

           <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-5 items-center">
              <div className="p-4 bg-rose-500/10 text-rose-400 rounded-3xl border border-rose-500/20"><Eye size={24} /></div>
              <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Active Hunting Mode</h4>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                    Neural Red-Team is scanning VPC routes, IAM policies, and K8s image signatures across all cloud project orbits.
                 </p>
              </div>
           </div>
        </div>

        {/* Vulnerability List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Activity size={14} className="text-rose-500" />
                Vulnerability Orbit Intelligence
              </h3>

              <div className="space-y-4">
                 {scan.detected.map((v) => (
                   <div key={v.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-rose-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex gap-6 items-center">
                         <div className={`p-4 rounded-2xl shadow-xl ${
                            v.severity === 'critical' ? 'bg-rose-500 text-white shadow-rose-200' : 
                            v.severity === 'high' ? 'bg-amber-500 text-white shadow-amber-200' : 
                            'bg-indigo-500 text-white shadow-indigo-200'
                         }`}>
                            {v.severity === 'critical' ? <Lock size={24} /> : <AlertCircle size={24} />}
                         </div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.id}</p>
                               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  v.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 
                                  v.severity === 'high' ? 'bg-amber-100 text-amber-700' : 
                                  'bg-indigo-100 text-indigo-700'
                               }`}>
                                  {v.severity}
                               </span>
                            </div>
                            <p className="text-sm font-black text-slate-800">{v.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">{v.resource}</p>
                         </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                         <p className="text-[10px] font-bold text-slate-400 italic max-w-xs text-right">
                            {v.remediation}
                         </p>
                         <button 
                           onClick={() => handlePatch(v.id)}
                           disabled={patching === v.id}
                           className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center gap-2"
                         >
                            {patching === v.id ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                            {patching === v.id ? 'Neural Patching...' : 'Authorize AI Patch'}
                         </button>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex gap-6 items-center">
                 <div className="p-4 bg-emerald-600 text-white rounded-2xl h-fit shadow-xl shadow-emerald-200"><ShieldCheck size={24} /></div>
                 <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Autonomous Patching Authorized</h4>
                    <p className="text-[11px] text-emerald-800/70 leading-relaxed mt-2 font-medium">
                       Every authorized patch is automatically hashed and anchored into the **Cryptographic Integrity Vault** for forensic auditing.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveDefense;
