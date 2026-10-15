import { useEffect, useRef, useState } from 'react';
import { COLOR } from '../Stage';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { StorySlide } from '../types';

/** Story as film: every beat is a full-bleed scene plate with the cast painted in; the line shows as a subtitle and is spoken. Tap the picture or "Next" for the next line; plates cross-fade. */
export function StoryView({ slide }: { slide: StorySlide }) {
  const { artBase, done, speak, reduced } = useDeck();
  const flat = slide.beats.flatMap((b, bi) => b.lines.map((l) => ({ ...l, bi })));
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(!slide.listenFirst);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const line = flat[Math.min(i, flat.length - 1)];
  const lastRef = useRef(-1);
  useEffect(() => {
    if (lastRef.current === i) return;
    lastRef.current = i;
    void speak(line.who, line.text);
    if (i >= flat.length - 1) done();
  }, [i, line, flat.length, speak, done]);
  const next = () => setI((n) => Math.min(flat.length - 1, n + 1));
  const back = () => setI((n) => Math.max(0, n - 1));
  return (
    <div className="ad-story" role="group" aria-label={slide.title} onClick={next}>
      {slide.beats.map((b, bi) => (
        <div key={b.plate + bi} className="ad-story-plate" data-on={bi === line.bi} data-calm={reduced || undefined} aria-hidden={bi !== line.bi}>
          {artBase && !broken[b.plate] && <img src={`${artBase}/bg/${b.plate}.webp`} alt="" draggable={false} onError={() => setBroken((x) => ({ ...x, [b.plate]: true }))} />}
        </div>
      ))}
      <div className="ad-story-shade" aria-hidden />
      <p className="ad-story-sub" key={`${i}${shown}`} hidden={!shown} style={{ ['--who' as string]: COLOR[line.who as keyof typeof COLOR] }} aria-live="polite"><b>{line.who}</b> {line.text}</p>
      {!shown && <p className="ad-story-listen" role="status"><Icon name="speaker" /> Listen. Tap “Next line” to hear the next one.</p>}
      <div className="ad-story-ctl" onClick={(e) => e.stopPropagation()}>
        {slide.listenFirst && <button type="button" className="ad-btn" onClick={() => setShown((v) => !v)}>{shown ? 'Hide the text' : 'Show the text'}</button>}
        <button type="button" className="ad-btn" onClick={back} disabled={i === 0} aria-label="Previous line">‹</button>
        <span className="ad-story-dots" aria-label={`Line ${i + 1} of ${flat.length}`}>{flat.map((_, k) => <i key={k} data-on={k === i} data-seen={k < i} />)}</span>
        <button type="button" className="ad-btn" onClick={next} disabled={i >= flat.length - 1} aria-label="Next line"><Icon name="speaker" /> Next line ›</button>
      </div>
    </div>
  );
}
