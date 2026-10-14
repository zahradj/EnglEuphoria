import { HELP_LANGS, HELP_TOPICS, type HelpLang, type HelpTopic } from './knowledge';

/**
 * Lower-case, strip accents / Arabic diacritics, unify Arabic letter variants and Turkish dotless i,
 * and drop punctuation, so "Annuler ?", "ANNULER" and "annuler" are the same word.
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ARABIC = /[؀-ۿ]/;

/** Does question word `q` match keyword word `k`? Prefix match for Latin scripts, substring for Arabic (prefixes like و/ب/ال). */
function wordMatches(q: string, k: string): boolean {
  if (ARABIC.test(k)) return k.length >= 2 && q.includes(k);
  if (q === k) return true;
  return k.length >= 3 && q.startsWith(k);
}

export interface Scored {
  topic: HelpTopic;
  score: number;
}

export interface MatchResult {
  /** Language the question looks like it was written in (falls back to the interface language). */
  lang: HelpLang;
  /** Best topic, or null when nothing matched. */
  best: HelpTopic | null;
  /** Next best topics (for "you may also want to know"). */
  related: HelpTopic[];
}

function scoreKeywords(words: string[], joined: string, keywords: string[]): number {
  let total = 0;
  // A question word can score only once per topic, so a stem and its full form ("annul" + "annuler") don't double-count.
  const used = new Set<number>();
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (!kw) continue;
    const kWords = kw.split(' ');
    if (kWords.length === 1) {
      const idx = words.findIndex((w, i) => !used.has(i) && wordMatches(w, kWords[0]));
      if (idx >= 0) {
        used.add(idx);
        total += 2;
      }
    } else if (` ${joined}`.includes(` ${kw}`)) {
      // phrase must start at a word start ("schedule a lesson" must not match inside "reschedule a lesson")
      total += kWords.length * 3; // exact phrase beats loose words
    } else if (kWords.every((kk) => words.some((w) => wordMatches(w, kk)))) {
      total += kWords.length * 2;
    }
  }
  return total;
}

/** Find the best topic for a free-text question. `uiLang` breaks ties and is the fallback language. */
export function matchQuestion(question: string, uiLang: HelpLang = 'en', topics: HelpTopic[] = HELP_TOPICS): MatchResult {
  const joined = normalize(question);
  const words = joined.split(' ').filter(Boolean);
  if (!words.length) return { lang: uiLang, best: null, related: [] };

  // Score every topic in every language; the language with the strongest single hit is the question's language.
  const perLang = new Map<HelpLang, Scored[]>();
  for (const lang of HELP_LANGS) {
    perLang.set(
      lang,
      topics.map((topic) => ({ topic, score: scoreKeywords(words, joined, topic.keywords[lang]) })),
    );
  }
  const top = (l: HelpLang) => Math.max(0, ...perLang.get(l)!.map((s) => s.score));
  let lang: HelpLang = uiLang;
  for (const l of HELP_LANGS) if (top(l) > top(lang)) lang = l;

  // Topic score = best language hit (+ a little for the others, so mixed-language questions still work).
  const combined: Scored[] = topics.map((topic, i) => {
    const own = perLang.get(lang)![i].score;
    let others = 0;
    for (const l of HELP_LANGS) if (l !== lang) others = Math.max(others, perLang.get(l)![i].score);
    // other languages only help a topic the question's own language did not match (mixed-language questions);
    // they must not break a tie ('cancel' is a Spanish stem too)
    return { topic, score: own * 10 + (own === 0 ? others : 0) };
  });

  const ranked = combined.filter((s) => s.score > 0).sort((a, b) => b.score - a.score); // stable: array order breaks ties
  if (!ranked.length) return { lang: uiLang, best: null, related: [] };
  return { lang, best: ranked[0].topic, related: ranked.slice(1, 3).map((s) => s.topic) };
}

/** Normalise a UI language code ("fr-FR", "ar", "en-US") to a supported help language. */
export function toHelpLang(code: string | undefined | null): HelpLang {
  const root = (code ?? 'en').toLowerCase().split('-')[0];
  return (HELP_LANGS as readonly string[]).includes(root) ? (root as HelpLang) : 'en';
}
