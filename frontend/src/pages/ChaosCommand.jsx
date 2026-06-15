import React, { useState, useEffect } from 'react';
import { Ship, Zap, Activity, AlertTriangle, RefreshCw, Play, Search, Layers, Server, ShieldAlert, CheckCircle, Brain, Terminal } from 'lucide-react';
import api from '../services/api';

const ChaosCommand = () => {
  const [resources, setResources] = useState([]);
  const [experiments, setExperiments] = useState({ k8s: [], vm: [] });
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [pods, setPods] = useState([]);
  const [selectedPod, setSelectedPod] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, expRes] = await Promise.all([
          api.get('/resources'),
          api.get('/chaos/experiments')
        ]);
        setResources(resRes.data.filter(r => r.type === 'Compute' || r.type === 'Cluster'));
        setExperiments(expRes.data);
      } catch (err) {
        console.error("Link failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedResource?.type === 'Cluster') {
      fetchPods(selectedResource.id);
    } else {
      setPods([]);
      setSelectedPod('');
    }
  }, [selectedResource]);

  const fetchPods = async (id) => {
    try {
      const res = await api.get(`/k8s/pods/${id}`);
      setPods(res.data.items || []);
    } catch (err) {
      console.error("K8s telemetry link failed:", err);
    }
  };

  const handleInject = async () => {
    if (!selectedResource || !selectedExperiment) return;
    
    setIsInjecting(true);
    const logId = Date.now();
    addLog(`🚀 [${new Date().toLocaleTimeString()}] INITIATING MISSION: ${selectedExperiment.name} on ${selectedResource.name}`);
    
    try {
      const payload = {
        resource_id: selectedResource.id,
        experiment: selectedExperiment.id,
        params: {
          pod_name: selectedPod,
          namespace: pods.find(p => p.metadata.name === selectedPod)?.metadata.namespace || 'default'
        }
      };
      
      const res = await api.post('/chaos/inject', payload);
      addLog(`✅ [${new Date().toLocaleTimeString()}] MISSION SUCCESS: ${res.data.message}`);
    } catch (err) {
      addLog(`❌ [${new Date().toLocaleTimeString()}] MISSION ABORTED: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsInjecting(false);
    }
  };

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <RefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-rose-950 p-8 rounded-[2rem] border border-rose-900 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl"><Zap size={24} /></div>
            <h1 className="text-3xl font-black text-white">Chaos Command HQ</h1>
          </div>
          <p className="text-rose-400/80 text-sm max-w-xl">
            Proactive resilience auditing via controlled failure injection. 
            Audit your multi-cloud mission for **Zero-Downtime Reliability**.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={180} className="text-rose-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource Selector */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Layers size={14} className="text-indigo-500" />
               Select Target Resource
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {resources.map(res => (
                <div 
                  key={res.id}
                  onClick={() => setSelectedResource(res)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedResource?.id === res.id 
                    ? 'bg-rose-50 border-rose-200 shadow-inner' 
                    : 'bg-white border-gray-50 hover:border-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedResource?.id === res.id ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {res.type === 'Cluster' ? <Layers size={16} /> : <Server size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{res.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{res.provider} • {res.region}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4">
             <div className="p-3 bg-amber-500 text-white rounded-2xl h-fit shadow-lg shadow-amber-200"><AlertTriangle size={24} /></div>
             <div>
                <h4 className="text-sm font-bold text-amber-800">Operational Warning</h4>
                <p className="text-[11px] text-amber-700/80 leading-relaxed mt-1">
                  Chaos missions simulate real failures. Ensure your production workloads have 
                  proper replication and auto-scaling before engaging high-intensity experiments.
                </p>
             </div>
          </div>
        </div>

        {/* Experiment Config */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
              {!selectedResource ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                   <Search size={48} className="text-slate-200 mb-4" />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Target Selection...</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                   <div>
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Available Chaos Missions</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {(selectedResource.type === 'Cluster' ? experiments.k8s : experiments.vm).map(exp => (
                          <div 
                            key={exp.id}
                            onClick={() => setSelectedExperiment(exp)}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all text-left ${
                              selectedExperiment?.id === exp.id 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                              : 'bg-white border-gray-100 hover:border-indigo-300'
                            }`}
                          >
                             <div className="flex justify-between items-start mb-3">
                               <p className="text-sm font-bold">{exp.name}</p>
                               <div className={`p-1.5 rounded-lg ${selectedExperiment?.id === exp.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                                  <Zap size={14} className={selectedExperiment?.id === exp.id ? 'text-emerald-400' : 'text-slate-400'} />
                               </div>
                             </div>
                             <p className={`text-[10px] leading-relaxed ${selectedExperiment?.id === exp.id ? 'text-slate-400' : 'text-gray-400'}`}>
                               {exp.description}
                             </p>
                          </div>
                        ))}
                     </div>
                   </div>

                   {selectedExperiment?.id === 'pod_kill' && (
                     <div className="animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Victim Pod</label>
                        <select 
                          value={selectedPod}
                          onChange={(e) => setSelectedPod(e.target.value)}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono outline-none focus:ring-2 focus:ring-rose-500/20"
                        >
                          <option value="">Select a pod from telemetry...</option>
                          {pods.map(p => (
                            <option key={p.metadata.uid} value={p.metadata.name}>{p.metadata.namespace} / {p.metadata.name}</option>
                          ))}
                        </select>
                     </div>
                   )}

                   <div className="pt-8 mt-auto border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">AI-Strategic Monitoring Active</span>
                      </div>
                      <button
                        onClick={handleInject}
                        disabled={isInjecting || !selectedExperiment || (selectedExperiment.id === 'pod_kill' && !selectedPod)}
                        className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 flex items-center gap-3 disabled:opacity-50"
                      >
                        {isInjecting ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                        {isInjecting ? 'Executing Mission...' : 'Engage Chaos'}
                      </button>
                   </div>
                </div>
              )}
           </div>

           {/* Mission Logs */}
           <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl p-8 overflow-hidden flex flex-col h-[300px]">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Terminal size={14} className="text-rose-500" />
                   Chaos Mission Logstream
                </h3>
                <span className="text-[9px] text-slate-600 font-mono">ENCRYPTED TACTICAL FEED</span>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2 custom-scrollbar pr-4">
                 {logs.length === 0 ? (
                   <p className="text-slate-600 italic">No active missions in current session orbit.</p>
                 ) : logs.map((log, i) => (
                   <p key={i} className={log.includes('✅') ? 'text-emerald-400' : log.includes('❌') ? 'text-rose-400' : 'text-slate-400'}>
                     {log}
                   </p>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChaosCommand;
