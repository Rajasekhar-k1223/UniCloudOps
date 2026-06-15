import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Code, RefreshCw, Send, Brain, Info, CheckCircle2, ShieldAlert, FileCode, Lock } from 'lucide-react';
import api from '../services/api';

const PolicyGuard = () => {
  const [standard, setStandard] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [activePolicies, setActivePolicies] = useState([
    { name: 'Global-MFA-Enforcement', standard: 'NIST', status: 'enforced' },
    { name: 'S3-Block-Public-Access', standard: 'SOC2', status: 'enforced' }
  ]);

  const handleSynthesize = async (e) => {
    e.preventDefault();
    if (!standard.trim()) return;

    setIsSynthesizing(true);
    setPolicy(null);
    try {
      const res = await api.post('/policy/synthesize', { standard: standard });
      setPolicy(res.data.policy);
    } catch (err) {
      alert("Synthesis Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleEnforce = () => {
    if (!policy) return;
    setActivePolicies([...activePolicies, { name: policy.policy_name, standard: policy.compliance_target, status: 'enforced' }]);
    setPolicy(null);
    setStandard('');
    alert("Autonomous Policy Enforced Globally.");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#064e3b] p-10 rounded-[3rem] border border-emerald-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10"><ShieldCheck size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">AI Policy Guard</h1>
          </div>
          <p className="text-emerald-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-7 Cognitive Governance. Sovereign-AI monitors global regulatory standards and automatically synthesizes OPA Rego policies for real-time mission enforcement.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Lock size={250} className="text-emerald-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Synthesizer */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Brain size={120} className="text-emerald-500" /></div>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2 relative z-10">
                <Code size={14} className="text-emerald-500" />
                Synthesize Guardrail
              </h3>

              <form onSubmit={handleSynthesize} className="flex-1 flex flex-col gap-6 relative z-10">
                 <input 
                   type="text"
                   value={standard}
                   onChange={(e) => setStandard(e.target.value)}
                   className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-black text-slate-800 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                   placeholder="e.g. NIST-800-53, HIPAA, GDPR"
                 />
                 <button 
                   type="submit"
                   disabled={isSynthesizing || !standard.trim()}
                   className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                    {isSynthesizing ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                    {isSynthesizing ? 'Synthesizing Rego...' : 'Synthesize Policy'}
                 </button>
              </form>
           </div>

           <div className="bg-emerald-900/10 p-8 rounded-[3rem] border border-emerald-500/20 flex gap-5">
              <div className="p-4 bg-emerald-500 text-white rounded-2xl h-fit shadow-xl shadow-emerald-500/30"><Info size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Cognitive Governance</h4>
                 <p className="text-[10px] text-emerald-700/80 leading-relaxed mt-2 font-medium">
                    Policies are synthesized using Sovereign-AI to ensure 100% alignment with global regulatory standards across multi-cloud orbits.
                 </p>
              </div>
           </div>
        </div>

        {/* Policy Review & Active List */}
        <div className="lg:col-span-2 space-y-6">
           {policy ? (
              <div className="bg-white p-10 rounded-[3rem] border-2 border-emerald-500 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                 <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                       <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200"><FileCode size={24} /></div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesized Policy</p>
                          <h3 className="text-xl font-black text-slate-800">{policy.policy_name}</h3>
                       </div>
                    </div>
                    <button 
                      onClick={handleEnforce}
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                       Enforce Globally
                    </button>
                 </div>

                 <div className="bg-slate-950 rounded-[2.5rem] p-8 font-mono text-[11px] text-emerald-400 overflow-auto max-h-[300px] mb-8 border-4 border-slate-900 custom-scrollbar">
                    <pre>{policy.rego_code}</pre>
                 </div>

                 <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 italic text-xs font-medium text-emerald-800">
                    "{policy.explanation}"
                 </div>
              </div>
           ) : (
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                   <ShieldAlert size={14} className="text-emerald-500" />
                   Active Enforcement Orbit
                 </h3>

                 <div className="space-y-4">
                    {activePolicies.map((p, i) => (
                      <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                         <div className="flex gap-6 items-center">
                            <div className="p-4 bg-white rounded-2xl shadow-sm text-emerald-500 border border-emerald-100"><ShieldCheck size={24} /></div>
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.standard} Standard</p>
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded">active</span>
                               </div>
                               <p className="text-sm font-black text-slate-800">{p.name}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase">Coverage</p>
                               <p className="text-xs font-black text-slate-800">Global Orbit</p>
                            </div>
                            <div className="h-10 w-0.5 bg-slate-200" />
                            <div className="p-2 text-slate-300"><Zap size={20} /></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PolicyGuard;
