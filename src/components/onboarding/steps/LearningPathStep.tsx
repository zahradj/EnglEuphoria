import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Sparkles, BookOpen, Target, Calendar, CheckCircle2 } from 'lucide-react';
import { StudentLevel } from '@/hooks/useStudentLevel';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LearningPathStepProps {
  studentLevel: StudentLevel;
  interests: string[];
  onPathGenerated: (path: any) => void;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}

interface LearningPath {
  path_name: string;
  total_weeks: number;
  total_lessons: number;
  weeks: {
    week_number: number;
    theme: string;
    focus_skill: string;
    lessons: {
      lesson_number: number;
      title: string;
      skill_focus: string;
      activity_type: string;
      duration_minutes: number;
    }[];
  }[];
  learning_objectives: string[];
}

const levelConfig = {
  playground: {
    title: "Your Learning Adventure! 🗺️",
    subtitle: "Here's what we've prepared for you",
    buttonClass: "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600",
    accentColor: "text-orange-500",
    bgAccent: "bg-orange-50 dark:bg-orange-950/30",
  },
  academy: {
    title: "Your Learning Path 🎯",
    subtitle: "Personalized just for you",
    buttonClass: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600",
    accentColor: "text-indigo-500",
    bgAccent: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  professional: {
    title: "Your Professional Development Path",
    subtitle: "Tailored to your career goals",
    buttonClass: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    accentColor: "text-emerald-500",
    bgAccent: "bg-emerald-50 dark:bg-emerald-950/30",
  },
};

export const LearningPathStep: React.FC<LearningPathStepProps> = ({
  studentLevel,
  interests,
  onPathGenerated,
  onComplete,
  onBack,
  isLoading,
}) => {
  const config = levelConfig[studentLevel];
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePath();
  }, []);

  const generatePath = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-learning-path', {
        body: {
          interests,
          level: studentLevel,
          cefrLevel: 'A1', // Default starting level
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.success && data?.learningPath) {
        setLearningPath(data.learningPath);
        onPathGenerated(data.learningPath);
      } else {
        throw new Error(data?.error || 'Failed to generate learning path');
      }
    } catch (err) {
      console.error('Error generating learning path:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate your learning path');
      toast.error('Failed to generate learning path. You can continue anyway.');
      
      // Create a fallback path
      const fallbackPath: LearningPath = {
        path_name: `${studentLevel.charAt(0).toUpperCase() + studentLevel.slice(1)} English Journey`,
        total_weeks: 4,
        total_lessons: 20,
        weeks: [
          {
            week_number: 1,
            theme: "Getting Started",
            focus_skill: "speaking",
            lessons: [
              { lesson_number: 1, title: "Introduction & Greetings", skill_focus: "speaking", activity_type: "conversation", duration_minutes: 15 },
              { lesson_number: 2, title: "About Me", skill_focus: "writing", activity_type: "writing", duration_minutes: 15 },
            ],
          },
        ],
        learning_objectives: [
          "Build confidence in English communication",
          "Expand vocabulary in areas of interest",
          "Develop all four language skills",
        ],
      };
      setLearningPath(fallbackPath);
      onPathGenerated(fallbackPath);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Sparkles className={cn("h-16 w-16", config.accentColor)} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Creating Your Learning Path...
              </h2>
              <p className="text-muted-foreground">
                Our AI is designing a personalized curriculum based on your interests:
              </p>
              <p className="text-sm font-medium text-primary mt-2">
                {interests.join(', ')}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={cn("w-3 h-3 rounded-full", config.bgAccent)}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto mb-3", config.bgAccent)}>
            <Sparkles className={cn("h-5 w-5", config.accentColor)} />
            <span className="text-sm font-medium">AI-Personalized</span>
          </div>
          <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
          <p className="text-muted-foreground">{config.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {learningPath && (
            <>
              {/* Path Name */}
              <div className={cn("p-4 rounded-xl text-center", config.bgAccent)}>
                <h3 className="text-xl font-bold text-foreground">
                  {learningPath.path_name}
                </h3>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <Calendar className={cn("h-6 w-6 mx-auto mb-1", config.accentColor)} />
                  <div className="text-2xl font-bold">{learningPath.total_weeks}</div>
                  <div className="text-xs text-muted-foreground">Weeks</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <BookOpen className={cn("h-6 w-6 mx-auto mb-1", config.accentColor)} />
                  <div className="text-2xl font-bold">{learningPath.total_lessons}</div>
                  <div className="text-xs text-muted-foreground">Lessons</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <Target className={cn("h-6 w-6 mx-auto mb-1", config.accentColor)} />
                  <div className="text-2xl font-bold">{learningPath.learning_objectives?.length || 3}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
              </div>

              {/* Learning Objectives */}
              {learningPath.learning_objectives && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Your Learning Goals:</h4>
                  <ul className="space-y-2">
                    {learningPath.learning_objectives.slice(0, 3).map((objective, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className={cn("h-5 w-5 flex-shrink-0", config.accentColor)} />
                        <span>{objective}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Week Preview */}
              {learningPath.weeks && learningPath.weeks[0] && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Week 1 Preview: {learningPath.weeks[0].theme}</h4>
                  <div className="grid gap-2">
                    {learningPath.weeks[0].lessons?.slice(0, 3).map((lesson, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold", 
                          config.buttonClass.split(' ').filter(c => c.startsWith('bg-')).join(' ')
                        )}>
                          {lesson.lesson_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.duration_minutes} min • {lesson.skill_focus}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-800 dark:text-yellow-200">
              {error} - Don't worry, you can still start learning!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={onComplete}
              disabled={isLoading}
              className={cn("flex-1 text-white", config.buttonClass)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Learning!
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
