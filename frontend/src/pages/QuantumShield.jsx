import React, { useState, useEffect } from 'react';
import { Lock, Zap, ShieldCheck, RefreshCw, Key, Target, Activity, Cpu, Brain, Info, Globe, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const QuantumShield = () => {
  const [shield, setShield] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(null);

  const fetchShield = async () => {
    try {
      const res = await api.get('/quantum/status');
      setShield(res.data);
    } catch (err) {
      console.error("Quantum synchronization failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShield();
  }, []);

  const handleRotate = async (orbitName) => {
    setRotating(orbitName);
    try {
      const res = await api.post('/quantum/rotate', { orbit_name: orbitName });
      alert(res.data.message);
      fetchShield();
    } catch (err) {
      alert("Key Rotation Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setRotating(null);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-cyan-500 w-12 h-12" />
       <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.4em]">Engaging_Quantum_Resonance_Shield...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#083344] p-10 rounded-[3rem] border border-cyan-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl shadow-lg shadow-cyan-500/10"><Lock size={32} /></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Quantum Integrity Shield</h1>
          </div>
          <p className="text-cyan-100/70 text-lg max-w-2xl font-medium italic leading-relaxed">
            Tier-7 Post-Quantum Sovereignty. Implementing NIST-standard PQC algorithms to protect multi-cloud mission orbits against future quantum computing threats.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Globe size={250} className="text-cyan-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shield Status */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Quantum Resilience</h3>
              
              <div className="relative mb-8">
                 <div className="w-48 h-48 rounded-full border-8 border-cyan-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                    <div>
                       <p className="text-xl font-black text-cyan-600 uppercase">Class-5</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Shield_Active</p>
                    </div>
                 </div>
                 <div className="absolute inset-0 border-t-8 border-cyan-500 rounded-full animate-spin duration-[3000ms]" style={{ opacity: 0.3 }} />
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] w-full text-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Enforcement</p>
                 <p className="text-sm font-black text-white">{shield.pqc_standard}</p>
              </div>
           </div>

           <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-5 items-center">
              <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-3xl border border-cyan-500/20"><Cpu size={24} /></div>
              <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Post-Quantum Algorithms</h4>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2 uppercase">
                    Utilizing Dilithium, Kyber, and SPHINCS+ to ensure multi-decade sovereign integrity for all encrypted mission data.
                 </p>
              </div>
           </div>
        </div>

        {/* Orbit Integrity List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Activity size={14} className="text-cyan-500" />
                Inter-Orbit Cryptographic Integrity
              </h3>

              <div className="space-y-4">
                 {shield.orbits.map((o, i) => (
                   <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-cyan-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex gap-6 items-center">
                         <div className="p-4 bg-white rounded-2xl shadow-sm text-cyan-500 border border-cyan-100"><ShieldCheck size={24} /></div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{o.algorithm}</p>
                               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  o.status === 'shielded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                               }`}>
                                  {o.status}
                               </span>
                            </div>
                            <p className="text-sm font-black text-slate-800">{o.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">Integrity: {o.integrity}%</p>
                         </div>
                      </div>

                      <button 
                        onClick={() => handleRotate(o.name)}
                        disabled={rotating === o.name}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-cyan-600 transition-all flex items-center gap-2 active:scale-95"
                      >
                         {rotating === o.name ? <RefreshCw className="animate-spin" size={14} /> : <Key size={14} />}
                         {rotating === o.name ? 'Rotating PQC Keys...' : 'Rotate Quantum Keys'}
                      </button>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-8 bg-cyan-50 rounded-[2.5rem] border border-cyan-100 flex gap-6 items-center">
                 <div className="p-4 bg-cyan-600 text-white rounded-2xl h-fit shadow-xl shadow-cyan-200"><ShieldAlert size={24} /></div>
                 <div>
                    <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-widest">Future-Proof Sovereignty</h4>
                    <p className="text-[11px] text-cyan-800/70 leading-relaxed mt-2 font-medium">
                       Post-Quantum Cryptography ensures that mission data captured today cannot be decrypted by future quantum computers. Sovereign integrity is guaranteed for 50+ years.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumShield;
