import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Zap, ShieldAlert, CreditCard, ChevronRight } from 'lucide-react';
import api from '../services/api';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "I am UniOS Strategic Intelligence. How can I assist with your mission boundary?", sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = { id: Date.now(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/intelligence/ask', { query });
      const botMsg = { 
        id: Date.now() + 1, 
        text: res.data.answer, 
        sender: 'bot', 
        type: res.data.type,
        data: res.data.data 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Strategic uplink failure. Please retry.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group border border-slate-700"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse border-2 border-white" />
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[400px] h-[550px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                   <Bot className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                   <h3 className="text-sm font-bold">Strategic Intelligence</h3>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Link</span>
                   </div>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg">
                <X size={18} />
             </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                }`}>
                  {msg.text}

                  {/* Dynamic Result Data */}
                  {msg.data && msg.type === 'compliance_alert' && (
                    <div className="mt-4 space-y-2">
                       {msg.data.map((item, idx) => (
                         <div key={idx} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                            <div>
                               <p className="text-[11px] font-bold text-gray-800">{item.resource}</p>
                               <p className="text-[10px] text-rose-600 font-medium">{item.message}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}

                  {msg.data && msg.type === 'billing_insight' && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-4">
                       <CreditCard className="w-8 h-8 text-emerald-600" />
                       <div>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none mb-1">Impact Analysis</p>
                          <p className="text-lg font-bold text-gray-900">{msg.data.total_cost.toFixed(2)} Credits</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl flex gap-1">
                   {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: `${i * 0.2}s`}} />)}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about costs, compliance, or assets..."
                className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!query.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
               UniOS Neural Core v4.2
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
