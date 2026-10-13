import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { useDragChip } from '../drag';
import { Icon } from '../Icon';
import type { MatchSlide } from '../types';
import { sayable } from '../spoken';
import { Feedback, NOT_YET, Panel } from './shared';
import { Art } from './teach';

/** Match the picture with the word: drag a word onto its picture (or tap a word, then a picture). Pictures are alive (animated art), words are spoken when picked. */
/** Scatter: each picture floats at its own small offset and tilt (no boxes), so the board looks like pictures lying on a desk. */
const scatter = (i: number) => ({ ['--y' as string]: `${[0, 18, -8, 22, -4, 14][i % 6]}px`, ['--r' as string]: `${[-3, 2.5, -2, 3, -1.5, 2][i % 6]}deg`, ['--d' as string]: `${(i % 5) * 0.35}s` });

export function MatchView({ slide }: { slide: MatchSlide }) {
  const { right, wrong, done, seed, speak } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const [placed, setPlaced] = useState<string[]>([]);
  const [held, setHeld] = useState<string | null>(null);
  const [slip, setSlip] = useState(false);
  const [bad, setBad] = useState<string | null>(null);
  const bank = useMemo(() => shuffled(slide.pairs.map((p) => p.word), seed), [slide.pairs, seed]);
  const drop = (word: string, target: string) => {
    if (placed.includes(target)) return;
    if (word === target) {
      setPlaced([...placed, target]);
      setHeld(null);
      if (!slip) right();
      setSlip(false);
      void speak(lead, sayable(word));
    } else {
      setSlip(true);
      setBad(target);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  const drag = useDragChip((id, t) => drop(id, t), (id) => {
    void speak(lead, sayable(id));
    setHeld(held === id ? null : id);
  });
  const all = placed.length === slide.pairs.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  // listen mode: the word is spoken, the student chooses its picture (nothing to read)
  const listen = slide.mode === 'listen';
  const order = useMemo(() => shuffled(slide.pairs.map((p) => p.word), seed + 7), [slide.pairs, seed]);
  const target = order.find((w) => !placed.includes(w));
  useEffect(() => {
    if (listen && target) void speak(lead, sayable(target));
  }, [listen, target, speak, lead]);
  if (listen) {
    return (
      <Panel title={slide.prompt} wide>
        <div className="ad-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="ad-btn ad-btn-primary" onClick={() => target && void speak(lead, sayable(target))} disabled={!target}><Icon name="speaker" /> {target ? 'Hear it again' : 'All matched!'}</button>
        </div>
        <div className="ad-match" data-n={slide.pairs.length}>
          {slide.pairs.map((p, i) => (
            <button
              key={p.word}
              type="button"
              className="ad-match-card"
              style={scatter(i)}
              data-done={placed.includes(p.word)}
              data-bad={bad === p.word}
              aria-label={placed.includes(p.word) ? `${p.word}: matched` : `Picture ${i + 1}`}
              onClick={() => target && (p.word === target ? drop(target, p.word) : (setSlip(true), setBad(p.word), wrong(), window.setTimeout(() => setBad(null), 380)))}
            >
              <span className="ad-match-art"><Art art={p.art} size={p.art.type === 'bearer' ? 'sm' : 'md'} /></span>
              <span className="ad-match-slot">{placed.includes(p.word) ? <><Icon name="check" /> {p.word}</> : <i className="ad-match-blank" aria-hidden="true" />}</span>
            </button>
          ))}
        </div>
        {slip && !all && <Feedback kind="try">{NOT_YET} Listen again, then choose the picture.</Feedback>}
        <p className="ad-hint-line">{placed.length} of {slide.pairs.length} matched. Listen, then tap the right picture.</p>
      </Panel>
    );
  }
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-match" data-n={slide.pairs.length}>
        {slide.pairs.map((p, i) => (
          <button
            key={p.word}
            type="button"
            className="ad-match-card"
            style={scatter(i)}
            data-drop={p.word}
            data-done={placed.includes(p.word)}
            data-bad={bad === p.word}
            aria-label={placed.includes(p.word) ? `${p.word}: matched` : 'Picture: drop the word here'}
            onClick={() => held && drop(held, p.word)}
          >
            <span className="ad-match-art"><Art art={p.art} size={p.art.type === 'bearer' ? 'sm' : 'md'} /></span>
            <span className="ad-match-slot">{placed.includes(p.word) ? <><Icon name="check" /> {p.word}</> : <i className="ad-match-blank" aria-hidden="true" />}</span>
          </button>
        ))}
      </div>
      <div className="ad-chips">
        {bank.filter((w) => !placed.includes(w)).map((w) => (
          <button key={w} type="button" className="ad-chip" data-held={held === w} {...drag.bind(w, false)}>{w}</button>
        ))}
        {all && <span className="ad-chips-empty"><Icon name="check" /> All matched!</span>}
      </div>
      {slip && !all && <Feedback kind="try">{NOT_YET} Look at the picture. What does it show?</Feedback>}
      <p className="ad-hint-line">{placed.length} of {slide.pairs.length} matched. Drag a word to its picture (or tap a word, then a picture).</p>
    </Panel>
  );
}
