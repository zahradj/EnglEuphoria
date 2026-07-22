/**
 * BossRound — KhanQuest-inspired narrative wrapper for vocab reinforcement.
 *
 * Contract (dual-skill: senior-ai-edtech-architect + esl-game-studio):
 *   - Bound to lesson's ReinforcementTarget vocab (no filler, no invented words).
 *   - Deterministic problem generator: item = (word, correct definition, 3
 *     in-topic distractors) seeded by (seedKey|word|round). Same lesson always
 *     produces the same fight — critical for A/B + teacher trust.
 *   - Exercise-as-game-turn: correct answer = damage to boss; wrong = boss
 *     lands a hit. First HP bar to 0 ends the fight. Bravery > correctness
 *     (learner always finishes the arc even after wrong picks).
 *   - Hub theming via HUB_THEMES; no hardcoded hex. Playground copy is
 *     compassionate ("Nice try!"), Success copy is spare/professional.
 *   - Emits VocabGameEvent per round for observer/SM-2.
 *   - No text overlays, no typing (works at Playground). Visual state only.
 *
 * References:
 *   - KhanQuest src/combat/combat-screen.jsx (turn loop, HP bars)
 *   - khan-exercises problem generator pattern (deterministic variants)
 */

import { useEffect, useMemo, useState } from 'react';
import type { Cefr, Hub, VocabGameEvent, VocabTarget } from '../types';
import { HUB_THEMES } from '../theme';
import { useGameIntelligence } from '@/games/intelligence/useGameIntelligence';
import type { GameIntelligenceContext, DifficultyTier } from '@/games/intelligence/types';

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

interface BossRoundProps {
  targets: VocabTarget[];
  hub: Hub;
  seedKey: string;
  cefr?: Cefr;
  onEvent?: (e: Omit<VocabGameEvent, 'game'>) => void;
  onDone?: (summary: { correct: number; total: number; ms: number; victory: boolean }) => void;
  /** Optional Game Intelligence context — enables live difficulty/scaffolding. */
  intelligenceCtx?: GameIntelligenceContext;
  initialTier?: DifficultyTier;
}

interface Round {
  word: string;
  options: string[];
  answer: string;
}

const BOSS_BY_HUB: Record<Hub, { name: string; emoji: string; taunt: string; defeat: string }> = {
  playground: {
    name: 'The Grumble Beast',
    emoji: '🐲',
    taunt: 'Grrr! Try again!',
    defeat: 'You did it! 🎉',
  },
  academy: {
    name: 'Shadow Sentinel',
    emoji: '👾',
    taunt: 'Not enough...',
    defeat: 'Sentinel defeated.',
  },
  success: {
    name: 'The Cipher',
    emoji: '🗝️',
    taunt: 'Imprecise.',
    defeat: 'Cipher solved.',
  },
};

/**
 * CEFR difficulty scaling. Boss HP = hits required to defeat.
 * More HP + more rounds at higher CEFR = longer, more demanding fight.
 * Hero HP scales gently so learners still get to finish the arc.
 */
const CEFR_SCALING: Record<Cefr, { bossHp: number; heroHp: number; maxRounds: number }> = {
  'Pre-A1': { bossHp: 3, heroHp: 4, maxRounds: 3 },
  A1: { bossHp: 3, heroHp: 4, maxRounds: 4 },
  A2: { bossHp: 4, heroHp: 4, maxRounds: 5 },
  B1: { bossHp: 5, heroHp: 3, maxRounds: 5 },
  B2: { bossHp: 6, heroHp: 3, maxRounds: 6 },
  C1: { bossHp: 7, heroHp: 3, maxRounds: 6 },
};

const DEFAULT_CEFR: Cefr = 'A1';

function pickDistractors(correctWord: string, pool: VocabTarget[], seed: number): string[] {
  const others = pool.filter((t) => t.word !== correctWord && t.definition);
  const out: string[] = [];
  const seen = new Set<string>();
  let s = seed || 1;
  let guard = 0;
  while (out.length < 3 && guard < 24 && seen.size < others.length) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const t = others[s % others.length];
    if (!seen.has(t.word)) {
      seen.add(t.word);
      out.push(t.definition!);
    }
    guard++;
  }
  return out;
}

export default function BossRound({ targets, hub, seedKey, cefr, onEvent, onDone, intelligenceCtx, initialTier = 3 }: BossRoundProps) {
  const theme = HUB_THEMES[hub];
  const boss = BOSS_BY_HUB[hub];
  const scaling = CEFR_SCALING[cefr ?? DEFAULT_CEFR] ?? CEFR_SCALING[DEFAULT_CEFR];
  const { bossHp: BOSS_MAX, heroHp: HERO_MAX, maxRounds } = scaling;

  const playable = useMemo(
    () => targets.filter((t) => t.word && t.definition).slice(0, maxRounds),
    [targets, maxRounds],
  );

  const rounds: Round[] = useMemo(() => {
    return playable.map((t, i) => {
      const seed = hashString(`${seedKey}|boss|${t.word}|${i}`);
      const distractors = pickDistractors(t.word, playable, seed);
      const options = [t.definition!, ...distractors];
      const shuffled = options
        .map((opt, idx) => ({ opt, k: hashString(`${seed}|${idx}`) }))
        .sort((a, b) => a.k - b.k)
        .map((x) => x.opt);
      return { word: t.word, options: shuffled, answer: t.definition! };
    });
  }, [playable, seedKey]);

  const [idx, setIdx] = useState(0);
  const [bossHp, setBossHp] = useState(BOSS_MAX);
  const [heroHp, setHeroHp] = useState(HERO_MAX);
  const [picked, setPicked] = useState<string | null>(null);
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);
  const [correct, setCorrect] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [ended, setEnded] = useState(false);

  // Game Intelligence Layer — optional, no-op when ctx is absent.
  const intel = useGameIntelligence({
    ctx: intelligenceCtx ?? {
      cefr: (cefr ?? DEFAULT_CEFR) as any,
      target: null,
      intelligence: {
        learner_profile: { interests: [], age_band: 'teen' as any },
        error_patterns: [],
        review_priority: [],
        adaptive_support: { scaffolding: 0 as 0 | 1 | 2, hints_enabled: false },
        engagement_state: { fatigue: 0, momentum: 0 },
        speaking_confidence: { level: 0.5 },
      } as any,
      round_size: rounds.length,
    },
    initialTier,
    baseline: rounds.map((r) => ({
      id: r.word,
      payload: r.word,
      provenance: 'target' as const,
      value: 1,
    })),
  });
  const scaffolding = intel.decision.difficulty.scaffolding_boost;

  const total = rounds.length;
  const round = rounds[idx];
  const finished = ended || idx >= total || bossHp <= 0 || heroHp <= 0;
  const victory = bossHp <= 0 || (idx >= total && correct >= Math.ceil(total / 2));

  useEffect(() => {
    if (finished && !ended) {
      setEnded(true);
      onDone?.({
        correct,
        total,
        ms: Date.now() - startedAt,
        victory,
      });
    }
  }, [finished, ended, correct, total, startedAt, victory, onDone]);

  if (total === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Boss Round needs vocab targets with definitions.
      </div>
    );
  }

  const choose = (opt: string) => {
    if (picked || finished) return;
    const isCorrect = opt === round.answer;
    setPicked(opt);
    setFlash(isCorrect ? 'hit' : 'miss');
    const ms = Date.now() - startedAt;
    if (isCorrect) {
      setCorrect((n) => n + 1);
      setBossHp((hp) => Math.max(0, hp - 1));
      intel.onCorrect(round.word, ms);
    } else {
      setHeroHp((hp) => Math.max(0, hp - 1));
      intel.onWrong(round.word, opt, round.answer, ms);
    }
    onEvent?.({
      round_index: idx,
      correct: isCorrect,
      target_word: round.word,
      ms_elapsed: ms,
    });
    setTimeout(() => {
      setPicked(null);
      setFlash(null);
      setIdx((n) => n + 1);
    }, 900);
  };

  const HpBar = ({ hp, max, label, color }: { hp: number; max: number; label: string; color: string }) => (
    <div className="flex-1">
      <div className="text-[11px] uppercase tracking-widest opacity-70 mb-1">{label}</div>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2.5 rounded-full transition-all"
            style={{
              background: i < hp ? `hsl(${color})` : `hsl(${theme['--vg-text']} / 0.12)`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <HpBar hp={heroHp} max={HERO_MAX} label="You" color={theme['--vg-primary']} />
        <HpBar hp={bossHp} max={BOSS_MAX} label={boss.name} color={theme['--vg-wrong']} />

      </div>

      <div
        className="relative flex items-center justify-center py-6 rounded-xl overflow-hidden"
        style={{
          background: `hsl(${theme['--vg-primary']} / 0.08)`,
          borderRadius: theme['--vg-radius'],
          minHeight: 120,
        }}
      >
        <div
          className="text-6xl transition-transform"
          style={{
            transform:
              flash === 'hit'
                ? 'translateX(-10px) scale(0.92) rotate(-6deg)'
                : flash === 'miss'
                  ? 'scale(1.08)'
                  : 'none',
            filter: flash === 'hit' ? 'grayscale(0.4)' : 'none',
          }}
          aria-label={boss.name}
        >
          {finished && victory ? '💥' : boss.emoji}
        </div>
        {flash && (
          <div
            className="absolute top-2 right-3 text-xs font-bold px-2 py-1 rounded-full"
            style={{
              background: `hsl(${flash === 'hit' ? theme['--vg-correct'] : theme['--vg-wrong']})`,
              color: 'white',
            }}
          >
            {flash === 'hit' ? '−1 HP' : boss.taunt}
          </div>
        )}
      </div>

      {finished ? (
        <div className="text-center py-4">
          <div className="text-lg font-semibold">
            {victory ? boss.defeat : 'Regroup and try again!'}
          </div>
          <div className="text-xs opacity-70 mt-1">
            {correct} / {total} correct
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs uppercase tracking-wide opacity-70 flex items-center justify-between">
            <span>Round {idx + 1} / {total} · Which meaning matches?</span>
            {scaffolding > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: `hsl(${theme['--vg-primary']} / 0.15)`, color: `hsl(${theme['--vg-primary']})` }}
              >
                {scaffolding === 2 ? '💡 Extra hint' : '💡 Hint'}
              </span>
            )}
          </div>
          <div
            className="text-2xl font-bold text-center py-3 rounded-lg"
            style={{
              background: `hsl(${theme['--vg-card']})`,
              color: `hsl(${theme['--vg-primary']})`,
              borderRadius: theme['--vg-radius'],
            }}
          >
            {round.word}
            {scaffolding >= 2 && (
              <div className="text-xs font-normal opacity-70 mt-1">
                First letter: <b>{round.answer.charAt(0).toUpperCase()}</b>
              </div>
            )}
          </div>
          <div className="grid gap-2.5">
            {round.options.map((opt) => {
              const isPicked = picked === opt;
              const isRight = opt === round.answer;
              let bg = `hsl(${theme['--vg-card']})`;
              let color = `hsl(${theme['--vg-text']})`;
              if (picked && isRight) {
                bg = `hsl(${theme['--vg-correct']})`;
                color = 'white';
              } else if (isPicked && !isRight) {
                bg = `hsl(${theme['--vg-wrong']})`;
                color = 'white';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(opt)}
                  className="text-left px-4 py-3 transition-all"
                  style={{
                    background: bg,
                    color,
                    border: `2px solid hsl(${theme['--vg-primary']} / 0.2)`,
                    borderRadius: theme['--vg-radius'],
                    cursor: picked ? 'default' : 'pointer',
                    fontSize: '0.95rem',
                    lineHeight: 1.35,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
