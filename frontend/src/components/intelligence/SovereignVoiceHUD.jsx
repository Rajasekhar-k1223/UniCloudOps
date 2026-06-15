import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, RefreshCw, Sparkles, Brain, Zap, Command, Activity, Radio } from 'lucide-react';
import api from '../../services/api';

const SovereignVoiceHUD = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
        
        if (event.results[current].isFinal) {
          handleCommand(resultTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setResponse(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleCommand = async (text) => {
    setIsProcessing(true);
    try {
      const res = await api.post('/voice/command', { transcript: text });
      setResponse(res.data);
      
      // Speak back the response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(res.data.message);
        utterance.pitch = 0.8;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Neural Voice link failure:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-50 group">
      {/* Expanded Voice UI */}
      {(isListening || transcript || response) && (
        <div className="absolute bottom-20 right-0 w-80 bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
           {/* Scanline Effect */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
           
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Radio size={14} className={isListening ? "text-rose-500 animate-pulse" : "text-slate-500"} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sovereign Neural Audio</span>
                 </div>
                 {isProcessing && <RefreshCw size={14} className="animate-spin text-indigo-400" />}
              </div>

              <div className="min-h-[60px] flex items-center justify-center text-center">
                 {isListening ? (
                   <p className="text-sm font-black text-white italic">"{transcript || 'Awaiting Command...'}"</p>
                 ) : response ? (
                    <div className="space-y-4">
                       <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center justify-center gap-2">
                          <Zap size={14} className="fill-current" /> {response.action}
                       </p>
                       <p className="text-sm font-black text-white">{response.message}</p>
                    </div>
                 ) : (
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Neural Link Synchronized</p>
                 )}
              </div>

              {/* Spectral Visualizer Simulation */}
              <div className="flex justify-center items-end gap-1 h-8 px-4">
                 {[1,2,3,4,5,6,7,8,9,10].map(i => (
                   <div 
                     key={i} 
                     className={`w-1 bg-indigo-500 transition-all duration-300 rounded-full ${isListening ? 'animate-pulse' : 'opacity-20'}`} 
                     style={{ height: isListening ? `${Math.random() * 100}%` : '10%' }}
                   />
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Primary Mic Toggle */}
      <button 
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 relative ${
          isListening 
            ? 'bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)] rotate-90' 
            : 'bg-slate-900 border border-white/10 hover:border-indigo-500/50 shadow-2xl'
        }`}
      >
        {isListening ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-indigo-400" />}
        
        {/* Pulsing Ring when listening */}
        {isListening && (
           <div className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-20" />
        )}
      </button>

      {/* Tooltip */}
      {!isListening && (
        <div className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Initiate Mission Audio Link
        </div>
      )}
    </div>
  );
};

export default SovereignVoiceHUD;
