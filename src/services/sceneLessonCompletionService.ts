import { supabase } from '@/integrations/supabase/client';

/**
 * Runs when a student finishes a scene-based Playground lesson — either
 * the Little Explorers Phonics family (Pre-A1, `unit1/scenes.ts`) or the
 * Welcome Town family (A1/A2, `welcome-town(-a2)/scenes.ts`) — from the
 * Playground dashboard. Three writes, each best-effort — a failure in one
 * shouldn't block the celebration UI or the others:
 *   1. student_lesson_progress — marks the map node complete.
 *   2. student_phonics_progress — adds the letters this lesson teaches to
 *      the "Map of Sounds" tab.
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
  script?: { line: string }[];
  items?: { word: string; hit?: boolean; img?: string }[];
}

interface CompleteSceneLessonArgs {
  userId: string;
  lessonRowId: string;
  title: string;
  scenes: CompletionScene[];
}

interface CompleteSceneLessonResult {
  progressOk: boolean;
  phonicsLetters: string[];
  phonicsOk: boolean;
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

function wordsOf(line: string): string[] {
  return line.replace(/[.,!?;:"']/g, '').trim().split(/\s+/).filter(Boolean);
}

interface HomeworkContent {
  activity_1_recognition: {
    instructions?: string;
    items: {
      audio_text: string; correct_answer: string; wrong_options: string[];
      /** Pre-A1/Welcome Town kids can't read the choice text yet — these
       *  let the player show a real picture from the lesson (the item's
       *  own icon, or the vocab scene's own illustration) next to each
       *  choice instead of relying on the word alone. Keyed by the
       *  (lowercased) word so it covers the correct answer and every
       *  wrong option from one map. */
      choice_images?: Record<string, string>;
    }[];
  };
  activity_2_syntax: {
    instructions?: string;
    items: {
      // "Listen & Point" shape (preferred) — tap the picture that matches
      // the phrase you just heard. No token requires being told apart by
      // its text, unlike arranging word tiles: function words ("my",
      // "is", "am") have no vocabulary icon of their own, so even with
      // word_images below, some tiles are always text-only — which a
      // non-reading student can't use at all. Only built when the lesson
      // has at least 2 distinct phrase illustrations to choose between;
      // falls back to the tile-arranging shape otherwise.
      audio_text?: string;
      correct_image?: string;
      image_options?: string[];
      // Tile-arranging shape (fallback for lessons without enough scene
      // art, and for already-generated homework rows from before this
      // shape existed).
      scrambled_words?: string[]; correct_order?: string;
      /** Same reasoning as choice_images above, one entry per token. */
      word_images?: Record<string, string>;
      /** The lesson's own illustration for this line, if one exists —
       *  shown above the activity so the picture (not the text) anchors
       *  what's being built. */
      image?: string;
    }[];
  };
  activity_3_production: { instructions?: string; prompt: string; target_words_to_detect?: string[]; example_response?: string; image?: string };
  meta?: { hub?: string; title?: string; vocabulary?: string[]; lesson_id?: string | null };
}

const norm = (s: string) => s.trim().toLowerCase();

/** Builds the exact 3-activity shape HomeworkPlayer expects, from the
 *  lesson's own basket/echo/roleplay scene data — including, wherever
 *  possible, the same images the lesson itself used, since most Pre-A1
 *  and many Welcome Town students can't read yet. Homework built purely
 *  from text would silently assume a skill the lesson never required. */
export function buildHomeworkContent(scenes: CompletionScene[], title: string, lessonRowId: string): HomeworkContent {
  // A word/phrase -> illustration lookup, built once from every scene in
  // the lesson: basket item icons for single words, and each echo/meet
  // scene's own full-bleed background for whatever phrase it teaches.
  const imageByText = new Map<string, string>();
  for (const s of scenes) {
    if (s.kind === 'basket' && s.items) {
      for (const item of s.items) {
        if (item.img) imageByText.set(norm(item.word), item.img);
      }
    }
    if (s.kind === 'echo' && s.word && s.bg) imageByText.set(norm(s.word), s.bg);
    if (s.kind === 'meet' && s.bg) {
      const phrase = s.repeat ?? s.word;
      if (phrase) imageByText.set(norm(phrase), s.bg);
    }
  }

  // Activity 1 — vocab words from basket scenes (hit:true = target, hit:false = distractor pool).
  // Welcome Town lessons have no 'basket' kind at all, and Pre-A1 review
  // lessons (e.g. L4-L6) skip it too — both fall back to short echo-scene
  // phrases (every lesson family has those) rather than generic filler.
  const correctWords: string[] = [];
  const distractorPool: string[] = [];
  for (const s of scenes) {
    if (s.kind !== 'basket' || !s.items) continue;
    for (const item of s.items) {
      if (item.hit) correctWords.push(item.word);
      else distractorPool.push(item.word);
    }
  }
  if (correctWords.length === 0) {
    const echoPhrases = Array.from(
      new Set(scenes.filter((s) => s.kind === 'echo' && s.word).map((s) => s.word!)),
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
    const finalWrong = Array.from(new Set(wrongOptions)).slice(0, 3);
    const choiceImages: Record<string, string> = {};
    for (const w of [word, ...finalWrong]) {
      const img = imageByText.get(norm(w));
      if (img) choiceImages[norm(w)] = img;
    }
    return {
      audio_text: word,
      correct_answer: word,
      wrong_options: finalWrong,
      choice_images: Object.keys(choiceImages).length > 0 ? choiceImages : undefined,
    };
  });

  // Activity 2 — short lines from echo/roleplay scenes, 3+ words
  const candidateLines: string[] = [];
  for (const s of scenes) {
    if (s.kind === 'echo' && s.word) candidateLines.push(s.word);
    if (s.kind === 'roleplay' && s.script) candidateLines.push(...s.script.map((line) => line.line));
  }
  const goodLines = Array.from(new Set(candidateLines)).filter((l) => wordsOf(l).length >= 3).slice(0, 3);
  const finalLines = goodLines.length > 0 ? goodLines : ['Hello I am here'];

  // Phrase-level illustrations for those same lines (a subset of
  // imageByText — only the meet/echo scenes, which are whole spoken
  // lines, not single basket words). Need at least 2 distinct images
  // across the WHOLE lesson to build a real multiple-choice round;
  // below that there's nothing to tell apart by picture.
  const phraseImagePool = Array.from(
    new Set(
      scenes
        .filter((s) => (s.kind === 'echo' || s.kind === 'meet') && s.bg)
        .map((s) => s.bg!),
    ),
  );
  const canDoPictureMatch = phraseImagePool.length >= 2;

  const activity2Items = finalLines.map((line) => {
    const correctImage = imageByText.get(norm(line));
    if (canDoPictureMatch && correctImage) {
      const distractorImages = phraseImagePool.filter((img) => img !== correctImage);
      const chosenDistractors = distractorImages.slice(0, 3);
      const imageOptions = [correctImage, ...chosenDistractors].sort(() => Math.random() - 0.5);
      return { audio_text: line, correct_image: correctImage, image_options: imageOptions };
    }
    // Fallback: no distinct picture for this specific line (or not enough
    // art in the lesson overall) — tile-arranging, still audio + word
    // images wherever those individually exist.
    const tokens = wordsOf(line);
    const scrambled = [...tokens].sort(() => Math.random() - 0.5);
    const wordImages: Record<string, string> = {};
    for (const t of tokens) {
      const img = imageByText.get(norm(t));
      if (img) wordImages[norm(t)] = img;
    }
    return {
      scrambled_words: scrambled,
      correct_order: tokens.join(' '),
      word_images: Object.keys(wordImages).length > 0 ? wordImages : undefined,
      image: correctImage,
    };
  });

  // Activity 3 — speaking prompt built from the strongest candidate line
  const speakingLine = goodLines[0] ?? activity2Items[0].correct_order ?? finalLines[0];
  const targetWords = wordsOf(speakingLine).filter((w) => w.length > 2).slice(0, 4);

  return {
    activity_1_recognition: { instructions: 'Tap what you hear.', items: activity1Items },
    activity_2_syntax: { instructions: canDoPictureMatch ? 'Listen, then tap the matching picture.' : 'Put the words in the right order.', items: activity2Items },
    activity_3_production: {
      instructions: 'Say it out loud, just like in class!',
      prompt: speakingLine,
      target_words_to_detect: targetWords,
      image: imageByText.get(norm(speakingLine)),
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

  // 3. Homework
  try {
    const content = buildHomeworkContent(scenes, title, lessonRowId);
    const { data, error } = await supabase.functions.invoke('create-lep1-homework', {
      body: { lessonId: lessonRowId, title: `Practice: ${title}`, content },
    });
    if (error) throw error;
    result.homeworkOk = true;
    result.homeworkAssignmentId = (data as { assignment_id?: string } | null)?.assignment_id ?? null;
  } catch (err) {
    console.error('[sceneLessonCompletion] homework creation failed', err);
  }

  return result;
}
