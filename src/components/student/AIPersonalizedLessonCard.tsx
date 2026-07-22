import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, ChevronRight, Trophy, 
  Volume2, Brain, Star, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDailyPersonalizedLesson } from '@/hooks/useDailyPersonalizedLesson';

interface AIPersonalizedLessonCardProps {
  isDarkMode?: boolean;
  className?: string;
}

type Stage = 'intro' | 'vocab' | 'quiz' | 'done';

export const AIPersonalizedLessonCard: React.FC<AIPersonalizedLessonCardProps> = ({ 
  isDarkMode = false, 
  className = '' 
}) => {
  const { lesson, loading, completed, fluencyScore, markComplete } = useDailyPersonalizedLesson();
  const [stage, setStage] = useState<Stage>(completed ? 'done' : 'intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const bg = isDarkMode ? 'bg-[#1a1a2e] border-purple-900/30' : 'bg-white border-border';
  const textPrimary = isDarkMode ? 'text-white' : 'text-foreground';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-muted-foreground';
  const accentText = isDarkMode ? 'text-purple-400' : 'text-emerald-600';
  const accentBg = isDarkMode ? 'from-purple-600 to-cyan-600' : 'from-emerald-600 to-teal-600';

  if (loading) {
    return (
      <Card className={`${bg} border animate-pulse ${className}`}>
        <CardContent className="p-5">
          <div className="h-5 rounded bg-muted/40 mb-3 w-3/4" />
          <div className="h-4 rounded bg-muted/30 mb-2 w-1/2" />
          <div className="h-16 rounded bg-muted/20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!lesson) return null;

  // ─── INTRO ────────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <Card className={`${bg} border overflow-hidden ${className}`}>
        <div className={`h-0.5 w-full bg-gradient-to-r ${accentBg}`} />
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-600/20' : 'bg-emerald-50'}`}>
              <Sparkles className={`w-5 h-5 ${accentText}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-xs font-semibold uppercase tracking-wide ${accentText}`}>
                  🧠 Daily AI Lesson
                </p>
                {lesson.aiGenerated && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </div>
              <h3 className={`font-bold text-sm leading-snug ${textPrimary}`}>{lesson.title}</h3>
              <p className={`text-xs mt-1 ${textMuted}`}>
                Theme: <span className="font-medium capitalize">{lesson.theme}</span>
              </p>
            </div>
          </div>

          <div className={`flex gap-3 text-xs mb-4 ${textMuted}`}>
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {lesson.vocabularySpotlight.length} words</span>
            <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> {lesson.quiz.length} questions</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> +1 Fluency</span>
          </div>

          <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-muted/30'}`}>
            <span className={`text-xs ${textMuted}`}>Your Fluency Score</span>
            <span className={`text-base font-bold ${accentText}`}>{fluencyScore} pts</span>
          </div>

          <Button
            onClick={() => setStage('vocab')}
            className={`w-full bg-gradient-to-r ${accentBg} text-white font-semibold`}
          >
            Start Today's Lesson
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── VOCAB ────────────────────────────────────────────────────────────────
  if (stage === 'vocab') {
    const word = lesson.vocabularySpotlight[vocabIndex];
    const isLast = vocabIndex === lesson.vocabularySpotlight.length - 1;
    const progress = ((vocabIndex + 1) / lesson.vocabularySpotlight.length) * 100;

    return (
      <Card className={`${bg} border overflow-hidden ${className}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-semibold uppercase tracking-wide ${accentText}`}>📖 Vocab Spotlight</p>
            <span className={`text-xs ${textMuted}`}>{vocabIndex + 1}/{lesson.vocabularySpotlight.length}</span>
          </div>
          <Progress value={progress} className="h-1 mb-4" />

          <AnimatePresence mode="wait">
            <motion.div key={vocabIndex} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>
              <div className={`p-4 rounded-xl mb-4 border ${isDarkMode ? 'bg-white/5 border-purple-900/20' : 'bg-muted/20 border-border'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-xl font-bold ${textPrimary}`}>{word.word}</span>
                  {word.pronunciation && <span className={`text-xs font-mono ${textMuted}`}>{word.pronunciation}</span>}
                  <Volume2 className={`w-4 h-4 ml-auto ${accentText} opacity-60`} />
                </div>
                <p className={`text-xs mb-2 ${textMuted}`}>{word.definition}</p>
                <p className={`text-xs italic border-l-2 pl-2 ${isDarkMode ? 'text-gray-300 border-purple-500' : 'text-foreground/70 border-emerald-400'}`}>
                  "{word.example}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <Button onClick={() => isLast ? setStage('quiz') : setVocabIndex(i => i + 1)} className={`w-full bg-gradient-to-r ${accentBg} text-white`}>
            {isLast ? '→ Quick Practice' : 'Next Word'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── QUIZ ─────────────────────────────────────────────────────────────────
  if (stage === 'quiz') {
    const q = lesson.quiz[quizIndex];
    const isLast = quizIndex === lesson.quiz.length - 1;
    const progress = ((quizIndex + 1) / lesson.quiz.length) * 100;

    const handleCheck = () => {
      if (selectedOption === null) return;
      setQuizResults(prev => [...prev, selectedOption === q.correctIndex]);
      setShowFeedback(true);
    };

    const handleNext = () => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (isLast) { setStage('done'); markComplete(); } 
      else setQuizIndex(i => i + 1);
    };

    return (
      <Card className={`${bg} border overflow-hidden ${className}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>⚡ Quick Practice</p>
            <span className={`text-xs ${textMuted}`}>{quizIndex + 1}/{lesson.quiz.length}</span>
          </div>
          <Progress value={progress} className="h-1 mb-4" />

          <AnimatePresence mode="wait">
            <motion.div key={quizIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <p className={`text-sm font-medium mb-3 ${textPrimary}`}>{q.question}</p>
              <div className="space-y-2 mb-3">
                {q.options.map((opt, idx) => {
                  let cls = `w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-200 hover:border-purple-500' : 'bg-muted/30 border-border text-foreground hover:border-emerald-400'}`;
                  if (!showFeedback && selectedOption === idx) cls = isDarkMode ? 'w-full text-left px-3 py-2 rounded-lg text-xs font-medium border bg-purple-600/30 border-purple-500 text-white' : 'w-full text-left px-3 py-2 rounded-lg text-xs font-medium border bg-emerald-50 border-emerald-500 text-foreground';
                  if (showFeedback && idx === q.correctIndex) cls = 'w-full text-left px-3 py-2 rounded-lg text-xs font-medium border bg-green-500/20 border-green-500 text-green-700';
                  if (showFeedback && selectedOption === idx && idx !== q.correctIndex) cls = 'w-full text-left px-3 py-2 rounded-lg text-xs font-medium border bg-red-500/20 border-red-500 text-red-700';
                  return (
                    <button key={idx} onClick={() => !showFeedback && setSelectedOption(idx)} className={cls}>
                      <span className="mr-1.5 opacity-50">{String.fromCharCode(65 + idx)}.</span>{opt}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <p className={`text-xs font-medium mb-3 ${quizResults[quizResults.length - 1] ? 'text-green-500' : 'text-red-500'}`}>
                  {quizResults[quizResults.length - 1] ? '✅ Correct!' : `❌ Answer: "${q.options[q.correctIndex]}"`}
                </p>
              )}

              {!showFeedback
                ? <Button onClick={handleCheck} disabled={selectedOption === null} className={`w-full bg-gradient-to-r ${isDarkMode ? 'from-yellow-600 to-orange-600' : 'from-orange-500 to-amber-500'} text-white disabled:opacity-40 text-xs`}>Check Answer</Button>
                : <Button onClick={handleNext} className={`w-full bg-gradient-to-r ${accentBg} text-white text-xs`}>{isLast ? '🏆 Finish' : 'Next'}</Button>
              }
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  // ─── DONE ─────────────────────────────────────────────────────────────────
  const correctCount = quizResults.filter(Boolean).length;
  return (
    <Card className={`${bg} border overflow-hidden ${className}`}>
      <CardContent className="p-5 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 14 }}>
          <Trophy className={`w-10 h-10 mx-auto mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
        </motion.div>
        <h3 className={`text-base font-bold mb-1 ${textPrimary}`}>Lesson Complete! 🎉</h3>
        <p className={`text-xs mb-2 ${textMuted}`}>{correctCount}/{lesson.quiz.length} correct</p>
        <Badge className={`mb-3 text-xs px-3 ${isDarkMode ? 'bg-cyan-600/20 text-cyan-300' : 'bg-emerald-100 text-emerald-700'}`}>
          +1 Fluency → {fluencyScore} pts total
        </Badge>
        <p className={`text-xs ${textMuted} mb-3`}>Come back tomorrow for a new lesson!</p>
        <Button variant="outline" size="sm" onClick={() => { setStage('intro'); setVocabIndex(0); setQuizIndex(0); setSelectedOption(null); setQuizResults([]); setShowFeedback(false); }} className="gap-1 text-xs">
          <RotateCcw className="w-3 h-3" /> Review Again
        </Button>
      </CardContent>
    </Card>
  );
};
