import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Code, ShieldAlert, History, Activity, Terminal, Brain, RefreshCw } from 'lucide-react';

const EvolutionTrace = () => {
  const [traces, setTraces] = useState([
    { id: 1, action: 'SG-Remediation', original: 'Manual Block', evolved: 'Adaptive Port Closure (Python)', confidence: '99.2%', time: '14 mins ago' },
    { id: 2, action: 'S3-Hardening', original: 'Static ACL', evolved: 'Dynamic Identity Masking', confidence: '97.8%', time: '1 hour ago' },
    { id: 3, action: 'VPC-Warping', original: 'Fixed Route', evolved: 'Neural Traffic Redirection', confidence: '96.5%', time: '3 hours ago' }
  ]);
  const [evolving, setEvolving] = useState(false);

  const startEvolution = () => {
    setEvolving(true);
    setTimeout(() => {
       setEvolving(false);
       setTraces([{ id: Date.now(), action: 'IAM-Policy-Auth', original: 'Default JSON', evolved: 'Context-Aware Principal Logic', confidence: '99.9%', time: 'Just now' }, ...traces]);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sentinel Evolution Trace</h1>
          <p className="text-gray-500">Autonomous code evolution feed tracking real-time development of remediation logic by the Sentinel AI Agent.</p>
        </div>
        <button 
          onClick={startEvolution}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-lg shadow-slate-200"
        >
          {evolving ? <RefreshCw className="animate-spin" size={18} /> : <Brain size={18} />}
          {evolving ? 'Evolving Mission Intelligence...' : 'Engage Sentinel Evolution'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Live Evolution Feed */}
         <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <History size={14} /> Mission Logic Evolution
            </h3>
            {traces.map(t => (
               <div key={t.id} className="glass-panel p-6 bg-white border border-slate-100 hover:border-indigo-300 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                     <Code size={120} />
                  </div>
                  
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                           <Cpu size={20} className="text-indigo-600" />
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-800">{t.action}</h4>
                           <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Self-Evolved Mission</span>
                        </div>
                     </div>
                     <span className="text-[10px] text-slate-300 font-mono">{t.time}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Human-Defined Logic</p>
                        <p className="text-xs font-bold text-slate-400 line-through">{t.original}</p>
                     </div>
                     <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Sentinel Evolved Logic</p>
                        <p className="text-xs font-black text-indigo-600">{t.evolved}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                     <div className="flex items-center gap-2">
                        <Zap size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence: {t.confidence}</span>
                     </div>
                     <button className="text-[10px] font-black text-slate-900 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50 transition uppercase tracking-widest">View Evolved Code</button>
                  </div>
               </div>
            ))}
         </div>

         {/* Sentinel Diagnostics */}
         <div className="space-y-8">
            <div className="glass-panel p-8 bg-slate-900 text-white relative">
               <div className="flex items-center gap-4 mb-8">
                  <Terminal size={32} className="text-emerald-400" />
                  <h3 className="text-xl font-bold">Sentinel Neural Terminal</h3>
               </div>
               <div className="bg-black/60 rounded-2xl p-6 font-mono text-xs text-slate-400 space-y-3 border border-white/5 h-[300px] overflow-y-auto custom-scrollbar">
                  <p className="text-indigo-400">&gt;&gt;&gt; SENTINEL_V4_INITIALIZED</p>
                  <p>Searching for policy drift...</p>
                  <p className="text-amber-500">WARNING: Zero-Day pattern detected in AWS-LAMBDA-FUNC-01</p>
                  <p className="text-cyan-400">Generating remediation kernel...</p>
                  <div className="p-3 bg-white/5 rounded border border-white/10 text-emerald-400 text-[10px]">
                     def auth_remediation(context):<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;import tactical_agent as agent<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;agent.seal_boundary(context.id)<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;return MISSION_SEALED
                  </div>
                  <p className="text-cyan-500">Mission logic evolved. Testing in shadow sandbox...</p>
                  <p className="text-emerald-500">TEST_SUCCESS. Confidence 99.9%. Deploying.</p>
                  <p className="animate-pulse opacity-20">_listening for drift...</p>
               </div>
            </div>

            <div className="glass-panel p-8 bg-indigo-600 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
               <ShieldAlert size={48} className="opacity-20 mb-6" />
               <h3 className="text-xl font-bold mb-2">Evolution Guardrails</h3>
               <p className="text-sm text-indigo-100 leading-relaxed mb-8">
                  The Sentinel Apex operates under strict sovereign human-in-the-loop protocols. Every evolved remediation mission is cryptographically signed and tracked in the Forensic Ledger.
               </p>
               <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-[10px] font-bold">MODE: ADAPTIVE</div>
                  <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-[10px] font-bold">GATES: ACTIVE</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default EvolutionTrace;
