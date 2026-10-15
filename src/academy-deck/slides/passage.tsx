import { useState } from 'react';
import { useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { PassageSlide } from '../types';
import { Panel } from './shared';

const words = (line: string): string[] => line.split(/\s+/).filter(Boolean);
const bare = (w: string): string => w.toLowerCase().replace(/[^a-z']/g, '');

/** Passage: listen, read it yourself, keep the words you want. Nothing here can be wrong: the student chooses their own word bank. */
export function PassageView({ slide }: { slide: PassageSlide }) {
  const { speak, speakSeq, setVars, done, right } = useDeck();
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [kept, setKept] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const need = slide.keep ?? 3;
  const toggle = (w: string) => setKept((k) => (k.includes(w) ? k.filter((x) => x !== w) : [...k, w]));
  const add = () => {
    setVars({ [slide.bank]: kept.join(',') });
    setAdded(true);
    right();
    done();
  };
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <ol className="ad-steps" aria-label="Steps">
        {['Listen', 'Read it', 'Keep words'].map((t, i) => <li key={t} data-now={stage === i} data-done={stage > i}>{i + 1}. {t}</li>)}
      </ol>
      <div className="ad-passage" role="group" aria-label={`Message from ${slide.from}`}>
        <span className="ad-passage-from">{slide.from}</span>
        {slide.lines.map((line, li) => (
          <p key={li} className="ad-passage-line">
            {words(line).map((w, wi) => (
              <button key={wi} type="button" className="ad-pw" onClick={() => void speak(slide.from, bare(w))} aria-label={`Hear ${bare(w)}`}>{w}</button>
            ))}
          </p>
        ))}
      </div>
      {stage === 0 && (
        <div className="ad-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="ad-btn" onClick={() => void speakSeq(slide.lines.map((t) => ({ who: slide.from, text: t })))}><Icon name="speaker" /> Listen to the message</button>
          <button type="button" className="ad-btn ad-btn-primary" onClick={() => setStage(1)}>Now I read it ▸</button>
        </div>
      )}
      {stage === 1 && (
        <div className="ad-row" style={{ justifyContent: 'center' }}>
          <p className="ad-hint-line">Read it yourself. Tap any word to hear it.</p>
          <button type="button" className="ad-btn ad-btn-primary" onClick={() => setStage(2)}>I read it ✓</button>
        </div>
      )}
      {stage === 2 && !added && (
        <>
          <p className="ad-hint-line">Keep {need} or more words for your word bank. Tap the words you want to remember.</p>
          <div className="ad-keepchips" role="group" aria-label="Words to keep">
            {slide.keepFrom.map((w) => <button key={w} type="button" className="ad-keepchip" data-on={kept.includes(w)} aria-pressed={kept.includes(w)} onClick={() => toggle(w)}>{w}</button>)}
          </div>
          <div className="ad-row" style={{ justifyContent: 'center' }}>
            <button type="button" className="ad-btn ad-btn-primary" disabled={kept.length < need} onClick={add}>Add to my word bank ({kept.length})</button>
          </div>
        </>
      )}
      {added && <p className="ad-feedback ad-feedback-ok" role="status"><Icon name="check" /> Word bank: {kept.join(', ')}</p>}
    </Panel>
  );
}
