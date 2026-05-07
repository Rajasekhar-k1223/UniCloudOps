import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchTelemetery = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      setNotifications(notifsRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error("Failed to fetch notification telemetry:", err);
    }
  };

  useEffect(() => {
    fetchTelemetery();
    const interval = setInterval(fetchTelemetery, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertOctagon className="text-rose-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all group"
      >
        <Bell className={clsx("w-5 h-5", unreadCount > 0 && "animate-ring")} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-5 border-b border-slate-100/50 flex justify-between items-center bg-white/50">
            <div className="flex flex-col">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                Tactical Signal Feed
              </h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sovereign Uplink Active</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="px-3 py-1.5 bg-indigo-50 text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all uppercase tracking-tighter shadow-sm"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-300 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                   <Bell size={24} className="opacity-40" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Silence across mission sector</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  className={clsx(
                    "p-4 rounded-2xl transition-all group flex gap-4 relative overflow-hidden",
                    !n.is_read ? "bg-white shadow-md border border-slate-100" : "hover:bg-slate-50/50 border border-transparent"
                  )}
                >
                  {/* Severity Accent Bar */}
                  {!n.is_read && (
                    <div className={clsx(
                      "absolute left-0 top-0 bottom-0 w-1",
                      n.severity === 'critical' ? "bg-rose-500" : n.severity === 'warning' ? "bg-amber-500" : "bg-blue-500"
                    )} />
                  )}

                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                    n.severity === 'critical' ? "bg-rose-50 text-rose-500" : n.severity === 'warning' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                  )}>
                    {getIcon(n.severity)}
                  </div>
                  
                  <div className="flex-grow space-y-1.5">
                    <p className={clsx(
                      "text-xs leading-relaxed",
                      !n.is_read ? "text-slate-900 font-black tracking-tight" : "text-slate-500 font-medium"
                    )}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                         {formatDistanceToNow(new Date(n.created_at))} ago
                       </p>
                       {!n.is_read && <span className="w-1 h-1 rounded-full bg-indigo-400" />}
                    </div>
                  </div>

                  {!n.is_read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Acknowledge Signal"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-all flex items-center gap-2">
              <Activity size={12} /> View Mission Archives
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
