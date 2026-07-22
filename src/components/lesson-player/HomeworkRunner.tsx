import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Sparkles, Mic, PenLine, Headphones, BookText } from 'lucide-react';
import { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import type { HomeworkPack, HomeworkTask } from '@/coherence/types';
import {
  type CardProgress,
  buildHandForHub,
  pickNextCard,
  getDirection,
  applyCorrect,
  applyFail,
  isLearnedForHub,
} from '@/coherence/handOfCards';
import { evaluateAnswer } from '@/utils/fuzzyAnswerEvaluator';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interactive Homework Runner (Phase 3).
 * Plays the Hand-of-Cards drill_plan first (fuzzy-evaluated), then walks the
 * learner through each freeform task. Emits CustomEvent('hw:event') for the
 * observer pipeline to consume.
 */

interface Props {
  hub: HubType;
  pack: HomeworkPack;
  onClose: () => void;
  onComplete?: (summary: { correct: number; total: number }) => void;
  /** Optional word→image lookup. When provided, receptive drills become image-tap. */
  vocabMedia?: Record<string, { imageUrl?: string; image_url?: string }>;
  /** Optional larger word pool for distractor tiles. */
  allVocab?: string[];
}

const HUB_ACCENT: Record<HubType, string> = {
  playground: '#FF9F1C',
  academy: '#A855F7',
  professional: '#059669',
};

const MODALITY_ICON: Record<HomeworkTask['modality'], React.ReactNode> = {
  speaking: <Mic size={14} />,
  listening: <Headphones size={14} />,
  reading: <BookText size={14} />,
  writing: <PenLine size={14} />,
  mixed: <Sparkles size={14} />,
};

function emit(name: string, detail: Record<string, unknown>) {
  try {
    window.dispatchEvent(new CustomEvent('hw:event', { detail: { name, ...detail } }));
  } catch {
    /* ignore */
  }
}

// Phase 4: best-effort persistence of homework attempts.
// Silent on failures (no auth, no UUID pack id, RLS denial) so the runner UX
// never blocks on the network. Only fires when packId is a real UUID.
const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function persistAttempt(args: {
  packId: string;
  taskId: string;
  taskType: string;
  targetId?: string;
  transcript?: string;
  success: boolean;
}) {
  try {
    if (!UUID_RX.test(args.packId)) return;
    const { data: auth } = await supabase.auth.getUser();
    const studentId = auth?.user?.id;
    if (!studentId) return;
    await supabase.from('homework_attempts').insert({
      student_id: studentId,
      pack_id: args.packId,
      task_id: args.taskId,
      task_type: args.taskType,
      reinforcement_target_id: args.targetId ?? null,
      transcript: args.transcript ?? null,
      success: args.success,
    });
  } catch {
    /* swallow */
  }
}

export default function HomeworkRunner({ hub, pack, onClose, onComplete, vocabMedia, allVocab }: Props) {
  const accent = HUB_ACCENT[hub];
  const hubKey = hub === 'professional' ? 'success' : (hub as 'playground' | 'academy');

  const drillCards = pack.drill_plan?.cards ?? [];
  const [hand, setHand] = useState<CardProgress[]>(() =>
    buildHandForHub(drillCards.map((c) => c.skill_key), hubKey),
  );
  const labelByKey = useMemo(
    () => Object.fromEntries(drillCards.map((c) => [c.skill_key, c.label])),
    [drillCards],
  );

  const [phase, setPhase] = useState<'drill' | 'tasks' | 'done'>(
    hand.length > 0 ? 'drill' : 'tasks',
  );
  const [turn, setTurn] = useState(0);
  const [drillCorrect, setDrillCorrect] = useState(0);
  const [drillTotal, setDrillTotal] = useState(0);
  const [currentCard, setCurrentCard] = useState<CardProgress | null>(
    () => (hand.length > 0 ? hand[0] : null),
  );
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<null | { ok: boolean; hint?: string }>(null);

  const [taskIdx, setTaskIdx] = useState(0);
  const [taskInput, setTaskInput] = useState('');
  const [taskFeedback, setTaskFeedback] = useState<null | { ok: boolean; hint?: string }>(null);
  const [tasksDone, setTasksDone] = useState(0);

  const currentDir = currentCard ? getDirection(currentCard) : 'receptive';

  const imageFor = (word: string): string => {
    const m = vocabMedia?.[word] || vocabMedia?.[word?.toLowerCase?.()];
    return m?.imageUrl || m?.image_url || '';
  };
  const currentLabel = currentCard ? (labelByKey[currentCard.key] ?? currentCard.key) : '';
  const currentImg = currentCard ? imageFor(currentLabel) || imageFor(currentCard.key) : '';
  // Image-tap mode kicks in for receptive direction whenever ≥2 drill cards
  // have images, so learners tap a picture instead of typing.
  const imageMode = currentDir === 'receptive'
    && drillCards.filter((c) => imageFor(c.label) || imageFor(c.skill_key)).length >= 2;
  const drillTiles = useMemo(() => {
    if (!currentCard) return [] as string[];
    const pool = new Set<string>();
    drillCards.forEach((c) => pool.add(c.label));
    (allVocab ?? []).forEach((w) => pool.add(w));
    pool.delete(currentLabel);
    const distractors = Array.from(pool).sort(() => Math.random() - 0.5).slice(0, 3);
    while (distractors.length < 3) distractors.push(['cat', 'dog', 'sun', 'tree', 'apple', 'ball'][distractors.length % 6]);
    return [currentLabel, ...distractors].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard?.key, turn]);


  function advanceDrill(nextHand: CardProgress[], nextTurn: number) {
    const allLearned = nextHand.every((c) => isLearnedForHub(c, hubKey));
    if (allLearned) {
      emit('drill_complete', { lessonId: pack.lessonId, correct: drillCorrect, total: drillTotal });
      setPhase(pack.tasks.length > 0 ? 'tasks' : 'done');
      setCurrentCard(null);
      return;
    }
    setCurrentCard(pickNextCard(nextHand, nextTurn));
  }

  function submitDrill() {
    if (!currentCard) return;
    const label = labelByKey[currentCard.key] ?? currentCard.key;
    const result = evaluateAnswer(input, [label, currentCard.key], { hub: hubKey });
    const ok = result.isCorrect;
    const nextTurn = turn + 1;
    const updated = ok
      ? applyCorrect(currentCard, currentDir, nextTurn)
      : applyFail(currentCard, currentDir, nextTurn);
    const nextHand = hand.map((c) => (c.key === updated.key ? updated : c));
    setHand(nextHand);
    setTurn(nextTurn);
    setDrillTotal((t) => t + 1);
    if (ok) setDrillCorrect((c) => c + 1);
    setFeedback({ ok, hint: ok ? undefined : `Answer: ${result.closestMatch}` });
    emit('drill_attempt', {
      lessonId: pack.lessonId,
      skill_key: currentCard.key,
      direction: currentDir,
      ok,
    });
    void persistAttempt({
      packId: (pack as any).id ?? pack.lessonId,
      taskId: `drill:${currentCard.key}`,
      taskType: 'drill_card',
      targetId: currentCard.key,
      transcript: input,
      success: ok,
    });
    window.setTimeout(() => {
      setFeedback(null);
      setInput('');
      advanceDrill(nextHand, nextTurn);
    }, 900);
  }

  function pickDrillTile(word: string) {
    if (!currentCard || feedback) return;
    const ok = word.trim().toLowerCase() === currentLabel.trim().toLowerCase();
    const nextTurn = turn + 1;
    const updated = ok
      ? applyCorrect(currentCard, currentDir, nextTurn)
      : applyFail(currentCard, currentDir, nextTurn);
    const nextHand = hand.map((c) => (c.key === updated.key ? updated : c));
    setHand(nextHand);
    setTurn(nextTurn);
    setDrillTotal((t) => t + 1);
    if (ok) setDrillCorrect((c) => c + 1);
    setFeedback({ ok, hint: ok ? undefined : `Answer: ${currentLabel}` });
    emit('drill_attempt', {
      lessonId: pack.lessonId,
      skill_key: currentCard.key,
      direction: currentDir,
      ok,
      mode: 'image_tap',
    });
    void persistAttempt({
      packId: (pack as any).id ?? pack.lessonId,
      taskId: `drill:${currentCard.key}`,
      taskType: 'drill_image_tap',
      targetId: currentCard.key,
      transcript: word,
      success: ok,
    });
    window.setTimeout(() => {
      setFeedback(null);
      setInput('');
      advanceDrill(nextHand, nextTurn);
    }, 900);
  }

  function nextTask() {
    setTaskInput('');
    setTaskFeedback(null);
    if (taskIdx + 1 >= pack.tasks.length) {
      emit('homework_complete', {
        lessonId: pack.lessonId,
        tasksDone: tasksDone + 1,
        drillCorrect,
        drillTotal,
      });
      setPhase('done');
      onComplete?.({ correct: drillCorrect + tasksDone + 1, total: drillTotal + pack.tasks.length });
    } else {
      setTaskIdx((i) => i + 1);
    }
  }

  function submitTask() {
    const task = pack.tasks[taskIdx];
    setTasksDone((d) => d + 1);
    emit('task_attempt', {
      lessonId: pack.lessonId,
      task_id: task.id,
      type: task.type,
      modality: task.modality,
      written_length: taskInput.length,
    });
    void persistAttempt({
      packId: (pack as any).id ?? pack.lessonId,
      taskId: task.id,
      taskType: String(task.type),
      targetId: task.reinforcement_target_id,
      transcript: taskInput,
      success: true,
    });
    setTaskFeedback({ ok: true });
    window.setTimeout(nextTask, 700);
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
            <div className="text-xs opacity-90 uppercase tracking-wide">Homework Runner</div>
            <div className="font-extrabold text-lg">
              {phase === 'drill' && 'Quick Word Drill'}
              {phase === 'tasks' && `Task ${taskIdx + 1} of ${pack.tasks.length}`}
              {phase === 'done' && 'All done! 🎉'}
            </div>
            {(pack.scene_phrase || pack.unit_theme) && (
              <div
                className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                title="Same world as your lesson"
              >
                <span aria-hidden>🌍</span>
                {pack.scene_phrase || pack.unit_theme}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="min-w-10 min-h-10 rounded-full hover:bg-white/20 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 min-h-[260px]">
          <AnimatePresence mode="wait">
            {phase === 'drill' && currentCard && (
              <motion.div
                key={`drill-${currentCard.key}-${turn}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-xs uppercase font-bold opacity-60">
                  {imageMode ? 'Tap the picture' : currentDir === 'receptive' ? 'Recognize' : 'Produce'}
                </div>

                {imageMode ? (
                  <>
                    <div className="text-center">
                      <div className="inline-block text-3xl font-extrabold text-slate-800 px-4 py-2 rounded-xl bg-slate-50">
                        {currentLabel}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {drillTiles.map((w) => {
                        const img = imageFor(w);
                        const isAnswer = feedback && w.toLowerCase() === currentLabel.toLowerCase();
                        return (
                          <button
                            key={w}
                            onClick={() => pickDrillTile(w)}
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
                                🖼️
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {currentImg && (
                        <img src={currentImg} alt={currentLabel} className="w-20 h-20 object-cover rounded-2xl ring-2 ring-white shadow" />
                      )}
                      <div className="text-2xl font-extrabold text-slate-800 flex-1">
                        {currentDir === 'receptive'
                          ? `What does "${currentLabel}" mean? Type it back.`
                          : `Type the word for this picture:`}
                      </div>
                    </div>
                    <input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && input.trim() && submitDrill()}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-current outline-none text-lg"
                      style={{ color: accent }}
                      placeholder="Type your answer…"
                      disabled={!!feedback}
                    />
                    <button
                      onClick={submitDrill}
                      disabled={!input.trim() || !!feedback}
                      className="w-full px-5 py-3 rounded-xl font-bold text-white disabled:opacity-50"
                      style={{ background: accent }}
                    >
                      Check
                    </button>
                  </>
                )}

                {feedback && (
                  <div
                    className={`text-sm font-semibold flex items-center gap-2 ${
                      feedback.ok ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {feedback.ok ? <Check size={16} /> : <X size={16} />}
                    {feedback.ok ? 'Nice!' : feedback.hint}
                  </div>
                )}
                <div className="text-xs opacity-60 text-center">
                  Drill score: {drillCorrect} / {drillTotal}
                </div>
              </motion.div>
            )}

            {phase === 'tasks' && pack.tasks[taskIdx] && (
              <motion.div
                key={`task-${taskIdx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-xs uppercase font-bold opacity-60">
                  {MODALITY_ICON[pack.tasks[taskIdx].modality]}
                  {pack.tasks[taskIdx].modality} · ~{pack.tasks[taskIdx].estimated_minutes} min
                </div>
                <p className="text-lg text-slate-800 leading-snug">
                  {pack.tasks[taskIdx].prompt}
                </p>
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-current outline-none min-h-[110px]"
                  style={{ color: accent }}
                  placeholder={
                    pack.tasks[taskIdx].modality === 'speaking'
                      ? 'Say it out loud, then jot a note here…'
                      : 'Write your answer…'
                  }
                  disabled={!!taskFeedback}
                />
                {taskFeedback?.ok && (
                  <div className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                    <Check size={16} /> Logged. Great work!
                  </div>
                )}
                <button
                  onClick={submitTask}
                  disabled={!!taskFeedback}
                  className="w-full px-5 py-3 rounded-xl font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: accent }}
                >
                  {taskIdx + 1 === pack.tasks.length ? 'Finish' : 'Next'} <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="text-5xl">🌟</div>
                <h3 className="text-2xl font-extrabold text-slate-800">Homework complete!</h3>
                <p className="text-sm opacity-70">
                  Drill: {drillCorrect}/{drillTotal} · Tasks: {tasksDone}/{pack.tasks.length}
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
