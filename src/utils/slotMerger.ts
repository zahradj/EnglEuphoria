/**
 * Merges adjacent 30-minute availability slots into 60-minute blocks
 * for Academy Hub and Success Hub booking views.
 */

interface RawSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  isAvailable: boolean;
}

export interface MergedSlot extends RawSlot {
  /** IDs of original 30-min slots that make up this merged slot */
  sourceSlotIds: string[];
}

/**
 * Given an array of 30-min slots, find adjacent pairs from the same teacher
 * and return them as 60-min merged slots.
 */
export function mergeAdjacentSlots(slots: RawSlot[]): MergedSlot[] {
  // Group by teacher
  const byTeacher = new Map<string, RawSlot[]>();
  for (const slot of slots) {
    if (!slot.isAvailable) continue;
    const existing = byTeacher.get(slot.teacherId) || [];
    existing.push(slot);
    byTeacher.set(slot.teacherId, existing);
  }

  const merged: MergedSlot[] = [];

  for (const [, teacherSlots] of byTeacher) {
    // Sort by start time
    const sorted = [...teacherSlots].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    const used = new Set<string>();

    for (let i = 0; i < sorted.length; i++) {
      if (used.has(sorted[i].id)) continue;

      // Look for the next adjacent slot (starts when this one ends)
      for (let j = i + 1; j < sorted.length; j++) {
        if (used.has(sorted[j].id)) continue;

        const gap = sorted[j].startTime.getTime() - sorted[i].endTime.getTime();
        // Adjacent = gap of 0 ms (or up to 5 min buffer)
        if (gap >= 0 && gap <= 5 * 60 * 1000) {
          merged.push({
            id: `${sorted[i].id}_${sorted[j].id}`,
            teacherId: sorted[i].teacherId,
            teacherName: sorted[i].teacherName,
            startTime: sorted[i].startTime,
            endTime: sorted[j].endTime,
            duration: 60,
            isAvailable: true,
            sourceSlotIds: [sorted[i].id, sorted[j].id],
          });
          used.add(sorted[i].id);
          used.add(sorted[j].id);
          break;
        }
      }
    }
  }

  return merged.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}
