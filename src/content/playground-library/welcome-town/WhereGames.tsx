/* =============================================================================
 * "Where is it?" games — two mechanics built for Magic Castle Unit 9
 * Lesson 3 (prepositions of place: in / on / under / next to / behind).
 *
 *  • place-it   — a sticker scene the student can MOVE things around in.
 *      learn  : tap a preposition → Wim's lamp flies there and the sentence is
 *               spoken ("The lamp is under the table.") — discovery by doing.
 *      listen : hear "Put the lamp behind the table." → drag the lamp (or tap
 *               a sparkle) to the right place. Classic TPR "put it…" game
 *               (teach-this.com / games4esl "prepositions: put it" activity).
 *      "Behind" and "under" really render the lamp BEHIND the furniture
 *      sticker (lower z-index), so the picture shows the meaning instead of
 *      a label.
 *  • torch-hunt — the room is dark; the student shines a torch around the
 *      picture to find the hidden lamp, the lights come on, and they choose
 *      the sentence that says where it is ("It's under the table."). Built on
 *      the "flashlight / I spy in the dark" pattern used in kids' apps.
 *
 * Both use real shared state (useSyncedState) so teacher and student screens
 * match; only the authority drives. The live drag/torch position is local
 * (a continuous gesture), the RESULT (where the lamp landed, torch taps,
 * found, answers) is synced — see generate-lesson §4c.
 * ========================================================================== */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import type { Scene, CharKey } from './scenes';
import { VOICE_KEY } from './scenes';
import { cueSpeak, cueSpeakOnce } from '../unit1/audio';
import * as sfx from '../unit1/sfx';
import { Confetti } from '../unit1/fx';
import { type ActivitySync, useSyncedState } from '../sceneActivitySync';

const voiceOf = (who: CharKey) => VOICE_KEY[who];

export type Prep = 'in' | 'on' | 'under' | 'next to' | 'behind';
const PREP_COLOR: Record<Prep, string> = { in: '#3B7FC9', on: '#F4A340', under: '#D97706', 'next to': '#22C59A', behind: '#7C3AED' };
const PREP_EMOJI: Record<Prep, string> = { in: '📦', on: '⬆️', under: '⬇️', 'next to': '↔️', behind: '🙈' };

/** A 16:9 box fitted inside the scene, so % positions always land on the
 *  same spot of the picture whatever the screen shape. */
function useStageBox() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth, H = el.clientHeight;
      const w = Math.min(W, (H * 16) / 9);
      setBox({ w, h: (w * 9) / 16 });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, box };
}

function SceneFrame({ bg, children, stage, dark = false }: { bg: string; children?: React.ReactNode; stage: (box: { w: number; h: number }) => React.ReactNode; dark?: boolean }) {
  const { ref, box } = useStageBox();
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1a1033]">
      <div className={`absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-1000 ${dark ? 'opacity-0' : 'opacity-60'}`} style={{ backgroundImage: `url(${bg})` }} />
      <div ref={ref} className="absolute inset-0 flex items-center justify-center">
        {box.w > 0 && (
          <div className="relative overflow-hidden shadow-2xl" style={{ width: box.w, height: box.h }}>
            <img src={bg} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
            {stage(box)}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-40 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl sm:text-base">
      {children}
    </div>
  );
}

function DoneScreen({ bg, label, onNext }: { bg: string; label: string; onNext: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <Confetti count={50} />
      <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">{label}</button>
    </div>
  );
}

/** "The lamp is UNDER the table." with the preposition coloured. */
function Sentence({ text, prep }: { text: string; prep?: Prep }) {
  if (!prep) return <>{text}</>;
  const i = text.toLowerCase().indexOf(` ${prep} `);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i + 1)}
      <span className="rounded-lg px-1.5 text-white" style={{ background: PREP_COLOR[prep] }}>{text.slice(i + 1, i + 1 + prep.length)}</span>
      {text.slice(i + 1 + prep.length)}
    </>
  );
}

/* ------------------------------------------------------------------ place-it */

type PlaceIt = Extract<Scene, { kind: 'place-it' }>;

export function PlaceItScene({ scene, onNext, onWin, onLose, sync }: { scene: PlaceIt; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const learn = scene.mode === 'learn';
  const rounds = scene.rounds ?? [];
  const [state, setState] = useSyncedState(sync, { at: (scene.startAt ?? null) as Prep | null, seen: [] as Prep[], round: 0, wrong: null as Prep | null, correct: false });
  const { at, seen, round, wrong, correct } = state;
  const gemDone = useRef(false);
  const complete = learn ? false : round >= rounds.length;
  const r = !learn && !complete ? rounds[round] : null;
  const voice = voiceOf(scene.who);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // listen mode: say the instruction each round; lamp goes back to its start
  useEffect(() => {
    if (learn || complete) return;
    setState((s) => ({ ...s, at: (scene.startAt ?? null) as Prep | null, wrong: null, correct: false }));
    const t = window.setTimeout(() => cueSpeakOnce(r!.line, voice), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const spotOf = (p: Prep) => scene.spots.find((s) => s.prep === p)!;

  const learnTap = (p: Prep) => {
    sfx.pop();
    setState((s) => ({ ...s, at: p, seen: s.seen.includes(p) ? s.seen : [...s.seen, p] }));
    cueSpeak(scene.learnLines?.[p] ?? `The ${scene.item.label} is ${p} the ${scene.anchor.label}.`, voice);
    if (!gemDone.current && seen.length + (seen.includes(p) ? 0 : 1) >= scene.spots.length) { gemDone.current = true; sfx.gem(); onWin(true); }
  };

  const place = (p: Prep) => {
    if (learn) return learnTap(p);
    if (!r || correct) return;
    if (p !== r.prep) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, at: p, wrong: p }));
      window.setTimeout(() => setState((s) => ({ ...s, at: (scene.startAt ?? null) as Prep | null, wrong: null })), 700);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, at: p, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    cueSpeak(r.answer ?? `Yes! The ${scene.item.label} is ${p} the ${scene.anchor.label}.`, voice);
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 2200);
  };

  // drag the item; drop → nearest spot within reach
  const pctFromEvent = (e: RPointerEvent) => {
    const b = stageRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 };
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (learn || correct || !stageRef.current) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag(pctFromEvent(e));
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => { if (drag) setDrag(pctFromEvent(e)); };
  const onUp = () => {
    if (!drag) return;
    const best = scene.spots
      .map((s) => ({ s, d: Math.hypot(s.left - drag.x, (s.top - drag.y - (scene.item.height ?? 18) / 2) * 0.6) }))
      .sort((a, b) => a.d - b.d)[0];
    setDrag(null);
    if (best && best.d < 14) place(best.s.prep);
  };

  if (complete) return <DoneScreen bg={scene.bg} label="Great listening! ⭐ Next" onNext={onNext} />;

  const prepsInOrder = scene.spots.map((s) => s.prep);
  const learnedAll = learn && seen.length >= scene.spots.length;

  return (
    <SceneFrame
      bg={scene.bg}
      stage={(box) => {
        const spot = at ? spotOf(at) : null;
        const itemW = scene.item.width * (spot?.scale ?? 1);
        const pos: CSSProperties = drag
          ? { left: `${drag.x}%`, top: `${drag.y + (scene.item.height ?? 18) / 2}%`, zIndex: 30, transition: 'none' }
          : spot
          ? { left: `${spot.left}%`, top: `${spot.top}%`, zIndex: spot.behind ? 5 : 20 }
          : { left: `${scene.item.homeLeft ?? 88}%`, top: `${scene.item.homeTop ?? 90}%`, zIndex: 20 };
        return (
          <div ref={stageRef} className="absolute inset-0 touch-none" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => setDrag(null)} style={{ fontSize: box.w / 60 }}>
            {/* the furniture + optional container */}
            <img src={scene.anchor.img} alt={scene.anchor.label} draggable={false} className="pointer-events-none absolute select-none" style={{ left: `${scene.anchor.left}%`, top: `${scene.anchor.top}%`, width: `${scene.anchor.width}%`, transform: 'translate(-50%, -100%)', zIndex: 10, filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.35))' }} />
            {scene.box && (
              <img src={scene.box.img} alt={scene.box.label} draggable={false} className="pointer-events-none absolute select-none" style={{ left: `${scene.box.left}%`, top: `${scene.box.top}%`, width: `${scene.box.width}%`, transform: 'translate(-50%, -100%)', zIndex: 10, filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.35))' }} />
            )}
            {/* sparkle targets (listen mode) */}
            {!learn && !correct && scene.spots.map((s) => (
              <button key={s.prep} aria-label={s.prep} onClick={() => place(s.prep)}
                className={`absolute z-[25] grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition ${wrong === s.prep ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                style={{ left: `${s.left}%`, top: `${s.top - (scene.item.height ?? 18) * (s.scale ?? 1) / 2}%`, width: '7%', aspectRatio: '1', background: 'radial-gradient(circle, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)', animation: 'lep1-ping 1.8s ease-in-out infinite' }}>
                <span style={{ fontSize: '1.6em' }}>✨</span>
              </button>
            ))}
            {/* the item (Wim's lamp) */}
            <div onPointerDown={onDown}
              className={`absolute select-none ${learn || correct ? '' : 'cursor-grab active:cursor-grabbing'} ${wrong ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
              style={{ ...pos, width: `${itemW}%`, transform: 'translate(-50%, -100%)', transition: drag ? 'none' : 'left .7s cubic-bezier(.3,1.4,.5,1), top .7s cubic-bezier(.3,1.4,.5,1), width .5s' }}>
              <img src={scene.item.img} alt={scene.item.label} draggable={false} className="pointer-events-none w-full select-none" style={{ filter: `drop-shadow(0 0 ${correct || learn ? 18 : 10}px rgba(255,214,102,.9)) drop-shadow(0 0 22px rgba(167,139,250,.7))` }} />
            </div>
          </div>
        );
      }}
    >
      <Banner>
        {learn ? '🪄 ' : '👂 '}{scene.teacher}{!learn && <span className="ml-1 opacity-60">({round + 1}/{rounds.length})</span>}
      </Banner>
      {!learn && r && (
        <button onClick={() => cueSpeak(r.line, voice)} className="absolute right-4 top-16 z-40 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      )}
      {/* sentence card */}
      {(learn ? at : correct && r) && (
        <div className="absolute inset-x-0 top-16 z-40 flex justify-center px-4">
          <div className="rounded-2xl bg-white/95 px-5 py-2 text-center text-xl font-black text-neutral-800 shadow-xl sm:text-2xl" style={{ animation: 'lep1-pop 0.35s ease-out' }}>
            <Sentence text={learn ? (scene.learnLines?.[at!] ?? `The ${scene.item.label} is ${at} the ${scene.anchor.label}.`) : (r!.answer ?? `The ${scene.item.label} is ${r!.prep} the ${scene.anchor.label}.`)} prep={learn ? at! : r!.prep} />
          </div>
        </div>
      )}
      {/* learn mode: preposition buttons */}
      {learn && (
        <div className="absolute inset-x-0 bottom-4 z-40 flex flex-wrap justify-center gap-2 px-3">
          {prepsInOrder.map((p) => (
            <button key={p} onClick={() => learnTap(p)}
              className={`rounded-2xl border-4 px-4 py-2 text-lg font-black text-white shadow-xl transition active:scale-95 sm:text-xl ${at === p ? 'scale-110 border-white' : 'border-white/60'}`}
              style={{ background: PREP_COLOR[p] }}>
              {PREP_EMOJI[p]} {p} {seen.includes(p) && <span className="ml-0.5 text-sm">✓</span>}
            </button>
          ))}
          {learnedAll && (
            <button onClick={onNext} className="rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2 text-lg font-black text-white shadow-xl active:scale-95 sm:text-xl">⭐ Next</button>
          )}
        </div>
      )}
    </SceneFrame>
  );
}

/* --------------------------------------------------------------- torch-hunt */

type TorchHunt = Extract<Scene, { kind: 'torch-hunt' }>;

export function TorchHuntScene({ scene, onNext, onWin, onLose, sync }: { scene: TorchHunt; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, torch: { x: 50, y: 55 }, found: false, picked: null as string | null, correct: false, misses: 0 });
  const { round, torch, found, picked, correct, misses } = state;
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;
  const voice = voiceOf(scene.who);
  const gemDone = useRef(false);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, torch: { x: 50, y: 55 }, found: false, picked: null, correct: false, misses: 0 }));
    const t = window.setTimeout(() => cueSpeakOnce(scene.ask ?? 'Where is the lamp? Find it with your torch!', voice), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  // when found, ask the question
  useEffect(() => {
    if (!found || !r) return;
    const t = window.setTimeout(() => cueSpeakOnce(r.question ?? 'Where is the lamp?', voice), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  const pct = (e: RPointerEvent) => {
    const b = stageRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 };
  };
  const shine = (p: { x: number; y: number }) => {
    if (!r || found) return;
    const hit = Math.hypot(p.x - r.spot.left, (p.y - r.spot.top) * (9 / 16)) < r.spot.r;
    if (hit) {
      sfx.match();
      setState((s) => ({ ...s, torch: p, found: true }));
    } else {
      sfx.pop();
      setState((s) => ({ ...s, torch: p, misses: s.misses + 1 }));
    }
  };

  const answer = (opt: string) => {
    if (!r || correct) return;
    if (opt !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: opt }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: opt, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    cueSpeak(r.answer, voice);
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 2300);
  };

  if (complete) return <DoneScreen bg={scene.rounds[total - 1].bg} label="You found it every time! ⭐ Next" onNext={onNext} />;

  const t = live ?? torch;
  const hint = misses >= 4 && !found;
  return (
    <SceneFrame
      bg={r!.bg}
      dark={!found}
      stage={() => (
        <div ref={stageRef} className="absolute inset-0 touch-none"
          onPointerDown={(e) => { if (!found) { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setLive(pct(e)); } }}
          onPointerMove={(e) => { if (live) setLive(pct(e)); }}
          onPointerUp={(e) => { if (live) { const p = pct(e); setLive(null); shine(p); } }}
          onPointerCancel={() => setLive(null)}
          style={{ cursor: found ? 'default' : 'none' }}>
          {/* darkness with a torch beam */}
          <div className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: found ? 0 : 1,
              background: `radial-gradient(circle at ${t.x}% ${t.y}%, rgba(255,240,190,0.04) 0, rgba(255,240,190,0.04) 8.5%, rgba(6,3,20,0.96) 13%, rgba(6,3,20,0.985) 100%)`,
            }} />
          {/* torch icon follows the beam */}
          {!found && (
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[2.2em] transition-[left,top] duration-150" style={{ left: `${t.x}%`, top: `${t.y + 13}%`, fontSize: 'min(5vw, 44px)' }}>🔦</div>
          )}
          {hint && (
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${r!.spot.left}%`, top: `${r!.spot.top}%`, width: '6%', aspectRatio: '1', boxShadow: '0 0 30px 14px rgba(255,214,102,.55)', animation: 'lep1-ping 1.4s ease-in-out infinite' }} />
          )}
          {found && (
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white" style={{ left: `${r!.spot.left}%`, top: `${r!.spot.top}%`, width: `${r!.spot.r * 2}%`, aspectRatio: '1', boxShadow: '0 0 0 4px #FFD34E, 0 0 30px 10px rgba(255,211,78,.7)', animation: 'lep1-ping 1.7s ease-in-out infinite' }} />
          )}
        </div>
      )}
    >
      <Banner>
        {found ? `🪔 ${r!.question ?? 'Where is the lamp?'}` : `🔦 ${scene.teacher}`} <span className="ml-1 opacity-60">({round + 1}/{total})</span>
      </Banner>
      {found && (
        <div className="absolute inset-x-0 bottom-5 z-40 flex flex-wrap justify-center gap-3 px-3">
          {r!.options.map((o) => (
            <button key={o} onClick={() => answer(o)} disabled={correct}
              className={`rounded-2xl border-4 bg-white/95 px-4 py-3 text-lg font-black text-neutral-800 shadow-2xl transition active:scale-95 sm:text-xl ${picked === o && !correct ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : picked === o && correct ? 'border-green-400 bg-green-50' : 'border-white'}`}
              style={{ animation: picked ? undefined : 'lep1-pop 0.35s ease-out' }}>
              <Sentence text={o} prep={(['next to', 'behind', 'under', 'on', 'in'] as Prep[]).find((p) => o.toLowerCase().includes(` ${p} `))} />
            </button>
          ))}
        </div>
      )}
    </SceneFrame>
  );
}

/* ------------------------------------------------------------ where-castle */

/**
 * "Where is the sofa?" — "It's in the living room." on the whole castle
 * cutaway: hear the question (with the thing's picture), tap the room it's
 * in, then the full answer is shown and spoken and the student says it.
 * Furniture already painted in the castle is pointed at directly; anything
 * not painted there is added as a sticker (`stickers`).
 */
type WhereCastle = Extract<Scene, { kind: 'where-castle' }>;

export function WhereCastleScene({ scene, onNext, onWin, onLose, sync }: { scene: WhereCastle; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, wrong: null as string | null, correct: false });
  const { round, wrong, correct } = state;
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;
  const asker = voiceOf(scene.asker);
  const answerer = voiceOf(scene.answerer);
  const gemDone = useRef(false);
  const answerText = r ? `It’s in the ${r.room}.` : '';

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, wrong: null, correct: false }));
    const t = window.setTimeout(() => cueSpeakOnce(`Where is the ${r!.item}?`, asker), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tapRoom = (room: string) => {
    if (!r || correct) return;
    if (room !== r.room) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: room }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    cueSpeak(answerText, answerer);
  };

  if (complete) return <DoneScreen bg={scene.bg} label="You know every room! ⭐ Next" onNext={onNext} />;

  return (
    <SceneFrame
      bg={scene.bg}
      stage={() => (
        <div className="absolute inset-0">
          {(scene.stickers ?? []).map((s) => (
            <img key={s.img} src={s.img} alt="" draggable={false} className="pointer-events-none absolute select-none" style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.3))' }} />
          ))}
          {scene.rooms.map((rm) => {
            const isWrong = wrong === rm.room;
            const isRight = correct && rm.room === r!.room;
            return (
              <button key={rm.room} onClick={() => tapRoom(rm.room)} disabled={correct} aria-label={rm.room}
                className={`absolute rounded-xl border-[5px] transition ${isWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400 bg-red-400/25' : isRight ? 'border-green-400 bg-green-300/20' : 'border-transparent hover:border-white/70'}`}
                style={{ left: `${rm.box.x}%`, top: `${rm.box.y}%`, width: `${rm.box.w}%`, height: `${rm.box.h}%` }}>
                {isRight && (
                  <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-500 px-3 py-1 text-sm font-black capitalize text-white shadow-lg sm:text-base" style={{ animation: 'lep1-pop 0.35s ease-out' }}>{rm.room} ✓</span>
                )}
              </button>
            );
          })}
          {/* the asked-about thing glows where it is once found */}
          {correct && (
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white" style={{ left: `${r!.at.left}%`, top: `${r!.at.top}%`, width: '9%', aspectRatio: '1', boxShadow: '0 0 0 4px #FFD34E, 0 0 26px 8px rgba(255,211,78,.7)', animation: 'lep1-ping 1.7s ease-in-out infinite' }} />
          )}
        </div>
      )}
    >
      <Banner>🏰 {scene.teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span></Banner>
      {/* question card with the thing's picture */}
      <div className="absolute left-3 top-16 z-40 flex items-center gap-3 rounded-3xl bg-white/95 py-2 pl-2 pr-5 shadow-2xl" style={{ animation: 'lep1-pop 0.35s ease-out' }} key={round}>
        <img src={r!.img} alt={r!.item} className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
        <div className="text-left">
          <div className="text-[11px] font-black uppercase tracking-widest text-orange-500">{scene.askerName ?? 'Wim'} asks</div>
          <div className="text-xl font-black text-neutral-800 sm:text-2xl">Where is the <span style={{ color: '#C0392B' }}>{r!.item}</span>?</div>
          <button onClick={() => cueSpeak(`Where is the ${r!.item}?`, asker)} className="text-xs font-bold text-neutral-500 underline decoration-dotted">🔊 Hear it again</button>
        </div>
      </div>
      {/* answer card: model + say it */}
      {correct && (
        <div className="absolute right-3 top-16 z-40 flex flex-col items-end gap-2" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
          <div className="rounded-3xl bg-white/95 px-5 py-3 text-right shadow-2xl">
            <div className="text-[11px] font-black uppercase tracking-widest text-emerald-600">🎤 Now you say it!</div>
            <div className="text-xl font-black text-neutral-800 sm:text-2xl">It’s <span className="rounded-lg px-1.5 text-white" style={{ background: PREP_COLOR.in }}>in</span> the <span style={{ color: '#0EA5E9' }}>{r!.room}</span>.</div>
            <button onClick={() => cueSpeak(answerText, answerer)} className="text-xs font-bold text-neutral-500 underline decoration-dotted">🔊 Hear it</button>
          </div>
          <button onClick={() => setState((s) => ({ ...s, round: s.round + 1 }))} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2 text-lg font-black text-white shadow-xl active:scale-95">I said it! ▶</button>
        </div>
      )}
    </SceneFrame>
  );
}
