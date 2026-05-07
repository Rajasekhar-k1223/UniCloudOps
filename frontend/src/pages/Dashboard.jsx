import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, IndianRupee, Server, Cloud, RefreshCw, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';

const Dashboard = () => {
  const { formatValue, CurrencyIcon } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [resources, setResources] = useState([]);
  const [trends, setTrends] = useState([]);
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, resRes, trendRes, histRes] = await Promise.all([
        api.get('/billing/summary'),
        api.get('/resources'),
        api.get('/billing/trends?days=7'),
        api.get('/billing/history?months=6')
      ]);
      setSummary(sumRes.data);
      setResources(resRes.data || []);
      setTrends(trendRes.data || []);
      setHistory(histRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post('/resources/sync');
      console.log("Sync Results:", res.data);
      await fetchDashboardData(); 
      alert("Real-time Multi-Cloud fleet sync initiated!");
    } catch (err) {
      console.error(err);
      alert("Sync failed. Check cloud account permissions or network connectivity.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <div className="animate-pulse flex space-x-4">Loading dashboard metrics...</div>;

  const statCards = [
    { name: 'Total Monthly Cost', value: formatValue(summary?.total_cost || 0), icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { name: 'Active Resources', value: resources.length, icon: Server, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Cloud Accounts', value: summary?.linked_accounts || 0, icon: Cloud, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'Estimated Savings', value: formatValue(summary?.potential_savings || 0), icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  // 📊 High-Fidelity Custom Tooltip 📊
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-black text-emerald-600">{formatValue(total, label)}</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry, index) => {
              const provider = entry.name;
              const count = resources.filter(r => r.provider?.toLowerCase() === provider.toLowerCase()).length;
              const color = entry.color || entry.stroke;
              return (
                <div key={index} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{provider}</span>
                    <span className="text-[9px] font-bold text-slate-300">({count} resources)</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">{formatValue(entry.value, label)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mission Intelligence Command</h1>
          <p className="text-gray-500 text-sm">Real-time multi-cloud infrastructure and unified fiscal telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/create-vm"
            className="flex items-center px-4 py-2 rounded-lg bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Launch New VM
          </Link>
          <button 
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg active:scale-95 ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Fleet'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 flex items-center hover:border-indigo-200 transition-all group">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} mr-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.name}</p>
              <p className="text-xl font-black text-gray-900 truncate max-w-[150px]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Unified Fiscal Flux</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{viewMode === 'daily' ? '7-Day Cross-Provider Cost Trajectory' : '6-Month Historical Revenue Stream'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('daily')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${viewMode === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setViewMode('monthly')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Monthly
                </button>
              </div>
              <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">Live Neural API</div>
            </div>
          </div>
          <div className="h-80">
            {(viewMode === 'daily' ? trends : history).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewMode === 'daily' ? trends : history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAws" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAzure" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGcp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorContabo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCloudflare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey={viewMode === 'daily' ? 'date' : 'month'} stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => formatValue(val)} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    content={({ payload }) => (
                      <div className="flex gap-4 justify-end mb-4">
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {Object.keys((viewMode === 'daily' ? trends : history)[0] || {}).filter(k => k !== 'date' && k !== 'month').map((provider, i) => {
                    const colors = {
                      aws: { stroke: '#10b981', fill: 'url(#colorAws)' },
                      azure: { stroke: '#3b82f6', fill: 'url(#colorAzure)' },
                      gcp: { stroke: '#6366f1', fill: 'url(#colorGcp)' },
                      digitalocean: { stroke: '#0ea5e9', fill: 'url(#colorDo)' },
                      contabo: { stroke: '#f59e0b', fill: 'url(#colorContabo)' },
                      cloudflare: { stroke: '#f97316', fill: 'url(#colorCloudflare)' },
                      github: { stroke: '#64748b', fill: '#f1f5f9' }
                    };
                    const config = colors[provider] || { stroke: '#94a3b8', fill: '#f1f5f9' };
                    return (
                      <Area 
                        key={provider}
                        type="monotone" 
                        dataKey={provider} 
                        stroke={config.stroke} 
                        strokeWidth={3}
                        fillOpacity={0.1} 
                        fill={config.fill} 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Fiscal Telemetry...</div>
            )}
          </div>
          
          {/* Service Breakdown */}
          {summary?.status === 'pending_ingestion' ? (
            <div className="mt-8 pt-6 border-t border-gray-100 italic text-gray-400 text-sm">
              AWS is still processing your billing data. Historical trends will appear within 24 hours.
            </div>
          ) : summary?.services && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Charges by Service</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.services).map(([service, cost]) => (
                  <div key={service} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 truncate">{service}</p>
                    <p className="text-sm font-bold text-gray-800">{formatValue(cost)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resources Summary */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Compute</h2>
          <div className="space-y-4">
            {(Array.isArray(resources) ? resources.slice(0, 8) : []).map(res => (
              <div key={res.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${res.status === 'running' ? 'bg-emerald-500' : 'bg-yellow-500'} mr-3`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{res.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{res.os_type || 'Linux'} • {res.instance_type || 't2.micro'}</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{res.region}</span>
              </div>
            ))}
            {resources.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No resources found</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
