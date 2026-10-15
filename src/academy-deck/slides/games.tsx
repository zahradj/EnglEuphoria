import { useCallback, useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import type { BossSlide, QuizSlide, RpgSlide, WordleSlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';

/* Video-game mechanics for the B1 lessons. Each is a small loop with a clear goal and a clear reward; none can lose the student's progress (a miss costs a shield, a grey option, a retry). */

/** Break the Clock (boss fight): strike with the right tense; three shields; the clock cracks. */
export function BossView({ slide }: { slide: BossSlide }) {
  const { right, wrong, done, seed } = useDeck();
  const total = slide.rounds.length;
  const [i, setI] = useState(0);
  const [shields, setShields] = useState(3);
  const [hit, setHit] = useState(false);
  const [bad, setBad] = useState<string | null>(null);
  const [slip, setSlip] = useState(false);
  const [recharged, setRecharged] = useState(false);
  const finished = i >= total;
  const r = slide.rounds[i];
  const opts = useMemo(() => (r ? shuffled(r.options, seed + i * 11) : []), [r, seed, i]);
  useEffect(() => { if (finished) done(); }, [finished, done]);
  const pick = (o: string) => {
    if (hit || !r) return;
    if (o === r.answer) { if (!slip) right(); setHit(true); setRecharged(false); }
    else {
      setSlip(true); setBad(o); wrong(); window.setTimeout(() => setBad(null), 420);
      if (shields <= 1) { setShields(3); setRecharged(true); } else setShields(shields - 1);
    }
  };
  const next = () => { setI(i + 1); setHit(false); setSlip(false); setRecharged(false); };
  const [pre, post] = r ? r.frame.split('___') : ['', ''];
  const cracks = Math.min(i + (hit ? 1 : 0), total);
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <div className="ad-boss">
        <div className="ad-boss-clock" data-hit={hit || undefined} data-broken={finished || undefined} role="img" aria-label={`The clock: ${total - cracks} of ${total} hit points left`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" className="ad-clock-face" />
            {Array.from({ length: 12 }, (_, k) => <line key={k} x1="60" y1="10" x2="60" y2={k % 3 === 0 ? 20 : 15} className="ad-clock-tick" transform={`rotate(${k * 30} 60 60)`} />)}
            <line x1="60" y1="60" x2="60" y2="32" className="ad-clock-hand" transform={`rotate(${finished ? 20 : 300} 60 60)`} />
            <line x1="60" y1="60" x2="82" y2="60" className="ad-clock-hand ad-clock-hand-s" />
            {Array.from({ length: cracks }, (_, k) => <path key={k} className="ad-clock-crack" d={['M30 24 L52 52 L44 70', 'M96 36 L72 54 L80 78', 'M24 84 L50 66 L60 96', 'M66 14 L62 44 L88 60', 'M40 100 L58 74 L84 92'][k % 5]} />)}
          </svg>
          <ol className="ad-boss-hp" aria-hidden="true">{slide.rounds.map((_, k) => <li key={k} data-gone={k < cracks} />)}</ol>
        </div>
        <div className="ad-boss-main">
          <ol className="ad-shields" aria-label={`Shields: ${shields} of 3`}>{[0, 1, 2].map((k) => <li key={k} data-on={k < shields} />)}</ol>
          {finished ? <Feedback kind="ok">The clock is broken! You chose the right tense every time it counted.</Feedback> : (
            <>
              <p className="ad-boss-frame" aria-live="polite">{pre}<b data-filled={hit || undefined}>{hit ? r.answer : '  ?  '}</b>{post}</p>
              <div className="ad-boss-opts" role="group" aria-label="Choose the tense">
                {opts.map((o) => <button key={o} type="button" className="ad-pk-tile" data-bad={bad === o} disabled={hit} onClick={() => pick(o)}>{o}</button>)}
              </div>
              {slip && !hit && <Feedback kind="try">{recharged ? 'Shields recharged. Look at the time word, then strike again.' : `${NOT_YET} Look at the time word.`}</Feedback>}
              {hit && <><Feedback kind="ok">Strike! {r.why}</Feedback><div className="ad-row" style={{ justifyContent: 'center' }}><button type="button" className="ad-btn ad-btn-primary" onClick={next}>{i + 1 === total ? 'Break it ▸' : 'Strike again ▸'}</button></div></>}
              <p className="ad-hint-line">Hit {Math.min(i + 1, total)} of {total}. Finished time: past simple. Experience up to now: have + past participle.</p>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

/** Wordle scoring: green = right place, gold = in the word elsewhere, grey = not in the word (duplicates counted once). */
export function scoreGuess(guess: string, answer: string): ('hit' | 'near' | 'miss')[] {
  const res: ('hit' | 'near' | 'miss')[] = Array.from({ length: guess.length }, () => 'miss');
  const left: Record<string, number> = {};
  for (let k = 0; k < answer.length; k++) {
    if (guess[k] === answer[k]) res[k] = 'hit';
    else left[answer[k]] = (left[answer[k]] ?? 0) + 1;
  }
  for (let k = 0; k < guess.length; k++) {
    if (res[k] === 'hit') continue;
    if ((left[guess[k]] ?? 0) > 0) { res[k] = 'near'; left[guess[k]]--; }
  }
  return res;
}
const KEYS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const RANK = { miss: 1, near: 2, hit: 3 } as const;

/** Participle Wordle: six tries per verb. */
export function WordleView({ slide }: { slide: WordleSlide }) {
  const { right, wrong, done } = useDeck();
  const [round, setRound] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [cur, setCur] = useState('');
  const [msg, setMsg] = useState('');
  const finished = round >= slide.rounds.length;
  const r = slide.rounds[round];
  const len = r?.answer.length ?? 0;
  const TRIES = 6;
  const won = !!r && guesses.includes(r.answer);
  const lost = !!r && !won && guesses.length >= TRIES;
  const over = won || lost;
  useEffect(() => { if (finished) done(); }, [finished, done]);
  const key = useCallback((k: string) => {
    if (!r || over) return;
    if (k === 'enter') {
      if (cur.length !== len) { setMsg(`Use ${len} letters.`); return; }
      const g = [...guesses, cur];
      setGuesses(g); setCur(''); setMsg('');
      if (cur === r.answer) right(); else if (g.length >= TRIES) wrong();
    } else if (k === 'back') setCur(cur.slice(0, -1));
    else if (/^[a-z]$/.test(k) && cur.length < len) setCur(cur + k);
  }, [r, over, cur, len, guesses, right, wrong]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA' || e.ctrlKey || e.metaKey) return;
      if (e.key === 'Enter') key('enter'); else if (e.key === 'Backspace') key('back'); else key(e.key.toLowerCase());
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [key]);
  const board = useMemo(() => {
    const st: Record<string, 'hit' | 'near' | 'miss'> = {};
    if (r) guesses.forEach((g) => scoreGuess(g, r.answer).forEach((s, k) => { if (!st[g[k]] || RANK[s] > RANK[st[g[k]]]) st[g[k]] = s; }));
    return st;
  }, [guesses, r]);
  if (finished) return <Panel title={slide.prompt} wide variant="glass"><Feedback kind="ok">All the participles are cracked!</Feedback></Panel>;
  const [pre, post] = r.clue.split('___');
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <div className="ad-wordle">
        <p className="ad-wordle-clue">{pre}<b>{won || lost ? r.answer : '_____'}</b>{post} <small>({r.base})</small></p>
        <div className="ad-wordle-grid" role="grid" aria-label="Your guesses">
          {Array.from({ length: TRIES }, (_, row) => {
            const g = guesses[row];
            const sc = g ? scoreGuess(g, r.answer) : null;
            const text = g ?? (row === guesses.length ? cur : '');
            return (
              <div key={row} className="ad-wordle-row" role="row">
                {Array.from({ length: len }, (_, col) => <span key={col} role="gridcell" className="ad-wordle-cell" data-s={sc ? sc[col] : undefined} data-cur={!g && row === guesses.length && col === cur.length ? true : undefined} aria-label={`${text[col] ?? 'empty'}${sc ? `, ${sc[col]}` : ''}`}>{text[col] ?? ''}</span>)}
              </div>
            );
          })}
        </div>
        {msg && <Feedback kind="try">{msg}</Feedback>}
        {won && <Feedback kind="ok">Yes: {r.base}, {r.answer}. {guesses.length === 1 ? 'First try!' : `Cracked in ${guesses.length}.`}</Feedback>}
        {lost && <Feedback kind="try">It was “{r.answer}”. You will see it again.</Feedback>}
        {over ? (
          <div className="ad-row" style={{ justifyContent: 'center' }}><button type="button" className="ad-btn ad-btn-primary" onClick={() => { setRound(round + 1); setGuesses([]); setCur(''); setMsg(''); }}>{round + 1 === slide.rounds.length ? 'Done ▸' : 'Next word ▸'}</button></div>
        ) : (
          <div className="ad-keys-kb" role="group" aria-label="Keyboard">
            {KEYS.map((row, ri) => (
              <div key={row} className="ad-kb-row">
                {ri === 2 && <button type="button" className="ad-kb ad-kb-wide" onClick={() => key('enter')}>Enter</button>}
                {row.split('').map((c) => <button key={c} type="button" className="ad-kb" data-s={board[c]} onClick={() => key(c)}>{c}</button>)}
                {ri === 2 && <button type="button" className="ad-kb ad-kb-wide" onClick={() => key('back')} aria-label="Delete">⌫</button>}
              </div>
            ))}
          </div>
        )}
        <p className="ad-hint-line">Word {round + 1} of {slide.rounds.length}. Gold = right letter, wrong place. Green = right place.</p>
      </div>
    </Panel>
  );
}

/** Rapport (dialogue RPG): pick the reply that sounds like a person who has done things, then ask about when. */
export function RpgView({ slide }: { slide: RpgSlide }) {
  const { right, wrong, done, speak } = useDeck();
  const [i, setI] = useState(0);
  const [rapport, setRapport] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const finished = i >= slide.scenes.length;
  const sc = slide.scenes[i];
  useEffect(() => { if (finished) done(); else void speak(slide.npc, sc.say); }, [finished, done, speak, slide.npc, sc]);
  const max = slide.scenes.length * 2;
  const choose = (k: number) => {
    if (picked !== null) return;
    const o = sc.options[k];
    setPicked(k); setRapport(rapport + o.score);
    if (o.score > 0) right(); else wrong();
    void speak(slide.npc, o.reply);
  };
  const next = () => { setI(i + 1); setPicked(null); };
  const meter = (
    <div className="ad-rapport" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={rapport} aria-label="Rapport">
      <span>Rapport</span>
      <i style={{ ['--p' as string]: `${(rapport / max) * 100}%` }}><b style={{ left: `${(slide.goal / max) * 100}%` }} aria-hidden="true" /></i>
      <em>{rapport}/{max}</em>
    </div>
  );
  if (finished) return <Panel title={slide.prompt} wide variant="glass">{meter}<Feedback kind="ok">{rapport >= slide.goal ? `${slide.npc} is impressed: that sounded natural. Rapport ${rapport}/${max}.` : `Good talk. Rapport ${rapport}/${max}: try the “I have … / When did you …?” pair next time.`}</Feedback></Panel>;
  const o = picked === null ? null : sc.options[picked];
  return (
    <Panel title={slide.prompt} wide variant="glass">
      {meter}
      <div className="ad-rpg">
        <p className="ad-rpg-npc"><span>{slide.npc}</span>{sc.say}</p>
        <div className="ad-rpg-opts" role="group" aria-label="Your reply">
          {sc.options.map((op, k) => <button key={op.text} type="button" className="ad-pk-tile" data-picked={picked === k || undefined} data-score={picked !== null ? op.score : undefined} disabled={picked !== null} onClick={() => choose(k)}>{op.text}</button>)}
        </div>
        {o && (
          <>
            <p className="ad-rpg-npc ad-rpg-reply"><span>{slide.npc}</span>{o.reply}</p>
            <Feedback kind={o.score > 0 ? 'ok' : 'try'}>{o.note}</Feedback>
            <div className="ad-row" style={{ justifyContent: 'center' }}><button type="button" className="ad-btn ad-btn-primary" onClick={next}>{i + 1 === slide.scenes.length ? 'Finish the chat ▸' : 'Keep talking ▸'}</button></div>
          </>
        )}
      </div>
    </Panel>
  );
}

/** Hot Seat: a ladder of questions with two lifelines (50:50, ask a friend). A wrong answer greys that option; nothing is lost. */
export function QuizView({ slide }: { slide: QuizSlide }) {
  const { right, wrong, done, seed } = useDeck();
  const [i, setI] = useState(0);
  const [gone, setGone] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [fifty, setFifty] = useState(false);
  const [ask, setAsk] = useState(false);
  const [asked, setAsked] = useState(false);
  const total = slide.questions.length;
  const finished = i >= total;
  const q = slide.questions[i];
  const opts = useMemo(() => (q ? shuffled(q.options, seed + i * 13) : []), [q, seed, i]);
  useEffect(() => { if (finished) done(); }, [finished, done]);
  const useFifty = () => { if (fifty || solved) return; setFifty(true); setGone(shuffled(q.options.filter((o) => o !== q.answer), seed + i).slice(0, 2)); };
  const useAsk = () => { if (ask || solved) return; setAsk(true); setAsked(true); };
  const pick = (o: string) => {
    if (solved) return;
    if (o === q.answer) { if (bad.length === 0) right(); setSolved(true); } else { setBad([...bad, o]); wrong(); }
  };
  const next = () => { setI(i + 1); setGone([]); setBad([]); setSolved(false); setAsked(false); };
  const ladder = (
    <ol className="ad-ladder" aria-label={`Question ${Math.min(i + 1, total)} of ${total}`}>
      {Array.from({ length: total }, (_, k) => total - 1 - k).map((k) => <li key={k} data-done={k < i} data-now={k === i} data-mark={(k + 1) % 3 === 0 || k + 1 === total}><i>{k + 1}</i></li>)}
    </ol>
  );
  if (finished) return <Panel title={slide.prompt} wide variant="glass"><div className="ad-hot">{ladder}<Feedback kind="ok">You reached the top of the ladder!</Feedback></div></Panel>;
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <div className="ad-hot">
        {ladder}
        <div className="ad-hot-main">
          <div className="ad-lifelines" role="group" aria-label="Lifelines">
            <button type="button" className="ad-btn ad-btn-small" disabled={fifty || solved} onClick={useFifty}>50 : 50</button>
            <button type="button" className="ad-btn ad-btn-small" disabled={ask || solved} onClick={useAsk}>Ask {slide.friend}</button>
          </div>
          <h3 className="ad-hot-q">{q.q}</h3>
          <div className="ad-hot-opts" role="group" aria-label="Answers">
            {opts.map((o, k) => <button key={o} type="button" className="ad-pk-tile" data-bad={bad.includes(o) || undefined} data-ok={solved && o === q.answer ? true : undefined} disabled={solved || gone.includes(o) || bad.includes(o)} style={gone.includes(o) ? { visibility: 'hidden' } : undefined} onClick={() => pick(o)}><b>{'ABCD'[k]}</b> {o}</button>)}
          </div>
          {asked && !solved && <Feedback kind="ok">{slide.friend}: {q.hint}</Feedback>}
          {bad.length > 0 && !solved && <Feedback kind="try">{NOT_YET} Read the question again.</Feedback>}
          {solved && <><Feedback kind="ok">{q.why}</Feedback><div className="ad-row" style={{ justifyContent: 'center' }}><button type="button" className="ad-btn ad-btn-primary" onClick={next}>{i + 1 === total ? 'To the top ▸' : 'Next question ▸'}</button></div></>}
        </div>
      </div>
    </Panel>
  );
}
