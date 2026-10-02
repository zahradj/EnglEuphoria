import { useEffect, useMemo, useRef, useState } from 'react';
import { type ActivitySync, useSyncedState } from './sceneActivitySync';
import { seededOrder } from './PictureMatchScene';
import { Burst, GAME_FONT, GameStyles, GardenBackdrop, HudBar, ProgressPill, PromptChip, TitleRibbon } from './gameTheme';
import { safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `grammar-gap` ("Grammar Garden") — reusable grammar game, shared by every scene library
 * (Pre-A1 Unit 1, Welcome Town, Magic Castle, Jungle).
 *
 * A wooden sign shows a sentence with ONE gap ("There ___ two balls.") and, when useful,
 * a picture (repeated `count` times, so "one cat / two cats" is *seen*). Two or three flower
 * buttons hold the choices (is / are). A right pick makes the flower bloom into the gap and
 * the whole sentence is read aloud; a wrong pick wobbles away — no hearts, no penalty — and
 * after two wrong picks the right flower glows.
 *
 * Model first: before the first round the scene reads a few worked EXAMPLES aloud
 * ("a ball", "an apple") so the student hears the pattern before choosing.
 *
 * Classic ESL "gap-fill / choose the correct form" (Cambridge Starters & Movers grammar tasks),
 * turned into a game. Taps, not drags, so it works with the smart pen and on touch.
 *
 * Classroom rules (see .claude/skills/classroom-sync-robustness): ONE synced state object,
 * every field has a typed default, no Set/Map, every index read from state is clamped.
 */
export interface GrammarGapRound {
  /** Text before the gap, e.g. "There". May be empty. */
  before: string;
  /** Text after the gap, e.g. "two balls." May be empty. */
  after: string;
  /** 2-3 choices, e.g. ["is", "are"]. */
  choices: string[];
  /** Must be one of `choices`. */
  answer: string;
  img?: string;
  /** How many times the picture is shown (1-6). Default 1. */
  count?: number;
  /** Colour code for this round's choices (word -> hex). Falls back to the scene's `colors`. */
  colors?: Record<string, string>;
  /** The word in `before`/`after` that decides the answer ("apple" for a/an, "two" for is/are, "She" for is).
   *  It is highlighted in the answer's colour once the round is solved, or when the hint glows. */
  clue?: string;
}

/** One line of the colour key shown under the title, e.g. { word: 'an', note: 'before a, e, i, o, u' }. */
export interface GrammarLegendItem {
  word: string;
  note: string;
  /** Hex colour; defaults to the scene's colour for `word`. */
  color?: string;
}

export interface GrammarGapSceneData {
  id: string;
  kind: 'grammar-gap';
  teacher: string;
  rounds: GrammarGapRound[];
  /** Worked examples read aloud before round 1 (the "model first" step), e.g. ["a ball", "an apple"]. */
  examples?: string[];
  /** One-line rule shown on the sign during the examples, e.g. "an goes before a, e, i, o, u". */
  rule?: string;
  /** Colour code for the choices (word -> hex): the same word always has the same colour, so colour explains the grammar. */
  colors?: Record<string, string>;
  /** Colour key shown under the title for the whole stop. */
  legend?: GrammarLegendItem[];
  /** Banner name; defaults to "Grammar Garden". */
  title?: string;
  /** Optional background art; the scene draws its own garden, but the lesson players read `bg` on every scene. */
  bg?: string;
}

interface GapState {
  round: number;
  /** Wrong choices tried this round. */
  wrong: string[];
  /** Wrong picks over the whole game (for the star rating). */
  totalWrong: number;
  /** Example being read aloud (-1 = none). */
  exIdx: number;
  introDone: boolean;
  /** The right flower has bloomed; the sentence is being read. */
  solved: boolean;
  finished: boolean;
}

const INITIAL: GapState = { round: 0, wrong: [], totalWrong: 0, exIdx: -1, introDone: false, solved: false, finished: false };
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const FLOWER_COLORS = ['#ec4899', '#f59e0b', '#8b5cf6'];

const colorOf = (scene: GrammarGapSceneData, round: GrammarGapRound | undefined, word: string, fallback: string) =>
  round?.colors?.[word] ?? scene.colors?.[word] ?? fallback;

/** Splits `text` around the clue word so the clue can be coloured; returns plain text when there is no clue. */
function withClue(text: string, clue: string | undefined, on: boolean, color: string) {
  if (!clue || !text) return text;
  const at = text.toLowerCase().indexOf(clue.toLowerCase());
  if (at < 0) return text;
  const end = at + clue.length;
  return (
    <>
      {text.slice(0, at)}
      <span
        style={{
          color: on ? color : undefined,
          borderBottom: on ? `0.7cqh solid ${color}` : '0.7cqh solid transparent',
          transition: 'color .3s, border-color .3s',
        }}
      >
        {text.slice(at, end)}
      </span>
      {text.slice(end)}
    </>
  );
}

const gapSentence = (r: GrammarGapRound, word: string) =>
  [r.before, word, r.after].map((p) => (p ?? '').trim()).filter(Boolean).join(' ');

export function GrammarGapScene({ scene, onNext, onWin, onResult, sync }: {
  scene: GrammarGapSceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  onLose?: () => void;
  /** Standalone games: called once at the end with the number of wrong picks. */
  onResult?: (r: { mistakes: number }) => void;
  sync?: ActivitySync;
}) {
  const rounds = (Array.isArray(scene.rounds) ? scene.rounds : []).filter(
    (r) => r && Array.isArray(r.choices) && r.choices.length >= 2 && r.choices.includes(r.answer),
  );
  const examples = (Array.isArray(scene.examples) ? scene.examples : []).filter((e) => typeof e === 'string' && e.trim());
  const [state, setState] = useSyncedState<GapState>(sync, INITIAL);
  const isMirror = !!sync?.isSynced && !sync.isAuthority;

  // ---- everything below is read defensively: a mirror may hold any snapshot
  const finished = state.finished === true;
  const roundNo = Number.isFinite(state.round) ? Math.max(0, Math.min(Math.floor(state.round), Math.max(rounds.length - 1, 0))) : 0;
  const wrong = Array.isArray(state.wrong) ? state.wrong.filter((w) => typeof w === 'string') : [];
  const totalWrong = Number.isFinite(state.totalWrong) ? state.totalWrong : 0;
  const exIdx = Number.isFinite(state.exIdx) ? state.exIdx : -1;
  const solved = state.solved === true;
  const introDone = examples.length === 0 || state.introDone === true;
  const round = rounds[roundNo];

  const alive = useRef(true);
  const gemDone = useRef(false);
  const token = useRef(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; count: number; spread: number }[]>([]);
  const burstId = useRef(0);

  const burstAt = (selector: string, count = 16, spread = 16) => {
    const root = rootRef.current;
    const el = root?.querySelector(selector) as HTMLElement | null;
    if (!root || !el) return;
    const rr = root.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (!rr.width || !rr.height) return;
    const id = ++burstId.current;
    const x = ((er.left + er.width / 2 - rr.left) / rr.width) * 100;
    const y = ((er.top + er.height / 2 - rr.top) / rr.height) * 100;
    setBursts((b) => [...b.slice(-3), { id, x, y, count, spread }]);
    window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
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
    if (finished && !gemDone.current && !isMirror) {
      gemDone.current = true;
      sfx.whoop();
      sfx.gem();
      onResult?.({ mistakes: totalWrong });
      onWin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => {
    if (finished) {
      const id = ++burstId.current;
      setBursts((b) => [...b.slice(-3), { id, x: 50, y: 40, count: 48, spread: 48 }]);
      window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
    }
  }, [finished]);

  // ---- model first: read the worked examples aloud, one by one
  useEffect(() => {
    if (isMirror || finished || examples.length === 0 || state.introDone === true) return;
    const mine = ++token.current;
    (async () => {
      await sleep(600);
      for (let i = 0; i < examples.length; i++) {
        if (!alive.current || token.current !== mine) return;
        setState((s) => ({ ...s, exIdx: i }));
        await safeSpeak(examples[i], 'teacher');
        await sleep(450);
      }
      if (alive.current && token.current === mine) setState((s) => ({ ...s, exIdx: -1, introDone: true }));
    })();
    const counter = token;
    return () => { counter.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const order = useMemo(
    () => seededOrder(Math.max(round?.choices.length ?? 1, 1), `${scene.id}:${roundNo}`),
    [scene.id, roundNo, round],
  );

  const pick = async (word: string) => {
    if (isMirror || finished || solved || !introDone || !round || wrong.includes(word)) return;
    if (word === round.answer) {
      sfx.match();
      setState((s) => ({ ...s, solved: true }));
      burstAt('[data-gg-gap]', 18, 14);
      const mine = ++token.current;
      await safeSpeak(gapSentence(round, word), 'teacher');
      await sleep(700);
      if (!alive.current || token.current !== mine) return;
      if (roundNo + 1 < rounds.length) {
        setState((s) => ({ ...INITIAL, round: roundNo + 1, introDone: true, totalWrong: Number.isFinite(s.totalWrong) ? s.totalWrong : 0 }));
      } else {
        setState((s) => ({ ...s, finished: true }));
      }
    } else {
      sfx.wrong();
      setState((s) => ({
        ...s,
        wrong: [...(Array.isArray(s.wrong) ? s.wrong : []), word],
        totalWrong: (Number.isFinite(s.totalWrong) ? s.totalWrong : 0) + 1,
      }));
    }
  };

  if (!round) return <div className="absolute inset-0" />;

  const count = Math.max(1, Math.min(6, Math.floor(round.count ?? 1)));
  const hint = wrong.length >= 2 && !solved;
  const title = scene.title ?? 'Grammar Garden';
  const prompt = finished ? 'The garden is in bloom! Well done!'
    : !introDone ? 'Listen to the pattern…'
      : solved ? 'Yes!'
        : 'Pick the flower that fits the gap.';
  const sentenceSize = 'clamp(1.4rem, 8.2cqh, 3.6rem)';
  const answerColor = colorOf(scene, round, round.answer, '#16a34a');
  const showClue = solved || hint;
  const legend = (Array.isArray(scene.legend) ? scene.legend : []).filter((l) => l && typeof l.word === 'string' && typeof l.note === 'string');

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden select-none" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT }}>
      <GameStyles />
      <style>{`
        @keyframes gg-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
        @keyframes gg-glow { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(253,224,71,0)); } 50% { transform: scale(1.08); filter: drop-shadow(0 0 2.4cqh rgba(253,224,71,1)); } }
        @keyframes gg-bloom { 0% { transform: scale(.3) rotate(-40deg); } 70% { transform: scale(1.25) rotate(8deg); } 100% { transform: scale(1) rotate(0); } }
      `}</style>
      <GardenBackdrop />

      <HudBar
        left={<TitleRibbon text={title} icon={<span style={{ fontSize: '4.4cqh', lineHeight: 1 }} aria-hidden="true">🌻</span>} />}
        centre={<PromptChip>{prompt}</PromptChip>}
        right={<ProgressPill done={Math.min(rounds.length, roundNo + (solved || finished ? 1 : 0))} total={rounds.length} color="#16a34a" label="flowers" />}
      />

      {/* Colour key: the colour of each word explains the rule */}
      {legend.length > 0 && (
        <div className="absolute inset-x-0 flex flex-wrap items-center justify-center" style={{ top: '11%', gap: '1.2cqw', padding: '0 3cqw' }} aria-label="Colour key">
          {legend.map((l) => {
            const c = l.color ?? colorOf(scene, undefined, l.word, '#64748b');
            return (
              <span key={l.word} className="inline-flex items-center rounded-full bg-white/90 font-black shadow" style={{ gap: '0.8cqw', padding: '0.4cqh 1.4cqw', fontSize: 'clamp(0.8rem, 3.2cqh, 1.4rem)', lineHeight: 1.2, border: `0.45cqh solid ${c}` }}>
                <span className="rounded-full text-white" style={{ background: c, padding: '0 1.1cqw' }}>{l.word}</span>
                <span style={{ color: '#334155' }}>{l.note}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* The picture(s) */}
      <div className="absolute inset-x-0 flex items-end justify-center" style={{ top: legend.length > 0 ? '17%' : '12%', height: legend.length > 0 ? '19%' : '23%', gap: '1.2cqw' }}>
        {round.img && Array.from({ length: count }).map((_, i) => (
          <img
            key={`${roundNo}-${i}`}
            src={round.img}
            alt=""
            draggable={false}
            className="object-contain drop-shadow-lg"
            style={{ height: count > 3 ? '13cqh' : legend.length > 0 ? '17cqh' : '21cqh', animation: `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${i * 90}ms both` }}
          />
        ))}
      </div>

      {/* The wooden sign with the sentence */}
      <div className="absolute inset-x-[4%] flex items-center justify-center" style={{ top: '36%', height: '22%' }}>
        <div
          className="flex flex-wrap items-center justify-center rounded-[3cqh] px-[3cqw] py-[1.4cqh] font-black text-amber-950 shadow-[0_1.2cqh_0_rgba(0,0,0,.3)]"
          style={{ background: 'linear-gradient(180deg,#f3d9a4,#d9a65e)', outline: '0.6cqh solid #92400e', fontSize: sentenceSize, lineHeight: 1.25, gap: '0.5em', minHeight: '14cqh' }}
        >
          {!introDone ? (
            <span className="flex flex-col items-center gap-[0.6cqh]">
              <span className="flex flex-wrap items-center justify-center" style={{ gap: '1.2cqw' }}>
                {examples.map((e, i) => (
                  <span
                    key={e}
                    className="rounded-full px-[1.4cqw] py-[0.3cqh]"
                    style={{ background: exIdx === i ? '#facc15' : 'rgba(255,255,255,.6)', transform: exIdx === i ? 'scale(1.12)' : undefined, transition: 'all .25s' }}
                  >
                    {e}
                  </span>
                ))}
              </span>
              {scene.rule && <span className="font-bold text-amber-900" style={{ fontSize: '0.5em', lineHeight: 1.2 }}>{scene.rule}</span>}
            </span>
          ) : (
            <>
              {round.before && <span>{withClue(round.before, round.clue, showClue, answerColor)}</span>}
              <span
                data-gg-gap
                className="inline-flex items-center justify-center rounded-[1.4cqh] px-[1.6cqw]"
                style={{
                  minWidth: '9cqw', minHeight: '1.3em',
                  background: solved ? answerColor : 'rgba(255,255,255,.7)',
                  border: solved ? `0.4cqh solid ${answerColor}` : '0.5cqh dashed #92400e',
                  color: solved ? '#ffffff' : '#92400e',
                  animation: solved ? 'gg-bloom .6s cubic-bezier(.2,.9,.3,1.3) both' : undefined,
                }}
              >
                {solved ? round.answer : '?'}
              </span>
              {round.after && <span>{withClue(round.after, round.clue, showClue, answerColor)}</span>}
            </>
          )}
        </div>
      </div>

      {/* The flowers with the choices */}
      <div className="absolute inset-x-0 flex items-end justify-center" style={{ top: '62%', height: '32%', gap: '3cqw' }}>
        {finished ? (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)', animation: 'gt-pop-in .5s cubic-bezier(.2,.9,.3,1.4) both' }}>
            Well done! Next ⭐
          </button>
        ) : (
          order.map((srcIdx, k) => {
            const word = round.choices[srcIdx];
            if (typeof word !== 'string') return null;
            const isWrong = wrong.includes(word);
            const isRight = solved && word === round.answer;
            const isHint = hint && word === round.answer;
            const color = colorOf(scene, round, word, FLOWER_COLORS[k % FLOWER_COLORS.length]);
            return (
              <button
                key={`${roundNo}-${word}-${k}`}
                type="button"
                disabled={isMirror || finished || solved || !introDone || isWrong}
                onClick={() => void pick(word)}
                aria-label={word}
                className="relative flex flex-col items-center transition active:scale-95"
                style={{
                  width: 'min(22cqw, 30cqh)', opacity: isWrong ? 0.4 : introDone ? 1 : 0.5,
                  animation: isWrong ? 'gg-wobble .45s ease-in-out' : isHint ? 'gg-glow .9s ease-in-out infinite' : isRight ? 'gg-bloom .6s ease both' : `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${k * 110}ms both`,
                }}
              >
                {/* petals */}
                <div className="relative flex items-center justify-center" style={{ width: '100%', aspectRatio: '1 / 1' }}>
                  {Array.from({ length: 8 }).map((_, p) => (
                    <span
                      key={p}
                      className="absolute rounded-full"
                      style={{ left: '33%', top: '33%', width: '34%', height: '34%', background: color, border: '0.4cqh solid rgba(255,255,255,.7)', transform: `rotate(${p * 45}deg) translateY(-95%)` }}
                    />
                  ))}
                  <span
                    className="relative flex items-center justify-center rounded-full font-black text-amber-950"
                    style={{
                      width: '62%', height: '62%', fontSize: 'clamp(1.3rem, 6.4cqh, 3rem)', lineHeight: 1,
                      background: '#fff7d6', border: `0.6cqh solid ${isHint || isRight ? '#16a34a' : '#b45309'}`,
                    }}
                  >
                    {word}
                  </span>
                </div>
                <span className="block rounded-full" style={{ width: '1.2cqh', height: '5cqh', background: '#16a34a' }} />
              </button>
            );
          })
        )}
      </div>

      {bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} count={b.count} spread={b.spread} colors={['#fde047', '#f9a8d4', '#ffffff', '#86efac', '#c4b5fd', '#fdba74']} />)}
    </div>
  );
}
