// Quest cinematics (UI motion only, never the picture): the stage title card, the encounter stinger, and the toasts (level up, objective complete).
// Calm mode / reduced motion: the same card, static (no sweep, no slide); every card ends on a tap, Enter, Space or Escape.
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, STAGE_ICONS, type IconName } from './icons';
import { shortObjective, stageText } from './text';
import type { EncounterKind, LevelInfo, Objective, StageInfo } from '../engine/quest';
import type { LessonScript } from '../types';

const useAutoClose = (ms: number, onDone: () => void) => {
  const cb = useRef(onDone); cb.current = onDone;
  useEffect(() => { const id = window.setTimeout(() => cb.current(), ms); return () => window.clearTimeout(id); }, [ms]);
};
const keyClose = (onDone: () => void) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); onDone(); } };
const useFocus = () => { const r = useRef<HTMLDivElement>(null); useEffect(() => { r.current?.focus({ preventScroll: true }); }, []); return r; };

export function StageIntro({ script, stage, objectives, calm, onDone }: { script: LessonScript; stage: StageInfo; objectives: Objective[]; calm: boolean; onDone: () => void }) {
  const { t } = useTranslation();
  const txt = stageText(t, script, stage.part);
  const ref = useFocus();
  useAutoClose(calm ? 3600 : 2800, onDone);
  const goals = stage.criteria.map((n) => objectives[n - 1]).filter(Boolean).slice(0, 3);
  const l = stage.loot;
  const chips: string[] = [];
  if (l.gems) chips.push(`◆ ${t('ap.lootGems', 'up to {{n}} gems', { n: l.gems })}`);
  if (l.cards) chips.push(`✦ ${t('ap.lootCards', '{{n}} Word Cards', { n: l.cards })}`);
  if (l.trophies) chips.push(`♛ ${t('ap.lootTrophies', '{{n}} trophy', { n: l.trophies })}`);
  if (l.clues) chips.push(`⌕ ${t('ap.lootClues', '{{n}} clue pieces', { n: l.clues })}`);
  return (
    <div ref={ref} className="avq-intro" role="dialog" aria-modal="true" aria-label={txt.title} tabIndex={0} onClick={onDone} onKeyDown={keyClose(onDone)} data-testid="avq-intro" data-av-local>
      <div className="avq-intro-band">
        <span className="avq-intro-sweep" aria-hidden="true" />
        <div className="avq-intro-num" aria-hidden="true"><small>{t('ap.stageWord', 'STAGE')}</small><b>{stage.part + 1}</b><em>/ 8</em></div>
        <div className="avq-intro-main">
          <p className="avq-eyebrow"><Icon name={STAGE_ICONS[stage.part]} size={18} /> {t('ap.questStage', 'QUEST STAGE {{n}} / 8', { n: stage.part + 1 })} · {t('ap.minutes', '{{n}} min', { n: stage.minutes })}</p>
          <h2 className="avq-intro-title">{txt.title}</h2>
          <p className="avq-intro-goal">{txt.goal}</p>
          {goals.length > 0 && (
            <ul className="avq-intro-goals" aria-label={t('ap.objectives', 'Objectives')}>
              {goals.map((o) => <li key={o.n} data-done={o.complete || undefined}><span className="avq-box" aria-hidden="true" />{shortObjective(o.text)}</li>)}
            </ul>
          )}
          {chips.length > 0 && <p className="avq-intro-loot" aria-label={t('ap.lootHere', 'Loot you can earn')}>{chips.map((c) => <span key={c}>{c}</span>)}</p>}
        </div>
        <ol className="avq-intro-pips" aria-hidden="true">
          {STAGE_ICONS.map((ic, i) => <li key={ic} data-state={i < stage.part ? 'done' : i === stage.part ? 'now' : 'todo'}><Icon name={i < stage.part ? 'check' : ic} size={20} /></li>)}
        </ol>
      </div>
      <p className="avq-tap">{t('ap.tapContinue', 'Tap to continue')}</p>
    </div>
  );
}

const STINGER: Record<EncounterKind, { icon: IconName; label: [string, string]; sub: [string, string] }> = {
  boss: { icon: 'swords', label: ['ap.stBoss', 'BOSS FIGHT'], sub: ['ap.stBossSub', 'Pick the right move. Shields protect you.'] },
  forge: { icon: 'anvil', label: ['ap.stForge', 'CRAFTING'], sub: ['ap.stForgeSub', 'Forge the pieces in the right order.'] },
  rapport: { icon: 'chat', label: ['ap.stRapport', 'DIALOGUE'], sub: ['ap.stRapportSub', 'Choose what you say. The answer changes.'] },
  sort: { icon: 'puzzle', label: ['ap.stSort', 'PUZZLE'], sub: ['ap.stSortSub', 'Sort the evidence into the right place.'] },
  hunt: { icon: 'lens', label: ['ap.stHunt', 'SEARCH'], sub: ['ap.stHuntSub', 'Read the clue. Find it in the picture.'] },
  inspect: { icon: 'log', label: ['ap.stInspect', 'DESK DUTY'], sub: ['ap.stInspectSub', 'Check each document against the rulebook.'] },
  interview: { icon: 'mic', label: ['ap.stInterview', 'INTERVIEW'], sub: ['ap.stInterviewSub', 'Build your question. Listen to the answer.'] },
  objection: { icon: 'bolt', label: ['ap.stObjection', 'CROSS-EXAMINATION'], sub: ['ap.stObjectionSub', 'Press a line. Present the evidence.'] },
  finder: { icon: 'pin', label: ['ap.stFinder', 'POSTCARD FINDER'], sub: ['ap.stFinderSub', 'One clue, six postcards. Find the right one.'] },
  workshop: { icon: 'tools', label: ['ap.stWorkshop', 'CHUNK WORKSHOP'], sub: ['ap.stWorkshopSub', 'Snap two halves into one chunk.'] },
  beats: { icon: 'wave', label: ['ap.stBeats', 'STRESS BEATS'], sub: ['ap.stBeatsSub', 'Tap the strong part of the word.'] },
  onair: { icon: 'mic', label: ['ap.stOnair', 'LIVE ON AIR'], sub: ['ap.stOnairSub', 'React. Ask. Keep your guest talking.'] },
  switchboard: { icon: 'sliders', label: ['ap.stSwitchboard', 'TIMELINE SWITCHBOARD'], sub: ['ap.stSwitchboardSub', 'Move the time marker. Power on the sentence.'] },
};

export function Stinger({ kind, title, calm, onDone }: { kind: EncounterKind; title: string; calm: boolean; onDone: () => void }) {
  const { t } = useTranslation();
  const ref = useFocus();
  useAutoClose(calm ? 2200 : 1700, onDone);
  const s = STINGER[kind];
  return (
    <div ref={ref} className="avq-stinger" data-kind={kind} role="dialog" aria-modal="true" aria-label={title} tabIndex={0} onClick={onDone} onKeyDown={keyClose(onDone)} data-testid="avq-stinger" data-av-local>
      <div className="avq-stinger-band">
        <span className="avq-intro-sweep" aria-hidden="true" />
        <span className="avq-stinger-ico"><Icon name={s.icon} size={34} /></span>
        <div>
          <p className="avq-eyebrow">{t(s.label[0], s.label[1])}</p>
          <h2>{title}</h2>
          <p className="avq-stinger-sub">{t(s.sub[0], s.sub[1])}</p>
        </div>
      </div>
    </div>
  );
}

export type Toast = { id: number; kind: 'level' | 'objective' | 'streak'; title: string; sub?: string; /** the level shown in a level-up badge */ n?: number };

/** banners at the top centre (polite live region): level up, objective complete. They remove themselves. */
export function Toasts({ toasts, level, onGone }: { toasts: Toast[]; level: LevelInfo; onGone: (id: number) => void }) {
  return (
    <div className="avq-toasts" role="status" aria-live="polite" data-av-local>
      {toasts.map((x) => <ToastItem key={x.id} toast={x} level={level} onGone={onGone} />)}
    </div>
  );
}
function ToastItem({ toast, level, onGone }: { toast: Toast; level: LevelInfo; onGone: (id: number) => void }) {
  useAutoClose(toast.kind === 'level' ? 3200 : 2600, () => onGone(toast.id));
  return (
    <div className="avq-toast" data-kind={toast.kind}>
      {toast.kind === 'level' && <span className="avq-lv" aria-hidden="true">{toast.n ?? level.level}</span>}
      {toast.kind === 'objective' && <span className="avq-tick" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} /></svg></span>}
      <span><b>{toast.title}</b>{toast.sub && <em>{toast.sub}</em>}</span>
    </div>
  );
}
