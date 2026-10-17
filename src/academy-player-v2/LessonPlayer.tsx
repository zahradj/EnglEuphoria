// The Academy lesson player v2: engine (pure reducer) + services + shell + one scene at a time from the registry.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import { initialState, lessonReducer, XP_CLEAN } from './engine/lessonReducer';
import { moduleFor } from './scenes/registry';
import { PlayerShell } from './shell/PlayerShell';
import { SceneBoundary } from './shell/SceneBoundary';
import { lessonMeta } from './shell/lessonMeta';
import { clearProgress, loadProgress, saveProgress } from './services/progress';
import { loadPrefs, savePrefs, type Prefs } from './services/prefs';
import { saveLessonMistakes } from './services/mistakes';
import { rememberChapter } from './services/chapterMemory';
import { setMuted, stopVoice } from './services/voice';
import { useFx } from './fx/useFx';
import { FxLayer } from './fx/Fx';
import { currentObjective, levelOf, lootOf, objectivesOf, recapOf, stagesOf, streakOf } from './engine/quest';
import { advanceFlow, dismissCine, initialFlow } from './quest/flow';
import { QuestButtons, RankChip, StreakChip, rankLabel } from './quest/Hud';
import { StageIntro, Stinger, Toasts, type Toast } from './quest/Cinematics';
import { QuestMap } from './quest/QuestMap';
import { Bag, QuestLog } from './quest/Panels';
import { flyLoot } from './quest/flyLoot';
import { stageText } from './quest/text';
import './quest/quest.css';
import type { LessonScript, Role, SceneBase, SceneResult } from './types';

export interface LessonPlayerProps {
  script: LessonScript;
  artBase?: string;
  role?: Role;
  /** controlled position (live class: the student follows the teacher) */
  index?: number;
  onIndex?: (i: number) => void;
  onNav?: (n: { index: number; total: number }) => void;
  onFinish?: () => void;
  /** classroom/test: no resume prompt, no saving */
  ephemeral?: boolean;
}

const seedOf = (id: string) => [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** The lesson is taught in English and its chrome is English too (owner 2026-10-17: "the lesson is strictly English, no other"): the player always uses its own English instance, whatever language the rest of the app is in. */
const playerI18n = i18n.cloneInstance({ lng: 'en', fallbackLng: 'en' });
export function LessonPlayer(props: LessonPlayerProps) {
  return <I18nextProvider i18n={playerI18n}><LessonPlayerInner {...props} /></I18nextProvider>;
}

function LessonPlayerInner({ script, artBase = '/academy-art', role = 'solo', index, onIndex, onNav, onFinish, ephemeral }: LessonPlayerProps) {
  const { t } = useTranslation();
  const total = script.scenes.length;
  const ids = useMemo(() => script.scenes.map((s) => s.id), [script]);
  const [state, dispatch] = useReducer(lessonReducer, total, initialState);
  const missed = useMemo(() => Object.values(state.results).flatMap((r) => r.mistakes), [state.results]);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [resume, setResume] = useState(() => (!ephemeral && role === 'solo' ? loadProgress(script.blueprintId, ids) : null));
  const fx = useFx(prefs.calm);
  const meta = useMemo(() => lessonMeta(script), [script]);
  const controlled = index !== undefined;
  const at = controlled ? Math.max(0, Math.min(total - 1, index)) : state.index;
  const scene: SceneBase | undefined = script.scenes[at];
  const mod = scene ? moduleFor(scene.kind) : undefined;
  const finished = useRef(false);

  // ---- the Quest Layer: everything below is derived from the engine state (nothing is stored twice) ----
  const rootEl = useRef<HTMLDivElement>(null);
  const objectives = useMemo(() => objectivesOf(script, state.doneIds), [script, state.doneIds]);
  const stages = useMemo(() => stagesOf(script, state.doneIds), [script, state.doneIds]);
  const loot = useMemo(() => lootOf(script, state), [script, state]);
  const streak = useMemo(() => streakOf(script, state).streak, [script, state]);
  const level = useMemo(() => levelOf(state.xp), [state.xp]);
  const recap = useMemo(() => recapOf(script, state), [script, state]);
  const cinematics = role === 'solo';
  const [flow, setFlow] = useState(() => initialFlow());
  const [panel, setPanel] = useState<null | 'log' | 'bag' | 'map'>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bagKey, setBagKey] = useState(0);
  const origins = useRef<Record<string, { x: number; y: number }>>({});
  const restoring = useRef(false);
  const prev = useRef({ level: level.level, loot: new Set(loot.map((l) => l.id)), done: new Set(objectives.filter((o) => o.complete).map((o) => o.n)) });
  const toastN = useRef(0);

  const nextFlow = advanceFlow(flow, scene, cinematics, state.doneIds);
  if (nextFlow !== flow) setFlow(nextFlow);
  const cine = (nextFlow !== flow ? nextFlow : flow).queue[0];

  useEffect(() => { setMuted(!prefs.sound); savePrefs(prefs); }, [prefs]);
  useEffect(() => { if (controlled && state.index !== at) dispatch({ type: 'go', index: at }); }, [controlled, at, state.index]);
  useEffect(() => { onNav?.({ index: at, total }); }, [at, total, onNav]);
  useEffect(() => { if (!ephemeral && role === 'solo' && state.furthest > 0) saveProgress(script.blueprintId, ids, state); }, [state, ephemeral, role, script.blueprintId, ids]);
  // voices: every scene says its own lines at the right moment (useSay / useVoiceKey); the player never reads a scene's whole `spoken()` list aloud (that list is for baking clips)
  useEffect(() => () => stopVoice(), [scene?.id]);

  // quest events: level up, objective ticked, loot into the bag (skipped when a saved run is restored)
  useEffect(() => {
    const p = prev.current;
    const nowDone = new Set(objectives.filter((o) => o.complete).map((o) => o.n));
    const nowLoot = new Set(loot.map((l) => l.id));
    if (restoring.current) { restoring.current = false; prev.current = { level: level.level, loot: nowLoot, done: nowDone }; return; }
    const add: Toast[] = [];
    if (level.level > p.level) { add.push({ id: ++toastN.current, kind: 'level', n: level.level, title: t('ap.levelUp', 'Level up!'), sub: `${t('ap.lvl', 'LV')} ${level.level} · ${rankLabel(t, level.rank)}` }); fx.api.burst(50, 16, 'gold'); fx.api.confetti(); }
    for (const n of nowDone) if (!p.done.has(n)) { add.push({ id: ++toastN.current, kind: 'objective', title: t('ap.objDone', 'Objective complete'), sub: objectives[n - 1]?.text.replace(/^I can /i, '') }); }
    const fresh = loot.filter((l) => !p.loot.has(l.id));
    fresh.forEach((l, i) => {
      const from = origins.current[l.id] ?? { x: 38 + ((i * 7) % 24), y: 60 };
      flyLoot(rootEl.current, from, l.kind, l.art ? `${artBase}/${l.art}.webp` : undefined, fx.calm, 120 + i * 140);
    });
    if (fresh.length) setBagKey((k) => k + 1);
    if (add.length) setToasts((l) => [...l, ...add].slice(-3));
    prev.current = { level: level.level, loot: nowLoot, done: nowDone };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.level, loot, objectives]);
  useEffect(() => {
    if (at === total - 1 && state.doneIds.includes(scene?.id ?? '') && !finished.current) {
      finished.current = true;
      saveLessonMistakes(script.blueprintId, [...new Set(missed)].map((m) => ({ id: m, label: m, wrong: missed.filter((x) => x === m).length })));
      if (!ephemeral) { clearProgress(script.blueprintId); rememberChapter(script.blueprintId, state.story); }
      onFinish?.();
    }
  }, [at, total, state.doneIds, state.story, missed, scene, script, ephemeral, onFinish]);

  const go = useCallback((i: number) => {
    const n = Math.max(0, Math.min(total - 1, i));
    if (controlled) onIndex?.(n); else { dispatch({ type: 'go', index: n }); onIndex?.(n); }
  }, [controlled, total, onIndex]);

  const onFound = useCallback((item: string, el?: Element | null) => {
    if (!scene) return;
    origins.current[`find:${scene.id}:${item}`] = fx.api.at(el);
    dispatch({ type: 'found', id: scene.id, item });
  }, [scene, fx.api]);

  const onDone = useCallback((r?: Partial<SceneResult>) => {
    if (!scene) return;
    for (let k = 0; k < (r?.mistakes?.length ?? 0); k++) dispatch({ type: 'wrong', id: scene.id });
    dispatch({ type: 'done', id: scene.id, result: r });
  }, [scene]);

  const sceneDone = !!scene && state.doneIds.includes(scene.id);
  const canNext = role === 'teacher' || sceneDone;
  const last = at === total - 1;
  const partOf = scene?.part ?? 0;
  const inPart = script.scenes.filter((s) => s.part === partOf);
  const partFill = inPart.length ? (inPart.findIndex((s) => s.id === scene?.id) + (sceneDone ? 1 : 0)) / inPart.length : 0;
  const student = role === 'student';

  if (!scene || !mod) return <div className="av-root" dir="ltr" lang="en" data-testid="av-empty" />;
  const View = mod.view;
  const showBar = scene.kind !== 'lobby';
  return (
    <PlayerShell
      meta={meta}
      partMinutes={script.partMinutes}
      part={partOf}
      partFill={Math.min(1, partFill)}
      xpFill={Math.min(1, state.xp / (XP_CLEAN * Math.max(1, total)))}
      index={at}
      total={total}
      prefs={prefs}
      onPrefs={setPrefs}
      onBack={student ? undefined : () => go(at - 1)}
      primary={showBar && !last && !student ? { label: `${t('ap.next', 'Next')} ›`, onClick: () => go(at + 1), disabled: !canNext } : undefined}
      onPause={(on) => dispatch({ type: 'pause', on })}
      onRestart={student || ephemeral ? undefined : () => { clearProgress(script.blueprintId); finished.current = false; restoring.current = true; setFlow(initialFlow()); dispatch({ type: 'restore', state: { index: 0, furthest: 0, results: {}, wrong: {}, xp: 0, gems: 0, doneIds: [], found: {}, story: {}, reel: [] } }); go(0); }}
      rootRef={rootEl}
      questHud={{
        left: <><RankChip level={level} xp={state.xp} /><StreakChip streak={streak} /></>,
        right: <QuestButtons objective={currentObjective(script, objectives, scene.id)} objectives={objectives} bagCount={loot.length} bagKey={bagKey} onLog={() => setPanel('log')} onMap={() => setPanel('map')} onBag={() => setPanel('bag')} />,
      }}
      shaking={fx.shaking}
      plate={scene.plate}
      calmPlate
      artBase={artBase}
      overlay={
        <>
          <FxLayer bursts={fx.bursts} floaters={fx.floaters} confettis={fx.confettis} />
          <Toasts toasts={toasts} level={level} onGone={(id) => setToasts((l) => l.filter((x) => x.id !== id))} />
          {cine?.type === 'stage' && <StageIntro script={script} stage={stages[cine.part]} objectives={objectives} calm={fx.calm} onDone={() => setFlow((f) => dismissCine(advanceFlow(f, scene, cinematics, state.doneIds)))} />}
          {cine?.type === 'map' && <QuestMap script={script} meta={meta} stages={stages} part={cine.to} walk={{ from: cine.from, to: cine.to }} calm={fx.calm} artBase={artBase} onClose={() => setFlow((f) => dismissCine(advanceFlow(f, scene, cinematics, state.doneIds)))} />}
          {cine?.type === 'stinger' && <Stinger kind={cine.kind} title={(scene as SceneBase & { title?: string }).title ?? stageText(t, script, partOf).title} calm={fx.calm} onDone={() => setFlow((f) => dismissCine(advanceFlow(f, scene, cinematics, state.doneIds)))} />}
          {!cine && panel === 'log' && <QuestLog script={script} meta={meta} stages={stages} objectives={objectives} part={partOf} level={level} streak={streak} onClose={() => setPanel(null)} onMap={() => setPanel('map')} />}
          {!cine && panel === 'bag' && <Bag loot={loot} potential={recap.potential} artBase={artBase} onClose={() => setPanel(null)} />}
          {!cine && panel === 'map' && <QuestMap script={script} meta={meta} stages={stages} part={partOf} calm={fx.calm} artBase={artBase} onClose={() => setPanel(null)} />}
          {resume && (
            <div className="av-sheet" role="dialog" aria-modal="true">
              <div className="av-panel">
                <h2>{t('ap.resumeAsk', 'Continue where you stopped?')}</h2>
                <button type="button" className="av-btn" data-kind="go" onClick={() => { restoring.current = true; dispatch({ type: 'restore', state: resume }); setFlow(initialFlow()); setResume(null); }}>{t('ap.resume', 'Continue')}</button>
                <button type="button" className="av-btn" onClick={() => { clearProgress(script.blueprintId); setResume(null); }}>{t('ap.restart', 'Start again')}</button>
              </div>
            </div>
          )}
        </>
      }
    >
      <SceneBoundary
        resetKey={scene.id}
        fallback={() => (
          <div className="av-panel av-crash" role="alert">
            <h2>{t('ap.sceneFailed', 'This activity hit a snag.')}</h2>
            {!student && <button type="button" className="av-btn" data-kind="go" onClick={() => { onDone({ won: false, score: 0 }); go(at + 1); }}>{t('ap.skip', 'Skip it')}</button>}
          </div>
        )}
      >
        <View key={scene.id} scene={scene} script={script} artBase={artBase} calm={fx.calm} fx={fx.api} seed={seedOf(scene.id)} summary={{ xp: state.xp, gems: state.gems, mistakes: [...new Set(missed)], story: state.story, reel: state.reel, quest: recap }} onFound={onFound} onDone={(r) => { onDone(r); if (scene.kind === 'lobby') go(at + 1); }} />
      </SceneBoundary>
    </PlayerShell>
  );
}
