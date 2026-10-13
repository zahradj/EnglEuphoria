import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BlendReadCard } from './BlendReadCard';
import { type ActivitySync, isSharedFollower, useSyncedState } from './sceneActivitySync';
import { seededOrder } from './PictureMatchScene';
import { Burst, GAME_FONT, GameStyles, HudBar, ProgressPill, PromptChip, TitleRibbon } from './gameTheme';
import { playLetterPhonic, safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';
import { blendSounds, type SoundBlendRound, type SoundBlendSceneData } from './SoundBlendScene';

/**
 * More "Blend It!" worlds (owner, 2026-10-11: "add sound blending activities … vary the activities, do not just
 * use the train"). Same teaching routine as the Sound Train — say each sound, push the sounds together, find the
 * picture — so the voice baker, sync and checks are shared (`sound-blend` with `look`). Each world plays the
 * routine differently, and the sounds are tapped LEFT TO RIGHT (reading order):
 *
 *  - `frog`    Frog Hop: a frog hops stone to stone across a river, one sound per stone; on Blend! it hops back
 *              and crosses again fast while the sounds run together; it then jumps onto the lily pad with the
 *              right picture. Mechanic: Teach Your Monster to Read "Stepping Stones"; "drive across the letters".
 *  - `slide`   Slide Down: Pip climbs one ladder step per sound, then slides down and scoops up the sound balls
 *              on the chute — slow sounds, then a fast slide = the word ("say it slowly, then fast"; slinky
 *              stretch-and-blend). The pictures wait in the sandpit.
 *  - `gumball` Gumball Blender: tap the letter gumballs into the machine one by one (each says its sound),
 *              crank it (Blend!), three capsules roll out; open the one with the word's picture. Mechanic:
 *              tap-the-sounds, then slide/reveal blending games (Boom / Google Slides CVC decks).
 *
 * All art is painted Canva art (CLAUDE.md media rule). Wrong pictures never cost anything; after two misses the
 * right one glows. Reduced motion: positions jump, nothing flies.
 */

export type BlendLook = 'train' | 'frog' | 'slide' | 'gumball';

interface BlendState { round: number; tapped: number[]; blended: boolean; wrong: string[]; solved: boolean; finished: boolean; totalWrong: number; reading: boolean }
const INITIAL: BlendState = { round: 0, tapped: [], blended: false, wrong: [], solved: false, finished: false, totalWrong: 0, reading: false };
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const I = '/lep1/items';

/** The shared engine: state (synced), the three picture options, tap-in-order, blend, pick. */
function useBlendGame(scene: SoundBlendSceneData, sync: ActivitySync | undefined, onWin: (gem: boolean) => void) {
  const rounds = scene.rounds;
  const [state, setState] = useSyncedState<BlendState>(sync, INITIAL);
  const { round, tapped, blended, wrong, solved, finished } = state;
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  const isFollower = isSharedFollower(sync);
  const current = rounds[Math.min(round, rounds.length - 1)];
  const sounds = blendSounds(current);
  const next = tapped.length; // sounds are tapped in reading order
  const allTapped = next >= sounds.length;
  const alive = useRef(true);
  const gemDone = useRef(false);
  /** Local animation beat while blending: -1 = getting ready, k = sound k playing, sounds.length = the word. */
  const [step, setStep] = useState<number | null>(null);
  const [nudge, setNudge] = useState<number | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const burstId = useRef(0);
  const fire = (x: number, y: number) => {
    const id = ++burstId.current;
    setBursts((b) => [...b.slice(-3), { id, x, y }]);
    window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
  };
  const options = useMemo(() => {
    const others = rounds.filter((r) => r.word !== current.word);
    const pick = seededOrder(others.length, `${scene.id}:d${round}`).slice(0, 2).map((i) => others[i]);
    const list = [current, ...pick];
    return seededOrder(list.length, `${scene.id}:o${round}`).map((i) => list[i]);
  }, [rounds, current, scene.id, round]);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { setState(INITIAL); gemDone.current = false; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [scene.id]);
  useEffect(() => { setStep(null); }, [round]);
  useEffect(() => {
    if (finished) fire(50, 40);
    if (finished && !gemDone.current && !isMirror && !isFollower) { gemDone.current = true; sfx.whoop(); sfx.gem(); onWin(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const tap = (i: number) => {
    if (isMirror || blended || finished) return;
    if (i !== next) { // not this one yet: replay it, wiggle, but the next sound is the one to tap
      if (i < next) { sfx.pop(); void playLetterPhonic(sounds[i]); }
      else { setNudge(i); window.setTimeout(() => setNudge(null), 450); }
      return;
    }
    sfx.pop(); void playLetterPhonic(sounds[i]);
    setState((s) => ({ ...s, tapped: [...s.tapped, i] }));
  };
  const blend = async (readyMs = 450) => {
    if (isMirror || blended || !allTapped || finished) return;
    setState((s) => ({ ...s, blended: true }));
    sfx.whoop(); setStep(-1);
    await sleep(readyMs);
    for (let k = 0; k < sounds.length; k++) { if (!alive.current) return; setStep(k); await Promise.race([playLetterPhonic(sounds[k]), sleep(1100)]); await sleep(40); }
    await sleep(200);
    if (!alive.current) return;
    setStep(sounds.length);
    await safeSpeak(current.word, 'teacher');
  };
  const pick = async (w: string, x: number, y: number) => {
    if (isMirror || !blended || solved || finished || wrong.includes(w)) return false;
    if (w === current.word) {
      sfx.match(); fire(x, y);
      setState((s) => ({ ...s, solved: true }));
      await Promise.race([safeSpeak(current.word, 'teacher'), sleep(1600)]);
      await sleep(900);
      if (!alive.current) return true;
      if (current.sentence) { setState((s) => ({ ...s, reading: true })); return true; }
      if (round + 1 < rounds.length) setState((s) => ({ ...INITIAL, round: s.round + 1, totalWrong: s.totalWrong }));
      else setState((s) => ({ ...s, finished: true }));
      return true;
    }
    sfx.wrong();
    setState((s) => ({ ...s, wrong: [...s.wrong, w], totalWrong: s.totalWrong + 1 }));
    await sleep(500);
    if (alive.current) void safeSpeak(current.word, 'teacher');
    return false;
  };
  const blendStep = step ?? (blended ? sounds.length : null);
  const hint = wrong.length >= 2 && !solved;
  const afterRead = () => setState((s) => (s.round + 1 < rounds.length ? { ...INITIAL, round: s.round + 1, totalWrong: s.totalWrong } : { ...s, reading: false, finished: true }));
  return { state, round, rounds, current, sounds, next, allTapped, blended, solved, finished, wrong, options, isMirror, tap, blend, pick, blendStep, nudge, hint, bursts, afterRead };
}

type Game = ReturnType<typeof useBlendGame>;

function Shell({ game, title, icon, bg, color, prompts, children, onNext, blendLabel, onBlend }: {
  game: Game; title: string; icon: string; bg: string; color: string;
  prompts: { tap: string; blend: string; pick: string }; children: React.ReactNode; onNext: () => void; blendLabel: string; onBlend: () => void;
}) {
  const { finished, allTapped, blended, solved, current, round, rounds, isMirror } = game;
  const prompt = finished ? 'You can blend words!' : !allTapped ? prompts.tap : !blended ? prompts.blend : solved ? `${current.word}!` : prompts.pick;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT, backgroundImage: `url(${bg})` }}>
      <GameStyles />
      <HudBar
        left={<TitleRibbon text={title} icon={<span style={{ fontSize: '4cqh' }}>{icon}</span>} />}
        centre={<PromptChip>{prompt}</PromptChip>}
        right={<ProgressPill done={finished ? rounds.length : round + (solved ? 1 : 0)} total={rounds.length} color={color} label="words" />}
      />
      {/* the word on a wooden sign once it is blended */}
      <div className="pointer-events-none absolute inset-x-0 z-30 flex justify-center" style={{ top: '13%' }}>
        {blended && !finished && game.blendStep !== null && game.blendStep >= game.sounds.length && (
          <motion.div key={`w-${round}`} className="rounded-[2cqh] border-[0.5cqh] border-[#8a5a2b] bg-[#f4c87a] px-[3cqw] font-black text-[#4a2a0c] shadow-[0_0.8cqh_0_#8a5a2b]" style={{ fontSize: '8cqh', lineHeight: 1.2, letterSpacing: '0.06em' }}
            initial={{ scale: 0, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 13 }}>
            {current.word}
          </motion.div>
        )}
      </div>
      {!finished && children}
      <div className="absolute inset-x-0 z-40 flex justify-center" style={{ bottom: '4%' }}>
        {finished ? (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)' }}>
            Super blending! Next ⭐
          </button>
        ) : !blended && allTapped ? (
          <motion.button type="button" onClick={onBlend} disabled={isMirror} className="rounded-full px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95"
            style={{ fontSize: 'clamp(1.1rem, 6cqh, 2.4rem)', background: 'linear-gradient(90deg, #f97316, #ec4899)' }}
            initial={{ scale: 0 }} animate={{ scale: [1, 1.08, 1] }} transition={{ scale: { duration: 1.2, repeat: Infinity } }}>
            {blendLabel}
          </motion.button>
        ) : null}
      </div>
      {game.bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} />)}
      {game.state.reading && current.sentence && !finished && <BlendReadCard word={current.word} sentence={current.sentence} disabled={isMirror} onDone={game.afterRead} />}
    </div>
  );
}

/** A picture choice (lily pad / sand / capsule art behind it). */
function PictureFace({ r }: { r: SoundBlendRound }) {
  return r.img ? <img src={r.img} alt="" draggable={false} className="h-full w-full object-contain" /> : <span style={{ fontSize: '9cqh', lineHeight: 1 }}>{r.emoji ?? ''}</span>;
}

const letterStyle = { fontSize: '8cqh', lineHeight: 1, textShadow: '0 0.3cqh 0 rgba(255,255,255,0.6)' } as const;

/* ---------------------------------------------------------------- Frog Hop */
function FrogHop({ scene, onNext, onWin, sync }: WorldProps) {
  const g = useBlendGame(scene, sync, onWin);
  const reduce = useReducedMotion();
  const n = g.sounds.length;
  const stones = g.sounds.map((_, k) => ({ x: n === 1 ? 50 : 26 + (k * 48) / (n - 1), y: 52 + (k % 2 ? 4 : 0) }));
  const BANK = { x: 10, y: 74 };
  const PADS = [{ x: 44, y: 79 }, { x: 64, y: 85 }, { x: 84, y: 78 }];
  const [onPad, setOnPad] = useState<number | null>(null);
  useEffect(() => { setOnPad(null); }, [g.round]);
  // where the frog is: on the bank, a stone, or a lily pad
  const bs = g.blendStep;
  const onStone = (k: number) => ({ x: stones[k].x, y: stones[k].y - 5 });
  const at = onPad !== null ? { x: PADS[onPad].x, y: PADS[onPad].y - 3 }
    : g.blended ? (bs === -1 ? BANK : bs !== null && bs < n ? onStone(bs) : onStone(n - 1))
      : g.next === 0 ? BANK : onStone(g.next - 1);
  const hopKey = `${onPad}-${g.blended ? bs : g.next}`;
  const cheering = g.solved || g.finished;
  const choose = async (w: string, j: number) => {
    const right = w === g.current.word;
    if (right) setOnPad(j);
    await g.pick(w, PADS[j].x, PADS[j].y - 10);
  };
  return (
    <Shell game={g} title="Frog Hop!" icon="🐸" bg="/lep1/scenes/bg-game-river-wide.png" color="#16a34a" onNext={onNext}
      prompts={{ tap: 'Tap the stones and say the sounds!', blend: 'Hop across fast: Blend!', pick: 'Which lily pad? Hop on the picture!' }}
      blendLabel="🐸 Blend!" onBlend={() => void g.blend(500)}>
      {/* the stepping stones, one sound each */}
      {stones.map((s, k) => {
        const lit = k < g.next;
        const active = g.blended && bs === k;
        return (
          <motion.button key={`${g.round}-${k}`} type="button" aria-label={`Sound ${g.sounds[k]}`} onClick={() => g.tap(k)} className="absolute z-10"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: '24cqh', aspectRatio: '1', translate: '-50% -50%' }}
            initial={reduce ? false : { y: 40, opacity: 0 }} animate={g.nudge === k ? { x: [0, -8, 8, 0], y: 0, opacity: 1 } : { y: active ? [0, 6, 0] : 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: g.nudge === k ? 0 : 0.1 * k }}>
            {/* ripple ring around the stone */}
            {!reduce && <motion.span className="pointer-events-none absolute inset-x-[2%] top-[38%] h-[44%] rounded-[50%] border-[0.5cqh] border-white/60" animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.2, 0.7] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.4 }} />}
            <img src={`${I}/item-stone.png`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
            <span className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 font-black" style={{ ...letterStyle, color: lit || active ? '#14532d' : '#334155' }}>{g.sounds[k]}</span>
            {/* sound dot */}
            <span className="absolute left-1/2 top-[64%] -translate-x-1/2 rounded-full" style={{ width: '3cqh', height: '3cqh', background: lit ? '#22c55e' : '#fff', border: '0.4cqh solid #14532d' }} />
            {k === g.next && !g.blended && !reduce && <motion.span className="pointer-events-none absolute -top-[6%] left-1/2 -translate-x-1/2" style={{ fontSize: '5cqh' }} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.9, repeat: Infinity }}>👇</motion.span>}
          </motion.button>
        );
      })}
      {/* lily pads with the three pictures */}
      {g.blended && bs !== null && bs >= n && g.options.map((o, j) => {
        const isRight = o.word === g.current.word;
        const isWrong = g.wrong.includes(o.word);
        return (
          <motion.button key={`${g.round}-${o.word}`} type="button" aria-label={o.word} onClick={() => void choose(o.word, j)} disabled={g.isMirror || g.solved || isWrong} className="absolute z-20"
            style={{ left: `${PADS[j].x}%`, top: `${PADS[j].y}%`, width: '30cqh', aspectRatio: '1', translate: '-50% -50%' }}
            initial={reduce ? false : { x: j === 0 ? -200 : j === 2 ? 200 : 0, y: j === 1 ? 120 : 0, opacity: 0 }}
            animate={isWrong ? { y: [0, 14, 8], rotate: [0, -8, 6], opacity: 0.5, x: 0 } : { x: 0, y: [0, -4, 0], opacity: 1, rotate: 0 }}
            transition={isWrong ? { duration: 0.5 } : { x: { type: 'spring', stiffness: 120, damping: 14 }, opacity: { duration: 0.3 }, y: { duration: 2.6 + j * 0.3, repeat: Infinity } }}>
            {g.hint && isRight && <span className="pointer-events-none absolute inset-[8%] animate-pulse rounded-full bg-yellow-300/70 blur-xl" />}
            <img src={`${I}/item-lilypad.png`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
            <span className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-lime-200 to-emerald-300 p-[1cqh] shadow-lg"><PictureFace r={o} /></span>
          </motion.button>
        );
      })}
      {/* the frog: slides between spots, hops in an arc on every move */}
      <motion.div className="pointer-events-none absolute z-[5]" style={{ width: '17cqh', aspectRatio: '1', translate: '-50% -88%', zIndex: onPad !== null ? 30 : 5 }}
        initial={false} animate={{ left: `${at.x}%`, top: `${at.y}%` }} transition={reduce ? { duration: 0 } : { duration: g.blended && bs !== null && bs >= 0 && bs < n ? 0.3 : 0.42, ease: 'easeInOut' }}>
        <motion.div key={hopKey} className="absolute inset-0" initial={false} animate={reduce ? {} : { y: [0, -50, 0], scaleY: [0.85, 1.1, 0.9, 1], scaleX: [1.12, 0.92, 1.08, 1] }} transition={{ duration: 0.42 }} style={{ transformOrigin: '50% 100%' }}>
          <FrogPic hopKey={hopKey} cheering={cheering} reduce={reduce} />
        </motion.div>
      </motion.div>
      {/* splash when the frog lands on the right pad */}
      {onPad !== null && g.solved && !reduce && (
        <motion.img src={`${I}/item-water-splash.png`} alt="" className="pointer-events-none absolute z-20" style={{ left: `${PADS[onPad].x}%`, top: `${PADS[onPad].y}%`, width: '26cqh', translate: '-50% -60%' }}
          initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.8, delay: 0.3 }} />
      )}
    </Shell>
  );
}

/** Mid-air for the first part of each hop, sitting when it lands, cheering after the right answer. */
function FrogPic({ hopKey, cheering, reduce }: { hopKey: string; cheering: boolean; reduce: boolean | null }) {
  const [air, setAir] = useState(false);
  useEffect(() => {
    if (reduce) return;
    setAir(true);
    const t = window.setTimeout(() => setAir(false), 300);
    return () => window.clearTimeout(t);
  }, [hopKey, reduce]);
  const src = cheering ? 'frog-cheer' : air ? 'frog-jump' : 'frog-sit';
  return <img src={`${I}/item-${src}.png`} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-[0_1cqh_0.8cqh_rgba(0,0,0,0.3)]" />;
}

/* ---------------------------------------------------------------- Slide Down */
// Measured on item-slide.png (% of the square picture): ladder steps bottom→top, the chute's top edge.
const RUNGS = [{ x: 18, y: 62.5 }, { x: 19.5, y: 56.5 }, { x: 21, y: 50 }, { x: 23, y: 43 }];
const TOP = { x: 31, y: 38 };
const CHUTE = [[38, 38.5], [45, 40], [50, 44.3], [55, 48.9], [60, 53.2], [65, 57.3], [70, 60.9], [75, 63.2], [80, 64.3], [90, 64.5]] as const;
const chuteY = (x: number) => {
  for (let i = 1; i < CHUTE.length; i++) if (x <= CHUTE[i][0]) { const [x0, y0] = CHUTE[i - 1]; const [x1, y1] = CHUTE[i]; return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0); }
  return CHUTE[CHUTE.length - 1][1];
};
const BALL_HUES = [0, 120, 200, 280];

function SlideDown({ scene, onNext, onWin, sync }: WorldProps) {
  const g = useBlendGame(scene, sync, onWin);
  const reduce = useReducedMotion();
  const n = g.sounds.length;
  const rungs = RUNGS.slice(Math.max(0, RUNGS.length - n));
  const balls = g.sounds.map((_, k) => { const x = n === 1 ? 60 : 46 + (k * 32) / (n - 1); return { x, y: chuteY(x) - 6 }; });
  const END = { x: 90, y: 64.5 };
  const bs = g.blendStep;
  // Pip: on the grass, climbing the steps, at the top, sliding past each ball, at the bottom
  const pip = g.blended
    ? (bs === -1 ? TOP : bs !== null && bs < n ? { x: balls[bs].x, y: chuteY(balls[bs].x) } : END)
    : g.next === 0 ? { x: 9, y: 73 } : g.next >= n ? TOP : rungs[g.next - 1];
  const sliding = g.blended;
  const collected = (k: number) => g.blended && bs !== null && bs > k;
  const SAND = [{ x: 64, y: 70 }, { x: 78, y: 78 }, { x: 91, y: 68 }];
  return (
    <Shell game={g} title="Slide Down!" icon="🛝" bg="/lep1/scenes/bg-game-playground-wide.png" color="#f59e0b" onNext={onNext}
      prompts={{ tap: 'Tap the balls and say the sounds! Pip climbs up!', blend: 'Slide down fast: Blend!', pick: 'Which picture is it?' }}
      blendLabel="🛝 Blend!" onBlend={() => void g.blend(550)}>
      {/* the slide and everything on it live in one square box, so positions match the painted slide */}
      <div className="absolute" style={{ left: '1cqw', top: '12cqh', width: '100cqh', height: '100cqh' }}>
        <img src={`${I}/item-slide.png`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_1.5cqh_1cqh_rgba(0,0,0,0.25)]" />
        {/* the sound balls resting on the chute */}
        {balls.map((b, k) => {
          const lit = k < g.next;
          const gone = collected(k);
          return (
            <motion.button key={`${g.round}-${k}`} type="button" aria-label={`Sound ${g.sounds[k]}`} onClick={() => g.tap(k)} className="absolute z-10"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: '12%', aspectRatio: '1', translate: '-50% -50%' }}
              animate={gone ? { left: '50%', top: '-2%', scale: 0.4, opacity: 0 } : g.nudge === k ? { x: [0, -8, 8, 0] } : lit && !reduce ? { y: [0, -10, 0] } : { y: 0 }}
              transition={gone ? { duration: 0.45, ease: 'easeIn' } : { duration: 0.4 }}>
              <img src={`${I}/item-gumball-pink.png`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" style={{ filter: `hue-rotate(${BALL_HUES[k % 4]}deg) saturate(${lit ? 1.2 : 0.35})` }} />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-white" style={{ fontSize: '7cqh', lineHeight: 1, textShadow: '0 0.4cqh 0 rgba(0,0,0,0.35)' }}>{g.sounds[k]}</span>
              {k === g.next && !g.blended && !reduce && <motion.span className="pointer-events-none absolute -top-[70%] left-1/2 -translate-x-1/2" style={{ fontSize: '5cqh' }} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.9, repeat: Infinity }}>👇</motion.span>}
            </motion.button>
          );
        })}
        {/* Pip */}
        <motion.div className="pointer-events-none absolute z-20" style={{ width: '22%', aspectRatio: '1', translate: sliding ? '-45% -82%' : '-50% -96%' }}
          initial={false} animate={{ left: `${pip.x}%`, top: `${pip.y}%` }}
          transition={reduce ? { duration: 0 } : sliding && bs !== null && bs >= 0 ? { duration: 0.32, ease: 'linear' } : { duration: 0.45, ease: 'easeOut' }}>
          <motion.img key={sliding ? 'slide' : `c${g.next}`} src={`${I}/item-${sliding ? 'pip-slide' : 'pip-climb'}.png`} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-[0_1cqh_0.8cqh_rgba(0,0,0,0.3)]"
            initial={false} animate={reduce ? {} : sliding ? { rotate: bs !== null && bs >= n ? [0, -6, 6, 0] : 18 } : { y: [0, -10, 0] }} transition={{ duration: 0.4 }} />
        </motion.div>
        {/* speed lines while sliding */}
        {sliding && !reduce && bs !== null && bs >= 0 && bs < n && (
          <motion.span key={`sl-${bs}`} className="pointer-events-none absolute z-10 h-[1.2%] w-[14%] rounded-full bg-white/80" style={{ left: `${pip.x - 14}%`, top: `${pip.y - 8}%`, rotate: '35deg' }}
            initial={{ opacity: 1, x: 0 }} animate={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }} />
        )}
      </div>
      {/* the pictures waiting in the sandpit */}
      {g.blended && bs !== null && bs >= n && g.options.map((o, j) => {
        const isRight = o.word === g.current.word;
        const isWrong = g.wrong.includes(o.word);
        return (
          <motion.button key={`${g.round}-${o.word}`} type="button" aria-label={o.word} onClick={() => void g.pick(o.word, SAND[j].x, SAND[j].y - 12)} disabled={g.isMirror || g.solved || isWrong}
            className="absolute z-20 rounded-[2.5cqh] bg-gradient-to-b from-amber-200 to-orange-300 p-[1.2cqh] shadow-[0_1cqh_0_#d6a35c,0_1.5cqh_2cqh_rgba(0,0,0,0.3)]"
            style={{ left: `${SAND[j].x}%`, top: `${SAND[j].y}%`, width: '22cqh', aspectRatio: '1', translate: '-50% -50%', border: `0.7cqh solid ${g.solved && isRight ? '#22c55e' : isWrong ? '#ef4444' : '#fde68a'}` }}
            initial={reduce ? false : { y: 140, opacity: 0, rotate: -10 }}
            animate={isWrong ? { x: [0, -10, 10, 0], opacity: 0.45, y: 0, rotate: 0 } : g.solved && isRight ? { scale: [1, 1.25, 1.1], y: 0, opacity: 1, rotate: 0 } : { y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: isWrong || g.solved ? 0 : j * 0.12 }}>
            {g.hint && isRight && <span className="pointer-events-none absolute -inset-[10%] -z-10 animate-pulse rounded-[3cqh] bg-yellow-300/70 blur-lg" />}
            <PictureFace r={o} />
          </motion.button>
        );
      })}
    </Shell>
  );
}

/* ---------------------------------------------------------------- Gumball Blender */
const GUMS = ['pink', 'green', 'pink', 'green'];
const GUM_HUE = [0, 0, 50, 160];
const CAPS = ['red', 'blue', 'yellow'];

function GumballBlender({ scene, onNext, onWin, sync }: WorldProps) {
  const g = useBlendGame(scene, sync, onWin);
  const reduce = useReducedMotion();
  const n = g.sounds.length;
  const bs = g.blendStep;
  const MACHINE = { x: 26, y: 50 }; // centre of the machine picture (stage %)
  const shelf = g.sounds.map((_, k) => ({ x: n === 1 ? 70 : 56 + (k * 30) / (n - 1), y: 36 }));
  // inside the glass globe (stage %): resting spots at the bottom of the globe
  const inGlobe = (k: number) => ({ x: MACHINE.x - 6 + ((k * 12) / Math.max(1, n - 1)), y: 48 - (k % 2) * 3 });
  const CAP = [{ x: 52, y: 76 }, { x: 70, y: 79 }, { x: 88, y: 76 }];
  const cranking = g.blended && bs !== null && bs < n;
  const capsOut = g.blended && bs !== null && bs >= n;
  return (
    <Shell game={g} title="Gumball Blender!" icon="🍬" bg="/lep1/scenes/bg-game-sweetshop-wide.png" color="#ec4899" onNext={onNext}
      prompts={{ tap: 'Tap the gumballs and say the sounds!', blend: 'Turn the handle: Blend!', pick: 'Open the capsule with the picture!' }}
      blendLabel="🍬 Blend!" onBlend={() => void g.blend(500)}>
      {/* soft shadow + the machine; it rattles while it mixes the sounds */}
      <span className="pointer-events-none absolute z-0 h-[5cqh] w-[34cqh] rounded-[50%] bg-black/25 blur-md" style={{ left: `${MACHINE.x}%`, top: '88%', translate: '-50% -50%' }} />
      <motion.img src={`${I}/item-gumball-machine.png`} alt="" draggable={false} className="pointer-events-none absolute z-10 object-contain" style={{ left: `${MACHINE.x}%`, top: `${MACHINE.y}%`, height: '80cqh', aspectRatio: '1', translate: '-50% -50%', transformOrigin: '50% 95%' }}
        animate={cranking && !reduce ? { rotate: [0, -3, 3, -2, 2, 0], scaleY: [1, 0.97, 1.02, 1] } : capsOut && !reduce ? { scaleY: [1, 0.93, 1.04, 1] } : {}} transition={{ duration: 0.45, repeat: cranking ? Infinity : 0 }} />
      {/* the letter gumballs: on the shelf, then in the glass */}
      {g.sounds.map((s, k) => {
        const dropped = k < g.next;
        const spot = dropped ? inGlobe(k) : shelf[k];
        const lit = g.blended && bs === k;
        return (
          <motion.button key={`${g.round}-${k}`} type="button" aria-label={`Sound ${s}`} onClick={() => g.tap(k)} className="absolute z-20"
            style={{ width: dropped ? '11cqh' : '17cqh', aspectRatio: '1', translate: '-50% -50%' }}
            initial={false}
            animate={reduce ? { left: `${spot.x}%`, top: `${spot.y}%` } : dropped ? {
              left: [`${shelf[k].x}%`, `${(shelf[k].x + spot.x) / 2}%`, `${spot.x}%`], top: [`${shelf[k].y}%`, '12%', `${spot.y}%`],
              rotate: cranking ? [0, 360] : 0, scale: lit ? 1.35 : 1,
            } : g.nudge === k ? { left: `${spot.x}%`, top: `${spot.y}%`, x: [0, -8, 8, 0] } : { left: `${spot.x}%`, top: `${spot.y}%`, y: [0, -6, 0] }}
            transition={dropped ? { left: { duration: 0.55, ease: 'easeInOut' }, top: { duration: 0.55, ease: 'easeIn' }, rotate: { duration: 0.6, repeat: cranking ? Infinity : 0, ease: 'linear' }, scale: { duration: 0.2 } } : { y: { duration: 1.8 + k * 0.2, repeat: Infinity }, x: { duration: 0.4 } }}>
            <img src={`${I}/item-gumball-${GUMS[k % 4]}.png`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" style={{ filter: `hue-rotate(${GUM_HUE[k % 4]}deg)` }} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-white" style={{ fontSize: dropped ? '5cqh' : '8cqh', lineHeight: 1, textShadow: '0 0.4cqh 0 rgba(0,0,0,0.35)' }}>{s}</span>
            {k === g.next && !g.blended && !reduce && <motion.span className="pointer-events-none absolute -top-[55%] left-1/2 -translate-x-1/2" style={{ fontSize: '5cqh' }} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.9, repeat: Infinity }}>👇</motion.span>}
          </motion.button>
        );
      })}
      {/* three capsules roll out of the chute */}
      {capsOut && g.options.map((o, j) => {
        const isRight = o.word === g.current.word;
        const isWrong = g.wrong.includes(o.word);
        const open = g.solved && isRight;
        return (
          <motion.button key={`${g.round}-${o.word}`} type="button" aria-label={o.word} onClick={() => void g.pick(o.word, CAP[j].x, CAP[j].y - 14)} disabled={g.isMirror || g.solved || isWrong}
            className="absolute z-30" style={{ width: '24cqh', aspectRatio: '1', translate: '-50% -50%' }}
            initial={reduce ? { left: `${CAP[j].x}%`, top: `${CAP[j].y}%` } : { left: `${MACHINE.x}%`, top: '80%', rotate: 0, scale: 0.4 }}
            animate={isWrong ? { left: `${CAP[j].x}%`, top: `${CAP[j].y}%`, rotate: [0, -12, 12, 0], opacity: 0.45, scale: 1 }
              : { left: `${CAP[j].x}%`, top: `${CAP[j].y}%`, rotate: reduce ? 0 : [0, 360], scale: 1, opacity: 1 }}
            transition={isWrong ? { duration: 0.45 } : { duration: 0.9 + j * 0.2, ease: 'easeOut' }}>
            {g.hint && isRight && <span className="pointer-events-none absolute inset-[5%] animate-pulse rounded-full bg-yellow-300/70 blur-xl" />}
            {/* the capsule: the coloured bottom stays, the picture pops up when it is the right one */}
            <motion.img src={`${I}/item-capsule-${CAPS[j]}.png`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" animate={open && !reduce ? { y: '20%', opacity: 0.6 } : {}} />
            <motion.span className="absolute left-1/2 top-[36%] h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2" animate={open && !reduce ? { y: '-80%', scale: 2 } : {}} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
              <span className="block h-full w-full rounded-full bg-gradient-to-b from-sky-200 to-sky-400 p-[0.6cqh] shadow"><PictureFace r={o} /></span>
            </motion.span>
          </motion.button>
        );
      })}
    </Shell>
  );
}

interface WorldProps { scene: SoundBlendSceneData; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }

/** Renders a non-train Blend It! world. */
export function BlendWorldScene(props: WorldProps & { look: Exclude<BlendLook, 'train'> }) {
  const { look, ...rest } = props;
  if (look === 'frog') return <FrogHop {...rest} />;
  if (look === 'slide') return <SlideDown {...rest} />;
  return <GumballBlender {...rest} />;
}
