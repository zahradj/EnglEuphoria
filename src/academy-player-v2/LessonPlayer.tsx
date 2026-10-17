// The Academy lesson player v2: engine (pure reducer) + services + shell + one scene at a time from the registry.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { initialState, lessonReducer, XP_CLEAN } from './engine/lessonReducer';
import { moduleFor } from './scenes/registry';
import { PlayerShell } from './shell/PlayerShell';
import { SceneBoundary } from './shell/SceneBoundary';
import { lessonMeta } from './shell/lessonMeta';
import { clearProgress, loadProgress, saveProgress } from './services/progress';
import { loadPrefs, savePrefs, type Prefs } from './services/prefs';
import { saveLessonMistakes } from './services/mistakes';
import { saySequence, setMuted, stopVoice } from './services/voice';
import { useFx } from './fx/useFx';
import { FxLayer } from './fx/Fx';
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

export function LessonPlayer({ script, artBase = '/academy-art', role = 'solo', index, onIndex, onNav, onFinish, ephemeral }: LessonPlayerProps) {
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

  useEffect(() => { setMuted(!prefs.sound); savePrefs(prefs); }, [prefs]);
  useEffect(() => { if (controlled && state.index !== at) dispatch({ type: 'go', index: at }); }, [controlled, at, state.index]);
  useEffect(() => { onNav?.({ index: at, total }); }, [at, total, onNav]);
  useEffect(() => { if (!ephemeral && role === 'solo' && state.furthest > 0) saveProgress(script.blueprintId, ids, state); }, [state, ephemeral, role, script.blueprintId, ids]);
  // the recorded voices say the scene's lines; silence if a clip is missing
  useEffect(() => {
    if (!scene || !mod) return;
    void saySequence(mod.spoken(scene), artBase);
    return () => stopVoice();
  }, [scene, mod, artBase]);
  useEffect(() => {
    if (at === total - 1 && state.doneIds.includes(scene?.id ?? '') && !finished.current) {
      finished.current = true;
      saveLessonMistakes(script.blueprintId, [...new Set(missed)].map((m) => ({ id: m, label: m, wrong: missed.filter((x) => x === m).length })));
      if (!ephemeral) clearProgress(script.blueprintId);
      onFinish?.();
    }
  }, [at, total, state.doneIds, missed, scene, script, ephemeral, onFinish]);

  const go = useCallback((i: number) => {
    const n = Math.max(0, Math.min(total - 1, i));
    if (controlled) onIndex?.(n); else { dispatch({ type: 'go', index: n }); onIndex?.(n); }
  }, [controlled, total, onIndex]);

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

  if (!scene || !mod) return <div className="av-root" data-testid="av-empty" />;
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
      onRestart={student || ephemeral ? undefined : () => { clearProgress(script.blueprintId); finished.current = false; dispatch({ type: 'restore', state: { index: 0, furthest: 0, results: {}, wrong: {}, xp: 0, gems: 0, doneIds: [] } }); go(0); }}
      shaking={fx.shaking}
      plate={scene.plate}
      calmPlate
      artBase={artBase}
      overlay={
        <>
          <FxLayer bursts={fx.bursts} floaters={fx.floaters} confettis={fx.confettis} />
          {resume && (
            <div className="av-sheet" role="dialog" aria-modal="true">
              <div className="av-panel">
                <h2>{t('ap.resumeAsk', 'Continue where you stopped?')}</h2>
                <button type="button" className="av-btn" data-kind="go" onClick={() => { dispatch({ type: 'restore', state: resume }); setResume(null); }}>{t('ap.resume', 'Continue')}</button>
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
        <View key={scene.id} scene={scene} script={script} artBase={artBase} calm={fx.calm} fx={fx.api} seed={seedOf(scene.id)} summary={{ xp: state.xp, gems: state.gems, mistakes: [...new Set(missed)] }} onDone={(r) => { onDone(r); if (scene.kind === 'lobby') go(at + 1); }} />
      </SceneBoundary>
    </PlayerShell>
  );
}
