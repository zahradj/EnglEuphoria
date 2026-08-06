import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { StageMode, WhiteboardStroke, SmartWorksheet } from '@/services/whiteboardService';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { StageContent } from './StageContent';
import { TransparentCanvas } from './TransparentCanvas';
import { useCollapseWatcher } from '@/hooks/useCollapseWatcher';
import { Layout, Globe, PenTool, Wifi, Gamepad2 } from 'lucide-react';
import { PlaygroundLessonPlayer } from '@/components/playground-player/PlaygroundLessonPlayer';
import type { PlaygroundLessonNumber } from '@/playground-blueprint/unitTemplate';
import { ClassroomToolOverlay } from './ClassroomToolOverlay';
import { EmbeddedSceneLesson } from './EmbeddedSceneLesson';
import type { PlayUnitLessonHandle } from '@/pages/playground-scene/PlayUnitLesson';

interface Slide {
  id: string;
  title?: string;
  imageUrl?: string;
  content?: any;
}

/**
 * Playground scene content is built with `vh`/`vw` units sized for the
 * full-screen solo player — those units always resolve against the real
 * browser viewport, never a containing element, no matter how deeply
 * nested. Embedded in the classroom, the framed lesson card is only a
 * fraction of the viewport (sidebar/header/dock eat into it), so the same
 * content renders far too large for its frame. Measuring the actual frame
 * size and scaling the whole subtree down to match keeps every scene's
 * existing vh/vw sizing correct relative to its real container instead of
 * the browser window.
 */
function useFrameScale(frameRef: React.RefObject<HTMLElement>) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const recompute = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || window.innerWidth <= 0 || window.innerHeight <= 0) return;
      const s = Math.min(rect.width / window.innerWidth, rect.height / window.innerHeight, 1);
      if (Number.isFinite(s) && s > 0) setScale(s);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    window.addEventListener('resize', recompute);
    return () => { ro.disconnect(); window.removeEventListener('resize', recompute); };
  }, [frameRef]);
  return scale;
}

interface MainStageProps {
  mode: StageMode;
  slides: Slide[];
  currentSlideIndex: number;
  embeddedUrl: string | null;
  drawingEnabled: boolean;
  activeTool: 'pen' | 'highlighter' | 'eraser' | 'pointer' | 'text' | 'rect' | 'circle' | 'arrow' | 'line';
  activeColor: string;
  strokes: WhiteboardStroke[];
  roomId: string;
  userId: string;
  userName: string;
  role: 'teacher' | 'student';
  /** Web-mode "Independent Play" — when true the student can interact directly with the iframe. */
  iframeUnlocked?: boolean;
  /** Active Smart Worksheet for native game modes. */
  worksheet?: SmartWorksheet | null;
  /** Raw GeneratedSlide data for premium rendering. */
  rawSlides?: any[];
  hubType?: HubType;
  /** Optional fully-custom stage content (e.g. interactive Trail Lesson). When set, replaces StageContent. */
  customStage?: React.ReactNode;
  /** True for interview/demo classrooms. Skips the Playground curriculum
   *  blueprint fallback — interviews have no real unit/lesson to render
   *  there, so their own mock-lesson slides should show instead. */
  isInterview?: boolean;
  /** Persisted current scene index of an active embedded scene lesson, if any. */
  sceneLessonIdx?: number | null;
  /** Teacher-only: persist the embedded scene lesson's current scene index. */
  onPersistSceneLessonIdx?: (idx: number) => void;
  /** Reports the embedded scene lesson's nav state whenever it changes, so a caller (e.g. the Lesson Timeline) can mirror it. */
  onSceneNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean; lockToggleApplicable: boolean }) => void;
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
}

export interface MainStageHandle {
  /** Jump the embedded scene lesson directly to a scene index (teacher-only when synced). No-op if no scene lesson is active. */
  goToScene: (idx: number) => void;
}

const MODE_META: Record<StageMode, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  slide: { label: 'Slide', Icon: Layout },
  web: { label: 'Web Content', Icon: Globe },
  blank: { label: 'Whiteboard', Icon: PenTool },
  native_game_flashcards: { label: 'Flashcards', Icon: Gamepad2 },
  native_game_memory: { label: 'Memory Match', Icon: Gamepad2 },
  native_game_sentence: { label: 'Sentence Builder', Icon: Gamepad2 },
  native_game_blanks: { label: 'Fill in the Blanks', Icon: Gamepad2 },
};

/**
 * The unified Main Stage — a single 16:9 container that fills ~90% of the
 * viewport. Whatever the teacher selects (slide / web / blank) appears here
 * for both teacher and student, with a transparent annotation overlay on top.
 */
export const MainStage = forwardRef<MainStageHandle, MainStageProps>(function MainStage({
  mode,
  slides,
  currentSlideIndex,
  embeddedUrl,
  drawingEnabled,
  activeTool,
  activeColor,
  strokes,
  roomId,
  userId,
  userName,
  role,
  iframeUnlocked = false,
  worksheet = null,
  rawSlides,
  hubType = 'academy',
  customStage,
  isInterview = false,
  sceneLessonIdx = null,
  onPersistSceneLessonIdx,
  onSceneNavState,
  onAddStroke,
}, ref) {
  const { label, Icon } = MODE_META[mode];
  const stageRef = useRef<HTMLDivElement>(null);
  useCollapseWatcher(stageRef, `main-stage[${role}/${mode}]`);
  const sceneLessonRef = (rawSlides as any)?.[0]?.sceneLessonRef as
    | { unitNumber: number; lessonNumber: number }
    | undefined;

  const sceneLessonHandleRef = useRef<PlayUnitLessonHandle>(null);
  const sceneFrameRef = useRef<HTMLDivElement>(null);
  const sceneFrameScale = useFrameScale(sceneFrameRef);
  const [sceneNav, setSceneNav] = useState({ sceneIdx: 0, total: 0, canNavigate: true, interactionUnlocked: false, lockToggleApplicable: true });
  const handleSceneNavState = useCallback(
    (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean; lockToggleApplicable: boolean }) => {
      setSceneNav(state);
      onSceneNavState?.(state);
    },
    [onSceneNavState],
  );

  useImperativeHandle(ref, () => ({
    goToScene: (idx: number) => sceneLessonHandleRef.current?.goToIndex(idx),
  }), []);

  // Reset stale nav state once the scene lesson is no longer the active stage content
  // (e.g. the teacher swaps to a regular slide deck) so callers mirroring this state
  // don't keep treating a plain lesson as if it were still a scene lesson.
  useEffect(() => {
    if (sceneLessonRef) return;
    setSceneNav({ sceneIdx: 0, total: 0, canNavigate: true, interactionUnlocked: false, lockToggleApplicable: true });
    onSceneNavState?.({ sceneIdx: 0, total: 0, canNavigate: true, interactionUnlocked: false, lockToggleApplicable: true });
  }, [sceneLessonRef, onSceneNavState]);

  return (
    <div className="absolute inset-0 h-full w-full flex items-stretch justify-stretch min-h-0 min-w-0">
      <div
        ref={stageRef}
        className="relative flex-1 w-full h-full bg-background overflow-hidden"
      >
        {/* Slide entrance animation — keyed on slide index for a soft fade-in */}
        <div
          key={`stage-${mode}-${currentSlideIndex}`}
          className="absolute inset-0 animate-fade-in"
        >
          {customStage ? (
            <div className="absolute inset-0 overflow-auto">
              {customStage}
            </div>
          ) : hubType === 'playground' && mode === 'slide' && sceneLessonRef ? (
            // Bottom inset is taller for the teacher: TeacherControlDock floats
            // `fixed bottom-4` over this stage, and without this clearance its
            // ~64-80px footprint hides this scene's own Back/Lock/Next row
            // (the last item in this flex column, including "Let student
            // try") underneath it.
            <div className={`absolute inset-x-3 top-3 sm:inset-x-4 sm:top-4 lg:inset-x-6 lg:top-6 flex flex-col gap-2 ${role === 'teacher' ? 'bottom-20 sm:bottom-24' : 'bottom-3 sm:bottom-4 lg:bottom-6'}`}>
              <div ref={sceneFrameRef} className="relative flex-1 min-h-0 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                <div className="absolute inset-0 overflow-hidden">
                  <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / sceneFrameScale}%`, height: `${100 / sceneFrameScale}%`, transform: `scale(${sceneFrameScale})`, transformOrigin: 'top left' }}>
                  <EmbeddedSceneLesson
                    ref={sceneLessonHandleRef}
                    unitNumber={sceneLessonRef.unitNumber}
                    lessonNumber={sceneLessonRef.lessonNumber}
                    roomId={roomId}
                    role={role}
                    hideInternalNav
                    onNavState={handleSceneNavState}
                    persistedSceneIdx={sceneLessonIdx}
                    onSceneIdxPersist={onPersistSceneLessonIdx}
                  />
                  </div>
                </div>
              </div>

              {/* Nav bar lives below the framed lesson card, not overlaid on it */}
              {sceneNav.total > 0 && (
                <div className="shrink-0 flex items-center justify-between px-1">
                  {sceneNav.canNavigate ? (
                    <>
                      <button
                        type="button"
                        onClick={() => sceneLessonHandleRef.current?.goBack()}
                        disabled={sceneNav.sceneIdx === 0}
                        aria-label="Previous scene"
                        className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-slate-800 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                      >
                        <span aria-hidden>◀</span> Back
                      </button>
                      {sceneNav.lockToggleApplicable && (
                        <button
                          type="button"
                          onClick={() => sceneLessonHandleRef.current?.setInteractionUnlocked(!sceneNav.interactionUnlocked)}
                          className={`rounded-full px-4 py-2 text-xs font-bold shadow-lg backdrop-blur transition hover:scale-105 ${sceneNav.interactionUnlocked ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-800'}`}
                        >
                          {sceneNav.interactionUnlocked ? '🔓 Student can try' : '🔒 Let student try'}
                        </button>
                      )}
                      <div className="rounded-full bg-white/90 px-4 py-2 text-xs font-extrabold text-slate-800 shadow-lg backdrop-blur tabular-nums">
                        {sceneNav.sceneIdx + 1} / {sceneNav.total}
                      </div>
                      <button
                        type="button"
                        onClick={() => sceneLessonHandleRef.current?.goNext()}
                        disabled={sceneNav.sceneIdx >= sceneNav.total - 1}
                        aria-label="Next scene"
                        className="flex items-center gap-2 rounded-full bg-[#FE6A2F] px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-[#ff7a45] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                      >
                        Next <span aria-hidden>▶</span>
                      </button>
                    </>
                  ) : (
                    <div className="mx-auto flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-extrabold text-slate-800 shadow-lg backdrop-blur tabular-nums">
                      {sceneNav.interactionUnlocked ? (
                        <><span aria-hidden>✋</span> Your turn! Try the activity</>
                      ) : (
                        <><span aria-hidden>👩‍🏫</span> Your teacher is guiding this lesson · {sceneNav.sceneIdx + 1} / {sceneNav.total}</>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : hubType === 'playground' && mode === 'slide' && !isInterview ? (
            <div className="absolute inset-0 overflow-auto bg-white">
              <PlaygroundLessonPlayer
                embedded
                lessonNumber={(Math.min(7, Math.max(1, currentSlideIndex + 1)) as PlaygroundLessonNumber)}
                unit={(rawSlides as any)?.[0]?.playgroundUnit ?? null}
              />
            </div>
          ) : (
            <StageContent
              mode={mode}
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              embeddedUrl={embeddedUrl}
              roomId={roomId}
              userId={userId}
              role={role}
              iframeUnlocked={iframeUnlocked}
              worksheet={worksheet}
              rawSlides={rawSlides}
              hubType={hubType}
            />
          )}
        </div>

        {/* Universal annotation overlay — always mounted, on top */}
        <TransparentCanvas
          roomId={roomId}
          userId={userId}
          userName={userName}
          role={role}
          drawingEnabled={drawingEnabled}
          activeTool={activeTool}
          activeColor={activeColor}
          strokes={strokes}
          onAddStroke={onAddStroke}
          mode={mode}
          iframeUnlocked={iframeUnlocked}
        />

        {/* Classroom tool overlay — dice / spinning wheel / timer, synced both sides */}
        <ClassroomToolOverlay roomId={roomId} canDismiss={role === 'teacher'} localRole={role} />


        {/* Slide counter (only in slide mode) */}
        {mode === 'slide' && slides.length > 0 && (
          <div className="absolute bottom-4 right-4 z-[60] bg-foreground/70 text-background px-2.5 py-0.5 rounded-full text-[11px] font-medium pointer-events-none">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        )}

        {/* Drawing-OFF hint */}
        {!drawingEnabled && role === 'student' && (
          <div className="absolute bottom-4 left-4 z-[60] bg-background/80 text-muted-foreground text-[10px] px-2 py-1 rounded-md pointer-events-none flex items-center gap-1">
            <Wifi className="w-3 h-3" /> View only
          </div>
        )}
      </div>
    </div>
  );
});
