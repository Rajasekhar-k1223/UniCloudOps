import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { CreditCard, Activity, Package, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const CustomerPortal = () => {
    const [context, setContext] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaaSData = async () => {
            try {
                const [ctxData, usageData] = await Promise.all([
                    apiCall(`${apiConfig.baseURL}/saas/tenant/context`),
                    apiCall(`${apiConfig.baseURL}/saas/billing/usage`)
                ]);
                setContext(ctxData);
                setUsage(usageData);
                
                // Dynamic White-Label Injection MVP
                if (ctxData.white_label?.primary_color) {
                    document.documentElement.style.setProperty('--color-primary', ctxData.white_label.primary_color);
                }
            } catch (error) {
                console.error("Failed to load SaaS portal", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSaaSData();
    }, []);

    const handleUpgrade = async (targetTier) => {
        try {
            const res = await apiCall(`${apiConfig.baseURL}/saas/billing/upgrade`, {
                method: 'POST',
                body: JSON.stringify({ target_tier: targetTier })
            });
            if (res.checkout_url) {
                // In production, redirect to Stripe/Chargebee
                alert(`Redirecting to payment gateway: ${res.checkout_url}`);
            }
        } catch (error) {
            console.error("Checkout failed", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Billing Portal...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <CreditCard className="mr-3" style={{ color: 'var(--color-primary, #10b981)' }} />
                    Billing & Subscription
                </h1>
                <p className="text-slate-500 mt-1">Manage your plan, payment methods, and monitor usage limits.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Current Plan Widget */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Plan</p>
                            <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100">{context?.tier} Edition</h2>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                            <CheckCircle2 size={16} className="mr-1" /> Active
                        </span>
                    </div>
                    
                    <div className="flex gap-4">
                        {context?.tier === "Community" && (
                            <button onClick={() => handleUpgrade("Professional")} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center">
                                Upgrade to Professional <ArrowUpRight size={18} className="ml-2" />
                            </button>
                        )}
                        <button className="text-slate-600 dark:text-slate-300 font-medium px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            Manage Payment Method
                        </button>
                    </div>
                </div>

                {/* Metered Usage Overview */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                        <Activity size={16} className="mr-2" /> Current Billing Cycle
                    </p>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-400">Managed VMs</span>
                                <span className="font-bold">{usage?.managed_vms}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-400">AI Tokens Consumed</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{(usage?.ai_tokens_consumed / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t dark:border-slate-700 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-500">Est. Invoice Amount</span>
                                <span className="text-xl font-black text-slate-800 dark:text-slate-100">{usage?.estimated_invoice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CustomerPortal;
