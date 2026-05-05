import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Clock, Shield, Search, Filter, Play, RefreshCw, BarChart } from 'lucide-react';
import api from '../services/api';

const Serverless = () => {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchFunctions = async () => {
    try {
      const res = await api.get('/serverless/functions');
      setFunctions(res.data);
    } catch (err) {
      console.error("Failed to fetch functions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunctions();
    const interval = setInterval(fetchFunctions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchFunctions();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active' || s === 'running') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (s === 'pending' || s === 'creating') return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'aws': return 'bg-orange-500';
      case 'azure': return 'bg-blue-500';
      case 'gcp': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Serverless Explorer</h1>
          <p className="text-gray-500">Unified command for decentralized functions across mission-critical providers.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="glass-panel p-6 shadow-xl border-slate-200/60 overflow-hidden">
        <div className="mb-6 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search functions by name or runtime..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600/30 outline-none" />
           </div>
           <button className="px-4 py-2 bg-slate-50 border border-gray-100 rounded-lg text-slate-600 font-bold text-sm flex items-center gap-2">
              <Filter size={16} /> Filters
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Strategic Function</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mission Boundary</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Runtime Environment</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memory Config</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="6" className="py-20 text-center">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Discovering decentralized assets...</p>
                   </td>
                </tr>
              ) : functions.length > 0 ? (
                functions.map((fn) => (
                  <tr key={fn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getProviderColor(fn.provider)} text-white shadow-sm`}>
                             <Zap size={16} />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-800">{fn.name}</p>
                             <p className="text-[10px] text-gray-400 font-mono italic">{fn.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-gray-600">{fn.account_name}</span>
                       <p className="text-[10px] text-gray-400 uppercase tracking-widest">{fn.region}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-mono border border-slate-200">
                          {fn.runtime}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-gray-700">{fn.memory} MB</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getStatusColor(fn.status)}`}>
                          {fn.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition" title="Invoke Mission">
                             <Play size={16} />
                          </button>
                          <button className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition" title="Tactical Metrics">
                             <BarChart size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="6" className="py-20 text-center text-gray-400 italic">No decentralized functions detected in current trajectory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Serverless;
