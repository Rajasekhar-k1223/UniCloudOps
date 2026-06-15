import React, { useState, useEffect } from 'react';
import { ShoppingCart, Zap, TrendingDown, RefreshCw, Ship, Activity, ShieldCheck, Info, DollarSign, BarChart3, TrendingUp, ArrowRightLeft } from 'lucide-react';
import api from '../services/api';

const ResourceAuction = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/auction/bids');
      setData(res.data);
    } catch (err) {
      console.error("Market synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwap = async (arbId) => {
    setSwapping(arbId);
    try {
      const res = await api.post('/auction/swap', { arb_id: arbId, mission_id: 'MISSION-X' });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Arbitrage Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setSwapping(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-emerald-500 w-12 h-12" />
       <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Synchronizing_Galactic_Market_Bids...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#064e3b] p-10 rounded-[3rem] border border-emerald-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10"><DollarSign size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Galactic Resource Auction</h1>
          </div>
          <p className="text-emerald-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-8 Fiscal Arbitrage. High-frequency spot-market bidding across multi-cloud orbits to ensure absolute minimum cost per compute unit.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 size={250} className="text-emerald-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Fiscal Summary */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Arbitrage Savings</h3>
               <p className="text-4xl font-black text-emerald-600">${data.total_arbitrage_savings}</p>
               <div className="mt-4 flex items-center justify-center gap-2 text-emerald-500 font-black text-xs">
                  <TrendingDown size={16} /> 22% vs Last Month
               </div>
            </div>

            <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[9px] font-black text-slate-500 uppercase">Market Sync</p>
                     <p className="text-xl font-black text-white">{data.market_sync}</p>
                  </div>
                  <Activity className="text-emerald-500" size={24} />
               </div>
               <div className="h-px bg-white/5" />
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[9px] font-black text-slate-500 uppercase">Live Bids Active</p>
                     <p className="text-xl font-black text-emerald-400">{data.opportunities.length}</p>
                  </div>
                  <Zap className="text-amber-500" size={24} />
               </div>
            </div>

            <div className="bg-emerald-900/10 p-8 rounded-[3rem] border border-emerald-500/20 flex gap-4">
               <div className="p-3 bg-emerald-500 text-white rounded-2xl h-fit shadow-lg shadow-emerald-500/20"><Info size={20} /></div>
               <p className="text-[10px] text-emerald-900 font-medium leading-relaxed uppercase tracking-tight">
                  The AI Fiscal-Broker bids on spot resources in 50ms intervals, swapping mission workloads to the most cost-effective nodes.
               </p>
            </div>
         </div>

         {/* Auction Bids */}
         <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                 <ArrowRightLeft size={14} className="text-emerald-500" />
                 Active Market Arbitrage Opportunities
               </h3>

               <div className="space-y-4">
                  {data.opportunities.map((opp) => (
                    <div key={opp.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-2xl shadow-xl bg-slate-900 text-white`}>
                             <ShoppingCart size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{opp.provider} | {opp.instance}</p>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                   opp.status === 'trending_down' ? 'bg-emerald-100 text-emerald-700' : 
                                   opp.status === 'volatile' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                   {opp.status}
                                </span>
                             </div>
                             <div className="flex items-center gap-4">
                                <p className="text-xl font-black text-slate-800">${opp.spot_price}/hr</p>
                                <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase">-{opp.savings}% vs On-Demand</div>
                             </div>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleSwap(opp.id)}
                         disabled={swapping === opp.id}
                         className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center gap-3 active:scale-95"
                       >
                          {swapping === opp.id ? <RefreshCw className="animate-spin" size={16} /> : <Ship size={16} />}
                          {swapping === opp.id ? 'Executing Arbitrage...' : 'Execute Swap'}
                       </button>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex gap-6 items-center">
                  <div className="p-4 bg-emerald-600 text-white rounded-2xl h-fit shadow-xl shadow-emerald-200"><ShieldCheck size={24} /></div>
                  <div>
                     <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Autonomous Fiscal Brokerage</h4>
                     <p className="text-[11px] text-emerald-800/70 leading-relaxed mt-2 font-medium">
                        The Galactic Resource Auction is always active. It continuously migrates mission orbits to the lowest-cost compute markets on earth while maintaining 100% mission health.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ResourceAuction;
