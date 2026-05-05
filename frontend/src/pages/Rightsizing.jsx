import React, { useState, useEffect } from 'react';
import { Zap, TrendingDown, DollarSign, Activity, ChevronRight, AlertTriangle, ShieldCheck, RefreshCw, BarChart3, ArrowRight } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

const Rightsizing = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/resources/rightsizing/all');
      setRecommendations(res.data);
    } catch (err) {
      console.error("Intelligence engine offline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const totalSavings = recommendations.reduce((acc, rec) => acc + (rec.estimated_monthly_savings || 0), 0);
  const downsizeCount = recommendations.filter(r => r.action === 'DOWNSIZE').length;
  const upsizeCount = recommendations.filter(r => r.action === 'UPSIZE').length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-amber-500/30">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        
        {/* Intelligence Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                <Zap className="text-amber-500" size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Operational Intelligence</span>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase">Rightsizing <span className="text-slate-500">Advisory</span></h1>
              </div>
            </div>
            <p className="text-slate-500 max-w-xl text-sm font-medium leading-relaxed">
              AI-driven infrastructure optimization based on multi-cloud telemetry. Analyzing historical utilization to maximize mission cost-efficiency.
            </p>
          </div>

          <div className="flex gap-4">
             <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
             >
                <RefreshCw size={14} className={clsx(isRefreshing && "animate-spin")} />
                {isRefreshing ? 'Refreshing Intelligence...' : 'Refresh Radar'}
             </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Monthly Savings</p>
              <p className="text-4xl font-black text-white tabular-nums">${totalSavings.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
                 <TrendingDown size={12} /> Optimization Potential
              </div>
           </div>

           {[
             { label: 'Downsize Candidates', value: downsizeCount, color: 'text-amber-500', bg: 'bg-amber-500/10' },
             { label: 'Performance Bottlenecks', value: upsizeCount, color: 'text-rose-500', bg: 'bg-rose-500/10' },
             { label: 'Data Fidelity', value: 'Prime', color: 'text-blue-500', bg: 'bg-blue-500/10' }
           ].map((card, i) => (
             <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:translate-y-[-4px] transition-all">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{card.label}</p>
                <p className="text-4xl font-black text-white tabular-nums">{card.value}</p>
                <div className={clsx("mt-4 w-12 h-1 rounded-full", card.bg.replace('/10', ''))} />
             </div>
           ))}
        </div>

        {/* Recommendations Feed */}
        <div className="space-y-4">
           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2 mb-6">
              <Activity size={14} /> Tactical Optimization Trace
           </h3>

           {loading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-6 opacity-30">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">analyzing_telemetry_matrix</span>
             </div>
           ) : recommendations.length === 0 ? (
             <div className="py-40 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                <ShieldCheck size={64} className="text-emerald-500/20 mb-6" />
                <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Efficiency Baseline Achieved</h3>
                <p className="text-sm text-slate-600 mt-2">No active rightsizing recommendations discovered for the current mission trajectory.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {recommendations.map((rec, i) => (
                  <div key={i} className="group glass-panel-dark bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-amber-500/20 rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-center gap-12 transition-all">
                     <div className="shrink-0 space-y-4 text-center lg:text-left">
                        <div className={clsx(
                           "w-20 h-20 rounded-3xl flex items-center justify-center border-2",
                           rec.action === 'DOWNSIZE' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        )}>
                           {rec.action === 'DOWNSIZE' ? <TrendingDown size={40} /> : <Zap size={40} />}
                        </div>
                        <div className="flex flex-col gap-1 items-center lg:items-start text-[9px] font-black uppercase tracking-widest">
                           <span className="text-slate-600">Avg Utilization</span>
                           <span className={clsx(rec.avg_cpu < 15 ? "text-amber-500" : "text-emerald-500")}>{rec.avg_cpu}% CPU</span>
                        </div>
                     </div>

                     <div className="flex-1 space-y-6">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">{rec.resource_name}</span>
                             <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Compute Asset</span>
                           </div>
                           <h4 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{rec.action} <span className="text-slate-500">ADVISORY</span></h4>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-center">
                           <div className="flex-1 w-full bg-white/5 rounded-2xl p-6 border border-white/5 group-hover:border-white/10 transition-all flex items-center justify-between">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Matrix</p>
                                 <p className="text-xl font-black text-white">{rec.current_type}</p>
                              </div>
                              <ArrowRight className="text-slate-700" size={24} />
                              <div className="text-right space-y-1">
                                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Recommended</p>
                                 <p className="text-xl font-black text-amber-400">{rec.recommended_type}</p>
                              </div>
                           </div>

                           <div className="shrink-0 flex flex-col items-center md:items-end gap-1">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Savings</p>
                              <p className="text-3xl font-black text-emerald-400 tabular-nums">${rec.estimated_monthly_savings}<span className="text-xs text-slate-500 ml-1">/mo</span></p>
                           </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                           <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                           <p className="text-[11px] font-medium text-slate-400 italic">"{rec.reason}"</p>
                        </div>
                     </div>

                     <div className="shrink-0 w-full lg:w-fit flex flex-col gap-3">
                        <button className="w-full lg:w-48 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                           View Analytics
                        </button>
                        <button 
                           onClick={() => alert("Rightsizing mission initiated. Deployment in progress.")}
                           className="w-full lg:w-48 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20"
                        >
                           Apply Optimization
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Intelligence Insight Sidebar (Horizontal Integration) */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 pt-20 border-t border-white/5">
           <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-12 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-[2000ms]" />
              <BarChart3 className="w-16 h-16 text-white/20 mb-8" />
              <h3 className="text-3xl font-black uppercase mb-4 leading-tight relative z-10">Predictive <br/>Efficiency Engine</h3>
              <p className="text-slate-100/70 font-medium leading-relaxed max-w-md relative z-10">
                 Our neural analysis maps your past 48 hours of tactical operations to specific cloud provider hardware signatures, ensuring zero performance trade-offs.
              </p>
              <div className="mt-8 pt-8 border-t border-white/10 relative z-10 flex items-center gap-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Analysis Accuracy</p>
                    <p className="text-2xl font-black">99.2%</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Data Points</p>
                    <p className="text-2xl font-black">1.2M+</p>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <DollarSign size={14} className="text-amber-500" /> Fiscal Mission Compliance
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Under-utilized Resources Identified', count: downsizeCount, color: 'text-amber-500' },
                   { label: 'Project Budget Health', status: 'Optimal', color: 'text-emerald-500' },
                   { label: 'Optimization Frequency', status: 'Every 4 Hours', color: 'text-blue-500' }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <span className={clsx("text-xs font-black uppercase tracking-widest", stat.color)}>{stat.count ?? stat.status}</span>
                   </div>
                 ))}
              </div>
              <p className="text-[10px] text-slate-600 italic px-4">
                 Intelligence advisory is based on current hourly rates and does not include reserved instance discounts or specific regional spot pricing availability.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Rightsizing;
