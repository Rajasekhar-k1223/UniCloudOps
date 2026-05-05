import React, { useState, useEffect } from 'react';
import { Github, GitBranch, GitCommit, GitMerge, RefreshCw, Layers, CheckCircle, Clock, Zap, ExternalLink, Box, X } from 'lucide-react';
import api from '../services/api';

const GitOps = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/cloud-accounts/', {
        provider: 'github',
        name: repoName,
        credentials: { github_pat: githubPat }
      });
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setRepoName('');
        setGithubPat('');
      }, 2000);
    } catch (err) {
      alert("Failed to connect repository: " + (err.response?.data?.detail || "Network Error"));
    } finally {
      setLoading(false);
    }
  };

  const [missions, setMissions] = useState([
    { id: 1, repo: 'UniOS-Core', branch: 'main', commit: '8f2d3a1', author: 'rajasekhar', status: 'completed', time: '2 mins ago' },
    { id: 2, repo: 'Terraform-Blueprints', branch: 'staging', commit: '1c4e9v2', author: 'rajasekhar', status: 'in-progress', time: 'Currently running' },
    { id: 3, repo: 'Microservice-Catalog', branch: 'master', commit: '4d8f1x4', author: 'automation', status: 'pending', time: 'Queued' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CI/CD Mission Hub</h1>
          <p className="text-gray-500 text-sm">Track real-time infrastructure missions triggered by code lifecycle events and GitOps protocols.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-lg active:scale-95"
        >
          <Github size={18} />
          Connect Repository
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Overview */}
        <div className="lg:col-span-2 space-y-6">
           {missions.map((m) => (
             <div key={m.id} className="glass-panel p-6 bg-white border border-slate-100 hover:border-indigo-300 transition-all group">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-indigo-50 transition-all">
                         <GitBranch size={20} className="text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-800">{m.repo}</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.branch} • {m.author}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                        m.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                        m.status === 'in-progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                      }`}>
                         {m.status === 'in-progress' && <RefreshCw size={10} className="animate-spin" />}
                         {m.status}
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">{m.time}</p>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <GitCommit size={14} className="text-slate-400" />
                      <span className="text-xs font-mono font-bold text-slate-600">COMMIT {m.commit}</span>
                   </div>
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"><CheckCircle size={10} className="text-white" /></div>
                      <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center"><Layers size={10} className="text-white" /></div>
                      <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${m.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                         <Box size={10} className="text-white" />
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                         <Clock size={12} className="text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-400">Duration: 1m 42s</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Zap size={12} className="text-indigo-400" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase">MISSION ACTIVE</span>
                      </div>
                   </div>
                   <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                      Mission Console <ExternalLink size={10} />
                   </button>
                </div>
             </div>
           ))}
        </div>

        {/* GitOps Hardening Stats */}
        <div className="space-y-6">
           <div className="glass-panel p-6 bg-slate-900 text-white h-fit">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Autonomous GitOps Flux</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold text-slate-300">Deployment Velocity</span>
                       <span className="text-xl font-black text-emerald-400">+12%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[78%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold text-slate-300">Config Consistency</span>
                       <span className="text-xl font-black text-indigo-400">99.8%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-[99%]" />
                    </div>
                 </div>
              </div>
              <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-[10px] text-slate-400">
                 $ uni-mission gitops-sync --active-only<br/>
                 &gt; Synchronizing State: US-EAST-1<br/>
                 &gt; Commit Hash: 8f2d3a1 Verified.<br/>
                 &gt; Infrastructure Drift: 0.00%<br/>
                 <span className="text-emerald-500">&gt; ALL MISSIONS NOMINAL</span>
              </div>
           </div>

           <div className="glass-panel p-6 bg-indigo-600 text-white">
              <GitMerge className="w-8 h-8 opacity-20 mb-4" />
              <h3 className="font-bold text-lg mb-2">Event-Driven Sovereign HQ</h3>
              <p className="text-xs text-indigo-100 leading-relaxed mb-6">
                 Your UniOS HQ is now listening for global commit events. Infrastructure is no longer a static asset; it is a living extension of your codebase.
              </p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition">
                 View Webhook Logs
              </button>
           </div>
        </div>
      </div>

      {/* Connect Repository Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Connect Repository</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GitOps Mission Initialization</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleConnect} className="p-8 space-y-6">
              {success ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="text-emerald-500 w-8 h-8" />
                  </div>
                  <h4 className="font-black text-slate-900 uppercase">Mission Linked!</h4>
                  <p className="text-xs text-slate-500 font-bold">Redirecting to GitOps Hub...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Repository Alias</label>
                      <input 
                        type="text" 
                        required 
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        placeholder="e.g. Production Blueprints"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">GitHub PAT (Access Token)</label>
                      <input 
                        type="password" 
                        required 
                        value={githubPat}
                        onChange={(e) => setGithubPat(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                    Authorize & Connect
                  </button>
                  <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                    Your token is stored in the UniCloud Secure Vault via AES-256 GCM.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitOps;
