import { useEffect, useState } from 'react';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { NumWallSlide } from '../types';
import { Hear } from '../Hear';
import { numberWord } from '../spoken';
import { Panel } from './shared';
import { Art } from './teach';

export { numberWord };

/** Hundred chart: tap any number; it shows the dots (rows of ten), says the word, and explains the pattern. Unlocks after `need` taps. */
export function NumWallView({ slide }: { slide: NumWallSlide }) {
  const { done, speak, right } = useDeck();
  const [cur, setCur] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const need = slide.need ?? 8;
  useEffect(() => {
    if (seen.length >= need) done();
  }, [seen, need, done]);
  const tap = (n: number) => {
    setCur(n);
    if (!seen.includes(n)) {
      setSeen([...seen, n]);
      right();
    }
    void speak('Vee', numberWord(n));
  };
  const word = cur ? numberWord(cur) : '';
  const rule = cur === null ? 'Tap any number.' : cur < 11 ? `${cur} → ${word}` : cur < 20 ? `${cur - 10} + ten → ${word} (the "-teen" numbers)` : cur === 100 ? 'ten tens = one hundred' : cur % 10 === 0 ? `${cur / 10} tens → ${word} (the "-ty" numbers)` : `${cur - (cur % 10)} + ${cur % 10} → ${word}`;
  return (
    <Panel title={slide.title} wide>
      <div className="ad-wall-top">
        <div className="ad-wall-card" aria-live="polite" data-empty={cur === null}>
          {cur === null ? <Icon name="numbers" className="ad-icon-big" /> : <Art art={{ type: 'count', n: cur }} size="sm" key={cur} />}
          <div className="ad-wall-word">{cur === null ? 'Pick a number' : <>{word}<Hear who="Vee" text={word} /></>}</div>
          <div className="ad-wall-rule">{rule}</div>
        </div>
        <div className="ad-wall-grid" role="group" aria-label="Numbers 1 to 100">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" className="ad-wall-cell" data-band={Math.floor((n - 1) / 10) % 2} data-seen={seen.includes(n)} data-now={cur === n} onClick={() => tap(n)} aria-label={`${n}, ${numberWord(n)}`}>{n}</button>
          ))}
        </div>
      </div>
      {slide.hundreds && (
        <div className="ad-wall-hundreds" role="group" aria-label="Hundreds">
          <b>Big numbers:</b>
          {[200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
            <button key={n} type="button" className="ad-wall-cell ad-wall-hun" data-now={cur === n} onClick={() => { setCur(n); void speak('Vee', numberWord(n)); }} aria-label={`${n}, ${numberWord(n)}`}>{n}</button>
          ))}
          {cur !== null && cur >= 200 && <span className="ad-wall-rule">{cur / 100} × 100 → {numberWord(cur)}</span>}
        </div>
      )}
      <p className="ad-hint-line">{seen.length >= need ? <><Icon name="check" /> You explored {seen.length} numbers. Tap more if you like!</> : `Tap ${need - seen.length} more number${need - seen.length === 1 ? '' : 's'} to continue (${seen.length}/${need}).`}</p>
    </Panel>
  );
}
