import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, ArrowRight, Check } from 'lucide-react';
import { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import type { GamePack, GameRound, ReinforcementTarget } from '@/coherence/types';
import { evaluateAnswer } from '@/utils/fuzzyAnswerEvaluator';

/**
 * Interactive Game Runner (Phase 3).
 * Plays deterministic rounds from a coherence GamePack. Each round is
 * rendered as a quick fuzzy-checked challenge bound to its reinforcement
 * target. Emits CustomEvent('game:event') for telemetry.
 */

interface Props {
  hub: HubType;
  pack: GamePack;
  targets: ReinforcementTarget[];
  onClose: () => void;
  onComplete?: (summary: { correct: number; total: number; xp: number }) => void;
  /** Optional word→image lookup. When provided, recognition rounds become image-tap. */
  vocabMedia?: Record<string, { imageUrl?: string; image_url?: string }>;
  /** Optional larger word pool used to build distractor tiles. */
  allVocab?: string[];
}

const HUB_ACCENT: Record<HubType, string> = {
  playground: '#FF9F1C',
  academy: '#A855F7',
  professional: '#059669',
};

const ROUND_VERB: Record<GameRound['type'], string> = {
  WordRush: 'Type the word fast!',
  SoundMatch: 'Type the word that matches the sound:',
  GrammarSprint: 'Complete the sentence:',
  DialogueDash: 'Reply to the line below:',
  MeaningMaze: 'Give the meaning of:',
  MemoryGrid: 'Recall the word for:',
  FluencyArcade: 'Use this in a sentence:',
  BossRound: 'BOSS — produce the answer:',
};

function emit(name: string, detail: Record<string, unknown>) {
  try {
    window.dispatchEvent(new CustomEvent('game:event', { detail: { name, ...detail } }));
  } catch {
    /* ignore */
  }
}

export default function GameRunner({ hub, pack, targets, onClose, onComplete, vocabMedia, allVocab }: Props) {
  const accent = HUB_ACCENT[hub];
  const hubKey = hub === 'professional' ? 'success' : (hub as 'playground' | 'academy');
  const targetMap = useMemo(
    () => Object.fromEntries(targets.map((t) => [t.id, t])),
    [targets],
  );

  // Phase 5: character binding — host the arcade with a cast member when present.
  const cast: Array<{ name?: string; emoji?: string; avatar_url?: string }> = Array.isArray((pack as any).cast)
    ? (pack as any).cast
    : [];
  const host = cast[0];
  const hostName = host?.name ?? 'Coach';
  const hostEmoji = host?.emoji ?? '🎲';

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [feedback, setFeedback] = useState<null | { ok: boolean; hint?: string }>(null);
  const [done, setDone] = useState(false);

  const round: GameRound | undefined = pack.rounds[idx];
  const target = round ? targetMap[round.reinforcement_target_id] : undefined;
  const label = target?.label ?? target?.skill_key ?? round?.scenario_key ?? '';

  // Recognition rounds become tap-tile MCQ. Production rounds keep typing.
  const PRODUCTION_TYPES = new Set<GameRound['type']>(['FluencyArcade', 'BossRound', 'GrammarSprint', 'DialogueDash']);
  const isProductionRound = round ? PRODUCTION_TYPES.has(round.type) || round.is_boss : false;

  const imageFor = (word: string): string => {
    const m = vocabMedia?.[word] || vocabMedia?.[word?.toLowerCase?.()];
    return m?.imageUrl || m?.image_url || '';
  };
  const tileImage = target ? imageFor(target.label) || imageFor(target.skill_key) : '';

  const tiles = useMemo(() => {
    if (!target) return [] as string[];
    const pool = new Set<string>();
    targets.forEach((t) => pool.add(t.label));
    (allVocab ?? []).forEach((w) => pool.add(w));
    pool.delete(target.label);
    const distractors = Array.from(pool).sort(() => Math.random() - 0.5).slice(0, 3);
    while (distractors.length < 3) distractors.push(['cat', 'dog', 'sun', 'tree', 'apple', 'ball'][distractors.length % 6]);
    return [target.label, ...distractors].sort(() => Math.random() - 0.5);
  }, [target, targets, allVocab, idx]);

  function commitResult(ok: boolean, transcript: string, closest?: string) {
    if (!round || !target) return;
    const gained = ok ? (round.is_boss ? 25 : 10) * round.difficulty_tier : 0;
    setFeedback({ ok, hint: ok ? undefined : `Answer: ${closest ?? target.label}` });
    if (ok) {
      setCorrect((c) => c + 1);
      setXp((v) => v + gained);
    }
    emit('round_result', {
      lessonId: pack.lessonId,
      round_id: round.id,
      type: round.type,
      target_id: round.reinforcement_target_id,
      is_boss: round.is_boss,
      ok,
      xp: gained,
      transcript,
    });
    window.setTimeout(() => {
      setFeedback(null);
      setInput('');
      if (idx + 1 >= pack.rounds.length) {
        emit('game_complete', { lessonId: pack.lessonId, correct, total: pack.rounds.length, xp });
        setDone(true);
        onComplete?.({ correct: correct + (ok ? 1 : 0), total: pack.rounds.length, xp: xp + gained });
      } else {
        setIdx((i) => i + 1);
      }
    }, 850);
  }

  function submit() {
    if (!round || !target) return;
    const result = evaluateAnswer(input, [target.label, target.skill_key], { hub: hubKey });
    commitResult(result.isCorrect, input, result.closestMatch);
  }

  function pickTile(word: string) {
    if (!round || !target || feedback) return;
    const ok = word.trim().toLowerCase() === target.label.trim().toLowerCase();
    commitResult(ok, word, target.label);
  }


  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden"
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 flex items-center justify-between text-white"
          style={{ background: accent }}
        >
          <div>
            <div className="text-xs opacity-90 uppercase tracking-wide flex items-center gap-1">
              <Zap size={12} /> Arcade — {pack.hub}
            </div>
            <div className="font-extrabold text-lg">
              {done ? 'Round Complete!' : `Round ${idx + 1} / ${pack.rounds.length}`}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold inline-flex items-center gap-1">
              <Trophy size={14} /> {xp} XP
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="min-w-10 min-h-10 rounded-full hover:bg-white/20 flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 min-h-[260px]">
          <AnimatePresence mode="wait">
            {!done && round && (
              <motion.div
                key={`round-${round.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-xs uppercase font-bold opacity-60 flex items-center gap-2">
                  <span>{round.type}</span>
                  <span>·</span>
                  <span>tier {round.difficulty_tier}</span>
                  {round.is_boss && (
                    <span className="text-rose-600 font-extrabold">⚔ BOSS</span>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  {host?.avatar_url ? (
                    <img
                      src={host.avatar_url}
                      alt={hostName}
                      className="w-12 h-12 rounded-full object-cover ring-2"
                      style={{ borderColor: accent }}
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ background: `${accent}22` }}
                    >
                      {hostEmoji}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-xs font-bold" style={{ color: accent }}>{hostName} says</div>
                    <div className="text-sm opacity-70">{ROUND_VERB[round.type]}</div>
                  </div>
                </div>
                {/* Prompt label: shows the target word (for typing rounds) or
                    a recognition cue + image for tap-tile rounds. */}
                {isProductionRound ? (
                  <div className="text-2xl font-extrabold text-slate-800">{label}</div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {tileImage ? (
                      <img
                        src={tileImage}
                        alt={label}
                        className="w-32 h-32 object-cover rounded-2xl ring-4 ring-white shadow-lg"
                      />
                    ) : (
                      <div className="text-3xl font-extrabold text-slate-800">{label}</div>
                    )}
                    <div className="text-xs uppercase tracking-wide opacity-60">Tap the right one</div>
                  </div>
                )}

                {isProductionRound ? (
                  <>
                    <input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && input.trim() && submit()}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-current outline-none text-lg"
                      style={{ color: accent }}
                      placeholder="Your answer…"
                      disabled={!!feedback}
                    />
                    <button
                      onClick={submit}
                      disabled={!input.trim() || !!feedback}
                      className="w-full px-5 py-3 rounded-xl font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: accent }}
                    >
                      Submit <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {tiles.map((w) => {
                      const img = imageFor(w);
                      const isAnswer = feedback && w.toLowerCase() === target?.label.toLowerCase();
                      return (
                        <button
                          key={w}
                          onClick={() => pickTile(w)}
                          disabled={!!feedback}
                          className={`relative rounded-2xl border-2 p-2 flex flex-col items-center gap-1 transition active:scale-95 ${
                            feedback && isAnswer
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 hover:border-current bg-white'
                          }`}
                          style={{ color: accent }}
                        >
                          {img ? (
                            <img src={img} alt={w} className="w-full aspect-square object-cover rounded-xl" />
                          ) : (
                            <div className="w-full aspect-square rounded-xl flex items-center justify-center text-3xl bg-slate-50">
                              🎴
                            </div>
                          )}
                          <div className="text-sm font-bold text-slate-800">{w}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {feedback && (
                  <div
                    className={`text-sm font-semibold flex items-center gap-2 ${
                      feedback.ok ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {feedback.ok ? <Check size={16} /> : <X size={16} />}
                    {feedback.ok ? `+${(round.is_boss ? 25 : 10) * round.difficulty_tier} XP` : feedback.hint}
                  </div>
                )}
              </motion.div>
            )}

            {done && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-3"
              >
                <div className="text-5xl">🏆</div>
                <h3 className="text-2xl font-extrabold text-slate-800">Great run!</h3>
                <p className="text-sm opacity-70">
                  {correct} / {pack.rounds.length} correct · {xp} XP
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold text-white"
                  style={{ background: accent }}
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
