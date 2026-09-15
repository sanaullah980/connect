import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Shield, 
  Sparkles, 
  LogIn,
  GraduationCap,
  Calendar,
  Layers,
  LayoutDashboard,
  BellRing,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Search,
  User as UserIcon,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { NavigationPage } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';

interface NavbarProps {
  currentPage: NavigationPage;
  onOpenMobileMenu: () => void;
  onNavigate: (page: NavigationPage) => void;
  onOpenAuthModal?: () => void;
  unreadNotificationsCount?: number;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onOpenMobileMenu,
  onNavigate,
  onOpenAuthModal,
  unreadNotificationsCount,
  unreadCount
}) => {
  const { currentUser, userProfile, isOwner } = useAuth();
  const effectiveUnread = unreadNotificationsCount ?? unreadCount ?? 0;

  // Live campus clock
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPageInfo = (page: NavigationPage) => {
    switch (page) {
      case 'dashboard':
        return {
          title: 'Campus Dashboard',
          subtitle: 'Live Academic Overview & Real-Time Pulse',
          icon: LayoutDashboard,
          color: 'text-blue-600 bg-blue-50 border-blue-200/80',
        };
      case 'notices':
        return {
          title: 'Official Announcements',
          subtitle: 'Verified Campus Notices & Priority Bulletins',
          icon: BellRing,
          color: 'text-amber-600 bg-amber-50 border-amber-200/80',
        };
      case 'timetable':
        return {
          title: 'Weekly Academic Schedule',
          subtitle: 'Course Timetable, Lecture Halls & Faculty Times',
          icon: CalendarDays,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
        };
      case 'materials':
        return {
          title: 'Study Materials Library',
          subtitle: 'Course Syllabi, Lecture Slides & Reference Notes',
          icon: BookOpen,
          color: 'text-purple-600 bg-purple-50 border-purple-200/80',
        };
      case 'groups':
        return {
          title: 'Subject Groups & Real-Time Chat',
          subtitle: 'Collaborative Class Channels & Instant Study Rooms',
          icon: MessageSquare,
          color: 'text-sky-600 bg-sky-50 border-sky-200/80',
        };
      case 'lostfound':
        return {
          title: 'Campus Lost & Found',
          subtitle: 'Community Bulletin for Missing & Recovered Items',
          icon: Search,
          color: 'text-orange-600 bg-orange-50 border-orange-200/80',
        };
      case 'notifications':
        return {
          title: 'Campus Notifications',
          subtitle: 'Alerts, Mentions, Course Updates & Reminders',
          icon: Bell,
          color: 'text-purple-600 bg-purple-50 border-purple-200/80',
        };
      case 'profile':
        return {
          title: 'Academic Profile',
          subtitle: 'Verified Identity, Roles & Enrolled Courses',
          icon: UserIcon,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
        };
      case 'admin':
      case 'owner-admin':
        return {
          title: 'Owner Admin Command Center',
          subtitle: 'Proprietary Role Delegation & User Authority Management',
          icon: ShieldCheck,
          color: 'text-purple-600 bg-purple-50 border-purple-200/80',
        };
      default:
        return {
          title: 'Connect Campus',
          subtitle: 'University Multi-User Platform',
          icon: GraduationCap,
          color: 'text-blue-600 bg-blue-50 border-blue-200/80',
        };
    }
  };

  const pageInfo = getPageInfo(currentPage);
  const PageIcon = pageInfo.icon;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle + Page Header */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-mobile-menu-toggle"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl border hidden sm:flex items-center justify-center shrink-0 ${pageInfo.color}`}>
              <PageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight truncate">
                  {pageInfo.title}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block truncate">
                {pageInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Campus Time, Notifications, User Chip */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Campus Time Pill */}
          {timeString && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeString}</span>
            </div>
          )}

          {/* Real-time Notifications Bell */}
          <button
            id="btn-navbar-notifications"
            onClick={() => onNavigate('notifications')}
            className={`relative p-2 rounded-xl transition-all border ${
              effectiveUnread > 0
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {effectiveUnread > 0 && (
              <span
                id="navbar-unread-badge"
                className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black rounded-full ring-2 ring-white shadow-xs"
              >
                {effectiveUnread > 9 ? '9+' : effectiveUnread}
              </span>
            )}
          </button>

          {/* User Role info / Sign In */}
          {currentUser ? (
            <div 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/40 hover:from-slate-100 hover:to-indigo-100/50 border border-slate-200/80 cursor-pointer transition-all shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="font-bold text-slate-800 block leading-tight truncate max-w-[110px]">
                  {userProfile?.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 truncate block max-w-[110px]">
                  @{userProfile?.username || 'user'}
                </span>
              </div>
              {isOwner && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs">
                  <Shield className="w-2.5 h-2.5" />
                  Owner
                </span>
              )}
            </div>
          ) : (
            <button
              id="btn-navbar-signin"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-500/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
