// Wrap = QUEST COMPLETE: stars, rank, the loot recap, the objectives ticked, the Season clue (unlocked when the student says the rule back), and what comes next.
// Without a quest recap (a scene rendered alone) it falls back to the plain card: XP, gems, what to practise.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import { CountUp, Reward, useSceneFx } from '../kit';
import { Icon } from '../../quest/icons';
import { rankLabel } from '../../quest/Hud';
import { questName, shortObjective } from '../../quest/text';
import { lessonMeta } from '../../shell/lessonMeta';
import { ACADEMY_LESSON_BLUEPRINTS } from '../../../curriculum/academy';
import { chapterOfLesson } from '../../../curriculum/academy/arcs';
import type { QuestRecap } from '../../engine/quest';
import type { LessonScript, SceneBase, SceneModule, SceneProps } from '../../types';

export interface WrapScene extends SceneBase { kind: 'wrap'; heading: string; teachBack: string }

/** the chapter that comes after this lesson's, if the Season has one */
function nextChapterOf(blueprintId: string): { no: number; title: string } | undefined {
  const m = /^(.+-S\d+)-E(\d)$/.exec(blueprintId);
  if (!m || Number(m[2]) >= 8) return undefined;
  const id = `${m[1]}-E${Number(m[2]) + 1}`;
  const c = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === id)?.chapter ?? chapterOfLesson(id);
  return c ? { no: c.no, title: c.title } : undefined;
}

function QuestComplete({ scene, script, recap, said, onSaid, artBase, calm, mistakes }: { scene: WrapScene; script: LessonScript; recap: QuestRecap; said: boolean; onSaid: () => void; artBase: string; calm: boolean; mistakes: string[] }) {
  const { t } = useTranslation();
  const meta = useMemo(() => lessonMeta(script), [script]);
  const next = nextChapterOf(script.blueprintId);
  const cards = recap.loot.filter((l) => l.kind === 'wordcard');
  const trophies = recap.loot.filter((l) => l.kind === 'trophy').length;
  const clues = recap.loot.filter((l) => l.kind === 'clue').length;
  const gemTotal = recap.potential.filter((l) => l.kind === 'gem').length;
  const lv = recap.level;
  const clueNo = meta.chapter?.no ?? 1;
  return (
    <div className="av-wrap av-qc" data-testid="av-wrap">
      <section className="av-panel av-wrap-card av-qc-card" data-testid="av-questcomplete">
        <header className="av-qc-head">
          <span className="avq-stamp"><Icon name="flag" size={18} /> {t('ap.questComplete', 'QUEST COMPLETE')}<i className="avq-intro-sweep" aria-hidden="true" /></span>
          <h2>{scene.heading}</h2>
          <p className="avq-sub">{questName(script, meta)}{meta.chapter ? ` · ${t('ap.chapter', 'Chapter {{n}} of 8', { n: meta.chapter.no })}` : ''}</p>
        </header>
        <div className="av-qc-grid">
          <div className="av-qc-left">
            <Reward score={recap.xp} stars={recap.stars} gem={recap.gems > 0} calm={calm} />
            <div className="avq-rank avq-rank-big" data-level={lv.level}>
              <span className="avq-lvl"><small>{t('ap.lvl', 'LV')}</small><b>{lv.level}</b></span>
              <span className="avq-rank-body">
                <span className="avq-rank-name">{rankLabel(t, lv.rank)}</span>
                <span className="avq-xpbar" role="progressbar" aria-label={t('ap.xp', 'XP')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.fill * 100)}><i style={{ width: `${Math.round(lv.fill * 100)}%` }} /></span>
              </span>
            </div>
            <ul className="av-qc-stats" aria-label={t('ap.recap', 'Recap')}>
              <li><b><CountUp to={recap.stagesCleared} calm={calm} ms={700} />/8</b>{t('ap.stagesCleared', 'stages cleared')}</li>
              <li><b><CountUp to={recap.clean} calm={calm} ms={700} />/{recap.scored}</b>{t('ap.cleanWins', 'first-try wins')}</li>
              <li><b>{recap.bestStreak}</b>{t('ap.bestStreak', 'best streak')}</li>
            </ul>
            <h3>{t('ap.lootRecap', 'Loot')}</h3>
            <div className="av-qc-loot" data-testid="av-qc-loot">
              <span className="avq-loot-chip" data-kind="gem"><Icon name="gem" size={18} /><b>{recap.gems}</b>/{gemTotal}</span>
              {trophies > 0 && <span className="avq-loot-chip" data-kind="trophy"><Icon name="trophy" size={18} /><b>{trophies}</b></span>}
              {clues > 0 && <span className="avq-loot-chip" data-kind="clue"><Icon name="pin" size={18} /><b>{clues}</b></span>}
              {cards.map((c, i) => <img key={c.id} className="avq-loot-card" src={`${artBase}/${c.art}.webp`} alt={c.label} title={c.label} draggable={false} style={{ animationDelay: `${i * 90}ms` }} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />)}
            </div>
            <h3>{t('ap.teachBack', 'Say the rule in your own words')}</h3>
            <p className="av-q">{scene.teachBack}</p>
            {!said && <button type="button" className="av-btn" data-kind="go" onClick={onSaid}>{t('ap.sayIt', 'Say it out loud, then tap ✓')}</button>}
            {said && <p className="av-note" data-ok="true">{t('ap.wellDone', 'Well done!')}</p>}
          </div>
          <div className="av-qc-right">
            <h3>{t('ap.objectives', 'Objectives')} <b>{recap.objectives.filter((o) => o.complete).length}/{recap.objectives.length}</b></h3>
            <ul className="avq-objs avq-objs-sm">
              {recap.objectives.map((o) => (
                <li key={o.n} data-done={o.complete || undefined}>
                  <span className="avq-box" data-on={o.complete || undefined} aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} /></svg></span>
                  <span>{shortObjective(o.text)}</span>
                </li>
              ))}
            </ul>
            <div className="avq-clue" data-unlocked={said || undefined} data-testid="av-clue">
              <span className="avq-clue-ico"><Icon name={said ? 'pin' : 'lock'} size={22} /></span>
              <span>
                <small>{t('ap.clueN', 'Season clue · {{n}} of 8', { n: clueNo })}</small>
                <b>{said ? (script.quest?.clue ?? meta.chapter?.question ?? meta.chapter?.title) : t('ap.clueLocked', 'Say the rule back to unlock it.')}</b>
              </span>
            </div>
            {mistakes.length > 0 && (
              <>
                <h3>{t('ap.practiceAgain', 'To practise again next time')}</h3>
                <ul className="av-again">{mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
              </>
            )}
          </div>
        </div>
        <p className="av-qc-next"><Icon name="map" size={16} /> {next ? t('ap.comesNext', 'Coming up: chapter {{n}} · {{title}}', { n: next.no, title: next.title }) : t('ap.seasonDone', 'That was the last chapter of the Season.')}</p>
      </section>
    </div>
  );
}

function WrapView({ scene, script, onDone, artBase, summary, calm, fx: fxIn }: SceneProps<WrapScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const [said, setSaid] = useState(false);
  useSay('Vee', scene.teachBack, artBase);
  const say = () => { setSaid(true); fx.confetti(); fx.burst(50, 40, 'gold'); onDone(); };
  if (summary.quest) return <QuestComplete scene={scene} script={script} recap={summary.quest} said={said} onSaid={say} artBase={artBase} calm={calm} mistakes={summary.mistakes} />;
  return (
    <div className="av-wrap" data-testid="av-wrap">
      <section className="av-panel av-wrap-card">
        <h2>{scene.heading}</h2>
        <div className="av-stats">
          <span><b>{summary.xp}</b>{t('ap.xpEarned', 'XP earned')}</span>
          <span><b>{summary.gems}</b>{t('ap.gems', 'Gems')}</span>
        </div>
        <h3>{t('ap.teachBack', 'Say the rule in your own words')}</h3>
        <p className="av-q">{scene.teachBack}</p>
        {!said && <button type="button" className="av-btn" data-kind="go" onClick={say}>{t('ap.sayIt', 'Say it out loud, then tap ✓')}</button>}
        {said && <p className="av-note" data-ok="true">{t('ap.wellDone', 'Well done!')}</p>}
        {summary.mistakes.length > 0 && (
          <>
            <h3>{t('ap.practiceAgain', 'To practise again next time')}</h3>
            <ul className="av-again">{summary.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
          </>
        )}
        <ul className="av-mission">{script.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </section>
    </div>
  );
}

export const wrapScene: SceneModule<WrapScene> = {
  view: WrapView,
  spoken: (s) => [{ who: 'Vee', text: s.teachBack }],
  validate: (s) => (s.teachBack?.trim() ? [] : [`${s.id}: the Wrap needs a teach-back prompt`]),
};
