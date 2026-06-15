import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { BrainCircuit, AlertOctagon, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const AIOpsCenter = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(null);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`${apiConfig.baseURL}/aiops/incidents`);
            setIncidents(data);
        } catch (error) {
            console.error('Failed to fetch AIOps incidents', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const handleAnalyze = async (id) => {
        setAnalyzing(id);
        try {
            const result = await apiCall(`${apiConfig.baseURL}/aiops/incidents/${id}/analyze`, { method: 'POST' });
            // Simulate updating the incident with new AI insights
            setIncidents(prev => prev.map(inc => 
                inc.id === id ? { ...inc, ai_analysis: result.new_insights } : inc
            ));
        } catch (error) {
            console.error('Failed to trigger AI analysis', error);
        } finally {
            setAnalyzing(null);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <BrainCircuit className="mr-3 text-indigo-500" />
                AI Operations Center
            </h1>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
                <h2 className="text-xl font-bold flex items-center mb-2">
                    <Sparkles className="mr-2" /> LLM-Powered Incident Resolution
                </h2>
                <p className="text-indigo-100 max-w-3xl">
                    UniCloudOps now leverages Generative AI to automatically aggregate telemetry, logs, and configuration state to provide instant root-cause analysis and remediation steps for complex outages.
                </p>
            </div>

            <div className="space-y-4">
                {incidents.map(inc => (
                    <div key={inc.id} className="bg-white dark:bg-slate-800 rounded-lg shadow border-l-4 border-indigo-500 overflow-hidden">
                        <div className="p-5 border-b dark:border-slate-700 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{inc.title}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded uppercase font-bold
                                        ${inc.severity === 'critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' : 
                                          inc.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 
                                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
                                    `}>
                                        {inc.severity}
                                    </span>
                                    <span className={`flex items-center text-xs font-bold uppercase
                                        ${inc.status === 'resolved' ? 'text-emerald-500' : 'text-slate-500'}
                                    `}>
                                        {inc.status === 'resolved' ? <CheckCircle2 size={14} className="mr-1" /> : <AlertOctagon size={14} className="mr-1" />}
                                        {inc.status}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Detected: {new Date(inc.created_at).toLocaleString()}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleAnalyze(inc.id)}
                                disabled={analyzing === inc.id}
                                className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 flex items-center font-medium transition-colors disabled:opacity-50"
                            >
                                {analyzing === inc.id ? (
                                    <><RefreshCw size={16} className="mr-2 animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Sparkles size={16} className="mr-2" /> Request Deep Analysis</>
                                )}
                            </button>
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                                <BrainCircuit size={16} className="mr-2 text-indigo-500" /> AI Root Cause & Remediation
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                                {inc.ai_analysis || "No analysis available yet. Request a deep analysis."}
                            </p>
                        </div>
                    </div>
                ))}
                {incidents.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Zero Active Incidents</h3>
                        <p className="text-slate-500">Your cloud infrastructure is running smoothly.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIOpsCenter;
