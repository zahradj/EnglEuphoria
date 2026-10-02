import { useEffect, useRef, useState } from 'react';
import { type ActivitySync, useSyncedState } from './sceneActivitySync';
import { Burst, GAME_FONT, GameStyles, HudBar, MarketBackdrop, ProgressPill, PromptChip, TitleRibbon } from './gameTheme';
import { safeSpeak } from './unit1/audio';
import * as sfx from './unit1/sfx';

/**
 * `sort-basket` ("Market Sort") — reusable vocabulary + categorising game, shared by
 * every scene library (Pre-A1 Unit 1, Welcome Town, Magic Castle, Jungle).
 *
 * A market stall with 2-3 baskets (e.g. Toys / Food / Animals). First the baskets are
 * introduced aloud (model first). Then one picture at a time arrives on the counter and is
 * named aloud; the student taps the basket it belongs in. A right pick drops it in the
 * basket (the basket keeps count); a wrong one wobbles away — no hearts, no penalty — and
 * after two wrong picks the right basket glows.
 *
 * Classic ESL "sorting / categories" task (Cambridge Starters vocabulary sets, teach-this.com
 * sorting games). Taps, not drags, so it works with the smart pen, touch and the teacher's mouse.
 *
 * Classroom rules (see .claude/skills/classroom-sync-robustness): ONE synced state object,
 * every field has a typed default, no Set/Map, every index read from state is clamped.
 */
export interface SortBasket {
  /** Spoken + shown on the basket, e.g. "toys". */
  label: string;
  img?: string;
  emoji?: string;
}

export interface SortItem {
  /** Spoken + shown under the picture, e.g. "teddy". */
  word: string;
  img?: string;
  emoji?: string;
  /** Index (into `baskets`) of the basket this belongs in. */
  basket: number;
}

export interface SortBasketSceneData {
  id: string;
  kind: 'sort-basket';
  teacher: string;
  /** 2-3 baskets. */
  baskets: SortBasket[];
  /** The pictures to sort, in the order they arrive. */
  items: SortItem[];
  /** Say the basket names aloud first (the "model first" step). Default true. */
  intro?: boolean;
  /** Banner name; defaults to "Market Sort". */
  title?: string;
  /** Optional background art. The scene draws its own market, but the lesson players read `bg` on every scene. */
  bg?: string;
}

interface SortState {
  /** Index of the picture on the counter. */
  idx: number;
  /** Wrong baskets tried for this picture. */
  wrong: number[];
  /** Wrong picks over the whole game (for the star rating). */
  totalWrong: number;
  /** Basket being introduced aloud (-1 = none). */
  introIdx: number;
  introDone: boolean;
  /** The picture is flying into its basket. */
  flying: boolean;
  finished: boolean;
}

const INITIAL: SortState = { idx: 0, wrong: [], totalWrong: 0, introIdx: -1, introDone: false, flying: false, finished: false };
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const BASKET_COLORS = ['#c2410c', '#15803d', '#1d4ed8'];

export function SortBasketScene({ scene, onNext, onWin, onResult, sync }: {
  scene: SortBasketSceneData;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  onLose?: () => void;
  /** Standalone games: called once at the end with the number of wrong picks. */
  onResult?: (r: { mistakes: number }) => void;
  sync?: ActivitySync;
}) {
  const baskets = (Array.isArray(scene.baskets) ? scene.baskets : []).slice(0, 3);
  const allItems = Array.isArray(scene.items) ? scene.items : [];
  const items = allItems.filter((it) => it && Number.isInteger(it.basket) && it.basket >= 0 && it.basket < baskets.length);
  const [state, setState] = useSyncedState<SortState>(sync, INITIAL);
  const isMirror = !!sync?.isSynced && !sync.isAuthority;

  // ---- everything below is read defensively: a mirror may hold any snapshot
  const finished = state.finished === true;
  const idx = Number.isFinite(state.idx) ? Math.max(0, Math.min(Math.floor(state.idx), Math.max(items.length - 1, 0))) : 0;
  const wrong = Array.isArray(state.wrong) ? state.wrong.filter((n) => Number.isInteger(n)) : [];
  const totalWrong = Number.isFinite(state.totalWrong) ? state.totalWrong : 0;
  const introIdx = Number.isFinite(state.introIdx) ? state.introIdx : -1;
  const flying = state.flying === true;
  const introEnabled = scene.intro !== false;
  const introDone = !introEnabled || state.introDone === true;
  const item = items[idx];
  const n = baskets.length;

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

  // ---- model first: say each basket's name aloud, one by one
  useEffect(() => {
    if (isMirror || finished || !introEnabled || state.introDone === true || !n) return;
    const mine = ++token.current;
    (async () => {
      await sleep(500);
      for (let i = 0; i < n; i++) {
        if (!alive.current || token.current !== mine) return;
        setState((s) => ({ ...s, introIdx: i }));
        await safeSpeak(baskets[i].label, 'teacher');
        await sleep(250);
      }
      if (alive.current && token.current === mine) setState((s) => ({ ...s, introIdx: -1, introDone: true }));
    })();
    const counter = token;
    return () => { counter.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  // ---- name each picture aloud as it arrives on the counter
  useEffect(() => {
    if (isMirror || finished || !introDone || !item || flying) return;
    const mine = ++token.current;
    (async () => {
      await sleep(450);
      if (alive.current && token.current === mine) await safeSpeak(item.word, 'teacher');
    })();
    const counter = token;
    return () => { counter.current++; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, introDone, scene.id]);

  useEffect(() => {
    if (finished) {
      const root = rootRef.current;
      if (root) {
        const id = ++burstId.current;
        setBursts((b) => [...b.slice(-3), { id, x: 50, y: 40, count: 48, spread: 48 }]);
        window.setTimeout(() => { if (alive.current) setBursts((b) => b.filter((q) => q.id !== id)); }, 1500);
      }
    }
  }, [finished]);

  const choose = async (b: number) => {
    if (isMirror || finished || flying || !introDone || !item || wrong.includes(b)) return;
    if (b === item.basket) {
      sfx.match();
      setState((s) => ({ ...s, flying: true }));
      burstAt(`[data-sb-basket="${b}"]`, 14, 14);
      const mine = ++token.current;
      await sleep(750);
      if (!alive.current || token.current !== mine) return;
      if (idx + 1 < items.length) {
        setState((s) => ({ ...s, idx: idx + 1, wrong: [], flying: false }));
      } else {
        setState((s) => ({ ...s, flying: false, finished: true }));
      }
    } else {
      sfx.wrong();
      setState((s) => ({
        ...s,
        wrong: [...(Array.isArray(s.wrong) ? s.wrong : []), b],
        totalWrong: (Number.isFinite(s.totalWrong) ? s.totalWrong : 0) + 1,
      }));
    }
  };

  if (n < 2 || items.length < 1) return <div className="absolute inset-0" />;

  const sortedCount = (b: number) => items.slice(0, idx + (flying || finished ? 1 : 0)).filter((it) => it.basket === b).length;
  const hint = wrong.length >= 2 && !flying;
  const basketW = `min(${Math.min(26, 90 / n - 3)}cqw, 36cqh)`;
  const title = scene.title ?? 'Market Sort';
  const prompt = finished ? 'All sorted! Great job!'
    : !introDone ? 'Listen to the baskets…'
      : flying ? 'Yes!'
        : `Where does the ${item?.word ?? ''} go?`;

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden select-none" style={{ containerType: 'size', direction: 'ltr', fontFamily: GAME_FONT }}>
      <GameStyles />
      <style>{`
        @keyframes sb-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
        @keyframes sb-glow { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(253,224,71,0)); } 50% { transform: scale(1.06); filter: drop-shadow(0 0 2.4cqh rgba(253,224,71,1)); } }
        @keyframes sb-arrive { 0% { transform: translateX(-60cqw) rotate(-14deg); opacity: 0; } 70% { transform: translateX(1.2cqw) rotate(3deg); opacity: 1; } 100% { transform: none; opacity: 1; } }
        @keyframes sb-drop { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--fx), 24cqh) scale(.35); opacity: 0; } }
      `}</style>
      <MarketBackdrop />

      <HudBar
        left={<TitleRibbon text={title} icon={<span style={{ fontSize: '4.4cqh', lineHeight: 1 }} aria-hidden="true">🧺</span>} />}
        centre={<PromptChip>{prompt}</PromptChip>}
        right={<ProgressPill done={Math.min(items.length, idx + (flying || finished ? 1 : 0))} total={items.length} color="#16a34a" label="sorted" />}
      />

      {/* The picture on the counter */}
      <div className="absolute inset-x-0 flex items-center justify-center" style={{ top: '13%', height: '34%' }}>
        {!finished && item && introDone && (
          <button
            key={`${scene.id}-${idx}`}
            type="button"
            onClick={() => void safeSpeak(item.word, 'teacher')}
            aria-label={`Hear ${item.word}`}
            className="flex flex-col items-center"
            style={{
              ['--fx' as string]: `${((item.basket + 0.5) / n - 0.5) * 80}cqw`,
              animation: flying ? 'sb-drop .7s cubic-bezier(.5,0,.8,.6) both' : 'sb-arrive .6s cubic-bezier(.2,.9,.3,1.1) both',
            }}
          >
            <div className="gt-idle flex items-center justify-center rounded-[3cqh] bg-white shadow-[0_1.4cqh_0_rgba(0,0,0,.25)]" style={{ width: '24cqh', height: '24cqh', outline: '0.7cqh solid rgba(255,255,255,.9)', animation: flying ? undefined : 'gt-float 3s ease-in-out infinite' }}>
              <div className="h-full w-full p-[9%]">
                {item.img
                  ? <img src={item.img} alt="" className="h-full w-full object-contain" draggable={false} />
                  : <span className="flex h-full w-full items-center justify-center" style={{ fontSize: '14cqh', lineHeight: 1 }}>{item.emoji ?? ''}</span>}
              </div>
            </div>
            <span className="mt-[1cqh] rounded-full bg-white/95 px-[2cqw] py-[0.3cqh] font-black text-emerald-900 shadow" style={{ fontSize: '4.4cqh', lineHeight: 1.2 }}>{item.word}</span>
          </button>
        )}
        {finished && (
          <button type="button" onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-[6cqw] py-[2cqh] font-black text-white shadow-2xl active:scale-95" style={{ fontSize: 'clamp(1.1rem, 5cqh, 2rem)', animation: 'gt-pop-in .5s cubic-bezier(.2,.9,.3,1.4) both' }}>
            Well done! Next ⭐
          </button>
        )}
      </div>

      {/* The baskets */}
      <div className="absolute inset-x-0 flex items-end justify-center" style={{ top: '52%', height: '42%', gap: '2.4cqw' }}>
        {baskets.map((b, i) => {
          const isWrong = wrong.includes(i);
          const isHint = hint && !finished && item && i === item.basket;
          const hot = introIdx === i;
          const count = sortedCount(i);
          const color = BASKET_COLORS[i % BASKET_COLORS.length];
          return (
            <button
              key={`${scene.id}-${i}`}
              type="button"
              data-sb-basket={i}
              disabled={isMirror || finished || flying || !introDone || isWrong}
              onClick={() => void choose(i)}
              aria-label={b.label}
              className="flex flex-col items-center transition active:scale-95"
              style={{
                width: basketW, opacity: isWrong ? 0.5 : 1,
                transform: hot ? 'scale(1.1)' : undefined,
                animation: isWrong ? 'sb-wobble .45s ease-in-out' : isHint ? 'sb-glow .9s ease-in-out infinite' : `gt-rise-in .5s cubic-bezier(.2,.9,.3,1.2) ${i * 110}ms both`,
              }}
            >
              <div className="relative flex w-full items-center justify-center" style={{ height: '9cqh' }}>
                {b.img
                  ? <img src={b.img} alt="" className="h-full object-contain" draggable={false} />
                  : <span style={{ fontSize: '7cqh', lineHeight: 1 }}>{b.emoji ?? ''}</span>}
                {count > 0 && (
                  <span className="absolute right-[6%] top-0 rounded-full bg-white px-[1cqh] font-black text-emerald-800 shadow" style={{ fontSize: '3.2cqh', lineHeight: 1.3 }}>{count}</span>
                )}
              </div>
              {/* woven basket body */}
              <div
                className="relative w-full"
                style={{
                  height: '17cqh',
                  background: `repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0, rgba(0,0,0,.12) 0.5cqw, transparent 0.5cqw, transparent 2cqw), repeating-linear-gradient(0deg, rgba(255,255,255,.14) 0, rgba(255,255,255,.14) 1cqh, transparent 1cqh, transparent 3cqh), linear-gradient(180deg, ${color}, #451a03)`,
                  borderRadius: '1.5cqh 1.5cqh 7cqh 7cqh',
                  boxShadow: `0 1.2cqh 0 rgba(0,0,0,.3), inset 0 1cqh 0 rgba(255,255,255,.25), ${hot || isHint ? '0 0 3cqh rgba(253,224,71,.9)' : '0 0 0 transparent'}`,
                  outline: hot || isHint ? '0.7cqh solid #facc15' : '0.4cqh solid rgba(255,255,255,.7)',
                }}
              >
                <span className="absolute inset-x-[10%] top-[24%] rounded-full bg-white/95 text-center font-black shadow" style={{ fontSize: '4.4cqh', lineHeight: 1.4, color }}>
                  {b.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {bursts.map((b) => <Burst key={b.id} x={b.x} y={b.y} count={b.count} spread={b.spread} colors={['#fde047', '#86efac', '#ffffff', '#fdba74', '#7dd3fc', '#f9a8d4']} />)}
    </div>
  );
}
