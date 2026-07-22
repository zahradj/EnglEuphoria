import React, { useState, useEffect } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Volume2, CheckCircle, Sparkles, Star } from 'lucide-react';
import { playSound } from '@/constants/soundEffects';
import confetti from 'canvas-confetti';
import { CanvasLessonPlayer } from '@/components/student/CanvasLessonPlayer';
import type { PlaygroundLesson } from '@/hooks/usePlaygroundLessons';

interface LessonPlayerModalProps {
  isOpen: boolean;
  lesson: PlaygroundLesson | null;
  onClose: () => void;
  onComplete: (lessonId: string, score?: number) => void;
  classId?: string;
  studentName?: string;
}

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({
  isOpen,
  lesson,
  onClose,
  onComplete,
  classId = "101",
  studentName = "Student"
}) => {
  const [isFinishing, setIsFinishing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [shakingAnswer, setShakingAnswer] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Reset state when lesson changes or modal opens/closes
  useEffect(() => {
    if (isOpen && lesson) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setWrongAttempts([]);
      setQuizCompleted(false);
      setShakingAnswer(null);
      setShowCelebration(false);
    }
  }, [isOpen, lesson?.id]);

  const handleAnswerSelect = (answer: string) => {
    if (quizCompleted || wrongAttempts.includes(answer)) return;
    
    setSelectedAnswer(answer);
    
    const correctAnswer = lesson?.content.quizAnswer;
    
    if (answer === correctAnswer) {
      // Correct answer!
      setIsCorrect(true);
      setQuizCompleted(true);
      playSound('correct', 0.7);
    } else {
      // Wrong answer - trigger shake
      setIsCorrect(false);
      setWrongAttempts(prev => [...prev, answer]);
      setShakingAnswer(answer);
      playSound('incorrect', 0.5);
      
      // Reset shake after animation
      setTimeout(() => {
        setShakingAnswer(null);
        setIsCorrect(null);
        setSelectedAnswer(null);
      }, 500);
    }
  };

  const triggerCelebration = () => {
    // Confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    });

    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FFA500'],
    });

    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FFA500'],
    });
  };

  const handleFinish = () => {
    if (!lesson) return;
    setIsFinishing(true);
    
    // Calculate score based on wrong attempts
    const maxScore = 100;
    const penaltyPerWrong = 20;
    const score = Math.max(0, maxScore - (wrongAttempts.length * penaltyPerWrong));

    // Show celebration
    setShowCelebration(true);
    triggerCelebration();

    setTimeout(() => {
      onComplete(lesson.id, score);
      setIsFinishing(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setWrongAttempts([]);
      setQuizCompleted(false);
      setShowCelebration(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setWrongAttempts([]);
    setQuizCompleted(false);
    setShowCelebration(false);
    onClose();
  };

  const speakWord = (word: string) => {
    void playElevenLabs(word, { speed: 0.9 });
  };

  const renderVideoContent = (content: PlaygroundLesson['content']) => (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-inner">
        {content.videoUrl ? (
          <iframe
            src={content.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Lesson Video"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p>Video not available</p>
          </div>
        )}
      </div>

      {/* Sentence Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 text-center"
      >
        <p className="text-2xl md:text-3xl font-bold text-orange-700" style={{ fontFamily: "'Fredoka', cursive" }}>
          {content.sentence}
        </p>
      </motion.div>

      {/* Vocabulary Words */}
      <div className="flex flex-wrap justify-center gap-3">
        {content.vocabulary.map((word, index) => (
          <motion.button
            key={word}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => speakWord(word)}
            className="flex items-center gap-2 bg-white border-2 border-purple-200 hover:border-purple-400 rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all"
          >
            <Volume2 className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-purple-700">{word}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderSlideContent = (content: PlaygroundLesson['content']) => (
    <div className="space-y-6">
      {/* Giant Sentence Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-3xl p-8 md:p-12 text-center min-h-[200px] flex items-center justify-center"
      >
        <p 
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent"
          style={{ fontFamily: "'Fredoka', cursive" }}
        >
          {content.sentence}
        </p>
      </motion.div>

      {/* Vocabulary Words */}
      <div className="flex flex-wrap justify-center gap-4">
        {content.vocabulary.map((word, index) => (
          <motion.button
            key={word}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            onClick={() => speakWord(word)}
            className="flex items-center gap-2 bg-white border-3 border-indigo-200 hover:border-indigo-400 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Volume2 className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold text-indigo-700">{word}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderGameContent = (content: PlaygroundLesson['content']) => (
    <div className="space-y-6">
      {/* Game Area */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-3xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center"
      >
        <div className="text-6xl mb-4">🍓🍓🍓</div>
        <p 
          className="text-3xl md:text-4xl font-bold text-emerald-700"
          style={{ fontFamily: "'Fredoka', cursive" }}
        >
          {content.sentence}
        </p>
      </motion.div>

      {/* Vocabulary Words */}
      <div className="flex flex-wrap justify-center gap-4">
        {content.vocabulary.map((word, index) => (
          <motion.button
            key={word}
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            onClick={() => speakWord(word)}
            className="flex items-center gap-2 bg-white border-3 border-green-200 hover:border-green-400 rounded-2xl px-5 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Volume2 className="w-5 h-5 text-green-500" />
            <span className="text-lg font-bold text-green-700">{word}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'video':
        return renderVideoContent(lesson.content);
      case 'slide':
        return renderSlideContent(lesson.content);
      case 'game':
        return renderGameContent(lesson.content);
      default:
        return renderSlideContent(lesson.content);
    }
  };

  const renderQuiz = () => {
    if (!lesson) return null;
    const { content } = lesson;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-indigo-700">Quiz Time!</h3>
        </div>
        
        <p className="text-lg font-medium text-gray-700">{content.quizQuestion}</p>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {content.quizOptions.map((option, index) => {
            const isWrong = wrongAttempts.includes(option);
            const isCorrectAnswer = option === content.quizAnswer && quizCompleted;
            const isShaking = shakingAnswer === option;
            const isDisabled = quizCompleted || isWrong;
            
            let buttonStyle = 'bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:scale-105';
            
            if (isCorrectAnswer) {
              buttonStyle = 'bg-green-500 border-2 border-green-600 text-white scale-105';
            } else if (isWrong) {
              buttonStyle = 'bg-red-400 border-2 border-red-500 text-white opacity-60 cursor-not-allowed';
            }
            
            if (isDisabled && !isCorrectAnswer && !isWrong) {
              buttonStyle = 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed';
            }

            return (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  x: isShaking ? [-10, 10, -10, 10, 0] : 0
                }}
                transition={{ 
                  delay: index * 0.1,
                  x: { duration: 0.4 }
                }}
                onClick={() => handleAnswerSelect(option)}
                disabled={isDisabled}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-md transition-all ${buttonStyle}`}
              >
                {isCorrectAnswer && <span className="mr-2">✓</span>}
                {isWrong && <span className="mr-2">✗</span>}
                {option}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback Messages */}
        <AnimatePresence mode="wait">
          {quizCompleted && !showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center p-4 rounded-xl bg-green-100 text-green-700"
            >
              <p className="text-xl font-bold">🎉 Correct! Great job!</p>
            </motion.div>
          )}
          {isCorrect === false && !quizCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center p-4 rounded-xl bg-orange-100 text-orange-700"
            >
              <p className="text-xl font-bold">🤔 Try Again!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Celebration overlay
  const CelebrationOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-gradient-to-br from-yellow-400/90 via-orange-400/90 to-pink-500/90 flex items-center justify-center z-50 rounded-3xl"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5 }}
        className="text-center text-white"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-8xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Fredoka', cursive" }}>
          Amazing!
        </h2>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </motion.div>
          ))}
        </div>
        <p className="text-xl opacity-90">Lesson Complete!</p>
      </motion.div>
    </motion.div>
  );

  // Route canvas-based lessons to the Canvas Lesson Player
  if (isOpen && lesson?.canvasSlides && lesson.canvasSlides.length > 0) {
    return (
      <CanvasLessonPlayer
        slides={lesson.canvasSlides}
        lessonTitle={lesson.title}
        onClose={handleClose}
        onComplete={(score) => {
          onComplete(lesson.id, score);
          handleClose();
        }}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && lesson && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Celebration overlay */}
            {showCelebration && <CelebrationOverlay />}

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Header */}
            <div className="p-6 pt-8 flex-shrink-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg"
                style={{ fontFamily: "'Fredoka', cursive" }}
              >
                {lesson.title}
              </motion.h2>
              <p className="text-white/80 text-center mt-2 capitalize">
                {lesson.type === 'video' && '🎬 Watch & Learn'}
                {lesson.type === 'slide' && '📖 Read & Repeat'}
                {lesson.type === 'game' && '🎮 Play & Practice'}
                {lesson.type === 'quiz' && '❓ Quiz Time'}
                {lesson.type === 'interactive' && '🎥 Interactive Lesson'}
              </p>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {renderContent()}
              {renderQuiz()}
            </div>

            {/* Footer with Finish Button - Only show when quiz is completed */}
            <AnimatePresence>
              {quizCompleted && !showCelebration && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0"
                >
                  <motion.button
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-70"
                  >
                    {isFinishing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        I Finished! 🎉
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
