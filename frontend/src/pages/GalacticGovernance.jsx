import React, { useState, useEffect } from 'react';
import { Gavel, Zap, ShieldCheck, RefreshCw, Scale, Activity, Brain, Info, Lock, Target, BookOpen, AlertCircle } from 'lucide-react';
import api from '../services/api';

const GalacticGovernance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/governance/laws');
      setData(res.data);
    } catch (err) {
      console.error("Governance Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSynthesize = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSynthesizing(true);
    try {
      const res = await api.post('/governance/synthesize', { description: description });
      alert(res.data.message);
      setDescription('');
      fetchData();
    } catch (err) {
      alert("Synthesis Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSynthesizing(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-slate-500 w-12 h-12" />
       <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing_Galactic_Governance_Protocols...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e293b] p-10 rounded-[3rem] border border-slate-700 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-500/20 text-slate-300 rounded-2xl shadow-lg shadow-slate-500/10"><Gavel size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Galactic Governance</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-10 Code-as-Law. Synthesize global sovereign laws that are physically enforced by the infrastructure itself. In this state, a violation is not just detected—it is physically impossible.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Scale size={250} className="text-slate-300" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Law Synthesis */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={120} className="text-slate-500" /></div>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2 relative z-10">
                <Target size={14} className="text-slate-500" />
                Synthesize Sovereign Law
              </h3>

              <form onSubmit={handleSynthesize} className="flex-1 flex flex-col gap-6 relative z-10">
                 <textarea 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-800 focus:border-slate-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                   placeholder="e.g. Enforce absolute data residency in EU-West orbits for all mission traffic..."
                 />
                 <button 
                   type="submit"
                   disabled={isSynthesizing || !description.trim()}
                   className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                    {isSynthesizing ? <RefreshCw className="animate-spin" size={20} /> : <Scale size={20} />}
                    {isSynthesizing ? 'Synthesizing Law...' : 'Synthesize Code-as-Law'}
                 </button>
              </form>
           </div>

           <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 flex gap-5">
              <div className="p-4 bg-white/5 text-slate-400 rounded-2xl h-fit border border-white/10"><ShieldCheck size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider">Physical Enforcement</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed mt-2 font-medium">
                    Laws synthesized here are embedded into the runtime kernel of every mission node. They cannot be bypassed or ignored.
                 </p>
              </div>
           </div>
        </div>

        {/* Law List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[600px]">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <BookOpen size={14} className="text-slate-500" />
                   Active Sovereign Law Codex
                 </h3>
                 <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Violations Prevented: {data.law_violations_prevented}
                 </div>
              </div>

              <div className="space-y-4">
                 {data.active_laws.map((law) => (
                   <div key={law.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex gap-6 items-center">
                         <div className={`p-4 rounded-2xl shadow-xl bg-slate-900 text-white`}>
                            <Lock size={24} />
                         </div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{law.id} | {law.scope}</p>
                               <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[8px] font-black uppercase">
                                  {law.enforcement}
                               </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-800">{law.name}</h4>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Compliance</p>
                            <p className="text-xs font-black text-emerald-600">100% (PHYSICAL)</p>
                         </div>
                         <div className="h-10 w-0.5 bg-slate-200" />
                         <div className="p-2 text-emerald-500"><ShieldCheck size={24} /></div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-6 items-center">
                 <div className="p-4 bg-amber-600 text-white rounded-2xl h-fit shadow-xl shadow-amber-200"><AlertCircle size={24} /></div>
                 <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Sovereign Law vs Policy</h4>
                    <p className="text-[11px] text-amber-800/70 leading-relaxed mt-2 font-medium">
                       Traditional policies are checked *after* an action is taken. Galactic Sovereign Laws are checked *during* execution at the instruction level. The universe itself prevents the violation.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GalacticGovernance;
