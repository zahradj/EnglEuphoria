import { useEffect, useState } from 'react';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { SortSlide } from '../types';
import { Feedback, Panel } from './shared';
import { Art } from './teach';

/** Sort: your own opinions. Tap a picture, then a bin; the sentence is built from the bin's template, shown and spoken. No wrong answer. */
export function SortView({ slide }: { slide: SortSlide }) {
  const { right, done, speak } = useDeck();
  const [pick, setPick] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const all = Object.keys(placed).length === slide.items.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  const put = (binId: string) => {
    if (!pick) return;
    const it = slide.items.find((x) => x.id === pick)!;
    const bin = slide.bins.find((b) => b.id === binId)!;
    setPlaced({ ...placed, [pick]: binId });
    setPick(null);
    right();
    void speak('Vee', bin.template.replace('{w}', it.word));
  };
  const left = slide.items.filter((i) => !placed[i.id]);
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-sort-pool" role="group" aria-label="Pictures to sort">
        {left.map((it) => (
          <button key={it.id} type="button" className="ad-sort-item" data-on={pick === it.id} aria-pressed={pick === it.id} aria-label={it.word} onClick={() => setPick(pick === it.id ? null : it.id)}>
            <Art art={it.art} size="sm" />
            <span>{it.word}</span>
          </button>
        ))}
        {left.length === 0 && <span className="ad-hint-line">All sorted!</span>}
      </div>
      <div className="ad-sort-bins">
        {slide.bins.map((b) => (
          <button key={b.id} type="button" className="ad-sort-bin" data-ready={!!pick} aria-label={b.label} onClick={() => put(b.id)}>
            <b>{b.label}</b>
            <ul>
              {slide.items.filter((i) => placed[i.id] === b.id).map((i) => <li key={i.id}><Icon name="check" /> {b.template.replace('{w}', i.word)}</li>)}
            </ul>
          </button>
        ))}
      </div>
      {all ? <Feedback kind="ok">That is your hobby wall. Say your sentences out loud!</Feedback> : <p className="ad-hint-line">{pick ? 'Now tap a box.' : 'Tap a picture, then tap the box it belongs in. There is no wrong answer.'}</p>}
    </Panel>
  );
}
