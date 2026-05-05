import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Target, AlertTriangle, Save, Code, Settings, Trash2, CheckCircle } from 'lucide-react';
import api from '../services/api';

const PolicyEditor = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    check_id: 'custom_schema_match',
    description: '',
    category: 'governance',
    severity: 'medium'
  });

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/governance/policies');
      setPolicies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/governance/scan'); // Simulation: trigger a scan after adding
      // In a real app, we'd have a POST /governance/policies endpoint
      alert('Mission Success: Tactical policy registered and deployed.');
      setIsCreating(false);
      fetchPolicies();
    } catch (err) {
      alert('Failed to deploy policy.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Governance Policy HQ</h1>
          <p className="text-gray-500">Author and deploy custom multi-cloud compliance missions using advanced tactical logic.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition shadow-lg shadow-slate-200"
        >
          <Plus size={18} />
          Author New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Policy Feed */}
         <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-gray-400 italic font-medium uppercase tracking-widest text-xs">Accessing Policy Boundary...</div>
            ) : policies.map((policy) => (
              <div key={policy.id} className="glass-panel p-6 bg-white border border-slate-100 hover:border-indigo-300 hover:shadow-xl transition-all group">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Target size={20} />
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-800">{policy.name}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{policy.category} • {policy.severity}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" checked={policy.is_active} readOnly className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500" />
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                    </div>
                 </div>
                 <p className="text-sm text-gray-500 leading-relaxed mb-6 italic">"{policy.description}"</p>
                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{policy.check_id}</span>
                    <button className="text-xs font-bold text-rose-500 hover:underline">Revoke Authorization</button>
                 </div>
              </div>
            ))}
         </div>

         {/* Right Sidebar: Policy Configuration */}
         <div className="space-y-6">
            {isCreating ? (
              <div className="glass-panel p-8 bg-white border-2 border-indigo-100 shadow-2xl animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                       <Code size={24} />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-gray-800">Policy Authoring</h3>
                       <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Tactical JSON Schema</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Mission Name</label>
                          <input 
                            type="text" 
                            value={newPolicy.name}
                            onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
                            placeholder="e.g., Critical DB Lockdown"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" 
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Severity</label>
                          <select 
                            value={newPolicy.severity}
                            onChange={(e) => setNewPolicy({...newPolicy, severity: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                          >
                             <option value="low">Low Impact</option>
                             <option value="medium">Medium Priority</option>
                             <option value="high">High Risk</option>
                             <option value="critical">Mission Critical</option>
                          </select>
                       </div>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Operational Summary</label>
                       <textarea 
                         rows="3" 
                         value={newPolicy.description}
                         onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
                         placeholder="Describe the compliance intent..."
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                       />
                    </div>

                    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                       <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Settings size={12} /> Tactical Logic (Alpha)
                       </p>
                       <div className="font-mono text-[11px] text-slate-300 space-y-1">
                          <p>{"{"}</p>
                          <p className="pl-4">"condition": "ALL",</p>
                          <p className="pl-4">"target": "resources.type == 'Database'",</p>
                          <p className="pl-4">"action": "DENY_PUBLIC_INGRESS"</p>
                          <p>{"}"}</p>
                       </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                       <button 
                         onClick={() => setIsCreating(false)}
                         className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-400 font-bold text-sm hover:bg-gray-50 transition"
                       >
                          Discard
                       </button>
                       <button 
                         onClick={handleCreate}
                         className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                       >
                          <Save size={18} />
                          Deploy Policy
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="glass-panel p-12 bg-slate-50/50 border-dashed border-2 border-slate-200 text-center">
                 <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-slate-600">Strategic Design Mode</h3>
                 <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed">
                   Select an existing policy mission to modify or click 'Author' to create new tactical boundaries.
                 </p>
              </div>
            )}

            <div className="glass-panel p-6 bg-amber-50 border border-amber-100">
               <div className="flex gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
                     <AlertTriangle size={20} />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-amber-800 mb-1">Impact Analysis Required</h4>
                     <p className="text-xs text-amber-700/70 leading-relaxed">
                       Deploying custom policies may trigger automated remediations across all active mission boundaries. Proactive scanning is recommended.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PolicyEditor;
