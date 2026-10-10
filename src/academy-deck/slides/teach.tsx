import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useDeck } from '../ctx';
import { COLOR, Bubble } from '../Stage';
import type { ModelSlide, TeachArt, TeachSlide } from '../types';
import { Traveller, WavingFlag } from './anim';
import { Panel } from './shared';

/** The animated picture for a word. `again` restarts the animation. */
function Art({ art, again }: { art: TeachArt; again: number }) {
  if (art.type === 'count') {
    return (
      <div className="ad-art ad-art-count" key={again} aria-label={`The number ${art.n}`} role="img">
        <div className="ad-count-dots">
          {Array.from({ length: art.n }, (_, i) => (
            <span key={i} className="ad-count-dot" style={{ ['--i' as string]: i }}><b>{i + 1}</b></span>
          ))}
        </div>
        <div className="ad-count-digit" style={{ ['--n' as string]: art.n }}>{art.n}</div>
      </div>
    );
  }
  if (art.type === 'flag') {
    return (
      <div className="ad-art ad-art-flag" key={again}>
        <div className="ad-flagpole"><WavingFlag code={art.code} label={`Flag of ${art.code}`} /></div>
        <span className="ad-pin" aria-hidden="true">📍</span>
      </div>
    );
  }
  if (art.type === 'person') {
    return <div className="ad-art ad-art-person" key={again}><Traveller code={art.code} label="A person with the flag of their country" /></div>;
  }
  if (art.type === 'letters') {
    return (
      <div className="ad-art ad-art-letters" key={again} role="img" aria-label={`Letters: ${art.text.split('').join(' ')}`}>
        {art.text.toUpperCase().split('').map((l, i) => (
          <span key={i} className="ad-wood" style={{ ['--i' as string]: i }}>{l}</span>
        ))}
      </div>
    );
  }
  return <div className="ad-art ad-art-phrase" key={again} role="img" aria-label="Picture"><span>{art.icon}</span></div>;
}

const hi = (text: string, word: string): ReactNode => {
  const parts = text.split(new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'));
  return parts.map((p, i) => (p.toLowerCase() === word.toLowerCase() ? <mark key={i}>{p}</mark> : p));
};

/** Vocabulary illustration: one animated page per word, with its meaning, an example and a clue. Meet every word before any game uses it. */
export function TeachView({ slide }: { slide: TeachSlide }) {
  const { done } = useDeck();
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const [again, setAgain] = useState(0);
  const page = slide.pages[i];
  useEffect(() => {
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
  }, [i]);
  useEffect(() => {
    if (seen.length === slide.pages.length) done();
  }, [seen, slide.pages.length, done]);
  const go = (k: number) => {
    setI(k);
    setAgain(0);
  };
  return (
    <Panel title={slide.title} wide>
      <div className="ad-teach">
        <div className="ad-teach-art"><Art art={page.art} again={again + i * 1000} /></div>
        <div className="ad-teach-body" key={i}>
          <span className="ad-teach-count">{i + 1} / {slide.pages.length}</span>
          <h3 className="ad-teach-word">{page.word}</h3>
          <p className="ad-teach-meaning">{page.meaning}</p>
          <p className="ad-teach-example">{hi(page.example, page.word)}</p>
          {page.clue && <p className="ad-teach-clue"><span aria-hidden="true">💡 </span>{page.clue}</p>}
          <button type="button" className="ad-btn ad-btn-small" onClick={() => setAgain(again + 1)}>▶ Show again</button>
        </div>
      </div>
      <div className="ad-row ad-teach-nav">
        <button type="button" className="ad-btn" disabled={i === 0} onClick={() => go(i - 1)}>◂ Back</button>
        <span className="ad-teach-dots" aria-hidden="true">{slide.pages.map((_, k) => <i key={k} data-now={k === i} data-seen={seen.includes(k)} />)}</span>
        <button type="button" className="ad-btn ad-btn-primary" disabled={i === slide.pages.length - 1} onClick={() => go(i + 1)}>Another word ▸</button>
      </div>
    </Panel>
  );
}

/** Modelling: watch the characters do it. Each line shows its pattern card: the frame stays, the coloured part changes. */
export function ModelView({ slide }: { slide: ModelSlide }) {
  const { done } = useDeck();
  const [n, setN] = useState(1);
  const line = slide.lines[n - 1];
  const finished = n >= slide.lines.length;
  useEffect(() => {
    if (finished) done();
  }, [finished, done]);
  const slotColors = ['#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
  const slotIndex: Record<string, number> = {};
  slide.lines.forEach((l) => l.frame?.forEach((p) => typeof p !== 'string' && !(p.label in slotIndex) && (slotIndex[p.label] = Object.keys(slotIndex).length)));
  return (
    <Panel title={slide.title} wide>
      <div className="ad-model-log" aria-live="polite">
        {slide.lines.slice(0, n - 1).map((l, i) => (
          <p key={i} className="ad-line" data-me={l.who === 'Ava'} style={{ ['--who' as string]: COLOR[l.who] }}><b>{l.who}</b> {l.text}</p>
        ))}
      </div>
      <Bubble who={line.who} side={line.who === 'Ava' ? 'left' : 'right'}>{line.text}</Bubble>
      {line.frame && (
        <div className="ad-pattern" key={n} aria-label="Pattern card">
          <span className="ad-pattern-tag">Pattern</span>
          {line.frame.map((p, i) =>
            typeof p === 'string' ? (
              <span key={i} className="ad-pattern-text">{p}</span>
            ) : (
              <span key={i} className="ad-slotchip" style={{ ['--c' as string]: slotColors[slotIndex[p.label] % slotColors.length] }}><b>{p.slot}</b><i>{p.label}</i></span>
            ),
          )}
        </div>
      )}
      {line.note && <p className="ad-teach-clue"><span aria-hidden="true">💡 </span>{line.note}</p>}
      <div className="ad-row">
        {finished ? <span className="ad-feedback ad-feedback-ok">✅ {slide.closing}</span> : <button type="button" className="ad-btn ad-btn-primary" onClick={() => setN(n + 1)}>Watch next ▸</button>}
      </div>
    </Panel>
  );
}
