import React, { useState, useEffect } from 'react';
import { History, Zap, Clock, RefreshCw, Activity, ShieldCheck, Info, ArrowLeftRight, TrendingUp, TrendingDown, Layers, Brain } from 'lucide-react';
import api from '../services/api';

const TemporalCommand = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(2); // Default to PRESENT

  const fetchData = async () => {
    try {
      const res = await api.get('/temporal/states');
      setData(res.data);
    } catch (err) {
      console.error("Temporal synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-amber-500 w-12 h-12" />
       <p className="text-xs font-black text-amber-400 uppercase tracking-[0.4em]">Synchronizing_Temporal_Orbit...</p>
    </div>
  );

  const activeState = data.states[activeIndex];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#451a03] p-10 rounded-[3rem] border border-amber-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl shadow-lg shadow-amber-500/10"><History size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Temporal Command</h1>
          </div>
          <p className="text-amber-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-8 Temporal Autonomy. Visualize the past mission states and AI-predicted future evolutions of the galactic mesh in a single unified timeline.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={250} className="text-amber-400" /></div>
      </div>

      {/* Temporal Scrubber */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5"><Layers size={150} className="text-amber-500" /></div>
         
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-12 flex items-center gap-2 relative z-10">
           <ArrowLeftRight size={14} className="text-amber-500" />
           Temporal Mission Timeline
         </h3>

         <div className="relative h-2 bg-slate-100 rounded-full mb-20 px-4 flex justify-between items-center">
            {data.states.map((state, i) => (
              <button 
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative z-10 flex flex-col items-center transition-all duration-500 ${activeIndex === i ? 'scale-125' : 'hover:scale-110 opacity-40'}`}
              >
                 <div className={`w-8 h-8 rounded-full border-4 ${activeIndex === i ? 'bg-amber-500 border-white shadow-xl shadow-amber-200' : 'bg-white border-slate-200'}`} />
                 <span className={`absolute top-10 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${activeIndex === i ? 'text-amber-600' : 'text-slate-400'}`}>
                    {state.label}
                 </span>
              </button>
            ))}
            <div 
              className="absolute h-full bg-amber-500 rounded-full transition-all duration-700 ease-in-out" 
              style={{ left: '0', width: `${(activeIndex / (data.states.length - 1)) * 100}%`, opacity: 0.2 }}
            />
         </div>

         {/* State Details */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Orbit Status</p>
               <div className="flex items-center gap-3">
                  <p className="text-2xl font-black text-slate-800 uppercase">{activeState.status}</p>
                  {activeIndex > 2 ? <Zap className="text-amber-500" size={20} /> : <ShieldCheck className="text-emerald-500" size={20} />}
               </div>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Compute Nodes</p>
               <p className="text-3xl font-black text-slate-800">{activeState.nodes}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Projected Cost</p>
               <div className="flex items-center gap-2">
                  <p className="text-3xl font-black text-slate-800">${activeState.cost}</p>
                  {activeState.cost < data.states[2].cost ? <TrendingDown className="text-emerald-500" size={20} /> : activeState.cost > data.states[2].cost ? <TrendingUp className="text-rose-500" size={20} /> : null}
               </div>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mesh Health</p>
               <p className="text-3xl font-black text-emerald-600">{activeState.health}%</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#020617] p-10 rounded-[3rem] border border-white/5 flex gap-8 items-center">
            <div className="relative">
               <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 flex items-center justify-center">
                  <p className="text-2xl font-black text-amber-500">{data.prediction_confidence}%</p>
               </div>
               <div className="absolute inset-0 border-t-4 border-amber-500 rounded-full animate-spin" />
            </div>
            <div>
               <h4 className="text-sm font-black text-white uppercase tracking-widest">AI Prediction Confidence</h4>
               <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                  Temporal predictions are synthesized using 48h of high-fidelity galactic telemetry. Accuracy remains stable across all mission orbits.
               </p>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex gap-6 items-center">
            <div className="p-4 bg-indigo-600 text-white rounded-2xl h-fit shadow-xl shadow-indigo-100"><Brain size={32} /></div>
            <div>
               <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Timeline Mainline: {data.current_timeline}</h4>
               <p className="text-[11px] text-slate-500 leading-relaxed mt-2 font-medium">
                  The Sovereign-Mainline timeline tracks every structural mutation and autonomous patch, ensuring irrefutable version control of the galactic computer.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TemporalCommand;
