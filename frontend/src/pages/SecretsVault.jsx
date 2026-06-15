import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Lock, Eye, Plus, RefreshCw, KeyRound } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const SecretsVault = () => {
    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSecretPath, setNewSecretPath] = useState('');
    const [newSecretPayload, setNewSecretPayload] = useState('');
    const [revealedSecret, setRevealedSecret] = useState(null);

    const fetchSecrets = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`${apiConfig.baseURL}/vault/secrets/`);
            setSecrets(data);
        } catch (error) {
            console.error('Failed to fetch secrets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecrets();
    }, []);

    const handleCreateSecret = async (e) => {
        e.preventDefault();
        if (!newSecretPath || !newSecretPayload) return;
        try {
            await apiCall(`${apiConfig.baseURL}/vault/secrets/?secret_path=${encodeURIComponent(newSecretPath)}&payload=${encodeURIComponent(newSecretPayload)}`, { method: 'POST' });
            setNewSecretPath('');
            setNewSecretPayload('');
            fetchSecrets();
        } catch (error) {
            console.error('Failed to create secret', error);
        }
    };

    const handleReveal = async (id) => {
        if (revealedSecret?.id === id) {
            setRevealedSecret(null); // toggle off
            return;
        }
        try {
            const data = await apiCall(`${apiConfig.baseURL}/vault/secrets/${id}`);
            setRevealedSecret({ id, payload: data.payload });
        } catch (error) {
            console.error('Failed to reveal secret', error);
        }
    };

    const handleRotate = async (id) => {
        try {
            await apiCall(`${apiConfig.baseURL}/vault/secrets/${id}/rotate`, { method: 'POST' });
            fetchSecrets();
            if (revealedSecret?.id === id) {
                handleReveal(id); // Re-fetch the revealed payload
            }
        } catch (error) {
            console.error('Failed to rotate secret', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <Lock className="mr-3 text-red-500" />
                Secrets & Credential Vault
            </h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                        <KeyRound className="mr-2" size={20} /> Stored Secrets
                    </h2>
                    
                    <div className="space-y-4">
                        {secrets.map(secret => (
                            <div key={secret.id} className="border dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-mono text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-sm">
                                        {secret.secret_path}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleReveal(secret.id)}
                                            className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-700 rounded shadow-sm transition-colors"
                                            title="Reveal Secret"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleRotate(secret.id)}
                                            className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-700 rounded shadow-sm transition-colors"
                                            title="Rotate Dynamic Secret"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                {revealedSecret?.id === secret.id ? (
                                    <div className="mt-3 bg-slate-900 text-emerald-400 font-mono text-sm p-3 rounded overflow-x-auto">
                                        {revealedSecret.payload}
                                    </div>
                                ) : (
                                    <div className="mt-3 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono text-sm p-3 rounded">
                                        ••••••••••••••••••••••••••••••••
                                    </div>
                                )}
                                
                                <div className="mt-3 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                                    <span>Created: {new Date(secret.created_at).toLocaleDateString()}</span>
                                    <span>Last Rotated: {new Date(secret.last_rotated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {secrets.length === 0 && !loading && (
                            <p className="text-center text-slate-500 py-8">Vault is currently empty.</p>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow p-6 h-fit border-t-4 border-red-500">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                        <Plus className="mr-2" size={20} /> Store New Secret
                    </h2>
                    
                    <form onSubmit={handleCreateSecret} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Secret Path</label>
                            <input 
                                type="text"
                                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono text-sm"
                                value={newSecretPath}
                                onChange={(e) => setNewSecretPath(e.target.value)}
                                placeholder="e.g. aws/prod/db-password"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payload (Sensitive)</label>
                            <textarea 
                                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono text-sm h-24"
                                value={newSecretPayload}
                                onChange={(e) => setNewSecretPayload(e.target.value)}
                                placeholder="Enter secure payload here..."
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 flex items-center justify-center font-medium transition-colors">
                            <Lock className="mr-2" size={18} /> Securely Store
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SecretsVault;
