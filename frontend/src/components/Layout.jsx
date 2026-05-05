import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Cloud, Server, LogOut, Settings, Zap, Layers, FolderOpen, ShieldCheck, Box, History, ShoppingCart, Cpu, ShieldAlert, Power, Code, Globe, Lock, Target, HeartPulse, HardDrive, Ship, Github, Radio, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import NotificationCenter from "./NotificationCenter";
import ChatAssistant from "./ChatAssistant";
import clsx from 'clsx';

const Layout = () => {
  const { logout, user } = useAuth();
  const { currency, toggleCurrency, CurrencyIcon } = useCurrency();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'HQ Command Mode', href: '/command-center', icon: Globe },
    { name: 'Resources', href: '/resources', icon: Server },
    { name: 'App Marketplace', href: '/marketplace', icon: ShoppingCart },
    { name: 'Kubernetes', href: '/kubernetes', icon: Box },
    { name: 'Serverless', href: '/serverless', icon: Cpu },
    { name: 'Security Pulse', href: '/security-pulse', icon: ShieldAlert },
    { name: 'DR Command', href: '/dr', icon: Power },
    { name: 'Policy Editor', href: '/policy-editor', icon: Code },
    { name: 'Evidence Vault', href: '/evidence-vault', icon: Lock },
    { name: 'Cost Budgets', href: '/budgets', icon: Target },
    { name: 'Self-Healing', href: '/self-healing', icon: HeartPulse },
    { name: 'Sovereign Edge', href: '/edge-nodes', icon: HardDrive },
    { name: 'Global Warp', href: '/warp-command', icon: Ship },
    { name: 'Mission Plugins', href: '/plugin-hub', icon: Box },
    { name: 'GitOps Hub', href: '/gitops', icon: Github },
    { name: 'Mesh HQ', href: '/mesh-hq', icon: Radio },
    { name: 'Sentinel Apex', href: '/evolution-trace', icon: Brain },
    { name: 'Provision Studio', href: '/create-vm', icon: Zap },
    { name: 'Provision Templates', href: '/provision', icon: Settings },
    { name: 'Deployments', href: '/deployments', icon: Layers },
    { name: 'Billing Data', href: '/billing', icon: CreditCard },
    { name: 'Cloud Accounts', href: '/accounts', icon: Cloud },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Governance', href: '/governance', icon: ShieldCheck },
    { name: 'Audit Logs', href: '/audit', icon: History },
  ];

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
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
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
    </div>
  );
};

export default Layout;
