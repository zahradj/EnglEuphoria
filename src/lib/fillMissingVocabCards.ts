// Fill in missing definition/example on `vocab` slides by calling the
// ai-vocab-cards edge function. Mutates a shallow copy and returns it.

import { supabase } from '@/integrations/supabase/client';

interface VocabSlide {
  type: string;
  word?: string;
  definition?: string;
  example?: string;
  [k: string]: any;
}

export async function fillMissingVocabCards<T extends VocabSlide>(
  slides: T[],
  opts: { hub: 'academy' | 'success'; cefr?: string; topic?: string },
): Promise<{ slides: T[]; filled: number }> {
  const missingIdx: number[] = [];
  slides.forEach((s, i) => {
    if (s?.type !== 'vocab') return;
    const w = typeof s.word === 'string' ? s.word.trim() : '';
    if (!w) return;
    const hasDef = typeof s.definition === 'string' && s.definition.trim().length > 0;
    const hasEx = typeof s.example === 'string' && s.example.trim().length > 0;
    if (!hasDef || !hasEx) missingIdx.push(i);
  });
  if (missingIdx.length === 0) return { slides, filled: 0 };

  const words = missingIdx.map((i) => (slides[i].word || '').trim());
  try {
    const { data, error } = await supabase.functions.invoke('ai-vocab-cards', {
      body: { words, hub: opts.hub, cefr: opts.cefr, topic: opts.topic },
    });
    if (error || !data || (data as any).error) {
      console.warn('[fillMissingVocabCards] edge error', error || (data as any)?.message);
      return { slides, filled: 0 };
    }
    const cards: Array<{ word: string; definition: string; example: string }> = (data as any).cards || [];
    const out = slides.slice() as T[];
    let filled = 0;
    missingIdx.forEach((idx, k) => {
      const c = cards[k];
      if (!c) return;
      const cur = out[idx];
      const next: T = { ...cur };
      if ((!cur.definition || !cur.definition.trim()) && c.definition) {
        next.definition = c.definition;
        filled++;
      }
      if ((!cur.example || !cur.example.trim()) && c.example) {
        next.example = c.example;
        filled++;
      }
      out[idx] = next;
    });
    return { slides: out, filled };
  } catch (e) {
    console.warn('[fillMissingVocabCards] threw', e);
    return { slides, filled: 0 };
  }
}
