import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { FileText, Zap, Target, Lock, CheckCircle2, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { IronLesson, useIronLessonProgress, useUpdateIronProgress } from '@/hooks/useIronLessons';
import { VocabularyRecallBox } from './VocabularyRecallBox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const COHORT_THEMES = {
  A: {
    name: 'Foundation',
    primary: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  B: {
    name: 'Bridge',
    primary: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    accent: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  C: {
    name: 'Mastery',
    primary: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
};

interface IronLessonPlayerProps {
  lesson: IronLesson;
  onBack?: () => void;
}

type Phase = 'presentation' | 'practice' | 'production';

export const IronLessonPlayer: React.FC<IronLessonPlayerProps> = ({ lesson, onBack }) => {
  const theme = COHORT_THEMES[lesson.cohort_group];
  const [currentPhase, setCurrentPhase] = useState<Phase>('presentation');
  const [presentationRead, setPresentationRead] = useState(false);
  const [practiceCompletion, setPracticeCompletion] = useState({
    taskA: false,
    taskB: false,
    taskC: false,
  });
  const [productionResponse, setProductionResponse] = useState('');

  const { data: progress } = useIronLessonProgress(lesson.id);
  const updateProgress = useUpdateIronProgress();

  // Load saved progress
  useEffect(() => {
    if (progress) {
      setCurrentPhase(progress.current_phase === 'completed' ? 'production' : progress.current_phase);
      setPresentationRead(progress.presentation_completed);
      setPracticeCompletion(progress.practice_completion as typeof practiceCompletion);
      setProductionResponse(progress.production_response || '');
    }
  }, [progress]);

  const allPracticeComplete = practiceCompletion.taskA && practiceCompletion.taskB && practiceCompletion.taskC;
  const canAccessPractice = presentationRead;
  const canAccessProduction = allPracticeComplete;

  const progressPercentage = 
    currentPhase === 'presentation' ? 33 :
    currentPhase === 'practice' ? 66 :
    100;

  const handlePresentationComplete = async () => {
    setPresentationRead(true);
    await updateProgress.mutateAsync({
      lessonId: lesson.id,
      presentation_completed: true,
      current_phase: 'practice',
    });
    setCurrentPhase('practice');
  };

  const handleTaskComplete = async (task: 'taskA' | 'taskB' | 'taskC') => {
    const newCompletion = { ...practiceCompletion, [task]: true };
    setPracticeCompletion(newCompletion);
    
    const allDone = newCompletion.taskA && newCompletion.taskB && newCompletion.taskC;
    await updateProgress.mutateAsync({
      lessonId: lesson.id,
      practice_completion: newCompletion,
      current_phase: allDone ? 'production' : 'practice',
    });

    if (allDone) {
      setCurrentPhase('production');
      toast.success('All practice tasks complete! Production unlocked.');
    }
  };

  const handleSubmitProduction = async () => {
    if (!productionResponse.trim()) {
      toast.error('Please write your response before submitting');
      return;
    }

    await updateProgress.mutateAsync({
      lessonId: lesson.id,
      production_submitted: true,
      production_response: productionResponse,
      current_phase: 'completed',
      completed_at: new Date().toISOString(),
    });

    toast.success('Lesson completed! Great work!');
  };

  const PhaseTab = ({ phase, label, icon: Icon, locked }: { phase: Phase; label: string; icon: React.ElementType; locked: boolean }) => (
    <button
      onClick={() => !locked && setCurrentPhase(phase)}
      disabled={locked}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all',
        currentPhase === phase
          ? `${theme.accent} text-white`
          : locked
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-muted hover:bg-muted/80'
      )}
    >
      {locked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className={cn('min-h-dvh p-6', theme.bg)}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <Badge className={`${theme.accent} text-white mb-1`}>
                Cohort {lesson.cohort_group}: {theme.name}
              </Badge>
              <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
            </div>
          </div>
          <Badge variant="outline" className={theme.text}>
            {lesson.cefr_level}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Phase Tabs */}
        <div className="flex gap-2">
          <PhaseTab phase="presentation" label="Presentation" icon={FileText} locked={false} />
          <PhaseTab phase="practice" label="Practice" icon={Zap} locked={!canAccessPractice} />
          <PhaseTab phase="production" label="Production" icon={Target} locked={!canAccessProduction} />
        </div>

        {/* Content */}
        {currentPhase === 'presentation' && (
          <Card className={cn('border-2', theme.border)}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                The Download
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Visual Aid - Display prominently at top */}
              {lesson.presentation_content.visualAidUrl && (
                <div className="relative">
                  <img
                    src={lesson.presentation_content.visualAidUrl}
                    alt="Lesson visual aid"
                    className={cn(
                      'w-full h-64 object-cover rounded-xl border-2',
                      theme.border
                    )}
                  />
                </div>
              )}

              {lesson.presentation_content.concept && (
                <div>
                  <h3 className="font-semibold mb-2">Core Concept</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {lesson.presentation_content.concept}
                  </p>
                </div>
              )}

              {/* Vocabulary Recall Box */}
              {lesson.presentation_content.vocabulary && lesson.presentation_content.vocabulary.length > 0 && (
                <VocabularyRecallBox
                  vocabulary={lesson.presentation_content.vocabulary}
                  cohortGroup={lesson.cohort_group}
                />
              )}
              
              {lesson.presentation_content.keyPoints && lesson.presentation_content.keyPoints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Points</h3>
                  <ul className="space-y-2">
                    {lesson.presentation_content.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={cn('h-5 w-5 mt-0.5', theme.text)} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              <Button 
                onClick={handlePresentationComplete}
                disabled={presentationRead}
                className="w-full"
              >
                {presentationRead ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed - Continue to Practice
                  </>
                ) : (
                  <>
                    I've Read This
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentPhase === 'practice' && (
          <Card className={cn('border-2', theme.border)}>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                The Drill
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Task A */}
              <div className={cn('p-4 rounded-lg border', practiceCompletion.taskA ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' : 'bg-muted/50')}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={practiceCompletion.taskA}
                    onCheckedChange={() => !practiceCompletion.taskA && handleTaskComplete('taskA')}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="outline">Task A</Badge>
                      Foundation
                    </h4>
                    <p className="mt-2 text-muted-foreground">
                      {lesson.practice_content.taskA.instruction}
                    </p>
                    {lesson.practice_content.taskA.pattern && (
                      <p className="mt-2 text-sm italic text-muted-foreground">
                        Pattern: {lesson.practice_content.taskA.pattern}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Task B */}
              <div className={cn('p-4 rounded-lg border', practiceCompletion.taskB ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' : 'bg-muted/50')}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={practiceCompletion.taskB}
                    onCheckedChange={() => !practiceCompletion.taskB && handleTaskComplete('taskB')}
                    disabled={!practiceCompletion.taskA}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="outline">Task B</Badge>
                      Building
                      {!practiceCompletion.taskA && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </h4>
                    <p className="mt-2 text-muted-foreground">
                      {lesson.practice_content.taskB.instruction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Task C */}
              <div className={cn('p-4 rounded-lg border', practiceCompletion.taskC ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800' : 'bg-muted/50')}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={practiceCompletion.taskC}
                    onCheckedChange={() => !practiceCompletion.taskC && handleTaskComplete('taskC')}
                    disabled={!practiceCompletion.taskB}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Badge variant="outline">Task C</Badge>
                      Challenge
                      {!practiceCompletion.taskB && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </h4>
                    <p className="mt-2 text-muted-foreground">
                      {lesson.practice_content.taskC.instruction}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentPhase === 'production' && (
          <Card className={cn('border-2', theme.border)}>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                The Test
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {lesson.production_content.scenario && (
                <div>
                  <h3 className="font-semibold mb-2">Scenario</h3>
                  <p className="text-muted-foreground">{lesson.production_content.scenario}</p>
                </div>
              )}

              {lesson.production_content.mission && (
                <div className={cn('p-4 rounded-lg', theme.bg, 'border', theme.border)}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className={cn('h-4 w-4', theme.text)} />
                    Your Mission
                  </h3>
                  <p className={theme.text}>{lesson.production_content.mission}</p>
                </div>
              )}

              {lesson.production_content.constraints && lesson.production_content.constraints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Constraints</h3>
                  <ul className="space-y-1">
                    {lesson.production_content.constraints.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Your Response</h3>
                <Textarea
                  value={productionResponse}
                  onChange={(e) => setProductionResponse(e.target.value)}
                  placeholder="Write your response here..."
                  rows={6}
                  disabled={progress?.production_submitted}
                />
              </div>

              <Button 
                onClick={handleSubmitProduction}
                disabled={!productionResponse.trim() || progress?.production_submitted}
                className="w-full"
              >
                {progress?.production_submitted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submitted
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Response
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
