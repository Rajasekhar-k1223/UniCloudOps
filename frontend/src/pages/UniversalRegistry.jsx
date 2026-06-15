import React, { useState, useEffect } from 'react';
import { Book, Zap, ShieldCheck, RefreshCw, FileCode, Box, ShieldAlert, Info, Database, Lock, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import api from '../services/api';

const UniversalRegistry = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/registry/assets');
      setAssets(res.data);
    } catch (err) {
      console.error("Registry synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (assetId) => {
    setVerifying(assetId);
    try {
      const res = await api.post('/registry/verify', { asset_id: assetId });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert("Verification Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setVerifying(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-indigo-500 w-12 h-12" />
       <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Synchronizing_Universal_Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#1e1b4b] p-10 rounded-[3rem] border border-indigo-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/10"><Database size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Universal Registry</h1>
          </div>
          <p className="text-indigo-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-8 Sovereign Catalog. A single, cryptographically signed registry for every AI-synthesized asset in your galactic empire, ensuring absolute version control and zero-drift.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Book size={250} className="text-indigo-400" /></div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[600px]">
         <div className="flex justify-between items-center mb-12">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Search size={14} className="text-indigo-500" />
              Sovereign Asset Catalog
            </h3>
            <div className="flex gap-4">
               <div className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Assets: {assets.length}
               </div>
               <div className="px-6 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Root-of-Trust: Active
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-200 transition-all flex flex-col justify-between gap-6">
                 <div className="flex justify-between items-start">
                    <div className="flex gap-5">
                       <div className={`p-4 rounded-2xl shadow-xl bg-white text-indigo-600 border border-indigo-50 border-b-4 border-b-indigo-500`}>
                          {asset.type === 'Code' ? <FileCode size={24} /> : asset.type === 'Container' ? <Box size={24} /> : asset.type === 'Policy' ? <ShieldCheck size={24} /> : <Zap size={24} />}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.type} | V{asset.version}</p>
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                asset.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                             }`}>
                                {asset.status}
                             </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800">{asset.name}</h4>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">Sig: {asset.signature}</p>
                       </div>
                    </div>
                    <button className="text-slate-300 hover:text-indigo-500 transition-all"><ExternalLink size={18} /></button>
                 </div>

                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleVerify(asset.id)}
                      disabled={verifying === asset.id}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                       {verifying === asset.id ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                       {verifying === asset.id ? 'Verifying Integrity...' : 'Verify Asset Signature'}
                    </button>
                    <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                       <Book size={16} />
                    </button>
                 </div>
              </div>
            ))}
         </div>

         <div className="mt-12 p-10 bg-indigo-950 rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Lock size={180} className="text-white" /></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
               <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 text-indigo-400"><ShieldCheck size={48} /></div>
               <div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">Zero-Drift Sovereign Integrity</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mt-2 font-medium italic">
                     "Every mission-synthesized asset is cryptographically anchored to the Evidence Vault. If a single bit of your galactic infrastructure drifts from its signed blueprint, the platform will automatically alert and remediate within milliseconds."
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UniversalRegistry;
