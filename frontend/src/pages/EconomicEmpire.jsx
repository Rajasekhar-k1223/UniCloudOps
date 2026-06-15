import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, TrendingUp, RefreshCw, BarChart3, Activity, ShieldCheck, Info, Wallet, PieChart, ArrowUpRight, TrendingDown } from 'lucide-react';
import api from '../services/api';

const EconomicEmpire = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTrading, setIsTrading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/economy/status');
      setData(res.data);
    } catch (err) {
      console.error("Fiscal Link failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTrade = async () => {
    setIsTrading(true);
    try {
      const res = await api.post('/economy/trade');
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Trade Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsTrading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-amber-500 w-12 h-12" />
       <p className="text-xs font-black text-amber-400 uppercase tracking-[0.4em]">Synchronizing_Autonomous_Economic_Empire...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#422006] p-10 rounded-[3rem] border border-amber-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl shadow-lg shadow-amber-500/10"><Wallet size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Economic Empire</h1>
          </div>
          <p className="text-amber-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-10 Fiscal Self-Sovereignty. Sovereign-AI acts as a high-frequency fiscal broker, generating budget from cloud market arbitrage to autonomously fund galactic infrastructure.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 size={250} className="text-amber-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Budget Monitor */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Sovereign Budget Pool</h3>
               
               <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-full border-8 border-amber-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                     <div>
                        <p className="text-3xl font-black text-amber-600">${(data.sovereign_budget / 1000).toFixed(1)}k</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total_Liquidity</p>
                     </div>
                  </div>
                  <div className="absolute inset-0 border-t-8 border-amber-500 rounded-full animate-spin duration-[7000ms]" style={{ opacity: 0.3 }} />
               </div>

               <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fiscal Autonomy Index</p>
                  <p className="text-sm font-black text-white">{data.fiscal_autonomy}%</p>
               </div>
            </div>

            <button 
              onClick={handleTrade}
              disabled={isTrading}
              className="w-full py-6 bg-amber-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-amber-900/40 hover:bg-amber-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
               {isTrading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
               {isTrading ? 'Executing Fiscal Trade...' : 'Generate Sovereign Revenue'}
            </button>

            <div className="bg-amber-900/10 p-8 rounded-[3rem] border border-amber-500/20 flex gap-4">
               <div className="p-3 bg-amber-500 text-white rounded-2xl h-fit shadow-lg shadow-amber-500/20"><Info size={20} /></div>
               <p className="text-[10px] text-amber-900 font-medium leading-relaxed uppercase tracking-tight">
                  The AI trades cloud compute credits and spot rights to generate revenue that covers 100% of your galactic mission costs.
               </p>
            </div>
         </div>

         {/* Market Trades */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <PieChart size={14} className="text-amber-500" />
                    Autonomous Market Arbitrage Feed
                  </h3>
                  <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                     Monthly Revenue: ${data.monthly_revenue.toLocaleString()}
                  </div>
               </div>

               <div className="space-y-4">
                  {data.active_trades.map((trade) => (
                    <div key={trade.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-amber-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-2xl shadow-xl bg-slate-900 text-white`}>
                             <DollarSign size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trade.id} | Vol: {trade.volume}</p>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                   trade.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                   {trade.status}
                                </span>
                             </div>
                             <h4 className="text-sm font-black text-slate-800">{trade.asset}</h4>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase">Realized Gain</p>
                             <p className="text-xl font-black text-emerald-600">{trade.gain}</p>
                          </div>
                          <div className="h-12 w-px bg-slate-200" />
                          <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-300 hover:text-amber-500 transition-all">
                             <ArrowUpRight size={20} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-slate-900 rounded-[3rem] border border-white/5 flex gap-6 items-center">
                  <div className="p-4 bg-white/5 text-amber-400 rounded-2xl border border-white/10"><ShieldCheck size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-white uppercase tracking-widest">Sovereign Financial Freedom</h4>
                     <p className="text-[11px] text-slate-500 leading-relaxed mt-2 font-medium">
                        Autonomous Economic Empire ensures that your infrastructure pays for itself. By participating in global cloud credit markets, the platform generates its own growth capital.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default EconomicEmpire;
