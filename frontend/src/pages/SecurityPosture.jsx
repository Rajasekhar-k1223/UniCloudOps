import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { ShieldCheck, ScanSearch, CheckCircle, XCircle } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const SecurityPosture = () => {
    const [benchmarks, setBenchmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);

    const fetchBenchmarks = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`${apiConfig.baseURL}/security/posture/benchmarks`);
            setBenchmarks(data);
        } catch (error) {
            console.error('Failed to fetch security benchmarks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBenchmarks();
    }, []);

    const handleScan = async () => {
        setScanning(true);
        try {
            await apiCall(`${apiConfig.baseURL}/security/posture/scan`, { method: 'POST' });
            // Simulate scan delay
            setTimeout(() => {
                fetchBenchmarks();
                setScanning(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to trigger scan', error);
            setScanning(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center text-slate-800 dark:text-slate-100">
                    <ShieldCheck className="mr-3 text-emerald-500" />
                    Cloud Security Posture Management (CSPM)
                </h1>
                
                <button 
                    onClick={handleScan}
                    disabled={scanning}
                    className="bg-slate-800 dark:bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 dark:hover:bg-emerald-700 flex items-center transition-colors disabled:opacity-70"
                >
                    <ScanSearch size={18} className={`mr-2 ${scanning ? 'animate-pulse text-emerald-300' : ''}`} /> 
                    {scanning ? 'Running Full Scan...' : 'Trigger Compliance Scan'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benchmarks.map(bm => {
                    // Calculate visual styling based on score
                    let scoreColor = 'text-emerald-500';
                    let bgBorder = 'border-emerald-500';
                    if (bm.score < 90) { scoreColor = 'text-amber-500'; bgBorder = 'border-amber-500'; }
                    if (bm.score < 75) { scoreColor = 'text-rose-500'; bgBorder = 'border-rose-500'; }

                    return (
                        <div key={bm.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg border-t-4 ${bgBorder} p-6 flex flex-col`}>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 h-14">{bm.framework}</h2>
                            
                            <div className="flex justify-center items-center mb-6">
                                <div className={`text-5xl font-black ${scoreColor}`}>
                                    {bm.score}%
                                </div>
                            </div>
                            
                            <div className="space-y-3 mt-auto">
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/30 p-3 rounded">
                                    <span className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                                        <CheckCircle size={18} className="mr-2 text-emerald-500" /> Passed Controls
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{bm.passed_controls}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/30 p-3 rounded">
                                    <span className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                                        <XCircle size={18} className="mr-2 text-rose-500" /> Failed Controls
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{bm.failed_controls}</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 text-xs text-center text-slate-500 dark:text-slate-400 border-t dark:border-slate-700 pt-4">
                                Last Scanned: {new Date(bm.last_scan_at).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {benchmarks.length === 0 && !loading && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
                    <ShieldCheck size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Benchmarks Active</h3>
                    <p className="text-slate-500">Trigger a compliance scan to evaluate your cloud resources.</p>
                </div>
            )}
        </div>
    );
};

export default SecurityPosture;
