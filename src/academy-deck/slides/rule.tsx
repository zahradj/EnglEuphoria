import { useEffect, useState } from 'react';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { RuleSlide } from '../types';
import { Feedback, Panel } from './shared';

/** The rule, stated plainly: up to 3 lines, each with an example. Hear it, say it, tap "I said it"; when all lines are said the slide is done. */
export function RuleView({ slide }: { slide: RuleSlide }) {
  const { right, done, speak } = useDeck();
  const [said, setSaid] = useState<Set<number>>(new Set());
  const all = said.size >= slide.lines.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  const hear = (i: number) => {
    void speak('Vee', slide.lines[i].say).then(() => speak('Vee', slide.lines[i].example));
  };
  return (
    <Panel title={slide.title} wide variant="glass">
      <ol className="ad-rule-list">
        {slide.lines.map((l, i) => (
          <li key={i} className="ad-rule-row" data-said={said.has(i)}>
            <span className="ad-rule-no" aria-hidden>{i + 1}</span>
            <span className="ad-rule-text"><strong>{l.rule}</strong><em>{l.example}</em></span>
            <button type="button" className="ad-btn" onClick={() => hear(i)} aria-label={`Hear rule ${i + 1}`}><Icon name="speaker" /> Hear it</button>
            <button type="button" className="ad-btn" aria-pressed={said.has(i)} onClick={() => { if (!said.has(i)) { right(); setSaid(new Set(said).add(i)); } }}>{said.has(i) ? 'Said it' : 'I said it'}</button>
          </li>
        ))}
      </ol>
      {all && <Feedback kind="ok">You know the rule. Now use it!</Feedback>}
      <p className="ad-hint-line">Listen, say the line out loud, then tap “I said it”.</p>
    </Panel>
  );
}
