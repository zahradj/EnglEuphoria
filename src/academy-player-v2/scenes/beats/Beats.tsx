// Beats (Stress Beats; borrows a calm rhythm lane: no timer, never loses). A recorded voice says a word, the syllable pads light in step, the student taps
// the STRONG pad (it grows and thumps), then taps every pad in order and holds the strong one a little longer (or taps it twice), then hears the word in a
// sentence. -ed / -ing partners keep the stress (exCITed, exCITing). A wrong pad shrinks softly and the word plays again with the right pad lit.
// A false-friend note appears in the student's language when we have it. Pads are real buttons: pointer, touch and keyboard (hold Space or Enter).
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { checkItem, DOUBLE_TAP_MS, isHold, markStress, noteFor, type BeatsItem } from './beatsLogic';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type { BeatsItem, L1Note, BeatsPair } from './beatsLogic';
export interface BeatsScene extends SceneBase {
  kind: 'beats'; title: string; who: CastName;
  /** the coach's briefing (recorded voice) */
  intro: string;
  items: BeatsItem[];
}

type Step = 'brief' | 'stress' | 'accent' | 'sentence' | 'pair' | 'note';
const STEP_MS = 400;
const ORD: [string, string][] = [['ap.btOrd1', 'first'], ['ap.btOrd2', 'second'], ['ap.btOrd3', 'third'], ['ap.btOrd4', 'fourth']];

function BeatsView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<BeatsScene>) {
  const { t, i18n } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [i, setI] = useState(0);
  const [step, setStep] = useState<Step>('brief');
  const [lit, setLit] = useState(-1);
  const [replay, setReplay] = useState(0);
  const [hintPad, setHintPad] = useState<number | null>(null);
  const [soft, setSoft] = useState<number | null>(null);
  const [strong, setStrong] = useState<number | null>(null);
  const [accentPos, setAccentPos] = useState(0);
  const [down, setDown] = useState<number | null>(null);
  const [note, setNote] = useState<{ text: string; tone: 'warn' | 'good' } | null>(null);
  const [onPair, setOnPair] = useState(false);
  const [done, setDone] = useState(false);
  const mistakes = useRef<string[]>([]);
  const score = useRef(0);
  const clean = useRef(0);
  const missedStress = useRef(false);
  const reported = useRef(false);
  const downAt = useRef(0);
  const lastTap = useRef<{ pad: number; at: number } | null>(null);
  const padEls = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  const item = scene.items[i];
  const cur = onPair && item.pair ? item.pair : item;
  const syl = cur.syllables;
  const stress = item.stressIndex;
  const word = onPair && item.pair ? item.pair.word : item.word;
  const sentenceNow = onPair && item.pair ? item.pair.sentence : item.sentence;
  const nth = (k: number) => t(ORD[Math.min(k, 3)][0], ORD[Math.min(k, 3)][1]);
  const stressKnown = strong !== null || step === 'accent' || step === 'sentence' || step === 'note';

  // the voice: the word (again on every replay), later the sentence
  const sayText = step === 'brief' ? scene.intro : step === 'sentence' || (step === 'pair' && note?.tone === 'good') ? sentenceNow : word;
  const sayKey = step === 'brief' ? 'brief' : step === 'sentence' ? `${i}-s${onPair}` : step === 'pair' && note?.tone === 'good' ? `${i}-ps` : `${i}-${onPair}-w${replay}`;
  useVoiceKey(scene.who, sayText, sayKey, artBase);

  // the pads light in step with the word (about 0.4 s a syllable; a guide, the recorded clip sets the real pace)
  const clear = () => { timers.current.forEach((x) => window.clearTimeout(x)); timers.current = []; };
  useEffect(() => {
    clear();
    if (step === 'brief' || step === 'note') { setLit(-1); return; }
    if (step === 'sentence' || step === 'accent') { setLit(-1); return; }
    const n = syl.length;
    for (let k = 0; k < n; k++) {
      timers.current.push(window.setTimeout(() => setLit(k), 250 + k * STEP_MS));
    }
    timers.current.push(window.setTimeout(() => setLit(-1), 250 + n * STEP_MS));
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, onPair, step === 'stress' || step === 'pair', replay]);

  const hearAgain = () => { setReplay((n) => n + 1); };

  const reset = (next: Partial<{ pair: boolean }> = {}) => {
    setStrong(null); setSoft(null); setHintPad(null); setAccentPos(0); setNote(null); setOnPair(!!next.pair); setLit(-1); setReplay(0); lastTap.current = null;
  };

  const tapStress = (k: number) => {
    if (step !== 'stress' && step !== 'pair') return;
    if (strong !== null) return;
    const pad = padEls.current[k];
    if (k === stress) {
      setStrong(k); setSoft(null); setHintPad(null);
      popEl(pad, calm, 'pop'); fx.burstAt(pad, 'teal'); fx.floatAt(pad, '+5', 'teal'); actor.cheer(1000);
      if (step === 'stress') {
        const pts = missedStress.current ? 5 : 10; score.current += pts; if (!missedStress.current) clean.current++;
        setNote(null);
        window.setTimeout(() => setStep('accent'), calm ? 0 : 650);
      } else {
        score.current += 5;
        setNote({ text: t('ap.btSameStress', 'Same strong part: {{a}} and {{b}}.', { a: markStress(item.syllables, stress), b: markStress(item.pair!.syllables, stress) }), tone: 'good' });
      }
    } else {
      setSoft(k); setHintPad(stress);
      popEl(pad, calm, 'wobble'); actor.flinch(1000);
      if (step === 'stress') { missedStress.current = true; if (!mistakes.current.includes(word)) mistakes.current.push(word); }
      else if (!mistakes.current.includes(word)) mistakes.current.push(word);
      setNote({ text: t('ap.btAgain', 'Listen again. The strong part is the {{nth}} one.', { nth: nth(stress) }), tone: 'warn' });
      setReplay((n) => n + 1);
      window.setTimeout(() => setSoft(null), 900);
    }
  };

  // ---- accent lane: tap every pad in order; hold the strong one (or tap it twice) ----
  const press = (k: number) => { if (step === 'accent') { downAt.current = performance.now(); setDown(k); } };
  const release = (k: number) => {
    if (step !== 'accent' || down === null) return;
    const ms = performance.now() - downAt.current;
    setDown(null);
    if (k !== accentPos) {
      if (k > accentPos || k < accentPos) setNote({ text: t('ap.btOrder', 'Tap the parts in order, from the first one.'), tone: 'warn' });
      return;
    }
    const pad = padEls.current[k];
    if (k === stress) {
      const dbl = lastTap.current && lastTap.current.pad === k && performance.now() - lastTap.current.at <= DOUBLE_TAP_MS;
      if (!isHold(ms) && !dbl) {
        lastTap.current = { pad: k, at: performance.now() };
        setNote({ text: t('ap.btHold', 'Hold the strong part a little longer (or tap it twice).'), tone: 'warn' });
        popEl(pad, calm, 'thud');
        return;
      }
      popEl(pad, calm, 'pop'); fx.burstAt(pad, 'gold');
    } else popEl(pad, calm, 'thud');
    setNote(null);
    const nextPos = accentPos + 1;
    setAccentPos(nextPos);
    setLit(k);
    if (nextPos >= syl.length) {
      score.current += 5; fx.floatAt(pad, '+5', 'gold'); actor.cheer(900);
      window.setTimeout(() => { setLit(-1); setStep('sentence'); }, calm ? 0 : 700);
    }
  };

  const afterSentence = () => {
    if (!onPair && item.pair) { reset({ pair: true }); setStep('pair'); return; }
    if (noteFor(item.l1Note, i18n.language)) { setNote(null); setStep('note'); return; }
    nextWord();
  };
  const nextWord = () => {
    if (i < scene.items.length - 1) { setI(i + 1); reset(); setStep('stress'); missedStress.current = false; actor.hold('thinking'); return; }
    if (reported.current) return;
    reported.current = true; setDone(true); fx.confetti(); actor.hold('happy', 'cheer');
    onDone({ won: true, score: score.current, mistakes: mistakes.current });
  };
  const start = () => { setStep('stress'); missedStress.current = false; };

  const l1 = step === 'note' ? noteFor(item.l1Note, i18n.language) : undefined;
  const padsActive = step === 'stress' || step === 'pair' || step === 'accent';

  return (
    <div className="av-game av-beats" data-testid="av-beats" data-step={step} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={strong !== null || step === 'sentence'} tone="lilac" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-bt-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{t('ap.btWordN', 'Word {{n}} of {{m}}', { n: i + 1, m: scene.items.length })}</span>
          <span className="av-pill" data-tone="brand">{step === 'accent' ? t('ap.btStepAccent', 'Tap them all, hold the strong one') : step === 'sentence' || step === 'note' ? t('ap.btStepSentence', 'In a sentence') : t('ap.btStepStress', 'Find the strong part')}</span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>

        <section className="av-panel av-game-card av-bt-panel" aria-live="polite">
          {step === 'brief' && <div className="av-fd-say"><p className="av-q">{scene.intro}</p><button type="button" className="av-btn" data-kind="go" onClick={start}>{t('ap.start', 'Start')}</button></div>}

          {step !== 'brief' && !done && (
            <>
              <div className="av-bt-word" aria-label={word}>
                <button type="button" className="av-bt-ear" onClick={hearAgain} aria-label={t('ap.listenAgain', 'Listen again')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" /></svg></button>
                <b className="av-bt-text">{stressKnown ? markStress(syl, stress).split('·').map((s, k) => <span key={k} data-strong={k === stress || undefined}>{s}</span>) : syl.join('·')}</b>
                {onPair && <small>{t('ap.btPairTag', '-ed / -ing partner')}</small>}
              </div>

              <div className="av-bt-lane" role="group" aria-label={t('ap.btLane', 'Syllable pads')} data-n={syl.length}>
                <span className="av-bt-rail" aria-hidden="true" />
                {syl.map((s, k) => (
                  <button key={`${word}-${k}`} type="button" ref={(el) => { padEls.current[k] = el; }} className="av-bt-pad"
                    data-lit={lit === k || undefined} data-hint={hintPad === k || undefined} data-strong={strong === k || undefined} data-soft={soft === k || undefined}
                    data-down={down === k || undefined} data-next={(step === 'accent' && accentPos === k) || undefined} data-done={(step === 'accent' && k < accentPos) || undefined}
                    data-held={(step === 'accent' && down === k && k === stress) || undefined} disabled={!padsActive}
                    aria-label={`${nth(k)}: ${s}`}
                    onClick={() => { if (step === 'stress' || step === 'pair') tapStress(k); }}
                    onPointerDown={() => press(k)} onPointerUp={() => release(k)} onPointerLeave={() => { if (down === k) setDown(null); }} onPointerCancel={() => setDown(null)}
                    onKeyDown={(e) => { if (step === 'accent' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); if (!e.repeat) press(k); } }}
                    onKeyUp={(e) => { if (step === 'accent' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); release(k); } }}>
                    <span className="av-bt-pad-in"><b>{s}</b><i aria-hidden="true">{k + 1}</i></span>
                    <span className="av-bt-ring" aria-hidden="true" />
                  </button>
                ))}
              </div>

              <p className="av-fd-hint av-bt-help">{step === 'stress' || step === 'pair' ? t('ap.btTapStrong', 'Listen. Tap the strong part of the word.') : step === 'accent' ? t('ap.btTapAll', 'Now tap every part in order. Hold the strong part a little longer.') : ''}</p>

              {(step === 'sentence') && (
                <div className="av-bt-sentence">
                  <p className="av-q">{sentenceNow.split(new RegExp(`(${word})`, 'i')).map((part, k) => (part.toLowerCase() === word.toLowerCase() ? <mark key={k}>{markStress(syl, stress).split('·').map((x, m) => <span key={m} data-strong={m === stress || undefined}>{x}</span>)}</mark> : <span key={k}>{part}</span>))}</p>
                  <button type="button" className="av-btn" data-kind="go" onClick={afterSentence}>{t('ap.btGotIt', 'Got it')} ›</button>
                </div>
              )}

              {step === 'pair' && strong !== null && (
                <div className="av-bt-sentence">
                  <p className="av-q">{sentenceNow.split(new RegExp(`(${word})`, 'i')).map((part, k) => (part.toLowerCase() === word.toLowerCase() ? <mark key={k}>{markStress(syl, stress).split('·').map((x, m) => <span key={m} data-strong={m === stress || undefined}>{x}</span>)}</mark> : <span key={k}>{part}</span>))}</p>
                  <button type="button" className="av-btn" data-kind="go" onClick={afterSentence}>{t('ap.next', 'Next')} ›</button>
                </div>
              )}

              {step === 'note' && l1 && (
                <div className="av-bt-l1" data-own={l1.own || undefined}>
                  <small>{l1.own ? t('ap.btL1Own', 'In your language') : t('ap.btL1', 'Careful: a false friend')}</small>
                  <p>{l1.text}</p>
                  <button type="button" className="av-btn" data-kind="go" onClick={nextWord}>{i < scene.items.length - 1 ? `${t('ap.btNextWord', 'Next word')} ›` : t('ap.finish', 'Finish the lesson')}</button>
                </div>
              )}
            </>
          )}

          {note && step !== 'brief' && !done && <p className="av-note av-fd-note-line" data-tone={note.tone} role="status">{note.text}</p>}
          {done && <Reward score={score.current} stars={starsFor(clean.current, scene.items.length)} gem={mistakes.current.length === 0} calm={calm} />}
        </section>
      </div>
    </div>
  );
}

export const beatsScene: SceneModule<BeatsScene> = {
  view: BeatsView,
  spoken: (s) => [
    { who: s.who, text: s.intro },
    ...s.items.flatMap((it) => [{ who: s.who, text: it.word }, { who: s.who, text: it.sentence }, ...(it.pair ? [{ who: s.who, text: it.pair.word }, { who: s.who, text: it.pair.sentence }] : [])]),
  ],
  validate: (s) => {
    const p: string[] = [];
    if (!s.intro?.trim()) p.push(`${s.id}: beats needs an intro`);
    if ((s.items?.length ?? 0) < 3) p.push(`${s.id}: beats needs 3+ words`);
    const seen = new Set<string>();
    s.items?.forEach((it) => { if (seen.has(it.word)) p.push(`${s.id}: duplicate word ${it.word}`); seen.add(it.word); p.push(...checkItem(it).map((x) => `${s.id}: ${x}`)); });
    if (s.items && !s.items.some((it) => it.pair)) p.push(`${s.id}: at least one word needs an -ed/-ing partner (the stress stays)`);
    return p;
  },
};
