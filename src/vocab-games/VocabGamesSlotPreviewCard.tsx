/**
 * VocabGamesSlotPreviewCard
 *
 * Author-facing wrapper around <VocabGamesSlot /> used inside Academy +
 * Success lesson creators. Shows:
 *   - Mode + hub badge
 *   - Boss ↔ Rescue variant pin controls (writes to localStorage via
 *     vocabGamesOverrides so the runtime slot honors the choice)
 *   - The live slot preview underneath
 *
 * Pin scope = lessonId (falls back to unitId). Deterministic rotation
 * still applies when Auto is selected.
 *
 * Pedagogy (senior-ai-edtech-architect):
 *   - Rescue = compassionate default for anxious/sensitive learners.
 *   - Boss   = competitive framing for confident cohorts.
 *   - Auto   = deterministic lesson-id parity (Boss on odd, Rescue on even).
 */

import { useEffect, useState } from 'react';
import VocabGamesSlot from './VocabGamesSlot';
import type { Cefr, Hub, VocabGamesMode, VocabTarget } from './types';
import {
  getPinnedGame,
  pinBossRound,
  pinRescueRound,
  unpinGame,
} from '@/lib/vocabGamesOverrides';
import { Shield, Heart, Shuffle } from 'lucide-react';

export interface VocabGamesSlotPreviewCardProps {
  hub: Hub;
  cefr: Cefr;
  lessonId: string;
  unitId?: string;
  unitTitle?: string;
  targets: VocabTarget[];
  mode?: VocabGamesMode;
  passThreshold?: number;
  maxGames?: number;
}

type Variant = 'auto' | 'boss' | 'rescue';

function readVariant(scope: string): Variant {
  const p = getPinnedGame(scope);
  if (p === 'boss_round') return 'boss';
  if (p === 'rescue_round') return 'rescue';
  return 'auto';
}

const HUB_ACCENT: Record<Hub, string> = {
  playground: 'from-orange-100 to-yellow-50 border-orange-200',
  academy: 'from-purple-100 to-indigo-50 border-purple-200',
  success: 'from-emerald-100 to-teal-50 border-emerald-200',
};

export default function VocabGamesSlotPreviewCard(
  props: VocabGamesSlotPreviewCardProps,
) {
  const scope = props.lessonId || props.unitId || '';
  const [variant, setVariant] = useState<Variant>(() => readVariant(scope));

  useEffect(() => {
    setVariant(readVariant(scope));
  }, [scope]);

  const apply = (next: Variant) => {
    setVariant(next);
    if (!scope) return;
    if (next === 'boss') pinBossRound(scope);
    else if (next === 'rescue') pinRescueRound(scope);
    else unpinGame(scope);
  };

  const mode = props.mode ?? 'lesson';
  const btn = (v: Variant, label: string, Icon: typeof Shield) => {
    const active = variant === v;
    return (
      <button
        key={v}
        type="button"
        onClick={() => apply(v)}
        className={[
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition',
          active
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500',
        ].join(' ')}
      >
        <Icon className="h-3 w-3" /> {label}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div
        className={[
          'rounded-xl border p-3 bg-gradient-to-br',
          HUB_ACCENT[props.hub],
        ].join(' ')}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
              Vocab Games Engine · {mode}
            </div>
            <div className="text-sm font-semibold text-slate-800">
              Boss ↔ Rescue variant
              {!scope ? (
                <span className="ml-2 text-xs font-normal text-amber-600">
                  (attach a lessonId to enable pinning)
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {btn('auto', 'Auto', Shuffle)}
            {btn('boss', 'Boss', Shield)}
            {btn('rescue', 'Rescue', Heart)}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
          {variant === 'boss' &&
            'Competitive framing — correct answers damage a hub-specific boss. Best for confident cohorts.'}
          {variant === 'rescue' &&
            'Compassionate framing — correct answers heal an ally. Recommended for anxious or sensitive learners.'}
          {variant === 'auto' &&
            'Deterministic rotation by lesson id (odd → Boss, even → Rescue). CEFR-scaled HP + rounds.'}
        </p>
      </div>

      <VocabGamesSlot
        hub={props.hub}
        cefr={props.cefr}
        lessonId={props.lessonId}
        unitId={props.unitId}
        unitTitle={props.unitTitle}
        targets={props.targets}
        mode={mode}
        passThreshold={props.passThreshold}
        maxGames={props.maxGames}
      />
    </div>
  );
}
