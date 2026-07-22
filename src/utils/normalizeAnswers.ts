// Normalizes legacy single-string multi-answer fields into `answers: string[]`.
// Safe to run on any activity content blob; mutates a deep copy.

export function normalizeAnswers<T = any>(content: T): T {
  if (!content || typeof content !== 'object') return content;
  const clone: any = Array.isArray(content) ? [...(content as any)] : { ...(content as any) };
  for (const [k, v] of Object.entries(clone)) {
    if (Array.isArray(v)) {
      clone[k] = v.map((entry) => normalizeAnswers(entry));
    } else if (v && typeof v === 'object') {
      clone[k] = normalizeAnswers(v);
    }
  }
  if (
    typeof clone.answer === 'string' &&
    /,|;|\|/.test(clone.answer) &&
    !Array.isArray(clone.answers)
  ) {
    clone.answers = clone.answer
      .split(/[,;|]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
    delete clone.answer;
  }
  return clone as T;
}
