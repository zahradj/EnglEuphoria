import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherSidebar } from "./TeacherSidebar";
import { DashboardTab } from "./DashboardTab";
import { EnhancedCalendarTab } from "./EnhancedCalendarTab";
import { StudentsTab } from "./StudentsTab";
import { AssignmentsTab } from "./AssignmentsTab";
import { MessagesTab } from "./MessagesTab";
import { TeacherClassroom } from "./classroom/TeacherClassroom";
import { MobileTeacherNav } from "./mobile/MobileTeacherNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeacherPanelProps {
  teacherId?: string;
  teacherName?: string;
}

export const TeacherPanel = ({ 
  teacherId = "teacher-123", 
  teacherName = "Ms. Sarah" 
}: TeacherPanelProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab teacherName={teacherName} teacherId={teacherId} />;
      case "classroom":
        return <TeacherClassroom classId="101" studentName="Emma" lessonTitle="Magic Forest: Lesson 1" teacherName={teacherName} />;
      case "calendar":
        return <EnhancedCalendarTab teacherId={teacherId} />;
      case "students":
        return <StudentsTab />;
      case "assignments":
        return <AssignmentsTab />;
      case "messages":
        return <MessagesTab />;
      default:
        return <DashboardTab teacherName={teacherName} teacherId={teacherId} />;
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {isMobile ? (
        <MobileTeacherNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={signOut}
          teacherName={teacherName}
        />
      ) : (
        <TeacherSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={signOut}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "classroom" ? (
          <main className="flex-1 overflow-hidden">
            {renderActiveTab()}
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 md:pb-6">
            {renderActiveTab()}
          </main>
        )}
      </div>
    </div>
  );
};
