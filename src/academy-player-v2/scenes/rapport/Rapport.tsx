// Rapport (dialogue RPG): an NPC (a cast member) asks; the student picks the reply that sounds most natural. Best reply +2, fine +1, off -> 0.
// Every choice is explained, there is no fail state (comfort): the bar shows how well the conversation went; weak replies go to the Mistake Bank.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx, type Mood } from '../kit';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface RapportScene extends SceneBase {
  kind: 'rapport'; title: string; npc: CastName;
  exchanges: { say: string; options: { text: string; score: 0 | 1 | 2; reply: string; note: string }[] }[];
}

function RapportView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<RapportScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [pts, setPts] = useState(0);
  const [fin, setFin] = useState(false);
  const mistakes = useRef<string[]>([]);
  const optEls = useRef<(HTMLButtonElement | null)[]>([]);
  const ex = scene.exchanges[i];
  const max = scene.exchanges.length * 2;
  const actor = useReactor('neutral');
  const last = i === scene.exchanges.length - 1;
  useSay(scene.npc, pick === null ? ex.say : ex.options[pick].reply, artBase);
  const choose = (n: number) => {
    if (pick !== null) return;
    const sc = ex.options[n].score;
    setPick(n);
    setPts((p) => p + sc);
    if (sc === 0) mistakes.current.push(ex.options[n].text);
    const mood: Mood = sc === 2 ? 'happy' : sc === 1 ? 'curious' : 'thinking';
    actor.hold(mood, sc === 2 ? 'cheer' : sc === 1 ? 'nod' : 'flinch');
    const el = optEls.current[n];
    popEl(el, calm, sc === 0 ? 'wobble' : 'pop');
    if (sc > 0) { fx.burstAt(el, 'teal'); fx.floatAt(el, sc === 2 ? '✦✦' : '✦', 'teal'); }
    if (last && sc > 0) fx.confetti();
  };
  const next = () => {
    if (last) { if (!fin) { setFin(true); onDone({ won: true, score: pts * 5, mistakes: mistakes.current }); } return; }
    setI(i + 1); setPick(null); actor.hold('neutral');
  };
  const rp = Math.min(1, pts / max);
  const orbs = scene.exchanges.map((_, k) => Math.max(0, Math.min(2, pts - k * 2)) / 2);
  return (
    <div className="av-game av-rapport" data-testid="av-rapport" style={{ ['--rp' as string]: rp }}>
      <GameBackdrop /><Glow on={rp >= 0.5} tone="teal" />
      <Cast who={scene.npc} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-rapport-card">
          <header className="av-card-head">
            <h2>{scene.title}</h2>
            <div className="av-boss-hp av-rapport-bar" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={pts}>
              <span>{scene.npc}</span>
              <div className="av-orbs">{orbs.map((o, k) => <i key={k} style={{ ['--f' as string]: o }} data-on={o > 0 || undefined} />)}</div>
            </div>
            <Badge who={scene.npc} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          <div className="av-bubble" key={`${i}-${pick}`}>
            <p className="av-q"><b className="av-npc">{scene.npc}</b> {pick === null ? ex.say : ex.options[pick].reply}</p>
          </div>
          <div className="av-opts av-wheel" role="group" aria-label={t('ap.chooseOne', 'Choose one')} data-picked={pick !== null || undefined} key={i}>
            {ex.options.map((o, n) => <button key={n} ref={(el) => { optEls.current[n] = el; }} type="button" className="av-opt" style={{ ['--i' as string]: n }} data-chosen={pick === n || undefined} data-state={pick === null ? undefined : n === pick ? (o.score === 0 ? 'wrong' : 'right') : undefined} disabled={pick !== null} onClick={() => choose(n)}>{o.text}</button>)}
          </div>
          {pick !== null && <>
            <p className="av-note av-why" data-ok={ex.options[pick].score > 0 || undefined}>{ex.options[pick].note}</p>
            {last && <Reward score={pts * 5} stars={starsFor(scene.exchanges.length - mistakes.current.length, scene.exchanges.length)} gem={mistakes.current.length === 0} calm={calm} tone="teal" />}
            <button type="button" className="av-btn" data-kind="go" onClick={next}>{last ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button>
          </>}
        </section>
      </div>
    </div>
  );
}

export const rapportScene: SceneModule<RapportScene> = {
  view: RapportView,
  spoken: (s) => s.exchanges.flatMap((e) => [{ who: s.npc, text: e.say }, ...e.options.map((o) => ({ who: s.npc, text: o.reply }))]),
  validate: (s) => {
    const p: string[] = [];
    if ((s.exchanges?.length ?? 0) < 2) p.push(`${s.id}: rapport needs 2+ exchanges`);
    s.exchanges?.forEach((e, i) => {
      if (e.options.length < 2 || e.options.length > 4) p.push(`${s.id}: exchange ${i + 1} needs 2-4 replies`);
      if (!e.options.some((o) => o.score === 2)) p.push(`${s.id}: exchange ${i + 1} needs a best reply (score 2)`);
      if (e.options.some((o) => !o.note.trim())) p.push(`${s.id}: exchange ${i + 1}: every reply needs a note (why)`);
    });
    return p;
  },
};
