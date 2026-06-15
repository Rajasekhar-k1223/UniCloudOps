import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Building2, Layers, Plus } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const TenantsDashboard = () => {
    const [organizations, setOrganizations] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [newOrgName, setNewOrgName] = useState('');
    const [newTenantName, setNewTenantName] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const orgs = await apiCall(`${apiConfig.baseURL}/tenants/organizations`);
            setOrganizations(orgs);
            
            const tnts = await apiCall(`${apiConfig.baseURL}/tenants/`);
            setTenants(tnts);
        } catch (error) {
            console.error('Failed to fetch MSP data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        if (!newOrgName) return;
        try {
            await apiCall(`${apiConfig.baseURL}/tenants/organizations?name=${newOrgName}`, { method: 'POST' });
            setNewOrgName('');
            fetchData();
        } catch (error) {
            console.error('Failed to create organization', error);
        }
    };

    const handleCreateTenant = async (e) => {
        e.preventDefault();
        if (!newTenantName || !selectedOrgId) return;
        try {
            await apiCall(`${apiConfig.baseURL}/tenants/?name=${newTenantName}&org_id=${selectedOrgId}`, { method: 'POST' });
            setNewTenantName('');
            fetchData();
        } catch (error) {
            console.error('Failed to create tenant', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-slate-800 dark:text-slate-100">
                <Building2 className="mr-3 text-emerald-500" />
                Multi-Tenant MSP Mode
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organizations Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                        <Building2 className="mr-2" size={20} />
                        Organizations
                    </h2>
                    
                    <form onSubmit={handleCreateOrg} className="mb-6 flex gap-2">
                        <input 
                            type="text"
                            className="flex-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            placeholder="New Organization Name"
                            required
                        />
                        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center">
                            <Plus size={18} className="mr-1" /> Add
                        </button>
                    </form>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {organizations.map(org => (
                            <div key={org.id} className="p-4 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-slate-800 dark:text-slate-200">{org.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Created: {new Date(org.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded dark:bg-emerald-900/30 dark:text-emerald-400">
                                    ID: {org.id}
                                </span>
                            </div>
                        ))}
                        {organizations.length === 0 && !loading && (
                            <p className="text-slate-500 text-center py-4">No organizations found.</p>
                        )}
                    </div>
                </div>

                {/* Tenants Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center">
                        <Layers className="mr-2" size={20} />
                        Tenants (Customers)
                    </h2>
                    
                    <form onSubmit={handleCreateTenant} className="mb-6 flex flex-col gap-3">
                        <select 
                            className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            required
                        >
                            <option value="">Select Organization...</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                className="flex-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={newTenantName}
                                onChange={(e) => setNewTenantName(e.target.value)}
                                placeholder="New Tenant Name"
                                required
                            />
                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center">
                                <Plus size={18} className="mr-1" /> Add
                            </button>
                        </div>
                    </form>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {tenants.map(tenant => {
                            const parentOrg = organizations.find(o => o.id === tenant.org_id);
                            return (
                                <div key={tenant.id} className="p-4 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-slate-800 dark:text-slate-200">{tenant.name}</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-400">
                                            Tenant ID: {tenant.id}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Organization: <span className="font-medium">{parentOrg ? parentOrg.name : 'Unknown'}</span>
                                    </p>
                                </div>
                            );
                        })}
                        {tenants.length === 0 && !loading && (
                            <p className="text-slate-500 text-center py-4">No tenants found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantsDashboard;
