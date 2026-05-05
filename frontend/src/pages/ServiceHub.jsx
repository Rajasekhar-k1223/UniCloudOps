import React, { useState, useEffect } from 'react';
import { 
  Database, HardDrive, Cpu, Zap, Box, 
  Globe, Shield, BarChart2, Activity, Search,
  ArrowRight, Plus, ExternalLink, Settings,
  Server, Layers, Cloud
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  { id: 'compute', name: 'Compute', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Virtual machines and spot instances.' },
  { id: 'storage', name: 'Storage', icon: HardDrive, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Object storage and block volumes.' },
  { id: 'database', name: 'Database', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'SQL, NoSQL, and caching engines.' },
  { id: 'serverless', name: 'Serverless', icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Functions and event-driven logic.' },
  { id: 'containers', name: 'Containers', icon: Box, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'K8s clusters and container registries.' },
  { id: 'ai_ml', name: 'AI & ML', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Model training and inference endpoints.' },
  { id: 'networking', name: 'Networking', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-50', desc: 'VPCs, CDNs, and Load Balancers.' },
];

const ServiceHub = () => {
  const [selectedCategory, setSelectedCategory] = useState('compute');
  const [registry, setRegistry] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const mappings = {};
        for (const cat of CATEGORIES) {
          try {
            const res = await api.get(`/services/registry/${cat.id}`);
            mappings[cat.id] = res.data;
          } catch (e) {
            console.warn(`Category ${cat.id} not found in registry`);
          }
        }
        setRegistry(mappings);
        setLoading(false);
      } catch (err) {
        console.error("Registry fetch failed", err);
        setLoading(false);
      }
    };

    fetchRegistry();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Universal Service Hub</h1>
          <p className="text-slate-500 font-medium">Orchestrate 200+ specialized cloud services across your global fleet.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search services (e.g. RDS, S3)..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-80 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Categories */}
        <div className="col-span-3 space-y-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left p-5 rounded-3xl transition-all flex items-center gap-4 group ${selectedCategory === cat.id ? 'bg-white shadow-xl shadow-slate-200/50 scale-[1.02]' : 'hover:bg-white/50'}`}
            >
              <div className={`p-3 rounded-2xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon size={20} />
              </div>
              <div>
                <div className={`text-sm font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {cat.name}
                </div>
                {selectedCategory === cat.id && (
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">{cat.desc}</div>
                )}
              </div>
              {selectedCategory === cat.id && <ArrowRight className="ml-auto text-blue-500" size={16} />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="col-span-9">
          <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                {CATEGORIES.find(c => c.id === selectedCategory)?.name} Solutions
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                  {Object.keys(registry[selectedCategory] || {}).length} Providers
                </span>
              </h2>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all">
                <Plus size={18} /> Provision New
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {Object.entries(registry[selectedCategory] || {}).map(([provider, service]) => (
                <div key={provider} className="group relative p-8 rounded-[32px] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center font-black text-slate-400 text-xs uppercase">
                        {provider.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          {provider === 'aws' ? 'Amazon Web Services' : 
                           provider === 'azure' ? 'Microsoft Azure' : 
                           provider === 'gcp' ? 'Google Cloud' : 'DigitalOcean'}
                        </div>
                        <div className="text-lg font-black text-slate-900 tracking-tight">{service}</div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      View Resources
                    </button>
                    <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                      Configure
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Managed Section */}
            <div className="mt-12 pt-10 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Active Controlled Deployments</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-500">
                      <Database size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">prod-db-primary</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">AWS RDS • Postgres 14 • us-east-1</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-emerald-600 uppercase">Balanced</span>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
                {/* Empty State / More rows */}
                <div className="flex items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
                  <div className="text-center">
                    <Cloud className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect more resources to manage fleet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHub;
