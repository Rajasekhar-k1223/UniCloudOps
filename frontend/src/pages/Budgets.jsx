import React, { useState, useEffect } from 'react';
import { CreditCard, Power, AlertTriangle, ShieldCheck, RefreshCw, Save, DollarSign, Activity } from 'lucide-react';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const Budgets = () => {
  const { formatValue } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/billing/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleUpdate = async (accountId, limit, killSwitch) => {
    setUpdating(true);
    try {
      await api.post('/billing/budgets/configure', {
        account_id: accountId,
        limit: parseFloat(limit),
        kill_switch: killSwitch
      });
      fetchBudgets();
    } catch (err) {
      alert("Failed to update budget boundary.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cost Intelligence & Budgets</h1>
          <p className="text-gray-500">Configure tactical spend thresholds and autonomous fail-safe containment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analyzing Cost Trajectories...</p>
          </div>
        ) : budgets.map((b) => (
          <div key={b.account_id} className="glass-panel p-8 bg-white border border-slate-100 shadow-xl overflow-hidden relative group">
             {/* Status Glow */}
             <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full ${
               b.status === 'nominal' ? 'bg-emerald-500' : 'bg-rose-500'
             }`} />

             <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                         <CreditCard size={20} />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-gray-800">{b.account_name}</h3>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Boundary: Account {b.account_id}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Current Spend (EST)</p>
                         <p className={`text-xl font-bold ${b.status === 'nominal' ? 'text-gray-900' : 'text-rose-600'}`}>{formatValue(b.spend)}</p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Tactical Limit</p>
                         <p className="text-xl font-bold text-gray-900">{formatValue(b.limit)}</p>
                      </div>
                   </div>
                </div>

                <div className="w-full lg:w-96 space-y-4 pt-6 lg:pt-0 lg:border-l lg:border-gray-50 lg:pl-8">
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Threshold Override</label>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                         <input 
                           type="number" 
                           defaultValue={b.limit}
                           onBlur={(e) => handleUpdate(b.account_id, e.target.value, b.status === 'kill_switch_triggered' || b.limit > 0)}
                           className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-bold"
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-3xl group-hover:border-rose-300 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl bg-white shadow-sm ${b.status === 'kill_switch_triggered' ? 'text-rose-600 animate-pulse' : 'text-gray-400'}`}>
                            <Power size={20} />
                         </div>
                         <div>
                            <p className="text-[11px] font-bold text-rose-800">Budget Kill-Switch</p>
                            <p className="text-[9px] text-rose-600/70 font-medium leading-none mt-1">Autonomous Containment</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleUpdate(b.account_id, b.limit, b.status !== 'kill_switch_triggered')}
                        className={`w-12 h-6 rounded-full relative transition-colors ${b.status === 'kill_switch_triggered' ? 'bg-rose-500' : 'bg-slate-200'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${b.status === 'kill_switch_triggered' ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                </div>
             </div>

             {/* Progress Bar */}
             <div className="mt-8 overflow-hidden h-2 bg-slate-100 rounded-full">
                <div className={`h-full transition-all duration-1000 ${
                  (b.spend / b.limit) > 0.9 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500'
                }`} style={{ width: `${Math.min((b.spend / b.limit) * 100, 100)}%` }} />
             </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-4 text-white">
         <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
         </div>
         <div className="flex-1">
            <h4 className="text-sm font-bold mb-1">Cost Integrity Guaranteed</h4>
            <p className="text-xs text-slate-400 leading-tight">UniOS autonomous budget agents are monitoring mission spend cycles every 300s. Threshold breaches trigger instant containment.</p>
         </div>
         <Activity className="text-slate-700 animate-pulse" size={48} />
      </div>
    </div>
  );
};

export default Budgets;
