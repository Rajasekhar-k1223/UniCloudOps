import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { ShieldAlert, CheckCircle2, XOctagon, Plus, FileCode2 } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const CloudGovernance = () => {
    const [policies, setPolicies] = useState([]);
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [newPolicyName, setNewPolicyName] = useState('');
    const [newPolicyRego, setNewPolicyRego] = useState('');
    const [newPolicySeverity, setNewPolicySeverity] = useState('medium');

    const fetchData = async () => {
        try {
            setLoading(true);
            const pData = await apiCall(`${apiConfig.baseURL}/governance/opa/policies`);
            setPolicies(pData);
            
            const vData = await apiCall(`${apiConfig.baseURL}/governance/opa/violations`);
            setViolations(vData);
        } catch (error) {
            console.error('Failed to fetch governance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePolicy = async (e) => {
        e.preventDefault();
        if (!newPolicyName || !newPolicyRego) return;
        try {
            await apiCall(`${apiConfig.baseURL}/governance/opa/policies?name=${encodeURIComponent(newPolicyName)}&rego_code=${encodeURIComponent(newPolicyRego)}&severity=${newPolicySeverity}`, { method: 'POST' });
            setNewPolicyName('');
            setNewPolicyRego('');
            fetchData();
        } catch (error) {
            console.error('Failed to create policy', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <ShieldAlert className="mr-3 text-rose-500" />
                Cloud Governance Engine (OPA)
            </h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Active Violations Panel */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                        <XOctagon className="mr-2 text-rose-500" size={20} /> Active Violations
                    </h2>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {violations.map(v => {
                            const policy = policies.find(p => p.id === v.policy_id);
                            return (
                                <div key={v.id} className="border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-600 p-4 rounded-r-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-rose-900 dark:text-rose-300">
                                            {policy ? policy.name : `Policy ID: ${v.policy_id}`}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs rounded font-bold uppercase
                                            ${policy?.severity === 'high' ? 'bg-rose-200 text-rose-800 dark:bg-rose-800/50 dark:text-rose-200' : 'bg-amber-200 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200'}
                                        `}>
                                            {policy?.severity || 'unknown'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                        <span className="font-semibold">Resource:</span> {v.resource_type} ({v.resource_id})
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-2 rounded text-xs font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
                                        {v.violating_attributes}
                                    </div>
                                </div>
                            );
                        })}
                        {violations.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-10 text-emerald-500">
                                <CheckCircle2 size={48} className="mb-3" />
                                <p className="font-medium text-lg">Zero Active Violations</p>
                                <p className="text-sm text-emerald-600/70">All resources comply with current policies.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Policy Management Panel */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                            <Plus className="mr-2" size={20} /> Author Rego Policy
                        </h2>
                        
                        <form onSubmit={handleCreatePolicy} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Policy Name</label>
                                <input 
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={newPolicyName}
                                    onChange={(e) => setNewPolicyName(e.target.value)}
                                    placeholder="e.g. enforce-s3-encryption"
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Severity</label>
                                    <select 
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white uppercase"
                                        value={newPolicySeverity}
                                        onChange={(e) => setNewPolicySeverity(e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rego Code</label>
                                <textarea 
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono text-sm h-32"
                                    value={newPolicyRego}
                                    onChange={(e) => setNewPolicyRego(e.target.value)}
                                    placeholder="package unicloudops.governance&#10;&#10;deny[msg] {&#10;  input.public == true&#10;  msg := &#34;Public access is forbidden&#34;&#10;}"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-slate-800 text-white dark:bg-indigo-600 py-2 rounded-md hover:bg-slate-700 dark:hover:bg-indigo-700 flex items-center justify-center font-medium transition-colors">
                                <FileCode2 className="mr-2" size={18} /> Deploy Policy
                            </button>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100 flex items-center">
                            <FileCode2 className="mr-2" size={18} /> Active Policies ({policies.length})
                        </h2>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {policies.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700/30">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
                                    <span className={`px-2 py-1 text-xs rounded uppercase font-bold
                                        ${p.severity === 'high' ? 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'}
                                    `}>
                                        {p.severity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CloudGovernance;
