// The quest HUD pieces (inside .av-hud so a live class mirrors the rest): rank chip with the XP bar and levels, streak meter, quest tracker, map and bag buttons.
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Icon } from './icons';
import { shortObjective } from './text';
import { streakTier, type LevelInfo, type Objective, type Rank } from '../engine/quest';

const RANK_DEFAULT: Record<Rank, string> = { rookie: 'Rookie', explorer: 'Explorer', detective: 'Detective', expert: 'Expert', legend: 'Legend' };
export const rankLabel = (t: TFunction, r: Rank): string => t(`ap.rank_${r}`, RANK_DEFAULT[r]);

export function RankChip({ level, xp }: { level: LevelInfo; xp: number }) {
  const { t } = useTranslation();
  return (
    <span className="avq-rank" data-level={level.level} title={level.max ? undefined : t('ap.xpToNext', '{{n}} XP to the next level', { n: level.toNext })}>
      <span className="avq-lvl"><small>{t('ap.lvl', 'LV')}</small><b>{level.level}</b></span>
      <span className="avq-rank-body">
        <span className="avq-rank-name">{rankLabel(t, level.rank)} <em>{xp} {t('ap.xpUnit', 'XP')}</em></span>
        <span className="avq-xpbar" role="progressbar" aria-label={t('ap.xp', 'XP')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.fill * 100)}><i style={{ width: `${Math.round(level.fill * 100)}%` }} /></span>
      </span>
    </span>
  );
}

export function StreakChip({ streak }: { streak: number }) {
  const { t } = useTranslation();
  if (streak < 2) return null;
  const tier = streakTier(streak);
  return (
    <span className="avq-streak" data-tier={tier} role="status" aria-label={t('ap.streakN', 'Streak {{n}}', { n: streak })} key={streak}>
      <Icon name="bolt" size={16} /><b>{streak}</b><em>×{tier}</em>
    </span>
  );
}

export function QuestButtons({ objective, objectives, bagCount, bagKey, onLog, onMap, onBag }: {
  objective?: Objective; objectives: Objective[]; bagCount: number; bagKey: number; onLog: () => void; onMap?: () => void; onBag: () => void;
}) {
  const { t } = useTranslation();
  const done = objectives.filter((o) => o.complete).length;
  return (
    <>
      <button type="button" className="av-pill avq-track" onClick={onLog} aria-label={t('ap.questLog', 'Quest log')} data-testid="avq-track" data-av-local>
        <Icon name="log" size={18} />
        <span className="avq-track-n"><b>{done}</b>/{objectives.length}</span>
        {objective && <span className="avq-track-txt">{shortObjective(objective.text)}</span>}
      </button>
      {onMap && <button type="button" className="av-pill avq-iconbtn avq-mapbtn" onClick={onMap} aria-label={t('ap.mapTitle', 'Quest map')} data-testid="avq-mapbtn" data-av-local><Icon name="map" size={20} /></button>}
      <button type="button" className="av-pill avq-iconbtn avq-bagbtn" onClick={onBag} aria-label={t('ap.bag', 'Bag')} data-testid="avq-bagbtn" data-av-local>
        <Icon name="bag" size={20} />
        <b key={bagKey} className="avq-bagn">{bagCount}</b>
      </button>
    </>
  );
}
