import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Activity, Brain, Fingerprint, AlertTriangle, RefreshCw, Eye, Target, Zap, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const NeuralIdentity = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChallenging, setIsChallenging] = useState(false);

  const fetchRisk = async () => {
    try {
      const res = await api.get('/neural-id/risk');
      setAnalysis(res.data);
    } catch (err) {
      console.error("Neural Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
    const interval = setInterval(fetchRisk, 15000); // Poll risk every 15s
    return () => clearInterval(interval);
  }, []);

  const handleChallenge = async () => {
    setIsChallenging(true);
    try {
      const res = await api.post('/neural-id/challenge', {});
      alert(res.data.message);
    } catch (err) {
      alert("Neural Challenge Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsChallenging(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-indigo-500 w-12 h-12" />
       <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Calibrating_Neural_Signatures...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e1b4b] p-10 rounded-[3rem] border border-indigo-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><Fingerprint size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Zero-Trust Neural Identity</h1>
          </div>
          <p className="text-indigo-200/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-5 Cognitive Access Governance. Real-time behavioral telemetry analysis to ensure mission sovereignty and prevent unauthorized orbit intrusion.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={250} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Overview */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Current Identity Status</h3>
              
              <div className="relative mb-8">
                 <div className={`w-48 h-48 rounded-full border-8 flex items-center justify-center transition-all duration-1000 ${
                    analysis.status === 'safe' ? 'border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 
                    analysis.status === 'warning' ? 'border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 
                    'border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]'
                 }`}>
                    <div>
                       <p className={`text-5xl font-black ${
                          analysis.status === 'safe' ? 'text-emerald-500' : 
                          analysis.status === 'warning' ? 'text-amber-500' : 
                          'text-rose-500'
                       }`}>{analysis.risk_score}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Risk Score</p>
                    </div>
                 </div>
                 <div className="absolute inset-0 border-t-8 border-indigo-500 rounded-full animate-spin duration-[3000ms]" style={{ opacity: 0.3 }} />
              </div>

              <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-6 ${
                 analysis.status === 'safe' ? 'bg-emerald-500 text-white' : 
                 analysis.status === 'warning' ? 'bg-amber-500 text-white' : 
                 'bg-rose-500 text-white'
              }`}>
                 Status: {analysis.status}
              </div>

              <p className="text-sm font-medium text-slate-500 leading-relaxed italic px-4">
                 "{analysis.recommendation}"
              </p>
           </div>

           <button 
             onClick={handleChallenge}
             disabled={isChallenging}
             className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
           >
              {isChallenging ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {isChallenging ? 'Issuing Challenge...' : 'Initiate Neural Sync'}
           </button>
        </div>

        {/* Risk Factors */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Activity size={14} className="text-indigo-500" />
                Behavioral Telemetry Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {analysis.factors.map((f, i) => (
                   <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="flex justify-between items-start mb-6">
                         <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">{f.name}</h4>
                         <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                            f.risk === 'low' ? 'bg-emerald-100 text-emerald-700' : 
                            f.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 
                            'bg-rose-100 text-rose-700'
                         }`}>
                            {f.risk} risk
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Impact Score</span>
                            <span className="text-lg font-black text-slate-800">{f.score}</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                f.risk === 'low' ? 'bg-emerald-500' : 
                                f.risk === 'medium' ? 'bg-amber-500' : 
                                'bg-rose-500'
                              }`} 
                              style={{ width: `${f.score}%` }} 
                            />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex gap-6 items-center">
                 <div className="p-4 bg-indigo-600 text-white rounded-2xl h-fit shadow-xl shadow-indigo-200"><Eye size={24} /></div>
                 <div>
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Cognitive Observation Active</h4>
                    <p className="text-[11px] text-indigo-800/70 leading-relaxed mt-2 font-medium">
                       Neural signatures are updated every 15 seconds based on command latency, session duration, and geographic variance.
                    </p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-5 items-center">
                 <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><Target size={24} /></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confidence Level</p>
                    <p className="text-lg font-black text-white">99.8% Neural Match</p>
                 </div>
              </div>
              <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-5 items-center">
                 <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20"><ShieldAlert size={24} /></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Intrusion Buffer</p>
                    <p className="text-lg font-black text-white">ACTIVE: SEALED</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralIdentity;
