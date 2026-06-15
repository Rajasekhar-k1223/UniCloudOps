import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Cloud, Server, LogOut, Settings, Zap, Layers, FolderOpen, ShieldCheck, Box, History, ShoppingCart, Cpu, ShieldAlert, Power, Code, Globe, Lock, Target, HeartPulse, HardDrive, Ship, Github, Radio, Brain, Hammer, Database, Fingerprint, FileText, Terminal, DollarSign, BarChart3, Gavel, Heart, Ghost, Activity, RefreshCw, ChevronDown, ChevronRight, Compass, Puzzle, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import NotificationCenter from "./NotificationCenter";
import ChatAssistant from "./ChatAssistant";
import MissionPulseHUD from './layout/MissionPulseHUD';
import SovereignVoiceHUD from './intelligence/SovereignVoiceHUD';
import clsx from 'clsx';

const navigationGroups = [
  {
    title: 'Core Command',
    icon: Globe,
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Commander Briefing', href: '/briefing', icon: Brain },
      { name: 'HQ Command Mode', href: '/command-center', icon: Globe },
      { name: 'Strategic War Room', href: '/war-room', icon: Target },
      { name: 'Neural Advisor', href: '/advisor', icon: Brain },
      { name: 'Immersive Command', href: '/immersive', icon: Compass },
      { name: 'Warp Command', href: '/warp-command', icon: Zap },
    ]
  },
  {
    title: 'Intelligence & Quantum',
    icon: Brain,
    items: [
      { name: 'Quantum Predictor', href: '/predictor', icon: BarChart3 },
      { name: 'Sentinel Apex', href: '/evolution-trace', icon: Brain },
      { name: 'Neural Bio-Link', href: '/biolink', icon: Fingerprint },
      { name: 'Neural Identity', href: '/neural-id', icon: Fingerprint },
      { name: 'Quantum Terminal', href: '/terminal', icon: Terminal },
      { name: 'Knowledge Mesh', href: '/knowledge', icon: Brain },
      { name: 'Quantum Bridge', href: '/quantum-bridge', icon: Share2 },
      { name: 'Data Singularity', href: '/data-singularity', icon: Database },
    ]
  },
  {
    title: 'Mission Engineering',
    icon: Hammer,
    items: [
      { name: 'Mission Architect', href: '/mission-architect', icon: Brain },
      { name: 'Mission Forge', href: '/forge', icon: Hammer },
      { name: 'Macro-Forge', href: '/macro-forge', icon: Hammer },
      { name: 'Blueprint Studio', href: '/blueprint-studio', icon: Code },
      { name: 'Provision Studio', href: '/create-vm', icon: Zap },
      { name: 'Provision Templates', href: '/provision', icon: Settings },
      { name: 'Plugin Hub', href: '/plugin-hub', icon: Puzzle },
    ]
  },
  {
    title: 'Fleet Operations',
    icon: Server,
    items: [
      { name: 'Resources', href: '/resources', icon: Server },
      { name: 'Cloud Accounts', href: '/accounts', icon: Cloud },
      { name: 'Projects', href: '/projects', icon: FolderOpen },
      { name: 'Deployments', href: '/deployments', icon: Layers },
      { name: 'K8s Fleet Command', href: '/kubernetes', icon: Box },
      { name: 'Serverless Ops', href: '/serverless', icon: Cpu },
      { name: 'GitOps Hub', href: '/gitops', icon: Github },
      { name: 'Service Hub', href: '/services', icon: Server },
    ]
  },
  {
    title: 'Sovereign Security',
    icon: ShieldCheck,
    items: [
      { name: 'Security Pulse', href: '/security-pulse', icon: ShieldAlert },
      { name: 'Compliance Vault', href: '/compliance', icon: ShieldCheck },
      { name: 'Evidence Vault', href: '/evidence-vault', icon: Lock },
      { name: 'Threat Hunting', href: '/threats', icon: ShieldAlert },
      { name: 'Active Defense', href: '/defense', icon: ShieldAlert },
      { name: 'AI Policy Guard', href: '/policy-guard', icon: ShieldCheck },
      { name: 'Sovereign Registry', href: '/registry', icon: Database },
      { name: 'Quantum Shield', href: '/quantum-shield', icon: Lock },
    ]
  },
  {
    title: 'FinOps & Economy',
    icon: DollarSign,
    items: [
      { name: 'Billing Data', href: '/billing', icon: CreditCard },
      { name: 'FinOps Broker', href: '/finops', icon: ShoppingCart },
      { name: 'Cost Budgets', href: '/budgets', icon: Target },
      { name: 'Resource Auction', href: '/auction', icon: DollarSign },
      { name: 'Economic Empire', href: '/economy', icon: DollarSign },
      { name: 'Rightsizing Optimizer', href: '/rightsizing', icon: ShieldAlert },
    ]
  },
  {
    title: 'Global Connectivity',
    icon: Globe,
    items: [
      { name: 'Space Mesh', href: '/space-mesh', icon: Globe },
      { name: 'Galactic Mesh', href: '/galactic-mesh', icon: Globe },
      { name: 'Global Warp', href: '/traffic', icon: Ship },
      { name: 'Mesh HQ', href: '/mesh-hq', icon: Radio },
      { name: 'Sovereign Edge', href: '/edge-nodes', icon: HardDrive },
    ]
  },
  {
    title: 'Governance & Continuity',
    icon: Gavel,
    items: [
      { name: 'Galactic Governance', href: '/galactic-governance', icon: Gavel },
      { name: 'Governance', href: '/governance', icon: ShieldCheck },
      { name: 'Audit Logs', href: '/audit', icon: History },
      { name: 'Chaos Command', href: '/chaos', icon: Zap },
      { name: 'DR Command', href: '/dr', icon: Power },
      { name: 'Mission Continuity', href: '/continuity', icon: Power },
      { name: 'Self-Healing', href: '/self-healing', icon: HeartPulse },
      { name: 'System Health', href: '/health', icon: Activity },
      { name: 'Temporal Command', href: '/temporal', icon: History },
      { name: 'Self-Evolving Engine', href: '/evolution', icon: RefreshCw },
      { name: 'Sentient Healing', href: '/sentient-healing', icon: Heart },
      { name: 'Post-Mortems', href: '/post-mortems', icon: History },
      { name: 'Multi-Versal Redundancy', href: '/multiversal', icon: Layers },
    ]
  }
];

const Layout = () => {
  const { logout, user } = useAuth();
  const { currency, toggleCurrency, CurrencyIcon } = useCurrency();
  const location = useLocation();
  const [openGroups, setOpenGroups] = React.useState(() => {
    const initial = {
      'Core Command': false,
      'Intelligence & Quantum': false,
      'Mission Engineering': false,
      'Fleet Operations': false,
      'Sovereign Security': false,
      'FinOps & Economy': false,
      'Global Connectivity': false,
      'Governance & Continuity': false,
    };
    
    // Auto-open the group that contains the current path
    const activeGroup = navigationGroups.find(group => 
      group.items.some(item => location.pathname === item.href)
    );
    if (activeGroup) initial[activeGroup.title] = true;
    else initial['Core Command'] = true; // Default fallback
    
    return initial;
  });

  const toggleGroup = (title) => {
    setOpenGroups(prev => {
      const newState = {};
      // Close all others
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      // Toggle the target one
      newState[title] = !prev[title];
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col h-full fixed top-0 left-0 z-50 transition-all duration-300 md:translate-x-0 -translate-x-full">
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">UniCloudOps</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-6">Mission Command v8.01</p>
        </div>
        
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 pb-10">
          <nav className="space-y-2">
            {navigationGroups.map((group) => {
              const isOpen = openGroups[group.title];
              const hasActiveChild = group.items.some(item => location.pathname === item.href);
              
              return (
                <div key={group.title} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group/header",
                      isOpen || hasActiveChild ? "bg-white/5 text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon className={clsx(
                        "w-4 h-4 transition-colors",
                        isOpen || hasActiveChild ? "text-emerald-400" : "text-slate-600"
                      )} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-left">
                        {group.title}
                      </h3>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover/header:text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/header:text-slate-400" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="space-y-1 ml-1 border-l border-slate-800/50 pl-2 animate-in slide-in-from-top-2 duration-200">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={clsx(
                              'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                          >
                            <Icon
                              className={clsx(
                                'mr-3 flex-shrink-0 h-4 w-4 transition-colors',
                                isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                              )}
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
          <div className="mb-4 flex items-center px-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700 shadow-inner">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden text-sm">
              <p className="text-slate-200 truncate font-medium">{user?.email}</p>
              <p className="text-slate-500 text-[10px] truncate uppercase tracking-tighter">{user?.role || 'Viewer'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-bold text-slate-400 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Engage Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:pl-64">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-40">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleCurrency}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              title={`Switch to ${currency === 'USD' ? 'INR' : 'USD'}`}
            >
              <CurrencyIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">{currency}</span>
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <NotificationCenter />
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
      <ChatAssistant />
      <MissionPulseHUD />
      <SovereignVoiceHUD />
    </div>
  );
};

export default Layout;
