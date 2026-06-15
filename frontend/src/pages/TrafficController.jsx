import React, { useState, useEffect } from 'react';
import { Ship, Zap, Activity, Globe, RefreshCw, Sliders, AlertCircle, CheckCircle2, ArrowRightLeft, Shield } from 'lucide-react';
import api from '../services/api';
import HolographicGlobe from '../components/intelligence/HolographicGlobe';

const TrafficController = () => {
  const [traffic, setTraffic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWarping, setIsWarping] = useState(false);
  const [targetProvider, setTargetProvider] = useState('aws');
  const [targetWeight, setTargetWeight] = useState(50);

  const fetchTrafficStatus = async () => {
    try {
      const res = await api.get('/traffic/status');
      setTraffic(res.data);
    } catch (err) {
      console.error("Warp Link Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficStatus();
  }, []);

  const handleWarp = async () => {
    setIsWarping(true);
    try {
      const res = await api.post('/traffic/shift', { 
        provider: targetProvider, 
        weight: parseInt(targetWeight) 
      });
      setTraffic(res.data);
      alert(res.data.message);
    } catch (err) {
      alert("Warp Aborted: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsWarping(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
       <RefreshCw className="animate-spin text-indigo-500 w-12 h-12" />
       <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Synchronizing_Global_Warp...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-[#020617] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl"><Ship size={24} /></div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Global Warp Controller</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl font-medium italic leading-relaxed">
            Inter-cloud traffic orchestration layer. Dynamically shift global mission weights between AWS, Azure, and OCI based on neural performance metrics.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><ArrowRightLeft size={180} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Global Warp Controls */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden h-fit">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Sliders size={14} className="text-indigo-500" />
                Warp Configuration
              </h3>

              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Target Vector</label>
                    <div className="grid grid-cols-3 gap-3">
                       {['aws', 'azure', 'oci'].map(p => (
                         <button 
                           key={p}
                           onClick={() => setTargetProvider(p)}
                           className={`py-3 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${
                             targetProvider === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                           }`}
                         >
                            {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mission Weight</label>
                       <span className="text-xl font-black text-indigo-600">{targetWeight}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase">
                       <span>Minimum Reach</span>
                       <span>Absolute Dominance</span>
                    </div>
                 </div>

                 <button 
                   onClick={handleWarp}
                   disabled={isWarping}
                   className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                    {isWarping ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                    {isWarping ? 'Engaging Warp...' : 'Initiate Global Warp'}
                 </button>
              </div>
           </div>

           <div className="bg-[#020617] p-8 rounded-[3rem] border border-white/5 flex gap-5">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl h-fit border border-indigo-500/20"><Shield size={24} /></div>
              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-wider">Neural Stability Guaranteed</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed mt-2 font-medium">
                    Traffic shifting is performed using weighted Round Robin and DNS TTL propagation for zero-downtime mission transitions.
                 </p>
              </div>
           </div>
        </div>

        {/* Center: Holographic Visualization */}
        <div className="lg:col-span-2 bg-[#020617] rounded-[3rem] border-2 border-white/5 shadow-2xl h-[650px] relative flex items-center justify-center overflow-hidden">
           <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-start pointer-events-none">
              <div>
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-2">Real-Time Distribution</h3>
                 <div className="flex gap-6 mt-4">
                    {Object.entries(traffic.distribution).map(([p, w]) => (
                       <div key={p} className="space-y-1">
                          <p className="text-[8px] font-black text-slate-500 uppercase">{p}</p>
                          <p className="text-lg font-black text-white">{w}%</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                 {Object.entries(traffic.health).map(([p, h]) => (
                   <div key={p} className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase">{p} Status</span>
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${h === 'optimal' ? 'bg-emerald-500 shadow-emerald-500' : 'bg-amber-500 shadow-amber-500'}`} />
                   </div>
                 ))}
              </div>
           </div>

           {/* 🌎 The Visualization Globe 🌎 */}
           <HolographicGlobe nodes={[
              { id: 1, label: 'AWS Fleet', color: '#10b981' },
              { id: 2, label: 'Azure Mesh', color: '#3b82f6' },
              { id: 3, label: 'OCI Cluster', color: '#8b5cf6' }
           ]} />

           {/* Pulse Data Arcs */}
           <div className="absolute bottom-0 inset-x-0 p-12 flex justify-center">
              <div className="flex gap-12 items-center bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl">
                 <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Global Latency</p>
                    <p className="text-sm font-black text-indigo-400">14.2ms</p>
                 </div>
                 <div className="w-px h-8 bg-white/10" />
                 <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Packet Loss</p>
                    <p className="text-sm font-black text-emerald-400">0.002%</p>
                 </div>
                 <div className="w-px h-8 bg-white/10" />
                 <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Warp Readiness</p>
                    <p className="text-sm font-black text-white">OPTIMAL</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficController;
