/**
 * VocabGamesSlot — the ONE component the host lesson mounts.
 *
 * PoC ships with two archetypes (MemoryGrid + MeaningMaze). Adding more is
 * additive: register in GAMES map, add to selector eligibility. No host-side
 * changes required.
 *
 * Hosts:
 *   Academy → academyVocabGamification injects a slide of type
 *             'vocab_games_slot' and the player renders <VocabGamesSlot>.
 *   Success → same pattern via successVocabGamification.
 *
 * The engine is intentionally decoupled: it takes props, emits events. It
 * knows nothing about slides, Supabase, SM-2, or observers. Host wires those.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  VocabGameEvent,
  VocabGameId,
  VocabGamesSlotProps,
} from './types';
import { hubCap, selectGames } from './selector';
import { HUB_THEMES, themeStyle } from './theme';
import { getPinnedGame } from '@/lib/vocabGamesOverrides';
import MemoryGrid from './games/MemoryGrid';
import MeaningMaze from './games/MeaningMaze';
import WordRush from './games/WordRush';
import DefinitionSprint from './games/DefinitionSprint';
import SoundMatch from './games/SoundMatch';
import BossRound from './games/BossRound';
import RescueRound from './games/RescueRound';
import { emitUnitCompleted } from '@/lib/unitProgressReport';

const GAME_LABELS: Record<VocabGameId, { child: string; teen: string; adult: string }> = {
  memory_grid: {
    child: 'Match the pairs!',
    teen: 'Memory Grid',
    adult: 'Term ↔ Definition Recall',
  },
  meaning_maze: {
    child: 'Pick the meaning!',
    teen: 'Meaning Maze',
    adult: 'Definition Selection',
  },
  word_rush: { child: 'Word Rush!', teen: 'Word Rush', adult: 'Rapid Recognition' },
  definition_sprint: {
    child: 'Sprint!',
    teen: 'Definition Sprint',
    adult: 'Timed Recall',
  },
  sound_match: {
    child: 'Listen and match!',
    teen: 'Sound Match',
    adult: 'Audio ↔ Term Match',
  },
  boss_round: {
    child: 'Beat the beast!',
    teen: 'Boss Round',
    adult: 'Boss Round · Retrieval Duel',
  },
  rescue_round: {
    child: 'Save the friend!',
    teen: 'Rescue Round',
    adult: 'Rescue Round · Cooperative Retrieval',
  },
};

/**
 * Pedagogical objective + how-to shown above every game.
 * Keeps learners (and observing teachers) anchored on the sub-skill.
 */
const GAME_OBJECTIVES: Record<
  VocabGameId,
  { objective: string; skill: string; how: string }
> = {
  memory_grid: {
    objective: 'Bind each word to its meaning.',
    skill: 'Form ↔ meaning recall',
    how: 'Flip two cards to find matching term + definition pairs.',
  },
  meaning_maze: {
    objective: 'Choose the correct meaning under mild time pressure.',
    skill: 'Receptive vocabulary',
    how: 'Read the word, tap the definition that fits best.',
  },
  word_rush: {
    objective: 'Recognise the target word quickly from its definition.',
    skill: 'Rapid retrieval',
    how: 'Read the definition, tap the word before the timer ends.',
  },
  definition_sprint: {
    objective: 'Recall the word from meaning with minimal cues.',
    skill: 'Productive retrieval',
    how: 'Read the definition, type the first letters of the word.',
  },
  sound_match: {
    objective: 'Link the spoken form to written meaning.',
    skill: 'Listening ↔ vocabulary',
    how: 'Tap play, then choose the word you heard.',
  },
  boss_round: {
    objective: 'Retrieve accurately under narrative pressure.',
    skill: 'Retrieval + fluency',
    how: 'Each correct answer damages the boss. Stay accurate to win.',
  },
  rescue_round: {
    objective: 'Retrieve accurately to protect your ally.',
    skill: 'Retrieval + fluency',
    how: 'Each correct answer heals your ally. No penalty for trying.',
  },
};

export default function VocabGamesSlot(props: VocabGamesSlotProps) {
  const {
    lessonId,
    unitId,
    unitTitle,
    studentName,
    hub,
    cefr,
    targets,
    maxGames,
    mode = 'lesson',
    passThreshold = 0.8,
    onEvent,
    onComplete,
  } = props;
  const theme = HUB_THEMES[hub];

  const [step, setStep] = useState(0);
  const [eventLog, setEventLog] = useState<VocabGameEvent[]>([]);
  const [bossOutcomes, setBossOutcomes] = useState<import('./types').BossOutcome[]>([]);
  const [reinforcing, setReinforcing] = useState(false);
  const [reinforceWords, setReinforceWords] = useState<string[] | null>(null);
  const startedAt = useRef(Date.now());

  // Effective targets: when reinforcing after a failed quiz, narrow to missed.
  const effectiveTargets = useMemo(() => {
    if (reinforcing && reinforceWords && reinforceWords.length >= 2) {
      const set = new Set(reinforceWords.map((w) => w.toLowerCase()));
      const filtered = targets.filter((t) => set.has((t.word || '').toLowerCase()));
      return filtered.length >= 2 ? filtered : targets;
    }
    return targets;
  }, [targets, reinforcing, reinforceWords]);

  // Effective mode: quiz failure switches into review-style practice loop.
  const effectiveMode = reinforcing ? 'review' : mode;

  const words = useMemo(
    () => effectiveTargets.map((t) => t.word).filter(Boolean),
    [effectiveTargets],
  );

  const modeCap = effectiveMode === 'quiz' ? 1 : effectiveMode === 'review' ? 2 : hubCap(hub);
  const sequence = useMemo(() => {
    if (effectiveMode === 'quiz') return ['meaning_maze'] as VocabGameId[];
    const picks = selectGames({
      hub,
      cefr,
      lessonId,
      words,
      maxGames: Math.min(maxGames ?? modeCap, modeCap),
    });
    // Teacher override: pin a preferred archetype for this lesson if set and
    // still eligible for the hub × CEFR pool.
    const pinned = getPinnedGame(lessonId);
    const withPin =
      pinned && picks.includes(pinned)
        ? [pinned, ...picks.filter((g) => g !== pinned)]
        : picks;
    // Boss ↔ Rescue variant rotation. Deterministic per lesson: even hash →
    // Rescue (compassionate), odd → Boss (competitive). Teacher pin wins.
    const parity = [...lessonId].reduce((a, c) => a + c.charCodeAt(0), 0) % 2;
    const preferRescue = parity === 0;
    const rotated = withPin.map((g) => {
      if (pinned === g) return g;
      if (preferRescue && g === 'boss_round' && !withPin.includes('rescue_round')) return 'rescue_round' as VocabGameId;
      if (!preferRescue && g === 'rescue_round' && !withPin.includes('boss_round')) return 'boss_round' as VocabGameId;
      return g;
    });
    if (effectiveMode === 'review') {
      return rotated
        .slice()
        .sort((a, b) => (a === 'meaning_maze' ? -1 : b === 'meaning_maze' ? 1 : 0))
        .slice(0, 2);
    }
    return rotated;
  }, [effectiveMode, hub, cefr, lessonId, words, maxGames, modeCap]);

  const handleEvent = useCallback(
    (game: VocabGameId, e: Omit<VocabGameEvent, 'game'>) => {
      const full: VocabGameEvent = { game, ...e };
      setEventLog((log) => [...log, full]);
      onEvent?.(full);
    },
    [onEvent],
  );

  const advance = useCallback(() => {
    if (step + 1 >= sequence.length) {
      const total = eventLog.length;
      const correct = eventLog.filter((e) => e.correct).length;
      const accuracy = total > 0 ? correct / total : 0;
      onComplete?.({
        mode: effectiveMode,
        accuracy,
        passed: effectiveMode === 'quiz' ? accuracy >= passThreshold : undefined,
        ms_elapsed: Date.now() - startedAt.current,
        events: eventLog,
        boss_outcomes: bossOutcomes,
      });
      // Auto-fire the Unit Progress Report when the unit quiz completes.
      if (effectiveMode === 'quiz' && unitId) {
        emitUnitCompleted({
          unitId,
          unitTitle,
          hub,
          cefr,
          studentName,
          quizAccuracy: accuracy,
          lessonsCompleted: 6,
          lessonsTotal: 6,
        });
      }
    }
    setStep((n) => n + 1);
  }, [
    step,
    sequence.length,
    eventLog,
    bossOutcomes,
    onComplete,
    effectiveMode,
    passThreshold,
    unitId,
    unitTitle,
    hub,
    cefr,
    studentName,
  ]);

  const seedKey = `${lessonId ?? 'anon'}|${hub}|${cefr}|${effectiveMode}|${reinforcing ? 'rf' : 'og'}|${step}`;

  if (effectiveTargets.length < 2) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Vocabulary reinforcement needs at least 2 target words.
      </div>
    );
  }

  const done = step >= sequence.length;
  const current = sequence[step];
  const label =
    current && GAME_LABELS[current] ? GAME_LABELS[current][theme.copyRegister] : '';

  const modeChip = reinforcing
    ? 'Reinforcement'
    : mode === 'quiz'
      ? 'Quiz'
      : mode === 'review'
        ? 'Review'
        : 'Vocab Games';


  return (
    <section
      className="w-full max-w-[720px] mx-auto p-5 rounded-2xl"
      style={{
        ...themeStyle(hub),
        background: `hsl(${theme['--vg-bg']})`,
        color: `hsl(${theme['--vg-text']})`,
      }}
      data-vocab-games-slot=""
      data-hub={hub}
      data-cefr={cefr}
    >
      <header className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-widest opacity-70">
            {modeChip} · Game {Math.min(step + 1, sequence.length)} of {sequence.length}
          </div>
          <div
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: `hsl(${theme['--vg-primary']})`,
              color: 'white',
            }}
          >
            {hub} · {cefr}{effectiveMode !== 'lesson' ? ` · ${effectiveMode}` : ''}
          </div>
        </div>
        {/* Progress bar — persistent orientation for the whole arc. */}
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: `hsl(${theme['--vg-primary']} / 0.15)` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={sequence.length}
          aria-valuenow={Math.min(step, sequence.length)}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(Math.min(step, sequence.length) / Math.max(sequence.length, 1)) * 100}%`,
              background: `hsl(${theme['--vg-primary']})`,
            }}
          />
        </div>
      </header>

      {done ? (() => {
        const total = eventLog.length;
        const correct = eventLog.filter((e) => e.correct).length;
        const accuracy = total > 0 ? correct / total : 0;
        const passed = accuracy >= passThreshold;
        const missedWords = Array.from(
          new Set(eventLog.filter((e) => !e.correct).map((e) => e.target_word)),
        );
        const canReinforce =
          effectiveMode === 'quiz' && !passed && missedWords.length >= 2 && !reinforcing;
        const startReinforcement = () => {
          try {
            window.dispatchEvent(
              new CustomEvent('vocab-arc:quiz-failed', {
                detail: { lessonId, hub, cefr, missed_words: missedWords, accuracy },
              }),
            );
          } catch { /* best-effort */ }
          setReinforceWords(missedWords);
          setEventLog([]);
          setStep(0);
          setReinforcing(true);
          startedAt.current = Date.now();
        };
        return (
          <div className="text-center py-10">
            <div className="text-2xl font-bold mb-2">
              {effectiveMode === 'quiz'
                ? passed
                  ? 'Quiz passed'
                  : `Quiz — ${Math.round(passThreshold * 100)}% needed`
                : reinforcing
                  ? 'Nice reinforcement round!'
                  : effectiveMode === 'review'
                    ? 'Review complete'
                    : theme.copyRegister === 'child'
                      ? 'Amazing work!'
                      : 'Reinforcement complete'}
            </div>
            <div className="text-sm opacity-70 mb-4">
              {correct} / {total} correct · {Math.round(accuracy * 100)}%
            </div>
            {canReinforce && (
              <button
                type="button"
                onClick={startReinforcement}
                className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
                style={{ background: `hsl(${theme['--vg-primary']})` }}
              >
                Practice weak words ({missedWords.length})
              </button>
            )}
            {reinforcing && !canReinforce && (
              <div className="text-xs opacity-60 mt-2">Reinforcement complete.</div>
            )}
          </div>
        );
      })() : (
        <div className="min-h-[320px]">
          {/* Objective banner — every game states its sub-skill up front. */}
          {current && GAME_OBJECTIVES[current] && (
            <div
              className="mb-4 rounded-xl p-3 border"
              style={{
                background: `hsl(${theme['--vg-primary']} / 0.08)`,
                borderColor: `hsl(${theme['--vg-primary']} / 0.25)`,
              }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-lg font-semibold leading-tight">{label}</h3>
                <span
                  className="text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap opacity-80"
                  style={{ color: `hsl(${theme['--vg-primary']})` }}
                >
                  {GAME_OBJECTIVES[current].skill}
                </span>
              </div>
              <p className="text-sm opacity-90 leading-snug">
                <span className="font-medium">Goal:</span>{' '}
                {GAME_OBJECTIVES[current].objective}
              </p>
              <p className="text-xs opacity-70 mt-1">
                {GAME_OBJECTIVES[current].how}
              </p>
            </div>
          )}
          {current === 'memory_grid' && (
            <MemoryGrid
              targets={effectiveTargets}
              hub={hub}
              seedKey={seedKey}
              onEvent={(e) => handleEvent('memory_grid', e)}
              onDone={advance}
            />
          )}
          {current === 'meaning_maze' && (
            <MeaningMaze
              targets={effectiveTargets}
              hub={hub}
              seedKey={seedKey}
              onEvent={(e) => handleEvent('meaning_maze', e)}
              onDone={advance}
            />
          )}
          {current === 'word_rush' && (
            <WordRush
              targets={effectiveTargets}
              hub={hub}
              seedKey={seedKey}
              onEvent={(e) => handleEvent('word_rush', e)}
              onDone={advance}
            />
          )}
          {current === 'definition_sprint' && (
            <DefinitionSprint
              targets={effectiveTargets}
              hub={hub}
              seedKey={seedKey}
              onEvent={(e) => handleEvent('definition_sprint', e)}
              onDone={advance}
            />
          )}
          {current === 'sound_match' && (
            <SoundMatch
              targets={effectiveTargets}
              hub={hub}
              seedKey={seedKey}
              onEvent={(e) => handleEvent('sound_match', e)}
              onDone={advance}
            />
          )}
          {current === 'boss_round' && (
            <BossRound
              targets={effectiveTargets}
              hub={hub}
              cefr={cefr}
              seedKey={seedKey}
              onEvent={(e) => handleEvent('boss_round', e)}
              onDone={(s) => {
                const outcome = {
                  hub,
                  cefr,
                  correct: s.correct,
                  total: s.total,
                  ms_elapsed: s.ms,
                  victory: s.victory,
                };
                setBossOutcomes((prev) => [...prev, outcome]);
                try {
                  window.dispatchEvent(
                    new CustomEvent('vocab-arc:boss-complete', {
                      detail: { lessonId, unitId, ...outcome },
                    }),
                  );
                } catch { /* best-effort */ }
                advance();
              }}
            />
          )}
          {current === 'rescue_round' && (
            <RescueRound
              targets={effectiveTargets}
              hub={hub}
              cefr={cefr}
              seedKey={seedKey}
              onEvent={(e) => handleEvent('rescue_round', e)}
              onDone={(s) => {
                const outcome = {
                  hub,
                  cefr,
                  correct: s.correct,
                  total: s.total,
                  ms_elapsed: s.ms,
                  victory: s.victory,
                };
                setBossOutcomes((prev) => [...prev, outcome]);
                try {
                  window.dispatchEvent(
                    new CustomEvent('vocab-arc:boss-complete', {
                      detail: { lessonId, unitId, variant: 'rescue', ...outcome },
                    }),
                  );
                } catch { /* best-effort */ }
                advance();
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}
