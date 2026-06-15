import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { ShieldCheck, Package, AlertTriangle, FileJson, BadgeCheck } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const SupplyChainDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const [sboms, setSboms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSupplyChainData = async () => {
            try {
                const [metricsData, vulnData, sbomData] = await Promise.all([
                    apiCall(`${apiConfig.baseURL}/supply-chain/metrics`),
                    apiCall(`${apiConfig.baseURL}/supply-chain/vulnerabilities`),
                    apiCall(`${apiConfig.baseURL}/supply-chain/sboms`)
                ]);
                setMetrics(metricsData);
                setVulnerabilities(vulnData);
                setSboms(sbomData);
            } catch (error) {
                console.error("Failed to load Supply Chain data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSupplyChainData();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Scanning Supply Chain Posture...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight">
                    <ShieldCheck className="mr-3 text-emerald-500" size={32} />
                    Supply Chain Security
                </h1>
                <p className="text-slate-500 mt-1 font-medium">SLSA Level 3 • Cosign Image Signing • SBOM Vulnerability Tracking</p>
            </div>

            {/* Metrics Overview */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <span className="text-slate-500 text-sm font-bold flex items-center mb-2"><Package className="mr-1" size={16}/> Total Assets</span>
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{metrics.total_assets}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <span className="text-slate-500 text-sm font-bold flex items-center mb-2"><BadgeCheck className="mr-1 text-emerald-500" size={16}/> Cosign Verified</span>
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{metrics.cosign_verified}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-rose-200 dark:border-rose-900 shadow-sm flex flex-col">
                        <span className="text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center mb-2"><AlertTriangle className="mr-1" size={16}/> Critical CVEs</span>
                        <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{metrics.critical_cves_active}</span>
                    </div>
                    <div className="bg-indigo-600 dark:bg-indigo-700 p-4 rounded-xl shadow-sm flex flex-col text-white">
                        <span className="text-indigo-100 text-sm font-bold mb-2">Platform SLSA Rating</span>
                        <span className="text-3xl font-black tracking-tight">{metrics.slsa_level}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quarantined Assets / Vulnerabilities */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                            <AlertTriangle className="mr-2 text-rose-500" size={18} />
                            Failing Grype Scans (Quarantined)
                        </h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {vulnerabilities.map((vuln, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border ${vuln.is_quarantined ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700'} flex flex-col`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-slate-800 dark:text-slate-200">{vuln.asset_name}</div>
                                    {vuln.is_quarantined && <span className="bg-rose-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Quarantined</span>}
                                </div>
                                <div className="text-xs text-slate-500 font-mono mb-3">ID: {vuln.asset_id} | v{vuln.version}</div>
                                <div className="flex gap-4 mt-auto">
                                    <div className="text-sm"><span className="font-bold text-rose-600">{vuln.critical_count}</span> Critical</div>
                                    <div className="text-sm"><span className="font-bold text-amber-500">{vuln.high_count}</span> High</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SBOM Ingestion Log */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                            <FileJson className="mr-2 text-indigo-500" size={18} />
                            Recent SBOM Manifests
                        </h2>
                    </div>
                    <div className="p-4 divide-y dark:divide-slate-700">
                        {sboms.map((sbom, idx) => (
                            <div key={idx} className="py-3 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sbom.asset_name}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-1">{sbom.asset_id}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-bold mb-1 inline-block">{sbom.format}</div>
                                    <div>
                                        {sbom.cosign_verified ? (
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end"><BadgeCheck size={12} className="mr-1"/> Sigstore Verified</span>
                                        ) : (
                                            <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold">Unsigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplyChainDashboard;
