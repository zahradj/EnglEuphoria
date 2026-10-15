import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, FloatText, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { MIXUP_FIND, MIXUP_FIXED, MIXUP_NOT_THERE, MIXUP_PICK } from './mixupRules';

/* ---------- Monster Mix-Up ★ (A1 U5L4, docs/a1-unit-5-monster-town.md §5.4 "Monster Maker") ----------
 * Bibi describes her monster friend ("He's got three eyes. He's wearing a hat and boots."), the Monster Machine builds
 * it — with ONE mistake on purpose. The child is the expert: tap the wrong part, pick the right one, and the monster is
 * fixed; then the child says the correction ("No! He's wearing a hat!").
 * Research (docs/research/playground-a1u5-research.md): describe-and-check pairs (ESL Printables, Twee "Describe the
 * monster"), eslactive "Create a Monster" (teacher draws, class suggests), One Stop English "What's she wearing?"
 * (dress the model from a description). Video-game mechanic: the inspector check of "Papers, Please" — compare the
 * description with what you see and spot the one thing that does not match. Better: the mistake is always the
 * target language (has got / is wearing), the fix happens on the picture, and the child says the corrected sentence. */

type MixUp = Extract<Scene, { kind: 'monster-mixup' }>;
type Part = 'eyes' | 'horns' | 'mouth' | 'wear';

const EYE_SPOTS: Record<1 | 2 | 3, number[]> = { 1: [50], 2: [38, 62], 3: [30, 50, 70] };
const HORN_W = [56, 60];
/** Where a worn piece sits on the square monster box (%). */
const WEAR_AT: Record<'head' | 'face' | 'neck' | 'feet', { left: number; top?: number; bottom?: number; width: number }> = {
  head: { left: 27, bottom: 70, width: 46 },
  face: { left: 22, top: 25, width: 56 },
  neck: { left: 25, top: 61, width: 50 },
  feet: { left: 21, top: 84, width: 58 },
};
/** Tap zones for the parts (% of the box). Worn pieces are added on top of these. */
const ZONE: Record<'eyes' | 'horns' | 'mouth', { left: number; top: number; w: number; h: number }> = {
  horns: { left: 15, top: 0, w: 70, h: 20 },
  eyes: { left: 20, top: 26, w: 60, h: 20 },
  mouth: { left: 28, top: 47, w: 44, h: 12 },
};

export function MonsterMixUpScene({ scene, onNext, onWin, onLose, sync }: { scene: MixUp; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { r: 0, found: false, fixed: false, miss: '', done: false });
  const total = scene.rounds.length;
  const r = Math.max(0, Math.min(total - 1, Number(state.r) || 0));
  const round = scene.rounds[r];
  const found = !!state.found;
  const fixed = !!state.fixed;
  const miss = String(state.miss);
  const done = !!state.done;
  const [bursts, fire] = useBursts();
  const [star, setStar] = useState(false);
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !round) return;
    const t = window.setTimeout(() => cueSpeak(`${round.line} ${MIXUP_FIND}`, voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  if (!round) return null;

  const mk = round.mistake;
  const wrongNow = !fixed;
  // What the machine shows right now.
  const eyes = (mk.part === 'eyes' && wrongNow ? Math.max(1, Math.min(3, mk.shown)) : round.eyes) as 1 | 2 | 3;
  const horns = mk.part === 'horns' && wrongNow ? mk.shown : round.horns;
  const mouth = mk.part === 'mouth' && wrongNow ? mk.shown : round.mouth;
  const wears = round.wears.map((w, i) => (mk.part === 'wear' && wrongNow && (mk.slot ?? 0) === i ? mk.shown : w));

  const tap = (part: Part, slot?: number) => {
    if (found || fixed || done) return;
    const right = part === mk.part && (part !== 'wear' || (mk.slot ?? 0) === slot);
    if (!right) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, miss: part === 'wear' ? `wear${slot}` : part }));
      cueSpeak(MIXUP_NOT_THERE, voiceOf(scene.who));
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, found: true, miss: '' }));
    cueSpeak(MIXUP_PICK, voiceOf(scene.who));
  };
  const pick = (ok: boolean, label: string) => {
    if (!found || fixed || done) return;
    if (!ok) { sfx.wrong(); onLose(); setState((s) => ({ ...s, miss: `pick:${label}` })); return; }
    sfx.gem(); fire(50, 45, 'stars'); setStar(true); window.setTimeout(() => setStar(false), 900);
    setState((s) => ({ ...s, fixed: true, miss: '' }));
    window.setTimeout(() => cueSpeak(`${MIXUP_FIXED} ${round.say}`, 'teacher'), 450);
  };
  const next = () => setState((s) => {
    const n = (Number(s.r) || 0) + 1;
    return n >= total ? { ...s, done: true } : { ...s, r: n, found: false, fixed: false, miss: '' };
  });

  // The tray: the right answer among the other choices for the part that was wrong.
  const options: { label: string; img?: string; count?: number; ok: boolean }[] =
    mk.part === 'eyes' ? ([1, 2, 3] as const).map((n) => ({ label: `${n} ${n === 1 ? 'eye' : 'eyes'}`, count: n, ok: n === round.eyes }))
      : mk.part === 'horns' ? scene.horns.map((h, i) => ({ label: h.label, img: h.img, ok: i === round.horns }))
        : mk.part === 'mouth' ? scene.mouths.map((m, i) => ({ label: m.label, img: m.img, ok: i === round.mouth }))
          : scene.wear.map((w, i) => ({ label: w.word, img: w.img, ok: i === round.wears[mk.slot ?? 0] }))
            .filter((o, i) => o.ok || i === mk.shown || !round.wears.includes(i));

  const big = 'clamp(1rem, min(calc(2.3*var(--svw,1vw)), 3.6vh), 1.9rem)';
  const shake = (k: string) => (miss === k && !reduce ? { x: [0, -10, 10, -6, 0] } : {});
  const zoneBtn = 'absolute z-30 rounded-[2vh] border-[0.35vh] border-dashed border-transparent hover:border-yellow-300/90 hover:bg-yellow-200/15';
  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#2E1065' }}>
      <CalmBg img={scene.bg} />
      {done && <Confetti count={100} />}
      <Bursts items={bursts} />
      <FloatText show={star} x={50} y={30}>+⭐</FloatText>

      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-16">
        <span className="rounded-full bg-violet-900/70 px-6 py-1.5 text-center font-black text-white shadow-xl backdrop-blur-sm" style={{ ...THICK_WORDS, fontSize: big }}>
          {done ? scene.doneLine : `🔎 ${scene.title}`}
        </span>
      </div>
      <span className="absolute end-3 top-[3%] z-30 rounded-full bg-white/90 px-3 py-1 font-black text-violet-700 shadow" style={{ fontSize: 'min(2.6vh,1.8vw)' }}>{done ? total : r + 1}/{total}</span>

      {/* Bibi's description (what is TRUE) — a card on the left */}
      {!done && (
        <div className="absolute start-[3%] top-[16%] z-30 w-[27%] rounded-[2.4vh] border-[0.45vh] border-white bg-amber-50/95 p-[1.6vh] shadow-xl">
          <div className="mb-[0.8vh] font-black text-violet-700" style={{ fontSize: 'min(2.4vh,1.6vw)' }}>📝 My friend:</div>
          <p className="font-black leading-snug text-violet-950" style={{ fontSize: 'min(3.2vh,2.1vw)' }}>{round.line}</p>
          <button type="button" onClick={() => cueSpeak(round.line, voiceOf(scene.who))}
            className="mt-[1vh] rounded-full bg-violet-600 px-4 py-1 font-black text-white shadow" style={{ fontSize: 'min(2.4vh,1.6vw)' }}>🔊 Listen</button>
        </div>
      )}

      {/* the machine's monster in the middle — with one mistake until it is fixed */}
      {!done && (
        <motion.div className="absolute left-[50%] top-[18%] z-20 -translate-x-1/2" style={{ width: 'min(60vh,38vw)', aspectRatio: '1 / 1' }}
          animate={fixed && !reduce ? { y: [0, -30, 0, -14, 0] } : {}} transition={{ duration: 0.9 }}>
          {horns >= 0 && scene.horns[horns] && (
            <motion.img key={`h${horns}-${r}`} src={scene.horns[horns].img} alt="" draggable={false} initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="absolute object-contain" style={{ bottom: '70%', width: `${HORN_W[horns] ?? 56}%`, left: `${50 - (HORN_W[horns] ?? 56) / 2}%` }} />
          )}
          <img src={scene.body} alt="" draggable={false} className="absolute left-[9%] top-[18%] w-[82%] object-contain drop-shadow-[0_14px_18px_rgba(30,10,60,0.45)]" />
          {EYE_SPOTS[eyes].map((x, i) => (
            <motion.img key={`e${eyes}-${i}-${r}`} src={scene.eye} alt="" draggable={false} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 14, delay: i * 0.05 }} className="absolute w-[16%] object-contain" style={{ left: `${x - 8}%`, top: '30%' }} />
          ))}
          {mouth >= 0 && scene.mouths[mouth] && (
            <img src={scene.mouths[mouth].img} alt="" draggable={false} className="absolute left-[33%] w-[34%] object-contain" style={{ top: '49%' }} />
          )}
          <AnimatePresence>
            {wears.map((w, i) => {
              const piece = scene.wear[w];
              if (!piece) return null;
              const at = WEAR_AT[piece.on];
              return (
                <motion.img key={`w${i}-${w}-${r}`} src={piece.img} alt={piece.word} draggable={false}
                  initial={reduce ? false : { y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute object-contain drop-shadow-[0_6px_8px_rgba(30,10,60,0.4)]" style={{ left: `${at.left}%`, width: `${at.width}%`, top: at.top !== undefined ? `${at.top}%` : undefined, bottom: at.bottom !== undefined ? `${at.bottom}%` : undefined }} />
              );
            })}
          </AnimatePresence>
          {/* tap zones */}
          {!found && !fixed && (
            <>
              {(['horns', 'eyes', 'mouth'] as const).map((k) => (
                <motion.button key={k} type="button" aria-label={`The ${k}`} onClick={() => tap(k)} animate={shake(k)}
                  className={zoneBtn} style={{ left: `${ZONE[k].left}%`, top: `${ZONE[k].top}%`, width: `${ZONE[k].w}%`, height: `${ZONE[k].h}%` }} />
              ))}
              {wears.map((w, i) => {
                const piece = scene.wear[w];
                if (!piece) return null;
                const at = WEAR_AT[piece.on];
                const h = piece.on === 'head' ? 24 : piece.on === 'feet' ? 16 : 14;
                const top = at.top !== undefined ? at.top : 100 - (at.bottom ?? 0) - h;
                return (
                  <motion.button key={`wz${i}`} type="button" aria-label={`The ${piece.word}`} onClick={() => tap('wear', i)} animate={shake(`wear${i}`)}
                    className={zoneBtn} style={{ left: `${at.left}%`, top: `${top}%`, width: `${at.width}%`, height: `${h}%` }} />
                );
              })}
            </>
          )}
          {fixed && <span className="absolute top-[4%] start-0 rotate-[-6deg] rounded-full bg-violet-600 px-4 py-1 font-black text-white shadow-lg" style={{ fontSize: 'min(3vh,2vw)' }}>{round.name}</span>}
        </motion.div>
      )}

      {/* the fix tray on the right */}
      {!done && (
        <div className="absolute end-[3%] top-[16%] z-30 w-[22%]">
          {!found && !fixed && (
            <div className="rounded-[2.4vh] bg-violet-900/60 p-[1.6vh] text-center font-black text-white shadow-xl backdrop-blur-sm" style={{ fontSize: 'min(2.8vh,1.9vw)' }}>
              🔎 Read, look… what is wrong? Tap it on the monster!
            </div>
          )}
          {found && !fixed && (
            <div className="flex flex-col gap-[1vh] rounded-[2.4vh] bg-teal-900/60 p-[1.2vh] backdrop-blur-sm">
              <span className="text-center font-black text-white" style={{ fontSize: 'min(2.6vh,1.8vw)' }}>What is right?</span>
              {options.map((o) => (
                <motion.button key={o.label} type="button" onClick={() => pick(o.ok, o.label)}
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={miss === `pick:${o.label}` && !reduce ? { x: [0, -10, 10, -6, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                  className="flex min-h-[44px] items-center justify-center gap-[0.6vw] rounded-[1.8vh] border-[0.45vh] border-teal-200 bg-white/95 px-[0.8vw] py-[0.6vh] shadow-lg">
                  {o.count ? Array.from({ length: o.count }, (_, i) => <img key={i} src={scene.eye} alt="" draggable={false} className="h-[min(4.4vh,3vw)] w-auto" />)
                    : o.img ? <img src={o.img} alt="" draggable={false} className="h-[min(5.4vh,3.6vw)] w-auto" /> : null}
                  <span className="font-black text-teal-900" style={{ fontSize: 'min(2.6vh,1.8vw)' }}>{o.label}</span>
                </motion.button>
              ))}
            </div>
          )}
          {fixed && (
            <div className="rounded-[2.4vh] bg-emerald-600/90 p-[1.6vh] text-center font-black text-white shadow-xl" style={{ fontSize: 'min(3vh,2vw)' }}>
              ✅ Fixed!<div className="mt-[0.6vh] text-yellow-100" style={{ fontSize: 'min(3.2vh,2.1vw)' }}>“{round.say}”</div>
            </div>
          )}
        </div>
      )}

      {!done && fixed && (
        <button type="button" onClick={next} className={`${CLAY_BUTTON} absolute bottom-[5%] left-1/2 z-30 -translate-x-1/2 px-10 py-3`} style={{ fontSize: 'min(3.2vh,2.2vw)' }}>
          🎤 I said it! Next monster
        </button>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
