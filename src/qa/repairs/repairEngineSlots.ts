/**
 * Engine Slot auto-repair executor.
 *
 * When the QA verdict is `repair` and issues include
 * ENGINE_SLOT_CEFR_CEILING* codes, this function mutates the lesson
 * in place by swapping the offending engine kind to a supported one
 * (story_engine_slot for narrative-heavy hubs, detective_mystery_slot
 * as fallback — both support up to C2).
 *
 * Idempotent: repeated calls converge; no swap happens once the engine
 * is already within its CEFR ceiling.
 */
import type { QAIssue, QALesson } from '../types';

const CEFR_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CEILING: Record<string, string> = {
  story_engine_slot: 'C2',
  escape_room_slot: 'C1',
  detective_mystery_slot: 'C2',
  hidden_object_slot: 'B1',
};

function idx(v?: string | null): number {
  if (!v) return -1;
  const n = String(v).replace(/\s+/g, '').toLowerCase();
  return CEFR_ORDER.findIndex((c) => c.replace(/\s+/g, '').toLowerCase() === n);
}

function pickReplacement(lessonCefr: string, prefer?: 'narrative' | 'analytical'): string {
  // Both story and detective support C2; choose by pedagogical fit.
  if (prefer === 'analytical' && idx(lessonCefr) >= idx('B2')) {
    return 'detective_mystery_slot';
  }
  return 'story_engine_slot';
}

export interface EngineRepairResult {
  swapped: number;
  swaps: Array<{ from: string; to: string; path: string }>;
}

export function repairEngineSlots(
  lesson: QALesson,
  issues: QAIssue[],
): EngineRepairResult {
  const relevant = issues.some(
    (i) =>
      i.code === 'ENGINE_SLOT_CEFR_CEILING' ||
      i.code === 'ENGINE_SLOT_CEFR_CEILING_BLOCK',
  );
  const result: EngineRepairResult = { swapped: 0, swaps: [] };
  if (!relevant) return result;

  const lessonCefr = String((lesson as any)?.cefr ?? '').trim();
  const lessonCefrIdx = idx(lessonCefr);
  if (lessonCefrIdx < 0) return result;

  const trySwap = (obj: any, path: string, keyName: 'type' | 'kind' | 'engineType') => {
    const engine = String(obj?.[keyName] || '');
    const ceil = CEILING[engine];
    if (!ceil) return;
    const ceilIdx = idx(ceil);
    if (ceilIdx < 0 || lessonCefrIdx <= ceilIdx) return;
    // Analytical for higher CEFR (>= B2), narrative otherwise.
    const prefer = lessonCefrIdx >= idx('B2') ? 'analytical' : 'narrative';
    const replacement = pickReplacement(lessonCefr, prefer);
    if (replacement === engine) return;
    obj[keyName] = replacement;
    (obj as any).auto_repaired_from = engine;
    (obj as any).auto_repair_reason = `CEFR ${lessonCefr} exceeds ${engine} ceiling ${ceil}`;
    result.swapped += 1;
    result.swaps.push({ from: engine, to: replacement, path });
  };

  const slides = ((lesson as any)?.slides ?? []) as any[];
  slides.forEach((s, i) => {
    if (!s || typeof s !== 'object') return;
    if (s.type) trySwap(s, `slides[${i}].type`, 'type');
    else if (s.kind) trySwap(s, `slides[${i}].kind`, 'kind');
  });

  const pages = ((lesson as any)?.pages ?? []) as any[];
  pages.forEach((p, pi) => {
    const blocks = p?.blocks ?? [];
    blocks.forEach((b: any, bi: number) => {
      if (b?.kind === 'language_engine_slot' && b.engineType) {
        trySwap(b, `pages[${pi}].blocks[${bi}].engineType`, 'engineType');
      }
    });
  });

  return result;
}
