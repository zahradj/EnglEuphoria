import { useTranslation } from 'react-i18next';
import { lessonMeta } from '../../shell/lessonMeta';
import { PART_COUNT, type SceneBase, type SceneModule, type SceneProps } from '../../types';

export interface LobbyScene extends SceneBase { kind: 'lobby'; heading: string; sub?: string }

function LobbyView({ scene, script, onDone, artBase }: SceneProps<LobbyScene>) {
  const { t } = useTranslation();
  const meta = lessonMeta(script);
  const total = script.partMinutes.reduce((a, b) => a + b, 0);
  return (
    <div className="av-lobby" data-testid="av-lobby">
      <div className="av-lobby-hero">
        <span className="av-pill">EnglEuphoria Academy · {meta.where}</span>
        <h1>{scene.heading}</h1>
        {scene.sub && <span className="av-sub">{scene.sub}</span>}
        <div className="av-crew">
          {script.cast.map((c) => (
            <span key={c}><img src={`${artBase}/cast/${c.toLowerCase()}/happy.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />{c}</span>
          ))}
        </div>
      </div>
      <div className="av-lobby-side">
        {meta.chapter && (
          <section className="av-panel av-chapcard" data-chapter>
            <h2>{t('ap.chapter', 'Chapter {{n}} of 8', { n: meta.chapter.no })} · {meta.chapter.title}</h2>
            <h3>{meta.chapter.question}</h3>
            {meta.chapter.essentialQuestion && meta.chapter.no < PART_COUNT && <p>{t('ap.bigQuestion', 'The Season’s big question')}: {meta.chapter.essentialQuestion}</p>}
          </section>
        )}
        <section className="av-panel">
          <h2>{t('ap.mission', 'Your mission')}</h2>
          <ul className="av-mission">{script.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </section>
        <section className="av-panel">
          <h2>{t('ap.quest', 'The quest · {{n}} min', { n: total })}</h2>
          <div className="av-path">{script.partMinutes.map((m, i) => <em key={i}>{i + 1} · {m} min</em>)}</div>
        </section>
      </div>
      <div className="av-lobby-go"><button type="button" className="av-btn" data-kind="warm" onClick={() => onDone()}>{t('ap.start', 'Start the mission')} →</button></div>
    </div>
  );
}

export const lobbyScene: SceneModule<LobbyScene> = {
  view: LobbyView,
  spoken: () => [],
  validate: (s) => (s.heading?.trim() ? [] : [`${s.id}: lobby needs a heading`]),
};
