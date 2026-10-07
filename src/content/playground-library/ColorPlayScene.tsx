import { useEffect, useMemo, useRef, useState } from 'react';
import { type ActivitySync, isSharedFollower, useSyncedState } from './sceneActivitySync';
import { seededOrder } from './PictureMatchScene';
import { Burst, GAME_FONT, GameStyles, HudBar, PaintStudioBackdrop, ProgressPill, PromptChip, TitleRibbon } from './gameTheme';
import { COLORS, ColorShape, PaintPot, isColorId, isShapeId, type ColorId, type ShapeId } from './colorShapes';
import { askLine, solvedLine, type ColorPlayMode, type ColorPlayRound } from './colorPlayText';
import { safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `color-play` ("Color Splash") — reusable colours game, shared by every scene library.
 *
 * One scene, four ways to play (`mode`):
 *  - pick:  hear a colour word, tap the paint pot of that colour (the word is shown in plain ink so it is read, not guessed).
 *  - paint: "Paint the balloon blue." — tap the blue pot and the outline fills with colour.
 *  - mix:   "What do yellow and blue make?" — two colours mix on the palette, tap the pot of the new colour.
 *  - hunt:  "Find the red apple." — tap the shape that is that colour.
 * Model first: before round 1 every colour of the stop is said aloud as its pot lights up. A right answer is celebrated and the
 * whole sentence is said again; a wrong one wobbles (no hearts, no penalty) and after two wrong the right one glows.
 *
 * Shapes are drawn in SVG (colorShapes.tsx), so a colour is always exactly the colour named. Pots carry the colour NAME as text
 * (except in `pick`, whose point is matching the word to the colour), which also helps colour-blind students.
 *
 * Classroom rules (see .claude/skills/classroom-sync-robustness): ONE synced state object, typed defaults, no Set/Map,
 * every index read from state is clamped; shared play: only the leader runs the automatic sequences.
 */
export interface ColorPlaySceneData {
  id: string;
  kind: 'color-play';
  teacher: string;
  mode: ColorPlayMode;
  rounds: ColorPlayRound[];
  /** Colours said aloud first (the "model first" step). */
  intro?: ColorId[];
  title?: string;
  bg?: string;
}

interface ColorState {
  round: number;
  /** Wrong choices tried this round (a colour id, or an item index as text in `hunt`). */
  wrong: string[];
  totalWrong: number;
  introIdx: number;
  introDone: boolean;
  solved: boolean;
  finished: boolean;
}

const INITIAL: ColorState = { round: 0, wrong: [], totalWrong: 0, introIdx: -1, introDone: false, solved: false, finished: false };
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const MODES: ColorPlayMode[] = ['pick', 'paint', 'mix', 'hunt'];

function validRound(mode: ColorPlayMode, r: ColorPlayRound | undefined): r is ColorPlayRound {
  if (!r) return false;
  if (mode === 'hunt') {
    return Array.isArray(r.items) && r.items.length >= 2 && r.items.every((i) => i && isColorId(i.color) && isShapeId(i.shape))
      && Number.isInteger(r.target) && (r.target as number) >= 0 && (r.target as number) < r.items.length;
  }
  const ok = Array.isArray(r.options) && r.options.length >= 2 && r.options.every(isColorId) && isColorId(r.answer) && r.options.includes(r.answer);
  if (!ok) return false;
  if (mode === 'paint') return isShapeId(r.shape);
  if (mode === 'mix') return Array.isArray(r.mix) && r.mix.length === 2 && r.mix.every(isColorId);
  return true;
}

export function ColorPlayScene({ scene, onNext, onWin, onResult, sync }: {
  scene: ColorPlaySceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  onLose?: () => void;
  onResult?: (r: { mistakes: number }) => void;
  sync?: ActivitySync;
}) {
  const mode: ColorPlayMode = MODES.includes(scene.mode) ? scene.mode : 'pick';
  const rounds = (Array.isArray(scene.rounds) ? scene.rounds : []).filter((r) => validRound(mode, r));
  const introColors = (Array.isArray(scene.intro) ? scene.intro : []).filter(isColorId);
  const [state, setState] = useSyncedState<ColorState>(sync, INITIAL);
  const isMirror = !!sync?.isSynced && !sync.isAuthority;
  /** Shared play: only the leader (teacher) runs the automatic sequences; the follower gets them relayed. */
  const isFollower = isSharedFollower(sync);

  // ---- everything below is read defensively: a mirror may hold any snapshot
  const finished = state.finished === true;
  const roundNo = Number.isFinite(state.round) ? Math.max(0, Math.min(Math.floor(state.round), Math.max(rounds.length - 1, 0))) : 0;
  const wrong = Array.isArray(state.wrong) ? state.wrong.filter((w) => typeof w === 'string') : [];
  const totalWrong = Number.isFinite(state.totalWrong) ? state.totalWrong : 0;
  const introIdx = Number.isFinite(state.introIdx) ? state.introIdx : -1;
  const solved = state.solved === true;
  const introDone = introColors.length === 0 || state.introDone === true;
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
    if (finished && !gemDone.current && !isMirror && !isFollower) {
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

  // ---- model first: say each colour of this stop aloud as its pot lights up
  useEffect(() => {
    if (isMirror || isFollower || finished || introColors.length === 0 || state.introDone === true) return;
    const mine = ++token.current;
    (async () => {
      await sleep(600);
      for (let i = 0; i < introColors.length; i++) {
        if (!alive.current || token.current !== mine) return;
        setState((s) => ({ ...s, introIdx: i }));
        await safeSpeak(introColors[i], 'teacher');
        await sleep(300);
      }
      if (alive.current && token.current === mine) setState((s) => ({ ...s, introIdx: -1, introDone: true }));
    })();
    const counter = token;
    return () => { counter.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  // ---- say the question when a round appears
  useEffect(() => {
    if (isMirror || isFollower || finished || !introDone || !round || solved) return;
    const mine = ++token.current;
    (async () => {
      await sleep(450);
      if (alive.current && token.current === mine) await safeSpeak(askLine(mode, round), 'teacher');
    })();
    const counter = token;
    return () => { counter.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNo, introDone, scene.id]);

  const choose = async (key: string, isRight: boolean) => {
    if (isMirror || finished || solved || !introDone || !round || wrong.includes(key)) return;
    if (isRight) {
      sfx.match();
      setState((s) => ({ ...s, solved: true }));
      burstAt('[data-cp-stage]', 20, 18);
      const mine = ++token.current;
      await safeSpeak(solvedLine(mode, round), 'teacher');
      await sleep(800);
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
        wrong: [...(Array.isArray(s.wrong) ? s.wrong : []), key],
        totalWrong: (Number.isFinite(s.totalWrong) ? s.totalWrong : 0) + 1,
      }));
    }
  };

  const optionCount = round ? (mode === 'hunt' ? round.items?.length ?? 2 : round.options?.length ?? 2) : 2;
  const order = useMemo(() => seededOrder(Math.max(optionCount, 1), `${scene.id}:${roundNo}`), [scene.id, roundNo, optionCount]);

  if (!round) return <div className="absolute inset-0" />;

  const hint = wrong.length >= 2 && !solved;
  const title = scene.title ?? 'Color Splash';
  const answer = round.answer;
  const target = round.target ?? 0;
  const prompt = finished ? 'What a colourful job! Well done!'
    : !introDone ? 'Listen to the colors…'
      : solved ? 'Yes!'
        : mode === 'pick' ? `Tap the ${answer} paint!`
          : mode === 'paint' ? 'Pick the paint, then watch!'
            : mode === 'mix' ? 'Which paint do they make?'
              : 'Tap the right one!';
  const ask = askLine(mode, round);
  const potW = 'min(20cqw, 28cqh)';

  /** The art show: every round solved so far becomes a small painting (derived from the round number, nothing extra to sync). */
  const doneCount = Math.min(rounds.length, roundNo + (solved || finished ? 1 : 0));
  const gallery = rounds.slice(0, doneCount).map((r, i) => {
    const hex = mode === 'hunt' ? COLORS[r.items![r.target ?? 0].color].hex : COLORS[r.answer!].hex;
    const shape = mode === 'hunt' ? r.items![r.target ?? 0].shape : mode === 'paint' ? r.shape : undefined;
    return { key: `${i}`, hex, shape };
  });
  const renderPainting = (g: { key: string; hex: string; shape?: ShapeId }, size: string) => (
    <span key={g.key} className="flex items-center justify-center rounded-[1.4cqh] bg-white/90 shadow" style={{ width: size, height: size, padding: '0.4cqh', animation: 'gt-pop-in .45s cubic-bezier(.2,.9,.3,1.4) both' }}>
      {g.shape
        ? <ColorShape shape={g.shape} fill={g.hex} className="h-full w-full" />
        : <span className="rounded-full" style={{ width: '80%', height: '80%', background: g.hex, border: '0.4cqh solid #fff' }} />}
    </span>
  );

  const renderPot = (id: ColorId, k: number, forceLabel = false) => {
    const isWrong = wrong.includes(id);
    const isRight = solved && id === answer;
    const isHint = hint && id === answer;
    const hot = !introDone && introColors[introIdx] === id;
    return (
      <button
        key={`${roundNo}-${id}-${k}`}
        type="button"
        data-cp-pot={id}
        aria-label={id}
        disabled={isMirror || finished || solved || !introDone || isWrong}
        onClick={() => void choose(id, id === answer)}
        className="flex flex-col items-center transition active:scale-95"
        style={{
          width: potW, opacity: isWrong ? 0.4 : 1, transform: hot ? 'scale(1.18)' : undefined,
          animation: isWrong ? 'cp-wobble .45s ease-in-out' : isHint ? 'cp-glow .9s ease-in-out infinite' : isRight ? 'cp-pop .5s ease both' : `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${k * 90}ms both`,
          filter: hot ? 'drop-shadow(0 0 2.4cqh rgba(253,224,71,1))' : undefined,
        }}
      >
        <PaintPot color={id} className="w-full" />
        {(mode !== 'pick' || forceLabel || hot) && (
          <span className="-mt-[1.2cqh] rounded-full bg-white/95 px-[1.2cqw] font-black shadow" style={{ fontSize: '3.6cqh', lineHeight: 1.3, color: id === 'yellow' ? '#8d6e00' : COLORS[id].hex }}>{COLORS[id].name}</span>
        )}
      </button>
    );
  };

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden select-none" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT }}>
      <GameStyles />
      <style>{`
        @keyframes cp-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
        @keyframes cp-glow { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(253,224,71,0)); } 50% { transform: scale(1.1); filter: drop-shadow(0 0 2.4cqh rgba(253,224,71,1)); } }
        @keyframes cp-pop { 0% { transform: scale(.8); } 60% { transform: scale(1.18); } 100% { transform: scale(1); } }
      `}</style>
      <PaintStudioBackdrop />

      <HudBar
        left={<TitleRibbon text={title} icon={<span style={{ fontSize: '4.4cqh', lineHeight: 1 }} aria-hidden="true">🎨</span>} />}
        centre={<PromptChip>{prompt}</PromptChip>}
        right={<ProgressPill done={Math.min(rounds.length, roundNo + (solved || finished ? 1 : 0))} total={rounds.length} color="#d946ef" label="painted" />}
      />

      {/* The art show strip: one small painting per solved round */}
      {!finished && gallery.length > 0 && (
        <div className="absolute inset-x-0 flex flex-wrap items-center justify-center" style={{ top: '11.5%', gap: '0.8cqw', padding: '0 4cqw' }} aria-label="Your paintings">
          {gallery.map((g) => renderPainting(g, 'min(5.4cqh, 5cqw)'))}
        </div>
      )}

      {/* The stage: what to look at */}
      <div data-cp-stage className="absolute inset-x-0 flex flex-col items-center justify-center" style={{ top: '13%', height: '40%', gap: '1.2cqh' }}>
        {!introDone && (
          <div className="rounded-[3cqh] bg-white/90 px-[4cqw] py-[1.4cqh] font-black text-fuchsia-900 shadow-lg" style={{ fontSize: '6cqh' }}>Listen and look!</div>
        )}

        {introDone && !finished && mode === 'pick' && (
          <button type="button" onClick={() => void safeSpeak(ask, 'teacher')} aria-label={`Hear ${ask}`} className="rounded-[4cqh] bg-white px-[5cqw] py-[2cqh] font-black text-slate-800 shadow-[0_1.4cqh_0_rgba(0,0,0,.25)] active:scale-95" style={{ fontSize: '14cqh', lineHeight: 1.1 }}>
            {answer}
          </button>
        )}

        {introDone && !finished && mode === 'paint' && (
          <>
            <ColorShape shape={round.shape!} fill={solved ? COLORS[answer!].hex : '#ffffff'} className="drop-shadow-lg" style={{ height: '28cqh', transition: 'filter .3s' }} />
            <button type="button" onClick={() => void safeSpeak(ask, 'teacher')} className="rounded-full bg-white/95 px-[3cqw] py-[0.4cqh] font-black text-slate-800 shadow" style={{ fontSize: '4.4cqh' }}>{ask}</button>
          </>
        )}

        {introDone && !finished && mode === 'mix' && (
          <>
            <div className="flex items-center justify-center" style={{ gap: '2.4cqw' }}>
              {[round.mix![0], round.mix![1]].map((c, i) => (
                <div key={`${c}-${i}`} className="flex items-center" style={{ gap: '2.4cqw' }}>
                  <span className="rounded-full shadow-lg" style={{ width: '17cqh', height: '17cqh', background: COLORS[c].hex, border: '0.8cqh solid #fff' }} />
                  <span className="font-black text-slate-700" style={{ fontSize: '9cqh', lineHeight: 1 }}>{i === 0 ? '+' : '='}</span>
                </div>
              ))}
              <span className="flex items-center justify-center rounded-full font-black shadow-lg" style={{ width: '17cqh', height: '17cqh', background: solved ? COLORS[answer!].hex : '#ffffff', border: '0.8cqh solid #fff', fontSize: '10cqh', color: '#a21caf', transition: 'background .5s' }}>{solved ? '' : '?'}</span>
            </div>
            <button type="button" onClick={() => void safeSpeak(ask, 'teacher')} className="rounded-full bg-white/95 px-[3cqw] py-[0.4cqh] font-black text-slate-800 shadow" style={{ fontSize: '4.4cqh' }}>{solved ? solvedLine(mode, round) : ask}</button>
          </>
        )}

        {introDone && !finished && mode === 'hunt' && (
          <button type="button" onClick={() => void safeSpeak(ask, 'teacher')} aria-label={`Hear ${ask}`} className="rounded-[4cqh] bg-white px-[4cqw] py-[1.6cqh] font-black text-slate-800 shadow-[0_1.4cqh_0_rgba(0,0,0,.25)] active:scale-95" style={{ fontSize: '8cqh', lineHeight: 1.15 }}>
            {ask}
          </button>
        )}

        {finished && (
          <>
            <div className="rounded-full bg-white/95 px-[4cqw] py-[0.6cqh] font-black text-fuchsia-800 shadow" style={{ fontSize: '5cqh' }}>Your art show!</div>
            <div className="flex flex-wrap items-center justify-center" style={{ gap: '1.2cqw', maxWidth: '86cqw' }}>
              {gallery.map((g) => renderPainting(g, 'min(11cqh, 9cqw)'))}
            </div>
          </>
        )}
        {finished && (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)', animation: 'gt-pop-in .5s cubic-bezier(.2,.9,.3,1.4) both' }}>
            Well done! Next ⭐
          </button>
        )}
      </div>

      {/* Bottom: the paint pots (or, in `hunt`, the shapes) */}
      <div className="absolute inset-x-0 flex items-end justify-center" style={{ top: '58%', height: '36%', gap: '2.4cqw' }}>
        {!finished && !introDone && introColors.map((c, k) => renderPot(c, k, true))}
        {!finished && introDone && mode !== 'hunt' && order.map((srcIdx, k) => {
          const id = round.options?.[srcIdx];
          return id ? renderPot(id, k) : null;
        })}
        {!finished && introDone && mode === 'hunt' && order.map((srcIdx, k) => {
          const it = round.items?.[srcIdx];
          if (!it) return null;
          const key = String(srcIdx);
          const isWrong = wrong.includes(key);
          const isRight = solved && srcIdx === target;
          const isHint = hint && srcIdx === target;
          return (
            <button
              key={`${roundNo}-${srcIdx}`}
              type="button"
              data-cp-item={srcIdx}
              aria-label={`${it.color} ${it.shape}`}
              disabled={isMirror || finished || solved || isWrong}
              onClick={() => void choose(key, srcIdx === target)}
              className="rounded-[3cqh] bg-white/90 p-[1cqh] shadow-[0_1cqh_0_rgba(0,0,0,.25)] transition active:scale-95"
              style={{
                width: 'min(19cqw, 30cqh)', opacity: isWrong ? 0.4 : 1,
                outline: isRight ? '0.8cqh solid #22c55e' : isHint ? '0.8cqh solid #facc15' : '0.5cqh solid rgba(255,255,255,.9)',
                animation: isWrong ? 'cp-wobble .45s ease-in-out' : isHint ? 'cp-glow .9s ease-in-out infinite' : isRight ? 'cp-pop .5s ease both' : `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${k * 90}ms both`,
              }}
            >
              <ColorShape shape={it.shape} fill={COLORS[it.color].hex} className="w-full" />
            </button>
          );
        })}
      </div>

      {bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} count={b.count} spread={b.spread} colors={['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#a855f7', '#f97316']} />)}
    </div>
  );
}
