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
import { EmbeddedWelcomeTownLesson } from './EmbeddedWelcomeTownLesson';
import { ClassroomSceneErrorBoundary } from './ClassroomSceneErrorBoundary';
import { useLetterboxSize } from '@/hooks/useLetterboxSize';
import { isWelcomeTownFamilyFormat } from '@/content/playground-library/sceneLessonFormats';

/** The two embedded scene players (Pre-A1 lep1-rich, A1/A2 wt-rich/wt-a2-rich)
 *  expose the same 4 imperative methods from different source files —
 *  shared here so this stage doesn't need to import (or care) which one
 *  actually backs the current lesson. */
interface SceneLessonHandle {
  goNext: () => void;
  goBack: () => void;
  goToIndex: (idx: number) => void;
  setInteractionUnlocked: (unlocked: boolean) => void;
}

interface Slide {
  id: string;
  title?: string;
  imageUrl?: string;
  content?: any;
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
  /** Real classroom_sessions.id (NOT roomId, which is class_bookings.id) —
   *  needed to persist quiz_responses for Academy's live quiz-like slides. */
  sessionId?: string;
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
  /** Persisted interaction-unlock state of an active embedded scene lesson's own gate, if any. */
  sceneInteractionUnlocked?: boolean | null;
  /** Teacher-only: persist the embedded scene lesson's interaction-unlock state. */
  onPersistSceneInteractionUnlocked?: (unlocked: boolean) => void;
  /** Reports the embedded scene lesson's nav state whenever it changes, so a caller (e.g. the Lesson Timeline) can mirror it. */
  onSceneNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean; lockToggleApplicable: boolean }) => void;
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
}

export interface MainStageHandle {
  /** Jump the embedded scene lesson directly to a scene index (teacher-only when synced). No-op if no scene lesson is active. */
  goToScene: (idx: number) => void;
  /** Unlock/lock the student's ability to interact with the active embedded scene lesson (drag-and-drop, taps, etc). No-op if no scene lesson is active. */
  setSceneInteractionUnlocked: (unlocked: boolean) => void;
}

// Fixed design canvas every classroom scene lesson is laid out on before
// being scaled into the (16:9) scene frame — identical on every screen.
// A typical laptop viewport, i.e. the size the scene art/layout was tuned on.
const SCENE_DESIGN_W = 1440;
const SCENE_DESIGN_H = 810;

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
  sessionId,
  iframeUnlocked = false,
  worksheet = null,
  rawSlides,
  hubType = 'academy',
  customStage,
  isInterview = false,
  sceneLessonIdx = null,
  onPersistSceneLessonIdx,
  sceneInteractionUnlocked = null,
  onPersistSceneInteractionUnlocked,
  onSceneNavState,
  onAddStroke,
}, ref) {
  const { label, Icon } = MODE_META[mode];
  const stageRef = useRef<HTMLDivElement>(null);
  useCollapseWatcher(stageRef, `main-stage[${role}/${mode}]`);
  const sceneLessonRef = (rawSlides as any)?.[0]?.sceneLessonRef as
    | { unitNumber: number; lessonNumber: number; contentFormat?: string }
    | undefined;
  const isWelcomeTownScene = isWelcomeTownFamilyFormat(sceneLessonRef?.contentFormat);

  const sceneLessonHandleRef = useRef<SceneLessonHandle>(null);
  const sceneStageAreaRef = useRef<HTMLDivElement>(null);
  // The scene frame uses ONE fixed 16:9
  // shape and the scene is laid out on a fixed-size design canvas
  // (SCENE_DESIGN_W x SCENE_DESIGN_H) that is scaled to fit. Tracking each
  // device's own ratio meant the teacher's and student's frames were
  // different shapes — the bg art cropped differently and every
  // percentage-placed element (and every vw/vh-sized one, whose units
  // followed each browser window) landed on a different spot of the
  // picture on each screen, and pen strokes (normalized to a differently-
  // shaped box) came out shifted/skewed. Scene content now sizes in
  // --svw/--svh (set below to 1% of the design canvas; they fall back to
  // real vw/vh in the solo player), so both screens render the SAME
  // pixel layout, just scaled.
  const sceneFrameSize = useLetterboxSize(sceneStageAreaRef, SCENE_DESIGN_W / SCENE_DESIGN_H);
  const sceneFrameRef = useRef<HTMLDivElement>(null);
  const sceneFrameScale = sceneFrameSize.width > 0 ? sceneFrameSize.width / SCENE_DESIGN_W : 1;
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
    // Lets a caller outside the scene content (the bottom toolbar's
    // combined "let student interact" toggle) drive the exact same
    // gate the scene's own inline lock button already uses — real
    // broadcast + persistence via the scene lesson's own
    // setInteractionUnlocked, not a separate/parallel mechanism.
    // No-op when no scene lesson is on stage.
    setSceneInteractionUnlocked: (unlocked: boolean) => sceneLessonHandleRef.current?.setInteractionUnlocked(unlocked),
  }), []);

  // Reset stale nav state once the scene lesson is no longer the active stage content
  // (e.g. the teacher swaps to a regular slide deck) so callers mirroring this state
  // don't keep treating a plain lesson as if it were still a scene lesson.
  useEffect(() => {
    if (sceneLessonRef) return;
    setSceneNav({ sceneIdx: 0, total: 0, canNavigate: true, interactionUnlocked: false, lockToggleApplicable: true });
    onSceneNavState?.({ sceneIdx: 0, total: 0, canNavigate: true, interactionUnlocked: false, lockToggleApplicable: true });
  }, [sceneLessonRef, onSceneNavState]);

  // Regular slide content (StageContent) rendered directly in the fluid
  // stage area with no aspect-lock, same as scene lessons did before they
  // got sceneFrameSize below. The pen-drawing overlay (TransparentCanvas)
  // normalizes its coordinates (0..1) against that SAME fluid container —
  // fine as long as the container is the same shape on every viewer, but
  // it isn't: the teacher's and student's browser windows are essentially
  // never pixel-identical, and any slide image inside StageContent that
  // preserves its own aspect ratio (object-contain) ends up positioned at
  // a different offset within that differently-shaped container on each
  // side. Reported live as "I circled the pot, but the student saw it
  // circled next to the pot" — a real, if usually small, coordinate drift
  // baked into where each side's letterbox margins land. Locking this
  // pairing to one fixed ratio (matching the proven approach already used
  // for scene lessons below, via the same useLetterboxSize hook) means
  // every viewer's canvas is normalized against an identically-shaped box,
  // so a normalized point lands in the same visual spot for everyone.
  // Scene lessons mount their own pen layer inside the scene frame.
  const isSceneLessonStage = !customStage && hubType === 'playground' && mode === 'slide' && !!sceneLessonRef;
  const isPlainStageContent =
    !customStage &&
    !(hubType === 'playground' && mode === 'slide' && !!sceneLessonRef) &&
    !(hubType === 'playground' && mode === 'slide' && !isInterview);
  const STAGE_CONTENT_RATIO = 16 / 9;
  const stageContentFrameSize = useLetterboxSize(stageRef, STAGE_CONTENT_RATIO);

  return (
    <div className="absolute inset-0 h-full w-full flex items-stretch justify-stretch min-h-0 min-w-0">
      <div
        ref={stageRef}
        className="relative flex-1 w-full h-full bg-background overflow-hidden"
      >
        {/* Slide entrance animation — keyed on slide index for a soft fade-in.
            Deliberately STABLE (no mode/currentSlideIndex in the key) while a
            Playground scene lesson is on stage: that branch renders the lazy
            EmbeddedSceneLesson/EmbeddedWelcomeTownLesson player, which owns
            its OWN per-scene fade-in (see PlayUnitLesson's key={scene.id})
            and, more importantly, its live whiteboardService realtime
            subscriptions. Keying this wrapper on mode/currentSlideIndex meant
            ANY change to either — including a spurious one from a realtime
            reconnect re-delivering a stale/duplicate session update, which
            this classroom sees often under an unstable connection — force-
            unmounted and remounted the whole scene player on BOTH teacher
            and student screens: replaying the fade animation (reported live
            as "flickering") and tearing down + re-establishing every
            realtime subscription from scratch (reported live as "lagging").
            A regular slide deck still gets its per-slide fade via this key
            as before. */}
        <div
          key={sceneLessonRef ? 'scene-lesson' : `stage-${mode}-${currentSlideIndex}`}
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
              {/* Every scene paints its own bg art with `bg-cover`
                  (fill-and-crop, never letterbox on its own) -- so the frame
                  itself needs a real, deliberate aspect ratio before any art
                  renders inside it. Without this, the frame just stretched
                  to whatever leftover space this column had (wide-and-short
                  on most desktop monitors, where the sidebar eats a much
                  bigger share of width than the header eats of height), and
                  bg-cover cropped/zoomed heavily to fill that mismatched
                  shape -- reported live as "looks zoomed in, doesn't show
                  the whole image." The frame is a fixed 16:9 on every screen and
                  the scene is drawn on a fixed design canvas scaled into it
                  (see sceneFrameScale above), so teacher and student see
                  an identical layout.
                  useLetterboxSize measures the available area and sets
                  explicit pixel width/height for the largest matching-ratio
                  box that fits -- a pure-CSS aspect-ratio attempt here first
                  collapsed toward zero (the frame's only child is
                  `position: absolute`, so it has no in-flow content to size
                  against), hence measuring explicitly instead. */}
              <div ref={sceneStageAreaRef} className="relative flex-1 min-h-0 flex items-center justify-center">
              <div
                ref={sceneFrameRef}
                className="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
                style={sceneFrameSize.width > 0 ? { width: sceneFrameSize.width, height: sceneFrameSize.height } : { width: '100%', height: '100%' }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: SCENE_DESIGN_W, height: SCENE_DESIGN_H,
                    transform: `scale(${sceneFrameScale})`, transformOrigin: 'top left',
                    ['--svw' as string]: `${SCENE_DESIGN_W / 100}px`,
                    ['--svh' as string]: `${SCENE_DESIGN_H / 100}px`,
                  }}>
                  <ClassroomSceneErrorBoundary resetKey={`${sceneLessonRef.contentFormat}-${sceneLessonRef.unitNumber}-${sceneLessonRef.lessonNumber}`}>
                  {isWelcomeTownScene ? (
                    <EmbeddedWelcomeTownLesson
                      ref={sceneLessonHandleRef}
                      contentFormat={sceneLessonRef.contentFormat!}
                      unitNumber={sceneLessonRef.unitNumber}
                      lessonNumber={sceneLessonRef.lessonNumber}
                      roomId={roomId}
                      role={role}
                      hideInternalNav
                      onNavState={handleSceneNavState}
                      persistedSceneIdx={sceneLessonIdx}
                      onSceneIdxPersist={onPersistSceneLessonIdx}
                      persistedInteractionUnlocked={sceneInteractionUnlocked}
                      onInteractionUnlockedPersist={onPersistSceneInteractionUnlocked}
                    />
                  ) : (
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
                      persistedInteractionUnlocked={sceneInteractionUnlocked}
                      onInteractionUnlockedPersist={onPersistSceneInteractionUnlocked}
                    />
                  )}
                  </ClassroomSceneErrorBoundary>
                  </div>
                </div>
                {/* Pen layer INSIDE the fixed-ratio frame (not over the
                    whole stage area) so its 0..1 coordinates mean the
                    same spot of the picture on every screen. */}
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
                    // Always rendered (only the text changes): this row used
                    // to exist only while unlocked, so granting/revoking
                    // interaction added/removed its height and re-letterboxed
                    // — the student's whole lesson frame visibly jumped.
                    <div className="mx-auto flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-extrabold text-slate-800 shadow-lg backdrop-blur tabular-nums">
                      {sceneNav.interactionUnlocked ? (
                        <><span aria-hidden>✋</span> Your turn! Try the activity</>
                      ) : (
                        <><span aria-hidden>👩‍🏫</span> Your teacher is guiding · {sceneNav.sceneIdx + 1} / {sceneNav.total}</>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : hubType === 'playground' && mode === 'slide' && !isInterview && (rawSlides as any)?.[0]?.playgroundUnit ? (
            // Only reachable with a real AI-generated unit (from PlaygroundCreator)
            // to render — without one, PlaygroundLessonPlayer silently falls back
            // to its own bundled "Animal Adventure Academy" reference lesson,
            // which is never what a teacher/student actually opened. Lessons with
            // no unit and no sceneLessonRef fall through to the explicit
            // "not available" state below instead of that silent legacy content.
            <div className="absolute inset-0 overflow-auto bg-white">
              <PlaygroundLessonPlayer
                embedded
                lessonNumber={(Math.min(7, Math.max(1, currentSlideIndex + 1)) as PlaygroundLessonNumber)}
                unit={(rawSlides as any)?.[0]?.playgroundUnit ?? null}
              />
            </div>
          ) : hubType === 'playground' && mode === 'slide' && !isInterview ? (
            <div className="flex h-full w-full items-center justify-center bg-orange-50 p-8 text-center">
              <p className="text-lg font-bold text-orange-700">
                This lesson's content isn't available yet.
              </p>
            </div>
          ) : (
            // Letterboxed to a fixed ratio (see isPlainStageContent's
            // comment above) so StageContent and TransparentCanvas share
            // an identically-shaped box on every viewer — the pen overlay
            // is mounted INSIDE this frame for this branch specifically
            // (instead of at the outer always-on-top position below) so
            // its 0..1 normalization is relative to this same locked box,
            // not the raw fluid stage area.
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative overflow-hidden bg-background"
                style={
                  stageContentFrameSize.width > 0
                    ? { width: stageContentFrameSize.width, height: stageContentFrameSize.height }
                    : { width: '100%', height: '100%' }
                }
              >
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
                  sessionId={sessionId}
                />
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
              </div>
            </div>
          )}
        </div>

        {/* Universal annotation overlay for every OTHER mode (custom stage /
            scene lesson / playground unit) — always mounted on top for
            those, unchanged from before. The plain-slide case renders its
            own copy above, inside the letterboxed frame, instead of this
            one, so it's never mounted twice at once. */}
        {!isPlainStageContent && !isSceneLessonStage && (
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
        )}

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
