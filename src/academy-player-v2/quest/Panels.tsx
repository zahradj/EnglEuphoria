// The two drawers of the quest layer: the Quest Log (objectives with ticks, the 8 stages) and the Bag (loot: Word Cards, trophies, clue pieces, gems).
// Both are local to each screen (data-av-local): a live class does not mirror them.
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, STAGE_ICONS, type IconName } from './icons';
import { questName, shortObjective, stageText } from './text';
import { rankLabel } from './Hud';
import type { LevelInfo, LootItem, Objective, StageInfo } from '../engine/quest';
import type { LessonMeta } from '../shell/lessonMeta';
import type { LessonScript } from '../types';

function Drawer({ label, icon, title, sub, onClose, children, side = 'right' }: { label: string; icon: IconName; title: string; sub?: string; onClose: () => void; children: ReactNode; side?: 'right' | 'left' }) {
  const { t } = useTranslation();
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus({ preventScroll: true }); }, []);
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
  return (
    <div className="avq-scrim" onClick={onClose} data-av-local>
      <aside className="avq-drawer" data-side={side} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <header>
          <span className="avq-drawer-ico"><Icon name={icon} size={22} /></span>
          <div><p className="avq-eyebrow">{label}</p><h2>{title}</h2>{sub && <p className="avq-sub">{sub}</p>}</div>
          <button ref={close} type="button" className="av-btn avq-close" onClick={onClose} aria-label={t('ap.close', 'Close')}><Icon name="close" size={20} /></button>
        </header>
        <div className="avq-drawer-body">{children}</div>
      </aside>
    </div>
  );
}

export function QuestLog({ script, meta, stages, objectives, part, level, streak, onClose, onMap }: {
  script: LessonScript; meta: LessonMeta; stages: StageInfo[]; objectives: Objective[]; part: number; level: LevelInfo; streak: number; onClose: () => void; onMap?: () => void;
}) {
  const { t } = useTranslation();
  const doneN = objectives.filter((o) => o.complete).length;
  return (
    <Drawer label={t('ap.questLog', 'Quest log')} icon="log" title={questName(script, meta)} sub={meta.chapter ? t('ap.chapter', 'Chapter {{n}} of 8', { n: meta.chapter.no }) : undefined} onClose={onClose}>
      <section>
        <h3>{t('ap.objectives', 'Objectives')} <b>{doneN}/{objectives.length}</b></h3>
        <ul className="avq-objs" data-testid="avq-objectives">
          {objectives.map((o) => (
            <li key={o.n} data-done={o.complete || undefined}>
              <span className="avq-box" data-on={o.complete || undefined} aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} /></svg></span>
              <span><span className="sr-only">{o.complete ? t('ap.stateDone', 'cleared') : t('ap.stateOpen', 'to do')}: </span>{shortObjective(o.text)}<em>{t('ap.objProgress', '{{done}} of {{total}} activities', { done: o.done, total: o.total })}</em></span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>{t('ap.stages', 'The stages')}</h3>
        <ol className="avq-stages">
          {stages.map((s) => {
            const tx = stageText(t, script, s.part);
            const st = s.complete ? 'done' : s.part === part ? 'now' : s.part < part ? 'skipped' : 'todo';
            return (
              <li key={s.part} data-state={st}>
                <span className="avq-stage-ico"><Icon name={st === 'done' ? 'check' : STAGE_ICONS[s.part % STAGE_ICONS.length]} size={18} /></span>
                <span><b>{s.part + 1}. {tx.title}</b><em>{tx.goal}</em></span>
                <small>{t('ap.minutes', '{{n}} min', { n: s.minutes })}</small>
              </li>
            );
          })}
        </ol>
        {onMap && <button type="button" className="av-btn avq-maplink" onClick={onMap}><Icon name="map" size={18} /> {t('ap.openMap', 'Open the quest map')}</button>}
      </section>
      <p className="avq-foot">{t('ap.rankLine', 'Level {{n}} · {{rank}}', { n: level.level, rank: rankLabel(t, level.rank) })}{streak >= 2 ? ` · ${t('ap.streakN', 'Streak {{n}}', { n: streak })}` : ''}</p>
    </Drawer>
  );
}

export function Bag({ loot, potential, artBase, onClose }: { loot: LootItem[]; potential: LootItem[]; artBase: string; onClose: () => void }) {
  const { t } = useTranslation();
  const have = new Set(loot.map((l) => l.id));
  const group = (k: LootItem['kind']) => potential.filter((p) => p.kind === k);
  const cards = [...group('wordcard')];
  const gems = group('gem');
  const trophies = group('trophy');
  const clues = group('clue');
  const Slot = ({ it }: { it: LootItem }) => {
    const own = have.has(it.id);
    return (
      <li className="avq-slot" data-have={own || undefined} data-kind={it.kind} title={own ? it.label : undefined}>
        {it.art ? <img src={`${artBase}/${it.art}.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} /> : <Icon name={it.kind === 'trophy' ? 'trophy' : it.kind === 'gem' ? 'gem' : 'pin'} size={32} />}
        <span>{own ? it.label : <span aria-hidden="true">?</span>}<span className="sr-only">{own ? '' : t('ap.slotEmpty', 'not found yet')}</span></span>
      </li>
    );
  };
  return (
    <Drawer label={t('ap.bag', 'Bag')} icon="bag" title={t('ap.bagCount', '{{n}} of {{m}} collected', { n: loot.length, m: potential.length })} onClose={onClose} side="left">
      {cards.length > 0 && <section><h3>{t('ap.wordCards', 'Word Cards')} <b>{cards.filter((c) => have.has(c.id)).length}/{cards.length}</b></h3><ul className="avq-slots" data-testid="avq-cards">{cards.map((c) => <Slot key={c.id} it={c} />)}</ul></section>}
      {trophies.length > 0 && <section><h3>{t('ap.trophies', 'Trophies')} <b>{trophies.filter((c) => have.has(c.id)).length}/{trophies.length}</b></h3><ul className="avq-slots" data-wide>{trophies.map((c) => <Slot key={c.id} it={c} />)}</ul></section>}
      {clues.length > 0 && <section><h3>{t('ap.cluePieces', 'Clue pieces')} <b>{clues.filter((c) => have.has(c.id)).length}/{clues.length}</b></h3><ul className="avq-slots" data-wide>{clues.map((c) => <Slot key={c.id} it={c} />)}</ul></section>}
      {gems.length > 0 && (
        <section>
          <h3>{t('ap.gems', 'Gems')} <b>{gems.filter((c) => have.has(c.id)).length}/{gems.length}</b></h3>
          <ul className="avq-gems" data-testid="avq-gems">{gems.map((g) => <li key={g.id} data-have={have.has(g.id) || undefined}><Icon name="gem" size={22} /><span className="sr-only">{g.label}</span></li>)}</ul>
          <p className="avq-sub">{t('ap.gemRule', 'A gem is a win on the first try.')}</p>
        </section>
      )}
    </Drawer>
  );
}
