import { useState, type ReactNode, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import type { LessonMeta } from './lessonMeta';
import type { Prefs } from '../services/prefs';
import './tokens.css';
import './games.css';

export interface ShellProps {
  meta: LessonMeta;
  partMinutes: number[];
  /** 0-7: the part of the current scene; partFill is 0-1 progress inside it */
  part: number;
  partFill: number;
  xpFill: number;
  index: number;
  total: number;
  prefs: Prefs;
  onPrefs: (p: Prefs) => void;
  onBack?: () => void;
  /** the one primary action of the bottom bar; omit when the scene has its own */
  primary?: { label: string; kind?: 'go' | 'warm'; onClick: () => void; disabled?: boolean };
  onHint?: () => void;
  onPause: (on: boolean) => void;
  onRestart?: () => void;
  plate?: string;
  calmPlate?: boolean;
  artBase: string;
  shaking?: boolean | 'soft' | 'hard';
  /** overlay content (effects, notices) rendered above the scene */
  overlay?: ReactNode;
  /** the quest HUD: `left` replaces the plain XP bar (rank chip, streak), `right` sits before the comfort buttons (tracker, map, bag) */
  questHud?: { left: ReactNode; right: ReactNode };
  /** the player root element (loot flies from the stage into the bag inside it) */
  rootRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/** The layout of every screen: plate, HUD (chapter, XP, comfort dock), the 8-part strip and the bottom bar. Scenes render inside it. */
export function PlayerShell(p: ShellProps) {
  const { t } = useTranslation();
  const [sheet, setSheet] = useState<null | 'minute' | 'more'>(null);
  const open = (s: 'minute' | 'more') => { setSheet(s); if (s === 'minute') p.onPause(true); };
  const close = () => { setSheet(null); p.onPause(false); };
  const sum = p.partMinutes.reduce((a, b) => a + b, 0) || 1;
  const dotsMax = Math.min(p.total, 12);
  return (
    <div className="av-root" ref={p.rootRef} data-calm={p.prefs.calm} data-shaking={p.shaking ? String(p.shaking) : undefined} data-testid="av-root">
      {p.plate && <div className="av-plate" data-calm={p.calmPlate || undefined} style={{ backgroundImage: `url(${p.artBase}/bg/${p.plate}.webp)` }} />}
      <div className="av-veil" />
      <div className="av-stage" data-av-sync="stage">{p.children}</div>
      <div className="av-hud" data-av-sync="hud">
        <span className="av-pill" data-tone="brand">⛨ ACADEMY · {p.meta.short}</span>
        {p.meta.chapter && <span className="av-pill" data-testid="av-chapter">{t('ap.chapter', 'Chapter {{n}} of 8', { n: p.meta.chapter.no })} · <b>{p.meta.chapter.title}</b></span>}
        {p.questHud ? p.questHud.left : (
          <span className="av-xp" role="progressbar" aria-label={t('ap.xp', 'XP')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p.xpFill * 100)}><i style={{ width: `${Math.round(p.xpFill * 100)}%` }} /></span>
        )}
        <span className="av-spacer" />
        {p.questHud?.right}
        {p.onHint && <button type="button" className="av-pill" data-optional="true" onClick={p.onHint}>💡 {t('ap.hint', 'Hint')}</button>}
        <button type="button" className="av-pill" data-optional="true" onClick={() => open('minute')}>⏸ {t('ap.minute', 'I need a minute')}</button>
        <button type="button" className="av-pill" onClick={() => open('more')} aria-label={t('ap.more', 'More')}>⋯</button>
      </div>
      <ol className="av-strip" aria-label={t('ap.part', 'Part {{n}} of 8', { n: p.part + 1 })}>
        {p.partMinutes.map((m, i) => (
          <li key={i} data-state={i < p.part ? 'done' : i === p.part ? 'now' : 'todo'} style={{ flex: `${m / sum}`, ['--fill' as string]: `${Math.round(p.partFill * 100)}%` }} />
        ))}
      </ol>
      <div className="av-dock" data-av-sync="dock">
        {p.onBack && <button type="button" className="av-btn" onClick={p.onBack} disabled={p.index === 0}>‹ {t('ap.back', 'Back')}</button>}
        <div className="av-dots" aria-hidden="true">{Array.from({ length: dotsMax }, (_, i) => <i key={i} data-state={i < p.index ? 'done' : i === p.index ? 'now' : 'todo'} />)}</div>
        {p.primary && <button type="button" className="av-btn" data-kind={p.primary.kind ?? 'go'} onClick={p.primary.onClick} disabled={p.primary.disabled}>{p.primary.label}</button>}
      </div>
      {p.overlay}
      {sheet && (
        <div className="av-sheet" role="dialog" aria-modal="true" onClick={close}>
          <div className="av-panel" onClick={(e) => e.stopPropagation()}>
            {sheet === 'minute' ? (
              <>
                <h2>⏸ {t('ap.minute', 'I need a minute')}</h2>
                <button type="button" className="av-btn" data-kind="go" onClick={close}>{t('ap.resume', 'Continue')}</button>
              </>
            ) : (
              <>
                <h2>{t('ap.more', 'More')}</h2>
                <label className="av-toggle">{t('ap.calm', 'Calm mode')}<input type="checkbox" checked={p.prefs.calm} onChange={(e) => p.onPrefs({ ...p.prefs, calm: e.target.checked })} /></label>
                <label className="av-toggle">{t('ap.sound', 'Sound')}<input type="checkbox" checked={p.prefs.sound} onChange={(e) => p.onPrefs({ ...p.prefs, sound: e.target.checked })} /></label>
                {p.onRestart && <button type="button" className="av-btn" onClick={() => { p.onRestart?.(); close(); }}>{t('ap.restart', 'Start again')}</button>}
                <button type="button" className="av-btn" onClick={close}>{t('ap.resume', 'Continue')}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
