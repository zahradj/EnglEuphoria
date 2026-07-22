// Early Learner Mode validators.
// Activates for Playground (all levels) and Academy when CEFR ≤ A1.
// Pedagogical rationale: pre-readers/early readers learn from VISUAL + AUDIO,
// not from long text. These gates block lessons that try to teach them with
// paragraphs, abstract questions, or text-only multiple-choice options.

import type { QAIssue, QALesson, QASlide, QAActivity } from '../types';

const EARLY_CEFRS = new Set(['Pre-A1', 'A1']);

function isEarlyLearner(lesson: QALesson): boolean {
  if (lesson.hub === 'Playground') return true;
  if (lesson.hub === 'Academy' && EARLY_CEFRS.has(lesson.cefr)) return true;
  return false;
}

const ABSTRACT_PROMPT_RE =
  /\b(why|how come|explain|describe in detail|in your own words|elaborate|justify|compare and contrast|what do you think about)\b/i;

function wordCount(s: string): number {
  return (s.trim().match(/\b[\w'-]+\b/g) ?? []).length;
}

function slideTotalWords(slide: QASlide): number {
  let n = 0;
  if (slide.title) n += wordCount(slide.title);
  if (slide.body_text) n += wordCount(slide.body_text);
  if (slide.grammar_explanation) n += wordCount(slide.grammar_explanation);
  for (const ex of slide.examples ?? []) n += wordCount(ex);
  for (const a of slide.activities ?? []) {
    if (typeof a.content === 'string') n += wordCount(a.content);
    else if (a.content && typeof a.content === 'object') {
      const c = a.content as Record<string, any>;
      if (typeof c.prompt === 'string') n += wordCount(c.prompt);
      if (typeof c.question === 'string') n += wordCount(c.question);
      if (typeof c.instruction === 'string') n += wordCount(c.instruction);
    }
  }
  return n;
}

function hasVoice(slide: QASlide): boolean {
  const s = slide as any;
  const v = s.voice ?? s.content?.voice;
  return Boolean(v && typeof v === 'object' && typeof v.text === 'string' && v.text.trim());
}

function isChoiceActivity(a: QAActivity): boolean {
  const t = (a.type ?? '').toLowerCase();
  return /^(multiple|mcq|match|matching|drag|drag_drop|listen_and_match|sound_discrimination)/.test(t);
}

function optionsLackImages(a: QAActivity): boolean {
  if (!a.content || typeof a.content !== 'object') return false;
  const c = a.content as Record<string, any>;
  const options: any[] = c.options ?? c.choices ?? c.pairs ?? c.items ?? [];
  if (!Array.isArray(options) || options.length === 0) return false;
  // Every option needs an image-bearing field. We accept image / image_url /
  // image_prompt / picture / icon (icons are visual too).
  return options.some((o) => {
    if (!o || typeof o !== 'object') return true;
    const keys = ['image', 'image_url', 'image_prompt', 'picture', 'icon', 'asset'];
    return !keys.some((k) => typeof o[k] === 'string' && o[k].trim());
  });
}

function instructionText(a: QAActivity): string {
  if (!a.content || typeof a.content !== 'object') return '';
  const c = a.content as Record<string, any>;
  return [c.prompt, c.question, c.instruction]
    .filter((x): x is string => typeof x === 'string')
    .join(' ');
}

// 1) Text-density: ≤12 words per slide total for early learners.
export function validateEarlyLearnerTextDensity(lesson: QALesson): QAIssue[] {
  if (!isEarlyLearner(lesson)) return [];
  const out: QAIssue[] = [];
  for (const s of lesson.slides ?? []) {
    const n = slideTotalWords(s);
    if (n > 12) {
      out.push({
        code: 'EARLY_LEARNER_TEXT_DENSITY',
        domain: 'activity',
        severity: 'block',
        message: `Slide ${s.id} has ${n} words. Early learners need ≤12 words per slide — replace with image + voice.`,
        locator: { slideId: s.id },
        suggestion: 'Shrink to one short imperative (≤6 words) and let the picture + voice teach.',
        auto_repairable: true,
      });
    }
  }
  return out;
}

// 2) Text-only choice options — must be visual.
export function validateEarlyLearnerVisualOptions(lesson: QALesson): QAIssue[] {
  if (!isEarlyLearner(lesson)) return [];
  const out: QAIssue[] = [];
  for (const s of lesson.slides ?? []) {
    for (const a of s.activities ?? []) {
      if (!isChoiceActivity(a)) continue;
      if (optionsLackImages(a)) {
        out.push({
          code: 'EARLY_LEARNER_TEXT_ONLY_OPTIONS',
          domain: 'activity',
          severity: 'block',
          message: `Activity ${a.id} on slide ${s.id} uses text-only options. Early learners need image options.`,
          locator: { slideId: s.id, activityId: a.id },
          suggestion: 'Give every option an image_prompt (and label optional).',
          auto_repairable: true,
        });
      }
    }
  }
  return out;
}

// 3) Missing voice — every slide must have voice.text for non-readers.
export function validateEarlyLearnerVoice(lesson: QALesson): QAIssue[] {
  if (!isEarlyLearner(lesson)) return [];
  const out: QAIssue[] = [];
  for (const s of lesson.slides ?? []) {
    if (!hasVoice(s)) {
      out.push({
        code: 'EARLY_LEARNER_MISSING_VOICE',
        domain: 'activity',
        severity: 'block',
        message: `Slide ${s.id} has no voice.text. Early learners cannot read instructions — add a ≤6-word spoken prompt.`,
        locator: { slideId: s.id },
        suggestion: 'Add { voice: { text: "Tap the cat.", autoPlay: true } }.',
        auto_repairable: true,
      });
    }
  }
  return out;
}

// 4) Abstract / open-ended prompts — block "why / explain / describe".
export function validateEarlyLearnerAbstractPrompts(lesson: QALesson): QAIssue[] {
  if (!isEarlyLearner(lesson)) return [];
  const out: QAIssue[] = [];
  for (const s of lesson.slides ?? []) {
    for (const a of s.activities ?? []) {
      const text = instructionText(a);
      if (ABSTRACT_PROMPT_RE.test(text)) {
        out.push({
          code: 'EARLY_LEARNER_ABSTRACT_QUESTION',
          domain: 'activity',
          severity: 'block',
          message: `Activity ${a.id} on slide ${s.id} uses an abstract prompt ("why/explain/describe"). Early learners need concrete point-and-name tasks.`,
          locator: { slideId: s.id, activityId: a.id },
          suggestion: 'Rewrite as "Tap the …", "Match …", "Drag the …".',
          auto_repairable: true,
        });
      }
    }
  }
  return out;
}
