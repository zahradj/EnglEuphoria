import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAcademyAudio } from '@/hooks/useAcademyAudio';
import { sfx } from '@/lib/academy/sfx';
import { prefersReducedMotion } from '@/lib/academy/playerSafety';
import type { AnswerEvent } from '@/pages/AcademyDemo';

/**
 * THE LABYRINTH EXPEDITION — an original Academy mechanic where USING THE TARGET LANGUAGE is how you win.
 *
 *  1. PLAN      The forecast shows N dangers. You can carry only `slots` tools out of a bigger set (some are
 *               plausible-but-wrong). A real decision, not a quiz.
 *  2. EXPEDITION You meet each danger and must justify the tool you packed by BUILDING the sentence
 *               "We took <tool> <link> <purpose>" from chips. The game reacts to your grammar: the wrong link
 *               gets the exact rule (to + base verb / so that + subject + could), a purpose that belongs to a
 *               different tool gets a meaning hint. You cannot win by guessing the order of chips.
 *  3. LOG       You keep an Expedition Log of the sentences YOU built, with stars, and can hear it read back.
 *
 * Student-comfort rules: tap-only (no drag needed), every control >= 44px, high-contrast chips, no timers,
 * no lives — a wrong try only shows a hint. Spoken output goes through useAcademyAudio (recorded/cached voice
 * pipeline), never speechSynthesis.
 */
export interface ExpeditionItem { id: string; label: string; sentence: string; image_url: string }
export interface ExpeditionPhrase { text: string; kind: 'base' | 'clause'; ok: boolean }
export interface ExpeditionDanger { id: string; text: string; image_url: string; item: string; phrases: ExpeditionPhrase[] }
export interface ExpeditionSlide {
  type: 'expedition_game';
  title?: string;
  intro?: string;
  slots?: number;
  items: ExpeditionItem[];
  dangers: ExpeditionDanger[];
}

const LINKS = ['to', 'in order to', 'so that'] as const;
type Link = (typeof LINKS)[number];
type Stage = 'plan' | 'play' | 'log';

// Deterministic-per-mount shuffle so chips don't jump around on every re-render.
function useShuffled<T>(arr: T[], seed: string): T[] {
  return useMemo(() => {
    const a = [...arr];
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
    for (let i = a.length - 1; i > 0; i--) {
      h = (h * 1103515245 + 12345) | 0;
      const j = Math.abs(h) % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
}

export function ExpeditionGame({ slide, onAnswer }: { slide: ExpeditionSlide; onAnswer?: (e: AnswerEvent) => void }) {
  const { playVoice } = useAcademyAudio();
  const slots = slide.slots ?? slide.dangers.length;
  const [stage, setStage] = useState<Stage>('plan');
  const [packed, setPacked] = useState<string[]>([]);
  const [planMsg, setPlanMsg] = useState<string | null>(null);
  const [dIdx, setDIdx] = useState(0);
  const [pickItem, setPickItem] = useState<string | null>(null);
  const [pickLink, setPickLink] = useState<Link | null>(null);
  const [pickPhrase, setPickPhrase] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [log, setLog] = useState<{ sentence: string; attempts: number }[]>([]);
  const attempts = useRef(0);

  const shuffledItems = useShuffled(slide.items, 'items:' + slide.items.map((i) => i.id).join());
  const danger = slide.dangers[dIdx];
  const phraseBank = useShuffled(danger?.phrases ?? [], 'ph:' + (danger?.id ?? ''));
  const itemById = (id: string | null) => slide.items.find((i) => i.id === id) ?? null;

  const togglePack = (id: string) => {
    sfx.tap();
    setPlanMsg(null);
    setPacked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= slots ? p : [...p, id]));
  };

  const depart = () => {
    if (packed.length < slots) {
      setPlanMsg(`Your backpack has room for ${slots} tools — pick ${slots - packed.length} more.`);
      sfx.wrong();
      return;
    }
    const missing = slide.dangers.filter((d) => !packed.includes(d.item));
    if (missing.length) {
      setPlanMsg(`Nothing in your pack for: "${missing.map((m) => m.text).join('" and "')}". Swap a tool!`);
      sfx.wrong();
      return;
    }
    sfx.go();
    setStage('play');
  };

  const resetTurn = () => {
    setPickItem(null);
    setPickLink(null);
    setPickPhrase(null);
    setHint(null);
    setSolved(false);
    attempts.current = 0;
  };

  const check = () => {
    if (!danger || pickItem == null || pickLink == null || pickPhrase == null) return;
    attempts.current += 1;
    const phrase = phraseBank[pickPhrase];
    const item = itemById(pickItem)!;
    const rightTool = pickItem === danger.item;
    let msg: string | null = null;
    if (!rightTool) msg = `A ${item.label} doesn't help against "${danger.text.replace(/\.$/, '')}". Which tool in your pack does?`;
    else if (!phrase.ok) msg = 'Good tool — but that purpose belongs to a different tool. What does this one do?';
    else if (pickLink === 'so that' && phrase.kind === 'base') msg = "After “so that” we need a subject + could: so that we could …";
    else if (pickLink !== 'so that' && phrase.kind === 'clause') msg = `After “${pickLink}” we use the base verb straight away: ${pickLink} see / find / drink …`;
    const good = msg === null;
    onAnswer?.({ itemIndex: dIdx, isCorrect: good, skillTag: 'purpose-clauses' });
    if (!good) {
      sfx.wrong();
      setHint(msg);
      return;
    }
    sfx.correct();
    try { if (!prefersReducedMotion()) confetti({ particleCount: 60, spread: 65, origin: { y: 0.7 } }); } catch { /* decoration only */ }
    const sentence = `We took ${item.sentence} ${pickLink} ${phrase.text}.`;
    setSolved(true);
    setHint(null);
    setLog((l) => [...l, { sentence, attempts: attempts.current }]);
    window.setTimeout(() => void playVoice(sentence), 250);
  };

  const nextDanger = () => {
    if (dIdx + 1 >= slide.dangers.length) {
      sfx.levelUp();
      setStage('log');
      return;
    }
    setDIdx((n) => n + 1);
    resetTurn();
  };

  const restart = () => {
    setStage('plan'); setPacked([]); setPlanMsg(null); setDIdx(0); setLog([]); resetTurn();
  };

  const stars = (a: number) => (a <= 1 ? 3 : a === 2 ? 2 : 1);
  const totalStars = log.reduce((n, l) => n + stars(l.attempts), 0);

  const shell = 'mx-auto w-full max-w-5xl rounded-3xl border-4 border-emerald-400/70 bg-emerald-950/95 p-4 text-white shadow-[0_8px_0_0_#064e3b,0_24px_44px_rgba(0,0,0,0.45)] md:p-5';
  const chip = 'min-h-[44px] rounded-xl border-2 px-3 py-2 text-left text-sm font-bold leading-tight transition active:translate-y-px md:text-base';

  return (
    <div className="max-h-full w-full overflow-y-auto px-2 py-1">
      <div className={shell}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-emerald-300">
              {stage === 'plan' ? 'Step 1 · Plan your pack' : stage === 'play' ? `Step 2 · Expedition · danger ${dIdx + 1}/${slide.dangers.length}` : 'Step 3 · Your Expedition Log'}
            </div>
            <h2 className="text-lg font-black leading-tight md:truncate md:text-2xl">{slide.title ?? 'The Labyrinth Expedition'}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5" aria-label="Backpack">
            <span className="mr-1 text-2xl" aria-hidden>🎒</span>
            {Array.from({ length: slots }).map((_, i) => {
              const it = itemById(stage === 'plan' ? packed[i] ?? null : packed[i] ?? null);
              return (
                <div key={i} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-emerald-300/70 bg-emerald-900/70">
                  {it ? <img src={it.image_url} alt={it.label} className="h-full w-full bg-white object-contain" /> : <span className="text-emerald-300/50">+</span>}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-base text-emerald-50 md:text-lg">{slide.intro ?? `Tonight's forecast has ${slide.dangers.length} dangers. You can carry only ${slots} tools. Choose wisely!`}</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {slide.dangers.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 rounded-xl border-2 border-amber-300/70 bg-amber-50 p-1.5 pr-2 text-slate-900">
                    <img src={d.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <span className="text-sm font-bold leading-tight">{d.text}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">Tools ({packed.length}/{slots} packed)</div>
              <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
                {shuffledItems.map((it) => {
                  const on = packed.includes(it.id);
                  return (
                    <button
                      key={it.id}
                      onClick={() => togglePack(it.id)}
                      aria-pressed={on}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 text-xs font-bold transition active:translate-y-px md:text-sm ${on ? 'border-amber-300 bg-amber-300 text-amber-950 shadow-[0_3px_0_0_#b45309]' : 'border-white/30 bg-white text-slate-900 hover:border-amber-200'}`}
                    >
                      <img src={it.image_url} alt="" className="h-14 w-14 object-contain md:h-16 md:w-16" />
                      <span className="leading-tight">{it.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={depart} className="min-h-[52px] rounded-2xl bg-amber-400 px-8 text-lg font-black uppercase tracking-wider text-amber-950 shadow-[0_5px_0_0_#b45309] transition active:translate-y-1 active:shadow-[0_1px_0_0_#b45309]">
                  Depart ▶
                </button>
                <div role="status" aria-live="polite" className="min-h-[1.5rem] flex-1 text-sm font-semibold text-amber-200">{planMsg}</div>
              </div>
            </motion.div>
          )}

          {stage === 'play' && danger && (
            <motion.div key={'play' + dIdx} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="relative overflow-hidden rounded-2xl border-2 border-white/40">
                <img src={danger.image_url} alt="" className="h-40 w-full object-cover md:h-full md:min-h-[17rem]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-lg font-black">{danger.text}</div>
                {solved && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3 rounded-full bg-emerald-400 px-3 py-1 text-sm font-black text-emerald-950">✓ Solved!</motion.div>
                )}
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-white p-3 text-lg font-bold text-slate-900 md:text-xl" aria-live="polite">
                  We took{' '}
                  <span className={`rounded-md px-1.5 ${pickItem ? 'bg-amber-200' : 'bg-slate-200 text-slate-400'}`}>{pickItem ? itemById(pickItem)!.sentence : '[tool]'}</span>{' '}
                  <span className={`rounded-md px-1.5 ${pickLink ? 'bg-sky-200' : 'bg-slate-200 text-slate-400'}`}>{pickLink ?? '[link]'}</span>{' '}
                  <span className={`rounded-md px-1.5 ${pickPhrase != null ? 'bg-emerald-200' : 'bg-slate-200 text-slate-400'}`}>{pickPhrase != null ? phraseBank[pickPhrase].text : '[why?]'}</span>.
                </div>
                <div>
                  <div className="mb-1 text-xs font-extrabold uppercase tracking-widest text-emerald-300">1 · Which tool from your pack?</div>
                  <div className="flex flex-wrap gap-2">
                    {packed.map((id) => { const it = itemById(id)!; const on = pickItem === id; return (
                      <button key={id} disabled={solved} onClick={() => { sfx.tap(); setPickItem(id); setHint(null); }} aria-pressed={on}
                        className={`${chip} flex items-center gap-2 ${on ? 'border-amber-300 bg-amber-300 text-amber-950' : 'border-white/30 bg-white text-slate-900'}`}>
                        <img src={it.image_url} alt="" className="h-8 w-8 object-contain" />{it.label}
                      </button>); })}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-extrabold uppercase tracking-widest text-emerald-300">2 · Link</div>
                  <div className="flex flex-wrap gap-2">
                    {LINKS.map((l) => (
                      <button key={l} disabled={solved} onClick={() => { sfx.tap(); setPickLink(l); setHint(null); }} aria-pressed={pickLink === l}
                        className={`${chip} ${pickLink === l ? 'border-sky-300 bg-sky-300 text-sky-950' : 'border-white/30 bg-white text-slate-900'}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-extrabold uppercase tracking-widest text-emerald-300">3 · Why?</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {phraseBank.map((p, i) => (
                      <button key={p.text} disabled={solved} onClick={() => { sfx.tap(); setPickPhrase(i); setHint(null); }} aria-pressed={pickPhrase === i}
                        className={`${chip} ${pickPhrase === i ? 'border-emerald-300 bg-emerald-300 text-emerald-950' : 'border-white/30 bg-white text-slate-900'}`}>{p.text}</button>
                    ))}
                  </div>
                </div>
                {/* Pinned action row: the coaching hint + the Use it / Next button stay on screen even when the
                    expedition panel is taller than the stage (student comfort — never hide the feedback). */}
                <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-950/95 px-1 py-2">
                  {!solved ? (
                    <button onClick={check} disabled={pickItem == null || pickLink == null || pickPhrase == null}
                      className="min-h-[52px] rounded-2xl bg-amber-400 px-8 text-lg font-black uppercase tracking-wider text-amber-950 shadow-[0_5px_0_0_#b45309] transition active:translate-y-1 disabled:opacity-40">
                      Use it!
                    </button>
                  ) : (
                    <button onClick={nextDanger} className="min-h-[52px] rounded-2xl bg-emerald-400 px-8 text-lg font-black uppercase tracking-wider text-emerald-950 shadow-[0_5px_0_0_#047857] transition active:translate-y-1">
                      {dIdx + 1 >= slide.dangers.length ? 'See my log ▶' : 'Next danger ▶'}
                    </button>
                  )}
                  <div role="status" aria-live="polite" className={`min-h-[1.5rem] flex-1 text-sm font-semibold md:text-base ${solved ? 'text-emerald-200' : 'text-amber-200'}`}>
                    {solved ? '🔊 Danger beaten! Listen to your sentence.' : hint}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'log' && (
            <motion.div key="log" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              <div className="rounded-2xl border-2 border-amber-900/60 bg-[#fbf3df] p-4 text-stone-900">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-amber-900">📖 Expedition Log</div>
                  <div className="text-lg font-black" aria-label={`${totalStars} stars`}>{'⭐'.repeat(Math.max(1, Math.round(totalStars / Math.max(1, log.length))))} <span className="text-sm text-stone-600">{totalStars}/{log.length * 3}</span></div>
                </div>
                <ol className="space-y-1.5">
                  {log.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-base font-semibold md:text-lg">
                      <span className="mt-0.5 rounded-full bg-emerald-700 px-2 text-sm font-black text-white">{i + 1}</span>
                      <span className="flex-1">{l.sentence}</span>
                      <span aria-label={`${stars(l.attempts)} stars`}>{'⭐'.repeat(stars(l.attempts))}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => void playVoice(log.map((l) => l.sentence).join(' '))} className="min-h-[52px] rounded-2xl bg-sky-400 px-6 text-base font-black text-sky-950 shadow-[0_5px_0_0_#0369a1] transition active:translate-y-1">🔊 Hear my log</button>
                <button onClick={restart} className="min-h-[52px] rounded-2xl border-2 border-white/40 bg-white/10 px-6 text-base font-bold text-white hover:bg-white/20">↺ Plan a new expedition</button>
                <p className="basis-full text-sm font-semibold text-emerald-100 sm:flex-1 sm:basis-0 md:text-base">Your turn: say your favourite sentence to a partner, then tell them which danger was hardest.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
