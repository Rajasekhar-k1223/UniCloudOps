import React, { useState, useEffect } from 'react';
import { Box, Layers, Cpu, Database, Activity, Terminal, ExternalLink, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const K8sFleet = () => {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [pods, setPods] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await api.get('/resources');
        const k8sClusters = res.data.filter(r => r.type === 'Cluster');
        setClusters(k8sClusters);
        if (k8sClusters.length > 0) setSelectedCluster(k8sClusters[0]);
      } catch (err) {
        console.error("Failed to fetch fleet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, []);

  useEffect(() => {
    if (selectedCluster) {
      fetchClusterDetails(selectedCluster.id);
    }
  }, [selectedCluster]);

  const fetchClusterDetails = async (id) => {
    setRefreshing(true);
    try {
      const [podsRes, nodesRes] = await Promise.all([
        api.get(`/k8s/pods/${id}`),
        api.get(`/k8s/nodes/${id}`)
      ]);
      setPods(podsRes.data.items || []);
      setNodes(nodesRes.data.items || []);
    } catch (err) {
      console.error("Telemetry link failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <RefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">K8s Fleet Command</h1>
          <p className="text-gray-500">Real-time observability and connectivity for your multi-cloud Kubernetes clusters.</p>
        </div>
        <button 
          onClick={() => selectedCluster && fetchClusterDetails(selectedCluster.id)}
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cluster Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Clusters</h3>
          {clusters.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
               <p className="text-xs text-gray-400">No clusters detected in orbit.</p>
            </div>
          ) : clusters.map(c => (
            <div 
              key={c.id}
              onClick={() => setSelectedCluster(c)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedCluster?.id === c.id 
                ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${selectedCluster?.id === c.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {c.provider.toUpperCase()} | {c.region}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet HUD */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedCluster ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-gray-200">
               <Box className="w-12 h-12 text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Select a cluster to engage telemetry</p>
            </div>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Cpu size={20} /></div>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Healthy</span>
                   </div>
                   <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Worker Nodes</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Activity size={20} /></div>
                   </div>
                   <p className="text-2xl font-bold text-gray-900">{pods.length}</p>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Active Pods</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Database size={20} /></div>
                   </div>
                   <p className="text-2xl font-bold text-gray-900">v1.30</p>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">K8s Version</p>
                </div>
              </div>

              {/* Connections Panel */}
              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Terminal size={120} /></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Terminal size={20} className="text-indigo-400" />
                    Tactical Connection Bridge
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Run this command on your local terminal to authorize kubectl access.</p>
                  
                  <div className="bg-black/40 rounded-2xl p-4 font-mono text-sm border border-white/10 flex items-center justify-between group">
                    <code className="text-indigo-300">
                      {selectedCluster.provider === 'aws' 
                        ? `aws eks update-kubeconfig --name ${selectedCluster.name} --region ${selectedCluster.region}`
                        : `az aks get-credentials --resource-group rg-${selectedCluster.name} --name ${selectedCluster.name}`
                      }
                    </code>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pods Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Real-time Pod Telemetry</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Stream</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Namespace</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pod Name</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Restart Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pods.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No pods reported in latest scan.</td>
                        </tr>
                      ) : pods.map(p => (
                        <tr key={p.metadata.uid} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">{p.metadata.namespace}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{p.metadata.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {p.status.phase === 'Running' ? <CheckCircle size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-amber-500" />}
                              <span className={`text-xs font-bold ${p.status.phase === 'Running' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {p.status.phase}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-500">{p.status.containerStatuses?.[0].restartCount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default K8sFleet;
