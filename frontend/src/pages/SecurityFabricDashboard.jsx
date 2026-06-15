import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Shield, Activity, Target, Zap, Server, Network } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const SecurityFabricDashboard = () => {
    const [graphData, setGraphData] = useState(null);
    const [threatIntel, setThreatIntel] = useState([]);
    const [riskEntities, setRiskEntities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFabricData = async () => {
            try {
                const [graph, intel, risk] = await Promise.all([
                    apiCall(`${apiConfig.baseURL}/fabric/graph`),
                    apiCall(`${apiConfig.baseURL}/fabric/threat-intel`),
                    apiCall(`${apiConfig.baseURL}/fabric/risk-dashboard`)
                ]);
                setGraphData(graph);
                setThreatIntel(intel);
                setRiskEntities(risk);
            } catch (error) {
                console.error("Failed to load Security Fabric data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFabricData();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Security Fabric...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight">
                    <Shield className="mr-3 text-indigo-500" size={32} />
                    Central Security Fabric
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Unified Risk Scoring and Threat Intelligence.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Risk Engine Rankings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 col-span-2">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                            <Activity className="mr-2 text-rose-500" size={18} />
                            Highest Risk Entities
                        </h2>
                    </div>
                    <div className="p-4 divide-y dark:divide-slate-700">
                        {riskEntities.map((entity, idx) => (
                            <div key={idx} className="py-4 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{entity.entity_id}</h3>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded">{entity.entity_type}</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Signals: {entity.factors.join(', ')}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{entity.score}</div>
                                    <div className="text-xs text-rose-500 font-bold uppercase tracking-wider">{entity.level}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Threat Intel Feed */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                            <Target className="mr-2 text-amber-500" size={18} />
                            Active Threat Intel
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {threatIntel.map((intel, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{intel.indicator}</span>
                                    <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded font-bold">{intel.severity}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{intel.description}</p>
                                <div className="text-xs text-slate-500 font-medium">Source: {intel.source}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Topology Graph Placeholder */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                        <Network className="mr-2 text-indigo-500" size={18} />
                        Security Topology Graph
                    </h2>
                </div>
                <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/30 rounded-b-xl border-dashed border-2 border-slate-200 dark:border-slate-700 m-4 flex flex-col items-center">
                    <Server size={48} className="text-slate-400 mb-4" />
                    <p className="font-medium text-lg text-slate-600 dark:text-slate-300">Topology Map Active</p>
                    <p className="text-sm mt-2 max-w-md">The Fabric Controller is mapping {graphData?.nodes?.length} interconnected nodes across IAM, Resources, and Incidents.</p>
                </div>
            </div>
        </div>
    );
};

export default SecurityFabricDashboard;
