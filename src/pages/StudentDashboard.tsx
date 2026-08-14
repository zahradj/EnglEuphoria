
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHomeworkInbox } from "@/hooks/student/useHomeworkInbox";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarHoverShell, SidebarHoverZone, SidebarHoverArea } from "@/components/student/SidebarHoverShell";
import { supabase } from "@/integrations/supabase/client";
import { SystemId } from "@/types/multiTenant";
import { DashboardRouter } from "@/components/student/dashboards/DashboardRouter";
import { useStudentLevel, StudentLevel } from "@/hooks/useStudentLevel";
import { useThemeMode } from "@/hooks/useThemeMode";
import { PlacementGatekeeper } from "@/components/student/PlacementGatekeeper";
import { HubBootSkeleton } from "@/components/student/HubBootSkeleton";

// Lazy load components to improve initial load time
import { MinimalStudentHeader } from "@/components/student/MinimalStudentHeader";
import { StudentSidebar } from "@/components/student/StudentSidebar";

import { TeachersTab } from "@/components/student/TeachersTab";
import { UpcomingClassesTab } from "@/components/student/UpcomingClassesTab";
import { SpeakingPracticeTab } from "@/components/student/speaking/SpeakingPracticeTab";
import { EnhancedBillingTab } from "@/components/student/EnhancedBillingTab";
import { ProfileTab } from "@/components/student/ProfileTab";
import { SettingsTab } from "@/components/student/SettingsTab";
import { QuickActions } from "@/components/navigation/QuickActions";
import { AssessmentsTab } from "@/components/student/tabs/AssessmentsTab";
import { CertificatesTab } from "@/components/student/tabs/CertificatesTab";
import { ReferralTab } from "@/components/student/tabs/ReferralTab";
import { HomeworkTab } from "@/components/student/tabs/HomeworkTab";
import { GamesTab } from "@/components/student/tabs/GamesTab";
import { MyLessonsTab } from "@/components/student/tabs/MyLessonsTab";
import { MyPathTab } from "@/components/student/tabs/MyPathTab";
import { MapOfSoundsTab } from "@/components/student/tabs/MapOfSoundsTab";
import { VocabularyVaultTab } from "@/components/student/tabs/VocabularyVaultTab";
import { GrammarJournalTab } from "@/components/student/tabs/GrammarJournalTab";
import { MasteryMilestonesTab } from "@/components/student/tabs/MasteryMilestonesTab";
import { SkillMapTab } from "@/components/student/tabs/SkillMapTab";
import { MobileBottomNav, type StudentNavTab } from "@/components/mobile/MobileBottomNav";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import { ProfileCompletionBanner } from "@/components/student/ProfileCompletionBanner";

// Hub-specific mesh gradient blob configs
const HUB_MESH_COLORS: Record<string, { blobs: string[]; darkBlobs: string[] }> = {
  playground: {
    blobs: [
      'rgba(254,106,47,0.15)',
      'rgba(254,175,21,0.12)',
      'rgba(255,200,100,0.10)',
    ],
    darkBlobs: [
      'rgba(254,106,47,0.08)',
      'rgba(254,175,21,0.06)',
      'rgba(180,100,20,0.05)',
    ],
  },
  academy: {
    blobs: [
      'rgba(23,78,166,0.12)',
      'rgba(183,94,237,0.10)',
      'rgba(100,120,220,0.08)',
    ],
    darkBlobs: [
      'rgba(23,78,166,0.08)',
      'rgba(183,94,237,0.06)',
      'rgba(60,60,140,0.05)',
    ],
  },
  professional: {
    blobs: [
      'rgba(13,101,45,0.12)',
      'rgba(61,211,155,0.10)',
      'rgba(80,180,120,0.08)',
    ],
    darkBlobs: [
      'rgba(13,101,45,0.08)',
      'rgba(61,211,155,0.06)',
      'rgba(40,100,60,0.05)',
    ],
  },
};

const StudentDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Listen for deep-link requests from cards / Quest Map zones.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: string; params?: Record<string, string> }>).detail;
      if (!detail?.tab) return;
      setActiveTab(detail.tab);
      const sp = new URLSearchParams();
      sp.set('tab', detail.tab);
      for (const [k, v] of Object.entries(detail.params ?? {})) sp.set(k, v);
      setSearchParams(sp, { replace: true });
    };
    window.addEventListener('student-dashboard:open-tab', handler as EventListener);
    return () => window.removeEventListener('student-dashboard:open-tab', handler as EventListener);
  }, [setSearchParams]);
  const [hasProfile, setHasProfile] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemId, setSystemId] = useState<SystemId | null>(null);
  const { studentLevel, hubReady, refetch: refetchStudentLevel } = useStudentLevel();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  useHomeworkInbox(user?.id);
  const { t } = useTranslation();
  
  const generateStudentId = () => {
    const existingId = localStorage.getItem('studentId');
    if (existingId) return existingId;
    const newId = 'STU' + Math.random().toString(36).substr(2, 6).toUpperCase();
    localStorage.setItem('studentId', newId);
    return newId;
  };
  
  const studentName = user?.user_metadata?.full_name || localStorage.getItem('studentName') || user?.email?.split('@')[0] || 'Student';
  const studentId = generateStudentId();

  // Strict hub key — never falls back. Null until DB/metadata confirms.
  const hubKey = hubReady ? studentLevel : null;
  const meshColors = useMemo(
    () => (hubKey ? HUB_MESH_COLORS[hubKey] : null),
    [hubKey]
  );
  const blobs = meshColors ? (isDark ? meshColors.darkBlobs : meshColors.blobs) : null;

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        
        const profile = localStorage.getItem('studentProfile');
        if (profile) {
          setStudentProfile(JSON.parse(profile));
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
        
        if (user?.id) {
          const studentLevelToSystem: Record<StudentLevel, SystemId> = {
            'playground': 'kids',
            'academy': 'teen',
            'professional': 'adult',
          };

          if (studentLevel) {
            setSystemId(studentLevelToSystem[studentLevel] || 'kids');
          } else {
            const { data: userData, error } = await supabase
              .from('users')
              .select('current_system')
              .eq('id', user.id)
              .single();
            
            if (!error && userData?.current_system) {
              const systemMap: Record<string, SystemId> = {
                'KIDS': 'kids',
                'TEENS': 'teen',
                'ADULTS': 'adult',
                'kids': 'kids',
                'teen': 'teen',
                'adult': 'adult'
              };
              setSystemId(systemMap[userData.current_system] || 'kids');
            }
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Error initializing student dashboard:', error);
        toast({
          title: t('sd.toast.loadError.title'),
          description: t('sd.toast.loadError.body'),
          variant: "destructive",
        });
      }
    };

    if (!authLoading) {
      initializeDashboard();
    }
  }, [authLoading, toast, user?.id, studentLevel]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('studentName');
      localStorage.removeItem('userType');
      localStorage.removeItem('studentProfile');
      localStorage.removeItem('studentId');
      
      await signOut();
      
      toast({
        title: t('sd.toast.loggedOut.title'),
        description: t('sd.toast.loggedOut.body'),
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: t('sd.toast.logoutError.title'),
        description: t('sd.toast.logoutError.body'),
        variant: "destructive",
      });
    }
  };

  const renderActiveTab = () => {
    const tabComponents = {
      dashboard: () => <DashboardRouter systemId={systemId} studentName={studentName} />,
      "learning-path": () => <MyPathTab />,
      lessons: () => <MyLessonsTab />,
      homework: () => <HomeworkTab />,
      games: () => <GamesTab />,
      sounds: () => <MapOfSoundsTab />,
      vocabulary: () => <VocabularyVaultTab />,
      grammar: () => <GrammarJournalTab />,
      milestones: () => <MasteryMilestonesTab />,
      "skill-map": () => <SkillMapTab />,
      assessments: () => <AssessmentsTab />,
      certificates: () => <CertificatesTab />,
      teachers: () => <TeachersTab />,
      "upcoming-classes": () => <UpcomingClassesTab />,
      classes: () => <UpcomingClassesTab />,
      speaking: () => <SpeakingPracticeTab />,
      billing: () => <EnhancedBillingTab />,
      referrals: () => <ReferralTab />,
      profile: () => <ProfileTab studentName={studentName} />,
      settings: () => <SettingsTab />,
    };

    const TabComponent = tabComponents[activeTab as keyof typeof tabComponents] || tabComponents.dashboard;
    
    return (
      <ErrorBoundary fallback={
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">{t('sd.section.error')}</p>
          <button 
            onClick={() => setActiveTab("dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {t('sd.section.return')}
          </button>
        </div>
      }>
        <TabComponent />
      </ErrorBoundary>
    );
  };

  // Hard gate: never render the dashboard (or any hub-specific chrome) until
  // auth AND the hub are fully resolved. This prevents the wrong-hub flicker.
  if (authLoading || !isInitialized || !hubReady || !systemId || !hubKey || !blobs) {
    return <HubBootSkeleton hubHint={hubKey} />;
  }

  return (
    <ErrorBoundary>
      <PlacementGatekeeper
        studentLevel={studentLevel}
        studentName={studentName}
        onComplete={() => { void refetchStudentLevel(); }}
      >
      <SidebarHoverShell>
        <div className="flex min-h-dvh w-full relative overflow-hidden animate-fade-in">
          {/* ═══ ANIMATED MESH GRADIENT BACKGROUND ═══ */}
          <div className="fixed inset-0 -z-10 transition-colors duration-700">
            {/* Base background */}
            <div className={`absolute inset-0 ${isDark ? 'bg-[#0a0a12]' : 'bg-[#f8f9fc]'}`} />
            
            {/* Animated mesh blobs */}
            <div
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full animate-gradient-mesh opacity-80"
              style={{ background: `radial-gradient(circle, ${blobs[0]}, transparent 70%)` }}
            />
            <div
              className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full animate-gradient-mesh opacity-70"
              style={{
                background: `radial-gradient(circle, ${blobs[1]}, transparent 70%)`,
                animationDelay: '-4s',
                animationDuration: '15s',
              }}
            />
            <div
              className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full animate-gradient-mesh opacity-60"
              style={{
                background: `radial-gradient(circle, ${blobs[2]}, transparent 70%)`,
                animationDelay: '-8s',
                animationDuration: '18s',
              }}
            />
          </div>

          <SidebarHoverZone />
          <SidebarHoverArea>
            <StudentSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              hasProfile={hasProfile}
              onLogout={handleLogout}
            />
          </SidebarHoverArea>

          
          <div className="flex-1 flex flex-col">
            <MinimalStudentHeader 
              studentName={studentName}
              studentId={studentId}
              hasProfile={hasProfile}
              studentProfile={studentProfile}
            />
            <main
              data-app-main
              key={activeTab}
              className="flex-1 overflow-y-auto p-4 md:p-6"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 112px)' }}
            >
              <div className="max-w-7xl mx-auto pb-8 md:pb-12">
                <ProfileCompletionBanner />
                <QuickActions />
                {renderActiveTab()}
              </div>
            </main>
          </div>

          {/* Mobile-only bottom navigation + install prompt */}
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={(tab: StudentNavTab) => setActiveTab(tab)}
          />
          <InstallPrompt />
        </div>
      </SidebarHoverShell>
      </PlacementGatekeeper>
    </ErrorBoundary>
  );
};

export default StudentDashboard;
