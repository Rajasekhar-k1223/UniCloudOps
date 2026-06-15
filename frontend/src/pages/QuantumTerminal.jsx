import React, { useState, useRef } from 'react';
import { Terminal as TerminalIcon, Sparkles, Brain, Cpu, RefreshCw, Send, Zap, Activity, Info, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const QuantumTerminal = () => {
  const [history, setHistory] = useState([
    { type: 'system', content: 'UniCloudOps Quantum Terminal [Version 8.0.1]' },
    { type: 'system', content: '(c) Sovereign AI Corp. All rights reserved.' },
    { type: 'system', content: 'Type "help" for a list of tactical commands.' }
  ]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assistance, setAssistance] = useState(null);
  const scrollRef = useRef(null);

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    const newHistory = [...history, { type: 'input', content: `$ ${cmd}` }];
    
    // Simulate output for common commands
    let output = "Command executed in background mission orbit.";
    if (cmd === 'ls') output = "deployments/  blueprints/  backups/  secret_vault/";
    if (cmd === 'top') output = "CPU: 12.4% | MEM: 3.2GB | DISK: 45% | PODS: 12 Active";
    if (cmd === 'kubectl get pods') output = "Error: from server (Forbidden): pods is forbidden: User \"mission-ctrl\" cannot list resource \"pods\" in API group \"\" in the namespace \"default\"";
    
    newHistory.push({ type: 'output', content: output });
    setHistory(newHistory);
    setInput('');

    // Trigger AI Analysis for errors or complex commands
    if (output.includes('Error') || output.includes('Forbidden') || cmd.length > 10) {
      setIsAnalyzing(true);
      try {
        const res = await api.post('/terminal/assist', { command: cmd, output: output });
        setAssistance(res.data);
      } catch (err) {
        console.error("Neural link failure:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const useSuggestedCommand = (cmd) => {
    setInput(cmd);
    setAssistance(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl"><TerminalIcon size={24} /></div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Quantum Terminal</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl font-medium">
            AI-augmented shell for tactical cloud operations. 
            Real-time troubleshooting powered by **Sovereign-AI Sidecar**.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu size={180} className="text-indigo-400" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Terminal Window */}
        <div className="lg:col-span-2 flex flex-col h-[700px] bg-black rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden relative group">
           {/* Terminal Header */}
           <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-white/5">
              <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-rose-500" />
                 <div className="w-3 h-3 rounded-full bg-amber-500" />
                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                 <Activity size={12} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link: SECURE</span>
              </div>
           </div>

           {/* Scrollable Terminal Content */}
           <div className="flex-1 overflow-y-auto p-8 font-mono text-sm custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,_rgba(15,23,42,1)_0%,_rgba(0,0,0,1)_100%)]">
              <div className="space-y-2">
                 {history.map((line, i) => (
                   <div key={i} className={line.type === 'input' ? 'text-white font-bold' : line.type === 'output' ? 'text-indigo-300' : 'text-slate-500'}>
                     {line.content}
                   </div>
                 ))}
                 <div ref={scrollRef} />
              </div>
           </div>

           {/* Input Area */}
           <form onSubmit={handleCommand} className="p-6 bg-slate-900/80 border-t border-white/10 flex gap-4 items-center">
              <span className="text-emerald-500 font-black text-lg font-mono">❯</span>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-slate-700"
                placeholder="Enter tactical command... (try 'kubectl get pods')"
              />
              <button type="submit" className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                <Send size={20} />
              </button>
           </form>
        </div>

        {/* AI Sidecar Panel */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Brain size={120} className="text-indigo-500" /></div>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                <Sparkles size={14} className="text-indigo-500" />
                Troubleshooting Sidecar
              </h3>

              {!assistance && !isAnalyzing ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <Zap size={48} className="text-slate-200 mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Command Telemetry...</p>
                 </div>
              ) : isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                   <RefreshCw className="animate-spin text-indigo-500 w-10 h-10" />
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest animate-pulse">Analyzing Neural Context...</p>
                </div>
              ) : (
                <div className="space-y-6 relative z-10 animate-in slide-in-from-right-4">
                   <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                         <Info size={14} className="text-indigo-600" />
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tactical Analysis</span>
                      </div>
                      <div className="text-xs text-indigo-900 leading-relaxed prose prose-sm prose-indigo whitespace-pre-wrap">
                         {assistance.assistance}
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick-Fix Commands</h4>
                      <div className="space-y-2">
                         {assistance.suggested_commands.map((cmd, i) => (
                           <button 
                             key={i}
                             onClick={() => useSuggestedCommand(cmd)}
                             className="w-full text-left p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
                           >
                              <span className="text-xs font-mono text-slate-600 group-hover:text-indigo-600">{cmd}</span>
                              <Zap size={12} className="text-slate-300 group-hover:text-indigo-400" />
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex gap-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl h-fit shadow-lg shadow-emerald-500/10"><Activity size={24} /></div>
              <div>
                 <h4 className="text-sm font-bold text-white">Quantum Link Stability</h4>
                 <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                   Telemetry is synchronized with 2ms latency across the Sovereign Mesh. AI analysis occurs in isolated secure enclaves.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumTerminal;
