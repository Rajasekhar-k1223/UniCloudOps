import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Users, Building, Settings, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const MSPDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMSPData = async () => {
            try {
                const data = await apiCall(`${apiConfig.baseURL}/saas/msp/dashboard`);
                setDashboardData(data);
            } catch (err) {
                console.error("Failed to load MSP portal", err);
                // Handle 402 Licensing Error gracefully
                if (err.message?.includes("402") || err.message?.includes("MSP Edition")) {
                    setError("This feature requires an active MSP Edition License.");
                } else {
                    setError("Failed to load downstream tenants.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMSPData();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading MSP Dashboard...</div>;

    if (error) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900 rounded-xl p-8 text-center">
                    <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                    <h2 className="text-2xl font-bold text-rose-700 dark:text-rose-400 mb-2">License Restriction</h2>
                    <p className="text-rose-600 dark:text-rose-300 mb-6">{error}</p>
                    <button className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-700">
                        Upgrade to MSP Edition
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <Building className="mr-3 text-indigo-500" />
                    Customer Success Dashboard
                </h1>
                <p className="text-slate-500 mt-1">Manage downstream tenants, white-label configs, and aggregated MRR.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-3 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Managed Tenants</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">{dashboardData?.managed_tenants?.length || 0}</h3>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 p-3 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Aggregated MRR</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">${dashboardData?.total_mrr || 0}</h3>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Settings size={32} className="text-slate-400 mb-2" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Global White-Label Settings</span>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Downstream Clients</h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                            <th className="p-4 text-sm font-semibold text-slate-500">Tenant Name</th>
                            <th className="p-4 text-sm font-semibold text-slate-500">Tier</th>
                            <th className="p-4 text-sm font-semibold text-slate-500">Monthly Revenue</th>
                            <th className="p-4 text-sm font-semibold text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData?.managed_tenants?.map(tenant => (
                            <tr key={tenant.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750">
                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{tenant.name}</td>
                                <td className="p-4">
                                    <span className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-semibold">
                                        {tenant.tier}
                                    </span>
                                </td>
                                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">${tenant.monthly_mrr}</td>
                                <td className="p-4">
                                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium text-sm">View Analytics</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MSPDashboard;
