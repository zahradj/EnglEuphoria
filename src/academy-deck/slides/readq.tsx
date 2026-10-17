import { useMemo, useState, useEffect } from 'react';
import { shuffled, useDeck } from '../ctx';
import type { ReadQSlide } from '../types';
import { Panel, Feedback, NOT_YET } from './shared';

const KIND: Record<ReadQSlide['questions'][number]['type'], string> = { gist: 'Main idea', detail: 'Detail', inference: 'Read between the lines', word: 'Word in context' };

/** Reading questions: the text stays on screen; one question at a time; a wrong choice says Not yet and nothing is lost; the right one shows why. */
export function ReadQView({ slide }: { slide: ReadQSlide }) {
  const { right, wrong, done, seed } = useDeck();
  const [i, setI] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const [slip, setSlip] = useState(false);
  const [solved, setSolved] = useState(false);
  const finished = i >= slide.questions.length;
  const q = slide.questions[i];
  const opts = useMemo(() => (q ? shuffled(q.options, seed + i * 7) : []), [q, seed, i]);
  useEffect(() => { if (finished) done(); }, [finished, done]);
  if (finished) return <Panel title={slide.prompt} wide variant="glass"><Feedback kind="ok">All {slide.questions.length} questions answered!</Feedback></Panel>;
  const pick = (o: string) => {
    if (solved) return;
    if (o === q.answer) { if (!slip) right(); setSolved(true); } else { setSlip(true); setBad(o); wrong(); window.setTimeout(() => setBad(null), 380); }
  };
  const next = () => { setI(i + 1); setSlip(false); setSolved(false); };
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <div className="ad-readq"><article className="ad-readq-text" aria-label={slide.title}>
        <h3>{slide.title} <small>by {slide.from}</small></h3>
        {slide.paragraphs.map((p, k) => <p key={k}>{p}</p>)}
      </article>
      <div className="ad-readq-q" role="group" aria-label={`Question ${i + 1}`}>
        <span className="ad-readq-kind">{KIND[q.type]} · {i + 1} of {slide.questions.length}</span>
        <p className="ad-readq-ask">{q.q}</p>
        {opts.map((o) => <button key={o} type="button" className="ad-readq-opt" data-bad={bad === o} data-ok={solved && o === q.answer} disabled={solved} onClick={() => pick(o)}>{o}</button>)}
        {slip && !solved && <Feedback kind="try">{NOT_YET} Find the sentence in the text.</Feedback>}
        {solved && <><Feedback kind="ok">{q.why}</Feedback><div className="ad-row" style={{ justifyContent: 'center' }}><button type="button" className="ad-btn ad-btn-primary" onClick={next}>{i + 1 === slide.questions.length ? 'Done' : 'Next'} ▸</button></div></>}
      </div>
      </div>
    </Panel>
  );
}
