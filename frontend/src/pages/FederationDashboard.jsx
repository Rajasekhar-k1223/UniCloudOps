import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Network, Activity, ShieldAlert, ArrowRightLeft, Database } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const FederationDashboard = () => {
    const [status, setStatus] = useState(null);
    const [intel, setIntel] = useState([]);
    const [audit, setAudit] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFederationData = async () => {
            try {
                const [statusData, intelData, auditData] = await Promise.all([
                    apiCall(`${apiConfig.baseURL}/federation/status`),
                    apiCall(`${apiConfig.baseURL}/federation/threat-intel`),
                    apiCall(`${apiConfig.baseURL}/federation/audit`)
                ]);
                setStatus(statusData);
                setIntel(intelData);
                setAudit(auditData);
            } catch (error) {
                console.error("Failed to load Federation data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFederationData();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Syncing with SentinelX Brain...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight">
                        <Network className="mr-3 text-indigo-500" size={32} />
                        SentinelX Federation
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Global Threat Sync • Cross-Platform Identity • Unified Risk Engine</p>
                </div>
                {status && (
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg font-bold border border-emerald-200 dark:border-emerald-800/50">
                        <Activity className="animate-pulse" size={18} />
                        FEDERATION {status.status}
                    </div>
                )}
            </div>

            {/* Metrics Overview */}
            {status && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <span className="text-slate-500 text-sm font-bold">Shared Identities (OIDC)</span>
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{status.shared_identities}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm flex flex-col">
                        <span className="text-rose-600 dark:text-rose-400 text-sm font-bold">Active Threat IOCs</span>
                        <span className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{status.active_threat_intel_iocs}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <span className="text-slate-500 text-sm font-bold">Pending Quarantines</span>
                        <span className="text-3xl font-black text-amber-600 dark:text-amber-500 mt-1">{status.pending_quarantines}</span>
                    </div>
                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm flex flex-col">
                        <span className="text-slate-400 text-sm font-bold">Last Sync Ping</span>
                        <span className="text-xl font-mono mt-auto">{new Date(status.last_ping).toLocaleTimeString()}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SentinelX Threat Intel */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                            <ShieldAlert className="mr-2 text-rose-500" size={18} />
                            SentinelX Global Threat Intel
                        </h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {intel.map((ioc, idx) => (
                            <div key={idx} className="p-3 rounded-lg border bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{ioc.ioc_value}</div>
                                    <div className="text-xs text-slate-500 mt-1 font-mono">TYPE: {ioc.ioc_type}</div>
                                </div>
                                <div className="text-right">
                                    <span className="bg-rose-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">{ioc.severity}</span>
                                    <div className="text-xs text-slate-400 mt-2 font-mono">{ioc.sentinelx_verdict_id}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cross-Platform Audit */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                            <ArrowRightLeft className="mr-2 text-indigo-500" size={18} />
                            Cross-Platform Audit Trail
                        </h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {audit.map((log, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs font-bold text-slate-500 flex items-center">
                                        {log.origin_platform} <ArrowRightLeft size={12} className="mx-2"/> {log.target_platform}
                                    </div>
                                    <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-100 rounded">{log.status}</span>
                                </div>
                                <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{log.action_type}</div>
                                <div className="text-xs font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {JSON.stringify(log.payload)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FederationDashboard;
