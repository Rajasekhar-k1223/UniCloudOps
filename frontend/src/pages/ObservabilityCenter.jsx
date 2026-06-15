import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Activity, Bell, ListTree, HeartPulse, CheckCircle2, AlertTriangle } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const ObservabilityCenter = () => {
    const [summary, setSummary] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [traces, setTraces] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const sumData = await apiCall(`${apiConfig.baseURL}/observability/metrics/summary`);
            setSummary(sumData);

            const altData = await apiCall(`${apiConfig.baseURL}/observability/alerts`);
            setAlerts(altData);

            const trcData = await apiCall(`${apiConfig.baseURL}/observability/traces/recent`);
            setTraces(trcData);
        } catch (error) {
            console.error('Failed to fetch observability data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Setup polling for real-time feel
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <Activity className="mr-3 text-cyan-500" />
                Observability Center
            </h1>

            {loading && !summary ? (
                <div className="text-center py-10 text-slate-500">Loading telemetry data...</div>
            ) : (
                <div className="space-y-6">
                    {/* Top Level Telemetry */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Global Uptime</h3>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                                <HeartPulse size={20} className="mr-2" />
                                {summary?.global_uptime || 'N/A'}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Avg Latency (24h)</h3>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {summary?.average_latency_ms || 0} ms
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Requests (24h)</h3>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {summary?.total_requests_24h?.toLocaleString() || 0}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5 border-b-4 border-rose-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Alerts</h3>
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 flex items-center">
                                <AlertTriangle size={20} className="mr-2" />
                                {summary?.active_alerts || 0}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Alerts configuration */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                                    <Bell className="mr-2" size={18} /> Metric Threshold Alerts
                                </h2>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase">
                                        <tr>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Resource</th>
                                            <th className="p-3">Rule</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {alerts.map(alert => (
                                            <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-3">
                                                    {alert.is_triggered ? (
                                                        <span className="flex items-center text-rose-500 font-semibold text-sm">
                                                            <AlertTriangle size={16} className="mr-1" /> Firing
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center text-emerald-500 font-semibold text-sm">
                                                            <CheckCircle2 size={16} className="mr-1" /> OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                                                    {alert.resource_id}
                                                </td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                    {alert.metric_name} {alert.comparison_operator} {alert.threshold_value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Traces */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                                    <ListTree className="mr-2" size={18} /> Recent Distributed Traces
                                </h2>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase">
                                        <tr>
                                            <th className="p-3">Trace ID</th>
                                            <th className="p-3">Service</th>
                                            <th className="p-3">Duration</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {traces.map((trace, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-3 text-sm font-mono text-cyan-600 dark:text-cyan-400">
                                                    {trace.trace_id}
                                                </td>
                                                <td className="p-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                                                    {trace.service}
                                                </td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                                                    {trace.duration_ms} ms
                                                </td>
                                                <td className="p-3 text-sm">
                                                    {trace.status === 'ok' ? (
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-bold uppercase">
                                                            OK
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded text-xs font-bold uppercase">
                                                            ERROR
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObservabilityCenter;
