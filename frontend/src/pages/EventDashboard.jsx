import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Activity, Radio, AlertTriangle, RefreshCw, Send } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const EventDashboard = () => {
    const [events, setEvents] = useState([]);
    const [dlq, setDlq] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const eventsData = await apiCall(`${apiConfig.baseURL}/events/fabric/logs`);
            const dlqData = await apiCall(`${apiConfig.baseURL}/events/fabric/dlq`);
            setEvents(eventsData);
            setDlq(dlqData);
        } catch (error) {
            console.error('Failed to fetch Event Fabric data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll for live events
        return () => clearInterval(interval);
    }, []);

    const handleRequeue = async (id) => {
        try {
            await apiCall(`${apiConfig.baseURL}/events/fabric/dlq/${id}/requeue`, { method: 'POST' });
            fetchData();
        } catch (error) {
            console.error('Failed to requeue event', error);
        }
    };

    const handleTestPublish = async () => {
        try {
            await apiCall(`${apiConfig.baseURL}/events/fabric/publish/test`, { method: 'POST' });
            setTimeout(fetchData, 1000);
        } catch (error) {
            console.error('Failed to publish test event', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center text-slate-800 dark:text-slate-100">
                    <Activity className="mr-3 text-indigo-500" />
                    Event Fabric Console
                </h1>
                <button 
                    onClick={handleTestPublish}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center shadow-sm"
                >
                    <Send size={18} className="mr-2" /> Emit Test Event
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* DLQ Section */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow border-l-4 border-rose-500">
                    <div className="p-4 border-b dark:border-slate-700 flex items-center bg-rose-50 dark:bg-rose-900/20">
                        <AlertTriangle className="text-rose-500 mr-2" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Dead Letter Queue (DLQ)</h2>
                        <span className="ml-auto bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full font-bold">{dlq.length}</span>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                        {dlq.length === 0 ? (
                            <div className="text-slate-500 text-sm text-center py-4">No stalled events.</div>
                        ) : (
                            dlq.map(q => (
                                <div key={q.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs font-mono text-slate-500 mb-1">{q.event_id}</div>
                                    <div className="font-semibold text-sm mb-1">{q.original_subject}</div>
                                    <div className="text-xs text-rose-500 mb-2">Failed Consumer: {q.failed_consumer}</div>
                                    <button 
                                        onClick={() => handleRequeue(q.id)}
                                        className="text-xs flex items-center bg-white dark:bg-slate-800 border px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <RefreshCw size={12} className="mr-1" /> Requeue
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Event Stream Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow">
                    <div className="p-4 border-b dark:border-slate-700 flex items-center">
                        <Radio className="text-emerald-500 mr-2 animate-pulse" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Live Global Event Stream</h2>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Timestamp</th>
                                    <th className="px-4 py-3">Source</th>
                                    <th className="px-4 py-3">Subject / Type</th>
                                    <th className="px-4 py-3">Payload Preview</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            {new Date(ev.time).toLocaleTimeString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs px-2 py-0.5 rounded font-medium">
                                                {ev.source}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{ev.subject}</div>
                                            <div className="text-xs text-slate-500 font-mono">{ev.type}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs truncate max-w-xs">
                                            {JSON.stringify(ev.data)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDashboard;
