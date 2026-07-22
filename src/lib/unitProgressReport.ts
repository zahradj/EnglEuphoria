/**
 * Unit Progress Report
 *
 * Lightweight student-facing summary emitted when a unit is completed.
 * Aggregates `vocab-arc:complete` events keyed by unit_id (persisted to
 * localStorage so the report survives page nav across the 6-lesson arc),
 * plus optional quiz/lesson stats passed at emit time.
 *
 * Consumers:
 *   - `recordVocabArcForUnit(unitId, payload)` — call from lesson players
 *     alongside existing vocab-arc emissions if you want per-unit rollup.
 *   - `emitUnitCompleted({ unitId, ...meta })` — fires the modal.
 *   - `<UnitProgressReportHost/>` — mounts the listener + modal globally.
 */

import type { Hub, Cefr } from '@/vocab-games/types';
import type { VocabArcCompletePayload } from './vocabArcTelemetry';

export const UNIT_COMPLETED_EVENT = 'unit:completed';
const STORAGE_KEY = 'unit_progress_report_v1';
const ENGINE_STORAGE_KEY = 'unit_engine_report_v1';

export type EngineKind = 'story' | 'escape_room' | 'detective_mystery' | 'hidden_object';

export interface UnitEngineRun {
  engine: EngineKind;
  accuracy: number; // 0..1
  durationMs: number;
  attempts: number;
  correct: number;
  ts: string;
}

export interface UnitEngineBucket {
  runs: UnitEngineRun[];
}

export interface UnitReportInput {
  unitId: string;
  unitTitle?: string;
  hub: Hub;
  cefr: Cefr;
  studentName?: string;
  /** Final unit quiz accuracy 0–1, if available. */
  quizAccuracy?: number;
  /** Total lessons in the unit (default 6). */
  lessonsTotal?: number;
  /** Lessons the student completed. */
  lessonsCompleted?: number;
}

export interface UnitReportBucket {
  attempts: number;
  correct: number;
  durationMs: number;
  masteredWords: string[];
  weakWords: string[];
}

export interface UnitReport extends UnitReportInput {
  accuracy: number; // 0–1
  totalAttempts: number;
  totalCorrect: number;
  totalDurationMs: number;
  masteredWords: string[];
  weakWords: string[];
  stars: 1 | 2 | 3;
  generatedAt: string;
  engineRuns: UnitEngineRun[];
  engineAccuracy: number; // 0..1 (avg across runs)
}

type Store = Record<string, UnitReportBucket>;
type EngineStore = Record<string, UnitEngineBucket>;

function safeRead(): Store {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Store;
  } catch {
    return {};
  }
}

function safeReadEngines(): EngineStore {
  try {
    return JSON.parse(localStorage.getItem(ENGINE_STORAGE_KEY) || '{}') as EngineStore;
  } catch {
    return {};
  }
}

function safeWrite(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota — ignore */
  }
}

function emptyBucket(): UnitReportBucket {
  return { attempts: 0, correct: 0, durationMs: 0, masteredWords: [], weakWords: [] };
}

/** Record a vocab-arc completion for a specific unit. Deduplicates words. */
export function recordVocabArcForUnit(
  unitId: string,
  payload: VocabArcCompletePayload,
): void {
  if (!unitId) return;
  const store = safeRead();
  const b = store[unitId] ?? emptyBucket();
  b.attempts += payload.attempts;
  b.correct += payload.correct;
  b.durationMs += payload.duration_ms;
  const isMastered = payload.accuracy >= 80;
  const bucket = isMastered ? b.masteredWords : b.weakWords;
  const other = isMastered ? b.weakWords : b.masteredWords;
  for (const w of payload.target_words) {
    const lw = w.toLowerCase();
    if (!bucket.includes(lw)) bucket.push(lw);
    // Move promoted words out of weak
    if (isMastered) {
      const i = other.indexOf(lw);
      if (i >= 0) other.splice(i, 1);
    }
  }
  store[unitId] = b;
  safeWrite(store);
}

export function getUnitBucket(unitId: string): UnitReportBucket {
  return safeRead()[unitId] ?? emptyBucket();
}

export function clearUnitBucket(unitId: string): void {
  const store = safeRead();
  delete store[unitId];
  safeWrite(store);
}

export function recordEngineRunForUnit(
  unitId: string,
  run: UnitEngineRun,
  meta?: { hub?: Hub; cefr?: Cefr },
): void {
  if (!unitId) return;
  const store = safeReadEngines();
  const b = store[unitId] ?? { runs: [] };
  b.runs.push(run);
  store[unitId] = b;
  try {
    localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
  // Feed the auto-tune rolling average so the next lesson can adapt engine difficulty.
  void import('./engineAutoTune').then((m) => m.noteEngineRunAccuracy(run.accuracy)).catch(() => {});
  // Fire-and-forget cloud persistence so Quest Log survives device changes.
  void (async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('student_engine_runs').insert({
        user_id: user.id,
        unit_id: unitId,
        engine: run.engine,
        accuracy: run.accuracy,
        duration_ms: run.durationMs,
        attempts: run.attempts,
        correct: run.correct,
        hub: meta?.hub ?? null,
        cefr: meta?.cefr ?? null,
      });
    } catch {
      /* offline / unauth — localStorage still has it */
    }
  })();
}

export function getUnitEngineBucket(unitId: string): UnitEngineBucket {
  return safeReadEngines()[unitId] ?? { runs: [] };
}

function starsFor(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.75) return 2;
  return 1;
}

export function buildUnitReport(input: UnitReportInput): UnitReport {
  const b = getUnitBucket(input.unitId);
  const vocabAccuracy = b.attempts > 0 ? b.correct / b.attempts : 0;
  const accuracy =
    typeof input.quizAccuracy === 'number'
      ? b.attempts > 0
        ? 0.4 * vocabAccuracy + 0.6 * input.quizAccuracy
        : input.quizAccuracy
      : vocabAccuracy;
  const engineBucket = getUnitEngineBucket(input.unitId);
  const engineRuns = engineBucket.runs;
  const engineAccuracy =
    engineRuns.length > 0
      ? engineRuns.reduce((s, r) => s + r.accuracy, 0) / engineRuns.length
      : 0;
  return {
    ...input,
    lessonsTotal: input.lessonsTotal ?? 6,
    lessonsCompleted: input.lessonsCompleted ?? input.lessonsTotal ?? 6,
    accuracy,
    totalAttempts: b.attempts,
    totalCorrect: b.correct,
    totalDurationMs: b.durationMs,
    masteredWords: [...b.masteredWords],
    weakWords: [...b.weakWords],
    stars: starsFor(accuracy),
    generatedAt: new Date().toISOString(),
    engineRuns,
    engineAccuracy,
  };
}

/** Fire the global report modal. */
export function emitUnitCompleted(input: UnitReportInput): void {
  if (typeof window === 'undefined') return;
  const report = buildUnitReport(input);
  window.dispatchEvent(new CustomEvent<UnitReport>(UNIT_COMPLETED_EVENT, { detail: report }));
}
