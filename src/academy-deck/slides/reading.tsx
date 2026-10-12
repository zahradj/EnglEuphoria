import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { Icon } from '../Icon';
import { soundKey } from '../spoken';
import type { BlendSlide, HearPickSlide, ReaderSlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';
import { Art } from './teach';

/** Blend: the letters start apart; sliding (or "Blend it") pulls them together and the word is read. Tapping a tile plays its SOUND clip (silent until recorded). */
export function BlendView({ slide }: { slide: BlendSlide }) {
  const { right, done, speak } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const [round, setRound] = useState(0);
  const [v, setV] = useState(0);
  const r = slide.rounds[round];
  const joined = v >= 96;
  const finished = round >= slide.rounds.length;
  useEffect(() => {
    if (finished) done();
  }, [finished, done]);
  useEffect(() => {
    if (joined && r) { right(); void speak(lead, r.word); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);
  if (finished) return <Panel title={slide.prompt} wide><Feedback kind="ok">You blended every word!</Feedback></Panel>;
  const gap = Math.round(((100 - Math.min(v, 100)) / 100) * 46);
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <div className="ad-blend" data-joined={joined} style={{ ['--bgap' as string]: `${gap}px` }}>
        {r.art && <div className="ad-blend-art"><Art art={r.art} size="sm" /></div>}
        <div className="ad-blend-tiles" role="group" aria-label={`Letters: ${r.letters.join(' ')}`}>
          {r.letters.map((l, i) => (
            <button key={i} type="button" className="ad-blend-tile" aria-label={`Letter ${l}: tap to hear its sound`} onClick={() => void speak(lead, soundKey(l))}>{l}</button>
          ))}
        </div>
        <div className="ad-blend-word" aria-live="polite">{joined ? r.word : ' '}</div>
        {!joined ? (
          <div className="ad-blend-ctl">
            <input type="range" min={0} max={100} value={v} aria-label="Blend the sounds together" onChange={(e) => setV(Number(e.target.value))} />
            <button type="button" className="ad-btn" onClick={() => setV(100)}><Icon name="sparkle" /> Blend it</button>
          </div>
        ) : (
          <div className="ad-row" style={{ justifyContent: 'center' }}>
            <button type="button" className="ad-btn" onClick={() => void speak(lead, r.word)}><Icon name="speaker" /> Hear it again</button>
            <button type="button" className="ad-btn ad-btn-primary" onClick={() => { setRound(round + 1); setV(0); }}>{round + 1 < slide.rounds.length ? 'Next word ▸' : 'Done ▸'}</button>
          </div>
        )}
      </div>
      <p className="ad-hint-line">Word {Math.min(round + 1, slide.rounds.length)} of {slide.rounds.length}. Slide the letters together, then say the word.</p>
    </Panel>
  );
}

/** Hear and pick: the guide says a letter name or a word; pick it from big tiles. No timer; "Not yet" on a miss. */
export function HearPickView({ slide }: { slide: HearPickSlide }) {
  const { right, wrong, done, speak, seed } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const [round, setRound] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const [slip, setSlip] = useState(false);
  const finished = round >= slide.rounds.length;
  const r = slide.rounds[round];
  const opts = useMemo(() => (r ? shuffled(r.options, seed + round * 5) : []), [r, seed, round]);
  useEffect(() => {
    if (finished) done();
    else void speak(lead, r.say);
  }, [finished, done, speak, lead, r]);
  if (finished) return <Panel title={slide.prompt} wide variant="bare"><Feedback kind="ok">All found!</Feedback></Panel>;
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
    <Panel title={slide.prompt} wide variant="bare">
      <div className="ad-row" style={{ justifyContent: 'center' }}>
        <button type="button" className="ad-hp-ear" onClick={() => void speak(lead, r.say)} aria-label="Hear it again"><Icon name="speaker" /></button>
      </div>
      <div className="ad-hearpick" role="group" aria-label="Choose what you hear">
        {opts.map((o, k) => <button key={o} type="button" className="ad-hp-tile" data-bad={bad === o} style={{ ['--y' as string]: `${[0, 26, -10][k % 3]}px`, ['--r' as string]: `${[-5, 4, -2][k % 3]}deg` }} onClick={() => pick(o)}>{o}</button>)}
      </div>
      {slip && <Feedback kind="try">{NOT_YET} Listen again, then choose.</Feedback>}
      <p className="ad-hint-line">{round + 1} of {slide.rounds.length}. Listen, then tap what you hear.</p>
    </Panel>
  );
}

/** Reader page: each line can be heard (tap a word or the whole line); then the student matches the line to its picture. */
export function ReaderView({ slide }: { slide: ReaderSlide }) {
  const { right, wrong, done, speak, seed } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const [i, setI] = useState(0);
  const [slip, setSlip] = useState(false);
  const [bad, setBad] = useState<number | null>(null);
  const finished = i >= slide.lines.length;
  useEffect(() => {
    if (finished) done();
  }, [finished, done]);
  const options = useMemo(() => {
    if (finished) return [];
    const others = slide.lines.map((_, k) => k).filter((k) => k !== i);
    return shuffled([i, ...shuffled(others, seed + i).slice(0, 2)], seed + i * 3);
  }, [slide.lines, i, seed, finished]);
  if (finished) return <Panel title={slide.prompt} wide variant="bare"><Feedback kind="ok">You read the whole page!</Feedback></Panel>;
  const line = slide.lines[i];
  const choose = (k: number) => {
    if (k === i) {
      if (!slip) right();
      setSlip(false);
      setI(i + 1);
    } else {
      setSlip(true);
      setBad(k);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  return (
    <Panel title={slide.prompt} wide variant="bare">
      <div className="ad-reader-line" aria-label={`Line ${i + 1}: ${line.text}`}>
        {line.text.split(/\s+/).map((w, k) => (
          <button key={k} type="button" className="ad-reader-word" onClick={() => void speak(lead, w.replace(/[.,!?]/g, ''))}>{w}</button>
        ))}
        <button type="button" className="ad-btn" onClick={() => void speak(lead, line.text)}><Icon name="speaker" /> Hear the line</button>
      </div>
      <div className="ad-reader-pics" role="group" aria-label="Which picture is it?">
        {options.map((k, n) => (
          <button key={k} type="button" className="ad-reader-pic" data-bad={bad === k} aria-label={`Picture ${k + 1}`} style={{ ['--y' as string]: `${[0, 22, -8][n % 3]}px`, ['--r' as string]: `${[-4, 3, -2][n % 3]}deg` }} onClick={() => choose(k)}><Art art={slide.lines[k].art} size="sm" /></button>
        ))}
      </div>
      {slip && <Feedback kind="try">{NOT_YET} Read the line again, then choose.</Feedback>}
      <p className="ad-hint-line">Line {i + 1} of {slide.lines.length}. Tap a word to hear it.</p>
    </Panel>
  );
}
