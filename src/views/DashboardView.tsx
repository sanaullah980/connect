import React, { useEffect, useState } from 'react';
import { 
  Notice, 
  TimetableClass, 
  Material, 
  LostFoundItem, 
  NavigationPage 
} from '../types';
import { 
  subscribeNotices, 
  subscribeTimetable, 
  subscribeMaterials, 
  subscribeLostFound 
} from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { 
  BellRing, 
  CalendarDays, 
  Clock, 
  MapPin, 
  BookOpen, 
  MessageSquare, 
  Search, 
  PlusCircle, 
  ArrowRight, 
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  FileText,
  GraduationCap,
  Users,
  Flame,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenNoticeModal: () => void;
  onOpenMaterialModal: () => void;
  onOpenLostFoundModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNoticeModal,
  onOpenMaterialModal,
  onOpenLostFoundModal,
}) => {
  const { userProfile, currentUser, isOwner, canPublishNotices, canManageTimetable } = useAuth();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [timetable, setTimetable] = useState<TimetableClass[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>([]);

  // Current day of week
  const daysOfWeek: TimetableClass['day'][] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const todayDate = new Date();
  const todayIndex = todayDate.getDay();
  const currentDayName = daysOfWeek[todayIndex];

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = todayDate.getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
  };

  const greeting = getGreeting();

  useEffect(() => {
    const unsubNotices = subscribeNotices(setNotices);
    const unsubTimetable = subscribeTimetable(setTimetable);
    const unsubMaterials = subscribeMaterials(setMaterials);
    const unsubLostFound = subscribeLostFound(setLostFound);

    return () => {
      unsubNotices();
      unsubTimetable();
      unsubMaterials();
      unsubLostFound();
    };
  }, []);

  // Filter today's classes
  const todaysClasses = timetable.filter(c => c.day === currentDayName);

  // Latest announcements (top 3)
  const latestNotices = notices.slice(0, 3);

  // Combined recent activity feed
  const recentActivities = [
    ...notices.slice(0, 3).map(n => ({
      id: `notice-${n.id}`,
      type: 'Notice',
      title: n.title,
      author: n.authorName,
      date: n.createdAt,
      icon: BellRing,
      category: n.category,
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      iconBox: 'bg-gradient-to-tr from-indigo-500 to-blue-600 text-white',
      action: () => onNavigate('notices')
    })),
    ...materials.slice(0, 3).map(m => ({
      id: `material-${m.id}`,
      type: 'Material',
      title: `${m.title} (${m.subject})`,
      author: m.uploaderName,
      date: m.createdAt,
      icon: BookOpen,
      category: m.subject,
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      iconBox: 'bg-gradient-to-tr from-purple-500 to-pink-600 text-white',
      action: () => onNavigate('materials')
    })),
    ...lostFound.slice(0, 3).map(lf => ({
      id: `lostfound-${lf.id}`,
      type: lf.type === 'lost' ? 'Lost Item' : 'Found Item',
      title: lf.title,
      author: lf.posterName,
      date: lf.createdAt,
      icon: Search,
      category: lf.location,
      badgeColor: lf.type === 'lost' ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200',
      iconBox: lf.type === 'lost' ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white' : 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white',
      action: () => onNavigate('lostfound')
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Exam':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Campus Life':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Sports':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. DYNAMIC COLORFUL CAMPUS HERO BANNER */}
      <section 
        id="dashboard-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-500/15 p-6 sm:p-8"
      >
        {/* Ambient Decorative Accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-48 h-48 rounded-full bg-purple-500/20 blur-xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-32 h-32 rounded-full bg-blue-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Connect Campus Portal</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Semester 2 • Fall 2026
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {greeting.text}, {userProfile?.name || 'Scholar'}! {greeting.emoji}
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-normal">
              Welcome to your live university ecosystem. Check upcoming lectures, download course resources, and stay on top of verified campus notices.
            </p>

            {/* User Roles & Live Status Row */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              {userProfile?.roles && userProfile.roles.map(r => (
                <RoleBadge key={r} role={r} size="sm" />
              ))}
              <span className="text-xs text-indigo-200/80 font-medium">
                Connected as @{userProfile?.username || 'user'}
              </span>
            </div>
          </div>

          {/* Right Action / Quick Snapshot Widget */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 text-white">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-indigo-200">Current Day</p>
                <p className="text-sm font-bold text-white">
                  {todayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-[11px] text-indigo-200">Classes Today:</span>
                <span className="ml-1.5 text-sm font-black text-amber-300">{todaysClasses.length}</span>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-white hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COLORFUL QUICK STATISTICS BENTO CARDS */}
      <section id="section-quick-statistics" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Live Campus Overview
              </h2>
              <p className="text-xs text-slate-400 font-medium">Real-time indicators across campus channels</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Official Notices */}
          <div 
            id="stat-card-notices"
            onClick={() => onNavigate('notices')}
            className="group relative p-5 bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Notices</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <BellRing className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{notices.length}</span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Active Bulletins
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span className="font-medium">Priority alerts & updates</span>
              <ArrowUpRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Today's Classes */}
          <div 
            id="stat-card-timetable"
            onClick={() => onNavigate('timetable')}
            className="group relative p-5 bg-white rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Lectures</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{todaysClasses.length}</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {currentDayName}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span className="font-medium">Halls & class timetable</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Study Materials */}
          <div 
            id="stat-card-materials"
            onClick={() => onNavigate('materials')}
            className="group relative p-5 bg-white rounded-2xl border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-600" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Materials</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{materials.length}</span>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                Shared Files
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span className="font-medium">Lecture notes & slides</span>
              <ArrowUpRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Lost & Found */}
          <div 
            id="stat-card-lostfound"
            onClick={() => onNavigate('lostfound')}
            className="group relative p-5 bg-white rounded-2xl border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lost & Found</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {lostFound.filter(i => i.status === 'open').length}
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                Pending Claims
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span className="font-medium">Active recovered items</span>
              <ArrowUpRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. LATEST OFFICIAL NOTICES */}
      <section id="section-latest-announcements" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Latest Announcements
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Priority Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Verified notifications from administration and faculty</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canPublishNotices && (
              <button
                id="btn-quick-publish-notice-top"
                onClick={onOpenNoticeModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Publish Notice</span>
              </button>
            )}
            <button
              id="btn-view-all-notices"
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors px-2 py-1 hover:bg-indigo-50 rounded-lg"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {latestNotices.length === 0 ? (
          <div className="p-8 bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No announcements posted yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Official university notices published by department heads or CRs will appear right here.
            </p>
            {canPublishNotices && (
              <button
                onClick={onOpenNoticeModal}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Publish the First Notice</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestNotices.map((notice) => {
              const isHigh = notice.priority === 'High';
              const isMedium = notice.priority === 'Medium';
              return (
                <div
                  key={notice.id}
                  id={`announcement-card-${notice.id}`}
                  onClick={() => onNavigate('notices')}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-lg flex flex-col justify-between ${
                    isHigh
                      ? 'bg-gradient-to-b from-red-50/70 via-white to-white border-red-200/90 shadow-xs'
                      : isMedium
                      ? 'bg-gradient-to-b from-amber-50/70 via-white to-white border-amber-200/90 shadow-xs'
                      : 'bg-white border-slate-200/90 shadow-xs hover:border-indigo-200'
                  }`}
                >
                  <div>
                    {/* Header Chips */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(notice.category)}`}>
                        {notice.category}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isHigh
                            ? 'bg-red-500 text-white shadow-xs'
                            : isMedium
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isHigh && <Flame className="w-3 h-3 text-white" />}
                        {notice.priority}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                      {notice.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                        {notice.authorName ? notice.authorName.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <span className="font-bold text-slate-700 truncate max-w-[120px]">
                        {notice.authorName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. TODAY'S TIMETABLE */}
      <section id="section-today-timetable" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xs">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Today's Timetable
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {currentDayName}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Scheduled courses, lecture halls, and faculty instructors</p>
            </div>
          </div>

          <button
            id="btn-view-full-timetable"
            onClick={() => onNavigate('timetable')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors px-2.5 py-1 hover:bg-emerald-50 rounded-lg"
          >
            <span>Full Week Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaysClasses.length === 0 ? (
          <div className="p-8 bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl border border-emerald-100/80 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No scheduled classes for {currentDayName}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Enjoy your free study hours or review notes. You can inspect lectures scheduled for other days of the week.
            </p>
            <button
              onClick={() => onNavigate('timetable')}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <span>Explore Weekly Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysClasses.map((cls, idx) => (
              <div
                key={cls.id}
                id={`today-class-${cls.id}`}
                className="group relative p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-600" />
                <div className="pl-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {cls.startTime} - {cls.endTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {cls.room}
                    </span>
                  </div>

                  <h4 className="font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cls.subject}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 pl-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                      {cls.instructor ? cls.instructor.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                      {cls.instructor}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Period #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. SPLIT SECTION: RECENT ACTIVITY & FAST ACTIONS HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT ACTIVITY (Span 2) */}
        <section id="section-recent-activity" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Recent Campus Activity
                </h2>
                <p className="text-xs text-slate-400 font-medium">Live timeline across notices, study files, and community posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm divide-y divide-slate-100">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Compass className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">No recent activity logged in the campus feed yet.</p>
              </div>
            ) : (
              recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={act.action}
                    className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 px-3 rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${act.iconBox}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${act.badgeColor}`}>
                            {act.type}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {act.author}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                          {act.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* FAST ACTIONS COMMAND HUB (Span 1) */}
        <section id="section-quick-actions" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Quick Actions
              </h2>
              <p className="text-xs text-slate-400 font-medium">Instant shortcuts for campus workflows</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-sm space-y-2.5">
            {canPublishNotices && (
              <button
                id="qa-btn-publish-notice"
                onClick={onOpenNoticeModal}
                className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-blue-50/70 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/80 text-indigo-950 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-900">Publish Notice</p>
                    <p className="text-[10px] text-slate-500">Official verified broadcast</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            <button
              id="qa-btn-upload-material"
              onClick={onOpenMaterialModal}
              className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/80 to-pink-50/70 hover:from-purple-100 hover:to-pink-100 border border-purple-200/80 text-purple-950 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900">Upload Study Notes</p>
                  <p className="text-[10px] text-slate-500">Share slides & PDF references</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              id="qa-btn-join-chat"
              onClick={() => onNavigate('groups')}
              className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/80 to-blue-50/70 hover:from-sky-100 hover:to-blue-100 border border-sky-200/80 text-sky-950 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900">Join Subject Chat</p>
                  <p className="text-[10px] text-slate-500">Live academic channels</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              id="qa-btn-report-lostfound"
              onClick={onOpenLostFoundModal}
              className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/70 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-950 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Search className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-900">Report Lost / Found</p>
                  <p className="text-[10px] text-slate-500">Community claim board</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {canManageTimetable && (
              <button
                id="qa-btn-manage-timetable"
                onClick={() => onNavigate('timetable')}
                className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/70 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/80 text-emerald-950 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-900">Manage Timetable</p>
                    <p className="text-[10px] text-slate-500">Edit class schedules & halls</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Campus Info Badge */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-500 flex items-center gap-2 mt-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Campus Library & Student Helpdesk available 8 AM - 8 PM</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
