import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { ShieldAlert, CheckCircle2, Lock, Key, Activity } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const EventSecurityDashboard = () => {
    const [threats, setThreats] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [testCrypto, setTestCrypto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [threatsData, logsData] = await Promise.all([
                    apiCall(`${apiConfig.baseURL}/event-security/threats`),
                    apiCall(`${apiConfig.baseURL}/event-security/audit-logs`)
                ]);
                setThreats(threatsData);
                setAuditLogs(logsData);
            } catch (error) {
                console.error("Failed to load Event Security data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const runCryptoTest = async () => {
        try {
            const result = await apiCall(`${apiConfig.baseURL}/event-security/test-crypto`, { method: 'POST' });
            setTestCrypto(result);
        } catch (error) {
            console.error("Crypto test failed", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Event Fabric Security...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight">
                        <Lock className="mr-3 text-indigo-500" size={32} />
                        Event Fabric Security
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Zero-Trust AES-256-GCM Payload Encryption & HMAC Signatures</p>
                </div>
                <button 
                    onClick={runCryptoTest}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center"
                >
                    <Key size={16} className="mr-2"/>
                    Test Live Encryption
                </button>
            </div>

            {testCrypto && (
                <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-700 shadow-inner">
                    <div className="flex items-center mb-2 text-white font-bold text-sm">
                        <CheckCircle2 size={16} className="text-green-500 mr-2"/>
                        Crypto Engine Test Passed
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-slate-400">1. Raw Payload:</span>
                            <pre>{JSON.stringify(testCrypto.original_payload, null, 2)}</pre>
                        </div>
                        <div>
                            <span className="text-slate-400">2. Encrypted Envelope (To NATS):</span>
                            <pre className="text-amber-300">{JSON.stringify(testCrypto.secured_envelope, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Threats */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-rose-200 dark:border-rose-900/50">
                    <div className="p-4 border-b border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20">
                        <h2 className="font-bold text-rose-800 dark:text-rose-400 flex items-center">
                            <ShieldAlert className="mr-2" size={18} />
                            Intercepted Fabric Threats
                        </h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {threats.map((threat, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded border border-rose-100 dark:border-rose-800/30 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{threat.threat_type}</span>
                                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">{threat.severity}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 font-mono">UUID: {threat.event_uuid}</div>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">{new Date(threat.detected_at).toLocaleTimeString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                            <Activity className="mr-2 text-indigo-500" size={18} />
                            Cryptographic Audit Log
                        </h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {auditLogs.map((log, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                        {log.source_system} <span className="text-slate-400 mx-1">→</span> {log.destination_subject}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-3">
                                        <span>Sig Valid: <span className="text-green-500 font-bold">{log.signature_valid ? "YES" : "NO"}</span></span>
                                        <span>Replay: <span className="text-green-500 font-bold">{log.is_replayed ? "YES" : "NO"}</span></span>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventSecurityDashboard;
