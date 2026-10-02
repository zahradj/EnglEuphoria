import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type ActivitySync, useSyncedState } from './sceneActivitySync';
import { seededOrder } from './PictureMatchScene';
import { artFor } from './alphabetArt';
import { Burst, GAME_FONT, GameStyles, HouseIcon, HudBar, LocoIcon, ProgressPill, PromptChip, SkyBackdrop, TitleRibbon, TrainCar } from './gameTheme';
import { playLetterName, playLetterPhonic, safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * Two reusable alphabet / phonics games that share ONE tile-and-slot engine
 * (every tile has exactly one correct slot), for every scene library
 * (Pre-A1 Unit 1, Welcome Town, Magic Castle, Jungle Adventure):
 *
 *  - `letter-match` — "Letter Homes": each capital letter lives in a house; the
 *    student drags its small letter home. Each match plays the letter NAME.
 *  - `letter-blocks` — "Alphabet Train" / "Sound Train": train cars the student
 *    couples in order.
 *      mode 'letters' — alphabet order (up to all 26). Tapping a car says its name.
 *      mode 'sounds'  — letter SOUNDS in order (a-z), or, when a round has a
 *                       `word`, the sounds of that word in the order you hear them
 *                       (/m/ /a/ /p/, blended at the end).
 *    MODEL FIRST: when every block has an illustration (see alphabetArt.ts) and
 *    no round is word-based, the game opens with the "Alphabet Station": an
 *    illustrated tour (letter + picture + word, spoken) BEFORE the ordering.
 *    Set `model: false` to skip it.
 *
 * Audio rule (project CLAUDE.md + phonics memory): letter names and isolated
 * sounds come ONLY from the recorded clips (`playLetterName` / `playLetterPhonic`,
 * file-only, no TTS fallback). Whole words use the normal recorded voice.
 * Student comfort: a wrong drop never costs a heart and never ends the round;
 * after two misses the right slot pulses so nobody gets stuck.
 */

export interface LetterMatchSceneData {
  id: string;
  kind: 'letter-match';
  teacher: string;
  /** 2-6 capital letters, e.g. ['A', 'B', 'M', 'S']. */
  letters: string[];
  prompt?: string;
  bg?: string;
}

export interface LetterBlocksRound {
  /** The blocks in the CORRECT order. 'letters' mode: ['A','B','C','D'].
   *  'sounds' mode: grapheme per sound, e.g. ['m','a','p'] or ['sh','i','p']. */
  blocks: string[];
  /** 'sounds' mode: the word the sounds make (heard first, blended last). */
  word?: string;
  img?: string;
  emoji?: string;
}

export interface LetterBlocksSceneData {
  id: string;
  kind: 'letter-blocks';
  teacher: string;
  mode: 'letters' | 'sounds';
  /** 1+ rounds; 2-26 blocks each (a whole alphabet is fine). */
  rounds: LetterBlocksRound[];
  /** Open with the illustrated Alphabet Station. Default true (only happens
   *  when every block has an illustration and no round is word-based). */
  model?: boolean;
  prompt?: string;
  bg?: string;
}

type Variant = 'match' | 'letters' | 'sounds';

interface TilesState {
  phase: 'model' | 'play';
  /** Model stage: which letter is on show, and which have been visited. */
  modelIdx: number;
  seen: number[];
  round: number;
  /** Per slot: index of the tile placed there, or null. */
  slotTile: (number | null)[];
  /** Tile (index into the shuffled order) picked up / tapped. */
  holding: number | null;
  wrongSlot: number | null;
  misses: number;
  /** A finished round is being celebrated — ignore input. */
  busy: boolean;
  finished: boolean;
  /** Wrong drops over the whole game (for the star rating). */
  totalMisses: number;
}

const INITIAL: TilesState = { phase: 'play', modelIdx: 0, seen: [], round: 0, slotTile: [], holding: null, wrongSlot: null, misses: 0, busy: false, finished: false, totalMisses: 0 };

const COLORS = ['#FE6A2F', '#22C55E', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6'];
const colorFor = (value: string) => COLORS[(value.toUpperCase().charCodeAt(0) || 0) % COLORS.length];
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function LetterTilesScene({ scene, variant, onNext, onWin, onResult, sync }: {
  scene: LetterMatchSceneData | LetterBlocksSceneData;
  variant: Variant;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  /** Standalone games: called once at the end with the number of wrong drops. */
  onResult?: (r: { mistakes: number }) => void;
  sync?: ActivitySync;
}) {
  const rounds = useMemo<{ targets: string[]; word?: string; img?: string; emoji?: string }[]>(() => {
    if (scene.kind === 'letter-match') return [{ targets: scene.letters.slice(0, 6) }];
    return scene.rounds.map((r) => ({ targets: r.blocks.slice(0, 26), word: r.word, img: r.img, emoji: r.emoji }));
  }, [scene]);

  // Letters shown on the illustrated model stage (empty = no model stage).
  const modelLetters = useMemo<string[]>(() => {
    if (scene.kind !== 'letter-blocks' || scene.model === false) return [];
    if (scene.rounds.some((r) => r.word)) return [];
    const list: string[] = [];
    for (const r of scene.rounds) for (const b of r.blocks) if (!list.includes(b)) list.push(b);
    return list.length >= 2 && list.every((l) => artFor(l)) ? list : [];
  }, [scene]);
  const hasModel = modelLetters.length > 0;
  const initial = useMemo<TilesState>(() => ({ ...INITIAL, phase: hasModel ? 'model' : 'play' }), [hasModel]);

  const [state, setState] = useSyncedState<TilesState>(sync, initial);
  const { phase, modelIdx, seen, round, holding, wrongSlot, misses, busy, finished } = state;
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  const current = rounds[Math.min(round, rounds.length - 1)];
  const targets = current.targets;
  const n = targets.length;
  const slotTile = state.slotTile.length === n ? state.slotTile : (Array(n).fill(null) as (number | null)[]);

  // Same shuffle on every screen (seeded), never the already-solved order.
  const order = useMemo(() => {
    for (let attempt = 0; attempt < 6; attempt++) {
      const o = seededOrder(n, `${scene.id}:${round}:${attempt}`);
      if (n < 2 || o.some((idx, i) => targets[idx] !== targets[i])) return o;
    }
    return seededOrder(n, `${scene.id}:${round}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, round, n, targets.join('|')]);

  const alive = useRef(true);
  const gemDone = useRef(false);
  const wrongTimer = useRef<number | null>(null);
  const introSeq = useRef(0);
  const [drag, setDrag] = useState<{ tile: number; x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; count: number; spread: number }[]>([]);
  const burstId = useRef(0);
  const prevSlots = useRef<(number | null)[]>([]);
  const [speaking, setSpeaking] = useState(false);

  const fireBurst = (x: number, y: number, count = 16, spread = 20) => {
    const id = ++burstId.current;
    setBursts((b) => [...b.slice(-3), { id, x, y, count, spread }]);
    window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
  };

  // A burst of sparkles wherever a car/letter has just landed (runs on both screens).
  useEffect(() => {
    const prev = prevSlots.current;
    if (phase === 'play' && prev.length === slotTile.length) {
      slotTile.forEach((t, i) => {
        if (t == null || prev[i] != null) return;
        const root = rootRef.current;
        const el = root?.querySelector(`[data-tile-slot="${i}"]`) as HTMLElement | null;
        if (!root || !el) return;
        const rr = root.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        const big = n <= 12;
        fireBurst(((er.left + er.width / 2 - rr.left) / rr.width) * 100, ((er.top + er.height / 2 - rr.top) / rr.height) * 100, big ? 16 : 9, big ? 18 : 9);
      });
    }
    prevSlots.current = slotTile;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.slotTile, phase]);

  useEffect(() => {
    if (finished) fireBurst(50, 42, 46, 46);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; if (wrongTimer.current) window.clearTimeout(wrongTimer.current); };
  }, []);

  useEffect(() => {
    setState(initial);
    gemDone.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  useEffect(() => {
    if (finished && !gemDone.current && !isMirror) {
      gemDone.current = true;
      sfx.whoop();
      sfx.gem();
      onResult?.({ mistakes: state.totalMisses });
      onWin(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // 'sounds' mode with a word: say the word when each round appears.
  useEffect(() => {
    if (variant !== 'sounds' || isMirror || !current.word || phase !== 'play') return;
    const t = window.setTimeout(() => { void safeSpeak(current.word!, 'teacher'); }, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id, phase]);

  const hearValue = (value: string) => (
    variant === 'sounds' ? playLetterPhonic(value.toLowerCase()) : playLetterName(value.toLowerCase())
  );

  /** Model stage: the letter's name (or sound), then its picture-word. */
  const playIntro = async (letter: string) => {
    const mine = ++introSeq.current;
    setSpeaking(true);
    await hearValue(letter);
    if (!alive.current || introSeq.current !== mine) return;
    await sleep(150);
    const art = artFor(letter);
    if (alive.current && introSeq.current === mine && art) await safeSpeak(art.word, 'teacher');
    if (alive.current && introSeq.current === mine) setSpeaking(false);
  };

  // Model stage: arriving at a letter plays it and ticks it off.
  useEffect(() => {
    if (phase !== 'model' || isMirror || !hasModel) return;
    const letter = modelLetters[modelIdx];
    if (!letter) return;
    setState((s) => (s.seen.includes(modelIdx) ? s : { ...s, seen: [...s.seen, modelIdx] }));
    const t = window.setTimeout(() => { void playIntro(letter); }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, modelIdx]);

  const gotoLetter = (i: number) => {
    if (isMirror || i < 0 || i >= modelLetters.length) return;
    sfx.pop();
    setState((s) => ({ ...s, modelIdx: i }));
  };
  const startPlaying = () => {
    if (isMirror) return;
    sfx.whoop();
    setState((s) => ({ ...s, phase: 'play' }));
  };

  const valueOfTile = (tile: number) => targets[order[tile]];

  const celebrate = async (lastValue: string) => {
    await hearValue(lastValue);
    if (!alive.current) return;
    await sleep(350);
    // A whole alphabet (26 names) would take a minute to read out — only
    // short rows are read out / blended at the end.
    if (n <= 8) {
      if (variant === 'letters') {
        for (const t of targets) { if (!alive.current) return; await hearValue(t); }
      } else if (variant === 'sounds') {
        for (const t of targets) { if (!alive.current) return; await hearValue(t); }
        await sleep(250);
        if (current.word) await safeSpeak(current.word, 'teacher');
      }
    }
    if (!alive.current) return;
    await sleep(700);
    if (!alive.current) return;
    if (round + 1 < rounds.length) setState((s) => ({ ...initial, phase: 'play', round: round + 1, totalMisses: s.totalMisses }));
    else setState((s) => ({ ...s, busy: false, holding: null, finished: true }));
  };

  const attempt = (tile: number, slot: number) => {
    if (isMirror || busy || finished || slotTile[slot] != null) return;
    const value = valueOfTile(tile);
    if (value === targets[slot]) {
      sfx.match();
      const next = slotTile.slice();
      next[slot] = tile;
      const complete = next.every((t) => t != null);
      setState((s) => ({ ...s, slotTile: next, holding: null, wrongSlot: null, busy: complete }));
      if (complete) void celebrate(value);
      else void hearValue(value);
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, holding: null, wrongSlot: slot, misses: s.misses + 1, totalMisses: s.totalMisses + 1 }));
      if (wrongTimer.current) window.clearTimeout(wrongTimer.current);
      wrongTimer.current = window.setTimeout(() => setState((s) => ({ ...s, wrongSlot: null })), 650);
    }
  };

  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;

  const onTilePointerDown = (tile: number) => (e: React.PointerEvent) => {
    if (isMirror || busy || finished || slotTile.includes(tile)) return;
    e.preventDefault();
    sfx.pop();
    setState((s) => ({ ...s, holding: tile }));
    void hearValue(valueOfTile(tile));
    const startX = e.clientX;
    const startY = e.clientY;
    setDrag({ tile, x: startX, y: startY });
    const move = (ev: PointerEvent) => setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setDrag(null);
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) <= 12) return; // a tap: stays selected
      const slotEl = document
        .elementsFromPoint(ev.clientX, ev.clientY)
        .find((el) => (el as HTMLElement).dataset?.tileSlot != null) as HTMLElement | undefined;
      if (slotEl) attemptRef.current(tile, Number(slotEl.dataset.tileSlot));
      else setState((st) => ({ ...st, holding: null }));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const onSlotTap = (slot: number) => {
    if (slotTile[slot] != null) { void hearValue(targets[slot]); return; }
    if (holding != null) attempt(holding, slot);
  };

  // After two misses, pulse the slot the held tile really belongs in.
  const hintSlot = (() => {
    if (holding == null || misses < 2) return -1;
    const v = valueOfTile(holding);
    return targets.findIndex((t, i) => t === v && slotTile[i] == null);
  })();

  const placedCount = slotTile.filter((t) => t != null).length;

  // Sizes in container units so everything fits any frame (student comfort).
  // Up to 7 blocks: one row. 8-12: two rows. More (a whole alphabet): three
  // rows, with the track filling the top half and the tray the bottom half.
  const hasPicture = variant === 'sounds' && !!(current.word || current.img || current.emoji);
  const rows = variant === 'match' || n <= 7 ? 1 : n <= 12 ? 2 : 3;
  const perRow = Math.ceil(n / rows);
  const cap = rows === 3 ? 10.5 : rows === 2 ? 15 : variant === 'match' ? 18 : hasPicture ? 17 : 20;
  const gapCqw = rows === 1 ? 2 : 1.4;
  const unit = `min(${Math.min(18, 88 / perRow - gapCqw - 0.5)}cqw, ${cap}cqh)`;
  const glyph = `calc(${unit} * ${variant === 'match' ? 0.58 : 0.5})`;

  const title = variant === 'match' ? 'Letter Homes' : variant === 'sounds' ? 'Sound Train' : 'Alphabet Train';
  const prompt = scene.prompt
    ?? (variant === 'match' ? 'Take each small letter home to its big letter'
      : variant === 'letters' ? (n >= 26 ? 'Couple the cars in ABC order, A to Z' : 'Put the cars in ABC order')
        : current.word ? 'Put the sounds in order — what do you hear first?'
          : 'Couple the cars in ABC order — tap one to hear its sound');

  const tileLabel = (value: string) => (variant === 'match' ? value.toLowerCase() : value);
  const slotsTop = hasPicture ? '40%' : rows > 1 ? '13.5%' : '15%';
  const slotsBottom = hasPicture ? '36%' : rows > 1 ? '46%' : '36%';
  const trayHeight = rows > 1 ? '42%' : '28%';
  const trayBottom = rows > 1 ? '3%' : '4%';
  const gapStyle = `${gapCqw}cqw`;
  const gridMax = rows > 1 ? `calc((${unit} + ${gapStyle}) * ${perRow})` : undefined;

  const icon = variant === 'match' ? <HouseIcon /> : <LocoIcon />;

  /* ---------------------------------------------------------------- model */
  const renderModel = () => {
    const letter = modelLetters[modelIdx];
    const art = artFor(letter)!;
    const chipUnit = 'min(5.3cqw, 9.4cqh)';
    const allSeen = seen.length >= modelLetters.length;
    const shownLetter = variant === 'sounds' ? letter.toLowerCase() : letter.toUpperCase();
    const word = art.word;
    const first = word.charAt(0);
    return (
      <>
        <HudBar
          left={<TitleRibbon text={variant === 'sounds' ? 'Sound Station' : 'Alphabet Station'} icon={icon} />}
          centre={<PromptChip>{scene.prompt ?? 'Tap a letter — look and listen!'}</PromptChip>}
          right={<ProgressPill done={seen.length} total={modelLetters.length} label="seen" />}
        />

        {/* Letter + picture: flip in on every change, picture floats */}
        <div className="absolute inset-x-0 flex items-center justify-center" style={{ top: '12%', height: '41%', gap: '3cqw' }}>
          <div key={`l-${letter}`} className="aspect-square h-full" style={{ animation: 'gt-flip-in .5s cubic-bezier(.2,.9,.3,1.2) both' }}>
            <button
              type="button"
              onClick={() => !isMirror && void playIntro(letter)}
              aria-label={`Hear the letter ${shownLetter}`}
              className="relative flex h-full w-full items-center justify-center rounded-[10%] font-black text-white active:scale-95"
              style={{ backgroundColor: colorFor(letter), fontSize: '26cqh', lineHeight: 1, boxShadow: 'inset 0 -1.2cqh 0 rgba(0,0,0,.18), 0 1.4cqh 3cqh rgba(15,23,42,.3)', border: '0.6cqh solid rgba(0,0,0,.22)', fontFamily: GAME_FONT }}
            >
              <span style={{ textShadow: '0 0.6cqh 0 rgba(0,0,0,.22)' }}>
                {variant === 'sounds' ? shownLetter : <>{shownLetter}<span style={{ fontSize: '0.55em' }}>{letter.toLowerCase()}</span></>}
              </span>
              <span
                className="absolute bottom-[4%] right-[4%] flex items-center justify-center rounded-full bg-white/90 text-orange-600 shadow-lg"
                style={{ width: '8cqh', height: '8cqh', animation: speaking ? 'gt-speak .55s ease-in-out infinite' : undefined }}
              >
                <svg viewBox="0 0 24 24" style={{ width: '60%', height: '60%' }} aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
              </span>
            </button>
          </div>
          <div key={`p-${letter}`} className="aspect-square h-full" style={{ animation: 'gt-flip-in .5s cubic-bezier(.2,.9,.3,1.2) .1s both' }}>
            <div className="gt-idle h-full w-full" style={{ animation: 'gt-float 3.6s ease-in-out .6s infinite' }}>
              <button
                type="button"
                onClick={() => !isMirror && void playIntro(letter)}
                aria-label={`Picture: ${word}`}
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10%] bg-white p-[5%] shadow-2xl ring-[0.8cqh] ring-white active:scale-95"
              >
                <img src={art.img} alt="" className="h-full w-full object-contain" style={{ animation: 'lt-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) .25s both' }} draggable={false} />
              </button>
            </div>
          </div>
        </div>

        {/* "A is for apple" */}
        <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center font-black text-slate-800" style={{ top: '54%', height: '8%', fontSize: '6cqh', fontFamily: GAME_FONT, textShadow: '0 0.3cqh 0 rgba(255,255,255,.9)' }}>
          <span key={letter} className="inline-flex items-center" style={{ animation: 'gt-rise-in .45s ease-out .2s both' }}>
            {variant === 'sounds' ? `/${letter.toLowerCase()}/` : shownLetter} <span className="mx-[1.2cqw] text-slate-500" style={{ fontSize: '0.7em' }}>{variant === 'sounds' ? 'as in' : 'is for'}</span>
            <span className="inline-block" style={{ color: colorFor(letter), animation: 'gt-pop-in .5s cubic-bezier(.2,.9,.3,1.5) .5s both' }}>{first}</span><span>{word.slice(1)}</span>
          </span>
        </div>

        {/* Arrows */}
        {[{ dir: -1, side: 'left' }, { dir: 1, side: 'right' }].map(({ dir, side }) => {
          const target = modelIdx + dir;
          const off = isMirror || target < 0 || target >= modelLetters.length;
          return (
            <button
              key={side}
              type="button"
              onClick={() => gotoLetter(target)}
              disabled={off}
              aria-label={dir < 0 ? 'Previous letter' : 'Next letter'}
              className={`absolute flex items-center justify-center rounded-full bg-white/95 text-orange-600 shadow-xl active:scale-90 disabled:opacity-30 ${dir > 0 && !off ? 'gt-idle' : ''}`}
              style={{ [side]: '2%', top: '25%', width: '13cqh', height: '13cqh', animation: dir > 0 && !off ? 'gt-nudge 1.5s ease-in-out infinite' : undefined } as React.CSSProperties}
            >
              <svg viewBox="0 0 24 24" style={{ width: '60%', height: '60%' }} aria-hidden="true"><path d={dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          );
        })}

        {/* Let's play */}
        <div className="absolute inset-x-0 flex justify-center" style={{ top: '63.5%' }}>
          <button
            type="button"
            onClick={startPlaying}
            disabled={isMirror}
            className="relative flex items-center gap-[1.4cqw] overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-pink-500 font-black text-white shadow-2xl active:scale-95 disabled:opacity-70"
            style={{ padding: '0.9cqh 3cqw', fontSize: '4cqh', fontFamily: GAME_FONT, animation: allSeen ? 'gt-glow-pulse 1.4s ease-out infinite' : undefined }}
          >
            <span className="gt-idle pointer-events-none absolute inset-y-0 w-1/4 bg-white/40" style={{ animation: 'gt-shine 2.8s ease-in-out infinite' }} />
            {allSeen ? "Now let's play!" : "Let's play!"} <LocoIcon height="5cqh" />
          </button>
        </div>

        {/* A-Z chip strip */}
        <div className="absolute inset-x-[3%] flex items-center justify-center" style={{ bottom: '2%', height: '21%' }}>
          <div className="flex flex-wrap items-center justify-center" style={{ gap: '0.9cqw', maxWidth: `calc((${chipUnit} + 0.9cqw) * ${Math.ceil(modelLetters.length / (modelLetters.length > 13 ? 2 : 1))})` }}>
            {modelLetters.map((l, i) => {
              const isCur = i === modelIdx;
              const wasSeen = seen.includes(i);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => gotoLetter(i)}
                  disabled={isMirror}
                  aria-label={`Letter ${l}`}
                  className={`flex items-center justify-center rounded-[28%] font-black transition ${isCur ? 'scale-110 ring-[0.7cqh] ring-orange-400' : ''}`}
                  style={{
                    width: chipUnit, height: chipUnit, fontSize: `calc(${chipUnit} * 0.55)`, lineHeight: 1, fontFamily: GAME_FONT,
                    backgroundColor: wasSeen || isCur ? colorFor(l) : 'rgba(255,255,255,.92)',
                    color: wasSeen || isCur ? '#fff' : '#64748b',
                    boxShadow: '0 0.5cqh 1.2cqh rgba(15,23,42,.2)',
                  }}
                >
                  {variant === 'sounds' ? l.toLowerCase() : l.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  /* ----------------------------------------------------------------- play */
  const renderSlot = (value: string, slot: number) => {
    const placed = slotTile[slot] != null;
    const isWrong = wrongSlot === slot;
    const isHint = hintSlot === slot;
    const isTarget = holding != null && !placed;
    const base = `flex items-center justify-center rounded-2xl font-black transition`;
    const hot = isWrong ? 'border-[0.5cqh] border-dashed border-red-400 bg-red-50'
      : isHint ? 'animate-pulse border-[0.5cqh] border-dashed border-orange-500 bg-orange-100'
        : isTarget ? 'animate-pulse border-[0.5cqh] border-dashed border-orange-400 bg-orange-50'
          : 'border-[0.5cqh] border-dashed border-[#b8895a] bg-[#f6e8c8]';

    if (variant === 'match') {
      const roof = colorFor(value);
      return (
        <div key={slot} className="flex flex-col items-center" style={{ gap: 0, animation: finished ? `gt-wave .8s ease-in-out ${slot * 90}ms 3` : `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${slot * 80}ms both` }}>
          <div className="relative" style={{ width: `calc(${unit} * 1.3)`, height: `calc(${unit} * 0.5)` }}>
            <div style={{ width: '100%', height: '100%', background: roof, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', filter: 'brightness(.92)' }} />
            {[0, 1].map((k) => (
              <span key={k} className="gt-idle absolute rounded-full bg-white/85" style={{ left: '66%', top: '8%', width: '1.4cqh', height: '1.4cqh', opacity: 0, animation: `gt-puff 2.6s ease-out ${k * 1.3 + slot * 0.35}s infinite` }} />
            ))}
          </div>
          <div className="flex items-center justify-center bg-[#fff3d6] font-black" style={{ width: unit, height: unit, fontSize: glyph, lineHeight: 1, color: roof, border: '0.5cqh solid #8a5a2b', borderBottom: 0, borderRadius: '1.2cqh 1.2cqh 0 0', fontFamily: GAME_FONT }}>{value}</div>
          <button
            type="button"
            data-tile-slot={slot}
            onClick={() => onSlotTap(slot)}
            aria-label={placed ? value.toLowerCase() : `Door for ${value}`}
            className={`${base} ${placed ? 'text-white' : hot}`}
            style={{
              width: unit, height: `calc(${unit} * 0.95)`, fontSize: glyph, lineHeight: 1, fontFamily: GAME_FONT,
              borderRadius: '0 0 1.2cqh 1.2cqh',
              ...(placed ? { backgroundColor: roof, animation: 'lt-drop 0.35s cubic-bezier(0.34,1.56,0.64,1)', border: '0.5cqh solid #8a5a2b', borderTop: 0 } : { borderTopWidth: 0 }),
              ...(isWrong ? { animation: 'lt-shake 0.4s ease-in-out' } : null),
            }}
          >
            {placed
              ? <span className="inline-block" style={{ animation: 'gt-pop-in .5s cubic-bezier(.2,.9,.3,1.5)' }}>{value.toLowerCase()}</span>
              : <span className="rounded-t-full bg-[#8a5a2b]/80" style={{ width: '46%', height: '78%', alignSelf: 'flex-end' }} />}
          </button>
        </div>
      );
    }

    // Train track: a sleeper with a rail; a coupled car sits on it.
    if (placed) {
      return (
        <button
          key={slot}
          type="button"
          data-tile-slot={slot}
          onClick={() => onSlotTap(slot)}
          aria-label={value}
          className="relative"
          style={{
            width: unit, height: unit, animation: finished ? `lt-hop 0.7s ease-in-out ${(slot % 13) * 70}ms 2` : 'lt-drop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <TrainCar unit={unit} color={colorFor(value)} glyph={glyph} sound={variant === 'sounds'} rolling={finished}>{value}</TrainCar>
        </button>
      );
    }
    return (
      <button
        key={slot}
        type="button"
        data-tile-slot={slot}
        onClick={() => onSlotTap(slot)}
        aria-label={`Empty slot ${slot + 1}`}
        className={`${base} ${hot}`}
        style={{
          width: unit, height: `calc(${unit} * 0.9)`, fontSize: glyph, lineHeight: 1, fontFamily: GAME_FONT,
          boxShadow: '0 0.7cqh 0 -0.2cqh #9ca3af',
          ...(isWrong ? { animation: 'lt-shake 0.4s ease-in-out' } : null),
        }}
      >
        <span className="text-[#a47b4b]" style={{ fontSize: `calc(${unit} * 0.3)` }}>{slot + 1}</span>
      </button>
    );
  };

  const renderPlay = () => (
    <>
      <HudBar
        left={<TitleRibbon text={title} icon={icon} />}
        centre={<PromptChip>{finished ? 'Well done! All aboard!' : prompt}</PromptChip>}
        right={<ProgressPill done={finished ? n : placedCount} total={n} color={variant === 'match' ? '#f59e0b' : '#22c55e'} />}
      />

      {/* Sounds mode with a word: the word's picture + replay */}
      {hasPicture && (
        <div className="absolute inset-x-0 top-[12%] flex h-[26%] items-center justify-center">
          <button
            type="button"
            onClick={() => current.word && void safeSpeak(current.word, 'teacher')}
            aria-label="Hear the word"
            className="relative flex aspect-square h-full items-center justify-center overflow-hidden rounded-3xl bg-white shadow-xl ring-4 ring-white active:scale-95"
          >
            {current.img
              ? <img src={current.img} alt="" className="h-full w-full object-contain" draggable={false} />
              : <span style={{ fontSize: '15cqh', lineHeight: 1 }}>{current.emoji ?? ''}</span>}
            <span className="absolute bottom-1 right-1 flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg" style={{ width: '7cqh', height: '7cqh' }}>
              <svg viewBox="0 0 24 24" style={{ width: '60%', height: '60%' }} aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
            </span>
          </button>
        </div>
      )}

      {/* Track / houses */}
      <div className="absolute inset-x-[3%] flex items-center justify-center" style={{ top: slotsTop, bottom: slotsBottom }}>
        <div
          className="flex flex-wrap items-end justify-center"
          style={{ gap: gapStyle, maxWidth: gridMax, animation: finished && variant !== 'match' ? 'gt-depart 1.9s cubic-bezier(.5,0,.85,.4) 1.7s forwards' : undefined }}
        >
          {targets.map((value, slot) => renderSlot(value, slot))}
        </div>
      </div>

      {/* Tray (cars / little letters), or Next when done */}
      <div className="absolute inset-x-[3%] flex items-center justify-center" style={{ bottom: trayBottom, height: trayHeight }}>
        {finished ? (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)', fontFamily: GAME_FONT }}>
            Well done! Next ⭐
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-center" style={{ gap: gapStyle, maxWidth: gridMax }}>
            {order.map((targetIdx, tile) => {
              const value = targets[targetIdx];
              const used = slotTile.includes(tile);
              const isHeld = holding === tile;
              const isDragging = drag?.tile === tile;
              const cls = `${used ? 'invisible' : ''} ${isDragging ? 'opacity-30' : ''} ${isMirror ? 'cursor-default opacity-80' : 'cursor-grab active:cursor-grabbing'} transition`;
              const sty = { touchAction: 'none', width: unit, height: unit, transform: isHeld ? 'scale(1.12)' : undefined, filter: isHeld ? 'drop-shadow(0 0 1.2cqh #fdba74)' : undefined } as React.CSSProperties;
              return (
                <button key={`${round}-${tile}`} type="button" onPointerDown={onTilePointerDown(tile)} disabled={isMirror || used || busy} aria-label={tileLabel(value)} className={cls} style={sty}>
                  {variant === 'match' ? (
                    <span className="flex h-full w-full items-center justify-center rounded-2xl bg-white font-black shadow-[0_0.8cqh_2cqh_rgba(15,23,42,.25)]" style={{ fontSize: glyph, lineHeight: 1, color: colorFor(value), fontFamily: GAME_FONT, border: '0.5cqh solid ' + colorFor(value), animation: `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${tile * 70}ms both` }}>{tileLabel(value)}</span>
                  ) : (
                    <span className="block" style={{ animation: `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${Math.min(tile * 35, 700)}ms both` }}>
                      <span className="gt-idle block" style={{ animation: isHeld ? undefined : `gt-sway ${2.4 + (tile % 5) * 0.3}s ease-in-out ${(tile % 7) * 0.17}s infinite` }}>
                        <TrainCar unit={unit} color={colorFor(value)} glyph={glyph} sound={variant === 'sounds'}>{tileLabel(value)}</TrainCar>
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Round dots (blocks with several rounds) */}
      {rounds.length > 1 && (
        <div className="pointer-events-none absolute bottom-[1%] inset-x-0 flex justify-center gap-[1.2cqw]">
          {rounds.map((_, i) => (
            <span key={i} className={`h-[1.6cqh] w-[1.6cqh] rounded-full ${i < round || finished ? 'bg-emerald-500' : i === round ? 'bg-orange-500' : 'bg-white/80'}`} />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden select-none" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT }}>
      <GameStyles />
      <style>{`
        @keyframes lt-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes lt-drop { 0% { transform: translateY(-30px) scale(1.1); opacity: 0; } 60% { transform: translateY(3px) scale(0.98); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes lt-hop { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.4cqh); } }
        @keyframes lt-pop { 0% { transform: scale(.6) rotate(-6deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
      `}</style>
      <SkyBackdrop bg={scene.bg} />
      {phase === 'model' && hasModel ? renderModel() : renderPlay()}
      {bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} count={b.count} spread={b.spread} />)}

      {/* Drag ghost (portalled: the classroom scales the scene with a transform). */}
      {drag && createPortal(
        <div
          className="pointer-events-none fixed z-[100] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl text-5xl font-black text-white shadow-2xl ring-4 ring-orange-200"
          style={{ left: drag.x, top: drag.y, fontFamily: GAME_FONT, backgroundColor: colorFor(valueOfTile(drag.tile)) }}
        >
          {tileLabel(valueOfTile(drag.tile))}
        </div>,
        document.body,
      )}
    </div>
  );
}

type SceneProps<T> = { scene: T; onNext: () => void; onWin: (gem: boolean) => void; onLose?: () => void; onResult?: (r: { mistakes: number }) => void; sync?: ActivitySync };

export function LetterMatchScene({ scene, onNext, onWin, onResult, sync }: SceneProps<LetterMatchSceneData>) {
  return <LetterTilesScene scene={scene} variant="match" onNext={onNext} onWin={onWin} onResult={onResult} sync={sync} />;
}

export function LetterBlocksScene({ scene, onNext, onWin, onResult, sync }: SceneProps<LetterBlocksSceneData>) {
  return <LetterTilesScene scene={scene} variant={scene.mode === 'sounds' ? 'sounds' : 'letters'} onNext={onNext} onWin={onWin} onResult={onResult} sync={sync} />;
}
