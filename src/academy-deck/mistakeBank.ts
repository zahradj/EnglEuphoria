// The student's Mistake Bank (owner / handbook: "logging error patterns to the next Mistake Bank"): the slides where they needed more than one try, kept on this device
// so they can look back at them. Fails soft (a blocked or private window just forgets). It is NOT yet read by Remember? or the Daily 10 (that needs the database).
export interface BankEntry { lesson: string; slide: string; label: string; wrong: number; on: string }
const KEY = 'academy-mistake-bank-v1';
const CAP = 40;

export function loadBank(): BankEntry[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(v) ? (v as BankEntry[]).filter((e) => e && typeof e.label === 'string') : [];
  } catch {
    return [];
  }
}

/** Replace this lesson's entries with today's list (one entry per slide, the latest count), keep the newest CAP overall. */
export function saveLessonMistakes(lesson: string, list: { id: string; label: string; wrong: number }[], today = new Date().toISOString().slice(0, 10)): void {
  try {
    const others = loadBank().filter((e) => e.lesson !== lesson);
    const mine = list.filter((m) => m.wrong > 0).map((m) => ({ lesson, slide: m.id, label: m.label, wrong: m.wrong, on: today }));
    window.localStorage.setItem(KEY, JSON.stringify([...mine, ...others].slice(0, CAP)));
  } catch { /* blocked storage: nothing is remembered, nothing breaks */ }
}
