// Teach the words: one page per word (sticker picture, meaning, example, clue); the teacher voice says the word, the meaning and the example, the student says it and ticks.
// Whole chunks are shown as one piece. A matching game and another game with the same words follow in the lesson (owner rule).
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface TeachPage { word: string; art: string; meaning: string; example: string; clue?: string }
export interface TeachScene extends SceneBase { kind: 'teach'; title: string; who: CastName; pages: TeachPage[] }

function TeachView({ scene, onDone, artBase }: SceneProps<TeachScene>) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const pg = scene.pages[i];
  useSay(scene.who, `${pg.word}. ${pg.meaning}. ${pg.example}`, artBase);
  const next = () => { if (i === scene.pages.length - 1) onDone(); else setI(i + 1); };
  return (
    <div className="av-teach" data-testid="av-teach">
      <section className="av-panel av-teach-card">
        <h2>{scene.title} · {i + 1}/{scene.pages.length}</h2>
        <div className="av-teach-body">
          <img src={`${artBase}/cards/${pg.art}.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
          <div>
            <p className="av-teach-word">{pg.word}</p>
            <p className="av-teach-mean">{pg.meaning}</p>
            <p className="av-teach-ex">“{pg.example}”</p>
            {pg.clue && <p className="av-note">{pg.clue}</p>}
          </div>
        </div>
        <button type="button" className="av-btn" data-kind="go" onClick={next}>{t('ap.sayIt', 'Say it out loud, then tap ✓')}</button>
      </section>
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
