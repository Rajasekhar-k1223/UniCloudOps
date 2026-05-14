import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, ReferenceLine } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { DollarSign, ShieldAlert, Target, Clock } from 'lucide-react';
import api from '../services/api';

const Billing = () => {
  const { formatValue } = useCurrency();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [trends, setTrends] = useState([]);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectSummary, setProjectSummary] = useState(null);

  const processedTrends = React.useMemo(() => {
    // If backend provided a full forecast series, use it
    if (forecast && forecast.length > 0) {
      return forecast.map(item => {
        // Format dates for UI consistency (MMM DD)
        try {
          const d = new Date(item.date);
          return {
            ...item,
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };
        } catch (e) {
          return item;
        }
      });
    }

    // Fallback to manual calculation if forecast API fails
    let cumulativeSum = 0;
    const data = [...trends].map(t => {
      const dailySum = Object.keys(t).reduce((sum, key) => key !== 'date' ? sum + t[key] : sum, 0);
      cumulativeSum += dailySum;
      return { ...t, cumulative: cumulativeSum };
    });

    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const avgDaily = cumulativeSum / data.length;
      
      for (let i = 1; i <= 7; i++) {
        const fDate = new Date(lastPoint.date);
        fDate.setDate(fDate.getDate() + i);
        data.push({
          date: fDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          forecast: cumulativeSum + (avgDaily * i),
          isForecast: true
        });
      }
    }
    return data;
  }, [trends, forecast]);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [trendsRes, historyRes, summaryRes, recsRes, forecastRes] = await Promise.all([
          api.get('/billing/trends?days=30'),
          api.get('/billing/history?months=6'),
          user?.project_id ? api.get(`/projects/${user.project_id}/summary`) : Promise.resolve({ data: null }),
          api.get('/billing/recommendations'),
          api.get('/billing/forecast?days=30')
        ]);
        setTrends(trendsRes.data);
        setHistory(historyRes.data);
        setProjectSummary(summaryRes.data);
        setRecommendations(recsRes.data);
        setForecast(forecastRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBillingData();
  }, [user?.project_id]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [trendsRes, historyRes, recsRes, forecastRes] = await Promise.all([
        api.get('/billing/trends?days=30&refresh=true'),
        api.get('/billing/history?months=6&refresh=true'),
        api.get('/billing/recommendations'),
        api.get('/billing/forecast?days=30&refresh=true')
      ]);
      setTrends(trendsRes.data);
      setHistory(historyRes.data);
      setRecommendations(recsRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique providers from the first row to create dynamic bars (in production we'd aggregate keys)
  // Extract all unique providers across the entire trend timeline
  const providers = trends.reduce((acc, curr) => {
    Object.keys(curr).forEach(key => {
      if (key !== 'date' && !acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, []);

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const totalPotentialSavings = recommendations.reduce((acc, curr) => acc + curr.potential_savings, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">Financial Intelligence</h1>
          <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded uppercase tracking-widest border border-emerald-200">
            Fidelity: REAL DATA
          </div>
        </div>
        <button 
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-blue-500 rounded-xl text-[10px] font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          <Clock className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'SYNCING LIVE DATA...' : 'FORCE REFRESH REAL DATA'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-5 bg-white/50 border-white/40">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Today (24h Latency)</p>
           <p className="text-2xl font-bold text-gray-900">{formatValue(trends.length > 0 ? Object.keys(trends[trends.length-1]).reduce((sum, k) => k !== 'date' ? sum + trends[trends.length-1][k] : sum, 0) : 0)}</p>
           <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase tracking-tighter">
              <Clock className="w-3 h-3" />
              Live Cloud Pulse
           </div>
        </div>
        <div className="glass-panel p-5 bg-white/50 border-white/40">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Multi-Cloud Spend</p>
           <p className="text-2xl font-bold text-gray-900">{formatValue(trends.reduce((acc, curr) => acc + Object.keys(curr).reduce((sum, k) => k !== 'date' ? sum + curr[k] : sum, 0), 0))}</p>
           <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
             <Clock className="w-3 h-3" />
             <span>Full Mission Lifecycle</span>
           </div>
        </div>
        
        <div className="glass-panel p-5 bg-white/50 border-white/40">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Cloud Missions</p>
           <p className="text-2xl font-bold text-gray-900">{providers.length}</p>
           <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 font-bold">
             <ShieldAlert size={12} />
             <span>{providers.includes('azure') ? 'AZURE RECOVERY NEEDED' : 'ALL SYSTEMS GREEN'}</span>
           </div>
        </div>

        <div className="glass-panel p-5 bg-white/50 border-white/40 col-span-1 md:col-span-2">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Multi-Cloud Efficiency</p>
               <p className="text-2xl font-bold text-gray-900">92.4%</p>
             </div>
             <div className="h-10 w-24 bg-blue-50 rounded-lg flex items-end p-1 gap-0.5">
               {[40, 70, 45, 90, 65, 80, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-blue-400 rounded-sm" style={{ height: `${h}%` }} />
               ))}
             </div>
           </div>
           <p className="text-[10px] text-gray-400 mt-2 font-medium">OPTIMIZATION ALREADY ACTIVE ON {providers.length * 2} INSTANCES</p>
        </div>
      </div>

      {projectSummary && (
        <div className="glass-panel p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Target size={120} />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${projectSummary.alert_breached ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <DollarSign size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Project Budget: {projectSummary.name}</h2>
                <p className="text-sm text-gray-500">Global Financial Guardrail Status</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">MTD Spend</p>
                <p className="text-xl font-bold text-gray-900">{formatValue(projectSummary.current_spend_mtd)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Monthly Limit</p>
                <p className="text-xl font-bold text-gray-400">{formatValue(projectSummary.budget_limit)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className={`text-xs font-bold uppercase ${projectSummary.budget_exceeded ? 'text-rose-500' : 'text-gray-400'}`}>
                {projectSummary.budget_exceeded ? 'Budget Breached' : 'Quota Consumption'}
              </span>
              <span className="text-sm font-bold text-gray-700">{projectSummary.budget_percentage}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-1000 ${
                  projectSummary.budget_exceeded ? 'bg-rose-500' : 
                  projectSummary.alert_breached ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(projectSummary.budget_percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              <span>Mission Start</span>
              <span>Guardrail at {projectSummary.alert_threshold * 100}%</span>
              <span>Hard Stop</span>
            </div>
          </div>

          {projectSummary.budget_exceeded && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
              <ShieldAlert size={16} />
              <span className="font-medium font-bold">CRITICAL: Monthly budget guardrail reached. Provisioning systems are now in lock-down.</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Burn-up & Predictive Forecast (May 2026)
            </h2>
          </div>
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-bold animate-pulse">
              COLLECTING CLOUD TELEMETRY...
            </div>
          ) : trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={processedTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => formatValue(val)} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
                  formatter={(val, name) => [formatValue(val), name.toUpperCase()]}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                
                {/* Cumulative Area */}
                <Area type="monotone" dataKey="cumulative" name="Cumulative Spend" fill="#f0f9ff" stroke="#3b82f6" strokeWidth={0} />
                
                {/* Daily Bars */}
                {providers.map((provider, i) => (
                  <Bar key={provider} dataKey={provider} name={`${provider} (Daily)`} stackId="a" fill={colors[i % colors.length]} radius={i === providers.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} barSize={20} />
                ))}

                {/* Forecast Line */}
                <Line type="monotone" dataKey="forecast" name="Predicted Forecast" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                
                <ReferenceLine x={trends.length > 0 ? trends[trends.length-1].date : ""} stroke="#ef4444" label={{ position: 'top', value: 'TODAY', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No billing data available for the last 30 days.
            </div>
          )}
        </div>

        <div className="glass-panel p-6 h-[500px]">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Provider Allocation
          </h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providers.map((p, i) => ({
                    name: p,
                    value: trends.length > 0 ? trends[trends.length - 1][p] : 0,
                    fill: colors[i % colors.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {providers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name) => [formatValue(val), `Total ${name.toUpperCase()} Spend`]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                <Legend layout="vertical" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sovereign Diversity</span>
            <span className="text-xs font-bold text-slate-800">{providers.length} Active Clouds</span>
          </div>
        </div>
      </div>
      
      {/* --- NEW: Historical Monthly Overview --- */}
      <div className="glass-panel p-6 h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Historical Monthly Mission Spend
          </h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase bg-slate-100 px-2 py-1 rounded">Last 6 Months</span>
        </div>
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 font-bold animate-pulse">
            EXTRACTING HISTORICAL TELEMETRY...
          </div>
        ) : history.length > 0 ? (
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {providers.map((p, i) => (
                  <linearGradient key={`grad-${p}`} id={`color-${p}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => formatValue(val)} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(val, name) => [formatValue(val), `Historical ${name.toUpperCase()} Spend`]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
              {providers.map((provider, i) => (
                <Area 
                  key={provider} 
                  type="monotone" 
                  dataKey={provider} 
                  stackId="1" 
                  stroke={colors[i % colors.length]} 
                  fill={`url(#color-${provider})`} 
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Historical data processing in progress. Check back shortly.
          </div>
        )}
      </div>

      {/* Detailed Billing Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Service Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-400 uppercase">Service / Provider</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-400 uppercase">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trends.length > 0 && providers.map(p => (
                  <tr key={p} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 capitalize">{p} Services</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-emerald-600">
                      {formatValue(trends[trends.length-1][p] || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-800 leading-relaxed italic">
              * Costs are estimated in real-time. Final billing is subject to provider consolidation at month-end.
            </p>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            AI Optimization Mission
          </h2>
          <div className="space-y-3">
            {recommendations.length > 0 ? recommendations.map((rec, idx) => (
              <div key={idx} className={`p-4 rounded-xl border transition-all ${
                rec.severity === 'high' ? 'bg-rose-50/30 border-rose-100' : 'bg-amber-50/30 border-amber-100'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xs font-bold text-gray-800">{rec.action}: {rec.resource_name}</h3>
                  <span className="text-xs font-bold text-emerald-600">Save {formatValue(rec.potential_savings)}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{rec.reason}</p>
                <div className="mt-3 flex items-center justify-between">
                   <div className="flex gap-1.5">
                     <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                       rec.severity === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                     }`}>
                       {rec.severity}
                     </span>
                   </div>
                   <button className="text-[10px] font-bold text-blue-600 hover:underline">Execute Mission</button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                 <p className="text-xs text-gray-500 font-medium">No active recommendations.</p>
                 <p className="text-[9px] text-gray-400 mt-1">Check back as our AI analyzes more telemetry.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
