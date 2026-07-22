// Generation-time vocab deduper + canonical caser.
// - Collapses duplicates by lowercase headword, keeping the richest entry.
// - Normalises headword to lowercase unless it is a proper noun.

const PROPER_NOUNS = new Set(['english', 'london', 'paris', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

interface Card {
  word?: string; headword?: string; term?: string;
  definition?: string; meaning?: string;
  example?: string; example_sentence?: string; sentence?: string;
  image_prompt?: string; imagePrompt?: string; image?: string;
  [k: string]: any;
}

export function normalizeVocabCards(cards: Card[]): Card[] {
  if (!Array.isArray(cards)) return cards;
  const map = new Map<string, Card>();
  for (const c of cards) {
    const raw = (c.word ?? c.headword ?? c.term ?? '').toString().trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    const word = PROPER_NOUNS.has(key) ? capitalise(key) : key;
    const incoming = { ...c, word, headword: word, term: word };
    if (!map.has(key)) {
      map.set(key, incoming);
    } else {
      map.set(key, mergeRichest(map.get(key)!, incoming));
    }
  }
  return Array.from(map.values());
}

function mergeRichest(a: Card, b: Card): Card {
  const pick = (x: any, y: any) => (richness(x) >= richness(y) ? x : y);
  return {
    ...a,
    ...b,
    definition: pick(a.definition ?? a.meaning, b.definition ?? b.meaning),
    example: pick(a.example ?? a.example_sentence ?? a.sentence, b.example ?? b.example_sentence ?? b.sentence),
    image_prompt: pick(a.image_prompt ?? a.imagePrompt ?? a.image, b.image_prompt ?? b.imagePrompt ?? b.image),
  };
}

function richness(v: any): number {
  return typeof v === 'string' ? v.trim().length : 0;
}
function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
