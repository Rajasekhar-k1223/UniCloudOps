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
        <div className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Tactical Alerts
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tight flex items-center gap-1"
              >
                <Check size={12} /> Acknowledge All
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Bell size={32} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No active alerts detected</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  className={clsx(
                    "p-4 border-b border-slate-50 transition-colors group flex gap-4",
                    !n.is_read ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50"
                  )}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(n.severity)}
                  </div>
                  <div className="flex-grow space-y-1">
                    <p className={clsx(
                      "text-xs leading-relaxed",
                      !n.is_read ? "text-slate-900 font-bold" : "text-slate-600 font-medium"
                    )}>
                      {n.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(n.created_at))} ago
                    </p>
                  </div>
                  {!n.is_read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-emerald-500 transition-all"
                      title="Acknowledge"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              View Audit Log Archive
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
