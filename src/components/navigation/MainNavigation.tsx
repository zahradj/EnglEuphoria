import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface MainNavigationProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ 
  children, 
  showSidebar = true 
}) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderSidebar = () => {
    if (!showSidebar || !user) return null;

    switch (user.role) {
      case 'student':
        return (
          <StudentSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasProfile={true}
            onLogout={signOut}
          />
        );
      case 'teacher':
        return (
          <TeacherSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={signOut}
          />
        );
      case 'admin':
        return (
          <AdminSidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-dvh w-full bg-dashboard-blend dark:bg-dashboard-neutral">
      <div className="flex w-full">
        {renderSidebar()}
        <main className="flex-1 min-h-dvh">
          {children}
        </main>
      </div>
    </div>
  );
};
