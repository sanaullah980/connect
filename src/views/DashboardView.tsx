import React, { useEffect, useState } from 'react';
import { 
  Notice, 
  TimetableClass, 
  Material, 
  LostFoundItem, 
  MarketplaceListing,
  NavigationPage 
} from '../types';
import { 
  subscribePersonalizedNotices, 
  subscribePersonalizedTimetable, 
  subscribeMaterials, 
  subscribeMarketplace 
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
  ArrowRight, 
  GraduationCap, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  School,
  Sparkles,
  Calendar,
  Layers,
  UserCheck,
  Tag
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
  const { userProfile, currentUser, isOwner, canPublishNotices } = useAuth();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [timetable, setTimetable] = useState<TimetableClass[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>([]);

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
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const unsubNotices = subscribePersonalizedNotices(userProfile, setNotices);
    const unsubTimetable = subscribePersonalizedTimetable(userProfile, setTimetable);
    const unsubMaterials = subscribeMaterials(setMaterials);
    const unsubMarket = subscribeMarketplace(setMarketplace);

    return () => {
      unsubNotices();
      unsubTimetable();
      unsubMaterials();
      unsubMarket();
    };
  }, [userProfile?.uid, userProfile?.department, userProfile?.program, userProfile?.semester, userProfile?.section]);

  // Filter today's classes (sorted by start time)
  // If weekend, fallback to Monday schedule for demo/planning preview
  const activeDay = (currentDayName === 'Saturday' || currentDayName === 'Sunday') ? 'Monday' : currentDayName;
  const todaysClasses = timetable
    .filter(c => c.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Find next upcoming class
  const nextClass = todaysClasses.length > 0 ? todaysClasses[0] : null;

  // Important announcement (urgent/high priority)
  const importantNotice = notices.find(n => n.priority === 'High' || n.isImportant) || (notices.length > 0 ? notices[0] : null);

  // Quick navigation modules
  const quickModules = [
    {
      id: 'notices',
      title: 'Announcements',
      desc: 'Official notices & memos',
      icon: BellRing,
      page: 'notices' as NavigationPage,
      color: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100/70',
      badge: notices.length > 0 ? `${notices.length}` : null
    },
    {
      id: 'timetable',
      title: 'Timetable',
      desc: 'Master weekly schedules',
      icon: CalendarDays,
      page: 'timetable' as NavigationPage,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70',
      badge: 'Active'
    },
    {
      id: 'materials',
      title: 'Study Materials',
      desc: 'Handouts & presentations',
      icon: BookOpen,
      page: 'materials' as NavigationPage,
      color: 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100/70',
      badge: materials.length > 0 ? `${materials.length}` : null
    },
    {
      id: 'groups',
      title: 'Subject Groups',
      desc: 'Real-time class discussion',
      icon: MessageSquare,
      page: 'groups' as NavigationPage,
      color: 'text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100/70',
      badge: 'Live'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      desc: 'Books, tools & calculators',
      icon: ShoppingBag,
      page: 'marketplace' as NavigationPage,
      color: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100/70',
      badge: `${marketplace.length}`
    },
    {
      id: 'lostfound',
      title: 'Lost & Found',
      desc: 'Report & recover campus items',
      icon: Search,
      page: 'lostfound' as NavigationPage,
      color: 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100/70',
      badge: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. UNIVERSITY DASHBOARD HEADER */}
      <div className="rounded-3xl bg-[#0A2540] text-white p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-2.5 border border-white/10">
              <School className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pak-Austria Fachhochschule: IAST • Main Campus Mang</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {getGreeting()}, {userProfile?.name || 'Campus Member'}
            </h1>

            {/* Academic Placement Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 font-semibold text-white border border-white/10">
                {userProfile?.program || 'BS Artificial Intelligence'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200 font-medium">
                {userProfile?.department || 'Faculty of Computing'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {userProfile?.semester || 'Semester 3'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {userProfile?.section || 'Section A'}
              </span>
            </div>
          </div>

          {/* Quick Academic Details Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Academic Profile</span>
            </button>
            <button
              onClick={() => onNavigate('timetable')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>My Full Timetable</span>
            </button>
          </div>
        </div>

        {/* Ambient Subtle Accent Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
      </div>

      {/* 2. IMPORTANT ANNOUNCEMENT (TOP PRIORITY TARGETED NOTICE) */}
      {importantNotice && (
        <div 
          onClick={() => onNavigate('notices')}
          className="cursor-pointer bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border-l-4 border-amber-500 bg-white rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {importantNotice.priority} Priority
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Target: {importantNotice.audienceScope === 'all' ? 'University-Wide' : importantNotice.targetProgram || importantNotice.targetDepartment || 'Selected Cohort'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(importantNotice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                {importantNotice.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                {importantNotice.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 shrink-0 self-end sm:self-center">
            <span>Read Notice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Classes & Marketplace */}
        <div className="lg:col-span-2 space-y-6">
          {/* NEXT UPCOMING CLASS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Next Lecture Today ({activeDay})
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Personalized Schedule
              </span>
            </div>

            {nextClass ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#0A2540] text-white text-[10px] font-mono font-bold">
                      {nextClass.subjectCode || 'LEC'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {nextClass.startTime} — {nextClass.endTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    {nextClass.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      {nextClass.instructor}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {nextClass.room}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Upcoming
                  </span>
                  <button
                    onClick={() => onNavigate('timetable')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Room Details →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <CalendarDays className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No more lectures scheduled for today</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check your upcoming assignments or view the full weekly schedule.
                </p>
              </div>
            )}

            {/* Today's Schedule Timeline */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-700">All Lectures for {activeDay}</span>
                <span className="text-slate-400">
                  {todaysClasses.length} class{todaysClasses.length === 1 ? '' : 'es'}
                </span>
              </div>

              <div className="space-y-2">
                {todaysClasses.slice(0, 4).map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className="p-3 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 font-mono font-bold text-slate-700 text-[11px] shrink-0">
                        {c.startTime}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{c.subject}</p>
                        <p className="text-[11px] text-slate-500">
                          {c.instructor} • <span className="font-medium text-emerald-700">{c.room}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {c.section || 'Sec A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CAMPUS MARKETPLACE PREVIEW */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Marketplace</h2>
                <p className="text-xs text-slate-500">Textbooks, scientific calculators & equipment by students</p>
              </div>
              <button
                onClick={() => onNavigate('marketplace')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {marketplace.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('marketplace')}
                  className="cursor-pointer group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col bg-white"
                >
                  <div className="h-28 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#0A2540]/90 text-white font-extrabold text-[10px]">
                      {item.listingType === 'free' ? 'FREE' : `PKR ${item.price.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-indigo-600 block mb-0.5">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 truncate">
                      By {item.sellerName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Access & Academic Notices */}
        <div className="space-y-6">
          {/* QUICK CAMPUS ACCESS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Quick University Access
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {quickModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onNavigate(mod.page)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between h-24 ${mod.color}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className="w-5 h-5" />
                      {mod.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/80">
                          {mod.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs tracking-tight">{mod.title}</p>
                      <p className="text-[10px] opacity-75 truncate">{mod.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* OFFICIAL NOTICES FEED */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Official Notices
              </h3>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  onClick={() => onNavigate('notices')}
                  className="cursor-pointer p-3 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600">{n.category}</span>
                    <span>•</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {n.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ACADEMIC TERM CARD */}
          <div className="rounded-3xl bg-slate-900 text-white p-5 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                Academic Session
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Active Term
              </span>
            </div>
            <h4 className="font-bold text-sm text-white">Fall 2026 Semester</h4>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Pak-Austria Fachhochschule: Institute of Applied Sciences & Technology. Examination registration portal active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
