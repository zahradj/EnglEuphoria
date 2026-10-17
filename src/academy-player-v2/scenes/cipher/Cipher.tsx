// Participle Cipher (borrows Wordle's feedback): a context sentence with a gap, a row of boxes for the participle, an on-screen + real keyboard,
// green / yellow / grey tile flips, unlimited tries, a first-letter hint after three misses. The past simple gets a kind note ("After have we need the participle").
// When it is solved the verb chain slides in and the recorded model plays. The "I knew it / needs more" tick is private and never scored.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sayLine } from '../../services/voice';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { classify, fillGap, keyStates, marksOf, type CipherCard, type Mark } from './cipherLogic';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type { CipherCard } from './cipherLogic';
export interface CipherScene extends SceneBase {
  kind: 'cipher'; title: string; who: CastName;
  /** the briefing (recorded voice) */
  intro: string;
  cards: CipherCard[];
}

const KEYS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
interface Row { guess: string; marks: Mark[] }

function CipherView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<CipherScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [ci, setCi] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [cur, setCur] = useState('');
  const [note, setNote] = useState<{ tone: 'warn' | 'info'; text: string } | null>(null);
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(false);
  const [self, setSelf] = useState<Record<number, 'knew' | 'more'>>({});
  const [wob, setWob] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const slipped = useRef(false);
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);
  const rowEl = useRef<HTMLDivElement>(null);
  const card = scene.cards[ci];
  const len = card.participle.length;
  const hint = misses >= 3;
  const last = ci === scene.cards.length - 1;
  const keys = keyStates(rows);

  useVoiceKey(scene.who, scene.intro, 'intro', artBase);
  useVoiceKey(scene.who, solved ? fillGap(card) : undefined, `s${ci}`, artBase);

  // the first letter is a gift after three misses
  useEffect(() => { if (hint && !solved) setCur((c) => (c.length === 0 ? card.participle[0] : c)); }, [hint, solved, card]);

  const slip = (label: string) => { if (!slipped.current) { slipped.current = true; if (!mistakes.current.includes(label)) mistakes.current.push(label); } };
  const type = useCallback((ch: string) => { if (!solved) setCur((c) => (c.length < len ? c + ch : c)); }, [solved, len]);
  const del = useCallback(() => { if (!solved) setCur((c) => (hint && c.length <= 1 ? c : c.slice(0, -1))); }, [solved, hint]);
  const submit = useCallback(() => {
    if (solved) return;
    if (cur.length < len) {
      // the base form or the past simple is shorter than the participle: it still deserves the kind note (and costs no try)
      const short = classify(cur, card);
      const label = `${card.base} · ${card.past} · ${card.participle}`;
      if (short === 'past') { slip(label); setCur(hint ? card.participle[0] : ''); setNote({ tone: 'warn', text: t('ap.ciPast', 'That is the past simple. After have we need the participle.') }); }
      else if (short === 'base') { slip(label); setCur(hint ? card.participle[0] : ''); setNote({ tone: 'warn', text: t('ap.ciBase', 'That is the base form. After have we need the participle, the third form.') }); }
      else setNote({ tone: 'info', text: t('ap.ciFill', 'Fill all {{n}} boxes first.', { n: len }) });
      setWob((w) => w + 1); popEl(rowEl.current, calm, 'wobble'); actor.flinch(900);
      return;
    }
    const marks = marksOf(cur, card.participle);
    setRows((r) => [...r, { guess: cur, marks }]);
    const kind = classify(cur, card);
    setCur('');
    if (kind === 'right') {
      setSolved(true); setNote(null);
      const clean = !slipped.current && misses < 3;
      setScore((s) => s + (clean ? 10 : 5));
      if (!clean) { const label = `${card.base} · ${card.past} · ${card.participle}`; if (!mistakes.current.includes(label)) mistakes.current.push(label); }
      fx.burstAt(rowEl.current, 'gold'); fx.floatAt(rowEl.current, clean ? '+10' : '+5', 'gold'); actor.cheer(1400);
      if (last) { fx.confetti(); }
      return;
    }
    setMisses((m) => m + 1);
    actor.flinch(900); popEl(rowEl.current, calm, 'wobble');
    if (kind === 'past') { slip(`${card.base} · ${card.past} · ${card.participle}`); setNote({ tone: 'warn', text: t('ap.ciPast', 'That is the past simple. After have we need the participle.') }); }
    else if (kind === 'base') { slip(`${card.base} · ${card.past} · ${card.participle}`); setNote({ tone: 'warn', text: t('ap.ciBase', 'That is the base form. After have we need the participle, the third form.') }); }
    else setNote({ tone: 'info', text: t('ap.ciColours', 'Green is right. Yellow is in the word, in another place. Grey is not in the word.') });
  }, [solved, cur, len, card, misses, hint, last, calm, fx, actor, t]);

  // the real keyboard (ignored while a button or field has focus, so Enter on a button is not doubled)
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && typeof el.closest === 'function' && el.closest('button, input, textarea, select, a')) return;
      if (/^[a-zA-Z]$/.test(e.key)) type(e.key.toLowerCase());
      else if (e.key === 'Backspace') del();
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [type, del, submit]);

  const next = () => {
    if (!solved) return;
    if (last) {
      if (reported.current) return;
      reported.current = true; setFinished(true); actor.hold('happy', 'cheer');
      onDone({ won: true, score, mistakes: mistakes.current });
      return;
    }
    setCi(ci + 1); setRows([]); setCur(''); setNote(null); setMisses(0); setSolved(false); slipped.current = false; actor.hold('thinking');
  };

  const parts = card.sentence.split('___');
  const shown = rows.slice(-2);
  const boxes = Array.from({ length: len }, (_, k) => k);

  return (
    <div className="av-game av-cipher" data-testid="av-cipher" data-solved={solved || undefined} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={solved} tone="gold" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-ci-hud">
          <span className="av-pill av-title-pill">{scene.title} · {ci + 1}/{scene.cards.length}</span>
          <span className="av-pill">{t('ap.ciGuess', 'Guess {{n}}', { n: rows.length + (solved ? 0 : 1) })}</span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>
        <section className="av-panel av-game-card av-ci-card">
          {!finished && (
            <>
              <p className="av-ci-sentence" key={ci}>{parts[0]}<span className="av-ci-gap">{solved ? card.participle : '_'.repeat(Math.min(8, len))}</span>{parts[1]} <small>({card.base})</small></p>

              <div className="av-ci-grid" aria-label={t('ap.ciGrid', 'Your guesses')}>
                {shown.map((r, n) => (
                  <div key={rows.length - shown.length + n} className="av-ci-row" data-old role="group" aria-label={r.guess}>
                    {r.guess.split('').map((ch, k) => <span key={k} className="av-ci-box" data-m={r.marks[k]} style={{ ['--d' as string]: `${k * 110}ms` }}>{ch}</span>)}
                  </div>
                ))}
                {!solved && (
                  <div className="av-ci-row" ref={rowEl} data-wob={wob} data-now role="group" aria-label={t('ap.ciCurrent', 'Type the participle')}>
                    {boxes.map((k) => <span key={k} className="av-ci-box" data-m={cur[k] ? 'typed' : 'empty'} data-hint={(hint && k === 0) || undefined} data-cursor={k === cur.length || undefined}>{cur[k] ?? ''}</span>)}
                  </div>
                )}
                {solved && <div ref={rowEl} />}
              </div>

              {hint && !solved && <p className="av-note av-why" role="status">{t('ap.ciHint', 'Hint: it starts with “{{c}}”.', { c: card.participle[0] })}{card.clue && ` ${card.clue}`}</p>}
              {note && !solved && <p className="av-note av-why" data-tone={note.tone} role="status">{note.text}</p>}

              {solved ? (
                <div className="av-ci-chain" data-testid="av-ci-chain">
                  <span>{card.base}</span><i aria-hidden="true">→</i><span>{card.past}</span><i aria-hidden="true">→</i><b>{card.participle}</b>
                  <button type="button" className="av-rb-say" aria-label={t('ap.listen', 'Listen')} onClick={() => void sayLine({ who: scene.who, text: fillGap(card) }, artBase)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7" /></svg></button>
                </div>
              ) : (
                <div className="av-ci-kb" role="group" aria-label={t('ap.ciKeyboard', 'Keyboard')}>
                  {KEYS.map((rowKeys, r) => (
                    <div key={r} className="av-ci-keyrow">
                      {r === 2 && <button type="button" className="av-ci-key" data-wide onClick={(e) => { e.currentTarget.blur(); submit(); }}>{t('ap.ciEnter', 'Enter')}</button>}
                      {rowKeys.split('').map((ch) => <button key={ch} type="button" className="av-ci-key" data-m={keys[ch]} onClick={(e) => { e.currentTarget.blur(); type(ch); }}>{ch}</button>)}
                      {r === 2 && <button type="button" className="av-ci-key" data-wide aria-label={t('ap.ciDelete', 'Delete')} onClick={(e) => { e.currentTarget.blur(); del(); }}>⌫</button>}
                    </div>
                  ))}
                </div>
              )}

              {solved && (
                <div className="av-ci-after">
                  <div className="av-ci-self" role="group" aria-label={t('ap.ciSelf', 'How did that feel? (only you see this)')}>
                    <button type="button" className="av-flagbtn" aria-pressed={self[ci] === 'knew'} data-on={self[ci] === 'knew' || undefined} onClick={() => setSelf((s) => ({ ...s, [ci]: 'knew' }))}>{t('ap.ciKnew', 'I knew it')}</button>
                    <button type="button" className="av-flagbtn" aria-pressed={self[ci] === 'more'} data-on={self[ci] === 'more' || undefined} onClick={() => setSelf((s) => ({ ...s, [ci]: 'more' }))}>{t('ap.ciMore', 'Needs more')}</button>
                  </div>
                  <button type="button" className="av-btn" data-kind="go" onClick={next}>{last ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button>
                </div>
              )}
            </>
          )}
          {finished && <Reward score={score} stars={starsFor(scene.cards.length - mistakes.current.length, scene.cards.length)} gem={mistakes.current.length === 0} calm={calm} />}
        </section>
      </div>
    </div>
  );
}

export const cipherScene: SceneModule<CipherScene> = {
  view: CipherView,
  spoken: (s) => [{ who: s.who, text: s.intro }, ...s.cards.map((c) => ({ who: s.who, text: fillGap(c) }))],
  validate: (s) => {
    const p: string[] = [];
    if ((s.cards?.length ?? 0) < 3) p.push(`${s.id}: cipher needs 3+ cards`);
    s.cards?.forEach((c, k) => {
      if (!c.sentence.includes('___')) p.push(`${s.id}: card ${k + 1} needs a ___ gap`);
      for (const w of [c.base, c.past, c.participle]) if (!/^[a-z]+$/.test(w)) p.push(`${s.id}: card ${k + 1}: "${w}" must be lowercase letters only`);
      if (c.participle === c.base) p.push(`${s.id}: card ${k + 1}: the participle equals the base form`);
      if (c.participle.length < 3 || c.participle.length > 9) p.push(`${s.id}: card ${k + 1}: the participle needs 3-9 letters`);
    });
    return p;
  },
};
