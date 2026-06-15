import React, { useState, useEffect } from 'react';
import { Shield, Lock, FileText, Download, CheckCircle, AlertCircle, Search, Filter, Clock, Database, HardDrive, Cpu, Terminal } from 'lucide-react';
import api from '../services/api';
import clsx from 'clsx';

const EvidenceVault = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [merkleStatus, setMerkleStatus] = useState(null);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const [forensicsRes, integrityRes] = await Promise.all([
        api.get('/security-pulse/forensics'),
        api.get('/vault/integrity')
      ]);
      setArtifacts(forensicsRes.data);
      setMerkleStatus(integrityRes.data);
    } catch (err) {
      console.error("Forensic Retrieval Failure:", err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const verifyArtifact = async (id, hash) => {
    setVerifying(id);
    try {
      const res = await api.post(`/security-pulse/forensics/verify?artifact_id=${id}&hash_value=${hash}`);
      setArtifacts(prev => prev.map(a => a.id === id ? { ...a, verified: res.data.status === 'Verified' } : a));
    } catch (err) {
      console.error("Integrity Check Failed:", err);
    } finally {
      setTimeout(() => setVerifying(null), 1000);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const filteredArtifacts = artifacts.filter(a => filterType === 'All' || a.type === filterType);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-rose-500/30">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        
        {/* Cinematic Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-rose-500">
               <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-2xl shadow-rose-500/10">
                  <Shield className="animate-pulse" size={24} />
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400/70">Forensic Intelligence Layer</span>
                  <h1 className="text-4xl font-black text-white tracking-tight uppercase">Evidence <span className="text-slate-500">Vault</span></h1>
               </div>
            </div>
            <p className="text-slate-500 max-w-xl text-sm font-medium leading-relaxed italic">
              Immutable high-fidelity forensic telemetry. Aggregate disk snapshots, memory dumps, and network captures with SHA-256 integrity verification.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {['All', 'Disk Snapshot', 'Network Capture'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                      filterType === type ? "bg-rose-500 text-black shadow-lg shadow-rose-500/20" : "text-slate-500 hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* ⛓️ Sovereign Integrity Shield ⛓️ */}
        {merkleStatus && (
           <div className="mb-12 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 animate-in zoom-in-95 duration-700">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={32} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                       Sovereign Integrity Shield <span className="px-2 py-0.5 bg-emerald-500 text-black text-[8px] rounded">ACTIVE</span>
                    </h3>
                    <p className="text-[11px] text-emerald-500/70 font-mono mt-1 break-all max-w-2xl uppercase">
                       Merkle Root: {merkleStatus.merkle_root}
                    </p>
                 </div>
              </div>
              <div className="flex gap-4 shrink-0">
                 <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Anchors</p>
                    <p className="text-sm font-black text-white">{merkleStatus.total_anchors}</p>
                 </div>
                 <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Verification</p>
                    <p className="text-sm font-black text-emerald-400">SEALED</p>
                 </div>
              </div>
           </div>
        )}

        {/* 🔐 Evidence Grid 🔐 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2rem] bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtifacts.map((artifact) => (
              <div 
                key={artifact.id}
                className="group relative bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-8 hover:border-rose-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(244,63,94,0.05)] overflow-hidden"
              >
                {/* Provider Glow */}
                <div className={clsx(
                  "absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-20 rounded-full",
                  artifact.provider === 'aws' ? 'bg-orange-500' : 'bg-blue-500'
                )} />

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-rose-400">
                      {artifact.type.includes('Disk') ? <HardDrive size={20} /> : <Terminal size={20} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{artifact.provider}</p>
                      <p className="text-xs font-black text-white uppercase">{artifact.id}</p>
                    </div>
                  </div>
                  <div className={clsx(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    artifact.verified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    {artifact.verified ? "Verified" : artifact.status}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Source Resource</span>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu size={14} className="text-slate-500" /> {artifact.resource}
                    </p>
                  </div>

                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">SHA-256 Integrity Hash</span>
                      <Lock size={12} className="text-rose-500/40" />
                    </div>
                    <p className="text-[10px] font-mono text-rose-400/70 break-all leading-relaxed bg-black/20 p-2 rounded-lg">
                      {artifact.integrity_hash}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={12} />
                      <span className="text-[10px] font-medium">{new Date(artifact.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => verifyArtifact(artifact.id, artifact.integrity_hash)}
                        disabled={verifying === artifact.id}
                        className={clsx(
                          "p-2 rounded-lg border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all",
                          verifying === artifact.id && "animate-spin"
                        )}
                        title="Verify Integrity"
                      >
                        <CheckCircle size={16} className={clsx(artifact.verified ? "text-emerald-400" : "text-slate-500")} />
                      </button>
                      <button className="p-2 rounded-lg border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all" title="Download Artifact">
                        <Download size={16} className="text-slate-500 group-hover:text-rose-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredArtifacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <Search size={64} className="mb-4" />
            <h3 className="text-xl font-black uppercase tracking-widest">No Artifacts Detected</h3>
            <p className="text-sm font-medium italic">Mission boundary clear of forensic evidence.</p>
          </div>
        )}

      </div>

      {/* Decorative Neural Overlay */}
      <div className="fixed bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent shadow-[0_0_20px_rgba(244,63,94,0.3)]" />
    </div>
  );
};

export default EvidenceVault;
