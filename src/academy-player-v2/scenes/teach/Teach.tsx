// Teach the words: one page per word (sticker picture, meaning, example, clue); the teacher voice says the word, the meaning and the example, the student says it and ticks.
// Whole chunks are shown as one piece. A matching game and another game with the same words follow in the lesson (owner rule).
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import { Badge, Cast, flyClone, GameBackdrop, Reward, useReactor, useSceneFx } from '../kit';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface TeachPage { word: string; art: string; meaning: string; example: string; clue?: string }
export interface TeachScene extends SceneBase { kind: 'teach'; title: string; who: CastName; pages: TeachPage[] }

function TeachView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<TeachScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('talk');
  const [i, setI] = useState(0);
  const [fin, setFin] = useState(false);
  const cardEl = useRef<HTMLDivElement>(null);
  const pipEls = useRef<(HTMLElement | null)[]>([]);
  const pg = scene.pages[i];
  useSay(scene.who, `${pg.word}. ${pg.meaning}. ${pg.example}`, artBase);
  const next = () => {
    const pip = pipEls.current[i];
    flyClone(cardEl.current, pip, calm, 480);
    fx.burstAt(pip ?? cardEl.current, 'lilac'); fx.floatAt(pip ?? cardEl.current, '✦', 'lilac');
    if (i === scene.pages.length - 1) { setFin(true); fx.confetti(); actor.hold('happy', 'cheer'); onDone(); } else { setI(i + 1); actor.cheer(1200); }
  };
  const collected = fin ? scene.pages.length : i;
  return (
    <div className="av-game av-teach" data-testid="av-teach">
      <GameBackdrop />
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-teach-card">
          <header className="av-card-head">
            <h2>{scene.title} · {Math.min(i + 1, scene.pages.length)}/{scene.pages.length}</h2>
            <span className="av-deck" role="img" aria-label={t('ap.wordCards', 'Word Cards')}>{scene.pages.map((_, k) => <i key={k} ref={(el) => { pipEls.current[k] = el; }} data-on={k < collected || undefined} />)}</span>
            <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          {!fin && (
            <div className="av-wordcard-stack">
              {scene.pages.length - i > 2 && <i className="av-wc-under" data-k="2" />}
              {scene.pages.length - i > 1 && <i className="av-wc-under" data-k="1" />}
              <div className="av-wordcard av-teach-body" ref={cardEl} key={i}>
                <img src={`${artBase}/cards/${pg.art}.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
                <div>
                  <p className="av-teach-word">{pg.word}</p>
                  <p className="av-teach-mean">{pg.meaning}</p>
                  <p className="av-teach-ex">“{pg.example}”</p>
                  {pg.clue && <p className="av-note">{pg.clue}</p>}
                </div>
              </div>
            </div>
          )}
          {fin && <Reward score={scene.pages.length} unit={t('ap.wordCards', 'Word Cards')} calm={calm} tone="lilac" />}
          {!fin && <button type="button" className="av-btn" data-kind="go" onClick={next}>{t('ap.sayIt', 'Say it out loud, then tap ✓')}</button>}
        </section>
      </div>
    </div>
  );
}

export const teachScene: SceneModule<TeachScene> = {
  view: TeachView,
  spoken: (s) => s.pages.map((p) => ({ who: s.who, text: `${p.word}. ${p.meaning}. ${p.example}` })),
  art: (s) => s.pages.map((p) => `cards/${p.art}`),
  validate: (s) => {
    const p: string[] = [];
    if (!s.pages?.length) return [`${s.id}: teach has no pages`];
    if (s.pages.length > 7) p.push(`${s.id}: a word set is at most 7 words (has ${s.pages.length})`);
    s.pages.forEach((x, i) => { if (!x.meaning?.trim() || !x.example?.trim() || !x.art) p.push(`${s.id}: page ${i + 1} needs a meaning, an example and a picture`); });
    return p;
  },
};
