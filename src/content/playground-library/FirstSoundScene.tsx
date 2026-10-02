import { useEffect, useMemo, useRef, useState } from 'react';
import { type ActivitySync, useSyncedState } from './sceneActivitySync';
import { seededOrder } from './PictureMatchScene';
import { Burst, Fish, GAME_FONT, GameStyles, HudBar, ProgressPill, PromptChip, SeaBackdrop, TitleRibbon } from './gameTheme';
import { playLetterPhonic, safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `first-sound` ("First Sound Fishing") — reusable beginning-sound activity,
 * shared by every scene library (Pre-A1 Unit 1, Welcome Town, Magic Castle,
 * Jungle Adventure).
 *
 * Underwater scene: a picture floats in a big bubble and its word is spoken.
 * The student catches the fish wearing the letter the word STARTS with (2-4
 * fish). A right catch plays the letter's recorded sound, then the word
 * again, the missing first letter drops into the word sign, and the next
 * picture floats in. Every round can use different letters, so it fits any
 * phonics focus (unlike `sound-sort`, which has two fixed targets).
 *
 * Audio rule (project CLAUDE.md + phonics memory): the isolated sound is the
 * recorded clip only (`playLetterPhonic`, file-only, no TTS fallback); the
 * word itself uses the normal recorded voice.
 * Student comfort: a wrong fish never costs a heart or ends the round; it
 * swims off, the word is repeated, and after two wrong fish the right one
 * wiggles and glows.
 */
export interface FirstSoundRound {
  /** The word, e.g. "moon". */
  word: string;
  /** Its first letter (capital or small), e.g. "M". Must be one of `choices`
   *  (added automatically if missing). */
  letter: string;
  /** 2-4 candidate letters. Order is shuffled identically on every screen. */
  choices: string[];
  img?: string;
  emoji?: string;
}

export interface FirstSoundSceneData {
  id: string;
  kind: 'first-sound';
  teacher: string;
  rounds: FirstSoundRound[];
  /** Instruction banner; defaults to "Catch the fish with the first letter!". */
  prompt?: string;
  bg?: string;
}

interface FirstSoundState {
  round: number;
  /** Wrong letters already tried this round. */
  wrong: string[];
  solved: boolean;
  finished: boolean;
  /** Wrong fish over the whole game (for the star rating). */
  totalWrong: number;
}

const INITIAL: FirstSoundState = { round: 0, wrong: [], solved: false, finished: false, totalWrong: 0 };
const FISH_COLORS = ['#ff8a3d', '#f43f8e', '#8b5cf6', '#22c55e'];
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function FishIconSmall() {
  return (
    <svg viewBox="0 0 60 36" style={{ height: '5cqh' }} aria-hidden="true">
      <path d="M44 18L58 6Q60 18 58 30Z" fill="#ff8a3d" stroke="#5b1d1d" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="26" cy="18" rx="24" ry="15" fill="#ffa04d" stroke="#5b1d1d" strokeWidth="3" />
      <circle cx="14" cy="14" r="3" fill="#5b1d1d" />
    </svg>
  );
}

export function FirstSoundScene({ scene, onNext, onWin, onResult, sync }: {
  scene: FirstSoundSceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  onLose?: () => void;
  /** Standalone games: called once at the end with the number of wrong fish. */
  onResult?: (r: { mistakes: number }) => void;
  sync?: ActivitySync;
}) {
  const rounds = scene.rounds;
  const [state, setState] = useSyncedState<FirstSoundState>(sync, INITIAL);
  const { round, wrong, solved, finished } = state;
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  const current = rounds[Math.min(round, rounds.length - 1)];
  const alive = useRef(true);
  const gemDone = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; count: number; spread: number }[]>([]);
  const burstId = useRef(0);
  const SPLASH = ['#ffffff', '#bfeaff', '#7BE0FF', '#FFC93C', '#ffffff', '#9fdcff'];

  const fireBurst = (x: number, y: number, count = 18, spread = 20) => {
    const id = ++burstId.current;
    setBursts((b) => [...b.slice(-3), { id, x, y, count, spread }]);
    window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
  };

  const choices = useMemo(() => {
    const upper = (s: string) => s.toUpperCase();
    const list = Array.from(new Set([...current.choices.map(upper), upper(current.letter)])).slice(0, 4);
    if (!list.includes(upper(current.letter))) list[list.length - 1] = upper(current.letter);
    return seededOrder(list.length, `${scene.id}:${round}`).map((i) => list[i]);
  }, [current, scene.id, round]);

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
    if (finished) fireBurst(50, 40, 48, 48);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // The right fish splashes on both screens (teacher and student see it).
  useEffect(() => {
    if (!solved) return;
    const root = rootRef.current;
    const el = root?.querySelector('[data-right-fish="1"]') as HTMLElement | null;
    if (!root || !el) return;
    const rr = root.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    fireBurst(((er.left + er.width / 2 - rr.left) / rr.width) * 100, ((er.top + er.height / 2 - rr.top) / rr.height) * 100, 22, 22);
    fireBurst(50, 30, 14, 16); // and the picture bubble pops with joy
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, round]);

  useEffect(() => {
    if (finished && !gemDone.current && !isMirror) {
      gemDone.current = true;
      sfx.whoop();
      sfx.gem();
      onResult?.({ mistakes: state.totalWrong });
      onWin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Say the word when each picture appears.
  useEffect(() => {
    if (isMirror || finished) return;
    const t = window.setTimeout(() => { void safeSpeak(current.word, 'teacher'); }, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (letter: string) => {
    if (isMirror || solved || finished || wrong.includes(letter)) return;
    if (letter === current.letter.toUpperCase()) {
      sfx.match();
      setState((s) => ({ ...s, solved: true }));
      await playLetterPhonic(letter.toLowerCase());
      if (!alive.current) return;
      await safeSpeak(current.word, 'teacher');
      await sleep(700);
      if (!alive.current) return;
      if (round + 1 < rounds.length) setState((s) => ({ ...INITIAL, round: round + 1, totalWrong: s.totalWrong }));
      else setState((s) => ({ ...s, finished: true }));
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, wrong: [...s.wrong, letter], totalWrong: s.totalWrong + 1 }));
      await sleep(600);
      if (alive.current) void safeSpeak(current.word, 'teacher'); // hear it again, calmly
    }
  };

  const target = current.letter.toUpperCase();
  const hint = wrong.length >= 2 && !solved;
  const fishW = `min(${Math.min(23, Math.floor(92 / choices.length) - 2.5)}cqw, 36cqh)`;
  const word = current.word;
  const first = word.charAt(0);
  const rest = word.slice(1);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden select-none" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT }}>
      <GameStyles />
      <style>{`
        @keyframes fs-swim-in { 0% { transform: translateX(38cqw) rotate(7deg); opacity: 0; } 70% { opacity: 1; } 100% { transform: none; opacity: 1; } }
        @keyframes fs-swim { 0%,100% { transform: translate(0,0) rotate(-1.5deg); } 50% { transform: translate(1.2cqw,-1.6cqh) rotate(1.5deg); } }
        @keyframes fs-flee { 0% { transform: translate(0,0); opacity: 1; } 100% { transform: translate(-40cqw,-12cqh) scale(.7); opacity: 0; } }
        @keyframes fs-jump { 0% { transform: translateY(0) scale(1); } 40% { transform: translateY(-9cqh) scale(1.18) rotate(-6deg); } 100% { transform: translateY(0) scale(1.1); } }
        @keyframes fs-glow { 0%,100% { filter: drop-shadow(0 0 0 rgba(253,224,71,0)); transform: scale(1); } 50% { filter: drop-shadow(0 0 2.4cqh rgba(253,224,71,1)); transform: scale(1.07); } }
        @keyframes fs-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1cqh); } }
        @keyframes fs-pop { 0% { transform: scale(.4); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
      <SeaBackdrop bg={scene.bg} />

      <HudBar
        left={<TitleRibbon text="First Sound Fishing" icon={<FishIconSmall />} />}
        centre={<PromptChip>{finished ? 'Great fishing!' : (scene.prompt ?? 'Catch the fish with the first letter!')}</PromptChip>}
        right={<ProgressPill done={finished ? rounds.length : round + (solved ? 1 : 0)} total={rounds.length} color="#f59e0b" label="caught" />}
      />

      {/* Picture in a bubble + replay */}
      <div className="absolute inset-x-0 flex items-center justify-center" style={{ top: '11.5%', height: '38%' }}>
        <div key={`bubble-${round}`} className="aspect-square h-full" style={{ animation: 'gt-pop-in .65s cubic-bezier(.2,.9,.3,1.4) both' }}>
        <button
          type="button"
          onClick={() => !isMirror && void safeSpeak(word, 'teacher')}
          aria-label={`Hear the word ${word}`}
          className={`${solved ? '' : 'gt-idle '}relative flex h-full w-full items-center justify-center rounded-full active:scale-95`}
          style={{ background: 'radial-gradient(circle at 30% 28%, rgba(255,255,255,.95), rgba(255,255,255,.78) 55%, rgba(200,236,255,.7))', boxShadow: '0 0 0 0.8cqh rgba(255,255,255,.75), 0 2cqh 4cqh rgba(3,60,110,.35)', animation: solved ? 'gt-speak .6s ease-in-out 2' : 'fs-bob 3.4s ease-in-out infinite' }}
        >
          {current.img
            ? <img key={`${round}-${word}`} src={current.img} alt="" className="h-[74%] w-[74%] object-contain" style={{ animation: 'fs-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} draggable={false} />
            : <span style={{ fontSize: '17cqh', lineHeight: 1 }}>{current.emoji ?? ''}</span>}
          <span className="absolute bottom-[6%] right-[6%] flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg" style={{ width: '8cqh', height: '8cqh' }}>
            <svg viewBox="0 0 24 24" style={{ width: '60%', height: '60%' }} aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          </span>
        </button>
        </div>
      </div>

      {/* Word sign: the first letter is missing until you catch the right fish */}
      <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center" style={{ top: '50%', height: '11%' }}>
        <div className="flex items-center rounded-[2cqh] border-[0.5cqh] border-[#8a5a2b] bg-[#f4c87a] px-[3cqw] font-black text-[#4a2a0c] shadow-[0_0.8cqh_0_#8a5a2b]" style={{ fontSize: '7.5cqh', lineHeight: 1.15, letterSpacing: '0.08em' }}>
          <span className={solved || finished ? 'text-emerald-700' : 'text-[#b8895a]'} style={solved || finished ? { animation: 'fs-pop .4s cubic-bezier(0.34,1.56,0.64,1)' } : undefined}>{solved || finished ? first : '_'}</span>
          <span>{rest}</span>
        </div>
      </div>

      {/* The fish */}
      <div className="absolute inset-x-[3%] flex items-center justify-center" style={{ bottom: '6%', height: '31%' }}>
        {finished ? (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)' }}>
            Well done! Next ⭐
          </button>
        ) : (
          <div className="flex items-center justify-center" style={{ gap: '2.5cqw' }}>
            {choices.map((letter, i) => {
              const isRight = solved && letter === target;
              const isWrong = wrong.includes(letter);
              const isHint = hint && letter === target;
              const animation = isWrong ? 'fs-flee 0.9s ease-in forwards'
                : isRight ? 'fs-jump 0.7s ease-out forwards'
                  : isHint ? 'fs-glow 0.9s ease-in-out infinite'
                    : `fs-swim ${3 + (i % 3) * 0.6}s ease-in-out ${i * 0.35}s infinite`;
              return (
                <span key={`${round}-${letter}`} className="block" style={{ animation: `fs-swim-in .8s cubic-bezier(.2,.8,.3,1) ${i * 130}ms both` }}>
                <button
                  type="button"
                  onClick={() => void pick(letter)}
                  disabled={isMirror || solved || isWrong}
                  aria-label={`Letter ${letter}`}
                  data-right-fish={letter === target ? '1' : undefined}
                  className={`${isMirror ? 'cursor-default' : 'active:scale-95'}`}
                  style={{ width: fishW, animation, pointerEvents: isWrong ? 'none' : undefined }}
                >
                  <Fish color={isRight ? '#22c55e' : FISH_COLORS[(i + round) % FISH_COLORS.length]} style={{ width: '100%' }}>
                    <span style={{ fontSize: `calc(${fishW} * 0.34)`, lineHeight: 1, textShadow: '0 0.4cqh 0 rgba(0,0,0,.25)' }}>
                      {letter}<span style={{ fontSize: '0.6em' }}>{letter.toLowerCase()}</span>
                    </span>
                  </Fish>
                </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
      {bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} count={b.count} spread={b.spread} colors={SPLASH} />)}
    </div>
  );
}
