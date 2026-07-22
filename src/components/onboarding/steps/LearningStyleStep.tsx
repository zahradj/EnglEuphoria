import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Eye, Headphones, Hand } from 'lucide-react';
import { StudentLevel } from '@/hooks/useStudentLevel';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface LearningStyleStepProps {
  studentLevel: StudentLevel;
  onComplete: (learningStyle: 'visual' | 'auditory' | 'kinesthetic') => void;
  onBack: () => void;
}

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    style: 'visual' | 'auditory' | 'kinesthetic';
    icon?: React.ReactNode;
  }[];
}

const questionsByLevel: Record<StudentLevel, Question[]> = {
  playground: [
    {
      id: 1,
      question: "How do you like to learn new things? 🎨",
      options: [
        { text: "Watch colorful videos! 📺", style: 'visual' },
        { text: "Listen to fun songs! 🎵", style: 'auditory' },
        { text: "Play games and move around! 🏃", style: 'kinesthetic' },
      ],
    },
    {
      id: 2,
      question: "What helps you remember words best? 🧠",
      options: [
        { text: "Pictures and flashcards! 🖼️", style: 'visual' },
        { text: "Saying them out loud! 🗣️", style: 'auditory' },
        { text: "Acting them out! 🎭", style: 'kinesthetic' },
      ],
    },
    {
      id: 3,
      question: "What's your favorite in class? ⭐",
      options: [
        { text: "Drawing and coloring! 🎨", style: 'visual' },
        { text: "Singing and stories! 📖", style: 'auditory' },
        { text: "Dancing and games! 💃", style: 'kinesthetic' },
      ],
    },
  ],
  academy: [
    {
      id: 1,
      question: "When learning something new, you prefer to:",
      options: [
        { text: "Watch videos or diagrams", style: 'visual', icon: <Eye className="w-5 h-5" /> },
        { text: "Listen to explanations or podcasts", style: 'auditory', icon: <Headphones className="w-5 h-5" /> },
        { text: "Try it yourself hands-on", style: 'kinesthetic', icon: <Hand className="w-5 h-5" /> },
      ],
    },
    {
      id: 2,
      question: "You remember things best by:",
      options: [
        { text: "Seeing them written down", style: 'visual', icon: <Eye className="w-5 h-5" /> },
        { text: "Hearing them spoken", style: 'auditory', icon: <Headphones className="w-5 h-5" /> },
        { text: "Doing or practicing them", style: 'kinesthetic', icon: <Hand className="w-5 h-5" /> },
      ],
    },
    {
      id: 3,
      question: "In class, you enjoy:",
      options: [
        { text: "Pictures, charts, and colors", style: 'visual', icon: <Eye className="w-5 h-5" /> },
        { text: "Discussions and music", style: 'auditory', icon: <Headphones className="w-5 h-5" /> },
        { text: "Games, role-play, and movement", style: 'kinesthetic', icon: <Hand className="w-5 h-5" /> },
      ],
    },
  ],
  professional: [
    {
      id: 1,
      question: "When acquiring new skills, I prefer:",
      options: [
        { text: "Visual presentations and written materials", style: 'visual', icon: <Eye className="w-5 h-5" /> },
        { text: "Audio lectures and discussions", style: 'auditory', icon: <Headphones className="w-5 h-5" /> },
        { text: "Practical exercises and simulations", style: 'kinesthetic', icon: <Hand className="w-5 h-5" /> },
      ],
    },
    {
      id: 2,
      question: "I retain information best when:",
      options: [
        { text: "Reading notes or viewing infographics", style: 'visual', icon: <Eye className="w-5 h-5" /> },
        { text: "Listening to recordings or verbal explanations", style: 'auditory', icon: <Headphones className="w-5 h-5" /> },
        { text: "Applying concepts in real scenarios", style: 'kinesthetic', icon: <Hand className="w-5 h-5" /> },
      ],
    },
    {
      id: 3,
      question: "My ideal learning environment includes:",
      options: [
        { text: "Visual aids and structured documentation", style: 'visual', icon: <Eye className="w-5 h-5" /> },
        { text: "Podcast-style content and verbal coaching", style: 'auditory', icon: <Headphones className="w-5 h-5" /> },
        { text: "Interactive workshops and role-playing", style: 'kinesthetic', icon: <Hand className="w-5 h-5" /> },
      ],
    },
  ],
};

const levelConfig = {
  playground: {
    title: "How Do You Like to Learn? 🌈",
    subtitle: "Pick your favorite way!",
    buttonClass: "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600",
    selectedClass: "border-pink-400 bg-pink-100 dark:bg-pink-950/50",
    optionClass: "rounded-2xl",
  },
  academy: {
    title: "Discover Your Learning Style 🎯",
    subtitle: "How do you learn best?",
    buttonClass: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600",
    selectedClass: "border-indigo-400 bg-indigo-100 dark:bg-indigo-950/50",
    optionClass: "rounded-xl",
  },
  professional: {
    title: "Learning Style Assessment",
    subtitle: "Identify your preferred learning approach",
    buttonClass: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    selectedClass: "border-emerald-400 bg-emerald-100 dark:bg-emerald-950/50",
    optionClass: "rounded-lg",
  },
};

export const LearningStyleStep: React.FC<LearningStyleStepProps> = ({
  studentLevel,
  onComplete,
  onBack,
}) => {
  const questions = questionsByLevel[studentLevel];
  const config = levelConfig[studentLevel];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<('visual' | 'auditory' | 'kinesthetic')[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const selectedStyle = question.options[selectedAnswer].style;
    const newAnswers = [...answers, selectedStyle];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate dominant learning style
      const styleCounts = newAnswers.reduce((acc, style) => {
        acc[style] = (acc[style] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantStyle = Object.entries(styleCounts).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0] as 'visual' | 'auditory' | 'kinesthetic';

      onComplete(dominantStyle);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    }
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
              <div className="text-lg font-medium text-foreground mb-4 text-center p-4 bg-muted/50 rounded-xl">
                {question.question}
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={cn(
                      "w-full p-4 border-2 text-left transition-all duration-200",
                      "hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary",
                      config.optionClass,
                      selectedAnswer === index ? config.selectedClass : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {option.icon}
                        </span>
                      )}
                      <span className="font-medium">{option.text}</span>
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
              disabled={selectedAnswer === null}
              className={cn(
                "flex-1 text-white",
                config.buttonClass,
                currentQuestion === 0 ? "" : "w-full"
              )}
            >
              {isLastQuestion ? "Continue" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
