import { supabase } from '@/integrations/supabase/client';
import type { Scene } from '@/content/playground-library/unit1/scenes';

/**
 * Runs when a student finishes one of the scene-based Little Explorers
 * Phonics lessons (Unit 1 L1-6, Unit 2 L1) from the Playground dashboard.
 * Three writes, each best-effort — a failure in one shouldn't block the
 * celebration UI or the others:
 *   1. student_lesson_progress — marks the map node complete.
 *   2. student_phonics_progress — adds the letters this lesson teaches to
 *      the "Map of Sounds" tab.
 *   3. homework_assignments (via the create-lep1-homework edge function,
 *      since students have no direct INSERT policy on that table) — makes
 *      practice for this lesson appear in the Homework Forest widget.
 *
 * All homework/phonics content is derived from the lesson's own Scene[]
 * data — no new authoring, no AI call.
 */

interface CompleteSceneLessonArgs {
  userId: string;
  lessonRowId: string;
  title: string;
  scenes: Scene[];
}

interface CompleteSceneLessonResult {
  progressOk: boolean;
  phonicsLetters: string[];
  phonicsOk: boolean;
  homeworkOk: boolean;
}

/** Letters this lesson introduces, in first-seen order, deduped. */
export function extractTaughtLetters(scenes: Scene[]): string[] {
  const seen = new Set<string>();
  const letters: string[] = [];
  for (const s of scenes) {
    if (s.kind === 'sound-model' && !seen.has(s.letter)) {
      seen.add(s.letter);
      letters.push(s.letter);
    }
  }
  return letters;
}

function wordsOf(line: string): string[] {
  return line.replace(/[.,!?;:"']/g, '').trim().split(/\s+/).filter(Boolean);
}

interface HomeworkContent {
  activity_1_recognition: { instructions?: string; items: { audio_text: string; correct_answer: string; wrong_options: string[] }[] };
  activity_2_syntax: { instructions?: string; items: { scrambled_words: string[]; correct_order: string }[] };
  activity_3_production: { instructions?: string; prompt: string; target_words_to_detect?: string[]; example_response?: string };
  meta?: { hub?: string; title?: string; vocabulary?: string[]; lesson_id?: string | null };
}

/** Builds the exact 3-activity shape HomeworkPlayer expects, from the
 *  lesson's own basket/echo/roleplay scene data. */
export function buildHomeworkContent(scenes: Scene[], title: string, lessonRowId: string): HomeworkContent {
  // Activity 1 — vocab words from basket scenes (hit:true = target, hit:false = distractor pool).
  // Review lessons (e.g. L4-L6) have no basket/sound-model scenes at all, so fall back to
  // short echo-scene phrases — every lesson has those — rather than generic filler.
  const correctWords: string[] = [];
  const distractorPool: string[] = [];
  for (const s of scenes) {
    if (s.kind !== 'basket') continue;
    for (const item of s.items) {
      if (item.hit) correctWords.push(item.word);
      else distractorPool.push(item.word);
    }
  }
  if (correctWords.length === 0) {
    const echoPhrases = Array.from(
      new Set(scenes.filter((s): s is Extract<Scene, { kind: 'echo' }> => s.kind === 'echo').map((s) => s.word)),
    );
    correctWords.push(...echoPhrases);
    distractorPool.push(...echoPhrases);
  }
  const uniqueCorrect = Array.from(new Set(correctWords)).slice(0, 4);
  const uniqueDistractors = Array.from(new Set(distractorPool));
  const activity1Items = (uniqueCorrect.length > 0 ? uniqueCorrect : ['Hello!']).map((word, i) => {
    const wrongOptions = uniqueDistractors
      .filter((w) => w !== word)
      .slice(i, i + 3);
    while (wrongOptions.length < 2 && uniqueDistractors.length > 0) {
      wrongOptions.push(uniqueDistractors[(i + wrongOptions.length) % uniqueDistractors.length]);
    }
    return { audio_text: word, correct_answer: word, wrong_options: Array.from(new Set(wrongOptions)).slice(0, 3) };
  });

  // Activity 2 — short lines from echo/roleplay scenes, 3+ words, scrambled
  const candidateLines: string[] = [];
  for (const s of scenes) {
    if (s.kind === 'echo') candidateLines.push(s.word);
    if (s.kind === 'roleplay') candidateLines.push(...s.script.map((line) => line.line));
  }
  const goodLines = Array.from(new Set(candidateLines)).filter((l) => wordsOf(l).length >= 3).slice(0, 3);
  const activity2Items = (goodLines.length > 0 ? goodLines : ['Hello I am here']).map((line) => {
    const tokens = wordsOf(line);
    const scrambled = [...tokens].sort(() => Math.random() - 0.5);
    return { scrambled_words: scrambled, correct_order: tokens.join(' ') };
  });

  // Activity 3 — speaking prompt built from the strongest candidate line
  const speakingLine = goodLines[0] ?? activity2Items[0].correct_order;
  const targetWords = wordsOf(speakingLine).filter((w) => w.length > 2).slice(0, 4);

  return {
    activity_1_recognition: { instructions: 'Tap what you hear.', items: activity1Items },
    activity_2_syntax: { instructions: 'Put the words in the right order.', items: activity2Items },
    activity_3_production: {
      instructions: 'Say it out loud, just like in class!',
      prompt: speakingLine,
      target_words_to_detect: targetWords,
    },
    meta: { hub: 'playground', title, vocabulary: uniqueCorrect, lesson_id: lessonRowId },
  };
}

export async function completeSceneLesson({
  userId,
  lessonRowId,
  title,
  scenes,
}: CompleteSceneLessonArgs): Promise<CompleteSceneLessonResult> {
  const result: CompleteSceneLessonResult = {
    progressOk: false,
    phonicsLetters: [],
    phonicsOk: false,
    homeworkOk: false,
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

  // 3. Homework
  try {
    const content = buildHomeworkContent(scenes, title, lessonRowId);
    const { error } = await supabase.functions.invoke('create-lep1-homework', {
      body: { lessonId: lessonRowId, title: `Practice: ${title}`, content },
    });
    if (error) throw error;
    result.homeworkOk = true;
  } catch (err) {
    console.error('[sceneLessonCompletion] homework creation failed', err);
  }

  return result;
}
