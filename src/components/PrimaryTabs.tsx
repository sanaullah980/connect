import React, { useEffect, useRef, useState } from 'react';
import {
  Home,
  BellRing,
  CalendarDays,
  BookOpen,
  ShoppingBag,
  MoreHorizontal,
  MessageSquare,
  Search,
  Bell,
  UserRound
} from 'lucide-react';
import { NavigationPage } from '../types';

interface PrimaryTabsProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
}

const tabs: Array<{page: NavigationPage; label: string; icon: React.ElementType}> = [
  { page: 'dashboard', label: 'Home', icon: Home },
  { page: 'notices', label: 'Announcements', icon: BellRing },
  { page: 'timetable', label: 'Timetable', icon: CalendarDays },
  { page: 'materials', label: 'Materials', icon: BookOpen },
  { page: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
];

const moreItems: Array<{page: NavigationPage; label: string; icon: React.ElementType}> = [
  { page: 'groups', label: 'Subject Groups', icon: MessageSquare },
  { page: 'lostfound', label: 'Lost & Found', icon: Search },
  { page: 'notifications', label: 'Notifications', icon: Bell },
  { page: 'profile', label: 'My Profile', icon: UserRound },
];

export const PrimaryTabs: React.FC<PrimaryTabsProps> = ({ currentPage, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const moreActive = moreItems.some(item => item.page === currentPage);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (page: NavigationPage) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-[61px] z-[19] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 sm:px-6 lg:px-8 scrollbar-none">
        {tabs.map(({ page, label, icon: Icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => go(page)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex shrink-0 items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold transition-colors ${
                active ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{label}</span>
              {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-indigo-600" />}
            </button>
          );
        })}

        <div ref={ref} className="relative ml-auto shrink-0">
          <button
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
              moreActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span>More</span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
              {moreItems.map(({ page, label, icon: Icon }) => {
                const active = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => go(page)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
