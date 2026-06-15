import React, { useState, useEffect } from 'react';
import { Radio, Zap, Volume2, ShieldCheck, Activity, Target, RefreshCw, Brain, MessageSquare, Monitor, Star, Power, DollarSign } from 'lucide-react';
import api from '../services/api';

const CommanderBriefing = () => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchBriefing = async () => {
    try {
      const res = await api.get('/briefing/generate');
      setBriefing(res.data);
    } catch (err) {
      console.error("Briefing Synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  const handleSpeak = () => {
    if (!briefing) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(briefing.briefing_text);
      utterance.pitch = 0.7;
      utterance.rate = 0.85;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-indigo-500 w-12 h-12" />
       <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Synthesizing_Neural_Briefing...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#020617] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Animated AI Avatar Simulation */}
        <div className="relative flex items-center justify-center min-h-[400px]">
           <div className={`absolute w-64 h-64 rounded-full border-2 border-indigo-500/20 flex items-center justify-center transition-all duration-1000 ${isSpeaking ? 'scale-110 shadow-[0_0_100px_rgba(99,102,241,0.2)]' : ''}`}>
              <div className={`w-48 h-48 rounded-full border border-indigo-500/40 flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
                 <Brain size={80} className={`text-indigo-400 transition-all duration-500 ${isSpeaking ? 'scale-125 brightness-150' : 'opacity-40'}`} />
              </div>
           </div>
           
           {/* Visualizer Rings */}
           {[1,2,3].map(i => (
             <div 
               key={i}
               className={`absolute rounded-full border border-indigo-500/10 transition-all duration-1000 ${isSpeaking ? 'animate-ping' : ''}`}
               style={{ width: `${256 + i * 64}px`, height: `${256 + i * 64}px`, animationDelay: `${i * 200}ms` }}
             />
           ))}
        </div>

        {/* Briefing Text */}
        <div className="space-y-8 relative z-10">
           <div className="flex items-center gap-3">
              <div className="px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Neural Briefing Room</div>
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                 <Radio size={12} className="text-emerald-500" /> Live Orbit Link
              </div>
           </div>
           
           <h1 className="text-5xl font-black text-white uppercase tracking-tight leading-none">
              Greetings,<br />Commander.
           </h1>
           
           <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative overflow-hidden">
              <p className="text-lg font-medium text-slate-300 leading-relaxed italic">
                 "{briefing.briefing_text}"
              </p>
              <button 
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="mt-8 flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
              >
                 {isSpeaking ? <RefreshCw className="animate-spin" size={16} /> : <Volume2 size={16} />}
                 {isSpeaking ? 'Briefing in Progress...' : 'Listen to Briefing'}
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {briefing.signals.map((s, i) => (
           <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-slate-900 text-white rounded-xl group-hover:bg-indigo-600 transition-colors">
                    {s.module === 'Fiscal' ? <DollarSign size={20} /> : s.module === 'Security' ? <ShieldCheck size={20} /> : <Activity size={20} />}
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.module} Status</p>
                    <p className="text-sm font-black text-emerald-600">{s.status}</p>
                 </div>
              </div>
              <p className="text-lg font-black text-slate-800">{s.summary}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
         <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-6 items-center">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl border border-indigo-500/20"><Monitor size={32} /></div>
            <div>
               <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Multimodal Synthesis</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                  Sovereign-AI synthesizes data from 15+ mission modules into a single high-fidelity tactical briefing every hour.
               </p>
            </div>
         </div>
         <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-6 items-center">
            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-3xl border border-amber-500/20"><Star size={32} /></div>
            <div>
               <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Commander Priority</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                  Critical alerts and mission anomalies are prioritized in the briefing text to ensure zero-latency response for the operator.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CommanderBriefing;
