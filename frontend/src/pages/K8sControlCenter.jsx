import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Server, Activity, Plus, Cloud, Box, Cpu } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const K8sControlCenter = () => {
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState({});
    
    // Form state
    const [newClusterName, setNewClusterName] = useState('');
    const [newClusterProvider, setNewClusterProvider] = useState('eks');
    const [newClusterEndpoint, setNewClusterEndpoint] = useState('');
    
    const fetchClusters = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`${apiConfig.baseURL}/kubernetes/control/clusters`);
            setClusters(data);
            
            // Fetch health for each cluster
            data.forEach(c => fetchClusterHealth(c.id));
        } catch (error) {
            console.error('Failed to fetch clusters', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClusterHealth = async (id) => {
        try {
            const data = await apiCall(`${apiConfig.baseURL}/kubernetes/control/clusters/${id}/health`);
            setHealthData(prev => ({ ...prev, [id]: data }));
        } catch (error) {
            console.error(`Failed to fetch health for cluster ${id}`, error);
        }
    };

    useEffect(() => {
        fetchClusters();
    }, []);

    const handleRegisterCluster = async (e) => {
        e.preventDefault();
        if (!newClusterName || !newClusterEndpoint) return;
        try {
            await apiCall(`${apiConfig.baseURL}/kubernetes/control/clusters?name=${encodeURIComponent(newClusterName)}&provider=${newClusterProvider}&endpoint=${encodeURIComponent(newClusterEndpoint)}`, { method: 'POST' });
            setNewClusterName('');
            setNewClusterEndpoint('');
            fetchClusters();
        } catch (error) {
            console.error('Failed to register cluster', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <Server className="mr-3 text-blue-500" />
                Kubernetes Control Center
            </h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {clusters.map(cluster => {
                        const health = healthData[cluster.id];
                        return (
                            <div key={cluster.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <Cloud className={`mr-3 ${cluster.provider === 'eks' ? 'text-orange-500' : cluster.provider === 'gke' ? 'text-blue-500' : 'text-blue-400'}`} size={24} />
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{cluster.name}</h2>
                                            <div className="text-sm text-slate-500 flex items-center mt-1">
                                                <span className="uppercase font-semibold mr-2">{cluster.provider}</span>
                                                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{cluster.endpoint}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center">
                                        <Activity size={14} className="mr-1" /> Active
                                    </span>
                                </div>
                                
                                {health ? (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border dark:border-slate-700 rounded p-4 bg-slate-50 dark:bg-slate-700/30">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                                                <Box size={16} className="mr-2" /> Namespaces
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {health.namespaces.map(ns => (
                                                    <span key={ns} className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-1 rounded">
                                                        {ns}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border dark:border-slate-700 rounded p-4 bg-slate-50 dark:bg-slate-700/30">
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                                                <Cpu size={16} className="mr-2" /> Nodes ({health.nodes.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {health.nodes.map(node => (
                                                    <div key={node.name} className="flex justify-between items-center text-xs">
                                                        <span className="font-mono text-slate-600 dark:text-slate-400">{node.name}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-emerald-600 dark:text-emerald-400">{node.status}</span>
                                                            <span className="text-slate-500 w-10 text-right">{node.cpu_usage}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 text-center py-6 text-slate-500 animate-pulse">
                                        Gathering telemetry...
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {clusters.length === 0 && !loading && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center text-slate-500">
                            No clusters registered yet.
                        </div>
                    )}
                </div>

                <div className="xl:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow p-6 h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                        <Plus className="mr-2" size={20} /> Register Cluster
                    </h2>
                    
                    <form onSubmit={handleRegisterCluster} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cluster Name</label>
                            <input 
                                type="text"
                                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={newClusterName}
                                onChange={(e) => setNewClusterName(e.target.value)}
                                placeholder="e.g. prod-eks-us-east"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provider</label>
                            <select 
                                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white uppercase"
                                value={newClusterProvider}
                                onChange={(e) => setNewClusterProvider(e.target.value)}
                            >
                                <option value="eks">AWS EKS</option>
                                <option value="aks">Azure AKS</option>
                                <option value="gke">Google GKE</option>
                                <option value="onprem">On-Premises</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Endpoint</label>
                            <input 
                                type="url"
                                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono text-sm"
                                value={newClusterEndpoint}
                                onChange={(e) => setNewClusterEndpoint(e.target.value)}
                                placeholder="https://..."
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center font-medium transition-colors">
                            <Plus className="mr-2" size={18} /> Add to Fleet
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default K8sControlCenter;
