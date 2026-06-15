import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Key, Shield, Plus, Trash2 } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const IAMDashboard = () => {
    const [apiKeys, setApiKeys] = useState([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchApiKeys = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`${apiConfig.baseURL}/iam/apikeys`);
            setApiKeys(data);
        } catch (error) {
            console.error('Failed to fetch API keys', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyName) return;
        try {
            const data = await apiCall(`${apiConfig.baseURL}/iam/apikeys?name=${newKeyName}`, { method: 'POST' });
            setCreatedKey(data);
            setNewKeyName('');
            fetchApiKeys();
        } catch (error) {
            console.error('Failed to create key', error);
        }
    };

    const handleDeleteKey = async (id) => {
        try {
            await apiCall(`${apiConfig.baseURL}/iam/apikeys/${id}`, { method: 'DELETE' });
            fetchApiKeys();
        } catch (error) {
            console.error('Failed to delete key', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <Shield className="mr-3 text-indigo-500" />
                Enterprise IAM
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">API Keys</h2>
                    {loading ? (
                        <p className="text-slate-500">Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b dark:border-slate-700">
                                        <th className="py-2 text-slate-600 dark:text-slate-400">Name</th>
                                        <th className="py-2 text-slate-600 dark:text-slate-400">Prefix</th>
                                        <th className="py-2 text-slate-600 dark:text-slate-400">Created At</th>
                                        <th className="py-2 text-slate-600 dark:text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apiKeys.map(key => (
                                        <tr key={key.id} className="border-b dark:border-slate-700">
                                            <td className="py-3 text-slate-800 dark:text-slate-200">{key.name}</td>
                                            <td className="py-3 text-slate-800 dark:text-slate-200 font-mono text-sm">{key.prefix}</td>
                                            <td className="py-3 text-slate-800 dark:text-slate-200">{new Date(key.created_at).toLocaleString()}</td>
                                            <td className="py-3">
                                                <button onClick={() => handleDeleteKey(key.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {apiKeys.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-4 text-center text-slate-500">No API keys found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Generate New Key</h2>
                    <form onSubmit={handleCreateKey}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Name</label>
                            <input 
                                type="text"
                                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g., CI/CD Pipeline"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center font-medium transition-colors">
                            <Plus className="mr-2" size={18} />
                            Generate Key
                        </button>
                    </form>

                    {createdKey && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30 rounded-md">
                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center">
                                <Key className="mr-2" size={16} />
                                Key Generated!
                            </h3>
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 mb-2">
                                Please copy your API key now. You will not be able to see it again.
                            </p>
                            <div className="bg-white dark:bg-slate-900 p-2 rounded border font-mono text-sm break-all select-all dark:text-slate-300">
                                {createdKey.api_key}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IAMDashboard;
