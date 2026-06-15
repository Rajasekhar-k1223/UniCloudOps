import React, { useState } from 'react';
import { Brain, Sparkles, Code, Play, RefreshCw, Layers, ShieldCheck, Terminal, Save, Trash2, HelpCircle } from 'lucide-react';
import api from '../services/api';

const MissionArchitect = () => {
  const [prompt, setPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [missionName, setMissionName] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState([]);

  React.useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/cloud-accounts');
        setAccounts(res.data);
        if (res.data.length > 0) setSelectedAccount(res.data[0].id);
      } catch (err) {
        console.error("Link failure:", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleSynthesize = async () => {
    if (!prompt.trim()) return;
    setIsSynthesizing(true);
    setBlueprint(null);
    try {
      const res = await api.post('/blueprint/generate', { prompt });
      setBlueprint(res.data.hcl);
    } catch (err) {
      alert("Synthesis Failure: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleDeploy = async () => {
    if (!blueprint || !missionName || !selectedAccount) {
      alert("Mission incomplete: Name, Account, and Blueprints required.");
      return;
    }
    
    setIsDeploying(true);
    try {
      // 1. Create Template
      const templateRes = await api.post('/provision/templates', {
        name: `${missionName} - AI Mission`,
        description: `AI-Synthesized blueprint from: ${prompt.substring(0, 50)}...`,
        iac_type: 'terraform',
        content: blueprint
      });
      
      // 2. Launch Deployment
      await api.post('/provision/deploy', {
        template_id: templateRes.data.id,
        cloud_account_id: selectedAccount,
        project_id: 1, // Default project
        variables: {}
      });
      
      alert("Mission Launch Successful. Interstellar provision sequence initiated.");
      setBlueprint(null);
      setPrompt('');
      setMissionName('');
    } catch (err) {
      alert("Deployment Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"><Brain size={24} /></div>
            <h1 className="text-3xl font-black text-white">Mission Architect</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            Synthesize enterprise-grade infrastructure from natural language requirements. 
            Powered by **Sovereign-AI (Gemini 1.5 Pro)**.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={180} className="text-emerald-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-500" />
              Specify Mission Requirements
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Synthesize a high-availability EKS cluster on AWS with 3 worker nodes, an RDS instance, and a private VPC with proper security group lockdown.'"
              className="w-full h-48 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none font-medium text-slate-700 leading-relaxed transition-all"
            />
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing || !prompt}
              className="mt-4 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {isSynthesizing ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isSynthesizing ? 'Synthesizing Architecture...' : 'Engage AI Synthesis'}
            </button>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 flex gap-4">
             <div className="p-3 bg-emerald-500 text-white rounded-2xl h-fit shadow-lg shadow-emerald-200"><ShieldCheck size={24} /></div>
             <div>
                <h4 className="text-sm font-bold text-emerald-800">Sovereign Compliance Layer</h4>
                <p className="text-xs text-emerald-600/80 leading-relaxed mt-1">
                  All synthesized blueprints automatically include UniCloudOps security guardrails, 
                  encrypted storage defaults, and audited tagging standards.
                </p>
             </div>
          </div>
        </div>

        {/* Blueprint Preview Panel */}
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px]">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <div className="flex items-center gap-3">
              <Code size={18} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthesized Blueprint (HCL)</span>
            </div>
            {blueprint && (
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition"><Save size={16} /></button>
                <button onClick={() => setBlueprint(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-rose-400 transition"><Trash2 size={16} /></button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-8 font-mono text-sm custom-scrollbar">
            {!blueprint ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Terminal size={48} className="text-indigo-400" />
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Awaiting AI Synthesis Sequence...</p>
              </div>
            ) : (
              <pre className="text-indigo-300 leading-relaxed whitespace-pre-wrap">{blueprint}</pre>
            )}
          </div>

          {blueprint && (
            <div className="p-8 bg-black/40 border-t border-white/5 space-y-4 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mission Name</label>
                  <input 
                    type="text" 
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    placeholder="e.g. Omega-Cluster"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Orbit (Cloud Account)</label>
                  <select 
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.provider.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleDeploy}
                disabled={isDeploying || !missionName}
                className="w-full py-4 bg-emerald-500 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isDeploying ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                {isDeploying ? 'Launching Mission...' : 'Deploy Authorized Blueprint'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionArchitect;
