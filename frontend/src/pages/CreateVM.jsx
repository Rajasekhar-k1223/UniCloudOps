import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  MonitorCog, Server, HardDrive, Globe, ShieldCheck, Tag,
  ChevronRight, ChevronDown, CheckCircle2, AlertCircle, Zap,
  RefreshCw, Terminal, Plus, X, Network, KeyRound,
  Cpu, MemoryStick, ArrowRight, Layers, CircleCheck
} from 'lucide-react';

// ─── OS Catalogue ─────────────────────────────────────────────────────────────
const OS_TYPES = [
  {
    id: 'ubuntu', label: 'Ubuntu', color: '#E95420',
    versions: ['Ubuntu 24.04 LTS (Noble)', 'Ubuntu 22.04 LTS (Jammy)', 'Ubuntu 20.04 LTS (Focal)', 'Ubuntu 18.04 LTS (Bionic)'],
    arch: ['x86_64', 'ARM64']
  },
  {
    id: 'windows', label: 'Windows', color: '#0078D4',
    versions: ['Windows Server 2022', 'Windows Server 2019', 'Windows Server 2016'],
    arch: ['x86_64']
  },
  {
    id: 'debian', label: 'Debian', color: '#A80030',
    versions: ['Debian 12 (Bookworm)', 'Debian 11 (Bullseye)', 'Debian 10 (Buster)'],
    arch: ['x86_64', 'ARM64']
  },
  {
    id: 'centos', label: 'CentOS', color: '#932279',
    versions: ['CentOS Stream 9', 'CentOS Stream 8', 'CentOS 7'],
    arch: ['x86_64']
  },
  {
    id: 'rhel', label: 'Red Hat', color: '#EE0000',
    versions: ['RHEL 9.3', 'RHEL 8.9', 'RHEL 7.9'],
    arch: ['x86_64']
  },
  {
    id: 'amazon', label: 'Amazon Linux', color: '#FF9900',
    versions: ['Amazon Linux 2023', 'Amazon Linux 2'],
    arch: ['x86_64', 'ARM64']
  }
];

// ─── Instance Sizes ───────────────────────────────────────────────────────────
const INSTANCE_FAMILIES = [
  { id: 'micro',    label: 'Micro',        cpu: 1,  ram: 1,   desc: 'Dev & Testing' },
  { id: 'small',    label: 'Small',         cpu: 2,  ram: 4,   desc: 'Light Workloads' },
  { id: 'medium',   label: 'Medium',        cpu: 4,  ram: 8,   desc: 'General Purpose' },
  { id: 'large',    label: 'Large',         cpu: 8,  ram: 16,  desc: 'Production' },
  { id: 'xlarge',   label: 'XL',            cpu: 16, ram: 32,  desc: 'Compute Heavy' },
  { id: 'xxlarge',  label: '2XL',           cpu: 32, ram: 64,  desc: 'High Performance' },
  { id: 'custom',   label: 'Custom',        cpu: null, ram: null, desc: 'Manual Spec' }
];

const RAM_OPTIONS = [1, 2, 4, 8, 16, 32, 64, 128, 256];
const CPU_OPTIONS = [1, 2, 4, 8, 16, 32, 64];

// ─── Price Engine ─────────────────────────────────────────────────────────────
const pricingTable = (cpu, ram, os) => {
  const base = (cpu * 0.018 + ram * 0.006);
  const winMult = os === 'windows' ? 1.6 : 1;
  return {
    aws:  { name: 'AWS',           sku: `t3.${cpu <= 2 ? 'small' : cpu <= 8 ? 'medium' : 'large'}`,   hourly: (base * 1.00 * winMult).toFixed(4) },
    azure:{ name: 'Azure',         sku: `Standard_B${cpu}ms`,  hourly: (base * 1.08 * winMult).toFixed(4) },
    gcp:  { name: 'Google Cloud',  sku: `e2-standard-${cpu}`,  hourly: (base * 0.94 * winMult).toFixed(4) },
    contabo: { name: 'Contabo',    sku: `VPS S-${cpu}C-${ram}G`, hourly: (base * 0.55).toFixed(4) },
    linode: { name: 'Linode/Akamai', sku: `g6-standard-${cpu}`, hourly: (base * 0.60 * winMult).toFixed(4) },
    digitalocean: { name: 'DigitalOcean', sku: `s-${cpu}vcpu-${ram}gb`, hourly: (base * 0.65 * winMult).toFixed(4) },
    oracle: { name: 'Oracle Cloud', sku: `VM.Standard3.Flex`, hourly: (base * 0.50 * winMult).toFixed(4) },
    vultr: { name: 'Vultr',        sku: `vc2-${cpu}c-${ram}gb`, hourly: (base * 0.62 * winMult).toFixed(4) },
  };
};

// ─── Step Indicator ──────────────────────────────────────────────────────────
const steps = ['OS Type', 'OS Version', 'Hardware', 'Options', 'Cloud & Price'];

const StepBadge = ({ num, label, current, done }) => (
  <div className={`flex items-center gap-2 ${num < steps.length ? 'flex-1' : ''}`}>
    <div className={`flex items-center gap-2 shrink-0 ${current ? 'opacity-100' : done ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
        done ? 'bg-emerald-500 text-white' : current ? 'bg-slate-900 text-white ring-4 ring-slate-100' : 'bg-slate-100 text-slate-400'
      }`}>
        {done ? <CircleCheck size={14} /> : num}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-widest hidden sm:block ${current ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
    </div>
    {num < steps.length && <div className={`flex-1 h-px mx-3 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const CreateVM = () => {
  const [step, setStep] = useState(1);

  // Step 1
  const [osType, setOsType] = useState(null);
  // Step 2
  const [osVersion, setOsVersion] = useState('');
  const [arch, setArch] = useState('x86_64');
  // Step 3
  const [instanceFamily, setInstanceFamily] = useState(null);
  const [cpu, setCpu] = useState(2);
  const [ram, setRam] = useState(4);
  const [storage, setStorage] = useState(40);
  const [storageType, setStorageType] = useState('SSD');
  // Step 4
  const [vmName, setVmName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [keyPair, setKeyPair] = useState('');
  const [securityGroup, setSecurityGroup] = useState('default');
  const [userData, setUserData] = useState('');
  const [tags, setTags] = useState([]);
  const [tagKey, setTagKey] = useState('');
  const [tagVal, setTagVal] = useState('');
  // Step 5
  const [selectedCloud, setSelectedCloud] = useState('aws');
  const [launchMode, setLaunchMode] = useState('iac'); // 'iac' or 'direct'

  // API data
  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [regions, setRegions] = useState([]);

  // Launch state
  const [launching, setLaunching] = useState(false);
  const [deployment, setDeployment] = useState(null);
  const [pollTimer, setPollTimer] = useState(null);

  useEffect(() => {
    api.get('/cloud-accounts/').then(r => setAccounts(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/deployments/templates').then(r => setTemplates(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCloud) {
      api.get(`/catalog/regions?provider=${selectedCloud}`)
        .then(r => { setRegions(Array.isArray(r.data) ? r.data : []); if (r.data?.[0]) setRegion(r.data[0].id); })
        .catch(() => {});
    }
  }, [selectedCloud]);

  // Poll deployment status
  useEffect(() => {
    if (deployment && !['success', 'failed', 'complete'].includes(deployment.status)) {
      const t = setInterval(async () => {
        try {
          const r = await api.get(`/deployments/${deployment.id}`);
          setDeployment(prev => ({ ...prev, status: r.data.status, logs: r.data.logs }));
        } catch {}
      }, 4000);
      setPollTimer(t);
      return () => clearInterval(t);
    }
    if (pollTimer && ['success', 'failed', 'complete'].includes(deployment?.status)) {
      clearInterval(pollTimer);
    }
  }, [deployment?.status]);

  const selectedOs = OS_TYPES.find(o => o.id === osType);
  const prices = cpu && ram ? pricingTable(cpu, ram, osType) : null;
  const priceEntries = prices ? Object.entries(prices) : [];
  const selectedPrice = prices?.[selectedCloud];

  const pickFamily = (fam) => {
    setInstanceFamily(fam.id);
    if (fam.id !== 'custom') { setCpu(fam.cpu); setRam(fam.ram); }
  };

  const addTag = () => {
    if (tagKey && tagVal) { setTags(p => [...p, { key: tagKey, value: tagVal }]); setTagKey(''); setTagVal(''); }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      const account = accounts.find(a => a.provider === selectedCloud);
      
      if (launchMode === 'direct') {
        const payload = {
          name: vmName || `uni-${osType}-${cpu}c-${Date.now()}`,
          provider: selectedCloud,
          region: region,
          instance_type: selectedPrice?.sku || 'auto',
          image_id: osVersion, // In a real system, map version to AMI/Image ID
          account_id: account?.id,
          user_data: userData
        };
        const res = await api.post('/resources/', payload);
        alert(`Direct API Launch Initiated: ${res.data.message}`);
        setDeployment({ id: res.data.external_id, status: 'complete', logs: 'Direct API provisioning successful. Resource discovery initiated.' });
        return;
      }

      // 🛡️ Mission Blueprint Matching (IaC Mode) 🛡️
      const template = templates.find(t => 
        t.name.toLowerCase().includes(selectedCloud) && 
        (osType === 'windows' ? t.name.toLowerCase().includes('windows') : !t.name.toLowerCase().includes('windows'))
      ) || templates.find(t => t.name.toLowerCase().includes(selectedCloud)) || templates[0];

      if (!template) throw new Error(`No deployment blueprint found for ${selectedCloud}. Please configure IaC blueprints.`);
      
      const payload = {
        template_id: template.id,
        cloud_account_id: account?.id || null,
        variables: {
          instance_name: vmName || `uni-${osType}-${cpu}c-${Date.now()}`,
          os_type: osType,
          os_version: osVersion,
          architecture: arch,
          instance_type: selectedPrice?.sku || 'auto',
          cpu: String(cpu),
          ram: String(ram),
          disk_size: String(storage),
          disk_type: storageType,
          region: region,
          key_pair: keyPair || 'none',
          security_group: securityGroup,
          user_data: userData,
          tags: JSON.stringify(tags),
          provider: selectedCloud,
        }
      };
      const res = await api.post('/deployments/', payload);
      setDeployment({ id: res.data.id, status: res.data.status || 'pending', logs: '' });
    } catch (err) {
      alert('Launch failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLaunching(false);
    }
  };

  const canAdvance = () => {
    if (step === 1) return !!osType;
    if (step === 2) return !!osVersion;
    if (step === 3) return !!(cpu && ram && storage);
    if (step === 4) return true;
    if (step === 5) return !!selectedCloud;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Server size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Virtual Machine</h1>
              <p className="text-sm text-slate-500">Multi-cloud provisioning wizard</p>
            </div>
          </div>

          {/* Step bar */}
          <div className="flex items-center mt-6 bg-white border border-slate-200 rounded-2xl p-4">
            {steps.map((label, i) => (
              <StepBadge key={i} num={i + 1} label={label} current={step === i + 1} done={step > i + 1} />
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* STEP 1 — OS TYPE                                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
              <MonitorCog size={16} className="text-slate-400" /> Choose Operating System Family
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {OS_TYPES.map(os => (
                <button
                  key={os.id}
                  onClick={() => { setOsType(os.id); setOsVersion(''); setArch(os.arch[0]); }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${
                    osType === os.id
                      ? 'border-slate-900 bg-slate-900'
                      : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {/* colour accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: os.color }} />
                  <div className="mt-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl font-black"
                      style={{ backgroundColor: os.color + '20', color: os.color }}
                    >
                      {os.label.charAt(0)}
                    </div>
                    <p className={`font-black text-base ${osType === os.id ? 'text-white' : 'text-slate-800'}`}>{os.label}</p>
                    <p className={`text-[11px] font-medium mt-1 ${osType === os.id ? 'text-slate-400' : 'text-slate-400'}`}>
                      {os.versions.length} versions available
                    </p>
                  </div>
                  {osType === os.id && (
                    <CheckCircle2 size={16} className="absolute top-4 right-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* STEP 2 — OS VERSION                                                */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === 2 && selectedOs && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <Layers size={16} className="text-slate-400" /> Select {selectedOs.label} Version
            </h2>

            {/* Architecture */}
            {selectedOs.arch.length > 1 && (
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Architecture</p>
                <div className="flex gap-3">
                  {selectedOs.arch.map(a => (
                    <button
                      key={a}
                      onClick={() => setArch(a)}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                        arch === a ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                      }`}
                    >{a}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Version list */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Available Versions</p>
              <div className="space-y-2">
                {selectedOs.versions.map(v => (
                  <label
                    key={v}
                    onClick={() => setOsVersion(v)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      osVersion === v
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      osVersion === v ? 'border-slate-900' : 'border-slate-300'
                    }`}>
                      {osVersion === v && <div className="w-2 h-2 bg-slate-900 rounded-full" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${osVersion === v ? 'text-slate-900' : 'text-slate-700'}`}>{v}</p>
                      <p className="text-[11px] text-slate-400">{arch} · {osType === 'windows' ? 'Paid License' : 'Free & Open Source'}</p>
                    </div>
                    {osVersion === v && <CheckCircle2 size={16} className="ml-auto text-emerald-500 shrink-0" />}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* STEP 3 — HARDWARE                                                  */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Instance family quick-pick */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                <Cpu size={16} className="text-slate-400" /> Instance Size
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {INSTANCE_FAMILIES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => pickFamily(f)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      instanceFamily === f.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <p className={`font-black text-sm ${instanceFamily === f.id ? 'text-white' : 'text-slate-800'}`}>{f.label}</p>
                    {f.cpu && <p className={`text-[10px] mt-1 font-medium ${instanceFamily === f.id ? 'text-slate-400' : 'text-slate-400'}`}>{f.cpu}vCPU · {f.ram}GB</p>}
                    <p className={`text-[10px] mt-0.5 font-medium ${instanceFamily === f.id ? 'text-slate-300' : 'text-slate-400'}`}>{f.desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                {/* CPU */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">vCPU Cores</p>
                    <span className="text-2xl font-black text-slate-900">{cpu}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CPU_OPTIONS.map(c => (
                      <button key={c} onClick={() => { setCpu(c); setInstanceFamily('custom'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                          cpu === c ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                {/* RAM */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Memory (GB)</p>
                    <span className="text-2xl font-black text-slate-900">{ram} GB</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RAM_OPTIONS.map(r => (
                      <button key={r} onClick={() => { setRam(r); setInstanceFamily('custom'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                          ram === r ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}>{r}GB</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                <HardDrive size={16} className="text-slate-400" /> Storage
              </h2>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Disk Size (GB)</p>
                  <input
                    type="number" min="10" max="16384" value={storage}
                    onChange={e => setStorage(parseInt(e.target.value))}
                    className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Disk Type</p>
                  <div className="flex gap-2">
                    {['SSD', 'HDD', 'NVMe'].map(t => (
                      <button key={t} onClick={() => setStorageType(t)}
                        className={`px-4 py-3 rounded-xl text-xs font-black border transition-all ${
                          storageType === t ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* STEP 4 — OPTIONS                                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Basic */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <Server size={16} className="text-slate-400" /> Basic Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Instance Name</label>
                  <input
                    value={vmName}
                    onChange={e => setVmName(e.target.value)}
                    placeholder={`my-${osType}-server`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Region</label>
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 appearance-none"
                  >
                    {regions.length > 0
                      ? regions.map(r => <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)
                      : ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'].map(r => <option key={r} value={r}>{r}</option>)
                    }
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <ShieldCheck size={16} className="text-slate-400" /> Security & Access
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">SSH Key Pair</label>
                  <select
                    value={keyPair}
                    onChange={e => setKeyPair(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 appearance-none"
                  >
                    <option value="">Proceed without key pair</option>
                    <option value="unicloud-default-key">unicloud-default-key</option>
                    <option value="custom-key">Upload Custom Key</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Security Group</label>
                  <select
                    value={securityGroup}
                    onChange={e => setSecurityGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-slate-900 appearance-none"
                  >
                    <option value="default">default (allow-all-transit)</option>
                    <option value="web">web-server (HTTP/HTTPS only)</option>
                    <option value="ssh-only">ssh-hardened (Port 22 only)</option>
                    <option value="locked">locked (outbound only)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <Tag size={16} className="text-slate-400" /> Tags <span className="text-slate-300 font-medium normal-case">(optional)</span>
              </h2>
              <div className="flex gap-3">
                <input value={tagKey} onChange={e => setTagKey(e.target.value)} placeholder="Key (e.g. Environment)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-slate-900" />
                <input value={tagVal} onChange={e => setTagVal(e.target.value)} placeholder="Value (e.g. Production)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-slate-900" />
                <button onClick={addTag} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                  <Plus size={16} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <span className="text-[11px] font-black text-slate-500">{t.key}:</span>
                      <span className="text-[11px] font-bold text-slate-800">{t.value}</span>
                      <button onClick={() => setTags(p => p.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Data */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-3">
                <Terminal size={16} className="text-slate-400" /> User Data / Cloud-Init <span className="text-slate-300 font-medium normal-case">(optional)</span>
              </h2>
              <textarea
                value={userData}
                onChange={e => setUserData(e.target.value)}
                placeholder={'#!/bin/bash\napt-get update && apt-get install nginx -y'}
                rows={5}
                className="w-full bg-slate-950 text-emerald-400 font-mono text-[12px] p-5 rounded-2xl border border-white/5 outline-none focus:border-slate-700 placeholder:text-slate-700 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-2">Runs on first boot of each instance.</p>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* STEP 5 — CLOUD PRICE COMPARISON                                    */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-6">
            {/* Config summary banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OS</p>
                <p className="text-sm font-bold text-white">{osVersion}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Arch</p>
                <p className="text-sm font-bold text-white">{arch}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPU</p>
                <p className="text-sm font-bold text-white">{cpu} vCPU</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RAM</p>
                <p className="text-sm font-bold text-white">{ram} GB</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storage</p>
                <p className="text-sm font-bold text-white">{storage} GB {storageType}</p>
              </div>
              {vmName && <>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</p>
                  <p className="text-sm font-bold text-white">{vmName}</p>
                </div>
              </>}
            </div>

            {/* Price table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setLaunchMode('iac')} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${launchMode === 'iac' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    IaC Mission (Stability)
                  </button>
                  <button 
                    onClick={() => setLaunchMode('direct')} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${launchMode === 'direct' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    API Direct (Velocity)
                  </button>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select cloud to deploy on →</span>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-8">Select</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Instance Type</th>
                      <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hourly</th>
                      <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly (~730h)</th>
                      <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly</th>
                      <th className="text-center px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Linked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceEntries
                      .sort((a, b) => parseFloat(a[1].hourly) - parseFloat(b[1].hourly))
                      .map(([providerId, p], idx) => {
                        const isSelected = selectedCloud === providerId;
                        const isCheapest = idx === 0;
                        const hasAccount = accounts.some(a => a.provider === providerId);
                        const monthly = (parseFloat(p.hourly) * 730).toFixed(2);
                        const yearly = (parseFloat(p.hourly) * 8760).toFixed(2);
                        return (
                          <tr
                            key={providerId}
                            onClick={() => setSelectedCloud(providerId)}
                            className={`border-t border-slate-50 cursor-pointer transition-all ${
                              isSelected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-6 py-5">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                {isCheapest && (
                                  <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Best Price</span>
                                )}
                                <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`font-mono text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{p.sku}</span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className={`font-black text-sm tabular-nums ${isSelected ? 'text-white' : 'text-slate-800'}`}>${p.hourly}</span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className={`font-bold text-sm tabular-nums ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`}>${monthly}</span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className={`font-medium text-xs tabular-nums ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>${yearly}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {hasAccount
                                ? <span className="text-emerald-500 font-bold text-[11px] flex items-center justify-center gap-1"><CheckCircle2 size={12} /> Linked</span>
                                : <span className="text-amber-500 font-bold text-[11px]">Not linked</span>
                              }
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>

              {!accounts.some(a => a.provider === selectedCloud) && (
                <div className="mx-6 mb-6 mt-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-xs font-bold text-amber-700">
                    ⚠ No <strong>{prices?.[selectedCloud]?.name}</strong> account linked in your project. The VM will be simulated / queued. <a href="/accounts" className="underline">Link an account →</a>
                  </p>
                </div>
              )}

              {templates.length > 0 && !templates.find(t => t.provider === selectedCloud || t.name.toLowerCase().includes(selectedCloud)) && (
                <div className="mx-6 mb-6 mt-2 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                  <p className="text-xs font-bold text-rose-700">
                    🚫 No specific mission blueprint found for <strong>{selectedCloud}</strong>. 
                    Deployment might fail due to provider mismatch. <a href="/marketplace" className="underline">Visit Marketplace →</a>
                  </p>
                </div>
              )}
            </div>

            {/* Deployment Panel */}
            {!deployment ? (
              <div className="bg-slate-900 rounded-3xl p-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Estimated Cost</p>
                    <p className="text-3xl font-black text-white">
                      ${selectedPrice ? (parseFloat(selectedPrice.hourly) * 730).toFixed(2) : '0.00'}
                      <span className="text-sm font-medium text-slate-400 ml-2">/ month</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{selectedPrice?.sku} · {region} · {prices?.[selectedCloud]?.name}</p>
                  </div>
                  <button
                    onClick={handleLaunch}
                    disabled={launching}
                    className="flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-2xl shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {launching ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                    {launching ? 'Launching...' : 'Create VM'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-3xl p-8 border-2 transition-all ${
                deployment.status === 'success' || deployment.status === 'complete'
                  ? 'bg-emerald-950 border-emerald-700'
                  : deployment.status === 'failed'
                  ? 'bg-rose-950 border-rose-700'
                  : 'bg-slate-900 border-slate-700'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    deployment.status === 'success' || deployment.status === 'complete' ? 'bg-emerald-500' :
                    deployment.status === 'failed' ? 'bg-rose-500' : 'bg-slate-700 animate-pulse'
                  }`}>
                    {deployment.status === 'success' || deployment.status === 'complete'
                      ? <CheckCircle2 size={24} className="text-white" />
                      : deployment.status === 'failed'
                      ? <AlertCircle size={24} className="text-white" />
                      : <RefreshCw size={24} className="text-white animate-spin" />
                    }
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission ID: DEP-{deployment.id}</p>
                    <p className="text-lg font-black text-white uppercase tracking-widest">{deployment.status}</p>
                  </div>
                </div>
                {/* Log stream */}
                <div className="bg-black/40 rounded-2xl p-5 font-mono text-[11px] text-emerald-400 space-y-1 max-h-48 overflow-y-auto">
                  <p>[{new Date().toLocaleTimeString()}] Mission launched on {prices?.[selectedCloud]?.name}...</p>
                  <p>[{new Date().toLocaleTimeString()}] Instance type: {selectedPrice?.sku}</p>
                  <p>[{new Date().toLocaleTimeString()}] OS Image: {osVersion}</p>
                  <p>[{new Date().toLocaleTimeString()}] Region: {region}</p>
                  {(deployment.logs || '').split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className="text-slate-400">{line}</p>
                  ))}
                  {!['success', 'failed', 'complete'].includes(deployment.status) && (
                    <p className="animate-pulse">Waiting for provider confirmation...</p>
                  )}
                </div>

                {/* Success Actions */}
                {(deployment.status === 'success' || deployment.status === 'complete') && (
                  <div className="mt-6 flex flex-wrap gap-3 animate-in zoom-in duration-500">
                    <a
                      href="/resources"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/40"
                    >
                      <HardDrive size={16} />
                      Go to Mission Resources HQ
                    </a>
                    <a
                      href="/deployments"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                    >
                      <Layers size={16} />
                      View Deployment Ledger
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          {step < 5 ? (
            <button
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CreateVM;
