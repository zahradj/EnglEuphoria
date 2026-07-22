// -ed pronunciation classification (Rule 5).
// HARD-blocks phonics blocks targeting the "-ed ending" rule when:
//   - student-facing rule text is missing (teacher_notes alone insufficient), or
//   - example words are placed in the wrong /t/, /d/, /ɪd/ bucket.

import type { QAIssue, QALesson } from '../types';

// Final consonant sound classification for regular -ed verbs.
const IID_BASES = /(t|d)$/i;                                 // wanted, ended → /ɪd/
const T_BASES   = /(p|k|f|s|sh|ch|x|ss|ce|gh)$/i;            // walked, kissed → /t/
// everything else (vowels + voiced consonants) → /d/

export function classifyEd(word: string): 't' | 'd' | 'ɪd' {
  const stem = word.toLowerCase().replace(/ed$/, '').replace(/i$/, 'y'); // tried → try
  if (IID_BASES.test(stem)) return 'ɪd';
  if (T_BASES.test(stem)) return 't';
  return 'd';
}

const ED_KEYS = /ed[-_ ]?ending|ed[-_ ]?pronunciation|past[-_ ]?ed/i;

export function validateEdPronunciation(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides ?? []) {
    for (const act of slide.activities ?? []) {
      const pattern =
        (act.content?.pattern as string) ??
        (act.content?.phonics_pattern as string) ??
        (act.content?.rule_id as string) ??
        '';
      if (!ED_KEYS.test(pattern) && !ED_KEYS.test(act.purpose ?? '')) continue;

      const studentRule =
        pickStr(act.content?.student_rule) ||
        pickStr(act.content?.rule_explanation) ||
        pickStr(act.content?.rule) ||
        pickStr(act.content?.instructions);
      if (!studentRule || studentRule.length < 12) {
        issues.push({
          code: 'PHONICS_ED_RULE_MISSING',
          domain: 'activity',
          severity: 'block',
          message: `-ed pronunciation activity ${act.id} is missing a student-facing rule explanation (teacher_notes alone is insufficient).`,
          locator: { slideId: slide.id, activityId: act.id },
          suggestion: 'Add a short student-facing rule: /t/ after voiceless sounds, /d/ after voiced sounds, /ɪd/ after /t/ or /d/.',
          auto_repairable: true,
        });
      }

      const examples: Array<{ word: string; category: string }> = collectExamples(act.content);
      for (const e of examples) {
        if (!e.word) continue;
        const expected = classifyEd(e.word);
        const claimed = normaliseCategory(e.category);
        if (claimed && claimed !== expected) {
          issues.push({
            code: 'PHONICS_ED_CATEGORY_MISMATCH',
            domain: 'language',
            severity: 'block',
            message: `Word "${e.word}" classified as /${claimed}/ but the -ed rule requires /${expected}/.`,
            locator: { slideId: slide.id, activityId: act.id },
            suggestion: `Move "${e.word}" into the /${expected}/ group.`,
            auto_repairable: true,
          });
        }
      }
    }
  }

  return issues;
}

function pickStr(v: any): string {
  return typeof v === 'string' ? v.trim() : '';
}

function normaliseCategory(s: string): 't' | 'd' | 'ɪd' | null {
  const t = (s ?? '').toString().toLowerCase().replace(/[\/\s]/g, '');
  if (t === 't') return 't';
  if (t === 'd') return 'd';
  if (t === 'ɪd' || t === 'id') return 'ɪd';
  return null;
}

function collectExamples(content: any): Array<{ word: string; category: string }> {
  const out: Array<{ word: string; category: string }> = [];
  if (!content) return out;
  // Bucket shape: { groups: { "t": ["walked"], "d": ["played"], "ɪd": ["wanted"] } }
  const buckets = content.groups ?? content.buckets ?? content.categories;
  if (buckets && typeof buckets === 'object') {
    for (const [cat, words] of Object.entries(buckets)) {
      if (!Array.isArray(words)) continue;
      for (const w of words) out.push({ word: String(w), category: cat });
    }
  }
  // Flat list of {word, category}
  const items = content.items ?? content.examples ?? content.words;
  if (Array.isArray(items)) {
    for (const it of items) {
      if (it && typeof it === 'object' && (it.word || it.text)) {
        out.push({ word: String(it.word ?? it.text), category: String(it.category ?? it.sound ?? '') });
      }
    }
  }
  return out;
}
