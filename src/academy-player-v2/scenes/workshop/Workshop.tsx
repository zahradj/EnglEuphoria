// Workshop (Chunk Workshop; borrows Hades' pick-one-of-three and a crafting bench). Each travel-kit item needs a CHUNK: pick the first half
// (go / do / make / try) and the second half (camping / sightseeing / something new) from three cards each, PREDICT, then press the lever.
// A right pair snaps into ONE ticket (squash, sparkle) and goes on the shelf; a wrong pair wobbles apart with a calm note ("We say go camping").
// Then each shelf chunk is used in a gap sentence (inflected forms are accepted: went camping, going sightseeing). No timer, no lives.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import { useVoiceKey } from '../wave1Kit';
import { accepts } from '../write/Write';
import { chunkOf, fillStem, halvesFit, splitStem } from './workshopLogic';
import type { WorkshopItem } from './workshopLogic';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type { WorkshopItem } from './workshopLogic';
export interface WorkshopScene extends SceneBase {
  kind: 'workshop'; title: string; who: CastName;
  /** the maker's briefing (recorded voice) */
  intro: string;
  items: WorkshopItem[];
}

function WorkshopView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<WorkshopScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [phase, setPhase] = useState<'brief' | 'craft' | 'use' | 'done'>('brief');
  const [i, setI] = useState(0);
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [snapped, setSnapped] = useState(false);
  const [shelf, setShelf] = useState<string[]>([]);
  const [note, setNote] = useState<{ text: string; tone: 'warn' | 'good' } | null>(null);
  const [j, setJ] = useState(0);
  const [typed, setTyped] = useState('');
  const [tries, setTries] = useState(0);
  const [sOk, setSOk] = useState(false);
  const [said, setSaid] = useState<string | undefined>(undefined);
  const mistakes = useRef<string[]>([]);
  const score = useRef(0);
  const clean = useRef(0);
  const missed = useRef(false);
  const reported = useRef(false);
  const ticketEl = useRef<HTMLDivElement>(null);
  const shelfEl = useRef<HTMLDivElement>(null);
  const sentEl = useRef<HTMLDivElement>(null);

  const item = scene.items[Math.min(i, scene.items.length - 1)];
  const sent = scene.items[Math.min(j, scene.items.length - 1)];
  const total = scene.items.length * 2;
  const chunk = chunkOf(item);

  useVoiceKey(scene.who, phase === 'brief' ? scene.intro : said, phase === 'brief' ? 'brief' : `${i}-${j}-${phase}-${snapped}-${sOk}`, artBase);

  const pickFirst = (o: string) => { if (snapped) return; setA(a === o ? null : o); setNote(null); };
  const pickSecond = (o: string) => { if (snapped) return; setB(b === o ? null : o); setNote(null); };

  const press = () => {
    if (snapped || !a || !b) return;
    const r = halvesFit(item, a, b);
    if (r.ok) {
      setSnapped(true); setNote(null); setSaid(chunk); setShelf((sh) => [...sh, chunk]);
      window.setTimeout(() => popEl(shelfEl.current, calm, 'thud'), calm ? 0 : 500);
      score.current += missed.current ? 5 : 10; if (!missed.current) clean.current++;
      popEl(ticketEl.current, calm, 'pop'); fx.burstAt(ticketEl.current, 'gold'); fx.floatAt(ticketEl.current, missed.current ? '+5' : '+10', 'gold');
      actor.cheer(1100);
    } else {
      const label = `${a} ${b}`;
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
      missed.current = true;
      setNote({ text: `${t('ap.wsNotChunk', '“{{pair}}” is not a chunk we use.', { pair: label })} ${item.explainWrong}`, tone: 'warn' });
      popEl(ticketEl.current, calm, 'wobble'); actor.flinch(1200);
      // a half that is right stays on the bench; the wrong half goes back to the cards
      if (!r.firstOk) setA(null);
      if (!r.secondOk) setB(null);
    }
  };

  const nextItem = () => {
    if (i < scene.items.length - 1) { setI(i + 1); setA(null); setB(null); setSnapped(false); setNote(null); missed.current = false; setSaid(undefined); actor.hold('thinking'); }
    else { setPhase('use'); setJ(0); setTyped(''); setTries(0); setSOk(false); missed.current = false; setSaid(undefined); actor.hold('thinking'); }
  };

  const check = () => {
    if (sOk) return;
    if (accepts(sent.sentence.accepts, typed)) {
      setSOk(true); setNote(null); setSaid(fillStem(sent.sentence.stem, sent.sentence.sample));
      score.current += tries === 0 ? 10 : 5; if (tries === 0) clean.current++;
      fx.burstAt(sentEl.current, 'gold'); fx.floatAt(sentEl.current, tries === 0 ? '+10' : '+5', 'gold'); popEl(sentEl.current, calm, 'pop');
      actor.cheer(1100);
    } else {
      setTries((n) => n + 1);
      if (!mistakes.current.includes(sent.sentence.stem)) mistakes.current.push(sent.sentence.stem);
      setNote({ text: sent.sentence.hint, tone: 'warn' });
      popEl(sentEl.current, calm, 'wobble'); actor.flinch(1200);
    }
  };
  const nextSentence = () => {
    if (j < scene.items.length - 1) { setJ(j + 1); setTyped(''); setTries(0); setSOk(false); setNote(null); setSaid(undefined); actor.hold('thinking'); return; }
    if (reported.current) return;
    reported.current = true; setPhase('done'); fx.confetti(); actor.hold('happy', 'cheer');
    onDone({ won: true, score: score.current, mistakes: mistakes.current });
  };

  const ready = !!a && !!b && !snapped;
  const [pre, post] = splitStem(sent.sentence.stem);

  return (
    <div className="av-game av-workshop" data-testid="av-workshop" data-phase={phase} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={snapped || sOk || phase === 'done'} tone="gold" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-ws-hud">
          <span className="av-pill av-title-pill">{scene.title}</span>
          <span className="av-pill">{phase === 'use' || phase === 'done' ? t('ap.wsUseStep', 'Use your chunks') : t('ap.wsItemN', 'Kit item {{n}} of {{m}}', { n: i + 1, m: scene.items.length })}</span>
          <span className="av-pill" data-tone="brand">{t('ap.wsShelfN', 'Shelf {{n}}/{{m}}', { n: shelf.length, m: scene.items.length })}</span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>

        <section className="av-panel av-game-card av-ws-panel" aria-live="polite">
          <div className="av-ws-bench">
            {phase === 'brief' && (
              <div className="av-fd-say"><p className="av-q">{scene.intro}</p><button type="button" className="av-btn" data-kind="go" onClick={() => setPhase('craft')}>{t('ap.start', 'Start')}</button></div>
            )}

            {phase === 'craft' && (
              <>
                <div className="av-ws-tag"><b>{item.kit}</b><span>{item.goal}</span></div>
                <div className="av-ws-ticket" ref={ticketEl} data-snap={snapped || undefined} data-ready={ready || undefined} role="img" aria-label={snapped ? chunk : `${a ?? '…'} ${b ?? '…'}`}>
                  <span className="av-ws-half" data-side="l" data-empty={!a || undefined}>{a ?? '…'}</span>
                  <span className="av-ws-perf" aria-hidden="true" />
                  <span className="av-ws-half" data-side="r" data-empty={!b || undefined}>{b ?? '…'}</span>
                </div>
                <div className="av-ws-rows" aria-hidden={snapped || undefined}>
                  <div className="av-ws-row" role="group" aria-label={t('ap.wsFirst', 'First half')}>
                    <small>{t('ap.wsFirst', 'First half')}</small>
                    <span>{item.first.options.map((o) => <button key={o} type="button" className="av-ws-card" data-on={a === o || undefined} aria-pressed={a === o} disabled={snapped} onClick={() => pickFirst(o)}>{o}</button>)}</span>
                  </div>
                  <div className="av-ws-row" role="group" aria-label={t('ap.wsSecond', 'Second half')}>
                    <small>{t('ap.wsSecond', 'Second half')}</small>
                    <span>{item.second.options.map((o) => <button key={o} type="button" className="av-ws-card" data-on={b === o || undefined} aria-pressed={b === o} disabled={snapped} onClick={() => pickSecond(o)}>{o}</button>)}</span>
                  </div>
                </div>
                {!snapped
                  ? <div className="av-fd-actions"><button type="button" className="av-btn" data-kind="go" disabled={!ready} onClick={press}>{t('ap.wsSnap', 'Snap them together')}</button>{!ready && <span className="av-fd-hint">{t('ap.wsPredict', 'Pick one card for each half. Will they snap? Decide first, then press.')}</span>}</div>
                  : <div className="av-fd-next"><p className="av-note" data-tone="good" role="status">{t('ap.wsSnapped', 'Snap! “{{chunk}}” is one chunk. Learn it as one piece.', { chunk })}</p><button type="button" className="av-btn" data-kind="go" onClick={nextItem}>{i < scene.items.length - 1 ? `${t('ap.wsNextItem', 'Next kit item')} ›` : `${t('ap.wsToSentences', 'Use them in sentences')} ›`}</button></div>}
              </>
            )}

            {(phase === 'use' || phase === 'done') && (
              <div className="av-ws-use">
                <p className="av-fd-hint">{t('ap.wsUseHint', 'Pick a chunk from the shelf, then change the verb so the sentence is right.')}</p>
                <div className="av-ws-sentence" ref={sentEl} data-ok={sOk || undefined}>
                  <span>{pre}</span>
                  <input type="text" value={typed} disabled={sOk || phase === 'done'} aria-label={sent.sentence.stem} placeholder="…" onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') check(); }} />
                  <span>{post}</span>
                </div>
                <div className="av-ws-shelfchips" role="group" aria-label={t('ap.wsShelf', 'Your shelf')}>
                  {shelf.map((c) => <button key={c} type="button" className="av-chip" disabled={sOk || phase === 'done'} onClick={() => setTyped(c)}>{c}</button>)}
                </div>
                {phase === 'use' && !sOk && <div className="av-fd-actions"><button type="button" className="av-btn" data-kind="go" disabled={!typed.trim()} onClick={check}>{t('ap.check', 'Check')}</button>{tries > 1 && <span className="av-fd-hint">{sent.sentence.sample}</span>}</div>}
                {phase === 'use' && sOk && <div className="av-fd-next"><p className="av-note" data-tone="good" role="status">{fillStem(sent.sentence.stem, sent.sentence.sample)}</p><button type="button" className="av-btn" data-kind="go" onClick={nextSentence}>{j < scene.items.length - 1 ? `${t('ap.next', 'Next')} ›` : t('ap.finish', 'Finish the lesson')}</button></div>}
              </div>
            )}

            {note && phase !== 'done' && <p className="av-note av-fd-note-line" data-tone={note.tone} role="status">{note.text}</p>}
            {phase === 'done' && <Reward score={score.current} stars={starsFor(clean.current, total)} gem={mistakes.current.length === 0} calm={calm} />}
          </div>

          <aside className="av-ws-shelf" ref={shelfEl} aria-label={t('ap.wsShelf', 'Your shelf')}>
            <h3>{t('ap.wsShelf', 'Your shelf')}</h3>
            <ul>
              {scene.items.map((_, k) => <li key={k} data-full={!!shelf[k] || undefined}>{shelf[k] ?? ''}</li>)}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}

export const workshopScene: SceneModule<WorkshopScene> = {
  view: WorkshopView,
  spoken: (s) => [{ who: s.who, text: s.intro }, ...s.items.flatMap((it) => [{ who: s.who, text: chunkOf(it) }, { who: s.who, text: fillStem(it.sentence.stem, it.sentence.sample) }])],
  validate: (s) => {
    const p: string[] = [];
    if (!s.intro?.trim()) p.push(`${s.id}: workshop needs an intro`);
    if ((s.items?.length ?? 0) < 2 || s.items.length > 5) p.push(`${s.id}: workshop needs 2-5 kit items`);
    s.items?.forEach((it, k) => {
      const l = `${s.id} item ${k + 1}`;
      if (it.first.options.length !== 3 || it.second.options.length !== 3) p.push(`${l}: each half needs exactly three cards`);
      if (!it.first.options.includes(it.first.correct)) p.push(`${l}: the right first half is not among the cards`);
      if (!it.second.options.includes(it.second.correct)) p.push(`${l}: the right second half is not among the cards`);
      if (new Set(it.first.options).size !== 3 || new Set(it.second.options).size !== 3) p.push(`${l}: duplicate cards`);
      // every wrong pair must really be wrong: the only snap is the chunk
      const snaps = it.first.options.flatMap((x) => it.second.options.map((y) => halvesFit(it, x, y).ok ? `${x} ${y}` : null)).filter(Boolean);
      if (snaps.length !== 1) p.push(`${l}: exactly one pair may snap`);
      if (!it.goal?.trim() || !it.kit?.trim() || !it.explainWrong?.trim()) p.push(`${l}: needs goal, kit and explainWrong`);
      if (!it.sentence.stem.includes('___')) p.push(`${l}: the sentence stem needs a blank (___)`);
      try { if (!accepts(it.sentence.accepts, it.sentence.sample)) p.push(`${l}: the sample sentence is not accepted by its own patterns`); } catch { p.push(`${l}: a sentence pattern is not a valid regex`); }
      try { if (accepts(it.sentence.accepts, chunkOf(it)) && /\b(went|going)\b/i.test(it.sentence.sample)) p.push(`${l}: the bare chunk must not pass an inflected gap`); } catch { /* reported above */ }
    });
    return p;
  },
};
