import React, { useState, useEffect } from 'react';
import { Play, Copy, CheckCircle, AlertTriangle, Clock, RefreshCw, Trash2 } from 'lucide-react';
import api from '../services/api';

const Deployments = () => {
  const [templates, setTemplates] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isLaunchingBatch, setIsLaunchingBatch] = useState(false);

  const [activeDeploymentId, setActiveDeploymentId] = useState(null);
  const [activeLogs, setActiveLogs] = useState("");
  const [selectedDeploymentIds, setSelectedDeploymentIds] = useState([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchDeployments, 5000); // refresh deploy status
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let logInterval;
    if (isConsoleOpen && activeDeploymentId) {
      logInterval = setInterval(async () => {
        try {
          const res = await api.get(`/deployments/${activeDeploymentId}/logs`);
          setActiveLogs(res.data.logs);
          if (res.data.status !== 'running') {
            clearInterval(logInterval);
            fetchDeployments(); // refresh main list
          }
        } catch (e) {
          console.error("Log fetch failed", e);
        }
      }, 1500);
    }
    return () => clearInterval(logInterval);
  }, [isConsoleOpen, activeDeploymentId]);

  const fetchData = async () => {
    try {
      const [tRes, dRes, aRes] = await Promise.all([
        api.get('/deployments/templates'),
        api.get('/deployments'),
        api.get('/cloud-accounts/')
      ]);
      setTemplates(tRes.data);
      setDeployments(dRes.data);
      setAccounts(aRes.data);
      
      if (aRes.data.length > 0) setSelectedAccountIds([aRes.data[0].id]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeployments = async () => {
    try {
      const dRes = await api.get('/deployments');
      setDeployments(dRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTemplate = (id) => {
    setSelectedTemplateIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleAccount = (id) => {
    setSelectedAccountIds(prev => 
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const selectAllTemplates = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(templates.map(t => t.id));
    }
  };

  const toggleDeployment = (id) => {
    setSelectedDeploymentIds(prev => 
      prev.includes(id) ? prev.filter(did => did !== id) : [...prev, id]
    );
  };

  const selectAllDeployments = () => {
    if (selectedDeploymentIds.length === deployments.length) {
      setSelectedDeploymentIds([]);
    } else {
      setSelectedDeploymentIds(deployments.map(d => d.id));
    }
  };

  const triggerDeployment = async () => {
    if (selectedTemplateIds.length === 0 || selectedAccountIds.length === 0) 
      return alert("Select at least one blueprint and at least one target cloud account.");
    
    setIsLaunchingBatch(true);
    let firstDeployId = null;
    const totalMissions = selectedTemplateIds.length * selectedAccountIds.length;
    
    try {
      // Parallel Cluster Insemination: Loop through clouds THEN templates
      for (const aid of selectedAccountIds) {
        for (const tid of selectedTemplateIds) {
          const res = await api.post('/deployments', {
            template_id: parseInt(tid),
            cloud_account_id: parseInt(aid)
          });
          if (!firstDeployId && res.data && res.data.id) firstDeployId = res.data.id;
        }
      }
      
      fetchDeployments();
      setSelectedTemplateIds([]); // Clear after launch
      
      if (firstDeployId) {
        openConsole(firstDeployId);
      }
      alert(`Successfully launched ${totalMissions} missions across ${selectedAccountIds.length} cloud regions in parallel.`);
    } catch (e) {
      alert("Error starting multi-cloud batch deployment");
    } finally {
      setIsLaunchingBatch(false);
    }
  };

  const handleBatchRedeploy = async () => {
    if (selectedDeploymentIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to re-trigger ${selectedDeploymentIds.length} missions?`)) return;
    
    try {
      for (const id of selectedDeploymentIds) {
        await api.post(`/deployments/${id}/redeploy`);
      }
      fetchDeployments();
      setSelectedDeploymentIds([]);
      alert(`Re-deployment initiated for ${selectedDeploymentIds.length} missions.`);
    } catch (e) {
      alert("Error initiating batch redeploy");
    }
  };

  const handleCleanupCache = async () => {
    if (!window.confirm("This will remove all unused Docker images and containers from the host. Continue?")) return;
    setIsCleaning(true);
    try {
      const res = await api.post('/deployments/cleanup-cache');
      if (res.data.status === 'success') {
        const mb = ((res.data.containers_reclaimed + res.data.images_reclaimed) / (1024 * 1024)).toFixed(2);
        alert(`Docker cache cleaned successfully! Reclaimed ${mb} MB.`);
      } else {
        alert(`Cleanup failed: ${res.data.message || 'Unknown error'}`);
      }
    } catch (e) {
      alert("Error triggering Docker cleanup");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDecommission = async (deploymentId) => {
    if (!window.confirm("🚨 INDUSTRIAL RADIOLOGICAL ALERT: This will trigger a mission-level destruction sequence (Terraform Destroy). All cloud resources associated with this mission will be PERMANENTLY deleted. Proceed?")) return;
    
    try {
      await api.delete(`/deployments/${deploymentId}`);
      alert("Mission destruction sequence initiated. Monitor logs for decommissioning progress.");
      fetchDeployments();
    } catch (e) {
      alert("Decommissioning request failed: Inspect system logs for forensic details.");
    }
  };

  const handleScrub = async (deploymentId) => {
    if (!window.confirm("Standard Housekeeping: Permanent removal of this mission record from the sovereign ledger. Cloud resources will NOT be affected. Proceed?")) return;
    
    try {
      await api.delete(`/deployments/${deploymentId}/scrub`);
      setDeployments(prev => prev.filter(d => d.id !== deploymentId));
      setSelectedDeploymentIds(prev => prev.filter(id => id !== deploymentId));
    } catch (e) {
      alert("Ledger scrub failed: Active missions cannot be removed from history.");
    }
  };

  const handleBatchScrub = async () => {
    if (selectedDeploymentIds.length === 0) return;
    if (!window.confirm(`Mass Housekeeping: Scrub ${selectedDeploymentIds.length} mission records from the ledger? (Cloud resources unaffected)`)) return;
    
    try {
      const res = await api.post('/deployments/bulk-scrub', { ids: selectedDeploymentIds });
      alert(`Success: ${res.data.scrubbed_total} records cleared. ${res.data.errors.length} skipped.`);
      fetchDeployments();
      setSelectedDeploymentIds([]);
    } catch (e) {
      alert("Mass scrubbing engine failed. Check security permissions.");
    }
  };

  const handleBatchDecommission = async () => {
    if (selectedDeploymentIds.length === 0) return;
    if (!window.confirm(`🚨 BATCH DESTRUCTION ALERT: You are about to trigger terraform-level termination for ${selectedDeploymentIds.length} missions. All cloud resources will be PERMANENTLY deleted. Proceed?`)) return;
    
    try {
      for (const id of selectedDeploymentIds) {
        await api.delete(`/deployments/${id}`);
      }
      fetchDeployments();
      setSelectedDeploymentIds([]);
      alert(`Bulk decommissioning sequence initiated for ${selectedDeploymentIds.length} missions.`);
    } catch (e) {
      alert("Error initiating batch decommission. Check logs.");
    }
  };

  const openConsole = (id) => {
    setActiveDeploymentId(id);
    setActiveLogs("Establishing secure link to provisioning engine...\n");
    setIsConsoleOpen(true);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'decommissioning': return <Trash2 className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'decommissioned': return <Trash2 className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Mission Control</h1>
          <p className="text-gray-500">Universal IaC orchestration for 10-cloud global fleet.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={selectAllTemplates}
            className="flex items-center justify-center py-2 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm"
          >
            {selectedTemplateIds.length === templates.length && templates.length > 0 ? "Deselect All Blueprints" : "Select All Blueprints"}
          </button>
          <button 
            onClick={handleCleanupCache}
            className="flex items-center justify-center py-2 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm"
            disabled={isCleaning}
          >
            {isCleaning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2 text-rose-500" />}
            {isCleaning ? "Scrubbing..." : "Prune Container Cache"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Blueprint Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 shadow-xl border-emerald-500/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">Provisioning Engine</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Cloud Boundaries ({selectedAccountIds.length} selected)</label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {accounts.map(acc => (
                    <div 
                      key={acc.id} 
                      onClick={() => toggleAccount(acc.id)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${selectedAccountIds.includes(acc.id) ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selectedAccountIds.includes(acc.id) ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'}`}>
                          {selectedAccountIds.includes(acc.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-xs font-bold text-gray-800">{acc.name}</span>
                        <span className="text-[9px] font-black uppercase text-gray-400 ml-auto">{acc.provider}</span>
                      </div>
                    </div>
                  ))}
                  {accounts.length === 0 && <p className="text-xs text-gray-400 italic">No cloud accounts available.</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IaC Mission Blueprints ({selectedTemplateIds.length} selected)</label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {templates.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => toggleTemplate(t.id)}
                      className={`p-3 rounded-lg border cursor-pointer group transition-all duration-300 ${selectedTemplateIds.includes(t.id) ? 'border-emerald-500 bg-emerald-50 shadow-md translate-x-1' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start">
                        <div className={`mt-1 mr-3 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${selectedTemplateIds.includes(t.id) ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300 group-hover:border-emerald-400'}`}>
                          {selectedTemplateIds.includes(t.id) && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-900 text-sm leading-tight">{t.name}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${t.iac_type === 'cdk' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {t.iac_type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={triggerDeployment}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-bold transition shadow-lg active:scale-95 ${selectedTemplateIds.length > 1 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} ${isLaunchingBatch ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={accounts.length === 0 || selectedTemplateIds.length === 0 || isLaunchingBatch}
                >
                  {isLaunchingBatch ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {selectedTemplateIds.length > 1 ? `Launch Batch Mission (${selectedTemplateIds.length})` : "Launch Infrastructure Mission"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Deployment Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 shadow-lg">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Live Mission Ledger ({selectedDeploymentIds.length} selected)</h2>
              <div className="flex gap-2">
                {selectedDeploymentIds.length > 0 && (
                  <>
                    <button 
                      onClick={handleBatchRedeploy}
                      className="flex items-center py-1.5 px-4 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm hover:bg-indigo-200 transition shadow-sm border border-indigo-200"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Start/Redeploy
                    </button>
                    <button 
                      onClick={handleBatchDecommission}
                      className="flex items-center py-1.5 px-4 rounded-lg bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition shadow-sm border border-rose-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Decommission Selection
                    </button>
                    <button 
                      onClick={handleBatchScrub}
                      className="flex items-center py-1.5 px-4 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition shadow-sm border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Scrub Records
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar text-nowrap">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        checked={selectedDeploymentIds.length === deployments.length && deployments.length > 0}
                        onChange={selectAllDeployments}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-bold">Mission ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-bold">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-bold">Blueprint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-bold">Execution Logs</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase font-bold">Control</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deployments.map(d => (
                    <tr 
                      key={d.id} 
                      className={`hover:bg-gray-50 transition-all duration-500 
                        ${selectedDeploymentIds.includes(d.id) ? 'bg-indigo-50/30' : ''} 
                        ${d.status === 'decommissioning' ? 'bg-amber-50/60 border-l-2 border-l-amber-500 animate-pulse-subtle' : ''}
                        ${d.status === 'decommissioned' ? 'bg-gray-50/80 grayscale opacity-40' : ''}
                        ${d.status === 'failed' ? 'bg-rose-50/20' : ''}
                      `}
                    >
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedDeploymentIds.includes(d.id)}
                          onChange={() => toggleDeployment(d.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">MISSION-{d.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(d.status)}
                          <span className="ml-2 text-sm text-gray-700 capitalize font-medium">{d.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {templates.find(t => t.id === d.template_id)?.name || 'Standard Compute'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => openConsole(d.id)}
                          className="inline-flex items-center text-emerald-600 font-mono text-xs bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition border border-emerald-200"
                        >
                          <Copy className="w-3 h-3 mr-1" /> Inspect Command
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-3">
                          {d.status !== 'decommissioned' && (
                            <button 
                              onClick={() => handleDecommission(d.id)}
                              className="p-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition-all duration-300 border border-rose-100 hover:border-rose-600 shadow-sm shadow-rose-900/5"
                              title="Terminate Mission (Destroy Resources)"
                              disabled={d.status === 'running' || d.status === 'decommissioning'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleScrub(d.id)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300 border border-gray-100 hover:border-gray-800"
                            title="Scrub Ledger Record"
                            disabled={d.status === 'running' || d.status === 'decommissioning'}
                          >
                            <span className="text-sm">✕</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {deployments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium italic">No active missions in ledger. Select a blueprint to begin.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Modal */}
      {isConsoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center">
                <div className="flex space-x-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <h3 className="text-gray-100 font-mono text-sm font-bold uppercase tracking-wider">MISSION_LOG :: MISSION-{activeDeploymentId}</h3>
              </div>
              <button 
                onClick={() => setIsConsoleOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 bg-black">
              <pre className="text-emerald-500 font-mono text-sm h-[450px] overflow-y-auto custom-scrollbar p-4 bg-black/90 whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                {activeLogs || "Awaiting telemetry stream..."}
                <div className="animate-pulse inline-block w-2.5 h-4 bg-emerald-500 ml-1" />
              </pre>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
               <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest italic flex items-center">
                 <RefreshCw className="w-3 h-3 mr-1.5 animate-spin-slow" /> STREAMS_ACTIVE : RUNNER_ID_{Math.random().toString(36).substring(7).toUpperCase()}
               </span>
               <button 
                 onClick={() => setIsConsoleOpen(false)}
                 className="px-8 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-gray-900/20"
               >
                 Close Terminal
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deployments;
