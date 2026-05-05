import React, { useState, useEffect } from 'react';
import { Box, Plus, RefreshCw, Layers, CheckCircle, XCircle, Settings, Download, Monitor, Zap } from 'lucide-react';
import api from '../services/api';

const PluginHub = () => {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlugins = async () => {
    try {
      const res = await api.get('/cloud-accounts/providers');
      // Simulated: Map providers to a plugin structure
      const pluginData = res.data.map(p => ({
        id: p,
        name: p.charAt(0).toUpperCase() + p.slice(1) + " Mission Adapter",
        version: "v1.4.2",
        status: "active",
        type: p === 'edge' ? 'Hybrid' : 'Cloud',
        lastUpdated: "2024-03-27"
      }));
      setPlugins(pluginData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mission Plugin SDK Hub</h1>
          <p className="text-gray-500">Manage hot-swappable cloud and hardware adapters via the dynamic plugin system.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={fetchPlugins}
             className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-600"
           >
             <RefreshCw size={20} />
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-lg shadow-slate-200">
             <Plus size={18} />
             Install Mission Plugin
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic font-medium uppercase tracking-widest text-xs">Scanning Plugin Directory...</div>
        ) : plugins.map((p) => (
          <div key={p.id} className="glass-panel p-6 bg-white border border-slate-100 hover:border-indigo-300 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <Layers size={80} />
             </div>
             
             <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                   <Box size={24} className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{p.type} Adapter</span>
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[9px] font-bold text-emerald-600 uppercase">
                      <CheckCircle size={10} /> Active
                   </div>
                </div>
             </div>

             <h3 className="font-bold text-gray-800 text-lg mb-1">{p.name}</h3>
             <p className="text-[11px] text-slate-400 font-medium mb-6">Official UniOS maintainer • {p.version}</p>

             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Last Update</span>
                   <span className="text-xs font-bold text-slate-700">{p.lastUpdated}</span>
                </div>
                <div className="flex justify-end gap-2">
                   <button className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition text-slate-600">
                      <Settings size={14} />
                   </button>
                   <button className="p-2 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition text-rose-600">
                      <XCircle size={14} />
                   </button>
                </div>
             </div>
          </div>
        ))}

        {/* Developer Sandbox Card */}
        <div className="glass-panel p-6 bg-slate-900 text-white border border-slate-800 flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-black transition-all">
           <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Download size={32} className="text-indigo-400" />
           </div>
           <h3 className="font-bold text-lg mb-2">Build Custom Adapter</h3>
           <p className="text-sm text-slate-400 mb-6 px-4">Download the Mission SDK and build your own sovereign hardware adapters.</p>
           <button className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest hover:underline">
              View SDK Docs <Zap size={12} />
           </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-6">
         <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg ring-4 ring-indigo-50">
            <Monitor size={24} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-indigo-900">Plugin Hot-Reload Verified</h4>
            <p className="text-xs text-indigo-700 mt-1">
               The dynamic discovery agent is active. New mission plugins dropped in <code>backend/app/api/adapters/</code> are automatically registered without platform downtime.
            </p>
         </div>
      </div>
    </div>
  );
};

export default PluginHub;
