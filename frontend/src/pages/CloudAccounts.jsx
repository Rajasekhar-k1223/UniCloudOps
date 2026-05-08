import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShieldCheck, X, RefreshCw, Layers } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

const CloudAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState('aws');
  const [accountName, setAccountName] = useState('');
  const [credentials, setCredentials] = useState({});
  const [schemas, setSchemas] = useState({});
  const [loadingSchemas, setLoadingSchemas] = useState(true);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/cloud-accounts/');
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchemas = async () => {
    try {
      const res = await api.get('/cloud-accounts/schemas');
      setSchemas(res.data);
      setLoadingSchemas(false);
    } catch (err) {
      console.error("Failed to fetch credential schemas", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchSchemas();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cloud-accounts/', {
        provider,
        name: accountName,
        credentials
      });
      setIsModalOpen(false);
      setAccountName('');
      setCredentials({});
      fetchAccounts();
    } catch (err) {
      alert("Failed to add account: " + (err.response?.data?.detail || "Network Error"));
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure? This will disconnect the cloud provider from UniCloudOps.")) {
      await api.delete(`/cloud-accounts/${id}`);
      fetchAccounts();
    }
  };

  const handleSync = async (id) => {
    try {
      await api.post(`/catalog/sync/${id}`);
      setAccounts(accounts.map(acc => acc.id === id ? { ...acc, status: 'pending' } : acc));
      setTimeout(fetchAccounts, 3000);
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const renderCredentialFields = () => {
    const schema = schemas[provider] || [];
    return (
      <div className="space-y-4">
        {schema.map(field => (
          <div key={field.id}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{field.name}</label>
            {field.type === 'textarea' ? (
              <textarea
                placeholder={field.placeholder}
                required
                onChange={(e) => setCredentials({...credentials, [field.id]: e.target.value})}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 h-32 font-mono scrollbar-hide"
              />
            ) : (
              <input
                type={field.type === 'password' ? 'password' : 'text'}
                placeholder={field.placeholder}
                required
                onChange={(e) => setCredentials({...credentials, [field.id]: e.target.value})}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Integration</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
              Cloud <span className="text-blue-600">Accounts</span>
            </h1>
            <p className="text-slate-500 max-w-xl text-sm font-medium">Securely orchestrate 10+ cloud platforms through an encrypted multi-mission credential vault.</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative overflow-hidden px-8 py-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <div className="relative z-10 flex items-center gap-3">
              <Plus className="w-5 h-5 text-blue-400 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Link New Asset</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-white border border-slate-200 p-8 relative rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layers size={64} className="text-slate-900" />
              </div>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    acc.status === 'active' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 
                    acc.status === 'error' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 
                    'bg-amber-500 animate-pulse'
                  }`} 
                  title={acc.status === 'error' ? acc.error_message : acc.status}
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      {acc.provider}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{acc.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-20">
                  <button 
                    onClick={() => handleSync(acc.id)} 
                    className={clsx(
                      "p-2.5 rounded-xl transition-all border",
                      acc.status === 'pending' ? "bg-amber-50 text-amber-500 border-amber-100 animate-spin" : "bg-slate-50 text-slate-400 border-slate-100 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100"
                    )}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(acc.id)} 
                    className="p-2.5 bg-slate-50 text-slate-400 border border-slate-100 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{acc.name}</h3>
              
                <div className="space-y-4 pt-6 border-t border-slate-50">
                {acc.connectivity && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest gap-2">
                      <ShieldCheck size={14} className={acc.connectivity.authenticated ? "text-emerald-500" : "text-rose-500"} /> 
                      {acc.connectivity.authenticated ? "Authenticated" : "Auth Failure"}
                    </div>
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest gap-2">
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${acc.connectivity.billing_access ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                        $
                      </div>
                      {acc.connectivity.billing_access ? "Fiscal Access: ACTIVE" : "Fiscal Access: BLOCKED"}
                    </div>
                    {acc.connectivity.note && (
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic ml-5">
                        Note: {acc.connectivity.note}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> 
                  HSTS Encryption Active
                </div>
                {acc.last_sync && (
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                     Last Orbit Sync: {new Date(acc.last_sync).toLocaleTimeString()}
                  </div>
                )}
                {acc.status === 'error' && (
                  <div className="text-[10px] font-bold text-rose-500 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 mt-2 line-clamp-2">
                     {acc.error_message}
                  </div>
                )}
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <div className="col-span-full py-24 text-center rounded-[3rem] border border-dashed border-slate-200 bg-white/50">
               <Layers size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No orbital assets linked to the mission vault.</p>
            </div>
          )}
        </div>

        {/* Dynamic Onboarding Modal */}
        {isModalOpen && (
          <div className="fixed z-50 inset-0 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Link Provider</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Cloud Vault Integration</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleCreate} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cloud Provider</label>
                    <select 
                      value={provider} 
                      onChange={(e) => {setProvider(e.target.value); setCredentials({});}}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
                    >
                      {Object.keys(schemas).map(p => (
                        <option key={p} value={p}>{p.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Alias</label>
                    <input 
                      type="text" 
                      required 
                      value={accountName} 
                      onChange={(e) => setAccountName(e.target.value)} 
                      placeholder="e.g. Production Cluster"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-8">
                  {renderCredentialFields()}
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full group relative overflow-hidden h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                  >
                    <span className="relative z-10 text-xs font-black text-white uppercase tracking-widest">Authorize Mission Access</span>
                  </button>
                  <p className="text-center text-[9px] font-bold text-slate-400 uppercase mt-4 tracking-widest">Your keys are encrypted via AES-256 GCM in the UniCloud Secure Vault.</p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudAccounts;

