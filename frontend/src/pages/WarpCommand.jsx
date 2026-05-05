import React, { useState, useEffect } from 'react';
import { Zap, Globe, Shield, RefreshCw, AlertTriangle, ArrowRight, Layers, Box } from 'lucide-react';
import api from '../services/api';

const WarpCommand = () => {
  const [selectedResources, setSelectedResources] = useState([]);
  const [targetAccount, setTargetAccount] = useState('');
  const [warping, setWarping] = useState(false);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchRes = async () => {
      const res = await api.get('/resources');
      setResources(res.data);
    };
    fetchRes();
  }, []);

  const handleWarp = async () => {
    if (!targetAccount || selectedResources.length === 0) return;
    setWarping(true);
    try {
      await api.post('/governance/repair'); // Simulation: Triggering the warp
      alert('Strategic Stack Warp Mission initiated successfully.');
    } catch (err) {
      alert('Warp Mission Failed.');
    } finally {
      setWarping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 p-8 glass-panel bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent" />
         <div className="relative z-10">
            <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-4">
               <Zap className="text-indigo-400 animate-pulse" size={32} /> Multi-Region Disaster Warp
            </h1>
            <p className="text-indigo-300/60 mt-2 font-bold uppercase tracking-widest text-xs">High-Velocity Global Stack Migration Protocol</p>
         </div>
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe size={120} className="animate-spin-slow" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Stack Selection */}
         <div className="glass-panel p-6 bg-white border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Layers size={14} /> Mission Stack Definition
            </h3>
            <div className="space-y-3 h-[400px] overflow-y-auto custom-scrollbar pr-2">
               {resources.map(r => (
                 <div key={r.id} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                   selectedResources.includes(r.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                 }`} onClick={() => {
                   if (selectedResources.includes(r.id)) setSelectedResources(selectedResources.filter(id => id !== r.id));
                   else setSelectedResources([...selectedResources, r.id]);
                 }}>
                    <div className="flex items-center gap-3">
                       <Box size={18} className={selectedResources.includes(r.id) ? 'text-indigo-600' : 'text-slate-400'} />
                       <div>
                          <p className="text-sm font-bold text-slate-800">{r.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{r.provider} • {r.region}</p>
                       </div>
                    </div>
                    {selectedResources.includes(r.id) && <Shield className="text-indigo-600" size={14} />}
                 </div>
               ))}
            </div>
         </div>

         {/* Target Selection & Execute */}
         <div className="space-y-6">
            <div className="glass-panel p-8 bg-indigo-600 text-white shadow-xl shadow-indigo-100">
               <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-6">Strategic Destination</h3>
               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 block mb-2">Target Cloud Boundary</label>
                     <select className="w-full bg-indigo-700 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-white">
                        <option>Select Autonomous Target...</option>
                        <option>AWS Tactical HQ (us-east-1)</option>
                        <option>Azure Mission Region (west-europe)</option>
                        <option>GCP Sovereign Zone (us-central1)</option>
                     </select>
                  </div>
                  
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase font-bold text-indigo-200">Warp Integrity</span>
                        <span className="text-[10px] font-bold">SHA-512 SECURE</span>
                     </div>
                     <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[100%] animate-pulse" />
                     </div>
                  </div>

                  <button 
                    onClick={handleWarp}
                    disabled={warping || selectedResources.length === 0}
                    className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition shadow-lg flex items-center justify-center gap-2"
                  >
                     {warping ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                     {warping ? 'Engaging Warp Drive...' : 'Initiate Global Warp Mission'}
                  </button>
               </div>
            </div>

            <div className="glass-panel p-6 bg-amber-50 border border-amber-100 flex gap-4">
               <AlertTriangle className="text-amber-500 shrink-0" size={24} />
               <div>
                  <h4 className="text-sm font-bold text-amber-800">Mission Warning</h4>
                  <p className="text-xs text-amber-700 leading-tight mt-1">
                     Warp missions are high-impact lifecycle events. Ensure all data-sync protocols are verified before engagement. Existing resources in the target region with matching signatures may be overriden.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default WarpCommand;
