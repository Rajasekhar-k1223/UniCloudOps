import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit/logs?limit=50');
      setLogs(res.data.logs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === 'failure') return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const getActionColor = (action) => {
    const a = action?.toUpperCase();
    if (a.includes('TERMINATE') || a.includes('DELETE')) return 'text-rose-600 bg-rose-50';
    if (a.includes('LAUNCH') || a.includes('PROVISION')) return 'text-emerald-600 bg-emerald-50';
    if (a.includes('AUTH')) return 'text-indigo-600 bg-indigo-50';
    if (a.includes('REMEDIATE')) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forensic Audit Trail</h1>
          <p className="text-gray-500">Immutable mission logs tracking every strategic action and automated event.</p>
        </div>
      </div>

      <div className="glass-panel p-6 shadow-xl border-slate-200/60">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by message, user, or resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/50 outline-none"
            />
          </div>
          <select 
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/50 outline-none bg-white font-medium text-gray-600"
          >
            <option value="All">All Actions</option>
            <option value="MISSION_LAUNCH">Mission Launches</option>
            <option value="REMEDIATE">Remediations</option>
            <option value="AUTH">Authentication</option>
          </select>
        </div>

        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sovereign Ledger</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Strategic Actor</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tactical Action</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operational Detail</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">Processing forensic chain...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2 group cursor-help">
                          <div className={`w-2 h-2 rounded-full ${log.integrity_hash ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-tighter ${log.integrity_hash ? 'text-emerald-700' : 'text-rose-700'}`}>
                             {log.integrity_hash ? 'Verified Chain' : 'Legacy Record'}
                          </span>
                       </div>
                       <p className="text-[9px] text-gray-300 font-mono truncate w-32 mt-1">{log.integrity_hash || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-bold text-gray-800">{log.user_email}</span>
                       <p className="text-[10px] text-gray-400 font-mono leading-none">{log.ip_address}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getActionColor(log.action)}`}>
                         {log.action}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm text-gray-600 line-clamp-1">{log.message}</p>
                       <p className="text-[10px] text-gray-400 italic font-medium">{log.resource_type} • ID: {log.resource_id || 'N/A'}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No logs captured within current trajectory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
