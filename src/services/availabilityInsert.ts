import type { SupabaseClient } from "@supabase/supabase-js";

// Types for availability slot inserts
export interface AvailabilitySlotInsert {
  teacher_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  duration: number;   // minutes
  lesson_type: string;
  is_available: boolean;
  is_booked?: boolean;
  // Allow extra props to pass-through without causing TS errors
  [key: string]: any;
}

// Normalize to 30/60 minutes
const to30or60 = (d: number): 30 | 60 => (d >= 55 ? 60 : 30);
// Normalize to 25/55 minutes
const to25or55 = (d: number): 25 | 55 => (d >= 55 ? 55 : 25);

function mapDurations<T extends AvailabilitySlotInsert>(slots: T[], mapper: (d: number) => number): T[] {
  return slots.map((s) => ({ ...s, duration: mapper(Number(s.duration)) })) as T[];
}

function isDurationConstraintError(error: any): boolean {
  const code = error?.code || error?.details?.code;
  const msg = String(error?.message || "").toLowerCase();
  return code === "23514" || msg.includes("duration") || msg.includes("check constraint");
}

function isUniqueViolation(error: any): boolean {
  const code = error?.code || error?.details?.code;
  const msg = String(error?.message || "").toLowerCase();
  return code === "23505" || msg.includes("duplicate key") || msg.includes("unique constraint");
}

/**
 * Pre-filters slots that already exist in the DB so we never trip the
 * partial unique index `idx_unique_teacher_slot (teacher_id, start_time)
 * WHERE is_booked = false`. Postgrest cannot use ON CONFLICT against a
 * partial index, so we deduplicate client-side first.
 */
async function filterOutExisting(
  client: SupabaseClient,
  slots: AvailabilitySlotInsert[]
): Promise<AvailabilitySlotInsert[]> {
  if (slots.length === 0) return slots;

  // Group requested slots by teacher_id (typically just one)
  const byTeacher = new Map<string, Set<string>>();
  for (const s of slots) {
    if (!byTeacher.has(s.teacher_id)) byTeacher.set(s.teacher_id, new Set());
    byTeacher.get(s.teacher_id)!.add(s.start_time);
  }

  const existingKeys = new Set<string>();

  for (const [teacherId, startTimes] of byTeacher.entries()) {
    const times = Array.from(startTimes);
    const { data, error } = await client
      .from("teacher_availability")
      .select("start_time")
      .eq("teacher_id", teacherId)
      .in("start_time", times);

    if (error) {
      // Fail-open: let the insert proceed; caller will surface real errors
      console.warn("[availabilityInsert] dedupe lookup failed:", error);
      continue;
    }

    for (const row of data ?? []) {
      // Normalize to ISO so comparisons match regardless of DB serialization
      const iso = new Date(row.start_time as string).toISOString();
      existingKeys.add(`${teacherId}::${iso}`);
    }
  }

  return slots.filter(
    (s) => !existingKeys.has(`${s.teacher_id}::${new Date(s.start_time).toISOString()}`)
  );
}

/**
 * Insert availability slots safely:
 *  1. Pre-filter slots that already exist (avoids the partial unique-index conflict).
 *  2. If the DB still rejects with a duplicate, treat it as success (idempotent).
 *  3. If a duration CHECK constraint trips, retry with 30/60 then 25/55 mappings.
 */
export async function insertAvailabilitySlotsWithFallback(
  client: SupabaseClient,
  slots: AvailabilitySlotInsert[]
) {
  if (!slots || slots.length === 0) return;

  const fresh = await filterOutExisting(client, slots);
  if (fresh.length === 0) return; // everything already exists — nothing to do

  const tryInsert = async (rows: AvailabilitySlotInsert[]) =>
    client.from("teacher_availability").insert(rows);

  // First try as-is
  let { error } = await tryInsert(fresh);
  if (!error) return;

  // Duplicate slipped through (race) — treat as success
  if (isUniqueViolation(error)) return;

  // Duration check constraint → try alternate duration families
  if (isDurationConstraintError(error)) {
    const slots3060 = mapDurations(fresh, to30or60);
    const attempt3060 = await tryInsert(slots3060);
    if (!attempt3060.error || isUniqueViolation(attempt3060.error)) return;

    const slots2555 = mapDurations(fresh, to25or55);
    const attempt2555 = await tryInsert(slots2555);
    if (!attempt2555.error || isUniqueViolation(attempt2555.error)) return;

    throw attempt2555.error;
  }

  throw error;
}
