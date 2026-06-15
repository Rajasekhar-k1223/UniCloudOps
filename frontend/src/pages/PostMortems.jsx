import React, { useState, useEffect } from 'react';
import { FileText, Zap, ShieldCheck, RefreshCw, Send, Target, Activity, Brain, Info, Clock, Lock, FileSearch, ArrowRight } from 'lucide-react';
import api from '../services/api';

const PostMortems = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [debrief, setDebrief] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/post-mortem/list');
      setEvents(res.data);
    } catch (err) {
      console.error("Forensic Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (eventId) => {
    setSelectedEvent(eventId);
    setIsGenerating(true);
    setDebrief(null);
    try {
      const res = await api.post('/post-mortem/generate', { event_id: eventId });
      setDebrief(res.data);
    } catch (err) {
      alert("Debrief Synthesis Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-slate-500 w-12 h-12" />
       <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing_Forensic_Vault...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#020617] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><FileText size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Autonomous Post-Mortems</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-8 Forensic Intelligence. High-fidelity mission debriefs synthesized autonomously for every structural mutation and self-healing event in the galactic mesh.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><FileSearch size={250} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event List */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Activity size={14} className="text-indigo-500" />
                Recent Autonomous Missions
              </h3>

              <div className="space-y-4">
                 {events.map((e) => (
                   <button 
                     key={e.id}
                     onClick={() => handleGenerate(e.id)}
                     disabled={isGenerating && selectedEvent === e.id}
                     className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
                       selectedEvent === e.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
                     }`}
                   >
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-xl ${selectedEvent === e.id ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm'}`}><ShieldCheck size={20} /></div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{e.id} | {e.mission}</p>
                            <p className="text-sm font-black">{e.type}</p>
                         </div>
                      </div>
                      {isGenerating && selectedEvent === e.id ? <RefreshCw className="animate-spin" size={16} /> : <ArrowRight className={selectedEvent === e.id ? 'text-white' : 'text-slate-300'} size={16} />}
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-indigo-900/10 p-8 rounded-[3rem] border border-indigo-500/20 flex gap-5 items-center">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl h-fit shadow-xl shadow-indigo-500/30"><Brain size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Forensic Synthesis</h4>
                 <p className="text-[10px] text-indigo-800/80 leading-relaxed mt-2 font-medium">
                    Every autonomous action is cryptographically signed and debriefed to ensure absolute SOC2 compliance across the galactic mesh.
                 </p>
              </div>
           </div>
        </div>

        {/* Debrief Report */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[600px] flex flex-col">
              {!debrief ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <FileText size={80} className="text-slate-200 mb-6" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Awaiting Debrief Synthesis</h3>
                    <p className="text-sm font-medium italic mt-2">Select a mission event to generate a high-fidelity forensic report.</p>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-700">
                   <div className="flex justify-between items-start mb-10 pb-10 border-b border-slate-100">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-full">Sovereign-Verified</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{debrief.event_id}</span>
                         </div>
                         <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{debrief.title}</h2>
                      </div>
                      <button className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all">
                         <FileSearch size={24} />
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                      <div>
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={12} className="text-indigo-500" /> Executive Summary</h4>
                         <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{debrief.executive_summary}"</p>
                      </div>
                      <div>
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={12} className="text-rose-500" /> Root Cause</h4>
                         <p className="text-sm font-black text-slate-800">{debrief.root_cause}</p>
                      </div>
                   </div>

                   <div className="mb-12">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Clock size={12} className="text-indigo-500" /> Mission Action Timeline</h4>
                      <div className="space-y-4">
                         {debrief.action_timeline.map((step, i) => (
                           <div key={i} className="flex gap-6 items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                              <div className="w-16 text-[10px] font-black text-indigo-600 uppercase tracking-widest">{step.time}</div>
                              <div className="flex-1 text-xs font-bold text-slate-800">{step.action}</div>
                              <CheckCircle2 size={16} className="text-emerald-500" />
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="mt-auto p-8 bg-slate-900 rounded-[3rem] border border-white/5 flex justify-between items-center">
                      <div className="flex gap-6 items-center">
                         <div className="p-4 bg-white/5 text-emerald-400 rounded-2xl border border-white/10"><Lock size={24} /></div>
                         <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Merkle Integrity Hash</p>
                            <p className="text-xs font-mono text-emerald-400">{debrief.forensic_evidence.merkle_root}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Forensic Vault Anchor</p>
                         <p className="text-xs font-black text-white">{debrief.forensic_evidence.vault_anchor}</p>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ size, className }) => <ShieldCheck size={size} className={className} />;

export default PostMortems;
