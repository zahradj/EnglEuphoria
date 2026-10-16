import { useEffect, useRef, useState } from 'react';
import { COLOR } from '../Stage';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { CastName, StorySlide } from '../types';

/** Text that types itself, quickly (visual only: the full line is in the aria-label, and Calm mode shows it at once). */
function Typed({ text, instant }: { text: string; instant: boolean }) {
  const [n, setN] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) { setN(text.length); return; }
    setN(0);
    const t = window.setInterval(() => setN((k) => { if (k >= text.length) { window.clearInterval(t); return k; } return k + 1; }), 24);
    return () => window.clearInterval(t);
  }, [text, instant]);
  return <span aria-hidden="true">{text.slice(0, n)}<i className="ad-comic-caret" data-on={n < text.length || undefined} /></span>;
}

/** Story as film: every beat is a full-bleed scene plate with the cast painted in; the line shows as a subtitle and is spoken. Tap the picture or "Next" for the next line; plates cross-fade. */
export function StoryView({ slide }: { slide: StorySlide }) {
  const { artBase, done, speak, reduced } = useDeck();
  const flat = slide.beats.flatMap((b, bi) => b.lines.map((l, li) => ({ ...l, bi, li })));
  const comic = slide.look === 'comic';
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(!slide.listenFirst);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [auto, setAuto] = useState(true);
  const [title, setTitle] = useState(true);
  const timer = useRef<number | undefined>(undefined);
  const line = flat[Math.min(i, flat.length - 1)];
  const lastRef = useRef(-1);
  useEffect(() => {
    if (lastRef.current === i) return;
    lastRef.current = i;
    window.clearTimeout(timer.current);
    let live = true;
    void speak(line.who, line.text).then((played) => {
      // play the scene on its own: after the voice ends, a short beat, then the next line (a silent clip waits for a tap)
      if (live && played && auto && i < flat.length - 1) timer.current = window.setTimeout(() => setI((n) => Math.min(flat.length - 1, n + 1)), 700);
    });
    if (i >= flat.length - 1) done();
    return () => { live = false; window.clearTimeout(timer.current); };
  }, [i, line, flat.length, speak, done, auto]);
  useEffect(() => { const t = window.setTimeout(() => setTitle(false), reduced ? 900 : 2000); return () => window.clearTimeout(t); }, [reduced]);
  const next = () => setI((n) => Math.min(flat.length - 1, n + 1));
  const back = () => setI((n) => Math.max(0, n - 1));
  return (
    <div className="ad-story" data-look={comic ? 'comic' : undefined} role="group" aria-label={slide.title} onClick={next}>
      {slide.beats.map((b, bi) => (
        <div key={b.plate + bi} className="ad-story-plate" data-on={bi === line.bi} data-calm={reduced || undefined} aria-hidden={bi !== line.bi}>
          {artBase && !broken[b.plate] && <img src={`${artBase}/bg/${b.plate}.webp`} alt="" draggable={false} onError={() => setBroken((x) => ({ ...x, [b.plate]: true }))} />}
        </div>
      ))}
      <div className="ad-story-shade" aria-hidden />
      <div className="ad-story-bars" aria-hidden />
      {title && <div className="ad-story-title" aria-hidden><span>{slide.title}</span></div>}
      {comic && <ComicLayer slide={slide} flat={flat} i={i} line={line} shown={shown} reduced={reduced} />}
      <p className="ad-story-sub" key={`${i}${shown}`} hidden={!shown || comic} style={{ ['--who' as string]: COLOR[line.who as keyof typeof COLOR] }} aria-live="polite"><b>{line.who}</b> {line.text}</p>
      {!shown && <p className="ad-story-listen" role="status"><Icon name="speaker" /> {auto ? 'Listen to the scene. It plays on its own; tap Pause to stop.' : 'Listen. Tap “Next line” to hear the next one.'}</p>}
      <div className="ad-story-ctl" onClick={(e) => e.stopPropagation()}>
        {slide.listenFirst && <button type="button" className="ad-btn" onClick={() => setShown((v) => !v)}>{shown ? 'Hide the text' : 'Show the text'}</button>}
        <button type="button" className="ad-btn" onClick={() => setAuto((v) => !v)} aria-pressed={auto}>{auto ? 'Pause' : 'Play'}</button>
        <button type="button" className="ad-btn" onClick={back} disabled={i === 0} aria-label="Previous line">‹</button>
        <span className="ad-story-dots" aria-label={`Line ${i + 1} of ${flat.length}`}>{flat.map((_, k) => <i key={k} data-on={k === i} data-seen={k < i} />)}</span>
        <button type="button" className="ad-btn" onClick={next} disabled={i >= flat.length - 1} aria-label="Next line"><Icon name="speaker" /> Next line ›</button>
      </div>
    </div>
  );
}

type Flat = { who: CastName; text: string; shout?: boolean; sfx?: string; bi: number; li: number };

/** Manga-style layer over the still plate: a narration box that explains the scene, speech bubbles with typed text (the line before stays, dimmed),
 *  speed lines on a shout, a sound word, and a halftone wipe at every new beat. The picture itself never moves. */
function ComicLayer({ slide, flat, i, line, shown, reduced }: { slide: StorySlide; flat: Flat[]; i: number; line: Flat; shown: boolean; reduced: boolean }) {
  const beat = slide.beats[line.bi];
  const sideOf = (f: Flat): 'left' | 'right' => beat.side?.[f.who] ?? (f.li % 2 === 0 ? 'left' : 'right');
  const p0 = i > 0 && flat[i - 1].bi === line.bi ? flat[i - 1] : null;
  const spotOf = (f: Flat) => beat.spots?.[f.who];
  const at = (f: Flat) => { const sp = spotOf(f); return sp ? { left: `${sp.x}%`, top: `${sp.y}%`, width: `${sp.w}%`, maxWidth: 'none' } : undefined; };
  // the line before stays only if it is another speaker with its own spot (never stacked on the same spot)
  const prev = p0 && p0.who !== line.who && (spotOf(p0) || !spotOf(line)) ? p0 : null;
  const shout = !!line.shout || /!\s*$/.test(line.text);
  const side = sideOf(line);
  return (
    <div className="ad-comic" aria-hidden={!shown ? true : undefined}>
      <i className="ad-comic-wipe" key={`wipe${line.bi}`} aria-hidden="true" />
      {shown && beat.caption && <p className="ad-comic-cap" key={`cap${line.bi}`} style={beat.capAt ? { left: `${beat.capAt.x}%`, top: `${beat.capAt.y}%`, width: `${beat.capAt.w}%`, maxWidth: 'none' } : undefined}><span>{beat.caption}</span></p>}
      {shown && prev && <p className="ad-comic-bubble" data-old="true" data-side={sideOf(prev)} style={at(prev)} key={`old${i}`}><b>{prev.who}</b>{prev.text}</p>}
      {shown && (
        <>
          {shout && <i className="ad-comic-speed" data-side={side} key={`sp${i}`} aria-hidden="true" />}
          <p className="ad-comic-bubble" data-shout={shout || undefined} data-side={side} style={at(line)} key={`b${i}`} aria-label={`${line.who}: ${line.text}`} role="status">
            <b>{line.who}</b>
            <Typed text={line.text} instant={reduced} />
          </p>
          {line.sfx && <span className="ad-comic-sfx" data-side={side} key={`sfx${i}`} aria-hidden="true">{line.sfx}</span>}
        </>
      )}
    </div>
  );
}
