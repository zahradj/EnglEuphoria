
export interface OneOnOneVideoSectionProps {
  enhancedClassroom: any;
  currentUserId: string;
  currentUserName: string;
  isTeacher: boolean;
  studentXP?: number;
  onAwardPoints?: (points: number, reason?: string) => void;
  showRewardPopup?: boolean;
  lessonStarted?: boolean;
}

export interface VideoRefs {
  teacherVideoRef: React.RefObject<HTMLVideoElement>;
  studentVideoRef: React.RefObject<HTMLVideoElement>;
}

export type IssueType = 
  | "Audio not working" 
  | "Video not working" 
  | "Connection issues" 
  | "Poor audio quality" 
  | "Poor video quality"
  | "Screen sharing not working"
  | "Other technical issue";
