
import React from "react";
import { StudentVideoPanel } from "./components/StudentVideoPanel";
import { StudentInfoTabs } from "./components/StudentInfoTabs";

interface UnifiedRightPanelProps {
  studentName: string;
  studentXP: number;
  activeRightTab: string;
  onTabChange: (tab: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
}

export function UnifiedRightPanel({
  studentName,
  studentXP,
  activeRightTab,
  onTabChange,
  currentUser
}: UnifiedRightPanelProps) {
  // Ensure we have a valid tab - default to chat if activeRightTab is "progress"
  const validTab = activeRightTab === "progress" ? "chat" : activeRightTab;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Student Video Section - Fixed height to match teacher video */}
      <div className="h-[300px]">
        <StudentVideoPanel
          studentName={studentName}
          currentUser={currentUser}
        />
      </div>

      {/* Student Info Panel - Takes remaining space */}
      <div className="flex-1">
        <StudentInfoTabs
          studentName={studentName}
          studentXP={studentXP}
          activeRightTab={validTab}
          onTabChange={onTabChange}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
