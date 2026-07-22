import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CollaborativeCanvas } from '@/components/classroom/shared/CollaborativeCanvas';
import { StudentQuizView } from './StudentQuizView';
import { StudentPollView } from './StudentPollView';
import { WhiteboardStroke } from '@/services/whiteboardService';
import { Eye, PenLine } from 'lucide-react';
import DynamicSlideRenderer from '@/components/lesson-player/DynamicSlideRenderer';
import type { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { useHubClassroomTheme, type HubType } from '@/components/classroom/shared/useHubClassroomTheme';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface PollOption {
  id: string;
  text: string;
}

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

const toPremiumSlide = (slide: Slide | undefined, index: number): GeneratedSlide | null => {
  if (!slide) return null;
  return {
    ...slide,
    id: String(slide.id ?? index + 1),
    order: index + 1,
    title: String(slide.title || `Slide ${index + 1}`),
    slideType: (slide as any).slideType || ((slide as any).activityType ? 'activity' : 'hook'),
    type: (slide as any).type || (slide as any).activityType || 'title',
    content: typeof slide.content === 'string' ? { prompt: slide.content } : slide.content,
    teacherNotes: (slide as any).teacherNotes || (slide as any).teacher_script || '',
    keywords: Array.isArray((slide as any).keywords) ? (slide as any).keywords : [],
  } as GeneratedSlide;
};

interface StudentCenterStageProps {
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
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
  onClearMyStrokes: () => void;
  hubType?: HubType;
}

export const StudentCenterStage: React.FC<StudentCenterStageProps> = ({
  slides,
  currentSlideIndex,
  studentCanDraw,
  activeTool,
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
  onAddStroke,
  hubType = 'academy'
}) => {
  const currentSlide = slides[currentSlideIndex];
  const isQuizSlide = currentSlide?.type === 'quiz';
  const isPollSlide = currentSlide?.type === 'poll';
  const premiumSlide = toPremiumSlide(currentSlide, currentSlideIndex);
  const theme = useHubClassroomTheme(hubType);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden" style={theme.meshGradient}>

      {/* Mode Indicator */}
      <div className="absolute top-4 left-4 z-20">
        <Badge 
          variant="secondary" 
          className={`flex items-center gap-1 ${
            studentCanDraw 
              ? 'bg-green-600/90 text-white' 
              : 'bg-white/85 text-gray-700 border border-gray-200'
          }`}
        >
          {studentCanDraw ? (
            <>
              <PenLine className="h-3 w-3" />
              Draw Mode
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              View Only
            </>
          )}
        </Badge>
      </div>

      {/* Main Slide Display */}
      <div className="flex-1 flex items-center justify-center p-6">
        {(() => {
          // Slide canvas: white inner surface inside a hub-tinted frame for legibility + brand.
          return (
        <div
          key={currentSlideIndex}
          className={`relative w-full max-w-4xl aspect-[16/9] bg-white ${theme.radiusClass} overflow-hidden ${theme.ringClass} animate-fade-in`}
          style={theme.glowShadow}
        >


          {/* Quiz Slide */}
          {isQuizSlide && currentSlide.quizQuestion && currentSlide.quizOptions && sessionId ? (
            <StudentQuizView
              sessionId={sessionId}
              slideId={currentSlide.id}
              question={currentSlide.quizQuestion}
              options={currentSlide.quizOptions}
              studentId={userId}
              studentName={userName}
              quizActive={quizActive}
              quizLocked={quizLocked}
              quizRevealAnswer={quizRevealAnswer}
            />
          ) : isPollSlide && currentSlide.pollQuestion && currentSlide.pollOptions && sessionId ? (
            <StudentPollView
              sessionId={sessionId}
              slideId={currentSlide.id}
              question={currentSlide.pollQuestion}
              options={currentSlide.pollOptions}
              studentId={userId}
              studentName={userName}
              pollActive={pollActive}
              pollShowResults={pollShowResults}
            />
          ) : premiumSlide ? (
            <div className="w-full h-full overflow-y-auto flex items-center justify-center">
              <DynamicSlideRenderer
                slide={premiumSlide}
                hub={(((currentSlide as any)?.hub === 'playground' || (currentSlide as any)?.hub === 'success' || (currentSlide as any)?.hub === 'professional')
                  ? (currentSlide as any).hub
                  : 'academy') as any}
                onCorrectAnswer={() => {}}
                onIncorrectAnswer={() => {}}
                onComplete={() => {}}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-white" />
          )}

          {/* Collaborative Canvas Overlay (not for quiz or poll slides) */}
          {!isQuizSlide && !isPollSlide && (
            <CollaborativeCanvas
              roomId={roomId}
              userId={userId}
              userName={userName}
              role="student"
              canDraw={studentCanDraw}
              activeTool={studentCanDraw ? 'pen' : 'pointer'}
              activeColor={activeColor}
              strokes={strokes}
              onAddStroke={onAddStroke}
            />
          )}
          
          {/* Slide Number Indicator */}
          <div
            className="absolute bottom-4 right-4 text-white px-3 py-1 rounded-full text-sm z-20 font-medium"
            style={theme.buttonGradient}
          >
            {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>
        );
        })()}
      </div>

      {/* Teacher Control Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-white/85 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-700 flex items-center gap-2 border border-gray-200 shadow-sm">
          <span className={`h-2 w-2 rounded-full ${theme.accentBg} animate-pulse`} />
          Teacher is controlling slides
        </div>
      </div>
    </div>
  );
};
