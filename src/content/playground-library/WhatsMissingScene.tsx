import { useEffect, useMemo, useRef, useState } from 'react';
import { type ActivitySync, isSharedFollower, useSyncedState } from './sceneActivitySync';
import { seededOrder } from './PictureMatchScene';
import { Burst, GAME_FONT, GameStyles, HudBar, ProgressPill, PromptChip, TheatreBackdrop, TitleRibbon, TopHatIcon } from './gameTheme';
import { safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `whats-missing` ("Magic Show") — reusable memory + vocabulary game, shared by
 * every scene library (Pre-A1 Unit 1, Welcome Town, Magic Castle, Jungle).
 *
 * A magician's stage shows 3-6 pictures. Round 1 introduces each word aloud
 * (model first), then the student presses "Hide!": the curtains close, ONE
 * picture vanishes in a puff of stars, the curtains open and the student taps
 * the picture that is missing. A right answer brings it back and says the word
 * again; a wrong one wobbles away (no hearts, no penalty) and after two wrong
 * picks the right one glows.
 *
 * Classic ESL "Kim's game / What's missing?" (teach-this.com/esl-games,
 * Cambridge young-learner vocabulary practice) turned into a themed game.
 *
 * Classroom rules (see .claude/skills/classroom-sync-robustness): ONE synced
 * state object, every field has a typed default, no Set/Map, and every index
 * read from state is clamped — a hostile or half-formed snapshot on the
 * student's mirror must never throw.
 */
export interface WhatsMissingItem {
  /** Spoken + shown as the label, e.g. "teddy". Must be unique within a round. */
  word: string;
  img?: string;
  emoji?: string;
}

export interface WhatsMissingRound {
  /** 2-6 pictures on the stage. */
  items: WhatsMissingItem[];
  /** Index (into `items`) of the one that disappears. */
  missing: number;
}

export interface WhatsMissingSceneData {
  id: string;
  kind: 'whats-missing';
  teacher: string;
  rounds: WhatsMissingRound[];
  /** Say every word aloud on the first round (the "model first" step). Default true. */
  intro?: boolean;
  /** Banner name; defaults to "Magic Show". */
  title?: string;
  /** Optional background art. The scene draws its own theatre, but the lesson players read `bg` on every scene (e.g. to preload art). */
  bg?: string;
}

type Phase = 'look' | 'cover' | 'guess' | 'reveal';
const PHASES: Phase[] = ['look', 'cover', 'guess', 'reveal'];

interface MissingState {
  round: number;
  phase: string;
  /** The missing picture has vanished (set while the curtains are closed). */
  gone: boolean;
  /** Wrong words tried this round. */
  wrong: string[];
  /** Wrong picks over the whole game (for the star rating). */
  totalWrong: number;
  /** Item being introduced aloud (-1 = none). */
  introIdx: number;
  introDone: boolean;
  finished: boolean;
}

const INITIAL: MissingState = { round: 0, phase: 'look', gone: false, wrong: [], totalWrong: 0, introIdx: -1, introDone: false, finished: false };
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export function WhatsMissingScene({ scene, onNext, onWin, onResult, sync }: {
  scene: WhatsMissingSceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  onLose?: () => void;
  /** Standalone games: called once at the end with the number of wrong picks. */
  onResult?: (r: { mistakes: number }) => void;
  sync?: ActivitySync;
}) {
  const rounds = Array.isArray(scene.rounds) ? scene.rounds : [];
  const [state, setState] = useSyncedState<MissingState>(sync, INITIAL);
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  /** Shared play: only the leader (teacher) runs the automatic sequences; the follower gets them relayed. */
  const isFollower = isSharedFollower(sync);

  // ---- everything below is read defensively: a mirror may hold any snapshot
  const roundNo = Number.isFinite(state.round) ? Math.max(0, Math.min(Math.floor(state.round), rounds.length - 1)) : 0;
  const phase: Phase = PHASES.includes(state.phase as Phase) ? (state.phase as Phase) : 'look';
  const wrong = Array.isArray(state.wrong) ? state.wrong : [];
  const totalWrong = Number.isFinite(state.totalWrong) ? state.totalWrong : 0;
  const introIdx = Number.isFinite(state.introIdx) ? state.introIdx : -1;
  const finished = state.finished === true;
  const gone = state.gone === true;
  const round = rounds[roundNo];
  const items = round && Array.isArray(round.items) ? round.items.slice(0, 6) : [];
  const n = items.length;
  const missingIdx = round && Number.isInteger(round.missing) && round.missing >= 0 && round.missing < n ? round.missing : 0;
  const introEnabled = scene.intro !== false && roundNo === 0;
  const introDone = !introEnabled || state.introDone === true;

  const alive = useRef(true);
  const gemDone = useRef(false);
  const token = useRef(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; count: number; spread: number }[]>([]);
  const burstId = useRef(0);

  const fireBurst = (x: number, y: number, count = 18, spread = 20) => {
    const id = ++burstId.current;
    setBursts((b) => [...b.slice(-3), { id, x, y, count, spread }]);
    window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
  };
  const burstAt = (selector: string, count = 18, spread = 18) => {
    const root = rootRef.current;
    const el = root?.querySelector(selector) as HTMLElement | null;
    if (!root || !el) return;
    const rr = root.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (!rr.width || !rr.height) return;
    fireBurst(((er.left + er.width / 2 - rr.left) / rr.width) * 100, ((er.top + er.height / 2 - rr.top) / rr.height) * 100, count, spread);
  };

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    setState(INITIAL);
    gemDone.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  useEffect(() => {
    if (finished && !gemDone.current && !isMirror && !isFollower) {
      gemDone.current = true;
      sfx.whoop();
      sfx.gem();
      onResult?.({ mistakes: totalWrong });
      onWin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // ---- model first: on round 1, say each picture's word aloud, one by one
  useEffect(() => {
    if (isMirror || isFollower || finished || phase !== 'look' || !introEnabled || state.introDone === true || !n) return;
    const mine = ++token.current;
    (async () => {
      await sleep(500);
      for (let i = 0; i < n; i++) {
        if (!alive.current || token.current !== mine) return;
        setState((s) => ({ ...s, introIdx: i }));
        await safeSpeak(items[i].word, 'teacher');
        await sleep(250);
      }
      if (alive.current && token.current === mine) setState((s) => ({ ...s, introIdx: -1, introDone: true }));
    })();
    const counter = token;
    return () => { counter.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNo, scene.id]);

  // ---- a puff of stars where the picture vanishes, and when it comes back
  useEffect(() => {
    if (phase === 'cover' && gone) burstAt(`[data-wm-slot="${missingIdx}"]`, 22, 16);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone, phase]);
  useEffect(() => {
    if (phase === 'reveal') burstAt(`[data-wm-slot="${missingIdx}"]`, 18, 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundNo]);
  useEffect(() => {
    if (finished) fireBurst(50, 40, 48, 48);
  }, [finished]);

  const hide = async () => {
    if (isMirror || phase !== 'look' || !introDone || finished) return;
    sfx.reveal();
    setState((s) => ({ ...s, phase: 'cover', gone: false, wrong: [] }));
    const mine = ++token.current;
    await sleep(900);
    if (!alive.current || token.current !== mine) return;
    setState((s) => ({ ...s, gone: true }));
    await sleep(1000);
    if (!alive.current || token.current !== mine) return;
    setState((s) => ({ ...s, phase: 'guess' }));
  };

  const pick = async (word: string, idx: number) => {
    if (isMirror || phase !== 'guess' || finished || wrong.includes(word)) return;
    if (idx === missingIdx) {
      sfx.match();
      setState((s) => ({ ...s, phase: 'reveal', gone: false }));
      const mine = ++token.current;
      await safeSpeak(word, 'teacher');
      await sleep(900);
      if (!alive.current || token.current !== mine) return;
      if (roundNo + 1 < rounds.length) {
        setState((s) => ({ ...INITIAL, round: roundNo + 1, introDone: true, totalWrong: Number.isFinite(s.totalWrong) ? s.totalWrong : 0 }));
      } else {
        setState((s) => ({ ...s, finished: true }));
      }
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, wrong: [...(Array.isArray(s.wrong) ? s.wrong : []), word], totalWrong: (Number.isFinite(s.totalWrong) ? s.totalWrong : 0) + 1 }));
    }
  };

  const order = useMemo(() => seededOrder(Math.max(n, 1), `${scene.id}:${roundNo}`), [scene.id, roundNo, n]);

  if (!round || n < 2) return <div className="absolute inset-0" />;

  const closed = phase === 'cover';
  const showMissing = phase === 'reveal' || (!gone && phase !== 'guess');
  const hint = wrong.length >= 2 && phase === 'guess';
  const slotW = `min(${Math.min(17, 88 / n - 1.6)}cqw, 27cqh)`;
  const tileW = `min(${Math.min(15, 88 / n - 1.6)}cqw, 22cqh)`;
  const title = scene.title ?? 'Magic Show';
  const prompt = finished ? 'Abracadabra! You did it!'
    : phase === 'look' ? (introDone ? 'Look carefully. Remember them all!' : 'Listen and look…')
      : phase === 'cover' ? 'Abracadabra…'
        : phase === 'guess' ? "What's missing?"
          : `Yes! It was the ${items[missingIdx]?.word ?? ''}!`;

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden select-none" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT }}>
      <GameStyles />
      <style>{`
        @keyframes wm-vanish { 0% { transform: scale(1) rotate(0); opacity: 1; } 100% { transform: scale(.1) rotate(200deg); opacity: 0; } }
        @keyframes wm-back { 0% { transform: scale(.2) rotate(-160deg); opacity: 0; } 70% { transform: scale(1.18) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes wm-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-7deg); } 75% { transform: rotate(7deg); } }
        @keyframes wm-glow { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(253,224,71,0)); } 50% { transform: scale(1.08); filter: drop-shadow(0 0 2.4cqh rgba(253,224,71,1)); } }
        @keyframes wm-ask { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-1.4cqh) scale(1.08); } }
      `}</style>
      <TheatreBackdrop />

      <HudBar
        left={<TitleRibbon text={title} icon={<TopHatIcon />} />}
        centre={<PromptChip>{prompt}</PromptChip>}
        right={<ProgressPill done={Math.min(rounds.length, roundNo + (phase === 'reveal' || finished ? 1 : 0))} total={rounds.length} color="#a855f7" label="tricks" />}
      />

      {/* The stage: pictures on the table… */}
      <div className="absolute inset-x-0 flex items-end justify-center" style={{ top: '12%', height: '42%', gap: '1.6cqw' }}>
        {items.map((it, i) => {
          const isMissing = i === missingIdx;
          const visible = !isMissing || showMissing;
          const introHot = introIdx === i;
          return (
            <div key={`${roundNo}-${it.word}-${i}`} data-wm-slot={i} className="flex flex-col items-center" style={{ width: slotW, animation: `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${i * 90}ms both` }}>
              <div
                className="gt-idle relative flex w-full items-center justify-center rounded-[2.4cqh] bg-white shadow-[0_1.2cqh_0_rgba(0,0,0,.28)]"
                style={{
                  aspectRatio: '1 / 1', outline: introHot ? '0.9cqh solid #facc15' : '0.6cqh solid rgba(255,255,255,.9)',
                  transform: introHot ? 'scale(1.12)' : undefined, transition: 'transform .25s, outline-color .25s',
                  animation: !visible && phase === 'guess' ? undefined : phase === 'look' ? `gt-float ${3 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite` : undefined,
                }}
              >
                {visible ? (
                  <div className="h-full w-full p-[8%]" style={{ animation: isMissing && phase === 'reveal' ? 'wm-back .7s cubic-bezier(.2,.9,.3,1.3) both' : isMissing && phase === 'cover' && gone ? 'wm-vanish .5s ease-in both' : undefined }}>
                    {it.img
                      ? <img src={it.img} alt="" className="h-full w-full object-contain" draggable={false} />
                      : <span className="flex h-full w-full items-center justify-center" style={{ fontSize: '11cqh', lineHeight: 1 }}>{it.emoji ?? ''}</span>}
                  </div>
                ) : (
                  <span className="font-black text-purple-400" style={{ fontSize: '12cqh', lineHeight: 1, animation: 'wm-ask 1.2s ease-in-out infinite' }}>?</span>
                )}
              </div>
              <div
                className="mt-[1.2cqh] rounded-full bg-white/90 px-[1.2cqw] py-[0.3cqh] font-black text-purple-900 shadow"
                style={{ fontSize: '3.6cqh', lineHeight: 1.2, opacity: visible && phase !== 'guess' ? 1 : 0, color: isMissing && phase === 'reveal' ? '#15803d' : undefined }}
              >
                {it.word}
              </div>
            </div>
          );
        })}
      </div>

      {/* …and the curtains that hide them */}
      <div className="pointer-events-none absolute inset-x-0 z-20 overflow-hidden" style={{ top: '9%', height: '49%' }} aria-hidden="true">
        {(['left', 'right'] as const).map((side) => (
          <div
            key={side}
            className="absolute top-0 h-full"
            style={{
              [side]: 0, width: '52%',
              background: 'repeating-linear-gradient(90deg, #7f1022 0, #7f1022 2.4cqw, #b3182f 2.4cqw, #b3182f 4.8cqw)',
              boxShadow: 'inset 0 -1.6cqh 0 #f6c453, inset 0 0 6cqh rgba(0,0,0,.45)',
              transform: closed ? 'translateX(0)' : `translateX(${side === 'left' ? '-86%' : '86%'})`,
              transition: 'transform .75s cubic-bezier(.6,.05,.3,1)',
              borderRadius: side === 'left' ? '0 0 4cqh 0' : '0 0 0 4cqh',
            }}
          />
        ))}
      </div>

      {/* Bottom half: Hide! → abracadabra → choices */}
      <div className="absolute inset-x-[3%] flex items-center justify-center" style={{ top: '60%', height: '34%' }}>
        {finished ? (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)' }}>
            Well done! Next ⭐
          </button>
        ) : phase === 'look' ? (
          <button
            type="button"
            onClick={() => void hide()}
            disabled={isMirror || !introDone}
            className="gt-idle relative overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-[6cqw] py-[2.2cqh] font-black text-white shadow-2xl ring-4 ring-white/70 transition active:scale-95 disabled:opacity-60"
            style={{ fontSize: '5.4cqh', animation: introDone && !isMirror ? 'gt-glow-pulse 1.5s ease-out infinite' : undefined }}
          >
            <span className="gt-idle pointer-events-none absolute inset-y-0 w-1/4 bg-white/40" style={{ animation: 'gt-shine 2.6s ease-in-out infinite' }} />
            {introDone ? '✨ Hide!' : 'Listen…'}
          </button>
        ) : phase === 'cover' ? (
          <span className="font-black text-yellow-200" style={{ fontSize: '7cqh', textShadow: '0 0.6cqh 0 rgba(0,0,0,.35)', animation: 'gt-pop-in .5s cubic-bezier(.2,.9,.3,1.4) both' }}>Abracadabra!</span>
        ) : (
          <div className="flex items-center justify-center" style={{ gap: '1.6cqw' }}>
            {order.map((srcIdx, k) => {
              const it = items[srcIdx];
              if (!it) return null;
              const isWrong = wrong.includes(it.word);
              const isRight = phase === 'reveal' && srcIdx === missingIdx;
              const isHint = hint && srcIdx === missingIdx;
              return (
                <button
                  key={`${roundNo}-${it.word}-${k}`}
                  type="button"
                  disabled={isMirror || phase !== 'guess' || isWrong}
                  onClick={() => void pick(it.word, srcIdx)}
                  aria-label={it.word}
                  className="flex flex-col items-center rounded-[2cqh] bg-white p-[0.8cqh] shadow-[0_1cqh_0_rgba(0,0,0,.28)] transition active:scale-95"
                  style={{
                    width: tileW, opacity: isWrong ? 0.4 : 1,
                    outline: isRight ? '0.8cqh solid #22c55e' : isHint ? '0.8cqh solid #facc15' : '0.5cqh solid rgba(255,255,255,.9)',
                    animation: isWrong ? 'wm-wobble .45s ease-in-out' : isHint ? 'wm-glow .9s ease-in-out infinite' : `gt-rise-in .45s cubic-bezier(.2,.9,.3,1.2) ${k * 80}ms both`,
                  }}
                >
                  <div className="w-full" style={{ aspectRatio: '1 / 0.85' }}>
                    {it.img
                      ? <img src={it.img} alt="" className="h-full w-full object-contain" draggable={false} />
                      : <span className="flex h-full w-full items-center justify-center" style={{ fontSize: '8cqh', lineHeight: 1 }}>{it.emoji ?? ''}</span>}
                  </div>
                  <span className="font-black text-purple-900" style={{ fontSize: '3.2cqh', lineHeight: 1.2 }}>{it.word}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} count={b.count} spread={b.spread} colors={['#fde047', '#f0abfc', '#ffffff', '#a78bfa', '#7dd3fc', '#fb923c']} />)}
    </div>
  );
}
