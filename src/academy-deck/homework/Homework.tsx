import type React from 'react';
// The homework app: a hub, an adventure map of chests (one 10-minute practice each), free play and the teacher's view.
// Design from the owner's Novakid references (mechanics only, never their content or childish style): home tiles, a chest path with 3 check marks per
// chest, star progress, a guide character. Left out on purpose: live countdowns, leaderboards, mascots (Academy rules). Progress is saved in the browser
// for now (a stand-in for the database, which is not connected yet).
import { useCallback, useMemo, useState } from 'react';
import './homework.css';
import { Deck } from '../Deck';
import { Icon } from '../Icon';
import { SIGN_ME_UP } from '../lessons/signMeUp';
import { Plate } from '../Stage';
import type { DeckScript, Slide } from '../types';
import { applyResult, chestState, loadProgress, saveProgress, starsFor, totalStars, weakItems, availableOn, type Chest, type HwProgress } from './quest';
import { GUIDE, LESSON_ID, SIGN_ME_UP_QUEST } from './signMeUpQuest';

type View = 'hub' | 'quest' | 'play' | 'result' | 'games' | 'free' | 'words' | 'teacher';
const todayISO = () => new Date().toISOString().slice(0, 10);

function ChestArt({ state, stars, artBase }: { state: 'done' | 'open' | 'waiting' | 'locked'; stars: number; artBase?: string }) {
  if (!artBase) return <span className="hw-chest-svg" data-state={state} aria-hidden="true" />;
  return (
    <span className="hw-chest-svg hw-chest-img" data-state={state} aria-hidden="true">
      <img src={`${artBase}/objects/${state === 'done' ? 'chest-open' : 'chest'}.webp`} alt="" draggable={false} />
      {stars > 0 && <b className="hw-chest-stars">{stars}/3</b>}
    </span>
  );
}

const Stars = ({ n, big = false }: { n: number; big?: boolean }) => (
  <span className={`hw-stars ${big ? 'hw-stars-big' : ''}`} aria-label={`${n} of 3 stars`}>
    {[1, 2, 3].map((k) => <i key={k} className={k <= n ? 'hw-star-img on' : 'hw-star-img'} />)}
  </span>
);

export interface HomeworkProps {
  artBase?: string;
  /** 'YYYY-MM-DD' of the lesson (the first chest opens the day after) */
  lessonDate?: string;
  /** the prototype lets you open every chest in order; the real schedule unlocks them on calendar days */
  demo?: boolean;
}

export function HomeworkApp({ artBase, lessonDate = todayISO(), demo = true }: HomeworkProps) {
  const chests = SIGN_ME_UP_QUEST;
  const [view, setView] = useState<View>('hub');
  const [progress, setProgress] = useState<HwProgress>(() => loadProgress(LESSON_ID));
  const [chest, setChest] = useState<Chest | null>(null);
  const [freeScript, setFreeScript] = useState<DeckScript | null>(null);
  const [last, setLast] = useState<{ chest: Chest; stars: number; wrong: number } | null>(null);
  const results = useMemo<{ slideId: string; items: string[]; wrong: number }[]>(() => [], [chest]);
  const today = todayISO();
  const save = useCallback((p: HwProgress) => { setProgress(p); saveProgress(LESSON_ID, p); }, []);

  const onSlideDone = useCallback((s: Slide, r: { wrong: number }) => {
    if (!results.some((x) => x.slideId === s.id)) results.push({ slideId: s.id, items: s.items ?? [], wrong: r.wrong });
  }, [results]);
  const finish = useCallback(() => {
    if (!chest) return;
    const wrong = results.reduce((a, r) => a + r.wrong, 0);
    save(applyResult(progress, chest, results, today));
    setLast({ chest, stars: starsFor(wrong), wrong });
    setView('result');
  }, [chest, results, progress, save, today]);

  const play = (c: Chest) => { setChest(c); setView('play'); };
  const script = useMemo<DeckScript | null>(() => chest ? { lessonId: `${LESSON_ID}-hw${chest.id}`, level: 'A1', title: chest.title, objective: '', criteria: [], cast: ['Vee', 'Ava', 'Theo'], slides: chest.slides } : null, [chest]);

  const shell = (children: React.ReactNode, bg = 'club-lobby', title?: string, back?: View) => (
    <div className="hw-root" data-view={view} style={artBase ? ({ ['--o-star' as string]: `url(${artBase}/objects/star.webp)`, ['--o-gem-empty' as string]: `url(${artBase}/objects/gem-empty.webp)`, ['--o-gem-full' as string]: `url(${artBase}/objects/gem-full.webp)` } as React.CSSProperties) : undefined}>
      <Plate id={bg} artBase={artBase} />
      <header className="hw-top">
        {back ? <button type="button" className="hw-back" onClick={() => setView(back)} aria-label="Back">◀</button> : <span className="hw-guide"><img src={artBase ? `${artBase}/cast/vee/happy.webp` : ''} alt="Vee, your guide" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} /></span>}
        <h1 className="hw-title">{title ?? 'Daily 10'}</h1>
        <span className="hw-chips"><span className="hw-chip"><Icon name="star" className="hw-star on" /> {totalStars(progress)}</span><span className="hw-chip" title="Days practised">{progress.days.length} {progress.days.length === 1 ? 'day' : 'days'}</span></span>
      </header>
      <main className="hw-main">{children}</main>
    </div>
  );

  if (view === 'play' && script && chest) {
    return (
      <div className="hw-play" key={chest.id}>
        <Deck script={script} artBase={artBase} homework={{ label: chest.title }} onSlideDone={onSlideDone} onFinish={finish} />
        <button type="button" className="hw-exit" onClick={() => setView('quest')}><Icon name="skip" /> Leave this chest</button>
      </div>
    );
  }
  if (view === 'free' && freeScript) {
    return (
      <div className="hw-play">
        <Deck script={freeScript} artBase={artBase} homework={{ label: 'Free play' }} onFinish={() => setView('games')} />
        <button type="button" className="hw-exit" onClick={() => setView('games')}><Icon name="skip" /> Back to games</button>
      </div>
    );
  }
  if (view === 'words') {
    const slides = SIGN_ME_UP.slides.filter((s) => s.kind === 'teach' || s.id === 'model-signup');
    return (
      <div className="hw-play">
        <Deck script={{ ...SIGN_ME_UP, slides }} artBase={artBase} homework={{ label: 'Words' }} onFinish={() => setView('hub')} />
        <button type="button" className="hw-exit" onClick={() => setView('hub')}><Icon name="skip" /> Back</button>
      </div>
    );
  }
  if (view === 'result' && last) {
    return shell(
      <section className="hw-result">
        <div className="hw-confetti" aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ ['--x' as string]: `${(i * 37) % 100}%`, ['--d' as string]: `${(i % 9) * 0.18}s`, ['--c' as string]: ['#fde047', '#a78bfa', '#38bdf8', '#4ade80', '#fb923c'][i % 5], ['--s' as string]: `${8 + (i % 4) * 3}px` }} />)}</div>
        <div className="hw-rays" aria-hidden="true" />
        <div className="hw-result-chest"><ChestArt artBase={artBase} state="done" stars={last.stars} /></div>
        <h2>{last.chest.title} complete!</h2>
        <Stars n={last.stars} big />
        <p>{last.wrong === 0 ? 'Not one mistake. Amazing!' : last.wrong <= 1 ? 'Almost perfect.' : 'Every try makes the words stronger.'}</p>
        <div className="hw-row"><button type="button" className="hw-btn hw-btn-primary" onClick={() => setView('quest')}>Back to the map</button></div>
      </section>, 'club-lobby', 'Well done');
  }
  if (view === 'quest') {
    return shell(
      <section className="hw-map" aria-label="Adventure quest">
        <ol className="hw-path">
          {chests.map((c, i) => {
            const st = chestState(chests, progress, c.id, today, lessonDate, demo);
            const on = availableOn(chests, progress, c.id, lessonDate);
            return (
              <li key={c.id} className="hw-stop" data-state={st} style={{ ['--i' as string]: i }}>
                <span className="hw-checks" aria-hidden="true">{c.slides.map((_, k) => <i key={k} data-on={st === 'done' ? k < (progress.stars[c.id] ? 3 : 0) : false}><Icon name="check" /></i>)}</span>
                <button type="button" className="hw-chest" disabled={st === 'locked' || st === 'waiting'} onClick={() => play(c)} aria-label={`${c.title}: ${st === 'done' ? 'done, play again' : st === 'open' ? 'ready' : st === 'waiting' ? `opens on ${on}` : 'locked'}`}>
                  <ChestArt artBase={artBase} state={st} stars={progress.stars[c.id] ?? 0} />
                  <b className="hw-num">{c.id}</b>
                </button>
                <span className="hw-stop-title">{c.title}</span>
                {st === 'waiting' && on && <span className="hw-when">opens {on}</span>}
                {st === 'done' && <Stars n={progress.stars[c.id] ?? 0} />}
              </li>
            );
          })}
        </ol>
        <p className="hw-note">Each chest is 10 minutes of short games. {demo ? 'Demo: you can open the chests in order. In real use they open on calendar days.' : 'The next chest opens on its day.'}</p>
      </section>, 'club-lobby', 'Adventure quest', 'hub');
  }
  if (view === 'games') {
    const all = chests.flatMap((c) => c.slides.map((s) => ({ c, s })));
    const names: Record<string, string> = { shadow: 'Shadow match', lockers: 'Locker Pop', hunt: 'Hidden numbers', border: 'Border control', memory: 'Memory', numtrain: 'Number train', spell: 'Spell it', phonechat: 'Text chat', padlock: 'Padlock', findwrong: 'Detective', convo: 'Conversation' };
    return shell(
      <section className="hw-tiles hw-tiles-games" aria-label="Free play">
        {all.map(({ s }) => (
          <button key={s.id} type="button" className="hw-tile hw-tile-sm" onClick={() => { setFreeScript({ ...SIGN_ME_UP, lessonId: `free-${s.id}`, slides: [s] }); setView('free'); }}>
            <span className="hw-tile-bg"><Plate id={s.bg} artBase={artBase} /></span>
            <span className="hw-tile-label">{names[s.kind] ?? s.kind}</span>
          </button>
        ))}
      </section>, 'club-lobby', 'Games', 'hub');
  }
  if (view === 'teacher') {
    const weak = weakItems(progress);
    return shell(
      <section className="hw-teacher">
        <h2>For the teacher</h2>
        <p>Practice days: <b>{progress.days.length}</b> · Chests finished: <b>{Object.keys(progress.doneAt).length} of {chests.length}</b> · Games logged: <b>{progress.log.length}</b> item results</p>
        <h3>Start the next Remember? with these items</h3>
        {weak.length === 0 ? <p className="hw-note">No results yet. Play a chest first.</p> : (
          <table className="hw-table"><thead><tr><th>Item</th><th>Right first time</th><th>Tries</th></tr></thead><tbody>
            {weak.slice(0, 10).map((w) => <tr key={w.item} data-weak={w.rate < 0.7}><td>{w.item}</td><td>{Math.round(w.rate * 100)}%</td><td>{w.tries}</td></tr>)}
          </tbody></table>
        )}
        <p className="hw-note">Right-first-time is per game, per day. It is evidence for the next lesson, not a grade. Results are saved in this browser until the database is connected.</p>
        <div className="hw-row"><button type="button" className="hw-btn" onClick={() => save({ stars: {}, doneAt: {}, days: [], log: [] })}>Reset the demo</button></div>
      </section>, 'detective-wall', 'Teacher view', 'hub');
  }
  // hub
  const doneN = Object.keys(progress.doneAt).length;
  const tiles: { id: View; label: string; sub: string; bg: string; icon: string }[] = [
    { id: 'quest', label: 'Quest', sub: `${doneN} of ${chests.length} chests`, bg: 'locker-hall', icon: 'star' },
    { id: 'games', label: 'Games', sub: 'play any game', bg: 'border-control', icon: 'sparkle' },
    { id: 'words', label: 'Words', sub: 'see them again', bg: 'club-signup-desk', icon: 'abc' },
    { id: 'teacher', label: 'Teacher', sub: 'results', bg: 'detective-wall', icon: 'note' },
  ];
  return shell(
    <section className="hw-tiles" aria-label="Home">
      {tiles.map((t, i) => (
        <button key={t.id} type="button" className="hw-tile" style={{ ['--i' as string]: i }} onClick={() => setView(t.id)}>
          <span className="hw-tile-bg"><Plate id={t.bg} artBase={artBase} /></span>
          <span className="hw-tile-icon"><Icon name={t.icon} /></span>
          <span className="hw-tile-label">{t.label}</span>
          <span className="hw-tile-sub">{t.sub}</span>
        </button>
      ))}
    </section>, 'club-lobby', 'Daily 10 · Sign Me Up');
}
