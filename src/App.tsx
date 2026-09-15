import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationPage } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PrimaryTabs } from './components/PrimaryTabs';
import { AuthModal } from './components/AuthModal';

// Views
import { DashboardView } from './views/DashboardView';
import { NoticesView } from './views/NoticesView';
import { TimetableView } from './views/TimetableView';
import { MaterialsView } from './views/MaterialsView';
import { GroupsChatView } from './views/GroupsChatView';
import { MarketplaceView } from './views/MarketplaceView';
import { LostFoundView } from './views/LostFoundView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { OwnerAdminView } from './views/OwnerAdminView';
import { AcademicStructureView } from './views/AcademicStructureView';
import { AcademicOnboardingModal } from './components/AcademicOnboardingModal';

// Services
import { subscribeNotifications, bootstrapCampusDefaults } from './services/campusService';
import { Sparkles, Users, RefreshCw, Layers, GraduationCap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { userProfile, isOwner, loading } = useAuth();

  // Navigation state with browser history URL hash integration
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    const hash = window.location.hash.replace('#', '') as NavigationPage;
    const validPages: NavigationPage[] = [
      'dashboard', 'notices', 'timetable', 'materials', 'groups', 'marketplace', 'lostfound', 'notifications', 'profile', 'academic', 'admin'
    ];
    return validPages.includes(hash) ? hash : 'dashboard';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(false);

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
        'dashboard', 'notices', 'timetable', 'materials', 'groups', 'marketplace', 'lostfound', 'notifications', 'profile', 'academic', 'admin'
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

  // Check whether onboarding should be shown (profile missing department or incomplete)
  const shouldShowOnboarding = Boolean(
    userProfile && 
    !userProfile.isProfileComplete && 
    !isOnboardingDismissed
  );

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Real-Time University Network Bar */}
      <div className="bg-[#0A2540] text-white py-1.5 px-4 text-xs font-medium flex items-center justify-between shadow-xs border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-bold tracking-tight">Connect PAF • Live Campus Network</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300 truncate">
            Pak-Austria Fachhochschule: Institute of Applied Sciences & Technology
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-slate-300 font-mono hidden md:inline">
            Root: sanaullahmawia980@gmail.com
          </span>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-[11px] font-bold bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-lg border border-white/20 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Users className="w-3 h-3" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100/50">
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

          {/* Primary tabs keep the most-used campus areas one tap away. */}
          <PrimaryTabs currentPage={currentPage} onNavigate={handleNavigate} />

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

            {currentPage === 'marketplace' && (
              <MarketplaceView />
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

            {currentPage === 'academic' && (
              <AcademicStructureView />
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

      {/* Academic Onboarding Modal (Automatic for new students/faculty) */}
      <AcademicOnboardingModal
        isOpen={shouldShowOnboarding}
        onClose={() => setIsOnboardingDismissed(true)}
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
