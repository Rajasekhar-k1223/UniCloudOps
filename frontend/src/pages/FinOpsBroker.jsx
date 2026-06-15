import React, { useState, useEffect } from 'react';
import { ShoppingCart, Zap, TrendingDown, ShieldCheck, RefreshCw, BarChart3, ArrowUpRight, DollarSign, Target, Activity } from 'lucide-react';
import api from '../services/api';

const FinOpsBroker = () => {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(null);

  const fetchMarket = async () => {
    try {
      const res = await api.get('/finops/market');
      setMarket(res.data);
    } catch (err) {
      console.error("Market Intelligence failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, []);

  const handleAction = async (provider, action) => {
    setExecuting(provider);
    try {
      const res = await api.post('/finops/execute', { provider, action });
      alert(res.data.message);
    } catch (err) {
      alert("Fiscal Authorization Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setExecuting(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-emerald-500 w-12 h-12" />
       <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Analyzing_Cloud_Markets...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#064e3b] p-10 rounded-[3rem] border border-emerald-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10"><ShoppingCart size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Autonomous FinOps Broker</h1>
          </div>
          <p className="text-emerald-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-5 Neural Fiscal Orchestration. Automatically exploit cloud market volatility (Spot, RI) to ensure mission objectives are met at absolute minimum cost.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={250} className="text-emerald-400" /></div>
      </div>

      <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100 flex items-center justify-between">
         <div className="flex gap-6 items-center">
            <div className="p-4 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-200"><TrendingDown size={32} /></div>
            <div>
               <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Global AI Recommendation</h3>
               <p className="text-lg font-bold text-emerald-700 mt-1">{market.global_recommendation}</p>
            </div>
         </div>
         <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">Authorize Global Optimization</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {market.market.map((m) => (
           <div key={m.provider} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black uppercase text-xs">
                       {m.provider}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.region}</p>
                       <p className="text-sm font-black text-slate-800">{m.instance_type}</p>
                    </div>
                 </div>
                 <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${m.availability === 'high' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    Market: {m.availability}
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">On-Demand</p>
                       <p className="text-sm font-black text-slate-600">${m.on_demand_price}/hr</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                       <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">AI Spot Price</p>
                       <p className="text-sm font-black text-emerald-700">${m.spot_price}/hr</p>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-900 rounded-[2rem] relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Savings Potential</p>
                          <p className="text-2xl font-black text-white">{m.savings_potential}%</p>
                       </div>
                       <ArrowUpRight className="text-emerald-400" size={32} />
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${m.savings_potential}%` }} />
                 </div>

                 <button 
                   onClick={() => handleAction(m.provider, 'Convert-to-Spot')}
                   disabled={executing === m.provider}
                   className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                 >
                    {executing === m.provider ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                    {executing === m.provider ? 'Broker Executing...' : 'Convert to Spot'}
                 </button>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
         <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-6 items-center">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl border border-indigo-500/20"><Target size={32} /></div>
            <div>
               <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Neural Market Polling</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                  Sovereign-AI polls cloud spot markets every 60 seconds to detect arbitrage and availability surges across 15+ global regions.
               </p>
            </div>
         </div>
         <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-6 items-center">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-3xl border border-emerald-500/20"><ShieldCheck size={32} /></div>
            <div>
               <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Fiscal Integrity Shield</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                  Broker actions are validated against mission SLA requirements. Spot interruptions automatically trigger "Global Warp" failovers.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FinOpsBroker;
