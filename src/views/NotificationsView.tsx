import React, { useState, useEffect } from 'react';
import { NotificationItem, NavigationPage } from '../types';
import { subscribeNotifications, markNotificationRead } from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import { 
  BellRing, 
  CheckCheck, 
  MessageSquare, 
  BookOpen, 
  ShieldAlert, 
  Calendar, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface NotificationsViewProps {
  onNavigate: (page: NavigationPage) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsub = subscribeNotifications(userProfile.uid, setNotifications);
    return () => unsub();
  }, [userProfile?.uid]);

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await markNotificationRead(n.id);
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
    }
    if (notif.link) {
      onNavigate(notif.link as NavigationPage);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'notice': return <BellRing className="w-4 h-4 text-indigo-600" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'academic': return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'role': return <ShieldAlert className="w-4 h-4 text-emerald-600" />;
      default: return <Sparkles className="w-4 h-4 text-cyan-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white p-6 sm:p-8 shadow-xl shadow-purple-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5" />
                Live Alerts
              </span>
              <span className="text-xs text-purple-100 font-medium">
                {unreadCount} Unread
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Campus Notifications & Real-Time Alerts
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-xl mt-1">
              Direct updates from university departments, course groups, timetable changes, and system administrators.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-black text-xs rounded-2xl shadow-md transition-all shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-purple-700" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <BellRing className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-800">All caught up!</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You have no notifications right now. When campus notices, timetable revisions, or messages arrive, they appear here instantly.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-3.5 cursor-pointer transition-all ${
                !notif.isRead 
                  ? 'bg-purple-50/50 hover:bg-purple-50/80 border-l-4 border-l-purple-600' 
                  : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-2">
                    {new Date(notif.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {notif.link && (
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-1 hover:text-purple-600" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
