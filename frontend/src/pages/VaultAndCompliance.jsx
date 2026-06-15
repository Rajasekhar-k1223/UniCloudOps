import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Lock, FileCheck, KeySquare, CloudCog, ShieldCheck } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const VaultAndCompliance = () => {
    const [secrets, setSecrets] = useState([]);
    const [findings, setFindings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSecurityData = async () => {
            try {
                const [vaultData, cspmData] = await Promise.all([
                    apiCall(`${apiConfig.baseURL}/security/vault/secrets`),
                    apiCall(`${apiConfig.baseURL}/security/cspm/findings`)
                ]);
                setSecrets(vaultData);
                setFindings(cspmData);
            } catch (error) {
                console.error("Failed to load Vault & CSPM data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSecurityData();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Vault Section */}
            <div>
                <div className="mb-6 flex items-center">
                    <div className="bg-amber-100 p-2 rounded-lg mr-3">
                        <Lock className="text-amber-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Enterprise Secrets Vault</h2>
                        <p className="text-slate-500 text-sm">Dynamic credentials managed by HashiCorp Vault.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700 text-slate-500 text-sm font-semibold">
                                <th className="p-4">Vault Path</th>
                                <th className="p-4">Engine</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Last Rotated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="p-4 text-center text-slate-500">Loading vault metadata...</td></tr>
                            ) : (
                                secrets.map((secret, idx) => (
                                    <tr key={idx} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center text-slate-800 dark:text-slate-200 font-mono text-sm">
                                                <KeySquare size={16} className="text-amber-500 mr-2" />
                                                {secret.path}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {secret.engine_type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{secret.description}</td>
                                        <td className="p-4 text-sm text-slate-500">{new Date(secret.last_rotated).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CSPM Section */}
            <div>
                <div className="mb-6 flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                        <CloudCog className="text-emerald-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cloud Security Posture (CSPM)</h2>
                        <p className="text-slate-500 text-sm">Continuous compliance monitoring across AWS, Azure, and GCP.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full p-8 text-center text-slate-500">Scanning cloud environments...</div>
                    ) : findings.length === 0 ? (
                        <div className="col-span-full p-12 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col items-center">
                            <ShieldCheck size={48} className="text-emerald-500 mb-4" />
                            <p className="font-bold text-emerald-800 dark:text-emerald-400">100% Compliant</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">No misconfigurations detected in your cloud accounts.</p>
                        </div>
                    ) : (
                        findings.map((finding, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-rose-200 dark:border-rose-900/50">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 rounded text-xs font-black">
                                        {finding.severity}
                                    </span>
                                    <span className="text-slate-400 hover:text-blue-500 cursor-pointer">
                                        <FileCheck size={18} />
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{finding.rule_id}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{finding.description}</p>
                                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border dark:border-slate-700">
                                    <p className="text-xs font-mono text-slate-500 break-all">{finding.resource_id}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VaultAndCompliance;
