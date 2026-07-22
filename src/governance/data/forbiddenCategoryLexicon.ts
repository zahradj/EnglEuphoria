// Keyword sets per forbidden topical category.
// Used by vocabEngine to detect off-theme drift.
// Word-boundary matching, case-insensitive.

export const FORBIDDEN_CATEGORY_LEXICON: Record<string, string[]> = {
  'business meetings': [
    'kpi', 'stakeholder', 'quarterly', 'boardroom', 'agenda', 'synergy',
    'roadmap', 'roi', 'pipeline', 'merger', 'acquisition', 'shareholder',
  ],
  'environmental science': [
    'biodiversity', 'ecosystem', 'carbon', 'emission', 'sustainability',
    'pollutant', 'photosynthesis', 'deforestation', 'greenhouse',
  ],
  'medical terminology': [
    'diagnosis', 'symptom', 'prognosis', 'antibiotic', 'pathology',
    'oncology', 'cardiology', 'hypertension', 'prescription', 'dosage',
  ],
  'corporate': [
    'kpi', 'stakeholder', 'shareholder', 'merger', 'boardroom', 'executive',
    'workflow', 'deliverable', 'quarterly', 'compliance', 'procurement',
  ],
  'nursery': [
    'binky', 'paci', 'nappy', 'wee-wee', 'tum-tum', 'din-din', 'beddy-bye',
  ],
  'cartoon': [
    'whoosh', 'kaboom', 'kapow', 'zoinks', 'wabbit',
  ],
  'teen-slang': [
    'yeet', 'sus', 'bussin', 'no cap', 'slay', 'rizz', 'lowkey', 'highkey',
  ],
  'exam-prep': [
    'ielts', 'toefl', 'rubric', 'band score', 'task achievement', 'examiner',
  ],
  'workplace': [
    'manager', 'colleague', 'deadline', 'meeting room', 'office politics',
    'salary', 'promotion', 'overtime',
  ],
  'boardroom': [
    'board', 'chair', 'minutes', 'motion', 'resolution', 'quorum',
  ],
  'toys': [
    'teddy', 'rattle', 'pacifier', 'crib', 'stroller',
  ],
};

/** Returns category names whose keywords appear in the given text. */
export function detectForbiddenCategories(
  text: string,
  forbidden: string[],
): { category: string; hits: string[] }[] {
  const lower = text.toLowerCase();
  const out: { category: string; hits: string[] }[] = [];
  for (const cat of forbidden) {
    const words = FORBIDDEN_CATEGORY_LEXICON[cat.toLowerCase()] ?? FORBIDDEN_CATEGORY_LEXICON[cat];
    if (!words) continue;
    const hits: string[] = [];
    for (const w of words) {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(lower)) hits.push(w);
    }
    if (hits.length) out.push({ category: cat, hits });
  }
  return out;
}
