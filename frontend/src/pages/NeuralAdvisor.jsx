import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Zap, Brain, RefreshCw, Send, Target, Activity, ShieldCheck, Info, ChevronRight, TrendingDown, TrendingUp, BarChart } from 'lucide-react';
import api from '../services/api';

const NeuralAdvisor = () => {
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState(null);
  const chatEndRef = useRef(null);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsThinking(true);
    setResponse(null);
    try {
      const res = await api.post('/advisor/chat', { query: query });
      setResponse(res.data);
    } catch (err) {
      alert("Advisor Reasoning Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response, isThinking]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><Brain size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Neural Advisor</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-8 Cognitive Orchestration. Consult with the Sovereign-Neural-Advisor for advanced architectural reasoning and multi-cloud strategic planning.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={250} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
           <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {!response && !isThinking ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                   <Brain size={80} className="text-slate-200 mb-6" />
                   <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Awaiting Strategic Query</h3>
                   <p className="text-sm font-medium italic mt-2">Ask the advisor to synthesize an optimization or migration plan.</p>
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                   {/* User Message Simulation */}
                   <div className="flex justify-end">
                      <div className="max-w-[80%] p-6 bg-slate-900 text-white rounded-[2rem] rounded-tr-none font-medium text-sm">
                         {query}
                      </div>
                   </div>

                   {/* AI Thinking Simulation */}
                   {isThinking && (
                      <div className="flex gap-4">
                         <div className="p-3 bg-indigo-600 text-white rounded-xl h-fit"><Brain size={20} className="animate-pulse" /></div>
                         <div className="space-y-3 pt-2">
                            <div className="h-2 w-32 bg-slate-100 rounded-full animate-pulse" />
                            <div className="h-2 w-48 bg-slate-50 rounded-full animate-pulse" />
                         </div>
                      </div>
                   )}

                   {/* AI Response */}
                   {response && (
                      <div className="space-y-8">
                         <div className="flex gap-4">
                            <div className="p-3 bg-indigo-600 text-white rounded-xl h-fit shadow-xl shadow-indigo-200"><Brain size={20} /></div>
                            <div className="flex-1 p-8 bg-indigo-50 rounded-[2.5rem] rounded-tl-none border border-indigo-100">
                               <p className="text-sm font-black text-indigo-900 leading-relaxed italic">"{response.response}"</p>
                            </div>
                         </div>

                         {/* Tactical Plan Steps */}
                         <div className="ml-14 space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Synthesized Tactical Plan</h4>
                            {response.plan_steps.map((step, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                 <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">{i+1}</div>
                                 <p className="text-xs font-bold text-slate-700">{step}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
              )}
              <div ref={chatEndRef} />
           </div>

           {/* Input Area */}
           <form onSubmit={handleChat} className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isThinking}
                placeholder="Consult the Neural Advisor..."
                className="flex-1 bg-white border-2 border-slate-200 rounded-[2rem] px-8 text-sm font-bold text-slate-800 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
              />
              <button 
                type="submit"
                disabled={isThinking || !query.trim()}
                className="p-5 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-90 disabled:opacity-50"
              >
                 <Send size={20} />
              </button>
           </form>
        </div>

        {/* Impact Analysis Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col h-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Target size={14} className="text-indigo-600" />
                Projected Impact
              </h3>

              {response ? (
                <div className="space-y-10 flex-1">
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black text-slate-400 uppercase">Cost Optimization</p>
                         <p className="text-2xl font-black text-emerald-600">{response.impact_analysis.cost}</p>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500" style={{ width: '80%' }} />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black text-slate-400 uppercase">Latency Reduction</p>
                         <p className="text-2xl font-black text-indigo-600">{response.impact_analysis.latency}</p>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500" style={{ width: '65%' }} />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black text-slate-400 uppercase">Resilience Increase</p>
                         <p className="text-2xl font-black text-amber-600">{response.impact_analysis.resilience}</p>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-amber-500" style={{ width: '90%' }} />
                      </div>
                   </div>

                   <div className="pt-10 mt-auto">
                      <div className="p-6 bg-slate-900 rounded-[2rem] text-center border-b-4 border-indigo-500">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reasoning Confidence</p>
                         <p className="text-3xl font-black text-white">{response.confidence}%</p>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                   <BarChart size={60} className="text-slate-200 mb-4" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Telemetry Awaiting Reasoner</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralAdvisor;
