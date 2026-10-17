// Comic story scene: a sequence of full scene plates (16:9, uncropped, never zoomed or panned) with a narration box, typed speech bubbles,
// speed lines on a shout and a sound word layered on top. Bubbles sit on the beat's empty `spots`. Lines are spoken by the recorded voices.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sayLine, stopVoice } from '../../services/voice';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface ComicBeat {
  plate: string;
  caption?: string;
  side?: Partial<Record<CastName, 'left' | 'right'>>;
  /** where each speaker's bubble sits, % of the picture (x, y = top-left, w = width): empty space only */
  spots?: Partial<Record<CastName, { x: number; y: number; w: number }>>;
  capAt?: { x: number; y: number; w: number };
  lines: { who: CastName; text: string; shout?: boolean; sfx?: string }[];
}
export interface ComicScene extends SceneBase { kind: 'comic'; title: string; beats: ComicBeat[] }

type Flat = ComicBeat['lines'][number] & { bi: number; li: number };

function Typed({ text, instant }: { text: string; instant: boolean }) {
  const [n, setN] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) { setN(text.length); return; }
    setN(0);
    const id = window.setInterval(() => setN((k) => { if (k >= text.length) { window.clearInterval(id); return k; } return k + 1; }), 24);
    return () => window.clearInterval(id);
  }, [text, instant]);
  return <span aria-hidden="true">{text.slice(0, n)}</span>;
}

function ComicView({ scene, onDone, artBase, calm }: SceneProps<ComicScene>) {
  const { t } = useTranslation();
  const flat = useMemo<Flat[]>(() => scene.beats.flatMap((b, bi) => b.lines.map((l, li) => ({ ...l, bi, li }))), [scene]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const line = flat[Math.min(i, flat.length - 1)];
  const beat = scene.beats[line.bi];
  const reported = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    let live = true;
    void sayLine({ who: line.who, text: line.text }, artBase).then((played) => {
      // after the voice ends: a short beat, then the next line (a silent clip waits for a tap)
      if (live && played && auto && i < flat.length - 1) timer.current = window.setTimeout(() => setI((n) => Math.min(flat.length - 1, n + 1)), 700);
    });
    if (i >= flat.length - 1 && !reported.current) { reported.current = true; onDone(); }
    return () => { live = false; window.clearTimeout(timer.current); stopVoice(); };
  }, [i, line, flat.length, auto, artBase, onDone]);

  const sideOf = (f: Flat) => beat.side?.[f.who] ?? (f.li % 2 === 0 ? 'left' : 'right');
  const spotOf = (f: Flat) => beat.spots?.[f.who];
  const at = (f: Flat) => { const s = spotOf(f); return s ? { left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%` } : undefined; };
  const p0 = i > 0 && flat[i - 1].bi === line.bi ? flat[i - 1] : null;
  // the line before stays (dimmed) only if it is another speaker with its own spot: never stacked on one spot
  const prev = p0 && p0.who !== line.who && (spotOf(p0) || !spotOf(line)) ? p0 : null;
  const shout = !!line.shout || /!\s*$/.test(line.text);
  const side = sideOf(line);
  const next = () => setI((n) => Math.min(flat.length - 1, n + 1));

  return (
    <div className="av-comic" data-testid="av-comic" role="group" aria-label={scene.title}>
      <div className="av-comic-frame" onClick={next}>
        {scene.beats.map((b, bi) => (
          <div key={b.plate + bi} className="av-comic-plate" data-on={bi === line.bi} data-calm={calm || undefined} aria-hidden={bi !== line.bi}
            style={missing[b.plate] ? undefined : { backgroundImage: `url(${artBase}/bg/${b.plate}.webp)` }}>
            <img src={`${artBase}/bg/${b.plate}.webp`} alt="" hidden onError={() => setMissing((m) => ({ ...m, [b.plate]: true }))} />
          </div>
        ))}
        <i className="av-comic-wipe" key={`w${line.bi}`} aria-hidden="true" />
        {beat.caption && <p className="av-comic-cap" key={`c${line.bi}`} style={beat.capAt ? { left: `${beat.capAt.x}%`, top: `${beat.capAt.y}%`, width: `${beat.capAt.w}%` } : undefined}><span>{beat.caption}</span></p>}
        {prev && <p className="av-comic-bub" data-old="true" data-side={sideOf(prev)} style={at(prev)} key={`o${i}`}><b>{prev.who}</b>{prev.text}</p>}
        {shout && <i className="av-comic-speed" data-side={side} key={`s${i}`} aria-hidden="true" />}
        <p className="av-comic-bub" data-shout={shout || undefined} data-side={side} style={at(line)} key={`b${i}`} aria-label={`${line.who}: ${line.text}`} role="status">
          <b>{line.who}</b><Typed text={line.text} instant={calm} />
        </p>
        {line.sfx && <span className="av-comic-sfx" data-side={side} key={`x${i}`} aria-hidden="true">{line.sfx}</span>}
      </div>
      <div className="av-comic-ctl">
        <button type="button" className="av-btn" onClick={() => setAuto((v) => !v)} aria-pressed={auto}>{auto ? '❚❚' : '▶'}</button>
        <button type="button" className="av-btn" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="‹">‹</button>
        <span className="av-comic-dots" aria-label={`${i + 1} / ${flat.length}`}>{flat.map((_, k) => <i key={k} data-state={k < i ? 'done' : k === i ? 'now' : 'todo'} />)}</span>
        <button type="button" className="av-btn" data-kind="go" onClick={next} disabled={i >= flat.length - 1}>{t('ap.nextLine', 'Next line')} ›</button>
      </div>
    </div>
  );
}

export const comicScene: SceneModule<ComicScene> = {
  view: ComicView,
  // the view speaks line by line in step with the bubbles
  spoken: () => [],
  validate: (s) => {
    const p: string[] = [];
    if (!s.beats?.length) return [`${s.id}: comic needs 3-5 beats`];
    if (s.beats.length < 3 || s.beats.length > 5) p.push(`${s.id}: a story is 3-5 plates (has ${s.beats.length})`);
    s.beats.forEach((b, i) => {
      if (!b.plate) p.push(`${s.id}: beat ${i + 1} has no plate`);
      if (!b.lines?.length) p.push(`${s.id}: beat ${i + 1} has no lines`);
      for (const [who, sp] of Object.entries(b.spots ?? {})) if (!sp || sp.x < 0 || sp.y < 0 || sp.x + sp.w > 100) p.push(`${s.id}: beat ${i + 1} spot for ${who} is off the picture`);
    });
    return p;
  },
};
