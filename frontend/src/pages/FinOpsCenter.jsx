import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { DollarSign, TrendingDown, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const FinOpsCenter = () => {
    const [costs, setCosts] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const costData = await apiCall(`${apiConfig.baseURL}/finops/analytics/costs`);
            setCosts(costData);

            const budgetData = await apiCall(`${apiConfig.baseURL}/finops/analytics/budgets`);
            setBudgets(budgetData);

            const recData = await apiCall(`${apiConfig.baseURL}/finops/analytics/recommendations`);
            setRecommendations(recData);
        } catch (error) {
            console.error('Failed to fetch FinOps data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <DollarSign className="mr-3 text-emerald-500" />
                FinOps Center
            </h1>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading FinOps analytics...</div>
            ) : (
                <div className="space-y-6">
                    {/* Top Level KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-emerald-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Monthly Spend</h3>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                ${costs?.total_spend?.toLocaleString() || '0.00'}
                            </div>
                            <div className="mt-2 text-sm text-emerald-600 flex items-center">
                                <TrendingDown size={14} className="mr-1" /> 12% less than last month
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Forecasted Spend</h3>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                ${costs?.forecast?.toLocaleString() || '0.00'}
                            </div>
                            <div className="mt-2 text-sm text-slate-500">
                                Based on current trajectory
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Potential Savings</h3>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                ${recommendations.reduce((sum, r) => sum + r.estimated_monthly_savings, 0).toLocaleString()}
                            </div>
                            <div className="mt-2 text-sm text-purple-600">
                                From {recommendations.length} recommendations
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Budgets */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                                <BarChart3 className="mr-2" size={20} /> Active Budgets
                            </h2>
                            <div className="space-y-4">
                                {budgets.map(budget => {
                                    const percentUsed = (budget.current_spend / budget.amount_limit) * 100;
                                    const isWarning = percentUsed >= budget.alert_threshold_percentage;
                                    
                                    return (
                                        <div key={budget.id} className="border dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/30">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{budget.name}</h3>
                                                <span className={`text-sm font-bold ${isWarning ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    ${budget.current_spend.toLocaleString()} / ${budget.amount_limit.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                                                <div className={`h-2.5 rounded-full ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
                                            </div>
                                            {isWarning && (
                                                <div className="mt-2 text-xs text-rose-500 flex items-center">
                                                    <AlertTriangle size={12} className="mr-1" /> Over alert threshold of {budget.alert_threshold_percentage}%
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rightsizing & Idle Recommendations */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                                <Lightbulb className="mr-2 text-amber-500" size={20} /> Optimization Opportunities
                            </h2>
                            <div className="space-y-3">
                                {recommendations.map(rec => (
                                    <div key={rec.resource_id} className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-500 p-4 rounded-r-md">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                                                {rec.resource_name} <span className="font-normal text-amber-700 dark:text-amber-500">({rec.provider})</span>
                                            </h3>
                                            <span className="text-emerald-600 font-bold text-sm">
                                                Save ${rec.estimated_monthly_savings}/mo
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">{rec.type}</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {rec.recommendation}
                                        </p>
                                        <button className="mt-3 text-xs bg-amber-200 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200 px-3 py-1 rounded font-semibold hover:bg-amber-300 transition-colors">
                                            Apply Fix
                                        </button>
                                    </div>
                                ))}
                                {recommendations.length === 0 && (
                                    <p className="text-slate-500 text-center py-4">Your infrastructure is fully optimized.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinOpsCenter;
