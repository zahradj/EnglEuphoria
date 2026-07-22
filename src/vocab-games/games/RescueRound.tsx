/**
 * RescueRound — narrative variant of BossRound.
 *
 * Instead of damaging an enemy, correct answers HEAL an ally NPC who's in
 * danger. Wrong answers let the danger grow (timer/threat bar advances).
 * Same deterministic vocab contract as BossRound; different emotional frame
 * (compassionate, cooperative — great for Playground and review lessons).
 *
 * Dual-skill: senior-ai-edtech-architect + esl-game-studio.
 */

import { useEffect, useMemo, useState } from 'react';
import type { Cefr, Hub, VocabGameEvent, VocabTarget } from '../types';
import { HUB_THEMES } from '../theme';
import { useVocabGameIntelligence } from '@/games/intelligence/useVocabGameIntelligence';

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

interface RescueRoundProps {
  targets: VocabTarget[];
  hub: Hub;
  seedKey: string;
  cefr?: Cefr;
  onEvent?: (e: Omit<VocabGameEvent, 'game'>) => void;
  onDone?: (summary: { correct: number; total: number; ms: number; victory: boolean }) => void;
}

interface Round {
  word: string;
  options: string[];
  answer: string;
}

const ALLY_BY_HUB: Record<Hub, { name: string; emoji: string; safe: string; danger: string; rescued: string; lost: string }> = {
  playground: {
    name: 'Puffin',
    emoji: '🐥',
    safe: 'Nice! You helped Puffin!',
    danger: 'Oh no! Hurry!',
    rescued: 'Puffin is safe! 🎉',
    lost: "Puffin got scared — let's try again!",
  },
  academy: {
    name: 'The Scholar',
    emoji: '🧑‍🎓',
    safe: 'Good — one step closer.',
    danger: 'The window is closing.',
    rescued: 'Scholar rescued.',
    lost: 'Rescue attempt failed.',
  },
  success: {
    name: 'The Colleague',
    emoji: '🧑‍💼',
    safe: 'Solid save.',
    danger: 'Pressure rising.',
    rescued: 'Colleague secured.',
    lost: 'Window missed — regroup.',
  },
};

const CEFR_SCALING: Record<Cefr, { allyHp: number; threatMax: number; maxRounds: number }> = {
  'Pre-A1': { allyHp: 2, threatMax: 5, maxRounds: 3 },
  A1: { allyHp: 2, threatMax: 5, maxRounds: 4 },
  A2: { allyHp: 3, threatMax: 5, maxRounds: 5 },
  B1: { allyHp: 3, threatMax: 4, maxRounds: 5 },
  B2: { allyHp: 4, threatMax: 4, maxRounds: 6 },
  C1: { allyHp: 4, threatMax: 3, maxRounds: 6 },
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

export default function RescueRound({ targets, hub, seedKey, cefr, onEvent, onDone }: RescueRoundProps) {
  const theme = HUB_THEMES[hub];
  const ally = ALLY_BY_HUB[hub];
  const scaling = CEFR_SCALING[cefr ?? DEFAULT_CEFR] ?? CEFR_SCALING[DEFAULT_CEFR];
  const { allyHp: ALLY_MAX, threatMax: THREAT_MAX, maxRounds } = scaling;

  const playable = useMemo(
    () => targets.filter((t) => t.word && t.definition).slice(0, maxRounds),
    [targets, maxRounds],
  );

  const rounds: Round[] = useMemo(() => {
    return playable.map((t, i) => {
      const seed = hashString(`${seedKey}|rescue|${t.word}|${i}`);
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
  // Ally starts wounded; correct answers heal up to ALLY_MAX.
  const [allyHp, setAllyHp] = useState(1);
  const [threat, setThreat] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [flash, setFlash] = useState<'heal' | 'miss' | null>(null);
  const [correct, setCorrect] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [ended, setEnded] = useState(false);
  const intel = useVocabGameIntelligence({ cefr, words: rounds.map((r) => r.word) });
  const scaffolding = intel.decision.difficulty.scaffolding_boost;

  const total = rounds.length;
  const round = rounds[idx];
  const rescued = allyHp >= ALLY_MAX;
  const lost = threat >= THREAT_MAX;
  const finished = ended || idx >= total || rescued || lost;
  const victory = rescued || (idx >= total && correct >= Math.ceil(total / 2) && !lost);

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
        Rescue Round needs vocab targets with definitions.
      </div>
    );
  }

  const choose = (opt: string) => {
    if (picked || finished) return;
    const isCorrect = opt === round.answer;
    setPicked(opt);
    setFlash(isCorrect ? 'heal' : 'miss');
    const ms = Date.now() - startedAt;
    if (isCorrect) {
      setCorrect((n) => n + 1);
      setAllyHp((hp) => Math.min(ALLY_MAX, hp + 1));
      intel.onCorrect(round.word, ms);
    } else {
      setThreat((t) => Math.min(THREAT_MAX, t + 1));
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

  const Bar = ({
    value,
    max,
    label,
    color,
  }: {
    value: number;
    max: number;
    label: string;
    color: string;
  }) => (
    <div className="flex-1">
      <div className="text-[11px] uppercase tracking-widest opacity-70 mb-1">{label}</div>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2.5 rounded-full transition-all"
            style={{
              background: i < value ? `hsl(${color})` : `hsl(${theme['--vg-text']} / 0.12)`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Bar value={allyHp} max={ALLY_MAX} label={`${ally.name} · Safety`} color={theme['--vg-correct']} />
        <Bar value={threat} max={THREAT_MAX} label="Threat" color={theme['--vg-wrong']} />
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
              flash === 'heal'
                ? 'scale(1.12) rotate(3deg)'
                : flash === 'miss'
                  ? 'translateX(6px) scale(0.94)'
                  : 'none',
            filter: lost ? 'grayscale(0.6)' : 'none',
          }}
          aria-label={ally.name}
        >
          {finished && victory ? '🎉' : ally.emoji}
        </div>
        {flash && (
          <div
            className="absolute top-2 right-3 text-xs font-bold px-2 py-1 rounded-full"
            style={{
              background: `hsl(${flash === 'heal' ? theme['--vg-correct'] : theme['--vg-wrong']})`,
              color: 'white',
            }}
          >
            {flash === 'heal' ? `+1 ${ally.safe.split(' ')[0]}` : ally.danger}
          </div>
        )}
      </div>

      {finished ? (
        <div className="text-center py-4">
          <div className="text-lg font-semibold">{victory ? ally.rescued : ally.lost}</div>
          <div className="text-xs opacity-70 mt-1">
            {correct} / {total} correct
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs uppercase tracking-wide opacity-70 flex items-center justify-between">
            <span>Round {idx + 1} / {total} · Pick the meaning to help {ally.name}</span>
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
                Starts with: <b>{round.answer.charAt(0).toUpperCase()}</b>
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
