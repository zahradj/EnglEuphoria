import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { useDragChip } from '../drag';
import type { FindWrongSlide, SpellSlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';

// look-alike letter names (A/E, B/P, M/N, E/I …): distractors that train noticing
const LOOKALIKE: Record<string, string> = { A: 'E', B: 'P', C: 'S', D: 'T', E: 'I', F: 'S', G: 'J', H: 'A', I: 'E', J: 'G', K: 'Q', L: 'R', M: 'N', N: 'M', O: 'U', P: 'B', Q: 'K', R: 'L', S: 'C', T: 'D', U: 'O', V: 'B', W: 'U', X: 'S', Y: 'I', Z: 'S' };

/** Spell It: drag (or tap) letter tiles onto a name badge, in order. */
export function SpellView({ slide }: { slide: SpellSlide }) {
  const { vars, setVars, right, wrong, done, award, seed } = useDeck();
  const word = slide.target.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? 'friend');
  const letters = useMemo(() => word.toUpperCase().replace(/[^A-Z]/g, '').split('').slice(0, 14), [word]);
  const tiles = useMemo(() => {
    const extra = [...new Set(letters.map((l) => LOOKALIKE[l]).filter((l) => l && !letters.includes(l)))].slice(0, 2);
    return shuffled([...letters, ...extra].map((l, i) => ({ l, id: i })), seed);
  }, [letters, seed]);
  const [used, setUsed] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const [slip, setSlip] = useState(false);
  const next = used.length;
  const all = next >= letters.length;
  const place = (id: number, slot?: number) => {
    if (all) return;
    const t = tiles.find((x) => x.id === id);
    if (!t) return;
    if (t.l === letters[next] && (slot === undefined || slot === next)) {
      setUsed([...used, id]);
      if (!slip) right();
      setSlip(false);
    } else {
      setBad(id);
      setSlip(true);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  const drag = useDragChip((id, t) => place(Number(id), Number(t)), (id) => place(Number(id)));
  useEffect(() => {
    if (all && letters.length) {
      if (slide.save) setVars({ [slide.save]: letters.join('-') });
      if (slide.stamp) award(slide.stamp);
      done();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all]);
  return (
    <Panel title={slide.prompt}>
      <div className="ad-badge ad-badge-spell">
        <span className="ad-badge-top">HELLO · my name is</span>
        <span className="ad-badge-name">{letters.join('')}</span>
        <div className="ad-slots">
          {letters.map((l, i) => (
            <span key={i} className="ad-slot" data-drop={i} data-filled={i < next} data-next={i === next && !all}>{i < next ? l : ''}</span>
          ))}
        </div>
      </div>
      <div className="ad-chips">
        {tiles.map((t) => (
          <button key={t.id} type="button" className="ad-chip ad-letter" disabled={used.includes(t.id)} data-bad={bad === t.id} {...drag.bind(String(t.id), used.includes(t.id))}>{t.l}</button>
        ))}
      </div>
      {slip && !all && <Feedback kind="try">{NOT_YET} Which letter is next on the badge?</Feedback>}
      {all && <Feedback kind="ok">{letters.join('-')}. Say it out loud, letter by letter!</Feedback>}
      <p className="ad-hint-line">{next} of {letters.length} letters</p>
    </Panel>
  );
}

/** Detective: the fake profile has spelling mistakes. Click the lines that are wrong. */
export function FindWrongView({ slide }: { slide: FindWrongSlide }) {
  const { right, wrong, done } = useDeck();
  const [found, setFound] = useState<number[]>([]);
  const [slip, setSlip] = useState<number | null>(null);
  const need = slide.rows.filter((r) => r.wrong).length;
  const all = found.length === need;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  const tap = (i: number) => {
    if (found.includes(i) || all) return;
    if (slide.rows[i].wrong) {
      setFound([...found, i]);
      setSlip(null);
      right();
    } else {
      setSlip(i);
      wrong();
    }
  };
  return (
    <Panel title={slide.prompt}>
      <div className="ad-profile">
        <div className="ad-profile-head">👤 Profile: “Sam”</div>
        {slide.rows.map((r, i) => (
          <button key={i} type="button" className="ad-profile-row" data-found={found.includes(i)} data-slip={slip === i} onClick={() => tap(i)} aria-label={`${r.label}: ${r.text}`}>
            <span className="ad-profile-label">{r.label}</span>
            <span className="ad-profile-text">{found.includes(i) && r.fix ? <><s>{r.text}</s> → <b>{r.fix}</b></> : r.text}</span>
            {found.includes(i) && <span aria-hidden="true">🔍</span>}
          </button>
        ))}
      </div>
      {slip !== null && !all && <Feedback kind="try">That line is fine. Look for letters that are wrong.</Feedback>}
      {all ? <Feedback kind="ok">{slide.reveal}</Feedback> : <p className="ad-hint-line">{found.length} of {need} mistakes found</p>}
    </Panel>
  );
}
