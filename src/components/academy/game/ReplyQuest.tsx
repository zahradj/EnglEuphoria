import '@/styles/academy-game.css';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sfx } from '@/lib/academy/sfx';
import { prefersReducedMotion } from '@/lib/academy/playerSafety';
import { speak } from '@/content/playground-library/unit1/audio';
import { fillName, friendshipHearts } from '@/lib/academy/gateGuard';
import { loadNameTag } from '@/lib/academy/nameTag';
import type { AnswerEvent } from '@/pages/AcademyDemo';
import { AVATAR_ART } from './avatars';

/**
 * REPLY QUEST — a visual-novel style conversation (research: branching replies + a character who visibly reacts are how
 * story games make dialogue feel alive, and visual novels are an under-used format for language learning).
 *
 * A character speaks; the student picks the best reply from three. A right reply makes the character light up and fills a
 * friendship heart; a wrong one gets a kind reaction and the student tries another reply (no punishment, no lost progress).
 * "…" and "{name}" in replies are filled with the name the student made in Name Tag Studio (localStorage), when there is one.
 */
export interface ReplyQuestReply { text: string; ok?: boolean; react: string }
export interface ReplyQuestTurn { npc: string; replies: ReplyQuestReply[] }
export interface ReplyQuestSlide {
  type: 'reply_quest';
  title?: string;
  /** Who you are talking to: ava | theo | vee | mia | nova. */
  character: string;
  turns: ReplyQuestTurn[];
  done_line?: string;
}

export function ReplyQuest({ slide, onAnswer }: { slide: ReplyQuestSlide; onAnswer?: (e: AnswerEvent) => void }) {
  const turns = slide.turns ?? [];
  const art = AVATAR_ART[slide.character];
  const [t, setT] = useState(0);
  const [tried, setTried] = useState<Set<number>>(new Set());
  const [chosenOk, setChosenOk] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [mood, setMood] = useState<'😊' | '🤔' | '🤩'>('😊');
  const [reaction, setReaction] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const name = useMemo(() => { try { return loadNameTag()?.name ?? null; } catch { return null; } }, []);
  const turn = turns[t];
  const hearts = friendshipHearts(firstTry, turns.length);

  const pick = (idx: number) => {
    if (!turn || chosenOk !== null) return;
    const r = turn.replies[idx];
    const reply = fillName(r.text, name);
    void speak(reply, 'mia').catch(() => undefined);
    if (r.ok) {
      sfx.correct();
      setChosenOk(idx);
      setMood('🤩');
      setReaction(fillName(r.react, name));
      const first = tried.size === 0;
      if (first) setFirstTry((n) => n + 1);
      onAnswer?.({ itemIndex: t, isCorrect: first, skillTag: 'reply-in-conversation' });
    } else {
      sfx.wrong();
      setTried((s) => new Set(s).add(idx));
      setMood('🤔');
      setReaction(fillName(r.react, name));
    }
  };
  const next = () => {
    sfx.tap();
    if (t + 1 >= turns.length) {
      setDone(true);
      sfx.levelUp();
      try { if (!prefersReducedMotion()) confetti({ particleCount: 70, spread: 70, origin: { y: 0.65 }, colors: ['#3b6dff', '#8b5cf6', '#d95cf0', '#86ecff', '#ffd76a'] }); } catch { /* decoration only */ }
    } else { setT((n) => n + 1); setTried(new Set()); setChosenOk(null); setReaction(null); setMood('😊'); }
  };

  if (!turns.length || !art) return <div className="ag-muted">No conversation yet.</div>;

  return (
    <div className="ag-root max-h-full w-full overflow-y-auto px-2 py-1">
      <div className="ag-scrim-soft relative mx-auto w-full max-w-3xl px-12 py-10 md:px-14">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="ag-chip">Reply quest</div>
            <h2 className="ag-title text-3xl uppercase md:text-4xl">{slide.title ?? `Talk to ${art.label}`}</h2>
          </div>
          <div className="ag-title text-xl" aria-label={`Friendship ${hearts} of 3 hearts`}>
            {[1, 2, 3].map((n) => <span key={n} className={n <= hearts ? '' : 'opacity-30 grayscale'}>💜</span>)}
          </div>
        </div>

        {!done ? (
          <motion.div key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <img src={art.src} alt={art.label} draggable={false} className="h-36 w-28 object-contain object-bottom drop-shadow-[0_12px_18px_rgba(7,10,36,0.7)] md:h-44 md:w-32" />
                <motion.span key={mood} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className="absolute -right-2 top-0 text-3xl" aria-hidden>{mood}</motion.span>
              </div>
              <div className="relative min-w-0 flex-1 rounded-2xl bg-[#f7f5ff] px-4 py-3 text-lg font-semibold text-[#1b1d6e] shadow-lg">
                <span className="ag-chip !text-[10px]" style={{ color: '#6d3cdc', textShadow: 'none' }}>{art.label}</span>
                <div>“{fillName(reaction && chosenOk !== null ? reaction : turn.npc, name)}”</div>
                <span aria-hidden className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 bg-[#f7f5ff]" />
              </div>
            </div>

            {chosenOk === null ? (
              <div className="space-y-2">
                <div className="ag-chip">Choose your reply</div>
                {turn.replies.map((r, idx) => (
                  <button key={r.text} onClick={() => pick(idx)} disabled={tried.has(idx)} className={`ag-opt ${tried.has(idx) ? 'is-oops is-dim' : ''}`}>
                    <span>{fillName(r.text, name)}</span>
                  </button>
                ))}
                {reaction && tried.size > 0 && <div className="ag-feedback text-base" style={{ color: '#f0b3ff' }} role="status">↻ {reaction} Try another reply.</div>}
              </div>
            ) : (
              <div className="space-y-3" role="status" aria-live="polite">
                <div className="ag-opt is-ok" style={{ animation: 'none' }}><span>{fillName(turn.replies[chosenOk].text, name)}</span><span>✓</span></div>
                <button autoFocus onClick={next} className="ag-btn !min-h-[52px] text-base">{t + 1 >= turns.length ? 'Finish ▶' : 'Next ▶'}</button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-center">
            <div className="text-6xl" aria-hidden>{hearts >= 3 ? '🤩' : '😊'}</div>
            <h3 className="ag-title text-3xl">{hearts >= 3 ? 'Best friends!' : hearts >= 2 ? 'New friends!' : 'Nice to meet you!'}</h3>
            <p className="ag-prompt text-lg">{slide.done_line ?? `${art.label} says: “See you in class!”`}</p>
            <div className="text-4xl" aria-label={`Friendship ${hearts} of 3 hearts`}>{[1, 2, 3].map((n) => <span key={n} className={n <= hearts ? '' : 'opacity-30 grayscale'}>💜</span>)}</div>
            <button onClick={() => { setDone(false); setT(0); setTried(new Set()); setChosenOk(null); setReaction(null); setMood('😊'); setFirstTry(0); }} className="ag-btn ag-btn--ghost !min-h-[48px] text-sm">↺ Talk again</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
