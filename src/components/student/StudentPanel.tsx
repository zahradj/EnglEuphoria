
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StudentSidebar } from "./StudentSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardTab } from "./DashboardTab";
import { ProfileTab } from "./ProfileTab";
import { EnhancedUpcomingClassesTab } from "./EnhancedUpcomingClassesTab";
import { ChatTab } from "./ChatTab";
import { BillingTab } from "./BillingTab";
import { CertificatesTab } from "./CertificatesTab";
import { SettingsTab } from "./SettingsTab";
import { UnitRoadmap } from "./curriculum/UnitRoadmap";
import { MapOfSounds } from "./curriculum/MapOfSounds";
import { VocabularyVault } from "./curriculum/VocabularyVault";
import { MasteryMilestone } from "./curriculum/MasteryMilestone";
import { StudentAchievements } from "./curriculum/StudentAchievements";

interface StudentPanelProps {
  studentId?: string;
  studentName?: string;
  points?: number;
}

export const StudentPanel = ({ 
  studentId = "student-456", 
  studentName = "Alex", 
  points: initialPoints = 150 
}: StudentPanelProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hasProfile, setHasProfile] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const { signOut } = useAuth();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab studentName={studentName} studentId={studentId} hasProfile={hasProfile} studentProfile={studentProfile} />;
      case "profile":
        return <ProfileTab studentName={studentName} />;
      case "classes":
        return <EnhancedUpcomingClassesTab studentId={studentId} />;
      case "homework":
        return (
          <div className="p-6 text-center text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground mb-2">Homework</h2>
            <p>Your homework assignments will appear here.</p>
          </div>
        );
      case "learning-path":
        return <UnitRoadmap />;
      case "sounds":
        return <MapOfSounds />;
      case "vocabulary":
        return <VocabularyVault />;
      case "milestones":
        return (
          <div className="space-y-6">
            <MasteryMilestone />
            <StudentAchievements />
          </div>
        );
      case "chat":
        return <ChatTab />;
      case "billing":
        return <BillingTab />;
      case "certificates":
        return <CertificatesTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DashboardTab studentName={studentName} studentId={studentId} hasProfile={hasProfile} studentProfile={studentProfile} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-dvh bg-background flex w-full">
        <StudentSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onLogout={signOut}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-12 flex items-center border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="ml-2" />
            <span className="ml-3 text-sm font-medium text-muted-foreground">Student Dashboard</span>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {renderActiveTab()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
