
export interface ClassroomSession {
  id: string;
  roomId: string;
  teacherId: string;
  studentId: string;
  startTime: Date;
  endTime?: Date;
  isRecording: boolean;
  status: 'waiting' | 'active' | 'ended';
}

export interface UseEnhancedClassroomProps {
  roomId: string;
  userId: string;
  displayName: string;
  userRole: 'teacher' | 'student';
}
