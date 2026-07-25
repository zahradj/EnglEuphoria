import React, { useState, useCallback, useRef } from 'react';
import { WhiteboardStroke, StageMode, whiteboardService } from '@/services/whiteboardService';
import { MainStage } from '@/components/classroom/stage/MainStage';
import { StudentMiniDock } from '@/components/classroom/stage/StudentMiniDock';
import { StudentQuizView } from './StudentQuizView';
import { StudentPollView } from './StudentPollView';
import { TargetWordsOverlay } from '@/components/classroom/TargetWordsOverlay';
import { SmartSummaryTip } from '@/components/classroom/SmartSummaryTip';
import { Badge } from '@/components/ui/badge';
import { Monitor } from 'lucide-react';

const STUDENT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#AA96DA', '#2D4059', '#000000'];

interface QuizOption { id: string; text: string; isCorrect: boolean; }
interface PollOption { id: string; text: string; }

interface Slide {
  id: string;
  title?: string;
  content?: any;
  imageUrl?: string;
  type?: string;
  quizQuestion?: string;
  quizOptions?: QuizOption[];
  pollQuestion?: string;
  pollOptions?: PollOption[];
}

interface StudentMainStageProps {
  slides: Slide[];
  currentSlideIndex: number;
  studentCanDraw: boolean;
  activeTool: string;
  activeColor: string;
  strokes: WhiteboardStroke[];
  roomId: string;
  userId: string;
  userName: string;
  sessionId?: string;
  quizActive: boolean;
  quizLocked: boolean;
  quizRevealAnswer: boolean;
  pollActive: boolean;
  pollShowResults: boolean;
  embeddedUrl: string | null;
  isScreenSharing: boolean;
  activeCanvasTab?: string;
  sessionContext?: Record<string, any>;
  /** Unified Main Stage state, synced from teacher */
  stageMode: StageMode;
  drawingEnabled: boolean;
  iframeUnlocked?: boolean;
  /** Raw GeneratedSlide payloads (premium renderer source). */
  rawSlides?: any[];
  hubType?: 'playground' | 'academy' | 'professional';
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
  onSlideComplete?: (slideIndex: number, slideId: string, accuracy?: number, timeSpent?: number) => void;
  /** Optional fully-custom stage content (e.g. Success Hub Trail Lesson). */
  customStage?: React.ReactNode;
  /** True for interview/demo classrooms — see MainStage. */
  isInterview?: boolean;
}

/**
 * Student-side Main Stage. Mirrors whatever the teacher puts on the unified
 * stage (slide / web / blank) with a transparent annotation overlay on top.
 * Drawing is gated by the teacher's `drawingEnabled` broadcast.
 */
export const StudentMainStage: React.FC<StudentMainStageProps> = ({
  slides,
  currentSlideIndex,
  studentCanDraw,
  activeColor,
  strokes,
  roomId,
  userId,
  userName,
  sessionId,
  quizActive,
  quizLocked,
  quizRevealAnswer,
  pollActive,
  pollShowResults,
  embeddedUrl,
  isScreenSharing,
  sessionContext = {},
  stageMode,
  drawingEnabled,
  iframeUnlocked = false,
  rawSlides,
  hubType = 'academy',
  onAddStroke,
  onSlideComplete,
  customStage,
  isInterview = false,
}) => {
  const currentSlide = slides[currentSlideIndex];
  const isQuizSlide = currentSlide?.type === 'quiz';
  const isPollSlide = currentSlide?.type === 'poll';

  // Local pen tool state (whether the local pen is active is gated by `drawingEnabled` from teacher)
  const [studentTool, setStudentTool] = useState<'pointer' | 'pen' | 'eraser'>('pen');
  const [studentColor, setStudentColor] = useState<string>(activeColor || STUDENT_COLORS[0]);

  // Effective draw permission: legacy flag OR new unified flag
  const canStudentDraw = drawingEnabled || studentCanDraw;

  // Screen sharing takes precedence
  if (isScreenSharing) {
    return (
      <div className="flex-1 flex flex-col bg-muted/20 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-primary/90 text-primary-foreground flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            Teacher is sharing screen
          </Badge>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative w-full max-w-5xl aspect-[16/9] bg-background rounded-xl shadow-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-16 h-16 text-primary/60 mx-auto mb-4" />
              <p className="text-foreground text-lg">Screen share in progress</p>
              <p className="text-muted-foreground text-sm mt-2">View the teacher's shared screen</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special interactive slides (quiz / poll) take over the stage
  if (stageMode === 'slide' && isQuizSlide && currentSlide.quizQuestion && currentSlide.quizOptions && sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <div className="relative w-full max-w-4xl aspect-[16/9] bg-background rounded-xl shadow-2xl overflow-hidden">
          <StudentQuizView
            sessionId={sessionId} slideId={currentSlide.id}
            question={currentSlide.quizQuestion} options={currentSlide.quizOptions}
            studentId={userId} studentName={userName}
            quizActive={quizActive} quizLocked={quizLocked} quizRevealAnswer={quizRevealAnswer}
          />
        </div>
      </div>
    );
  }
  if (stageMode === 'slide' && isPollSlide && currentSlide.pollQuestion && currentSlide.pollOptions && sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
        <div className="relative w-full max-w-4xl aspect-[16/9] bg-background rounded-xl shadow-2xl overflow-hidden">
          <StudentPollView
            sessionId={sessionId} slideId={currentSlide.id}
            question={currentSlide.pollQuestion} options={currentSlide.pollOptions}
            studentId={userId} studentName={userName}
            pollActive={pollActive} pollShowResults={pollShowResults}
          />
        </div>
      </div>
    );
  }

  // Bi-directional sync: capture interactive clicks bubbling up from the
  // CreatorSlideRenderer / DynamicSlideRenderer and broadcast a compact
  // payload so the teacher's screen highlights what the student selected.
  const lastBroadcastRef = useRef<{ key: string; ts: number } | null>(null);
  const handleStageClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest(
      'button, [role="button"], [role="option"], [role="radio"], [role="checkbox"], [data-option], [data-answer], [data-draggable], [data-droppable], li[tabindex], label[for]'
    ) as HTMLElement | null;
    if (!interactive) return;
    // Skip the student's own dock controls
    if (interactive.closest('[data-student-dock]')) return;
    const label =
      interactive.getAttribute('aria-label') ||
      interactive.getAttribute('data-answer') ||
      interactive.getAttribute('data-option') ||
      (interactive.textContent || '').trim().slice(0, 80);
    if (!label) return;
    const slide = slides[currentSlideIndex];
    const key = `${currentSlideIndex}:${label}`;
    const now = Date.now();
    // Debounce identical events within 300ms
    if (lastBroadcastRef.current?.key === key && now - lastBroadcastRef.current.ts < 300) return;
    lastBroadcastRef.current = { key, ts: now };
    void whiteboardService.sendStudentAction(roomId, {
      slideId: String(slide?.id ?? currentSlideIndex),
      slideIndex: currentSlideIndex,
      label: `Selected: ${label}`,
      data: { text: label },
      senderId: userId,
      senderName: userName,
    }).catch(() => {});
  }, [slides, currentSlideIndex, roomId, userId, userName]);

  return (
    <div
      className="flex-1 flex flex-col bg-muted/20 relative overflow-hidden"
      onClickCapture={handleStageClickCapture}
    >
      <MainStage
        mode={stageMode}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        embeddedUrl={embeddedUrl}
        drawingEnabled={canStudentDraw}
        activeTool={studentTool}
        activeColor={studentColor}
        strokes={strokes}
        roomId={roomId}
        userId={userId}
        userName={userName}
        role="student"
        iframeUnlocked={iframeUnlocked}
        rawSlides={rawSlides}
        hubType={hubType as any}
        customStage={customStage}
        isInterview={isInterview}
        onAddStroke={onAddStroke}
      />

      <div data-student-dock>
        <StudentMiniDock
          drawingEnabled={canStudentDraw}
          activeTool={studentTool}
          onToolChange={setStudentTool}
          activeColor={studentColor}
          onColorChange={setStudentColor}
          hubType={hubType as any}
        />
      </div>
    </div>
  );
};
