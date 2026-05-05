import React, { useState, useEffect } from 'react';
import { Layout, Globe, Activity, Terminal, Shield, Cpu, Layers, RefreshCw, ExternalLink } from 'lucide-react';
import api from '../services/api';

const Kubernetes = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchClusters = async () => {
    try {
      const res = await api.get('/kubernetes/clusters');
      setClusters(res.data);
    } catch (err) {
      console.error("Failed to fetch clusters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
    const interval = setInterval(fetchClusters, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchClusters();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active' || s === 'running' || s === 'succeeded') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (s === 'pending' || s === 'updating') return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'aws': return <Shield className="w-5 h-5 text-orange-500" />;
      case 'azure': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'gcp': return <Layers className="w-5 h-5 text-red-500" />;
      case 'digitalocean': return <Globe className="w-5 h-5 text-indigo-500" />;
      default: return <Layout className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Cloud K8s Fleet</h1>
          <p className="text-gray-500">Unified command for managed Kubernetes clusters (EKS, AKS, GKE, DOKS).</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
           <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Scanning Cluster Boundaries...</p>
        </div>
      ) : clusters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="glass-panel group hover:border-indigo-300 transition-all duration-300 overflow-hidden relative">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                       {getProviderIcon(cluster.provider)}
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(cluster.status)}`}>
                       {cluster.status}
                    </div>
                 </div>

                 <h3 className="text-lg font-bold text-gray-800 mb-1">{cluster.name}</h3>
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-widest leading-none mb-6">
                   {cluster.account_name} • {cluster.region}
                 </p>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                       <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">K8s Version</p>
                       <p className="text-sm font-bold text-gray-700">v{cluster.version}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                       <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Active Nodes</p>
                       <p className="text-sm font-bold text-gray-700">{cluster.node_count} Worker Nodes</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                    <button className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
                       Mission Console
                    </button>
                    <a 
                      href={cluster.endpoint} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    >
                       <ExternalLink className="w-4 h-4" />
                    </a>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-20 text-center">
           <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-gray-800">No Clusters Detected</h3>
           <p className="text-gray-500 max-w-sm mx-auto mt-2">
             Managed Kubernetes clusters (EKS, AKS, GKE) in your linked cloud accounts will appear here automatically.
           </p>
        </div>
      )}
    </div>
  );
};

export default Kubernetes;
