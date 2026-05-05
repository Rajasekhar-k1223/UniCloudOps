import React, { useState, useEffect } from 'react';
import { Box, Database, Zap, Terminal, Search, Filter, Rocket, CreditCard, Layers, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const Marketplace = () => {
  const { formatValue } = useCurrency();
  const [stacks, setStacks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStack, setSelectedStack] = useState(null);
  const [targetAccount, setTargetAccount] = useState('');
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stacksRes, accountsRes] = await Promise.all([
          api.get('/marketplace/stacks'),
          api.get('/cloud-accounts')
        ]);
        setStacks(stacksRes.data);
        setAccounts(accountsRes.data);
      } catch (err) {
        console.error("Failed to fetch marketplace data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeploy = async () => {
    if (!targetAccount) return alert('Select target cloud account');
    setDeploying(true);
    try {
      const res = await api.post(`/marketplace/deploy/${selectedStack.id}?target_account_id=${targetAccount}`);
      alert(res.data.message);
      setSelectedStack(null);
    } catch (err) {
      alert('Deployment mission failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeploying(false);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Box': return <Box className="w-6 h-6" />;
      case 'Database': return <Database className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'Terminal': return <Terminal className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Marketplace</h1>
          <p className="text-gray-500">Deploy battle-tested infrastructure stacks across multi-cloud mission boundaries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Tactical Catalog...</p>
          </div>
        ) : stacks.map((stack) => (
          <div key={stack.id} className="glass-panel group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full bg-white border-slate-100">
             <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {getIcon(stack.icon)}
                   </div>
                   <div className="flex flex-col items-end">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        stack.complexity === 'low' ? 'bg-emerald-100 text-emerald-700' : 
                        stack.complexity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {stack.complexity}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">{stack.provider.toUpperCase()}</p>
                   </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{stack.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{stack.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                   {stack.services.map(s => (
                     <span key={s} className="px-2 py-1 bg-slate-50 text-slate-500 rounded text-[10px] font-mono border border-slate-100">
                       {s}
                     </span>
                   ))}
                </div>
             </div>

             <div className="px-6 py-4 border-t border-gray-50 bg-slate-50/30 flex items-center justify-between">
                <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none">Min Cost</p>
                   <p className="text-lg font-bold text-emerald-600">{formatValue(stack.est_cost)}<span className="text-[10px] text-gray-400">/mo</span></p>
                </div>
                <button 
                  onClick={() => setSelectedStack(stack)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                   <Rocket size={14} />
                   Configure
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Deployment Modal */}
      {selectedStack && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                   {getIcon(selectedStack.icon)}
                   <h3 className="text-lg font-bold">{selectedStack.name}</h3>
                </div>
                <button onClick={() => setSelectedStack(null)} className="p-2 hover:bg-white/20 rounded-lg">
                   <RefreshCw className="w-5 h-5 rotate-45" />
                </button>
             </div>

             <div className="p-8 space-y-6">
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Target Cloud</label>
                   <select 
                     value={targetAccount}
                     onChange={(e) => setTargetAccount(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-800"
                   >
                     <option value="">Operational Boundary...</option>
                     {accounts.map(acc => (
                       <option key={acc.id} value={acc.id}>{acc.name} ({acc.provider.toUpperCase()})</option>
                     ))}
                   </select>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <CreditCard size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Est. Monthly Impact</p>
                      <p className="text-xl font-bold text-gray-900">{formatValue(selectedStack.est_cost)}</p>
                   </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                     onClick={() => setSelectedStack(null)}
                     className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition"
                   >
                      Cancel
                   </button>
                   <button 
                     onClick={handleDeploy}
                     disabled={deploying}
                     className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                   >
                      {deploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                      {deploying ? 'Provisioning...' : 'Launch Mission'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
