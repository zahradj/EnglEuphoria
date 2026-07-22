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
