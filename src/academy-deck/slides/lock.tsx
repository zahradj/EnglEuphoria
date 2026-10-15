import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { DuelSlide, RhythmSlide, VaultSlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';
import { Art } from './teach';

/** Vault hub (v2): one door swings open, its key goes into the HUD. Nothing is asked; the slide finishes by itself so "Next" is ready. */
export function VaultView({ slide }: { slide: VaultSlide }) {
  const { done, reduced } = useDeck();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const a = window.setTimeout(() => setOpen(true), reduced ? 0 : 450);
    const b = window.setTimeout(() => done(), reduced ? 0 : 1100);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [done, reduced]);
  return (
    <Panel variant="glass">
      <div className="ad-vault" data-open={open}>
        <ol className="ad-vault-doors" aria-label="Locks">
          {[1, 2, 3, 4, 5].map((n) => (
            <li key={n} className="ad-vault-door" data-state={n < slide.lock ? 'opened' : n === slide.lock ? (open ? 'opening' : 'closed') : 'closed'}>
              <span className="ad-vault-num" aria-hidden="true">{n}</span>
              <span className="ad-vault-key" aria-hidden="true"><Icon name="key" /></span>
            </li>
          ))}
        </ol>
        <h2 className="ad-vault-line">{slide.line}</h2>
        <p className="ad-vault-reward"><Icon name="sparkle" /> {slide.reward}</p>
      </div>
    </Panel>
  );
}

/** Lock-pick lane: set one pin per right answer. The light on the tiles is just a calm sweep; there is no beat to hit and nothing to lose. */
export function RhythmView({ slide }: { slide: RhythmSlide }) {
  const { right, wrong, done, speak, seed } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const [round, setRound] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const [slip, setSlip] = useState(false);
  const finished = round >= slide.rounds.length;
  const r = slide.rounds[round];
  const opts = useMemo(() => (r ? shuffled(r.options, seed + round * 7) : []), [r, seed, round]);
  useEffect(() => {
    if (finished) done();
    else void speak(lead, r.say);
  }, [finished, done, speak, lead, r]);
  const pins = (
    <ol className="ad-pins" aria-label={`Pins set: ${Math.min(round, slide.rounds.length)} of ${slide.rounds.length}`}>
      {slide.rounds.map((_, k) => <li key={k} className="ad-pin" data-set={k < round} />)}
    </ol>
  );
  if (finished) return <Panel title={slide.prompt} wide variant="glass">{pins}<Feedback kind="ok">Every pin is set. The lock is ready!</Feedback></Panel>;
  const pick = (o: string) => {
    if (o === r.answer) {
      if (!slip) right();
      setSlip(false);
      setRound(round + 1);
    } else {
      setSlip(true);
      setBad(o);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  return (
    <Panel title={slide.prompt} wide variant="glass">
      {pins}
      <div className="ad-row" style={{ justifyContent: 'center' }}>
        <button type="button" className="ad-hp-ear" onClick={() => void speak(lead, r.say)} aria-label="Hear it again"><Icon name="speaker" /></button>
      </div>
      <div className="ad-lane" role="group" aria-label="Choose what you hear">
        {opts.map((o, k) => <button key={o} type="button" className="ad-lane-tile" data-bad={bad === o} style={{ ['--k' as string]: k }} onClick={() => pick(o)}>{o}</button>)}
      </div>
      {slip && <Feedback kind="try">{NOT_YET} Listen again, then choose.</Feedback>}
      <p className="ad-hint-line">Pin {round + 1} of {slide.rounds.length}. Listen, then tap what you hear. No rush.</p>
    </Panel>
  );
}

/** Boss duel (Lock 4): pick the word for the picture, hear the sentence, say it aloud. Forward on a right pick, ONE soft step back on a miss, the answer is shown after three misses. */
export function DuelView({ slide }: { slide: DuelSlide }) {
  const { right, wrong, done, speak, seed } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Theo';
  const total = slide.rounds.length;
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState(0);
  const [misses, setMisses] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const [said, setSaid] = useState(false);
  const r = slide.rounds[round];
  const finished = round >= total;
  const opts = useMemo(() => (r ? shuffled(r.options, seed + round * 11) : []), [r, seed, round]);
  useEffect(() => {
    if (finished) done();
  }, [finished, done]);
  const sentence = r ? slide.frame.replace('___', r.answer) : '';
  const track = (
    <div className="ad-duel-track" role="img" aria-label={`Key ${pos} of ${total} steps to the lock`}>
      {Array.from({ length: total + 1 }, (_, k) => (
        <span key={k} className="ad-duel-step" data-on={k <= pos} data-end={k === total}>{k === total ? <Icon name="lock" /> : k === pos ? <Icon name="key" /> : null}</span>
      ))}
    </div>
  );
  if (finished) return <Panel title={slide.prompt} wide variant="glass">{track}<Feedback kind="ok">The key reaches the lock. Click!</Feedback></Panel>;
  const pick = (o: string) => {
    if (o === r.answer) {
      if (misses === 0) right();
      setSaid(true);
      void speak(lead, sentence);
    } else {
      setBad(o);
      wrong();
      setPos((p) => Math.max(0, p - 1));
      setMisses((m) => m + 1);
      window.setTimeout(() => setBad(null), 380);
    }
  };
  const nextRound = () => {
    setPos((p) => Math.min(total, p + 1));
    setRound(round + 1);
    setMisses(0);
    setSaid(false);
  };
  return (
    <Panel title={slide.prompt} wide variant="glass">
      {track}
      <div className="ad-duel">
        <div className="ad-duel-pic"><Art art={r.art} size="sm" /></div>
        <div className="ad-duel-side">
          <p className="ad-duel-frame" aria-live="polite">{said ? sentence : slide.frame}</p>
          {!said ? (
            <div className="ad-duel-opts" role="group" aria-label="Choose the word">
              {opts.map((o) => <button key={o} type="button" className="ad-lane-tile" data-bad={bad === o} data-help={misses >= 3 && o === r.answer} onClick={() => pick(o)}>{o}</button>)}
            </div>
          ) : (
            <div className="ad-row">
              <button type="button" className="ad-btn" onClick={() => void speak(lead, sentence)}><Icon name="speaker" /> Hear it again</button>
              <button type="button" className="ad-btn ad-btn-primary" onClick={nextRound}>{round + 1 < total ? 'Next picture ▸' : 'Open the lock ▸'}</button>
            </div>
          )}
        </div>
      </div>
      {misses > 0 && !said && <Feedback kind="try">{NOT_YET} {misses >= 3 ? 'The glowing word is the one.' : 'Try again. Nothing is lost.'}</Feedback>}
      {said && <p className="ad-hint-line">Now say it out loud, then tap “Say it ✓”.</p>}
      {!said && <p className="ad-hint-line">Picture {round + 1} of {total}. Choose the word, then say the sentence.</p>}
    </Panel>
  );
}
