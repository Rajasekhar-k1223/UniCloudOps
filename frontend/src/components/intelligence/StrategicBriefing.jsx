import React, { useState, useEffect } from 'react';
import { Shield, Brain, Zap, AlertCircle, CheckCircle, RefreshCw, ChevronRight, Terminal } from 'lucide-react';
import api from '../../services/api';

const StrategicBriefing = ({ projectId }) => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  const fetchBriefing = async () => {
    setLoading(true);
    setError(null);
    setBriefing(null);
    setDisplayedText('');
    setIndex(0);
    try {
      const res = await api.get(`/intelligence/briefing/${projectId}`);
      if (res.data.status === 'success' || res.data.status === 'simulated') {
        setBriefing(res.data);
      } else {
        setError('Failed to synthesize briefing context.');
      }
    } catch (err) {
      console.error(err);
      setError('Sovereign Link Interrupted. Check API status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchBriefing();
    }
  }, [projectId]);

  useEffect(() => {
    if (briefing && briefing.briefing && index < briefing.briefing.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + briefing.briefing[index]);
        setIndex(prev => prev + 1);
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [briefing, index]);

  if (!projectId) return null;

  return (
    <div className="bg-[#0D1117] border border-[#00E5FF]/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.05)] flex flex-col h-full">
      <div className="p-4 border-b border-[#00E5FF]/10 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Sovereign Advisor</h2>
            <p className="text-[8px] text-cyan-500/60 font-bold uppercase tracking-tighter">Gemini Strategic Synthesis</p>
          </div>
        </div>
        <button 
          onClick={fetchBriefing}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-white/5 transition text-cyan-500 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex-1 p-6 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-cyan-500 animate-[loading_2s_infinite]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 animate-pulse">Aggregating Multi-Cloud Telemetry...</p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertCircle className="text-rose-500 mb-2" size={24} />
            <p className="text-rose-400 font-bold uppercase text-[10px]">{error}</p>
          </div>
        ) : (
          <div className="space-y-4 whitespace-pre-wrap">
            {displayedText ? (
              <div className="text-cyan-50/90 briefing-content">
                {displayedText}
                {index < (briefing?.briefing?.length || 0) && (
                  <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 animate-pulse" />
                )}
              </div>
            ) : !loading && (
              <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
                <Terminal size={32} className="mb-3" />
                <p className="uppercase tracking-widest text-[9px] font-black">Awaiting Mission Context</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-black/20 border-t border-[#00E5FF]/10">
        <div className="flex justify-between items-center text-[8px] font-black text-cyan-500/40 uppercase tracking-[0.2em]">
          <span>Integrity: VERIFIED</span>
          <span>Model: {briefing?.model || 'SYNTH-V1'}</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .briefing-content h3 {
          color: #00E5FF;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
          border-left: 2px solid #00E5FF;
          padding-left: 0.5rem;
        }
        .briefing-content strong {
          color: #fff;
          font-weight: 900;
        }
      `}} />
    </div>
  );
};

export default StrategicBriefing;
