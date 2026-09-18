export interface AvailabilitySlot {
  id: string;
  day: string;
  time: string;
  duration: 30 | 60;
  status: 'selected' | 'open' | 'booked' | 'past';
  studentId?: string;
  studentShortId?: string;
  studentName?: string;
  studentEmail?: string;
  lessonTitle?: string;
  startTime?: string;
  hub?: 'playground' | 'academy' | 'success' | null;
  recurringPattern?: Record<string, unknown> | null;
  /** Set when this time slot had a booking that was cancelled — kept even
   *  after the underlying teacher_availability row was recycled back to
   *  'open', so the grid can still show a tick for it. Independent of
   *  `status`: a cancelled slot is usually 'open' again (or 'past'), not a
   *  status of its own. */
  cancelledBy?: 'teacher' | 'student';
  cancelledAt?: string;
  cancelledStudentName?: string;
}

export interface SchedulerState {
  slots: AvailabilitySlot[];
  slotDuration: 30 | 60;
  selectedDay: string;
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type DayType = typeof DAYS[number];

// Full 24-hour coverage in 30-minute increments (00:00 → 23:30)
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
}) as readonly string[];

export type TimeSlotType = string;
