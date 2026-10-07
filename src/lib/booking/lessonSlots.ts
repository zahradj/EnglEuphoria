/**
 * Lesson length and credits — ONE rule for every hub (owner decision, 2026-10-07):
 * a credit is 30 minutes. A student books a 30-minute lesson (1 credit) or a
 * 60-minute lesson (2 credits). A 60-minute lesson uses either one 60-minute
 * slot or two back-to-back 30-minute slots of the same teacher.
 * The server does the same arithmetic in book_class_slot (duration / 30).
 */
export type LessonMinutes = 30 | 60;

export const CREDIT_MINUTES = 30;
export const LESSON_LENGTHS: LessonMinutes[] = [30, 60];

export const creditsForLesson = (minutes: LessonMinutes): number => minutes / CREDIT_MINUTES;

/** What the student reads: a lesson is 25 minutes (booked in a 30-minute slot); two slots = two lessons in a row. */
export const lessonLengthLabel = (minutes: LessonMinutes): string =>
  minutes === 30 ? '25 min · 1 lesson' : '2 lessons back to back';

export interface SlotLike {
  id: string;
  teacherId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}

export type BookableLesson<T extends SlotLike> = T & { sourceSlotIds: string[] };

/** Every start time a student can book for a lesson of this length, soonest first. */
export function lessonOptions<T extends SlotLike>(slots: T[], minutes: LessonMinutes): BookableLesson<T>[] {
  if (minutes === 30) {
    return slots
      .filter((s) => s.duration === 30)
      .map((s) => ({ ...s, sourceSlotIds: [s.id] }));
  }

  // 60 minutes: a whole 60-minute slot ...
  const out: BookableLesson<T>[] = slots
    .filter((s) => s.duration === 60)
    .map((s) => ({ ...s, sourceSlotIds: [s.id] }));

  // ... or two 30-minute slots of one teacher that touch.
  const halves = new Map<string, T[]>();
  for (const s of slots) {
    if (s.duration !== 30) continue;
    halves.set(s.teacherId, [...(halves.get(s.teacherId) ?? []), s]);
  }
  for (const list of halves.values()) {
    for (const a of list) {
      const b = list.find((x) => x.startTime.getTime() === a.endTime.getTime());
      if (b) {
        out.push({
          ...a,
          id: `${a.id}_${b.id}`,
          endTime: b.endTime,
          duration: 60,
          sourceSlotIds: [a.id, b.id],
        });
      }
    }
  }
  return out.sort((x, y) => x.startTime.getTime() - y.startTime.getTime());
}

/** The same lesson one week later, if the teacher has it open (recurring bookings). */
export function matchingOption<T extends SlotLike>(options: BookableLesson<T>[], teacherId: string, startMs: number): BookableLesson<T> | null {
  return options.find((o) => o.teacherId === teacherId && Math.abs(o.startTime.getTime() - startMs) < 60_000) ?? null;
}
