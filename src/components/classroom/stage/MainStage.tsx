import React, { useRef } from 'react';
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
  /** Web-mode "Independent Play" — when true the student can interact directly with the iframe. */
  iframeUnlocked?: boolean;
  /** Active Smart Worksheet for native game modes. */
  worksheet?: SmartWorksheet | null;
  /** Raw GeneratedSlide data for premium rendering. */
  rawSlides?: any[];
  hubType?: HubType;
  /** Optional fully-custom stage content (e.g. interactive Trail Lesson). When set, replaces StageContent. */
  customStage?: React.ReactNode;
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
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
export const MainStage: React.FC<MainStageProps> = ({
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
  onAddStroke,
}) => {
  const { label, Icon } = MODE_META[mode];
  const stageRef = useRef<HTMLDivElement>(null);
  useCollapseWatcher(stageRef, `main-stage[${role}/${mode}]`);
  const sceneLessonRef = (rawSlides as any)?.[0]?.sceneLessonRef as
    | { unitNumber: number; lessonNumber: number }
    | undefined;

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
            <div className="absolute inset-0 overflow-auto bg-white">
              <EmbeddedSceneLesson
                unitNumber={sceneLessonRef.unitNumber}
                lessonNumber={sceneLessonRef.lessonNumber}
                roomId={roomId}
              />
            </div>
          ) : hubType === 'playground' && mode === 'slide' ? (
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
};
