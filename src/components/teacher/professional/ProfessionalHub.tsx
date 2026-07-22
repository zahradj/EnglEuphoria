import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { ProfessionalNav, ProfessionalTab } from './ProfessionalNav';
import { CommandCenter } from './CommandCenter';
import { StudentEntityDashboard } from './StudentEntityDashboard';
import { StudentSuccessHub } from './StudentSuccessHub';
import { ProfileOnboardingModal } from '../dashboard/ProfileOnboardingModal';
import { PendingReviewBanner } from '../dashboard/PendingReviewBanner';
import { ProfileSetupTab } from '../ProfileSetupTab';
import { StudentLearningAnalytics } from '../analytics/StudentLearningAnalytics';
import { TeacherEarnings } from '../TeacherEarnings';
import { EnhancedCalendarTab } from '../EnhancedCalendarTab';
import { UnitMasteryReport } from '../dashboard/UnitMasteryReport';
import { MasteryOverview } from '../dashboard/MasteryOverview';
import { WelcomeSuccessModal } from '../dashboard/WelcomeSuccessModal';
import { ScrollHeader } from '@/components/navigation/ScrollHeader';
import { FloatingHelpButton } from '@/components/support/FloatingHelpButton';
import { Loader2 } from 'lucide-react';

interface ProfessionalHubProps {
  teacherName: string;
  teacherId: string;
}

export const ProfessionalHub: React.FC<ProfessionalHubProps> = ({
  teacherName,
  teacherId,
}) => {
  const [activeTab, setActiveTab] = useState<ProfessionalTab>('command-center');
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { status, loading, profile, refetch } = useTeacherStatus(teacherId);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading your hub...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (status === 'PENDING_APPROVAL') {
      return <PendingReviewBanner teacherName={teacherName} />;
    }

    if (status === 'APPROVED') {
      switch (activeTab) {
        case 'command-center':
          return <CommandCenter teacherId={teacherId} teacherName={teacherName} />;
        case 'diagnostic-lab':
          return <StudentEntityDashboard teacherId={teacherId} />;
        case 'success-hub':
          return <StudentSuccessHub teacherId={teacherId} />;
        case 'reports':
          return (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  Reports
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate and send diagnostic reports to parents
                </p>
              </div>
              <UnitMasteryReport teacherId={teacherId} />
              <MasteryOverview teacherId={teacherId} />
            </div>
          );
        case 'schedule':
          return <EnhancedCalendarTab teacherId={teacherId} />;
        case 'analytics':
          return <StudentLearningAnalytics teacherId={teacherId} />;
        case 'earnings':
          return <TeacherEarnings teacherId={teacherId} />;
        case 'account':
          return <ProfileSetupTab teacherId={teacherId} />;
        case 'lesson-architect':
          return (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  II Wizard — Lesson Architect
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  One-click lesson generation for your next scheduled unit
                </p>
              </div>
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <p className="text-sm">Lesson Architect is integrated into scheduled lessons — click "Generate" on any upcoming class.</p>
              </div>
            </div>
          );
        default:
          return <CommandCenter teacherId={teacherId} teacherName={teacherName} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-dvh bg-background">
      <ScrollHeader />

      <ProfessionalNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        teacherName={teacherName}
        profileImageUrl={profile?.profile_image_url || undefined}
        onLogout={handleLogout}
      />

      {status === 'NEW' && (
        <ProfileOnboardingModal
          teacherId={teacherId}
          teacherName={teacherName}
          onComplete={refetch}
        />
      )}

      {status === 'APPROVED' && profile && !(profile as any).welcome_shown && (
        <WelcomeSuccessModal
          teacherId={teacherId}
          teacherName={teacherName}
          profileImageUrl={profile.profile_image_url || undefined}
          bio={profile.bio || undefined}
          onDismiss={refetch}
        />
      )}

      <main className="container mx-auto max-w-7xl px-4 py-6">
        {renderContent()}
      </main>

      <FloatingHelpButton />
    </div>
  );
};
