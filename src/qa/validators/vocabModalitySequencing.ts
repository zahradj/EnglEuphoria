import type { QAIssue, QALesson } from '../types';

/**
 * Ensures every target vocab item appears in AUDIO before appearing in a QUIZ/CHECK.
 * Textual sequencing is already enforced by vocabSequencing.ts; this adds the modality
 * layer: students should HEAR a word before being tested on it.
 *
 * Soft warning (auto-repairable by inserting a pre-teach audio block).
 */

const QUIZ_KINDS = new Set([
  'multiple', 'multiple_choice', 'mcq',
  'matching', 'match_pictures',
  'fill_blank', 'fill_in_blank',
  'drag_drop', 'sound_discrimination',
  'dictation_builder', 'listen_and_match',
]);

const AUDIO_KINDS = new Set([
  'audio', 'tts', 'chant', 'song', 'story_audio', 'pronunciation_model',
]);

interface SlideLike {
  id: string;
  type?: string;
  kind?: string;
  activity_type?: string;
  audio_url?: string | null;
  text?: string;
  body?: string;
  word?: string;
  target_word?: string;
  vocab?: string[];
  answers?: string[];
  question?: string;
}

function slideKind(s: SlideLike): string {
  return (s.type ?? s.kind ?? s.activity_type ?? '').toLowerCase();
}

function hasAudio(s: SlideLike): boolean {
  return Boolean(s.audio_url) || AUDIO_KINDS.has(slideKind(s));
}

function isQuiz(s: SlideLike): boolean {
  return QUIZ_KINDS.has(slideKind(s));
}

function wordsIn(s: SlideLike): string[] {
  const bag = [
    s.word,
    s.target_word,
    ...(s.vocab ?? []),
    ...(s.answers ?? []),
    s.text,
    s.body,
    s.question,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return bag.split(/[^a-z']+/).filter(Boolean);
}

export function validateVocabModalitySequencing(lesson: QALesson): QAIssue[] {
  const targets = ((lesson as any).target_vocab ?? []).map((w: string) => w.toLowerCase());
  if (targets.length === 0) return [];

  const heard = new Set<string>();
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides as SlideLike[]) {
    const words = new Set(wordsIn(slide));

    if (hasAudio(slide)) {
      for (const t of targets) if (words.has(t)) heard.add(t);
    }

    if (isQuiz(slide)) {
      for (const t of targets) {
        if (words.has(t) && !heard.has(t)) {
          issues.push({
            code: 'VOCAB_QUIZZED_BEFORE_AUDIO',
            domain: 'vocab' as any,
            severity: 'warn',
            message: `Target word "${t}" is quizzed in slide ${slide.id} but never heard in an audio block first.`,
            suggestion: `Insert a pronunciation/audio block introducing "${t}" before slide ${slide.id}.`,
            auto_repairable: true,
          });
        }
      }
    }
  }
  return issues;
}
