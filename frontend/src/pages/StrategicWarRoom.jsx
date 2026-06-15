import React, { useState } from 'react';
import { Target, Zap, ShieldAlert, DollarSign, Activity, RefreshCw, Send, Brain, Info, Play, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const StrategicWarRoom = () => {
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('REGIONAL_BLACKOUT');

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulation(null);
    try {
      const res = await api.post('/war-room/simulate', { scenario_type: selectedScenario });
      setSimulation(res.data);
    } catch (err) {
      alert("Simulation Failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSimulating(false);
    }
  };

  const scenarios = [
    { id: 'REGIONAL_BLACKOUT', name: 'Regional Blackout', icon: ShieldAlert, color: 'text-rose-500' },
    { id: 'FISCAL_CRISIS', name: 'Fiscal Crisis', icon: DollarSign, color: 'text-emerald-500' },
    { id: 'NEURAL_INTRUSION', name: 'Neural Intrusion', icon: Target, color: 'text-indigo-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e1b4b] p-10 rounded-[3rem] border border-indigo-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><Target size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Strategic War Room</h1>
          </div>
          <p className="text-indigo-200/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-7 Omniscient Foresight. Simulate complex multi-cloud scenarios and validate autonomous response strategies before they occur in real-world orbits.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={250} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scenario Selector */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Play size={14} className="text-indigo-500" />
                Select Simulation Orbit
              </h3>

              <div className="space-y-4">
                 {scenarios.map((s) => (
                   <button 
                     key={s.id}
                     onClick={() => setSelectedScenario(s.id)}
                     className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
                       selectedScenario === s.id ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
                     }`}
                   >
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-xl bg-white shadow-sm ${s.color}`}><s.icon size={20} /></div>
                         <p className="text-sm font-black text-slate-800">{s.name}</p>
                      </div>
                      {selectedScenario === s.id && <ArrowRight className="text-indigo-600" size={16} />}
                   </button>
                 ))}
              </div>

              <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full mt-10 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                 {isSimulating ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                 {isSimulating ? 'Simulating Orbit...' : 'Initiate Simulation'}
              </button>
           </div>

           <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-5 items-center">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl border border-indigo-500/20"><Brain size={24} /></div>
              <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Neural Simulation Engine</h4>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                    Uses high-fidelity historical telemetry to model mission survival probability across AWS, Azure, and OCI project orbits.
                 </p>
              </div>
           </div>
        </div>

        {/* Simulation Output */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[600px] flex flex-col">
              {!simulation ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <Activity size={80} className="text-slate-200 mb-6" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Awaiting Simulation Loop</h3>
                    <p className="text-sm font-medium italic mt-2">Select a scenario to visualize the AI's autonomous response strategy.</p>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right-8 duration-700">
                   <div className="flex justify-between items-start mb-10">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Analysis</p>
                         <h3 className="text-xl font-black text-rose-600 uppercase">{simulation.impact_analysis}</h3>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 px-6 py-4 rounded-3xl text-center">
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Survival Probability</p>
                         <p className="text-2xl font-black text-emerald-700">{simulation.survival_probability}%</p>
                      </div>
                   </div>

                   <div className="flex-1 space-y-4">
                      {simulation.response_timeline.map((step, i) => (
                        <div key={i} className="flex gap-6 items-start group">
                           <div className="flex flex-col items-center gap-2 pt-1">
                              <div className="w-4 h-4 rounded-full border-2 border-indigo-500 bg-white" />
                              {i < simulation.response_timeline.length - 1 && <div className="w-0.5 h-16 bg-slate-100" />}
                           </div>
                           <div className="flex-1 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:border-indigo-200 transition-all">
                              <div className="flex items-center gap-3 mb-2">
                                 <Clock className="text-slate-400" size={12} />
                                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{step.time}</span>
                              </div>
                              <p className="text-sm font-black text-slate-800">{step.action}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="mt-12 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex gap-6 items-center">
                      <div className="p-4 bg-indigo-600 text-white rounded-2xl h-fit shadow-xl shadow-indigo-200"><ShieldCheck size={24} /></div>
                      <div>
                         <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Strategy Validated</h4>
                         <p className="text-[11px] text-indigo-800/70 leading-relaxed mt-2 font-medium">
                            The synthesized response strategy has been cross-referenced with all mission orbits. Deploying this scenario to active guardrails will ensure zero-downtime survival.
                         </p>
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

export default StrategicWarRoom;
