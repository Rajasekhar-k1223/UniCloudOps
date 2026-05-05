import React, { useState, useEffect } from 'react';
import { Shield, FileText, Lock, Globe, Search, RefreshCw, BarChart, CheckCircle, Download, FileCheck } from 'lucide-react';
import api from '../services/api';

const EvidenceVault = () => {
  const [projects, setProjects] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const fetchReport = async (projectId) => {
    setReportLoading(true);
    try {
      const res = await api.get(`/audit/sealed/${projectId}`);
      setSelectedReport(res.data);
    } catch (err) {
      alert('Failed to retrieve sealed mission data.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Immutable Evidence Vault</h1>
          <p className="text-gray-500">Forensic preservation and sealed mission reports for regulatory compliance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Project Selector */}
        <div className="lg:col-span-4 space-y-4">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Mission Boundaries</h3>
           {loading ? (
             <div className="p-10 text-center text-gray-400 italic">Accessing grid...</div>
           ) : projects.map((p) => (
             <button 
               key={p.id}
               onClick={() => fetchReport(p.id)}
               className={`w-full p-6 text-left rounded-3xl border transition-all flex justify-between items-center ${
                 selectedReport?.mission_id.endsWith(p.id.toString()) 
                   ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                   : 'bg-white text-gray-700 border-slate-100 hover:border-indigo-300'
               }`}
             >
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${selectedReport?.mission_id.endsWith(p.id.toString()) ? 'bg-white/10' : 'bg-slate-50'}`}>
                      <FileCheck size={20} className={selectedReport?.mission_id.endsWith(p.id.toString()) ? 'text-emerald-400' : 'text-slate-400'} />
                   </div>
                   <div>
                      <p className="font-bold text-sm leading-none mb-1">{p.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedReport?.mission_id.endsWith(p.id.toString()) ? 'text-slate-400' : 'text-gray-400'}`}>Project ID: {p.id}</p>
                   </div>
                </div>
                <Lock size={16} className={selectedReport?.mission_id.endsWith(p.id.toString()) ? 'text-emerald-500' : 'text-slate-200'} />
             </button>
           ))}
        </div>

        {/* Sealed Report Viewer */}
        <div className="lg:col-span-8 flex flex-col">
           {reportLoading ? (
             <div className="flex-1 glass-panel p-20 flex flex-col items-center justify-center bg-white border-slate-100">
                <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verifying Integrity Hashes...</p>
             </div>
           ) : selectedReport ? (
             <div className="flex-1 glass-panel bg-white border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
                         <Shield className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold">Sealed Forensic Audit</h3>
                         <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle size={10} /> Mission Sealed & Protected
                         </p>
                      </div>
                   </div>
                   <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-xs font-bold border border-white/10">
                      <Download size={16} /> Export PDF
                   </button>
                </div>

                <div className="p-8 flex-1 space-y-8 overflow-y-auto">
                   
                   {/* Strategic Summary */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mission Ident</p>
                         <p className="text-sm font-bold text-gray-800">{selectedReport.mission_id}</p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Events</p>
                         <p className="text-sm font-bold text-gray-800">{selectedReport.total_events}</p>
                      </div>
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                         <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Failures</p>
                         <p className="text-sm font-bold text-rose-700">{selectedReport.critical_violations}</p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Integrity Date</p>
                         <p className="text-sm font-bold text-gray-800">{new Date(selectedReport.sealed_at).toLocaleDateString()}</p>
                      </div>
                   </div>

                   {/* Action Breakdown */}
                   <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BarChart size={14} className="text-indigo-500" /> Mission Action Breakdown
                      </h4>
                      <div className="space-y-3">
                         {Object.entries(selectedReport.actions_summary).map(([action, count]) => (
                           <div key={action} className="flex flex-col gap-1.5">
                              <div className="flex justify-between text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                 <span>{action.replace(/_/g, ' ')}</span>
                                 <span>{count} Instances</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${(count / selectedReport.total_events) * 100}%` }} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Technical Hardening Footer */}
                   <div className="pt-8 border-t border-slate-100 flex items-start gap-4 text-gray-400">
                      <Lock size={32} className="opacity-20 shrink-0" />
                      <p className="text-xs leading-relaxed italic">
                        This document is a sealed cryptographic representation of the UniCloudOps forensic state. All integrity hashes are verified against the central mission ledger.
                      </p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex-1 glass-panel p-20 flex flex-col items-center justify-center bg-slate-50/50 border-dashed border-2 border-slate-200 text-center">
                <Globe className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-400">Strategic Audit Mode</h3>
                <p className="text-sm text-slate-400/80 max-w-xs mx-auto mt-2">
                   Select a mission boundary from the left to access the high-fidelity evidence vault.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceVault;
