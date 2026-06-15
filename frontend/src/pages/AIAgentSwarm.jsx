import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { Bot, Send, ShieldAlert, Check, X, ServerCrash } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const AIAgentSwarm = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchApprovals = async () => {
        try {
            const data = await apiCall(`${apiConfig.baseURL}/ai/swarm/approvals`);
            setApprovals(data);
        } catch (error) {
            console.error('Failed to fetch AI approvals', error);
        }
    };

    useEffect(() => {
        fetchApprovals();
        const interval = setInterval(fetchApprovals, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await apiCall(`${apiConfig.baseURL}/ai/swarm/chat`, {
                method: 'POST',
                body: JSON.stringify({ prompt: userMsg.content })
            });
            
            const agentMsg = {
                role: 'assistant',
                agent: response.response.agent,
                content: response.response.message
            };
            setMessages(prev => [...prev, agentMsg]);
            
            if (response.response.status === "requires_approval") {
                fetchApprovals();
            }
        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id, action) => {
        try {
            await apiCall(`${apiConfig.baseURL}/ai/swarm/approvals/${id}/action?action=${action}`, { method: 'POST' });
            fetchApprovals();
        } catch (error) {
            console.error("Failed to process approval", error);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center text-slate-800 dark:text-slate-100">
                    <Bot className="mr-3 text-purple-500" />
                    AI Agent Swarm
                </h1>
                <p className="text-slate-500 mt-1">Chat with 10 specialized agents working in tandem.</p>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Chat Section */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.length === 0 && (
                            <div className="h-full flex items-center justify-center text-slate-400 flex-col">
                                <ServerCrash size={48} className="mb-4 text-slate-300" />
                                <p>Describe an issue to the swarm to begin Auto-Remediation.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                    msg.role === 'user' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                }`}>
                                    {msg.role === 'assistant' && (
                                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                                            {msg.agent} Agent
                                        </div>
                                    )}
                                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-500 animate-pulse">
                                    The Orchestrator is analyzing the request...
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t dark:border-slate-700">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="E.g., Investigate the failing pod in the billing namespace..."
                                className="flex-1 border dark:border-slate-600 rounded-l-md px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* HITL Approvals Sidebar */}
                <div className="w-96 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-rose-200 dark:border-rose-900/50 flex flex-col">
                    <div className="p-4 border-b border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 flex items-center">
                        <ShieldAlert className="text-rose-500 mr-2" />
                        <h2 className="font-bold text-slate-800 dark:text-slate-100">Human Approvals</h2>
                        <span className="ml-auto bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-bold">{approvals.length}</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {approvals.length === 0 ? (
                            <div className="text-slate-500 text-sm text-center">No pending actions requiring approval.</div>
                        ) : (
                            approvals.map(req => (
                                <div key={req.id} className="border dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-rose-500">{req.agent_name}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                        Action: {req.action_type}
                                    </p>
                                    <div className="text-xs text-slate-500 font-mono bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-700 mb-3 break-all">
                                        {JSON.stringify(req.payload)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleApproval(req.id, "APPROVE")}
                                            className="flex-1 flex items-center justify-center bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1.5 rounded text-xs font-bold hover:bg-emerald-200"
                                        >
                                            <Check size={14} className="mr-1" /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleApproval(req.id, "REJECT")}
                                            className="flex-1 flex items-center justify-center bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-1.5 rounded text-xs font-bold hover:bg-rose-200"
                                        >
                                            <X size={14} className="mr-1" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAgentSwarm;
