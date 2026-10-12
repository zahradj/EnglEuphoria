import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { Icon } from '../Icon';
import { Hear } from '../Hear';
import type { BePickSlide, BuildSlide, CastName, FactCheckSlide, Slide, WriteSlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';
import { Art } from './teach';
import { Flag } from '../../academy-player/drawn';

const lead = (s: Slide): CastName => s.actors?.[0]?.who ?? 'Vee';

/** The student's sentence, tidied for checking: curly quotes, spaces, case. */
export const normaliseSentence = (t: string): string => t.replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

/** Pick am / is / are. The blank sits in statements, negatives and questions, so the choice follows the subject, not the place in the line. */
export function BePickView({ slide }: { slide: BePickSlide }) {
  const { right, wrong, done, speak, seed, award } = useDeck();
  const [i, setI] = useState(0);
  const [gotIt, setGotIt] = useState(false);
  const [tried, setTried] = useState<string[]>([]);
  const r = slide.rounds[i];
  const order = useMemo(() => shuffled(['am', 'is', 'are'], seed + i), [seed, i]);
  const full = r.frame.replace('___', r.answer);
  const pick = (w: string) => {
    if (gotIt) return;
    if (w === r.answer) {
      setGotIt(true);
      if (!tried.length) right();
      void speak(lead(slide), full.charAt(0).toUpperCase() + full.slice(1));
    } else {
      setTried([...tried, w]);
      wrong();
    }
  };
  const nextRound = () => {
    if (i + 1 >= slide.rounds.length) return done();
    setI(i + 1);
    setGotIt(false);
    setTried([]);
  };
  useEffect(() => {
    if (gotIt && i + 1 >= slide.rounds.length) {
      if (slide.stamp) award(slide.stamp);
      done();
    }
  }, [gotIt, i, slide.rounds.length, done, award, slide.stamp]);
  const [before, after] = r.frame.split('___');
  return (
    <Panel title={slide.prompt}>
      <div className="ad-be" data-got={gotIt}>
        <div className="ad-be-who"><Art art={r.who} size="sm" key={i} /></div>
        <p className="ad-be-line" aria-live="polite">
          <span>{before}</span>
          <span className="ad-be-blank" data-filled={gotIt}>{gotIt ? (before.trim() === '' ? r.answer.charAt(0).toUpperCase() + r.answer.slice(1) : r.answer) : '?'}</span>
          <span>{after}</span>
          {gotIt && <Hear who={lead(slide)} text={full.charAt(0).toUpperCase() + full.slice(1)} />}
        </p>
        <div className="ad-be-opts" role="group" aria-label="Choose am, is or are">
          {order.map((w) => (
            <button key={w} type="button" className="ad-be-btn" disabled={gotIt || tried.includes(w)} data-bad={tried.includes(w)} data-w={w} onClick={() => pick(w)}>{w}</button>
          ))}
        </div>
      </div>
      {tried.length > 0 && !gotIt && <Feedback kind="try">{NOT_YET} {r.why}</Feedback>}
      {gotIt && <Feedback kind="ok">{r.why}</Feedback>}
      <div className="ad-row">
        <span className="ad-hint-line">{i + 1} of {slide.rounds.length}</span>
        <button type="button" className="ad-btn ad-btn-primary" disabled={!gotIt} onClick={nextRound}>{i + 1 >= slide.rounds.length ? 'Finish ▸' : 'Next sentence ▸'}</button>
      </div>
    </Panel>
  );
}

/** Build a sentence from word tiles. The tiles are the words; the distractors are the wrong forms (He are, I is …). */
export function BuildView({ slide }: { slide: BuildSlide }) {
  const { right, wrong, done, speak, seed, award } = useDeck();
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const [slip, setSlip] = useState(false);
  const [finished, setFinished] = useState(false);
  const r = slide.rounds[i];
  const words = useMemo(() => r.target.split(' '), [r.target]);
  const tiles = useMemo(() => shuffled([...words, ...(r.extra ?? [])].map((w, k) => ({ w, id: k })), seed + i), [words, r.extra, seed, i]);
  const complete = placed.length >= words.length;
  const place = (id: number) => {
    if (complete) return;
    const t = tiles.find((x) => x.id === id);
    if (!t) return;
    if (t.w === words[placed.length]) {
      const next = [...placed, id];
      setPlaced(next);
      if (!slip) right();
      setSlip(false);
      if (next.length === words.length) void speak(lead(slide), r.target);
    } else {
      setBad(id);
      setSlip(true);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  useEffect(() => {
    if (complete && i + 1 >= slide.rounds.length && !finished) {
      setFinished(true);
      if (slide.stamp) award(slide.stamp);
      done();
    }
  }, [complete, i, slide.rounds.length, finished, done, award, slide.stamp]);
  const nextRound = () => {
    setI(i + 1);
    setPlaced([]);
    setSlip(false);
  };
  return (
    <Panel title={slide.prompt}>
      <div className="ad-build" data-done={complete}>
        <p className="ad-build-cue"><Icon name="search" /> {r.cue}</p>
        <div className="ad-build-line" aria-label="Your sentence" aria-live="polite">
          {words.map((w, k) => (
            <span key={k} className="ad-build-slot" data-filled={k < placed.length} data-next={k === placed.length && !complete}>{k < placed.length ? w : ''}</span>
          ))}
          {complete && <Hear who={lead(slide)} text={r.target} />}
        </div>
        <div className="ad-chips">
          {tiles.map((t) => (
            <button key={t.id} type="button" className="ad-chip ad-build-tile" disabled={placed.includes(t.id)} data-bad={bad === t.id} onClick={() => place(t.id)}>{t.w}</button>
          ))}
        </div>
      </div>
      {slip && !complete && <Feedback kind="try">{NOT_YET} {r.hint ?? 'Which word comes next? Check am, is or are for this person.'}</Feedback>}
      {complete && <Feedback kind="ok">{r.target} Say it out loud!</Feedback>}
      <div className="ad-row">
        <span className="ad-hint-line">{i + 1} of {slide.rounds.length}</span>
        {i + 1 < slide.rounds.length && <button type="button" className="ad-btn ad-btn-primary" disabled={!complete} onClick={nextRound}>Next sentence ▸</button>}
      </div>
    </Panel>
  );
}

/** Detective: is this sentence about the profile true? If not, which sentence fixes it? */
export function FactCheckView({ slide }: { slide: FactCheckSlide }) {
  const { right, wrong, done, award } = useDeck();
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<'judge' | 'fix' | 'next'>('judge');
  const [slip, setSlip] = useState('');
  const [log, setLog] = useState<{ text: string; fact: boolean }[]>([]);
  const c = slide.claims[i];
  const p = slide.profile;
  const judge = (says: boolean) => {
    if (says === c.fact) {
      setSlip('');
      right();
      if (c.fact) {
        setLog([...log, { text: c.text, fact: true }]);
        setStage('next');
      } else setStage('fix');
    } else {
      setSlip(c.fact ? 'Look at the card again: this sentence is true.' : 'Look at the card again: the card says something different.');
      wrong();
    }
  };
  const fix = (ok: boolean | undefined, hint?: string) => {
    if (ok) {
      setSlip('');
      right();
      setLog([...log, { text: c.text, fact: false }]);
      setStage('next');
    } else {
      setSlip(hint ?? 'That sentence is not true either. Check the card.');
      wrong();
    }
  };
  const advance = () => {
    if (i + 1 >= slide.claims.length) {
      award(slide.stamp ?? 'true');
      return done();
    }
    setI(i + 1);
    setStage('judge');
    setSlip('');
  };
  return (
    <Panel title={slide.prompt}>
      <div className="ad-fc">
        <div className="ad-fc-card" role="group" aria-label={`Profile card: ${p.name}`}>
          <span className="ad-fc-flag"><Flag code={p.flag} label={`Flag of ${p.from}`} /></span>
          <dl>
            <div><dt>Name</dt><dd>{p.name}</dd></div>
            <div><dt>Age</dt><dd>{p.age}</dd></div>
            <div><dt>From</dt><dd>{p.from}</dd></div>
            <div><dt>Nationality</dt><dd>{p.nationality}</dd></div>
          </dl>
        </div>
        <div className="ad-fc-main">
          <p className="ad-fc-claim" key={i}><span className="ad-fc-q">The fake profile says:</span> “{c.text}”</p>
          {stage === 'judge' && (
            <div className="ad-fc-opts">
              <button type="button" className="ad-fc-btn" data-t="yes" onClick={() => judge(true)}><Icon name="check" /> True</button>
              <button type="button" className="ad-fc-btn" data-t="no" onClick={() => judge(false)}>Not true</button>
            </div>
          )}
          {stage === 'fix' && (
            <div className="ad-fc-fix">
              <p className="ad-hint-line">Not true! Which sentence is right?</p>
              {c.fixes?.map((f) => <button key={f.text} type="button" className="ad-btn" onClick={() => fix(f.ok, f.hint)}>{f.text}</button>)}
            </div>
          )}
          {stage === 'next' && (
            <div className="ad-fc-next">
              <Feedback kind="ok">{c.fact ? 'True. ' : 'Found a lie! '}{c.fact ? c.text : c.fixes?.find((f) => f.ok)?.text}</Feedback>
              <button type="button" className="ad-btn ad-btn-primary" onClick={advance}>{i + 1 >= slide.claims.length ? 'Case closed ▸' : 'Next sentence ▸'}</button>
            </div>
          )}
          {slip && <Feedback kind="try">{NOT_YET} {slip}</Feedback>}
        </div>
      </div>
      <ul className="ad-fc-log" aria-label="Sentences checked">
        {slide.claims.map((cl, k) => <li key={k} data-state={k < log.length ? (log[k].fact ? 'true' : 'lie') : k === i ? 'now' : 'wait'}>{k < log.length ? (log[k].fact ? 'True' : 'Not true') : k + 1}</li>)}
      </ul>
    </Panel>
  );
}

/** Writing with the pattern: type a sentence for each row; the model stays hidden until "Show me". */
export function WriteView({ slide }: { slide: WriteSlide }) {
  const { done, setVars, right, wrong, award } = useDeck();
  const [text, setText] = useState<string[]>(() => slide.rows.map(() => ''));
  const [ok, setOk] = useState<(boolean | null)[]>(() => slide.rows.map(() => null));
  const [peek, setPeek] = useState(false);
  const [checks, setChecks] = useState(0);
  const check = () => {
    const res = slide.rows.map((r, k) => {
      const t = normaliseSentence(text[k]);
      return !!t && r.accept.some((a) => new RegExp(a, 'i').test(t));
    });
    setOk(res);
    setChecks(checks + 1);
    if (res.every(Boolean)) {
      right();
      setVars({ exitPeeked: String(peek), exitText: text.join(' | ') });
      if (slide.stamp) award(slide.stamp);
      done();
    } else wrong();
  };
  const all = ok.every((x) => x === true);
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-write">
        {slide.rows.map((r, k) => (
          <div key={k} className="ad-write-row" data-ok={ok[k]}>
            <label htmlFor={`w-${slide.id}-${k}`}><b>{k + 1}.</b> {r.label}</label>
            <input
              id={`w-${slide.id}-${k}`}
              className="ad-input"
              value={text[k]}
              placeholder={r.frame}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => { const t = [...text]; t[k] = e.target.value; setText(t); const o = [...ok]; o[k] = null; setOk(o); }}
            />
            {ok[k] === true && <span className="ad-write-mark"><Icon name="check" /></span>}
            {ok[k] === false && <p className="ad-write-hint">{NOT_YET} {r.hint}</p>}
            {peek && <p className="ad-write-sample">Model: {r.sample}</p>}
          </div>
        ))}
      </div>
      {all && <Feedback kind="ok">All {slide.rows.length} sentences are right! Read your sentences out loud to your teacher.</Feedback>}
      {checks > 0 && !all && <p className="ad-hint-line">Fix the lines with a hint, then press Check again.</p>}
      <div className="ad-row">
        {!peek && <button type="button" className="ad-btn" onClick={() => setPeek(true)}>Show me</button>}
        <button type="button" className="ad-btn ad-btn-primary" onClick={check} disabled={text.some((t) => !t.trim()) || all}>Check my sentences</button>
      </div>
    </Panel>
  );
}
