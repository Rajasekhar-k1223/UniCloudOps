import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { ShieldAlert, Crosshair, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const SOCDashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const data = await apiCall(`${apiConfig.baseURL}/security/soc/incidents`);
                setIncidents(data);
            } catch (error) {
                console.error("Failed to load SOC incidents", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const getSeverityColor = (sev) => {
        switch (sev) {
            case 'CRITICAL': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            case 'MEDIUM': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight">
                        <Crosshair className="mr-3 text-rose-600" size={32} />
                        Security Operations Center
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Real-time threat detection, correlation, and response.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg flex items-center border dark:border-slate-700">
                        <AlertTriangle className="text-rose-500 mr-2" size={18} />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{incidents.filter(i => i.severity === 'CRITICAL').length} Critical</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                        <ShieldAlert className="mr-2 text-slate-400" size={18} />
                        Active Attack Timeline
                    </h2>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Scanning for threats...</div>
                ) : (
                    <div className="divide-y dark:divide-slate-700">
                        {incidents.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <CheckCircle className="text-emerald-500 mb-4" size={48} />
                                <p className="text-slate-500 font-medium">No active threats detected. Network is secure.</p>
                            </div>
                        ) : (
                            incidents.map((incident) => (
                                <div key={incident.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-0.5 rounded text-xs font-black border ${getSeverityColor(incident.severity)}`}>
                                                {incident.severity}
                                            </span>
                                            <span className="text-slate-500 text-sm font-mono">{incident.id}</span>
                                        </div>
                                        <div className="flex items-center text-slate-400 text-sm">
                                            <Clock size={14} className="mr-1" /> Just now
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{incident.title}</h3>
                                    
                                    <div className="flex items-center text-sm mb-4 gap-4">
                                        <span className="text-rose-600 dark:text-rose-400 font-medium">Tactic: {incident.mitre_tactic}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-500 dark:text-slate-400">Detected by: {incident.source_layer}</span>
                                    </div>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border dark:border-slate-700 font-mono text-xs text-slate-600 dark:text-slate-300 break-all">
                                        {JSON.stringify(incident.details, null, 2)}
                                    </div>
                                    
                                    <div className="mt-4 flex gap-3">
                                        <button className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors">
                                            Investigate with AI
                                        </button>
                                        <button className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded font-medium text-sm transition-colors">
                                            Isolate Resource
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SOCDashboard;
