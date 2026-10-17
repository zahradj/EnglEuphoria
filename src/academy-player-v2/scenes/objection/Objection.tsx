// Objection (cross-examination; borrows Ace Attorney's press and present): a witness gives a short testimony, one line at a time, in a recorded voice.
// PRESS a line and build the follow-up question from chips ("When did you go?"); PRESENT a dated evidence card on the line that clashes, then repair the line.
// Gentle by design (comfort): no health bar, no penalty; a wrong card is answered with fiction feedback ("That line has no date yet…"), never a buzzer.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { shuffleSeed, useVoiceKey } from '../wave1Kit';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface ObjectionLine {
  text: string;
  /** upToNow: an experience with no date (press it and ask when); finished: has its date and is fine; clash: contradicts a piece of evidence */
  kind: 'upToNow' | 'finished' | 'clash';
  /** pressing builds a follow-up question from these words (in order); `extra` words are decoys */
  press?: { chips: string[]; extra?: string[]; reply: string; hint?: string };
  /** pressing a line with no question: what the witness says */
  pressReply?: string;
  /** the evidence card that clashes with this line (kind clash) */
  evidenceId?: string;
  /** the repair of a clashing line: three options, the index of the right one */
  fix?: { options: string[]; correct: number };
  /** why the line is fine (shown when a card is wrongly presented) or why the repair is right */
  why: string;
}
export interface Evidence { id: string; label: string; date: string; kind?: 'ticket' | 'photo' | 'receipt' }
export interface ObjectionScene extends SceneBase {
  kind: 'objection'; title: string; witness: CastName; chief: CastName;
  /** the chief's briefing (recorded voice) */
  intro: string;
  lines: ObjectionLine[];
  evidence: Evidence[];
  /** the evidence unlocks after this many good follow-up questions (default 1) */
  minPress?: number;
}

type Phase = 'hear' | 'press' | 'present' | 'repair' | 'closing' | 'done';

function ObjectionView({ scene, onDone, artBase, calm, seed, fx: fxIn }: SceneProps<ObjectionScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('neutral');
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>('hear');
  const [pressed, setPressed] = useState<number[]>([]);
  const [built, setBuilt] = useState<number[]>([]);
  const [wob, setWob] = useState(0);
  const [msg, setMsg] = useState<{ tone: 'info' | 'warn' | 'good'; text: string } | null>(null);
  const [said, setSaid] = useState<{ n: number; text: string } | null>(null);
  const [solved, setSolved] = useState<number[]>([]);
  const [banner, setBanner] = useState(false);
  const [badFix, setBadFix] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);
  const cardEl = useRef<HTMLElement>(null);
  const evEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const line = scene.lines[i];
  const clashes = scene.lines.map((l, k) => (l.kind === 'clash' ? k : -1)).filter((k) => k >= 0);
  const minPress = scene.minPress ?? 1;
  const goodPresses = pressed.filter((k) => !!scene.lines[k].press).length;
  const unlocked = goodPresses >= minPress;
  const pool = useMemo(() => (line.press ? shuffleSeed([...line.press.chips, ...(line.press.extra ?? [])].map((w, n) => ({ w, n })), seed + i) : []), [line, seed, i]);
  const options = useMemo(() => (line.fix ? shuffleSeed(line.fix.options.map((o, n) => ({ o, n })), seed + i + 3) : []), [line, seed, i]);

  // the chief's briefing, then each statement in the witness's own voice
  useVoiceKey(scene.chief, scene.intro, 'intro', artBase);
  useVoiceKey(scene.witness, phase === 'hear' && said === null ? line.text : undefined, `l${i}`, artBase);
  useVoiceKey(scene.witness, said?.text, `s${said?.n ?? 0}`, artBase);
  useEffect(() => { if (!banner) return; const id = window.setTimeout(() => setBanner(false), calm ? 900 : 1500); return () => window.clearTimeout(id); }, [banner, calm]);

  const note = (label: string) => { if (!mistakes.current.includes(label)) mistakes.current.push(label); };
  const go = (d: number) => { setI((k) => (k + d + scene.lines.length) % scene.lines.length); setMsg(null); setSaid(null); setPhase('hear'); setBuilt([]); actor.hold('neutral'); };

  const startPress = () => {
    if (phase !== 'hear') return;
    setMsg(null);
    if (line.press) { setBuilt([]); setPhase('press'); actor.hold('curious'); return; }
    const text = line.pressReply ?? t('ap.obPressNone', 'That is what I said.');
    setSaid({ n: Date.now(), text }); setMsg({ tone: 'info', text: t('ap.obNothingNew', 'Nothing new on that line.') }); actor.surprise(900);
  };
  const tapChip = (n: number) => {
    if (phase !== 'press' || !line.press || built.includes(n)) return;
    const next = [...built, n];
    setBuilt(next);
    if (next.length === line.press.chips.length) {
      const words = next.map((k) => pool.find((p) => p.n === k)!.w);
      if (words.join(' ') === line.press.chips.join(' ')) {
        const first = !pressed.includes(i);
        if (first) { setScore((s) => s + 10); setPressed((p) => [...p, i]); }
        setSaid({ n: Date.now(), text: line.press.reply }); setMsg(null); setPhase('hear');
        fx.burstAt(cardEl.current, 'teal'); fx.floatAt(cardEl.current, first ? '+10' : '✓', 'teal'); popEl(cardEl.current, calm, 'pop'); actor.surprise(1400);
      } else {
        setWob((w) => w + 1); popEl(cardEl.current, calm, 'wobble'); setMsg({ tone: 'warn', text: line.press.hint ?? t('ap.obWrongQ', 'Not quite. Put the words in the order of a question.') }); setBuilt([]);
      }
    }
  };
  const unbuild = (n: number) => { if (phase === 'press') setBuilt((b) => b.filter((k) => k !== n)); };

  const openPresent = () => { if (phase === 'hear' && unlocked) { setPhase('present'); setMsg(null); } };
  const present = (id: string) => {
    if (phase !== 'present') return;
    const ev = scene.evidence.find((e) => e.id === id)!;
    if (line.kind === 'clash' && line.evidenceId === id && !solved.includes(i)) {
      setBanner(true); fx.shake('soft'); fx.burstAt(evEls.current[id], 'coral'); actor.hold('concerned', 'flinch');
      setMsg({ tone: 'good', text: t('ap.obClash', '“{{label}}” is dated {{date}}. That clashes with the line.', { label: ev.label, date: ev.date }) });
      setScore((s) => s + 20); setPhase('repair'); setBadFix([]);
      return;
    }
    popEl(evEls.current[id], calm, 'wobble'); actor.hold('thinking');
    note(line.text);
    setMsg({ tone: 'warn', text: line.kind === 'upToNow' && !pressed.includes(i) ? t('ap.obNoDate', 'That line has no date yet. Press it first and ask when.') : line.kind === 'clash' ? t('ap.obWrongCard', 'That card does not clash with this line. Check the dates.') : `${t('ap.obNoClash', '“{{label}}” does not clash with this line.', { label: ev.label })} ${line.why}` });
    setPhase('hear');
  };
  const repair = (n: number) => {
    if (phase !== 'repair' || !line.fix) return;
    if (n === line.fix.correct) {
      const left = clashes.filter((k) => k !== i && !solved.includes(k));
      setSolved((s) => [...s, i]); setScore((s) => s + 10);
      fx.burstAt(cardEl.current, 'gold'); fx.floatAt(cardEl.current, '+10', 'gold'); popEl(cardEl.current, calm, 'pop'); actor.hold('thinking');
      setMsg({ tone: 'good', text: line.why });
      if (left.length === 0) setPhase('closing'); else setPhase('hear');
    } else {
      setBadFix((b) => [...b, n]); popEl(cardEl.current, calm, 'wobble'); note(line.fix.options[n]);
      setMsg({ tone: 'warn', text: t('ap.obRepairNo', 'Not yet. Look at the date on the card: is the time finished, or is it up to now?') });
    }
  };
  const close = () => {
    if (reported.current) return;
    reported.current = true; setPhase('done'); fx.confetti(); actor.hold('happy', 'cheer');
    onDone({ won: true, score, mistakes: mistakes.current });
  };

  const solvedLine = (k: number) => solved.includes(k);
  const shown = solvedLine(i) && line.fix ? line.fix.options[line.fix.correct] : line.text;
  const ev0 = scene.evidence.find((e) => e.id === scene.lines[clashes[0]]?.evidenceId);
  const finalLine = scene.lines[clashes[0]];
  const tone = (n: number) => (n % 3 === 0 ? 'a' : n % 3 === 1 ? 'b' : 'c');

  return (
    <div className="av-game av-objection" data-testid="av-objection" data-phase={phase} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={phase === 'repair' || phase === 'closing'} tone="lilac" />
      <Cast who={scene.witness} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="right" />
      {banner && <div className="av-ob-banner" role="alert" data-testid="av-ob-banner"><span>{t('ap.obObjection', 'OBJECTION!')}</span></div>}
      <div className="av-game-body" data-top="hud">
        <div className="av-ob-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{t('ap.obStatement', 'Statement {{n}} of {{m}}', { n: i + 1, m: scene.lines.length })}</span>
          <span className="av-pill" data-tone={unlocked ? 'brand' : undefined}>{unlocked ? t('ap.obEvOpen', 'Evidence unlocked') : t('ap.obEvLocked', 'Evidence locked')}</span>
          <Badge who={scene.witness} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>

        <section className="av-panel av-game-card av-ob-card" ref={cardEl} data-wob={wob}>
          {phase !== 'closing' && phase !== 'done' && (
            <>
              <div className="av-ob-record" aria-label={t('ap.obRecord', 'Court record')}>
                <ol>
                  {scene.lines.map((l, k) => (
                    <li key={k} data-now={k === i || undefined} data-pressed={pressed.includes(k) || undefined} data-solved={solvedLine(k) || undefined}>
                      <button type="button" onClick={() => { if (phase === 'hear' || phase === 'present') { setI(k); setMsg(null); setSaid(null); } }} aria-current={k === i}>{k + 1}</button>
                    </li>
                  ))}
                </ol>
              </div>
              <blockquote className="av-ob-line" key={`${i}-${solvedLine(i)}`}>
                <small>{scene.witness}</small>
                <p>“{shown}”</p>
              </blockquote>
              {said && <div className="av-bubble av-ob-said" key={said.n}><p className="av-q"><b className="av-npc">{scene.witness}</b> {said.text}</p></div>}
              {msg && <p className="av-note av-why av-ob-msg" data-tone={msg.tone} role="status">{msg.text}</p>}
            </>
          )}

          {phase === 'hear' && (
            <div className="av-ob-actions">
              <button type="button" className="av-btn" onClick={() => go(-1)} aria-label={t('ap.obPrev', 'Previous statement')}>‹</button>
              <button type="button" className="av-stampbtn" data-kind="press" onClick={startPress}>{t('ap.obPress', 'PRESS')}</button>
              <button type="button" className="av-stampbtn" data-kind="present" disabled={!unlocked} onClick={openPresent} title={unlocked ? undefined : t('ap.obLockedTip', 'Press a statement first and ask when it happened.')}>{t('ap.obPresent', 'PRESENT')}</button>
              <button type="button" className="av-btn" onClick={() => go(1)} aria-label={t('ap.obNext', 'Next statement')}>›</button>
            </div>
          )}
          {phase === 'hear' && !unlocked && <p className="av-note">{t('ap.obLockedTip', 'Press a statement first and ask when it happened.')}</p>}

          {phase === 'press' && line.press && (
            <div className="av-ob-press">
              <p className="av-q">{t('ap.obAsk', 'Build your question for {{name}}.', { name: scene.witness })}</p>
              <div className="av-ob-built" data-wob={wob} aria-label={t('ap.obYourQ', 'Your question')}>
                {built.length === 0 && <span className="av-ob-ph">…?</span>}
                {built.map((n) => <button key={n} type="button" className="av-chip" onClick={() => unbuild(n)}>{pool.find((p) => p.n === n)!.w}</button>)}
              </div>
              <div className="av-ob-chips">
                {pool.map((p) => <button key={p.n} type="button" className="av-chip" data-used={built.includes(p.n) || undefined} disabled={built.includes(p.n)} onClick={() => tapChip(p.n)}>{p.w}</button>)}
              </div>
              <button type="button" className="av-iv-back" onClick={() => { setPhase('hear'); setBuilt([]); setMsg(null); }}>{t('ap.back', 'Back')}</button>
            </div>
          )}

          {phase === 'present' && (
            <div className="av-ob-press">
              <p className="av-q">{t('ap.obPickCard', 'Which card clashes with this statement? Tap it to present it.')}</p>
              <button type="button" className="av-iv-back" onClick={() => { setPhase('hear'); setMsg(null); }}>{t('ap.back', 'Back')}</button>
            </div>
          )}

          {phase === 'repair' && line.fix && (
            <div className="av-ob-fix" role="group" aria-label={t('ap.obRepair', 'Repair the statement')}>
              <p className="av-q">{t('ap.obRepair', 'Repair the statement so it tells the truth.')}</p>
              {options.map((o, n) => <button key={o.n} type="button" className="av-opt av-in-fix" style={{ ['--i' as string]: n }} data-state={badFix.includes(o.n) ? 'wrong' : undefined} disabled={badFix.includes(o.n)} onClick={() => repair(o.n)}>{o.o}</button>)}
            </div>
          )}

          {(phase === 'closing' || phase === 'done') && (
            <div className="av-ob-file" data-testid="av-ob-file" key="file">
              <div className="av-ob-page">
                <small>{t('ap.obCaseFile', 'Case file')} · {scene.title}</small>
                <p>{t('ap.obFileLine', 'Statement {{n}} did not match “{{label}}” ({{date}}).', { n: clashes[0] + 1, label: ev0?.label ?? '', date: ev0?.date ?? '' })}</p>
                <p className="av-ob-fixed">{finalLine?.fix?.options[finalLine.fix.correct]}</p>
              </div>
              {phase === 'closing' && <button type="button" className="av-btn" data-kind="go" onClick={close}>{t('ap.obClose', 'Close the case')}</button>}
              {phase === 'done' && <Reward score={score} stars={starsFor(mistakes.current.length ? 1 : 3, 3)} gem={mistakes.current.length === 0} calm={calm} tone="lilac" />}
            </div>
          )}
        </section>

        <div className="av-ob-tray" data-open={phase === 'present' || undefined} data-locked={!unlocked || undefined} aria-label={t('ap.obEvidence', 'Evidence')}>
          {scene.evidence.map((e, n) => (
            <button key={e.id} ref={(el) => { evEls.current[e.id] = el; }} type="button" className="av-ev" data-kind={e.kind ?? 'ticket'} data-t={tone(n)} disabled={phase !== 'present'} onClick={() => present(e.id)}>
              <b>{e.label}</b><small>{e.date}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const objectionScene: SceneModule<ObjectionScene> = {
  view: ObjectionView,
  spoken: (s) => [{ who: s.chief, text: s.intro }, ...s.lines.flatMap((l) => [{ who: s.witness, text: l.text }, ...(l.press ? [{ who: s.witness, text: l.press.reply }] : l.pressReply ? [{ who: s.witness, text: l.pressReply }] : [])])],
  validate: (s) => {
    const p: string[] = [];
    if ((s.lines?.length ?? 0) < 3 || s.lines.length > 6) p.push(`${s.id}: objection needs 3-6 testimony lines`);
    const ev = new Set(s.evidence?.map((e) => e.id));
    if ((s.evidence?.length ?? 0) < 3) p.push(`${s.id}: objection needs 3+ evidence cards`);
    const clashes = s.lines?.filter((l) => l.kind === 'clash') ?? [];
    if (!clashes.length) p.push(`${s.id}: objection needs a clashing line`);
    clashes.forEach((l) => {
      if (!l.evidenceId || !ev.has(l.evidenceId)) p.push(`${s.id}: a clashing line names no evidence card that exists`);
      if (!l.fix || l.fix.options.length !== 3 || l.fix.correct < 0 || l.fix.correct > 2) p.push(`${s.id}: a clashing line needs a repair with 3 options and a right one`);
    });
    if (!s.lines?.some((l) => l.kind === 'upToNow' && l.press)) p.push(`${s.id}: no line can be pressed for a follow-up question`);
    s.lines?.forEach((l, k) => {
      if (!l.why?.trim()) p.push(`${s.id}: line ${k + 1} needs a why`);
      if (l.press && l.press.chips.length < 3) p.push(`${s.id}: line ${k + 1}: a follow-up question needs 3+ words`);
      if (l.kind !== 'clash' && l.evidenceId) p.push(`${s.id}: only a clashing line names evidence`);
    });
    return p;
  },
};
