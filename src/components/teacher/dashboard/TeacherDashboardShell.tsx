import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { TeacherTopNav } from './TeacherTopNav';
import { NovakidDashboard } from './NovakidDashboard';
import { ProfileOnboardingModal } from './ProfileOnboardingModal';
import { PendingReviewBanner } from './PendingReviewBanner';
import { ClassScheduler } from '@/components/teacher/scheduler';
import { ProfileSetupTab } from '@/components/teacher/ProfileSetupTab';
import { TeacherGuideTab } from './TeacherGuideTab';
import { StudentLearningAnalytics } from '@/components/teacher/analytics/StudentLearningAnalytics';
import { ScrollHeader } from '@/components/navigation/ScrollHeader';
import { Loader2 } from 'lucide-react';
import { FloatingHelpButton } from '@/components/support/FloatingHelpButton';
import { ThemeModeToggle } from '@/components/ui/ThemeModeToggle';
import { WelcomeSuccessModal } from './WelcomeSuccessModal';
import { MobileTeacherBottomNav } from './MobileTeacherBottomNav';
import { TeacherLessonLibrary } from '@/components/teacher/library/TeacherLessonLibrary';
import { AdminBroadcastBanner } from './AdminBroadcastBanner';
import { TeacherMethodologyTab } from './TeacherMethodologyTab';
import { TeacherHubTab } from './TeacherHubTab';
import { TechnicalSupportTab } from './TechnicalSupportTab';

type TabType = 'dashboard' | 'schedule' | 'library' | 'creator' | 'analytics' | 'methodology' | 'account' | 'teacher-hub' | 'help' | 'support';

interface TeacherDashboardShellProps {
  teacherName: string;
  teacherId: string;
}

export const TeacherDashboardShell = ({
  teacherName,
  teacherId,
}: TeacherDashboardShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { status, loading, profile, refetch } = useTeacherStatus(teacherId);

  // Legacy /teacher/creator* links → redirect to dashboard (Creator tab removed).
  useEffect(() => {
    if (location.pathname.startsWith('/teacher/creator')) {
      navigate('/teacher', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (tab: TabType) => {
    // 'creator' tab no longer exists in the nav, but keep the type for back-compat.
    if (tab === 'creator') return;
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // If pending approval, show banner regardless of tab
    if (status === 'PENDING_APPROVAL') {
      return <PendingReviewBanner teacherName={teacherName} />;
    }

    // If approved, render content based on active tab
    if (status === 'APPROVED') {
      switch (activeTab) {
        case 'dashboard':
          return <NovakidDashboard teacherId={teacherId} profileImageUrl={profile?.profile_image_url || null} />;
        case 'schedule':
          return <ClassScheduler teacherName={teacherName} teacherId={teacherId} />;
        case 'library':
          return <TeacherLessonLibrary />;
        case 'analytics':
          return <StudentLearningAnalytics teacherId={teacherId} />;
        case 'account':
          return <ProfileSetupTab teacherId={teacherId} />;
        case 'help':
          return <TeacherGuideTab />;
        case 'methodology':
          return <TeacherMethodologyTab />;
        case 'teacher-hub':
          return <TeacherHubTab />;
        case 'support':
          return <TechnicalSupportTab />;
        default:
          return <NovakidDashboard teacherId={teacherId} profileImageUrl={profile?.profile_image_url || null} />;
      }
    }

    // For NEW status, the modal handles it
    return null;
  };

  return (
    <div className="min-h-dvh bg-muted/30">
      {/* Admin broadcast banner (top of page, teachers only) */}
      {status === 'APPROVED' && (
        <AdminBroadcastBanner
          teacherId={teacherId}
          profileImageUrl={profile?.profile_image_url || null}
        />
      )}

      {/* Scroll Header with Logo */}
      <ScrollHeader />

      {/* Top Navigation */}
      <div className="flex items-center justify-end px-4 pt-2">
        <ThemeModeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />
      </div>
      <TeacherTopNav
        teacherName={teacherName}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        profileImageUrl={profile?.profile_image_url || undefined}
      />

      {/* Onboarding Modal - Blocks everything if NEW */}
      {status === 'NEW' && (
        <ProfileOnboardingModal
          teacherId={teacherId}
          teacherName={teacherName}
          onComplete={refetch}
        />
      )}

      {/* Welcome Modal for newly approved teachers */}
      {status === 'APPROVED' && profile && !(profile as any).welcome_shown && (
        <WelcomeSuccessModal
          teacherId={teacherId}
          teacherName={teacherName}
          profileImageUrl={profile.profile_image_url || undefined}
          bio={profile.bio || undefined}
          onDismiss={refetch}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      {status === 'APPROVED' && (
        <MobileTeacherBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* Floating Help Button */}
      <FloatingHelpButton />
    </div>
  );
};
