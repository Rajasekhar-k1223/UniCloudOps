import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Server, 
  Cpu, 
  Database, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Globe, 
  ShieldCheck,
  TrendingDown,
  ExternalLink,
  Loader2
} from 'lucide-react';

const ProvisionCompute = () => {
  const [pricingProfiles, setPricingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricingRes, accountsRes] = await Promise.all([
        api.get('/billing/compare-compute'),
        api.get('/cloud-accounts/')
      ]);
      setPricingProfiles(pricingRes.data);
      setAccounts(accountsRes.data);
      if (pricingRes.data.length > 0) setSelectedProfile(pricingRes.data[0]);
    } catch (err) {
      console.error("Failed to fetch provisioning data", err);
      setErrorMessage("Unable to fetch real-time rates. Please check your cloud connections.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedProfile || !selectedProvider) return;

    const account = accounts.find(a => a.provider === selectedProvider);
    if (!account) {
        setErrorMessage(`No ${selectedProvider.toUpperCase()} account linked. Please add one first.`);
        return;
    }

    setIsDeploying(true);
    setErrorMessage('');
    
    try {
      // 1. Resolve Resources (Parallel)
      const [templatesRes, netRes, imgRes] = await Promise.all([
        api.get('/deployments/templates'),
        api.get(`/catalog/network-options?provider=${selectedProvider}`),
        api.get(`/catalog/images?provider=${selectedProvider}`)
      ]);

      // Smarter template matching: fallback to name-match or index 0
      let template = templatesRes.data.find(t => t.name.toLowerCase().includes(selectedProvider.toLowerCase()));
      if (!template) {
          template = templatesRes.data.find(t => t.name.toLowerCase().includes('generic')) || templatesRes.data[0];
      }
      
      if (!template) throw new Error(`Universal deployment template for ${selectedProvider} not found. Please contact support.`);

      // 2. Map Payload dynamically from Adapter
      const skuName = selectedProfile.details[selectedProvider]?.type || 'standard-1';
      const vpcId = netRes.data.vpcs?.[0]?.id || 'default';
      const subnetId = netRes.data.subnets?.[0]?.id || 'default';
      
      // Match image (Ubuntu is usually 'ubuntu', but fallback safely)
      const amiId = imgRes.data['ubuntu'] || Object.values(imgRes.data)[0] || 'default-image';

      const response = await api.post('/deployments/', {
        template_id: template.id,
        cloud_account_id: account.id,
        variables: {
          instance_name: `node-${selectedProvider.toLowerCase()}-${Math.floor(Math.random()*1000)}`,
          instance_type: skuName,
          instance_count: "1",
          architecture: "x86_64",
          image_id: amiId,
          vpc_id: vpcId,
          subnet_id: subnetId,
          disk_size: "20",
          tags: JSON.stringify([{ key: 'ManagedBy', value: 'UniCloudOps' }])
        }
      });

      setDeploymentStatus({
        id: response.data.id,
        status: 'pending',
        message: 'Deployment initialized. Orchestrating infrastructure...'
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || err.message || "Failed to trigger deployment");
    } finally {
      setIsDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Fetching real-time multi-cloud rates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Zap className="text-yellow-400 fill-yellow-400/20" size={36} />
          Provision Smart Compute
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          Compare real-time on-demand rates across AWS, Azure, and Google Cloud. 
          Select the most cost-effective profile and deploy instantly via optimized IaC templates.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-bounce">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="text-emerald-400" size={24} />
            Step 1: Choose Instance Profile
          </h2>
          <div className="grid gap-4">
            {(Array.isArray(pricingProfiles) ? pricingProfiles : []).map((p) => (
              <button
                key={p.tier}
                onClick={() => {
                  setSelectedProfile(p);
                  setSelectedProvider(null);
                }}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${
                  selectedProfile?.tier === p.tier 
                  ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-widest">{p.tier} Tier</h3>
                    <p className="text-sm text-slate-400">{p.specs}</p>
                  </div>
                  {selectedProfile?.tier === p.tier && (
                    <CheckCircle2 className="text-blue-400" size={24} />
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2 mt-4">
                   {Object.keys(p.rates).map(pid => (
                     <div key={pid} className="p-2 bg-slate-800/40 rounded-lg border border-slate-700/50 text-center flex flex-col justify-center">
                        <p className="text-[9px] uppercase tracking-tighter text-slate-500 mb-1 truncate">{pid}</p>
                        <p className={`text-xs font-bold tabular-nums ${typeof p.rates[pid] === 'number' && p.rates[pid] === Math.min(...Object.values(p.rates).filter(v => typeof v === 'number')) ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {typeof p.rates[pid] === 'number' ? (p.rates[pid] === 0 ? 'FREE' : `$${p.rates[pid]}/hr`) : p.rates[pid]}
                        </p>
                     </div>
                   ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            < Globe className="text-indigo-400" size={24} />
            Step 2: Select Your Preferred Cloud
          </h2>
          {selectedProfile ? (
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(selectedProfile.rates).map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                    selectedProvider === provider 
                    ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                      <img 
                        src={`https://raw.githubusercontent.com/r-spacex/unicloudops-assets/main/${provider}.png`} 
                        alt={provider}
                        className="w-8 h-8 object-contain"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=' + provider.toUpperCase() }}
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-widest text-sm">{provider}</h4>
                      <p className="text-slate-400 text-xs">{selectedProfile.details[provider]?.type || 'Standard'} • {selectedProfile.details[provider]?.region || 'default'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white italic">
                      {typeof selectedProfile.rates[provider] === 'number' ? `$${selectedProfile.rates[provider]}` : selectedProfile.rates[provider]}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Hourly Rate (USD)</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-10 opacity-30">
               <p className="text-slate-400 text-center italic">Please select an instance profile first on the left to compare specific cloud offerings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Deployment Action Section */}
      {selectedProvider && selectedProfile && (
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
           <div className="space-y-2">
             <div className="flex items-center gap-2 text-blue-400">
               <ShieldCheck size={20} />
               <span className="text-sm font-bold uppercase tracking-wider">Enterprise-Ready Infrastructure</span>
             </div>
             <h3 className="text-2xl font-bold text-white">Ready to deploy to {selectedProvider.toUpperCase()}?</h3>
             <p className="text-slate-400">Our system will use an optimized Terraform template for your selected {selectedProfile.profile} instance.</p>
           </div>
           
           <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-2xl flex items-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-blue-500/20"
           >
             {isDeploying ? (
               <>
                 <Loader2 className="animate-spin" size={24} />
                 Provisioning...
               </>
             ) : (
               <>
                 <Zap className="fill-white" size={24} />
                 Deploy Infrastructure
               </>
             )}
           </button>
        </div>
      )}

      {/* Mini Active Deployment State */}
      {deploymentStatus && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all">
          <div className="flex items-center gap-5">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-md opacity-20 group-hover:opacity-40 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Server className="text-white" size={24} />
                </div>
             </div>
             <div>
                <h4 className="text-white font-bold flex items-center gap-2">
                   Deployment #{deploymentStatus.id}
                   <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold rounded-full border border-blue-500/20">
                      {deploymentStatus.status}
                   </span>
                </h4>
                <p className="text-slate-400 text-sm">{deploymentStatus.message}</p>
             </div>
          </div>
          <a 
            href={`/deployments/${deploymentStatus.id}`} 
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </a>
        </div>
      )}
    </div>
  );
};

export default ProvisionCompute;
