// Build the sentence: tap word tiles in order. Several sentences; a wrong tile is gentle and logged; a clean sentence pops.
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import { Badge, Cast, flyClone, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface BuildScene extends SceneBase { kind: 'build'; title: string; items: { words: string[]; hint?: string }[] }

const shuffle = <T,>(a: T[], seed: number) => { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

function BuildView({ scene, onDone, artBase, calm, seed, fx: fxIn }: SceneProps<BuildScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [i, setI] = useState(0);
  const [got, setGot] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [cleanCount, setCleanCount] = useState(0);
  const dirty = useRef(false);
  const mistakes = useRef<string[]>([]);
  const tileEls = useRef<Record<number, HTMLButtonElement | null>>({});
  const slotEls = useRef<(HTMLSpanElement | null)[]>([]);
  const railEl = useRef<HTMLParagraphElement>(null);
  const item = scene.items[i];
  const sentence = item.words.join(' ');
  const tiles = useMemo(() => shuffle(item.words.map((w, k) => ({ w, k })), seed + i), [item, seed, i]);
  const finished = got.length === item.words.length;
  const last = i === scene.items.length - 1;
  useSay('Vee', finished ? sentence : undefined, artBase);
  const tap = (k: number) => {
    if (finished || got.includes(k)) return;
    // the next word is the first not-yet-used index whose word matches (duplicates are interchangeable)
    if (item.words[got.length] === item.words[k]) {
      const slot = slotEls.current[got.length];
      flyClone(tileEls.current[k], slot, calm, 360);
      const nowLen = got.length + 1;
      setGot([...got, k]); setBad(null);
      window.setTimeout(() => popEl(slot, calm, 'thud'), calm ? 0 : 300);
      if (nowLen === item.words.length) {
        window.setTimeout(() => { fx.burstAt(railEl.current, 'gold'); fx.floatAt(railEl.current, dirty.current ? '✓' : '+10', 'gold'); }, calm ? 0 : 340);
        if (last) { fx.confetti(); actor.hold('happy', 'cheer'); } else actor.cheer();
      }
    } else {
      setBad(k); dirty.current = true; popEl(tileEls.current[k], calm, 'wobble'); actor.flinch();
      if (!mistakes.current.includes(sentence)) mistakes.current.push(sentence);
    }
  };
  const next = () => {
    const earned = dirty.current ? 0 : 10;
    if (!dirty.current) { setScore((s) => s + 10); setCleanCount((c) => c + 1); }
    if (last) { onDone({ won: true, score: score + earned, mistakes: mistakes.current }); return; }
    dirty.current = false; setI(i + 1); setGot([]); setBad(null); actor.hold('thinking');
  };
  return (
    <div className="av-game av-build" data-testid="av-build">
      <GameBackdrop /><Glow on={finished} tone="gold" />
      <Cast who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="right" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-build-card">
          <header className="av-card-head">
            <h2>{scene.title} · {i + 1}/{scene.items.length}</h2>
            <Badge who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          <p className="av-slots" ref={railEl} aria-live="polite" data-done={finished || undefined}>{item.words.map((w, k) => <span key={k} ref={(el) => { slotEls.current[k] = el; }} data-on={k < got.length} data-next={k === got.length || undefined}>{k < got.length ? w : ''}</span>)}</p>
          <div className="av-tiles av-puzzle" key={i}>{tiles.map(({ w, k }, n) => <button key={k} ref={(el) => { tileEls.current[k] = el; }} type="button" className="av-opt av-piece" style={{ ['--i' as string]: n, ['--tilt' as string]: `${((n * 5) % 7) - 3}deg` }} data-state={got.includes(k) ? 'right' : bad === k ? 'wrong' : undefined} disabled={got.includes(k)} onClick={() => tap(k)}>{w}</button>)}</div>
          {bad !== null && !finished && <p className="av-note">{item.hint ?? t('ap.tryAgain', 'Almost. Look again.')}</p>}
          {finished && <>
            <p className="av-note av-why" data-ok="true">{t('ap.wellDone', 'Well done!')}</p>
            {last && <Reward score={score + (dirty.current ? 0 : 10)} stars={starsFor(cleanCount + (dirty.current ? 0 : 1), scene.items.length)} gem={mistakes.current.length === 0} calm={calm} />}
            <button type="button" className="av-btn" data-kind="go" onClick={next}>{last ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button>
          </>}
        </section>
      </div>
    </div>
  );
}

export const buildScene: SceneModule<BuildScene> = {
  view: BuildView,
  spoken: (s) => s.items.map((i) => ({ who: 'Vee', text: i.words.join(' ') })),
  validate: (s) => {
    if (!s.items?.length) return [`${s.id}: build has no sentences`];
    return s.items.flatMap((it, i) => (it.words.length < 3 || it.words.length > 9 ? [`${s.id}: sentence ${i + 1} needs 3-9 words`] : []));
  },
};
