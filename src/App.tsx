import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationPage } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';

// Views
import { DashboardView } from './views/DashboardView';
import { NoticesView } from './views/NoticesView';
import { TimetableView } from './views/TimetableView';
import { MaterialsView } from './views/MaterialsView';
import { GroupsChatView } from './views/GroupsChatView';
import { LostFoundView } from './views/LostFoundView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { OwnerAdminView } from './views/OwnerAdminView';

// Services
import { subscribeNotifications, bootstrapCampusDefaults } from './services/campusService';
import { Sparkles, Users, RefreshCw, Layers } from 'lucide-react';

const AppContent: React.FC = () => {
  const { userProfile, isOwner, loading } = useAuth();

  // Navigation state with browser history URL hash integration
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    const hash = window.location.hash.replace('#', '') as NavigationPage;
    const validPages: NavigationPage[] = [
      'dashboard', 'notices', 'timetable', 'materials', 'groups', 'lostfound', 'notifications', 'profile', 'admin'
    ];
    return validPages.includes(hash) ? hash : 'dashboard';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global action modal states
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);

  // Unread notification count
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Synchronize browser history / URL hash
  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationPage;
      const validPages: NavigationPage[] = [
        'dashboard', 'notices', 'timetable', 'materials', 'groups', 'lostfound', 'notifications', 'profile', 'admin'
      ];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Notifications live listener for the Navbar badge
  useEffect(() => {
    if (!userProfile?.uid) {
      setUnreadNotifCount(0);
      return;
    }

    const unsub = subscribeNotifications(userProfile.uid, (notifs) => {
      const unread = notifs.filter(n => !n.isRead).length;
      setUnreadNotifCount(unread);
    });

    return () => unsub();
  }, [userProfile?.uid]);

  // Bootstrap initial channel defaults when user logs in
  useEffect(() => {
    if (userProfile?.uid) {
      bootstrapCampusDefaults(userProfile.uid);
    }
  }, [userProfile?.uid]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Real-Time Dual Account Testing Notice Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white py-1.5 px-4 text-xs font-medium flex items-center justify-between shadow-xs border-b border-indigo-500/30">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-bold tracking-tight">Connect Campus Cloud Real-Time</span>
          <span className="hidden sm:inline text-indigo-200">|</span>
          <span className="hidden sm:inline text-indigo-100 truncate">
            Real-time multi-account syncing active across all tabs & sessions
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-indigo-200 font-mono hidden md:inline">
            Owner: sanaullahmawia980@gmail.com
          </span>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-[11px] font-bold bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-lg border border-white/25 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Users className="w-3 h-3" />
            <span>Switch / Sign In</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-sky-50/25">
        {/* Responsive Sidebar Navigation */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          unreadCount={unreadNotifCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Top Bar / Header */}
          <Navbar
            currentPage={currentPage}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            unreadNotificationsCount={unreadNotifCount}
            onNavigate={handleNavigate}
          />

          {/* Body Content by Current Page */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentPage === 'dashboard' && (
              <DashboardView
                onNavigate={handleNavigate}
                onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
                onOpenMaterialModal={() => setIsMaterialModalOpen(true)}
                onOpenLostFoundModal={() => setIsLostFoundModalOpen(true)}
              />
            )}

            {currentPage === 'notices' && (
              <NoticesView
                isPublishModalOpen={isNoticeModalOpen}
                onClosePublishModal={() => setIsNoticeModalOpen(false)}
                onOpenPublishModal={() => setIsNoticeModalOpen(true)}
              />
            )}

            {currentPage === 'timetable' && (
              <TimetableView />
            )}

            {currentPage === 'materials' && (
              <MaterialsView
                isUploadModalOpen={isMaterialModalOpen}
                onCloseUploadModal={() => setIsMaterialModalOpen(false)}
                onOpenUploadModal={() => setIsMaterialModalOpen(true)}
              />
            )}

            {currentPage === 'groups' && (
              <GroupsChatView />
            )}

            {currentPage === 'lostfound' && (
              <LostFoundView
                isPostModalOpen={isLostFoundModalOpen}
                onClosePostModal={() => setIsLostFoundModalOpen(false)}
                onOpenPostModal={() => setIsLostFoundModalOpen(true)}
              />
            )}

            {currentPage === 'notifications' && (
              <NotificationsView
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'profile' && (
              <ProfileView />
            )}

            {currentPage === 'admin' && (
              <OwnerAdminView />
            )}
          </main>
        </div>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
