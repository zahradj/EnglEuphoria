/**
 * BossRoundGame — standalone Arcade wrapper around vocab-games/BossRound.
 *
 * Adapts arcade content_json → VocabTarget[] and reports completion.
 * Expected content_json shape (flexible):
 *   { targets?: [{word, definition, example?, image_url?}], hub?, cefr? }
 * Falls back to `words: [{word, definition}]` or `vocab: […]`.
 */

import { useMemo } from 'react';
import BossRound from '@/vocab-games/games/BossRound';
import type { Hub, VocabTarget, Cefr } from '@/vocab-games/types';
import { HUB_THEMES, themeStyle } from '@/vocab-games/theme';

interface Props {
  content: any;
  hub?: Hub;
  cefr?: Cefr;
  catalogId?: string | null;
  onComplete?: (result?: { correct: number; total: number; victory: boolean }) => void;
}

function normalizeTargets(content: any): VocabTarget[] {
  const raw =
    (Array.isArray(content?.targets) && content.targets) ||
    (Array.isArray(content?.words) && content.words) ||
    (Array.isArray(content?.vocab) && content.vocab) ||
    [];
  return raw
    .map((t: any): VocabTarget | null => {
      const word = (t?.word ?? t?.term ?? t?.headword ?? '').toString().trim();
      const definition = (t?.definition ?? t?.meaning ?? t?.gloss ?? '').toString().trim();
      if (!word || !definition) return null;
      return {
        word: word.toLowerCase(),
        definition,
        example: t?.example ?? undefined,
        image_url: t?.image_url ?? null,
      };
    })
    .filter(Boolean) as VocabTarget[];
}

export default function BossRoundGame({ content, hub, cefr, catalogId, onComplete }: Props) {
  const resolvedHub: Hub = hub ?? (content?.hub as Hub) ?? 'academy';
  const resolvedCefr: Cefr = cefr ?? (content?.cefr as Cefr) ?? 'A2';
  const targets = useMemo(() => normalizeTargets(content), [content]);
  const theme = HUB_THEMES[resolvedHub];

  if (targets.length < 2) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Boss Round needs at least 2 vocab targets with definitions.
      </div>
    );
  }

  return (
    <section
      className="w-full max-w-[720px] mx-auto p-5 rounded-2xl"
      style={{
        ...themeStyle(resolvedHub),
        background: `hsl(${theme['--vg-bg']})`,
        color: `hsl(${theme['--vg-text']})`,
      }}
      data-arcade-game="boss_round"
      data-hub={resolvedHub}
      data-cefr={resolvedCefr}
    >
      <BossRound
        targets={targets}
        hub={resolvedHub}
        cefr={resolvedCefr}
        seedKey={`arcade|${catalogId ?? 'boss_round'}|${resolvedHub}|${resolvedCefr}`}
        onDone={(s) => onComplete?.({ correct: s.correct, total: s.total, victory: s.victory })}
      />
    </section>
  );
}
