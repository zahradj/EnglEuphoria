import { supabase } from '@/integrations/supabase/client';
import { questForLesson } from '@/content/homework-quests/registry';

/**
 * Runs when a student finishes a scene-based Playground lesson — either
 * the Little Explorers Phonics family (Pre-A1, `unit1/scenes.ts`) or the
 * Welcome Town family (A1/A2, `welcome-town(-a2)/scenes.ts`) — from the
 * Playground dashboard. Three writes, each best-effort — a failure in one
 * shouldn't block the celebration UI or the others:
 *   1. student_lesson_progress — marks the map node complete.
 *   2. student_phonics_progress — adds the letters this lesson teaches to
 *      the "Map of Sounds" tab.
 *   2b. student_vocabulary_progress — the words it teaches, for the
 *      "Vocabulary Vault" tab.
 *   3. homework_assignments (via the create-lep1-homework edge function,
 *      since students have no direct INSERT policy on that table) — makes
 *      practice for this lesson appear in the Homework Forest widget.
 *
 * All homework/phonics content is derived from the lesson's own scene
 * data — no new authoring, no AI call.
 *
 * Typed against a minimal structural shape (not either family's own Scene
 * union) deliberately: Pre-A1 and Welcome Town are separate, incompatible
 * TypeScript unions (see activity-pattern-library skill), but the specific
 * `kind`s this file actually reads (`sound-model`, `echo`, `roleplay`,
 * `basket`) have identical field shapes in both, and every code path below
 * already branches on `s.kind` before touching kind-specific fields — so
 * this works correctly for scenes from either registry without needing a
 * shared Scene union to exist.
 */
interface CompletionScene {
  kind: string;
  letter?: string;
  word?: string;
  /** meet scenes' spoken phrase — echo scenes use `word` for this instead. */
  repeat?: string;
  /** Every scene's own illustration. Pre-A1 kids and most Welcome Town
   *  students can't read yet — homework built from this file leans on
   *  these images (and item.img below) so practice stays picture- and
   *  audio-driven, matching how the lesson itself teaches, instead of
   *  silently assuming reading ability the moment it becomes homework. */
  bg?: string;
  /** The character who speaks this scene's line(s) — e.g. 'pip', 'mia',
   *  'teacher' (see `Character` in unit1/audio.ts, which every playground
   *  scene kind's `who` field is drawn from). Threaded into homework so its
   *  audio can look up the SAME pre-generated static clip the lesson itself
   *  plays, instead of generating fresh audio with no character voice. */
  who?: string;
  script?: { line: string }[];
  items?: { word: string; hit?: boolean; img?: string }[];
}

interface CompleteSceneLessonArgs {
  userId: string;
  lessonRowId: string;
  title: string;
  scenes: CompletionScene[];
  /** Registry key (e.g. 'castle-rich-9-1') — picks the lesson's Homework Quest. */
  lessonKey?: string | null;
}

interface CompleteSceneLessonResult {
  progressOk: boolean;
  phonicsLetters: string[];
  phonicsOk: boolean;
  vocabularyWords: string[];
  vocabularyOk: boolean;
  homeworkOk: boolean;
  /** The newly-created homework_assignments row id, if the homework step
   *  succeeded — lets the caller offer a direct "do it now" link. */
  homeworkAssignmentId: string | null;
}

/** Letters this lesson introduces, in first-seen order, deduped. */
export function extractTaughtLetters(scenes: CompletionScene[]): string[] {
  const seen = new Set<string>();
  const letters: string[] = [];
  for (const s of scenes) {
    if (s.kind === 'sound-model' && s.letter && !seen.has(s.letter)) {
      seen.add(s.letter);
      letters.push(s.letter);
    }
  }
  return letters;
}

/** Words this lesson teaches (with their picture when the scene has one),
 *  first-seen order, deduped — feeds the student's Vocabulary Vault. Reads
 *  the vocabulary-bearing fields the scene kinds share across both families:
 *  sound-model anchors, color/shape/toy-model examples, color-spot labels,
 *  sort/quiz items, listen-repeat cards and word-picture-match rounds. */
export function extractTaughtVocabulary(scenes: CompletionScene[]): { word: string; img?: string }[] {
  const out = new Map<string, { word: string; img?: string }>();
  const add = (raw: unknown, img?: unknown) => {
    if (typeof raw !== 'string') return;
    const word = raw.trim().toLowerCase();
    // Single words / short noun phrases only — never sentences.
    if (!word || word.length > 24 || word.split(/\s+/).length > 3 || /[.!?]/.test(word)) return;
    const imgStr = typeof img === 'string' && img.startsWith('/') ? img : undefined;
    const prev = out.get(word);
    if (!prev) out.set(word, { word, img: imgStr });
    else if (!prev.img && imgStr) prev.img = imgStr;
  };
  for (const scene of scenes) {
    const s = scene as unknown as Record<string, unknown>;
    const each = (key: string, fn: (o: Record<string, unknown>) => void) => {
      const arr = s[key];
      if (Array.isArray(arr)) for (const o of arr) if (o && typeof o === 'object') fn(o as Record<string, unknown>);
    };
    switch (s.kind) {
      case 'sound-model': each('anchors', (a) => add(a.word, a.img)); break;
      case 'color-model': case 'shape-model': case 'toy-model': each('items', (i) => add(i.exampleWord, i.exampleImg)); break;
      case 'color-spot': each('items', (i) => add(i.label, i.splashImg)); break;
      case 'color-sort': case 'dash': case 'sound-pop': each('items', (i) => add(i.word, i.img)); break;
      case 'listen-repeat-cards': each('cards', (c) => add(c.imgLabel, c.img)); break;
      case 'word-picture-match': each('rounds', (r) => add(r.correctLabel, r.correctImg)); break;
      case 'vocab-spot': each('items', (i) => add(i.word ?? i.label, i.img)); break;
      default: break;
    }
  }
  return Array.from(out.values());
}

function wordsOf(line: string): string[] {
  return line.replace(/[.,!?;:"']/g, '').trim().split(/\s+/).filter(Boolean);
}

export async function completeSceneLesson({
  userId,
  lessonRowId,
  title,
  scenes,
  lessonKey,
}: CompleteSceneLessonArgs): Promise<CompleteSceneLessonResult> {
  const result: CompleteSceneLessonResult = {
    progressOk: false,
    phonicsLetters: [],
    phonicsOk: false,
    vocabularyWords: [],
    vocabularyOk: false,
    homeworkOk: false,
    homeworkAssignmentId: null,
  };

  // 1. Progress
  try {
    const { error } = await supabase.from('student_lesson_progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonRowId,
        status: 'completed',
        score: 100,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' },
    );
    if (error) throw error;
    result.progressOk = true;
  } catch (err) {
    console.error('[sceneLessonCompletion] progress upsert failed', err);
  }

  // 2. Sounds learned
  const letters = extractTaughtLetters(scenes);
  result.phonicsLetters = letters;
  if (letters.length > 0) {
    try {
      const rows = letters.map((letter) => ({
        student_id: userId,
        phoneme: letter,
        mastery_level: 'mastered',
        mastered_at: new Date().toISOString(),
        lesson_id: lessonRowId,
      }));
      const { error } = await supabase
        .from('student_phonics_progress')
        .upsert(rows, { onConflict: 'student_id,phoneme' });
      if (error) throw error;
      result.phonicsOk = true;
    } catch (err) {
      console.error('[sceneLessonCompletion] phonics upsert failed', err);
    }
  } else {
    result.phonicsOk = true; // nothing to sync — not a failure
  }

  // 2b. Words learned — the "Vocabulary Vault" tab. Insert-only: a word the
  //     student already has keeps its mastery/review history.
  const vocab = extractTaughtVocabulary(scenes);
  result.vocabularyWords = vocab.map((v) => v.word);
  if (vocab.length > 0) {
    try {
      const now = new Date().toISOString();
      const rows = vocab.map((v) => ({
        student_id: userId,
        word: v.word,
        image_url: v.img ?? null,
        sticker_image_url: v.img ?? null,
        mastery_level: 1,
        mastered: false,
        times_reviewed: 1,
        first_seen_at: now,
        last_reviewed_at: now,
      }));
      const { error } = await supabase
        .from('student_vocabulary_progress')
        .upsert(rows, { onConflict: 'student_id,word', ignoreDuplicates: true });
      if (error) throw error;
      result.vocabularyOk = true;
    } catch (err) {
      console.error('[sceneLessonCompletion] vocabulary upsert failed', err);
    }
  } else {
    result.vocabularyOk = true; // nothing to sync — not a failure
  }

  // 3. Homework — the lesson's gamified Homework Quest, if it has one.
  //    (The old auto-generated 3-activity homework is retired.)
  const quest = lessonKey ? questForLesson(lessonKey) : null;
  if (quest) {
    try {
      const { data, error } = await supabase.functions.invoke('create-lep1-homework', {
        body: { lessonId: lessonRowId, title: quest.title ?? `Practice: ${title}`, content: { type: 'quest', questId: quest.id } },
      });
      if (error) throw error;
      result.homeworkOk = true;
      result.homeworkAssignmentId = (data as { assignment_id?: string } | null)?.assignment_id ?? null;
    } catch (err) {
      console.error('[sceneLessonCompletion] homework quest assignment failed', err);
    }
  } else {
    result.homeworkOk = true; // no quest for this lesson yet — nothing to assign
  }

  return result;
}
