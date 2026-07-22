import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eraser,
  Type,
  MousePointer2,
  Circle,
  Trash2,
  Monitor,
  Layout,
  PenTool,
  Globe
} from 'lucide-react';
import { CollaborativeCanvas } from '@/components/classroom/shared/CollaborativeCanvas';
import { QuizSlideRenderer } from '@/components/classroom/shared/QuizSlideRenderer';
import { PollSlideRenderer } from '@/components/classroom/shared/PollSlideRenderer';
import { QuizControlPanel } from './QuizControlPanel';
import { PollControlPanel } from './PollControlPanel';
import { QuizResponsesGrid } from './QuizResponsesGrid';
import { PollResultsChart } from '@/components/classroom/shared/PollResultsChart';
import { WhiteboardStroke } from '@/services/whiteboardService';
import { useQuizInteraction } from '@/hooks/useQuizInteraction';
import { usePollInteraction } from '@/hooks/usePollInteraction';
import { useIdleOpacity } from '@/hooks/useIdleOpacity';
import { TargetWordsOverlay } from '@/components/classroom/TargetWordsOverlay';
import { SmartSummaryTip } from '@/components/classroom/SmartSummaryTip';
import { EmbeddedContentViewer } from './EmbeddedContentViewer';
import DynamicSlideRenderer from '@/components/lesson-player/DynamicSlideRenderer';
import { HomeworkSlideLivePreview } from '@/components/creator-studio/shared/HomeworkSlideLivePreview';
import type { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface CenterStageProps {
  slides: Slide[];
  currentSlideIndex: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  strokes: WhiteboardStroke[];
  roomId: string;
  userId: string;
  userName: string;
  sessionId?: string;
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
  onClearCanvas: () => void;
  activeCanvasTab?: string;
  onCanvasTabChange?: (tab: string) => void;
  embeddedUrl?: string | null;
  onCloseEmbed?: () => void;
  sessionContext?: Record<string, any>;
  hubType?: 'playground' | 'academy' | 'professional' | 'success';
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#F38181', '#AA96DA', '#FCBAD3', '#2D4059',
  '#FFFFFF', '#000000'
];

const CANVAS_TABS = [
  { id: 'slides', label: 'Slides', icon: Layout },
  { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
  { id: 'web', label: 'Web Content', icon: Globe },
];

const getEmbedUrl = (inputUrl: string): string => {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}?autoplay=0&rel=0`;
    }
    if (parsed.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}?autoplay=0&rel=0`;
    }
    if (parsed.hostname.includes('docs.google.com') && !inputUrl.includes('/embed')) {
      return inputUrl.replace('/edit', '/preview').replace('/view', '/preview');
    }
    return inputUrl;
  } catch { return inputUrl; }
};

export const CenterStage: React.FC<CenterStageProps> = ({
  slides,
  currentSlideIndex,
  onPrevSlide,
  onNextSlide,
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  strokes,
  roomId,
  userId,
  userName,
  sessionId,
  onAddStroke,
  onClearCanvas,
  activeCanvasTab = 'slides',
  onCanvasTabChange,
  embeddedUrl,
  onCloseEmbed,
  sessionContext = {},
  hubType = 'academy'
}) => {
  const currentSlide = slides[currentSlideIndex];
  const isQuizSlide = currentSlide?.type === 'quiz';
  const isPollSlide = currentSlide?.type === 'poll';
  const toolbarIdle = useIdleOpacity({ idleTimeout: 3000, idleOpacity: 0.4 });

  const {
    responses, quizActive, quizLocked, quizRevealAnswer,
    startQuiz, lockQuiz, revealAnswer, resetQuiz
  } = useQuizInteraction({ sessionId, slideId: currentSlide?.id, roomId, isTeacher: true });

  const {
    responses: pollResponses, pollActive, pollShowResults, voteDistribution,
    startPoll, toggleResults, closePoll, resetPoll
  } = usePollInteraction({ sessionId, slideId: currentSlide?.id, roomId, isTeacher: true });

  const tools = [
    { id: 'pointer', icon: MousePointer2, label: 'Pointer' },
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'highlighter', icon: Type, label: 'Highlighter' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'laser', icon: Circle, label: 'Laser' }
  ];

  const renderSlideContent = () => {
    // Homework task slides — appended at the end of the lesson deck so teachers
    // can present every homework activity inline.
    if ((currentSlide as any)?.type === 'homework_task' && (currentSlide as any)?.homeworkTask) {
      const previewHub = ((currentSlide as any)?.hub === 'playground' || (currentSlide as any)?.hub === 'success')
        ? (currentSlide as any).hub
        : (hubType === 'professional' ? 'success' : (hubType ?? 'academy'));
      return (
        <div className="w-full h-full overflow-y-auto flex items-start justify-center p-4">
          <HomeworkSlideLivePreview
            hub={previewHub as any}
            task={(currentSlide as any).homeworkTask}
            taskNumber={(currentSlide as any).homeworkIndex ?? 1}
          />
        </div>
      );
    }
    if (isQuizSlide && currentSlide.quizQuestion && currentSlide.quizOptions) {
      return (
        <QuizSlideRenderer
          question={currentSlide.quizQuestion}
          options={currentSlide.quizOptions}
          selectedOptionId={null}
          showResult={quizRevealAnswer}
          disabled={true}
          onSelectOption={() => {}}
        />
      );
    }
    if (isPollSlide && currentSlide.pollQuestion && currentSlide.pollOptions) {
      return (
        <PollSlideRenderer
          question={currentSlide.pollQuestion}
          options={currentSlide.pollOptions}
          selectedOptionId={null}
          showResults={pollShowResults}
          disabled={true}
          voteDistribution={voteDistribution}
          onSelectOption={() => {}}
        />
      );
    }
    const premiumSlide = toPremiumSlide(currentSlide, currentSlideIndex);
    if (!premiumSlide) return <div className="w-full h-full bg-white" />;
    const slideHub = (currentSlide as any)?.hub;
    const resolvedHub = (slideHub === 'playground' || slideHub === 'success' || slideHub === 'professional')
      ? slideHub
      : (hubType ?? 'academy');
    return (
      <div className="w-full h-full overflow-y-auto flex items-center justify-center">
        <DynamicSlideRenderer
          slide={premiumSlide}
          hub={resolvedHub as any}
          onCorrectAnswer={() => {}}
          onIncorrectAnswer={() => {}}
          onComplete={() => {}}
        />
      </div>
    );
  };

  const hubBgTint =
    hubType === 'playground' ? 'bg-white border-gray-200'
    : (hubType === 'success' || hubType === 'professional') ? 'bg-emerald-50/70 border-emerald-200'
    : 'bg-purple-50/70 border-purple-200';

  const tabAccent =
    hubType === 'playground' ? 'border-orange-500'
    : (hubType === 'success' || hubType === 'professional') ? 'border-emerald-500'
    : 'border-purple-500';

  return (
    <div className="flex-1 flex flex-col bg-transparent relative overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 pt-1 shrink-0">
        {CANVAS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onCanvasTabChange?.(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors ${
              activeCanvasTab === tab.id
                ? `bg-white text-gray-900 border-b-2 ${tabAccent} shadow-sm`
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Target Words Overlay */}
      <TargetWordsOverlay sessionContext={sessionContext} isTeacher={true} />

      {/* Smart Summary Tip */}
      <SmartSummaryTip sessionContext={sessionContext} />

      {/* Canvas Content */}
      <div className="flex-1 flex items-center justify-center p-1 sm:p-2 min-h-0">
        {activeCanvasTab === 'slides' && (
          <>
            <div className={`relative w-full h-full max-h-full ${hubBgTint} border-2 rounded-2xl shadow-lg overflow-hidden`}>
              {renderSlideContent()}
              {!isQuizSlide && !isPollSlide && (
                <CollaborativeCanvas
                  roomId={roomId} userId={userId} userName={userName} role="teacher"
                  canDraw={activeTool !== 'pointer' && activeTool !== 'laser'}
                  activeTool={activeTool as any} activeColor={activeColor}
                  strokes={strokes} onAddStroke={onAddStroke}
                />
              )}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
                {currentSlideIndex + 1} / {slides.length}
              </div>
            </div>
            {isQuizSlide && currentSlide.quizOptions && (
              <div className="ml-4 w-72 shrink-0">
                <QuizResponsesGrid responses={responses} showResults={quizRevealAnswer} options={currentSlide.quizOptions.map(o => ({ id: o.id, text: o.text }))} />
              </div>
            )}
            {isPollSlide && currentSlide.pollOptions && (
              <div className="ml-4 w-72 shrink-0 bg-card rounded-xl p-4 border border-border">
                <h3 className="font-semibold mb-3">Live Results</h3>
                <PollResultsChart options={currentSlide.pollOptions} voteDistribution={voteDistribution} />
              </div>
            )}
          </>
        )}

        {activeCanvasTab === 'whiteboard' && (
          <div className="relative w-full h-full bg-white rounded-lg shadow-xl overflow-hidden">
            <CollaborativeCanvas
              roomId={roomId} userId={userId} userName={userName} role="teacher"
              canDraw={activeTool !== 'pointer' && activeTool !== 'laser'}
              activeTool={activeTool as any} activeColor={activeColor}
              strokes={strokes} onAddStroke={onAddStroke}
            />
          </div>
        )}

        {activeCanvasTab === 'web' && (
          <div className="relative w-full h-full bg-white rounded-lg shadow-xl overflow-hidden">
            {embeddedUrl ? (
              <EmbeddedContentViewer
                url={embeddedUrl}
                onClose={() => onCloseEmbed?.()}
                enableDrawing
                roomId={roomId}
                userId={userId}
                userName={userName}
                strokes={strokes}
                onAddStroke={onAddStroke}
                onClearCanvas={onClearCanvas}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No web content embedded yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Use the "Embed Link" button to share content.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz/Poll Control Panels */}
      {isQuizSlide && activeCanvasTab === 'slides' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
          <QuizControlPanel quizActive={quizActive} quizLocked={quizLocked} quizRevealAnswer={quizRevealAnswer} responsesCount={responses.length} onStartQuiz={startQuiz} onLockQuiz={lockQuiz} onRevealAnswer={revealAnswer} onResetQuiz={resetQuiz} />
        </div>
      )}
      {isPollSlide && activeCanvasTab === 'slides' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
          <PollControlPanel pollActive={pollActive} pollShowResults={pollShowResults} responsesCount={pollResponses.length} onStartPoll={startPoll} onToggleResults={toggleResults} onClosePoll={closePoll} onResetPoll={resetPoll} />
        </div>
      )}

      {/* Navigation Arrows (slides tab only) */}
      {activeCanvasTab === 'slides' && (
        <>
          <Button variant="ghost" size="icon" onClick={onPrevSlide} disabled={currentSlideIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/80 hover:bg-gray-100 text-gray-700 shadow-md disabled:opacity-30">
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextSlide} disabled={currentSlideIndex === slides.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/80 hover:bg-gray-100 text-gray-700 shadow-md disabled:opacity-30">
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Vertical Floating Toolbar — hub-branded, pinned to the LEFT edge */}
      {(() => {
        const hubAccent = hubType === 'playground'
          ? { hex: '#FE6A2F', ring: 'ring-orange-300', border: 'border-orange-200' }
          : hubType === 'success' || hubType === 'professional'
          ? { hex: '#059669', ring: 'ring-emerald-300', border: 'border-emerald-200' }
          : { hex: '#6B21A8', ring: 'ring-purple-300', border: 'border-purple-200' };
        return (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20"
            style={toolbarIdle.style}
            onMouseMove={toolbarIdle.onMouseMove}
            onMouseEnter={toolbarIdle.onMouseEnter}
          >
            <div className={`flex flex-col items-center gap-1 glass-panel rounded-full px-2 py-3 shadow-xl border ${hubAccent.border} bg-white/95 backdrop-blur-md`}>
              {tools.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <Button
                    key={tool.id}
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full transition-colors ${isActive ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                    style={isActive ? { backgroundColor: hubAccent.hex } : undefined}
                    onClick={() => onToolChange(tool.id)}
                    title={tool.label}
                  >
                    <tool.icon className="h-5 w-5" />
                  </Button>
                );
              })}
              <div className="h-px w-6 bg-gray-200 my-1" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100" title="Color">
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400" style={{ backgroundColor: activeColor }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-auto p-2 bg-white border-gray-200">
                  <div className="grid grid-cols-5 gap-1">
                    {COLORS.map(color => (
                      <button key={color} onClick={() => onColorChange(color)} className={`w-6 h-6 rounded-full transition-transform ${activeColor === color ? `ring-2 ${hubAccent.ring} scale-110` : 'hover:scale-105'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-100" onClick={onClearCanvas} title="Clear Canvas">
                <Trash2 className="h-5 w-5" />
              </Button>
              {activeCanvasTab === 'slides' && (
                <>
                  <div className="h-px w-6 bg-gray-200 my-1" />
                  <Button variant="ghost" size="icon" onClick={onPrevSlide} disabled={currentSlideIndex === 0} className="h-10 w-10 rounded-full text-gray-500 hover:text-gray-900 disabled:opacity-30" title="Previous slide">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onNextSlide} disabled={currentSlideIndex === slides.length - 1} className="h-10 w-10 rounded-full text-gray-500 hover:text-gray-900 disabled:opacity-30" title="Next slide">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};