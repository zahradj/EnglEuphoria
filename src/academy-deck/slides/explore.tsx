import { useEffect, useState } from 'react';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { ExploreSlide } from '../types';
import { Art } from './teach';

/** Fair walk: the scene is the game. Tap a glowing spot to hear the line; the picture pops out and a bubble shows the sentence. */
export function ExploreView({ slide }: { slide: ExploreSlide }) {
  const { right, done, speak } = useDeck();
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const all = seen.length === slide.spots.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  const tap = (id: string) => {
    const spot = slide.spots.find((s) => s.id === id)!;
    setOpen(id);
    void speak(spot.who, spot.line);
    if (!seen.includes(id)) {
      setSeen([...seen, id]);
      right();
    }
  };
  const cur = slide.spots.find((s) => s.id === open);
  return (
    <>
      <div className="ad-explore" aria-label="The scene">
        {slide.spots.map((s, i) => (
          <button key={s.id} type="button" className="ad-spot" data-seen={seen.includes(s.id)} data-open={open === s.id} style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${i * 0.35}s` }} aria-label={s.label} onClick={() => tap(s.id)}>
            <span className="ad-spot-ring" aria-hidden />
            <span className="ad-spot-pic"><Art art={s.art} size="sm" /></span>
          </button>
        ))}
        {cur && (
          <p className="ad-spot-bubble" key={cur.id} style={{ left: `${Math.min(78, Math.max(22, cur.x))}%`, top: `${Math.max(14, cur.y - 22)}%` }} role="status">
            <b>{cur.who}</b> {cur.line}
          </p>
        )}
      </div>
      <div className="ad-gm-hud" role="group" aria-label={slide.prompt}>
        <span className="ad-gm-title">{slide.prompt}</span>
        <span className="ad-gm-count" key={seen.length}>{seen.length}/{slide.spots.length}</span>
      </div>
      {all && <p className="ad-gm-toast" data-ok="true" role="status"><Icon name="check" /> You visited every stall!</p>}
    </>
  );
}
