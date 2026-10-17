import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { BoardSlide } from '../types';
import { Feedback, Panel } from './shared';
import { Art } from './teach';

/** Case Board (video-game mechanic: detective board). One evidence card drops onto the table; pin it under the right heading.
 *  A wrong pin only bounces back with a friendly nudge; a right pin sticks with a pop and a red string. Done when every card is pinned. */
export function BoardView({ slide }: { slide: BoardSlide }) {
  const { right, wrong, done, seed, speak } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const order = useMemo(() => shuffled(slide.cards, seed), [slide.cards, seed]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [bounce, setBounce] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: 'ok' | 'try'; text: string } | null>(null);
  const [slip, setSlip] = useState(false);
  const cur = order.find((c) => !placed.includes(c.id));
  const total = order.length;
  const finished = !cur;
  useEffect(() => { if (finished) done(); }, [finished, done]);
  // the new card is read aloud when it lands on the table
  useEffect(() => { if (cur) void speak(cur.who ?? lead, cur.say ?? cur.text); }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const pin = (binId: string) => {
    if (!cur) return;
    if (cur.bin === binId) {
      if (!slip) right();
      setPlaced((p) => [...p, cur.id]);
      setNote({ kind: 'ok', text: cur.why });
      setSlip(false);
    } else {
      wrong();
      setSlip(true);
      setBounce(binId);
      setNote({ kind: 'try', text: slide.bins.find((b) => b.id === binId)?.hint ?? 'Not yet — read the card again and try the other heading.' });
      window.setTimeout(() => setBounce(null), 520);
    }
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key === '1') pin(slide.bins[0].id);
      if (e.key === '2') pin(slide.bins[1].id);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const filled = (text: string, binId: string) => text.replace('___', slide.bins.find((b) => b.id === binId)?.label ?? '___');
  const noteLine = note ? <Feedback kind={note.kind}>{note.text}</Feedback> : <p className="ad-hint-line">Read the card, then pin it under the right heading.</p>;
  if (finished) {
    return (
      <Panel title={slide.prompt} wide variant="glass">
        <div className="ad-board" data-look={slide.look} data-done="true">
          <div className="ad-board-hud" role="status"><b>CASE FILE</b><span className="ad-board-pips" aria-hidden="true">{order.map((c) => <i key={c.id} data-on="true" />)}</span><b>{total}/{total}</b></div>
          <div className="ad-board-cols">
            {slide.bins.map((b) => (
              <section key={b.id} className="ad-board-col" data-bin={b.id}><h3>{b.label}</h3>
                <ul>{order.filter((c) => c.bin === b.id).map((c) => <li key={c.id} className="ad-board-note" data-pinned="true">{filled(c.text, b.id)}</li>)}</ul>
              </section>
            ))}
          </div>
          <Feedback kind="ok">Every card is pinned. Read the two columns out loud: what is the same in each one?</Feedback>
        </div>
      </Panel>
    );
  }
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <div className="ad-board" data-look={slide.look}>
        <div className="ad-board-hud" role="status" aria-label={`Evidence ${placed.length} of ${total}`}>
          <b>CASE FILE</b>
          <span className="ad-board-pips" aria-hidden="true">{order.map((c) => <i key={c.id} data-on={placed.includes(c.id) || undefined} data-now={c.id === cur.id || undefined} />)}</span>
          <b>{placed.length}/{total}</b>
        </div>
        <div className="ad-board-table">
          <article key={cur.id} className="ad-board-card" data-bounce={bounce ? 'true' : undefined} aria-live="polite">
            <span className="ad-board-pin" aria-hidden="true" />
            {slide.look === 'scenes' && cur.art && <Art art={cur.art} size="md" />}
            <p>{cur.text}</p>
            <button type="button" className="ad-board-ear" aria-label="Hear it again" onClick={() => void speak(cur.who ?? lead, cur.say ?? cur.text)}><Icon name="chat" /></button>
          </article>
        </div>
        <div className="ad-board-cols">
          {slide.bins.map((b, n) => (
            <button key={b.id} type="button" className="ad-board-col" data-bin={b.id} data-bounce={bounce === b.id || undefined} aria-label={`${b.label}: pin the card here (key ${n + 1})`} onClick={() => pin(b.id)}>
              <h3><kbd aria-hidden="true">{n + 1}</kbd>{b.icon && <span className="ad-board-ico" aria-hidden="true"><Icon name={b.icon} /></span>}{b.label}</h3>
              {slide.look === 'case' && !order.some((c) => c.bin === b.id && placed.includes(c.id)) && <p className="ad-board-empty" aria-hidden="true">Pin the card here</p>}
              <ul>{order.filter((c) => c.bin === b.id && placed.includes(c.id)).map((c) => <li key={c.id} className="ad-board-note" data-pinned="true">{filled(c.text, b.id)}</li>)}</ul>
            </button>
          ))}
        </div>
        {noteLine}
      </div>
    </Panel>
  );
}
