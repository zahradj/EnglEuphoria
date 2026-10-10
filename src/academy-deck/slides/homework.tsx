import { useEffect, useMemo, useState } from 'react';
import { NumberCard } from '../../academy-player/drawn';
import { shuffled, useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { HuntSlide, ShadowSlide } from '../types';
import { NOT_YET } from './shared';
import { Art } from './teach';

/** Hidden-object hunt: number cards are tucked into the scene; read the number words and find them. */
export function HuntView({ slide }: { slide: HuntSlide }) {
  const { right, wrong, done } = useDeck();
  const [found, setFound] = useState<string[]>([]);
  const [slip, setSlip] = useState<string | null>(null);
  const all = found.length === slide.targets.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  const tapTarget = (w: string) => {
    if (found.includes(w)) return;
    setFound([...found, w]);
    setSlip(null);
    right();
  };
  const tapDecoy = (key: string) => {
    setSlip(key);
    wrong();
    window.setTimeout(() => setSlip(null), 400);
  };
  return (
    <>
      <div className="ad-hunt" aria-label="The scene">
        {slide.targets.map((t) => (
          <button key={t.word} type="button" className="ad-hunt-item" data-found={found.includes(t.word)} style={{ left: `${t.x}%`, top: `${t.y}%` }} aria-label={`Hidden number ${t.n}`} onClick={() => tapTarget(t.word)}>
            <NumberCard n={t.n} label={`${t.n}`} />
          </button>
        ))}
        {slide.decoys.map((d, i) => (
          <button key={`d${i}`} type="button" className="ad-hunt-item" data-decoy="true" data-slip={slip === `d${i}`} style={{ left: `${d.x}%`, top: `${d.y}%` }} aria-label={`Hidden number ${d.n}`} onClick={() => tapDecoy(`d${i}`)}>
            <NumberCard n={d.n} label={`${d.n}`} />
          </button>
        ))}
      </div>
      <div className="ad-gm-hud" role="group" aria-label={slide.prompt}>
        <span className="ad-gm-title">{slide.prompt}</span>
        <div className="ad-hunt-list" aria-live="polite">
          {slide.targets.map((t) => (
            <span key={t.word} className="ad-gm-chip" data-found={found.includes(t.word)}>{found.includes(t.word) ? <Icon name="check" /> : <Icon name="search" />} {t.word}</span>
          ))}
        </div>
        <span className="ad-gm-count">{found.length}/{slide.targets.length}</span>
      </div>
      {slip && !all && <p className="ad-gm-toast" role="status">{NOT_YET} Read the word, then look for that number.</p>}
      {all && <p className="ad-gm-toast" data-ok="true" role="status"><Icon name="check" /> You found them all!</p>}
    </>
  );
}

/** Shadow match: a dark silhouette of the picture; choose the word that matches it. */
export function ShadowView({ slide }: { slide: ShadowSlide }) {
  const { right, wrong, done, seed } = useDeck();
  const [round, setRound] = useState(0);
  const [lit, setLit] = useState(false);
  const [slip, setSlip] = useState(false);
  const finished = round >= slide.rounds.length;
  const cur = slide.rounds[Math.min(round, slide.rounds.length - 1)];
  const opts = useMemo(() => shuffled(cur.options, seed + round), [cur, seed, round]);
  useEffect(() => {
    if (finished) done();
  }, [finished, done]);
  const pick = (o: string) => {
    if (lit || finished) return;
    if (o === cur.answer) {
      setLit(true);
      if (!slip) right();
      setSlip(false);
      window.setTimeout(() => {
        setLit(false);
        setRound((r) => r + 1);
      }, 900);
    } else {
      setSlip(true);
      wrong();
    }
  };
  return (
    <>
      <div className="ad-gm-hud" role="group" aria-label={slide.prompt}>
        <span className="ad-gm-title">{slide.prompt}</span>
        <span className="ad-gm-count">{Math.min(round + 1, slide.rounds.length)}/{slide.rounds.length}</span>
      </div>
      {!finished ? (
        <div className="ad-gm-stage">
          <div className="ad-portal" data-lit={lit} key={round}>
            <i className="ad-portal-ring" aria-hidden="true" />
            <i className="ad-portal-ring ad-portal-ring2" aria-hidden="true" />
            <i className="ad-portal-base" aria-hidden="true" />
            <span className="ad-orbit" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
            <i className="ad-portal-gloss" aria-hidden="true" />
            <div className="ad-shadow" data-lit={lit}>
              <div className="ad-shadow-art"><Art art={cur.art} /></div>
              <span className="ad-shadow-q" aria-hidden="true">?</span>
            </div>
          </div>
          <div className="ad-gm-keys" role="group" aria-label="Which word?">
            {opts.map((o, i) => <button key={o} type="button" className="ad-gm-key" data-k={i} onClick={() => pick(o)}>{o}</button>)}
          </div>
          {slip && <p className="ad-gm-toast" role="status">{NOT_YET} Look at the shape.</p>}
        </div>
      ) : (
        <p className="ad-gm-toast" data-ok="true" role="status"><Icon name="check" /> All the shadows matched!</p>
      )}
    </>
  );
}
