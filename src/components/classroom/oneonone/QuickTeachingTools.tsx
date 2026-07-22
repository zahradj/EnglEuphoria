
import React from "react";
import { QuickActionTools } from "./QuickTeachingTools/QuickActionTools";
import { SessionActions } from "./QuickTeachingTools/SessionActions";
import { SessionStats } from "./QuickTeachingTools/SessionStats";
import { QuickNotes } from "./QuickTeachingTools/QuickNotes";

interface QuickTeachingToolsProps {
  currentUser?: {
    role: 'teacher' | 'student';
    name: string;
  };
}

export function QuickTeachingTools({ 
  currentUser = { role: 'teacher', name: 'Teacher' }
}: QuickTeachingToolsProps) {
  return (
    <div className="space-y-3">
      <QuickActionTools currentUser={currentUser} />
      <SessionActions />
      <SessionStats />
      <QuickNotes />
    </div>
  );
}
