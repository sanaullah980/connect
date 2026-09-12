import React from 'react';
import { 
  LayoutDashboard, 
  BellRing, 
  CalendarDays, 
  BookOpen, 
  MessageSquare, 
  Search, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  LogIn,
  Sparkles,
  X,
  GraduationCap,
  ChevronRight,
  School
} from 'lucide-react';
import { NavigationPage } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadNotificationsCount?: number;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  unreadNotificationsCount,
  unreadCount,
}) => {
  const { currentUser, userProfile, isOwner, logout } = useAuth();
  const effectiveUnread = unreadNotificationsCount ?? unreadCount ?? 0;

  const handleNav = (page: NavigationPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      page: 'dashboard' as NavigationPage,
      gradient: 'from-blue-600 to-indigo-600',
      activeBg: 'bg-blue-50 text-blue-800 border-blue-200/80',
      activeIconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white',
      inactiveIconColor: 'text-blue-600 bg-blue-50/80 group-hover:bg-blue-100',
      badgeText: null,
    },
    {
      id: 'notices',
      label: 'Official Notices',
      icon: BellRing,
      page: 'notices' as NavigationPage,
      gradient: 'from-amber-500 to-rose-500',
      activeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
      activeIconBg: 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white',
      inactiveIconColor: 'text-amber-600 bg-amber-50/80 group-hover:bg-amber-100',
      badgeText: 'Live',
      badgeClass: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarDays,
      page: 'timetable' as NavigationPage,
      gradient: 'from-emerald-500 to-teal-600',
      activeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
      activeIconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white',
      inactiveIconColor: 'text-emerald-600 bg-emerald-50/80 group-hover:bg-emerald-100',
      badgeText: 'Weekly',
      badgeClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'materials',
      label: 'Study Materials',
      icon: BookOpen,
      page: 'materials' as NavigationPage,
      gradient: 'from-purple-500 to-indigo-600',
      activeBg: 'bg-purple-50 text-purple-900 border-purple-200/80',
      activeIconBg: 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white',
      inactiveIconColor: 'text-purple-600 bg-purple-50/80 group-hover:bg-purple-100',
      badgeText: null,
    },
    {
      id: 'groups',
      label: 'Subject Groups & Chat',
      icon: MessageSquare,
      page: 'groups' as NavigationPage,
      gradient: 'from-sky-500 to-blue-600',
      activeBg: 'bg-sky-50 text-sky-900 border-sky-200/80',
      activeIconBg: 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white',
      inactiveIconColor: 'text-sky-600 bg-sky-50/80 group-hover:bg-sky-100',
      badgeText: 'Chat',
      badgeClass: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'lostfound',
      label: 'Campus Lost & Found',
      icon: Search,
      page: 'lostfound' as NavigationPage,
      gradient: 'from-orange-500 to-amber-600',
      activeBg: 'bg-orange-50 text-orange-900 border-orange-200/80',
      activeIconBg: 'bg-gradient-to-tr from-orange-500 to-amber-600 text-white',
      inactiveIconColor: 'text-orange-600 bg-orange-50/80 group-hover:bg-orange-100',
      badgeText: null,
    },
    {
      id: 'profile',
      label: 'Academic Profile',
      icon: UserIcon,
      page: 'profile' as NavigationPage,
      gradient: 'from-slate-600 to-indigo-600',
      activeBg: 'bg-slate-100 text-slate-900 border-slate-300/80',
      activeIconBg: 'bg-gradient-to-tr from-slate-700 to-indigo-700 text-white',
      inactiveIconColor: 'text-slate-600 bg-slate-100 group-hover:bg-slate-200',
      badgeText: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-sm">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100/90 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/40 to-purple-50/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/25 ring-2 ring-indigo-100">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Connect Campus
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              University Portal
            </p>
          </div>
        </div>
        {/* Close button for mobile drawer */}
        <button
          id="btn-close-mobile-drawer"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Campus Modules</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
            {navItems.length}
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => handleNav(item.page)}
              className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border ${
                isActive
                  ? `${item.activeBg} shadow-xs font-bold`
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? `${item.activeIconBg} shadow-xs`
                      : item.inactiveIconColor
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="tracking-tight">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badgeText && !isActive && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeClass}`}>
                    {item.badgeText}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-current opacity-70" />
                )}
              </div>
            </button>
          );
        })}

        {/* Notifications Shortcut */}
        <button
          id="nav-link-notifications"
          onClick={() => handleNav('notifications')}
          className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border ${
            currentPage === 'notifications'
              ? 'bg-purple-50 text-purple-900 border-purple-200/80 shadow-xs font-bold'
              : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                currentPage === 'notifications'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs'
                  : 'text-purple-600 bg-purple-50/80 group-hover:bg-purple-100'
              }`}
            >
              <BellRing className="w-4 h-4" />
            </div>
            <span>Notifications</span>
          </div>

          {effectiveUnread > 0 ? (
            <span
              id="sidebar-unread-badge"
              className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-xs"
            >
              {effectiveUnread}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">All clear</span>
          )}
        </button>

        {/* Permanent Owner Admin Section - Strictly shown only to owner */}
        {isOwner && (
          <div className="pt-4 mt-3 border-t border-slate-100">
            <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-purple-700">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Owner Console
              </span>
              <span className="text-[9px] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                Owner
              </span>
            </div>
            <button
              id="nav-link-owner-admin"
              onClick={() => handleNav('admin')}
              className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 border ${
                currentPage === 'admin' || currentPage === 'owner-admin'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/20 border-transparent'
                  : 'border-purple-200/70 text-purple-900 bg-gradient-to-r from-purple-50/90 to-indigo-50/80 hover:from-purple-100 hover:to-indigo-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentPage === 'admin' || currentPage === 'owner-admin'
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Owner Admin Hub</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-75" />
            </button>
          </div>
        )}
      </div>

      {/* User Card at bottom */}
      <div className="p-3.5 border-t border-slate-100/90 bg-gradient-to-b from-white to-slate-50">
        {currentUser ? (
          <div className="space-y-2.5">
            <div 
              onClick={() => handleNav('profile')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200/80 cursor-pointer transition-all"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm ring-2 ring-white">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate leading-snug">
                  {userProfile?.name || currentUser.displayName || 'Campus User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  @{userProfile?.username || 'user'}
                </p>
              </div>
            </div>

            {/* Active Roles Preview */}
            {userProfile?.roles && userProfile.roles.length > 0 && (
              <div className="flex flex-wrap gap-1 px-1">
                {userProfile.roles.slice(0, 2).map((r) => (
                  <RoleBadge key={r} role={r} size="sm" />
                ))}
                {userProfile.roles.length > 2 && (
                  <span className="text-[10px] text-slate-400 font-semibold self-center">
                    +{userProfile.roles.length - 2}
                  </span>
                )}
              </div>
            )}

            <button
              id="btn-sidebar-logout"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200/60 hover:border-red-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-2 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">Join our university network</p>
            <button
              id="btn-sidebar-login"
              onClick={() => handleNav('dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Responsive Overlay) */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
