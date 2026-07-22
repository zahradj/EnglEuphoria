import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2, Volume2, Loader2 } from 'lucide-react';
import { StudentLevel } from '@/hooks/useStudentLevel';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useMistakeTracker } from '@/hooks/useMistakeTracker';
import { useAcademyAudio } from '@/hooks/useAcademyAudio';

interface QuickAssessmentStepProps {
  studentLevel: StudentLevel;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const questionsByLevel: Record<StudentLevel, Question[]> = {
  playground: [
    {
      id: 1,
      question: "What color is the sky? ☀️",
      options: ["Red", "Blue", "Green", "Yellow"],
      correctIndex: 1,
    },
    {
      id: 2,
      question: "How many legs does a cat have? 🐱",
      options: ["Two", "Three", "Four", "Five"],
      correctIndex: 2,
    },
    {
      id: 3,
      question: "Which word means 'happy'? 😊",
      options: ["Sad", "Glad", "Mad", "Bad"],
      correctIndex: 1,
    },
    {
      id: 4,
      question: "Complete: 'I ___ a student.'",
      options: ["is", "am", "are", "be"],
      correctIndex: 1,
    },
    {
      id: 5,
      question: "What do you say when you meet someone?",
      options: ["Goodbye", "Hello", "Sorry", "Thanks"],
      correctIndex: 1,
    },
  ],
  academy: [
    {
      id: 1,
      question: "Choose the correct sentence:",
      options: [
        "She don't like pizza.",
        "She doesn't likes pizza.",
        "She doesn't like pizza.",
        "She not like pizza.",
      ],
      correctIndex: 2,
    },
    {
      id: 2,
      question: "What's the past tense of 'go'?",
      options: ["goed", "went", "gone", "going"],
      correctIndex: 1,
    },
    {
      id: 3,
      question: "'I've been waiting for ages' means:",
      options: [
        "I waited a short time",
        "I'm still waiting now",
        "I will wait later",
        "I don't want to wait",
      ],
      correctIndex: 1,
    },
    {
      id: 4,
      question: "Which word is a synonym for 'enormous'?",
      options: ["Tiny", "Huge", "Normal", "Average"],
      correctIndex: 1,
    },
    {
      id: 5,
      question: "Complete: 'If I ___ rich, I would travel the world.'",
      options: ["am", "was", "were", "be"],
      correctIndex: 2,
    },
  ],
  professional: [
    {
      id: 1,
      question: "Which is correct in formal writing?",
      options: [
        "Please find attached the report.",
        "The report is attached, please find.",
        "Attached please find the report.",
        "Find attached the report please.",
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      question: "'Let's touch base next week' means:",
      options: [
        "Let's play sports",
        "Let's meet or communicate",
        "Let's finish the project",
        "Let's cancel the meeting",
      ],
      correctIndex: 1,
    },
    {
      id: 3,
      question: "The company's revenue ___ by 15% last quarter.",
      options: ["raise", "raised", "rose", "risen"],
      correctIndex: 2,
    },
    {
      id: 4,
      question: "Which is the most professional closing?",
      options: [
        "Cheers, John",
        "Best regards, John",
        "Later, John",
        "Bye, John",
      ],
      correctIndex: 1,
    },
    {
      id: 5,
      question: "'We need to think outside the box' means:",
      options: [
        "Work in a different location",
        "Think creatively and unconventionally",
        "Focus on packaging",
        "Reduce costs",
      ],
      correctIndex: 1,
    },
  ],
};

const levelConfig = {
  playground: {
    title: "Quick English Check! 📝",
    subtitle: "Answer 5 fun questions",
    buttonClass: "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600",
    selectedClass: "border-orange-400 bg-orange-100 dark:bg-orange-950/50",
    correctClass: "border-green-400 bg-green-100 dark:bg-green-950/50",
    wrongClass: "border-red-400 bg-red-100 dark:bg-red-950/50",
  },
  academy: {
    title: "Quick English Check 🎯",
    subtitle: "5 questions to find your level",
    buttonClass: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600",
    selectedClass: "border-indigo-400 bg-indigo-100 dark:bg-indigo-950/50",
    correctClass: "border-green-400 bg-green-100 dark:bg-green-950/50",
    wrongClass: "border-red-400 bg-red-100 dark:bg-red-950/50",
  },
  professional: {
    title: "Quick Assessment",
    subtitle: "5 questions to customize your learning",
    buttonClass: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    selectedClass: "border-emerald-400 bg-emerald-100 dark:bg-emerald-950/50",
    correctClass: "border-green-400 bg-green-100 dark:bg-green-950/50",
    wrongClass: "border-red-400 bg-red-100 dark:bg-red-950/50",
  },
};

export const QuickAssessmentStep: React.FC<QuickAssessmentStepProps> = ({
  studentLevel,
  onComplete,
  onBack,
}) => {
  const questions = questionsByLevel[studentLevel];
  const config = levelConfig[studentLevel];
  const { recordMistake } = useMistakeTracker();
  const { playVoice, isLoading: ttsLoading, isPlaying: ttsPlaying } = useAcademyAudio();

  const voiceIdByLevel: Record<StudentLevel, string> = {
    playground: 'pFZP5JQG7iQjIQuC4Bku', // Lily — warm, kid-friendly
    academy: 'EXAVITQu4vr4xnSDxMaL',    // Sarah — clear, neutral
    professional: 'CwhRBWXzGAHq8TQ4Fs17', // Roger — confident, professional
  };

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const speakQuestion = () => {
    const cleaned = question.question.replace(/[^\p{L}\p{N}\s'.,!?-]/gu, '').trim();
    const optionsText = question.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('. ');
    playVoice(`${cleaned}. ${optionsText}`, voiceIdByLevel[studentLevel]);
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.correctIndex;
    const newCorrectCount = isCorrect ? correctAnswers + 1 : correctAnswers;
    setCorrectAnswers(newCorrectCount);
    setAnswers(prev => [...prev, selectedAnswer]);
    setShowResult(true);

    // Record mistake if answer is wrong
    if (!isCorrect) {
      const correctOption = question.options[question.correctIndex];
      const selectedOption = question.options[selectedAnswer];
      
      await recordMistake({
        word: correctOption,
        context: 'placement_test',
        error_type: 'vocabulary',
        correct_answer: correctOption,
        student_answer: selectedOption,
      });
    }

    setTimeout(() => {
      if (isLastQuestion) {
        // Calculate score as percentage
        const score = Math.round((newCorrectCount / questions.length) * 100);
        onComplete(score);
      } else {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1000);
  };

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index ? config.selectedClass : "border-border";
    }
    if (index === question.correctIndex) {
      return config.correctClass;
    }
    if (selectedAnswer === index && index !== question.correctIndex) {
      return config.wrongClass;
    }
    return "border-border opacity-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
          <p className="text-muted-foreground">{config.subtitle}</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{correctAnswers} correct</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question */}
              <div className="text-lg font-medium text-foreground mb-4 text-center p-4 bg-muted/50 rounded-xl relative">
                <button
                  type="button"
                  onClick={speakQuestion}
                  disabled={ttsLoading}
                  aria-label="Listen to question"
                  className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background border border-border transition focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ttsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Volume2 className={cn('h-4 w-4', ttsPlaying ? 'text-primary animate-pulse' : 'text-muted-foreground')} />
                  )}
                </button>
                {question.question}
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showResult}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                      "hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary",
                      getOptionClass(index)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium">{option}</span>
                      {showResult && index === question.correctIndex && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {currentQuestion === 0 && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null || showResult}
              className={cn(
                "flex-1 text-white",
                config.buttonClass,
                currentQuestion === 0 ? "" : "w-full"
              )}
            >
              {isLastQuestion ? "See Results" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
