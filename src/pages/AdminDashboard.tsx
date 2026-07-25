import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminPendingCounts } from '@/hooks/useAdminPendingCounts';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { UserManagement } from '@/components/admin/UserManagement';
import { TeacherRoster } from '@/components/admin/teachers/TeacherRoster';
import { TeacherApplicationReview } from '@/components/admin/TeacherApplicationReview';
import { InterviewManagement } from '@/components/admin/InterviewManagement';
import { StudentManagement } from '@/components/admin/StudentManagement';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { ScheduleManager } from '@/components/admin/ScheduleManager';
import { PaymentsPanel } from '@/components/admin/PaymentsPanel';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { SuperAdminControlCenter } from '@/components/admin/SuperAdminControlCenter';
import { AdminBroadcastCenter } from '@/components/admin/AdminBroadcastCenter';
import { SystemEmailLog } from '@/components/admin/SystemEmailLog';
import { HiringKanbanBoard } from '@/components/admin/HiringKanbanBoard';
import { RecruitmentTable } from '@/components/admin/RecruitmentTable';
import { StaffOperations } from '@/components/admin/StaffOperations';
import { TeacherProfileReviewQueue } from '@/components/admin/TeacherProfileReviewQueue';
import { TestCreditButton } from '@/components/admin/TestCreditButton';
import { DesktopOnlyNotice } from '@/components/admin/DesktopOnlyNotice';
import { AdminInbox } from '@/components/admin/AdminInbox';
import { TechnicalSupportInbox } from '@/components/admin/TechnicalSupportInbox';
import { MarketingDashboardContent } from '@/components/marketing/MarketingDashboardContent';
import { AdminActionRequiredCard } from '@/components/admin/AdminActionRequiredCard';
import { AdminMobileBottomNav, type AdminMobileTab } from '@/components/admin/AdminMobileBottomNav';
import { ScrollHeader } from '@/components/navigation/ScrollHeader';
import { Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isAdmin, isLoading, user } = useAdminAuth();
  const { profileApprovals, loading: countsLoading } = useAdminPendingCounts();
  const autoRoutedRef = useRef(false);

  // Auto-jump to Profile Approvals when items are waiting and admin hasn't navigated yet.
  useEffect(() => {
    if (autoRoutedRef.current) return;
    if (countsLoading) return;
    if (searchParams.get('tab')) { autoRoutedRef.current = true; return; }
    if (activeTab === 'overview' && profileApprovals > 0) {
      setActiveTab('profile-review');
    }
    autoRoutedRef.current = true;
  }, [countsLoading, profileApprovals, activeTab, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <AdminActionRequiredCard onNavigate={handleTabChange} />
            <AdminOverview onNavigate={handleTabChange} />
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'teachers':
        return <TeacherRoster />;
      case 'teacher-applications':
        return <TeacherApplicationReview />;
      case 'interviews':
        return <InterviewManagement />;
      case 'students':
        return <StudentManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'schedule':
        return <ScheduleManager />;
      case 'payments':
        return <PaymentsPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'super-control':
        return <SuperAdminControlCenter />;
      case 'communications':
        return <AdminBroadcastCenter />;
      case 'email-log':
        return <SystemEmailLog />;
      case 'staff-operations':
        return <StaffOperations />;
      case 'hiring-pipeline':
        return <HiringKanbanBoard />;
      case 'recruitment-pipeline':
        return <RecruitmentTable />;
      case 'profile-review':
        return <TeacherProfileReviewQueue />;
      case 'inbox':
        return <AdminInbox />;
      case 'tech-support':
        return <TechnicalSupportInbox />;
      case 'marketing':
        return <MarketingDashboardContent />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <ScrollHeader />
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <AdminHeader />
        
        <main
          className="p-4 md:p-6"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
        >
          {/* Admin Quick Actions */}
          <div className="mb-4 flex items-center gap-3">
            <TestCreditButton />
          </div>
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile bottom navigation for the most-used admin sections */}
      <AdminMobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab: AdminMobileTab) => handleTabChange(tab)}
      />
    </div>
  );
};

export default AdminDashboard;
