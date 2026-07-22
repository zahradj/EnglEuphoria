import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { extractEdgeError } from '@/lib/extractEdgeError';

export const MIN_VOCAB_FOR_HOMEWORK = 3;

export type HomeworkStage =
  | 'auth'
  | 'context'
  | 'blueprint'
  | 'activities'
  | 'adaptive'
  | 'validate'
  | 'persist'
  | 'assign';

export const HOMEWORK_STAGES: HomeworkStage[] = [
  'context',
  'blueprint',
  'activities',
  'adaptive',
  'validate',
  'persist',
  'assign',
];

export function getVocabArray(blueprint: any): string[] {
  const raw = blueprint?.vocabulary ?? blueprint?.target_vocabulary ?? [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v: any) => (typeof v === 'string' ? v : v?.word ?? v?.term ?? ''))
    .map((s: string) => (s || '').trim())
    .filter(Boolean);
}

export function homeworkGuardReason(
  lessonId: string | null | undefined,
  blueprint: any
): string | null {
  if (!lessonId) return 'Save the lesson once before generating homework.';
  const vocab = getVocabArray(blueprint);
  if (vocab.length < MIN_VOCAB_FOR_HOMEWORK) {
    return `Please add at least ${MIN_VOCAB_FOR_HOMEWORK} vocabulary words to this lesson before generating homework.`;
  }
  return null;
}

// ── Unified Lesson Context Object ────────────────────────────────────────────
export interface UnifiedLessonContext {
  hub: 'academy' | 'playground' | 'success';
  cefr_level?: string;
  lesson_id: string;
  lesson_state?: Record<string, unknown>;
  grammar_scope?: Record<string, unknown>;
  vocabulary_scope?: Record<string, unknown>;
  pronunciation_scope?: Record<string, unknown>;
  adaptive_profile?: Record<string, unknown>;
  gamification_state?: Record<string, unknown>;
}

export interface GenerateHomeworkInput {
  /** Either pass a full UnifiedLessonContext OR the legacy { lessonId, blueprint, title, hub } shape. */
  lessonId: string | null | undefined;
  blueprint?: any;
  title: string;
  hub: 'academy' | 'playground' | 'success';
  selectedDueDate?: string | null;
  context?: Partial<UnifiedLessonContext>;
  /** Called as each pipeline stage starts on the server. */
  onProgress?: (stage: HomeworkStage) => void;
  /** Max retries for retryable failures (default 2). */
  maxRetries?: number;
  /** When true, do not show a toast — the dialog handles UI. */
  silent?: boolean;
}

export interface GenerateHomeworkResult {
  ok: boolean;
  data?: any;
  error?: string;
  stage?: HomeworkStage;
  detail?: string;
  retryable?: boolean;
}

function buildBody(input: GenerateHomeworkInput) {
  const { lessonId, blueprint, title, hub, context } = input;
  const vocab = getVocabArray(blueprint);
  const dueDate = (() => {
    if (input.selectedDueDate && input.selectedDueDate.trim().length > 0) return input.selectedDueDate;
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 7);
    return fallback.toISOString();
  })();
  return {
    // Unified Lesson Context Object
    hub,
    cefr_level: context?.cefr_level ?? blueprint?.cefr_level,
    lesson_id: lessonId,
    lesson_state: context?.lesson_state ?? {},
    grammar_scope: context?.grammar_scope ?? {
      pattern: blueprint?.grammar ?? blueprint?.grammar_focus ?? blueprint?.target_grammar_rule ?? '',
    },
    vocabulary_scope: context?.vocabulary_scope ?? { items: vocab },
    pronunciation_scope: context?.pronunciation_scope ?? {
      focus: blueprint?.target_phonics ?? blueprint?.phonics ?? blueprint?.phonics_focus ?? '',
    },
    adaptive_profile: context?.adaptive_profile ?? { difficulty_tier: 3 },
    gamification_state: context?.gamification_state ?? { xp_multiplier: 1 },
    // Legacy fields (back-compat with current edge function consumers)
    blueprint,
    title: title || 'Lesson',
    due_date: dueDate,
    selectedDueDate: dueDate,
  };
}

async function invokeOnce(body: Record<string, unknown>): Promise<GenerateHomeworkResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-homework', { body });
    // SDK-level transport error
    if (error && !data) {
      const raw = await extractEdgeError({ error, data, fallback: 'Generation failed' });
      return { ok: false, error: raw, stage: 'activities', retryable: true };
    }
    if (data?.success === false || data?.error) {
      return {
        ok: false,
        error: data.error || 'Generation failed',
        stage: (data.stage as HomeworkStage) || 'validate',
        detail: data.detail,
        retryable: !!data.retryable,
      };
    }
    return { ok: true, data };
  } catch (e: any) {
    console.error('[homeworkGuard] invoke threw', e);
    return { ok: false, error: e?.message || 'Network error', stage: 'activities', retryable: true };
  }
}

export async function generateHomeworkSafe(input: GenerateHomeworkInput): Promise<GenerateHomeworkResult> {
  const reason = homeworkGuardReason(input.lessonId, input.blueprint);
  if (reason) {
    if (!input.silent) toast.error(reason);
    return { ok: false, error: reason, stage: 'blueprint' };
  }

  const body = buildBody(input);
  const maxRetries = input.maxRetries ?? 2;

  let toastId: string | number | undefined;
  if (!input.silent) toastId = (toast as any).loading?.('Generating homework…');

  // Simulate stage progress for the UI — the edge function logs every stage on
  // its side, but invoke() is a single round-trip, so we tick optimistically.
  let attempt = 0;
  let lastResult: GenerateHomeworkResult = { ok: false, error: 'No attempt made' };

  while (attempt <= maxRetries) {
    if (input.onProgress) {
      // Walk through stages with small delays so the UI shows movement.
      HOMEWORK_STAGES.forEach((s, i) => {
        setTimeout(() => input.onProgress?.(s), i * 120);
      });
    }
    lastResult = await invokeOnce(body);
    if (lastResult.ok) break;
    if (!lastResult.retryable) break;
    attempt += 1;
    if (attempt > maxRetries) break;
    await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
  }

  if (toastId) (toast as any).dismiss?.(toastId);

  if (!lastResult.ok) {
    if (!input.silent) {
      if (lastResult.error?.includes('INSUFFICIENT_VOCABULARY') || lastResult.detail?.includes('vocabulary')) {
        toast.error(`Add at least ${MIN_VOCAB_FOR_HOMEWORK} vocabulary words before generating homework.`);
      } else {
        toast.error(`Homework failed at ${lastResult.stage || 'pipeline'}: ${lastResult.error}`, {
          description: lastResult.detail?.slice(0, 200),
        });
      }
    }
    return lastResult;
  }

  if (!input.silent) toast.success('Homework ready ✓');
  return lastResult;
}
