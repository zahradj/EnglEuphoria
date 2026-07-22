export interface AvailabilitySlot {
  id: string;
  teacherId: string;
  startTime: Date;
  endTime: Date;
  duration: 30 | 60;
  isAvailable: boolean;
  isBooked: boolean;
  lessonId?: string;
  lessonTitle?: string;
  studentName?: string;
  studentId?: string;
  studentShortId?: string;
  studentCefrLevel?: string;
  studentEmail?: string;
  studentGradeLevel?: string;
  studentFinalCefrLevel?: string;
  hub?: 'playground' | 'academy' | 'success' | null;
  recurringPattern?: Record<string, unknown> | null;
  isTrial?: boolean;
}

export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

export interface CalendarDay {
  date: Date;
  dayName: string;
  dateNum: number;
  isToday: boolean;
}
