import { useEffect, useMemo, useRef, useState } from 'react';
import { type ActivitySync, isSharedFollower, useSyncedState } from './sceneActivitySync';
import { seededOrder } from './PictureMatchScene';
import { Burst, GAME_FONT, GameStyles, HudBar, LocoIcon, ProgressPill, PromptChip, SkyBackdrop, TitleRibbon, TrainCar } from './gameTheme';
import { playLetterPhonic, safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `sound-blend` ("Blend It! — the Sound Train") — the universal phonics slide (lesson blueprint slot 14),
 * shared by every Playground scene library (Pre-A1 Unit 1, Welcome Town A1/A2, Magic Castle, Jungle).
 *
 * Each sound of a word rides in its own train car ("sound buttons", the Jolly Phonics / Oxford Phonics
 * World / Teach Your Monster to Read blending routine: say each sound, then push them together):
 *   1. SAY THE SOUNDS — tap every car; each plays its RECORDED letter sound (playLetterPhonic: file only,
 *      never TTS — CLAUDE.md phonics rule) and lights up.
 *   2. BLEND — press "Blend!": the cars roll together, the sounds play close together, then the whole word
 *      is spoken in the normal recorded voice.
 *   3. FIND IT — pick the picture of the word out of three (the other pictures come from the other rounds),
 *      so the child must really decode, not guess from a picture shown first.
 * Student comfort: a wrong picture never costs a heart; the word is said again and after two misses the
 * right picture glows. Fully synced (real state), so the teacher's and the student's trains match.
 */
export interface SoundBlendRound {
  /** The word to blend, e.g. "cat". */
  word: string;
  /** Its sounds, one per car, e.g. ['c', 'a', 't'] or ['sh', 'i', 'p']. Default: one letter per car. */
  sounds?: string[];
  img?: string;
  emoji?: string;
}

export interface SoundBlendSceneData {
  id: string;
  kind: 'sound-blend';
  teacher: string;
  /** 3-5 words; their pictures are also the wrong answers for each other. */
  rounds: SoundBlendRound[];
  /** Instruction banner override. */
  prompt?: string;
  bg?: string;
}

interface BlendState {
  round: number;
  /** Cars tapped this round (indexes). */
  tapped: number[];
  blended: boolean;
  /** Wrong pictures tried this round (words). */
  wrong: string[];
  solved: boolean;
  finished: boolean;
  totalWrong: number;
}

const INITIAL: BlendState = { round: 0, tapped: [], blended: false, wrong: [], solved: false, finished: false, totalWrong: 0 };
const CAR_COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#ec4899'];
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** The sounds of a round (explicit, or one letter per car). Exported for the voice baker and homework. */
export const blendSounds = (r: SoundBlendRound): string[] => r.sounds ?? r.word.toLowerCase().split('');

export function SoundBlendScene({ scene, onNext, onWin, onResult, sync }: {
  scene: SoundBlendSceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  onLose?: () => void;
  onResult?: (r: { mistakes: number }) => void;
  sync?: ActivitySync;
}) {
  const rounds = scene.rounds;
  const [state, setState] = useSyncedState<BlendState>(sync, INITIAL);
  const { round, tapped, blended, wrong, solved, finished } = state;
  const tappedSet = useMemo(() => new Set(tapped), [tapped]);
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  const isFollower = isSharedFollower(sync);
  const current = rounds[Math.min(round, rounds.length - 1)];
  const sounds = blendSounds(current);
  const allTapped = sounds.every((_, i) => tappedSet.has(i));
  const alive = useRef(true);
  const gemDone = useRef(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const burstId = useRef(0);
  const fire = (x: number, y: number) => {
    const id = ++burstId.current;
    setBursts((b) => [...b.slice(-3), { id, x, y }]);
    window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
  };

  // Three pictures: this word + two others from the lesson's rounds, the same order on every screen.
  const options = useMemo(() => {
    const others = rounds.filter((r) => r.word !== current.word);
    const pick = seededOrder(others.length, `${scene.id}:d${round}`).slice(0, 2).map((i) => others[i]);
    const list = [current, ...pick];
    return seededOrder(list.length, `${scene.id}:o${round}`).map((i) => list[i]);
  }, [rounds, current, scene.id, round]);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => { setState(INITIAL); gemDone.current = false; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [scene.id]);
  useEffect(() => { if (finished) fire(50, 40); }, [finished]);
  useEffect(() => {
    if (finished && !gemDone.current && !isMirror && !isFollower) {
      gemDone.current = true;
      sfx.whoop(); sfx.gem();
      onResult?.({ mistakes: state.totalWrong });
      onWin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const tapCar = (i: number) => {
    if (isMirror || blended || finished) return;
    sfx.pop();
    void playLetterPhonic(sounds[i]);
    if (!tappedSet.has(i)) setState((s) => ({ ...s, tapped: [...s.tapped, i] }));
  };

  const blend = async () => {
    if (isMirror || blended || !allTapped || finished) return;
    setState((s) => ({ ...s, blended: true }));
    sfx.whoop();
    for (const snd of sounds) { await playLetterPhonic(snd); if (!alive.current) return; await sleep(60); }
    await sleep(250);
    if (!alive.current) return;
    fire(50, 46);
    await safeSpeak(current.word, 'teacher');
  };

  const pick = async (w: string) => {
    if (isMirror || !blended || solved || finished || wrong.includes(w)) return;
    if (w === current.word) {
      sfx.match();
      setState((s) => ({ ...s, solved: true }));
      fire(50, 75);
      await safeSpeak(current.word, 'teacher');
      await sleep(900);
      if (!alive.current) return;
      if (round + 1 < rounds.length) setState((s) => ({ ...INITIAL, round: s.round + 1, totalWrong: s.totalWrong }));
      else setState((s) => ({ ...s, finished: true }));
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, wrong: [...s.wrong, w], totalWrong: s.totalWrong + 1 }));
      await sleep(500);
      if (alive.current) void safeSpeak(current.word, 'teacher');
    }
  };

  const prompt = finished ? 'You can blend words!'
    : !allTapped ? (scene.prompt ?? 'Tap each car and say its sound!')
      : !blended ? 'Now push the sounds together: Blend!'
        : solved ? `${current.word}!` : 'Which picture is it?';
  const carUnit = `min(${Math.floor(60 / (sounds.length + 1))}cqw, 22cqh)`;
  const hint = wrong.length >= 2 && !solved;

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT }}>
      <GameStyles />
      <style>{`
        @keyframes sb-roll-in { 0% { transform: translateX(-70cqw); } 100% { transform: none; } }
        @keyframes sb-lit { 0% { transform: translateY(0) scale(1); } 40% { transform: translateY(-3cqh) scale(1.1); } 100% { transform: translateY(0) scale(1); } }
        @keyframes sb-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(253,224,71,.0); transform: scale(1); } 50% { box-shadow: 0 0 0 1.6cqh rgba(253,224,71,.85); transform: scale(1.05); } }
        @keyframes sb-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-1.2cqw); } 75% { transform: translateX(1.2cqw); } }
      `}</style>
      <SkyBackdrop bg={scene.bg} />
      {scene.bg && <div className="pointer-events-none absolute inset-0 bg-white/25" />}

      <HudBar
        left={<TitleRibbon text="Blend It!" icon={<LocoIcon height="4.5cqh" />} />}
        centre={<PromptChip>{prompt}</PromptChip>}
        right={<ProgressPill done={finished ? rounds.length : round + (solved ? 1 : 0)} total={rounds.length} color="#f97316" label="words" />}
      />

      {/* The word written above the train once it is blended */}
      <div className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ top: '14%', height: '12%' }}>
        {blended && !finished && (
          <div key={`w-${round}`} className="rounded-[2cqh] border-[0.5cqh] border-[#8a5a2b] bg-[#f4c87a] px-[3cqw] font-black text-[#4a2a0c] shadow-[0_0.8cqh_0_#8a5a2b]" style={{ fontSize: '8cqh', lineHeight: 1.2, letterSpacing: '0.06em', animation: 'gt-pop-in .45s cubic-bezier(.2,.9,.3,1.4) both' }}>
            {current.word}
          </div>
        )}
      </div>

      {/* The Sound Train: engine + one car per sound, on a track */}
      {!finished && (
        <div className="absolute inset-x-0 flex items-end justify-center" style={{ top: '28%', height: '30%' }}>
          <div key={`train-${round}`} className="flex items-end" style={{ gap: blended ? '0.4cqw' : '3cqw', transition: 'gap .7s cubic-bezier(.2,.9,.3,1.1)', animation: 'sb-roll-in 1s cubic-bezier(.2,.8,.3,1) both' }}>
            {sounds.map((snd, i) => {
              const lit = tappedSet.has(i);
              return (
                <button
                  key={`${round}-${i}`}
                  type="button"
                  onClick={() => tapCar(i)}
                  disabled={isMirror || blended}
                  aria-label={`Sound ${snd}`}
                  className={isMirror ? 'cursor-default' : 'active:scale-95'}
                  style={{ animation: lit && !blended ? 'sb-lit .45s ease-out' : undefined }}
                >
                  <TrainCar unit={carUnit} color={lit ? CAR_COLORS[i % CAR_COLORS.length] : '#94a3b8'} glyph={`calc(${carUnit} * 0.5)`} sound={!lit} rolling={blended && !solved}>
                    {snd}
                  </TrainCar>
                  {/* sound button: the dot under each sound */}
                  <span className="mx-auto mt-[0.6cqh] block rounded-full" style={{ width: '2.4cqh', height: '2.4cqh', background: lit ? '#16a34a' : '#ffffff', border: '0.4cqh solid #14532d' }} />
                </button>
              );
            })}
            <span className="ml-[1cqw] block" style={{ transform: 'scaleX(-1)' }}><LocoIcon height={`calc(${carUnit} * 0.95)`} smoke={blended && !solved} /></span>
          </div>
        </div>
      )}
      {!finished && <div className="pointer-events-none absolute inset-x-[6%] rounded-full bg-[#8a5a2b]" style={{ top: '60%', height: '1.2cqh' }} />}

      {/* Bottom: Blend button, then the three pictures */}
      <div className="absolute inset-x-[3%] flex items-center justify-center" style={{ bottom: '5%', height: '32%' }}>
        {finished ? (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)' }}>
            Super blending! Next ⭐
          </button>
        ) : !blended ? (
          <button
            type="button"
            onClick={() => void blend()}
            disabled={isMirror || !allTapped}
            className="rounded-full px-[6cqw] py-[2.2cqh] font-black text-white shadow-2xl transition active:scale-95 disabled:opacity-40"
            style={{ fontSize: 'clamp(1.1rem, 6cqh, 2.4rem)', background: 'linear-gradient(90deg, #f97316, #ec4899)', animation: allTapped ? 'gt-glow-pulse 1.4s ease-in-out infinite' : undefined }}
          >
            🚂 Blend!
          </button>
        ) : (
          <div className="flex h-full items-center justify-center" style={{ gap: '3cqw' }}>
            {options.map((o) => {
              const isRight = o.word === current.word;
              const isWrong = wrong.includes(o.word);
              return (
                <button
                  key={`${round}-${o.word}`}
                  type="button"
                  onClick={() => void pick(o.word)}
                  disabled={isMirror || solved || isWrong}
                  aria-label={o.word}
                  className="flex aspect-square h-full items-center justify-center rounded-[3cqh] bg-white shadow-xl active:scale-95"
                  style={{
                    border: `0.7cqh solid ${solved && isRight ? '#22c55e' : isWrong ? '#ef4444' : '#fed7aa'}`,
                    opacity: isWrong ? 0.45 : 1,
                    animation: isWrong ? 'sb-shake .4s' : hint && isRight ? 'sb-glow 1s ease-in-out infinite' : 'gt-pop-in .5s cubic-bezier(.2,.9,.3,1.4) both',
                  }}
                >
                  {o.img ? <img src={o.img} alt="" className="h-[80%] w-[80%] object-contain" draggable={false} /> : <span style={{ fontSize: '16cqh', lineHeight: 1 }}>{o.emoji ?? ''}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} />)}
    </div>
  );
}
