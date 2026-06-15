import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Terminal, CheckCircle, XCircle, Clock, Play } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const TerraformEnterprise = () => {
    const [deployments, setDeployments] = useState([]);
    const [selectedDeployment, setSelectedDeployment] = useState(null);
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeployments = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`${apiConfig.baseURL}/deployments`);
            setDeployments(data);
            if (data.length > 0) {
                setSelectedDeployment(data[0].id);
                fetchRuns(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch deployments', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRuns = async (deploymentId) => {
        try {
            const data = await apiCall(`${apiConfig.baseURL}/terraform/enterprise/runs/${deploymentId}`);
            setRuns(data);
        } catch (error) {
            console.error('Failed to fetch runs', error);
        }
    };

    useEffect(() => {
        fetchDeployments();
    }, []);

    const handleQueuePlan = async () => {
        if (!selectedDeployment) return;
        try {
            await apiCall(`${apiConfig.baseURL}/terraform/enterprise/runs/${selectedDeployment}/plan`, { method: 'POST' });
            fetchRuns(selectedDeployment);
            // Polling simulation
            setTimeout(() => fetchRuns(selectedDeployment), 2500);
        } catch (error) {
            console.error('Failed to queue plan', error);
        }
    };

    const handleApproveRun = async (runId) => {
        try {
            await apiCall(`${apiConfig.baseURL}/terraform/enterprise/runs/${runId}/approve`, { method: 'POST' });
            fetchRuns(selectedDeployment);
            setTimeout(() => fetchRuns(selectedDeployment), 2500);
        } catch (error) {
            console.error('Failed to approve run', error);
        }
    };

    const handleSelectDeployment = (e) => {
        const id = parseInt(e.target.value);
        setSelectedDeployment(id);
        fetchRuns(id);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center text-slate-800 dark:text-slate-100">
                    <Terminal className="mr-3 text-purple-500" />
                    Terraform Enterprise
                </h1>
                
                <div className="flex items-center gap-4">
                    <select 
                        className="px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={selectedDeployment || ''}
                        onChange={handleSelectDeployment}
                    >
                        {deployments.map(d => (
                            <option key={d.id} value={d.id}>{d.name} (ID: {d.id})</option>
                        ))}
                    </select>
                    
                    <button 
                        onClick={handleQueuePlan}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                    >
                        <Play size={18} className="mr-2" /> Queue Plan
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 text-slate-600 dark:text-slate-300 font-medium">Status</th>
                            <th className="p-4 text-slate-600 dark:text-slate-300 font-medium">Type</th>
                            <th className="p-4 text-slate-600 dark:text-slate-300 font-medium">Started</th>
                            <th className="p-4 text-slate-600 dark:text-slate-300 font-medium">Output</th>
                            <th className="p-4 text-slate-600 dark:text-slate-300 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {runs.map(run => (
                            <tr key={run.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="p-4">
                                    <div className="flex items-center">
                                        {run.status === 'planning' && <Clock className="text-amber-500 mr-2" size={18} />}
                                        {run.status === 'planned' && <CheckCircle className="text-blue-500 mr-2" size={18} />}
                                        {run.status === 'applying' && <Clock className="text-purple-500 mr-2" size={18} />}
                                        {run.status === 'applied' && <CheckCircle className="text-emerald-500 mr-2" size={18} />}
                                        <span className="capitalize text-slate-800 dark:text-slate-200 font-medium">
                                            {run.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400 capitalize">{run.run_type}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                    {new Date(run.created_at).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <div className="max-w-xs truncate text-sm font-mono text-slate-500 dark:text-slate-400">
                                        {run.plan_output || run.apply_output || '...'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {run.status === 'planned' && (
                                        <button 
                                            onClick={() => handleApproveRun(run.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-sm rounded-md transition-colors"
                                        >
                                            Approve & Apply
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {runs.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">
                                    No Terraform runs found for this deployment. Queue a plan to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TerraformEnterprise;
