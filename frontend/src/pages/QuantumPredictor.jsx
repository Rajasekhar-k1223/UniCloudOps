import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Activity, Brain, Clock, BarChart3, ArrowUpRight, RefreshCw, Cpu, Target, ShieldCheck, Info } from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const QuantumPredictor = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const fetchForecast = async () => {
    try {
      const res = await api.get('/predictor/forecast');
      setForecast(res.data);
    } catch (err) {
      console.error("Forecast Synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleProvision = async () => {
    setIsProvisioning(true);
    try {
      const res = await api.post('/predictor/provision', { region: 'US-EAST-1', node_count: 12 });
      alert(res.data.message);
    } catch (err) {
      alert("Neural Provisioning Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsProvisioning(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-rose-500 w-12 h-12" />
       <p className="text-xs font-black text-rose-400 uppercase tracking-[0.4em]">Synchronizing_Quantum_Forecast...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#450a0a] p-10 rounded-[3rem] border border-rose-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl shadow-lg shadow-rose-500/10"><TrendingUp size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Quantum Capacity Predictor</h1>
          </div>
          <p className="text-rose-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-5 Neural Capacity Planning. Anticipate global traffic surges through time-series neural analysis and pre-provision infrastructure across multi-cloud mission orbits.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 size={250} className="text-rose-400" /></div>
      </div>

      <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 flex items-center justify-between">
         <div className="flex gap-6 items-center">
            <div className="p-4 bg-rose-600 text-white rounded-3xl shadow-xl shadow-rose-200"><Brain size={32} /></div>
            <div>
               <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest">Neural Recommendation</h3>
               <p className="text-lg font-bold text-rose-700 mt-1">{forecast.neural_recommendation}</p>
            </div>
         </div>
         <button 
           onClick={handleProvision}
           disabled={isProvisioning}
           className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex items-center gap-2"
         >
            {isProvisioning ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
            {isProvisioning ? 'Provisioning...' : 'Authorize Neural Scaling'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Forecast Chart */}
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm h-[500px] flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
              <BarChart3 size={14} className="text-rose-500" />
              24-Hour Neural Traffic Forecast
            </h3>
            
            <div className="flex-1 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.forecast}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                      itemStyle={{ color: '#f43f5e', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="predicted_load" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorLoad)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Predictor Stats */}
         <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Prediction Confidence</h4>
               <div className="flex items-end gap-3">
                  <p className="text-5xl font-black text-slate-800">92%</p>
                  <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs mb-1">
                     <ArrowUpRight size={14} />
                     <span>+4.2% Stability</span>
                  </div>
               </div>
               <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[92%] shadow-[0_0_10px_#f43f5e]" />
               </div>
            </div>

            <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-5 items-center">
               <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><Clock size={24} /></div>
               <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Neural Horizon</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 uppercase">
                     The predictor maintains a rolling 24-hour horizon, re-syncing with global traffic telemetry every 300 seconds.
                  </p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex gap-5 items-center">
               <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl"><Target size={24} /></div>
               <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pre-Provision Target</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1 uppercase">
                     Targeting US-EAST-1 (AWS) for proactive cluster expansion to prevent latent mission degradation.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default QuantumPredictor;
