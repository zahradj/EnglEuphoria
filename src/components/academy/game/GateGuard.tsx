import '@/styles/academy-game.css';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sfx } from '@/lib/academy/sfx';
import { prefersReducedMotion } from '@/lib/academy/playerSafety';
import { speak } from '@/content/playground-library/unit1/audio';
import { correctDecision, mismatchHint, starsFor, type GateDecision, type GateRound } from '@/lib/academy/gateGuard';
import type { AnswerEvent } from '@/pages/AcademyDemo';
import { AVATAR_ART } from './avatars';

/**
 * GATE GUARD — a "Papers, Please"-style checkpoint for A1 names (research: speed + precision at a checkpoint is a proven,
 * replayable mechanic; Cambridge A1 listening asks learners to match spoken names to written ones).
 *
 * Each visitor says "I am <name>" and wears a name tag. Does the tag spell the same name? LET IN, or send to the NAME DESK.
 * The right answer is DERIVED from the line and the tag (src/lib/academy/gateGuard.ts), never trusted from the data.
 * Kind feedback only: a mismatch shows which letter to look at; no timer punishes; a streak and 1-3 stars reward accuracy.
 * Voice: the visitor's line is shown as text and can be replayed through the recorded-voice path (silent if no clip exists).
 */
export interface GateGuardSlide {
  type: 'gate_guard';
  title?: string;
  intro?: string;
  rounds: GateRound[];
  nova_lines?: { ok?: string; done?: string };
}

type Phase = 'intro' | 'play' | 'done';

function Portrait({ id, className }: { id: string; className?: string }) {
  const art = AVATAR_ART[id];
  const [bad, setBad] = useState(false);
  if (!art || bad) return <div aria-hidden className={`flex items-center justify-center rounded-full bg-[#3b6dff]/40 text-4xl font-black ${className ?? ''}`}>{(art?.label ?? id).charAt(0)}</div>;
  return <img src={art.src} alt={art.label} onError={() => setBad(true)} draggable={false} className={`object-contain object-bottom drop-shadow-[0_12px_18px_rgba(7,10,36,0.7)] ${className ?? ''}`} />;
}

export function GateGuard({ slide, onAnswer }: { slide: GateGuardSlide; onAnswer?: (e: AnswerEvent) => void }) {
  const rounds = slide.rounds ?? [];
  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<GateDecision | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const round = rounds[i];
  const want = useMemo(() => (round ? correctDecision(round) : null), [round]);
  const ok = picked !== null && picked === want;
  const novaOk = slide.nova_lines?.ok ?? 'Scan OK! Welcome to Starline!';

  const decide = (d: GateDecision) => {
    if (picked !== null || !round || !want) return;
    setPicked(d);
    const correct = d === want;
    onAnswer?.({ itemIndex: i, isCorrect: correct, skillTag: 'name-recognition' });
    if (correct) { sfx.correct(); setScore((s) => s + 1); setStreak((s) => s + 1); } else { sfx.wrong(); setStreak(0); }
  };
  const next = () => {
    sfx.tap();
    if (i + 1 >= rounds.length) {
      setPhase('done');
      sfx.levelUp();
      try { if (!prefersReducedMotion()) confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 }, colors: ['#3b6dff', '#8b5cf6', '#d95cf0', '#86ecff', '#ffd76a'] }); } catch { /* decoration only */ }
    } else { setI((n) => n + 1); setPicked(null); }
  };
  const replay = () => { if (round) { sfx.tap(); void speak(round.says, 'teacher').catch(() => undefined); } };

  if (!rounds.length) return <div className="ag-muted">No visitors yet.</div>;

  return (
    <div className="ag-root max-h-full w-full overflow-y-auto px-2 py-1">
      <div className="ag-scrim-soft relative mx-auto w-full max-w-3xl px-12 py-10 md:px-14">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="ag-chip">Gate duty</div>
            <h2 className="ag-title text-3xl uppercase md:text-4xl">{slide.title ?? 'Gate Guard'}</h2>
          </div>
          {phase === 'play' && (
            <div className="ag-title text-base" aria-live="polite">Visitor {i + 1}/{rounds.length} · <span style={{ color: streak >= 3 ? '#ff9ad5' : '#cdc6ff' }}>🔥 {streak}</span></div>
          )}
        </div>

        {phase === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="ag-prompt text-lg md:text-xl">{slide.intro ?? 'Nova needs a helper at the gate! Read the visitor’s name tag. Is it the same name you hear?'}</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="ag-title rounded-[14px_4px_14px_4px] bg-gradient-to-br from-[#19c3c8]/80 to-[#6ff5cf]/70 px-3 py-3 text-base text-[#05222c]" style={{ textShadow: 'none' }}>✓ Same name → LET IN</div>
              <div className="ag-title rounded-[14px_4px_14px_4px] bg-gradient-to-br from-[#6d3cdc] to-[#c04fe6] px-3 py-3 text-base">✗ Different → NAME DESK</div>
            </div>
            <button onClick={() => { sfx.go(); setPhase('play'); }} className="ag-btn ag-btn--gold !min-h-[56px] !px-10 text-lg">Start duty ▶</button>
          </motion.div>
        )}

        {phase === 'play' && round && (
          <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-end gap-4">
              <Portrait id={round.visitor} className="h-36 w-28 shrink-0 md:h-44 md:w-32" />
              <div className="min-w-0 flex-1 space-y-3">
                {/* The visitor's line is a manga speech bubble. */}
                <div className="relative rounded-2xl bg-[#f7f5ff] px-4 py-3 text-lg font-semibold text-[#1b1d6e] shadow-lg">
                  “{round.says}”
                  <span aria-hidden className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-[#f7f5ff]" />
                </div>
                <button onClick={replay} className="ag-btn ag-btn--ghost !min-h-[44px] text-sm">🔊 Hear it</button>
              </div>
            </div>

            {/* The name tag is the object being inspected, so it is drawn as a card. */}
            <div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_6px_0_rgba(20,22,100,0.55)]" aria-label={`Name tag: ${round.tag}`}>
              <span aria-hidden className="h-10 w-3 rounded-full bg-gradient-to-b from-[#3b6dff] to-[#8b5cf6]" />
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6d3cdc]">Starline Academy · Visitor</div>
                <div className="truncate text-3xl font-black tracking-wide text-[#1b1d6e]">{round.tag}</div>
              </div>
            </div>

            {picked === null ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => decide('let_in')} className="ag-btn !min-h-[60px] text-base" style={{ background: 'linear-gradient(135deg,#19c3c8,#6ff5cf)', color: '#05222c', textShadow: 'none' }}>✓ Let in</button>
                <button onClick={() => decide('name_desk')} className="ag-btn !min-h-[60px] text-base" style={{ background: 'linear-gradient(135deg,#6d3cdc,#c04fe6)' }}>✗ Name desk</button>
              </div>
            ) : (
              <div className="space-y-3" role="status" aria-live="polite">
                <div className="ag-feedback text-lg" style={{ color: ok ? '#6ff5cf' : '#f0b3ff' }}>
                  {ok ? `✓ ${want === 'let_in' ? novaOk : 'Good catch! Different names.'}` : `↻ ${mismatchHint(round)}`}
                </div>
                {!ok && want === 'let_in' && <div className="ag-muted text-base">The names are the same, so this visitor can come in.</div>}
                <button autoFocus onClick={next} className="ag-btn !min-h-[52px] text-base">{i + 1 >= rounds.length ? 'Finish duty ▶' : 'Next visitor ▶'}</button>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-center">
            <div aria-label={`${starsFor(score, rounds.length)} of 3 stars`} className="flex justify-center gap-2 text-6xl">
              {[1, 2, 3].map((n) => <span key={n} className={n <= starsFor(score, rounds.length) ? 'drop-shadow-[0_0_18px_rgba(255,215,106,0.9)]' : 'opacity-30 grayscale'}>⭐</span>)}
            </div>
            <h3 className="ag-title text-3xl">{slide.nova_lines?.done ?? 'Gate duty complete!'}</h3>
            <p className="ag-prompt text-xl"><span style={{ color: '#ffd76a' }}>{score} / {rounds.length}</span> visitors checked correctly</p>
            <button onClick={() => { setPhase('intro'); setI(0); setPicked(null); setScore(0); setStreak(0); }} className="ag-btn ag-btn--ghost !min-h-[48px] text-sm">↺ Play again</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
