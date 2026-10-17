// Dare Deck (B1-S01-E1): the cards the student earned are laid out as sticker cards on the bucket-list wall; they keep THREE for their own list.
// Picking is private and has no wrong answer (a choice, not a test); a short line says why each card is a good dare. Deck-building mechanic (Slay the Spire): the final list is chosen, not given.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, useReactor, useSceneFx } from '../kit';
import { useSay } from '../useSay';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface DeckScene extends SceneBase {
  kind: 'deck'; title: string; who: CastName; intro: string; keep: number;
  /** art = a sticker in public/academy-art/cards (no extension); text = the dare; frame = how to say it */
  cards: { id: string; art: string; text: string; frame: string }[];
}

function DeckView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<DeckScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('happy');
  const [picked, setPicked] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const els = useRef<Record<string, HTMLButtonElement | null>>({});
  useSay(scene.who, scene.intro, artBase);
  const toggle = (id: string) => {
    if (locked) return;
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= scene.keep) return p;
      popEl(els.current[id] ?? null, calm, 'pop'); fx.burstAt(els.current[id] ?? null, 'gold');
      return [...p, id];
    });
  };
  const lock = () => { setLocked(true); actor.cheer(1800); fx.confetti(); onDone({ won: true, score: 30, mistakes: [] }); };
  const chosen = scene.cards.filter((c) => picked.includes(c.id));
  return (
    <div className="av-game av-deck" data-testid="av-deck" data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={locked} tone="gold" />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="right" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-deck-card">
          <header className="av-card-head">
            <h2>{scene.title} · {picked.length}/{scene.keep}</h2>
            <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          <p className="av-q">{scene.intro}</p>
          <div className="av-deck-grid" role="group" aria-label={t('ap.deckCards', 'Dare cards')}>
            {scene.cards.map((c, n) => (
              <button key={c.id} ref={(el) => { els.current[c.id] = el; }} type="button" className="av-dare" style={{ ['--i' as string]: n }} data-on={picked.includes(c.id) || undefined} aria-pressed={picked.includes(c.id)} onClick={() => toggle(c.id)}>
                <img src={`${artBase}/cards/${c.art}.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
                <b>{c.text}</b>
              </button>
            ))}
          </div>
          {chosen.length > 0 && <ol className="av-deck-list" aria-label={t('ap.myList', 'My list')}>{chosen.map((c) => <li key={c.id}>{c.frame}</li>)}</ol>}
          {!locked && <button type="button" className="av-btn" data-kind="go" disabled={picked.length !== scene.keep} onClick={lock}>{t('ap.keepDeck', 'Keep these {{n}}', { n: scene.keep })}</button>}
          {locked && <Reward score={30} stars={3} gem={false} calm={calm} />}
        </section>
      </div>
    </div>
  );
}

export const deckScene: SceneModule<DeckScene> = {
  view: DeckView,
  spoken: (s) => [{ who: s.who, text: s.intro }],
  art: (s) => s.cards.map((c) => `cards/${c.art}`),
  validate: (s) => {
    const p: string[] = [];
    if (!s.intro?.trim()) p.push(`${s.id}: deck needs the intro`);
    if ((s.cards?.length ?? 0) < s.keep + 2) p.push(`${s.id}: deck needs at least keep + 2 cards (a real choice)`);
    if (!(s.keep >= 2 && s.keep <= 5)) p.push(`${s.id}: keep 2-5 cards`);
    for (const c of s.cards ?? []) if (!/^I /.test(c.frame)) p.push(`${s.id}: card "${c.text}" needs a frame like "I want to ..."`);
    return p;
  },
};
