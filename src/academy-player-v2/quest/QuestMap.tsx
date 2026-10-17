// The quest map: a bright illustrated world map (SVG + CSS, not a flat card). A winding road with 8 nodes (done / now / locked), a cast token that walks
// to the next node along the road, the next stage's teaser, and the Season chapter. Shown between stages and openable from the HUD (no walk then).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, STAGE_ICONS } from './icons';
import { questName, stageText } from './text';
import type { StageInfo } from '../engine/quest';
import type { LessonMeta } from '../shell/lessonMeta';
import type { CastName, LessonScript } from '../types';

interface Pt { x: number; y: number }
/** node positions in a 1000 x 560 (wide) or 440 x 700 (tall) map */
export function nodePositions(tall: boolean, n = 8): { w: number; h: number; pts: Pt[] } {
  if (tall) return { w: 440, h: 700, pts: Array.from({ length: n }, (_, i) => ({ x: i % 2 ? 320 : 120, y: 70 + i * 80 })) };
  const ys = [370, 250, 380, 230, 360, 240, 350, 250];
  const step = 820 / Math.max(1, n - 1);
  return { w: 1000, h: 560, pts: Array.from({ length: n }, (_, i) => ({ x: n === 1 ? 500 : 90 + i * step, y: ys[i % ys.length] + 30 })) };
}
/** a smooth cubic road between two nodes (vertical tangents in the wide map, horizontal in the tall one) */
const seg = (a: Pt, b: Pt, tall: boolean) => (tall
  ? `M${a.x} ${a.y} C${a.x} ${a.y + 48} ${b.x} ${b.y - 48} ${b.x} ${b.y}`
  : `M${a.x} ${a.y} C${a.x + 60} ${a.y} ${b.x - 60} ${b.y} ${b.x} ${b.y}`);

function useTall(ref: React.RefObject<HTMLElement>) {
  const [tall, setTall] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const upd = () => { const r = el.getBoundingClientRect(); setTall(r.width > 0 && r.width / Math.max(1, r.height) < 1.05); };
    upd();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(upd); ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return tall;
}

export interface QuestMapProps {
  script: LessonScript;
  meta: LessonMeta;
  stages: StageInfo[];
  /** the stage the student is in (HUD view) or walks to (between stages) */
  part: number;
  /** walk the token from one stage to the next (between stages); omit to just show where you are */
  walk?: { from: number; to: number };
  calm: boolean;
  artBase: string;
  onClose: () => void;
}

export function QuestMap({ script, meta, stages, part, walk, calm, artBase, onClose }: QuestMapProps) {
  const { t } = useTranslation();
  const outer = useRef<HTMLDivElement>(null);
  const tall = useTall(outer);
  const { w, h, pts } = useMemo(() => nodePositions(tall, script.partMinutes.length), [tall, script.partMinutes.length]);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const [token, setToken] = useState<Pt>(() => pts[walk ? walk.from : part] ?? pts[0]);
  const [arrived, setArrived] = useState(!walk || calm);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const who: CastName = script.cast[0] ?? 'Vee';
  useEffect(() => { closeBtn.current?.focus({ preventScroll: true }); }, []);

  // walk the token along the road (rAF + getPointAtLength); calm mode / jsdom: it is just there
  useEffect(() => {
    if (!walk) { setToken(pts[part] ?? pts[0]); return; }
    if (calm) { setToken(pts[walk.to]); setArrived(true); return; }
    let raf = 0; let timer = 0; let alive = true;
    setArrived(false); setToken(pts[walk.from]);
    const legs = Array.from({ length: Math.max(0, walk.to - walk.from) }, (_, k) => walk.from + k);
    const t0 = performance.now(); const per = 900; const start = 650;
    const step = (now: number) => {
      if (!alive) return;
      const el = Math.max(0, now - t0 - start);
      const li = Math.min(legs.length - 1, Math.floor(el / per));
      const k = Math.min(1, (el - li * per) / per);
      const path = segRefs.current[legs[li]];
      if (path && typeof path.getPointAtLength === 'function') {
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const p = path.getPointAtLength(e * path.getTotalLength());
        setToken({ x: p.x, y: p.y });
      }
      if (el >= legs.length * per) { setToken(pts[walk.to]); setArrived(true); return; }
      raf = requestAnimationFrame(step);
    };
    if (typeof requestAnimationFrame !== 'function' || !segRefs.current[legs[0]]?.getPointAtLength) { timer = window.setTimeout(() => { setToken(pts[walk.to]); setArrived(true); }, 0); }
    else raf = requestAnimationFrame(step);
    return () => { alive = false; cancelAnimationFrame(raf); window.clearTimeout(timer); };
  }, [walk, part, calm, pts]);

  const walking = !!walk && !arrived;
  const reached = walk ? walk.to : part;
  const stateOf = (i: number) => (walking ? (i <= (walk?.from ?? 0) ? 'done' : 'todo') : i < reached ? 'done' : i === reached ? 'now' : 'todo');
  const roadDone = (i: number) => (walking ? i < (walk?.from ?? 0) : i < reached);
  const upcoming = walk ? walk.to : part;
  const up = stageText(t, script, upcoming);
  const upStage = stages[upcoming];
  const lastNode = pts[pts.length - 1];

  return (
    <div className="avq-map" ref={outer} role="dialog" aria-modal="true" aria-label={t('ap.mapTitle', 'Quest map')} data-testid="avq-map" data-av-local data-calm={calm || undefined}>
      <header className="avq-map-head">
        <p className="avq-eyebrow"><Icon name="map" size={18} /> {t('ap.mapTitle', 'Quest map')}{meta.chapter && ` · ${t('ap.chapter', 'Chapter {{n}} of 8', { n: meta.chapter.no })}`}</p>
        <h2>{questName(script, meta)}</h2>
      </header>
      <div className="avq-map-field" style={{ aspectRatio: `${w} / ${h}` }}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className="avq-map-svg" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="avq-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dff1ff" /><stop offset="0.55" stopColor="#f6f0ff" /><stop offset="1" stopColor="#e4f6f1" /></linearGradient>
            <linearGradient id="avq-hill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8ead9" /><stop offset="1" stopColor="#a9dcc6" /></linearGradient>
            <linearGradient id="avq-hill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9cffb" /><stop offset="1" stopColor="#c3b0fb" /></linearGradient>
            <radialGradient id="avq-sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff6c9" /><stop offset="1" stopColor="#fff6c9" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={w} height={h} fill="url(#avq-sky)" />
          <circle cx={tall ? 360 : 860} cy={tall ? 70 : 80} r={tall ? 120 : 150} fill="url(#avq-sun)" />
          <path d={tall ? `M0 250 Q110 160 220 230 T440 200 V700 H0Z` : `M0 250 Q160 130 330 220 T660 190 T1000 230 V560 H0Z`} fill="url(#avq-hill2)" opacity="0.7" />
          <path d={tall ? `M0 420 Q120 340 240 410 T440 380 V700 H0Z` : `M0 360 Q200 270 420 350 T820 330 T1000 360 V560 H0Z`} fill="url(#avq-hill1)" />
          <path d={tall ? `M0 560 Q150 500 300 560 T440 540 V700 H0Z` : `M0 470 Q250 420 500 470 T1000 450 V560 H0Z`} fill="#bfe6cf" />
          {(tall
            ? [[40, 330], [400, 450], [60, 560], [390, 610], [210, 640]]
            : [[40, 380], [210, 470], [330, 330], [520, 490], [640, 350], [780, 490], [930, 400], [960, 300]]
          ).map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x="-3" y="0" width="6" height="14" rx="2" fill="#c79a63" />
              <circle cx="0" cy="-6" r={i % 2 ? 15 : 19} fill={i % 3 === 0 ? '#6fc29b' : '#8fd3b0'} />
              <circle cx="-5" cy="-11" r="6" fill="#fff" opacity="0.25" />
            </g>
          ))}
          {pts.slice(0, -1).map((p, i) => <path key={`b${i}`} d={seg(p, pts[i + 1], tall)} className="avq-road-edge" />)}
          {pts.slice(0, -1).map((p, i) => <path key={`r${i}`} d={seg(p, pts[i + 1], tall)} className="avq-road" data-done={roadDone(i) || undefined} />)}
          {pts.slice(0, -1).map((p, i) => <path key={`s${i}`} ref={(el) => { segRefs.current[i] = el; }} d={seg(p, pts[i + 1], tall)} fill="none" stroke="none" />)}
          <g className="avq-flag" transform={`translate(${lastNode.x + (tall ? -12 : 26)} ${lastNode.y - 56})`}><path d="M0 60V0" stroke="#4f2eaa" strokeWidth="4" strokeLinecap="round" /><path d="M2 2h34l-8 11 8 11H2z" fill="#fbbf24" stroke="#c98a00" strokeWidth="2" strokeLinejoin="round" /></g>
          <g className="avq-clouds" opacity="0.85">
            <ellipse cx={tall ? 90 : 170} cy={tall ? 40 : 60} rx="48" ry="14" fill="#fff" /><ellipse cx={tall ? 125 : 205} cy={tall ? 33 : 52} rx="30" ry="12" fill="#fff" />
            <ellipse cx={tall ? 300 : 620} cy={tall ? 120 : 110} rx="44" ry="13" fill="#fff" />
          </g>
        </svg>
        <ol className="avq-nodes">
          {pts.map((p, i) => {
            const st = stateOf(i);
            const tx = stageText(t, script, i);
            return (
              <li key={i} className="avq-node" data-state={st} style={{ left: `${(p.x / w) * 100}%`, top: `${(p.y / h) * 100}%` }} data-side={tall ? (i % 2 ? 'left' : 'right') : i % 2 ? 'below' : 'above'}>
                <span className="avq-node-dot" aria-hidden="true">
                  {st === 'done' ? <Icon name="check" size={22} /> : st === 'todo' ? <Icon name="lock" size={18} /> : <Icon name={STAGE_ICONS[i % STAGE_ICONS.length]} size={22} />}
                </span>
                <span className="avq-node-name"><i>{i + 1}</i> {tx.title}<span className="sr-only"> — {st === 'done' ? t('ap.stateDone', 'cleared') : st === 'now' ? t('ap.stateNow', 'you are here') : t('ap.stateTodo', 'locked')}</span></span>
              </li>
            );
          })}
        </ol>
        <span className="avq-token" style={{ left: `${(token.x / w) * 100}%`, top: `${(token.y / h) * 100}%` }} data-walking={(walk && !arrived) || undefined} aria-hidden="true">
          <img src={`${artBase}/cast/${who.toLowerCase()}/happy.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
        </span>
      </div>
      <section className="avq-map-teaser">
        <div>
          <p className="avq-eyebrow">{walk ? t('ap.upNext', 'Up next · stage {{n}}', { n: upcoming + 1 }) : t('ap.youAreHere', 'You are here · stage {{n}}', { n: upcoming + 1 })}</p>
          <h3>{up.title}</h3>
          <p>{up.goal}</p>
          {upStage && (upStage.loot.gems + upStage.loot.cards + upStage.loot.trophies + upStage.loot.clues) > 0 && (
            <p className="avq-intro-loot">
              {upStage.loot.gems > 0 && <span>◆ {t('ap.lootGems', 'up to {{n}} gems', { n: upStage.loot.gems })}</span>}
              {upStage.loot.cards > 0 && <span>✦ {t('ap.lootCards', '{{n}} Word Cards', { n: upStage.loot.cards })}</span>}
              {upStage.loot.trophies > 0 && <span>♛ {t('ap.lootTrophies', '{{n}} trophy', { n: upStage.loot.trophies })}</span>}
              {upStage.loot.clues > 0 && <span>⌕ {t('ap.lootClues', '{{n}} clue pieces', { n: upStage.loot.clues })}</span>}
            </p>
          )}
        </div>
        <button ref={closeBtn} type="button" className="av-btn" data-kind="go" onClick={onClose}>{walk ? t('ap.mapGo', 'Go') : t('ap.mapBack', 'Back to the lesson')} →</button>
      </section>
    </div>
  );
}
