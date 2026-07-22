import { useState, useCallback, useMemo } from 'react';

export interface QuizAnswer {
  slideId: string;
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timestamp: number;
}

export interface SCORMInteraction {
  id: string;
  type: 'choice' | 'true-false' | 'fill-in';
  learner_response: string;
  result: 'correct' | 'incorrect';
  latency: string;
  timestamp: string;
}

export interface LMSQuizState {
  answers: Record<string, QuizAnswer>;
  revealed: Record<string, boolean>;
  currentScore: number;
  totalQuestions: number;
  completionStatus: 'incomplete' | 'completed' | 'passed' | 'failed';
  progressMeasure: number;
}

export function useLMSQuizState(totalSlides: number, passingScore: number = 70) {
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const submitAnswer = useCallback((
    slideId: string,
    questionId: string,
    selectedIndex: number,
    correctIndex: number
  ) => {
    const isCorrect = selectedIndex === correctIndex;
    const key = `${slideId}-${questionId}`;
    
    setAnswers(prev => ({
      ...prev,
      [key]: {
        slideId,
        questionId,
        selectedIndex,
        isCorrect,
        timestamp: Date.now()
      }
    }));

    setRevealed(prev => ({
      ...prev,
      [key]: true
    }));

    return isCorrect;
  }, []);

  const revealAnswer = useCallback((slideId: string, questionId: string) => {
    const key = `${slideId}-${questionId}`;
    setRevealed(prev => ({
      ...prev,
      [key]: true
    }));
  }, []);

  const isAnswered = useCallback((slideId: string, questionId: string) => {
    const key = `${slideId}-${questionId}`;
    return key in answers;
  }, [answers]);

  const isRevealed = useCallback((slideId: string, questionId: string) => {
    const key = `${slideId}-${questionId}`;
    return revealed[key] ?? false;
  }, [revealed]);

  const getAnswer = useCallback((slideId: string, questionId: string) => {
    const key = `${slideId}-${questionId}`;
    return answers[key];
  }, [answers]);

  const stats = useMemo(() => {
    const answersList = Object.values(answers);
    const correctCount = answersList.filter(a => a.isCorrect).length;
    const totalAnswered = answersList.length;
    const scorePercentage = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;

    return {
      correctCount,
      totalAnswered,
      scorePercentage,
      scoreRaw: correctCount,
      scoreMax: totalAnswered || 1
    };
  }, [answers]);

  const progressMeasure = useMemo(() => {
    return totalSlides > 0 ? ((currentSlideIndex + 1) / totalSlides) : 0;
  }, [currentSlideIndex, totalSlides]);

  const completionStatus = useMemo(() => {
    if (currentSlideIndex < totalSlides - 1) return 'incomplete';
    if (stats.totalAnswered === 0) return 'completed';
    return stats.scorePercentage >= passingScore ? 'passed' : 'failed';
  }, [currentSlideIndex, totalSlides, stats, passingScore]);

  const getSCORMInteractions = useCallback((): SCORMInteraction[] => {
    return Object.values(answers).map((answer, index) => ({
      id: `interaction_${index}`,
      type: 'choice' as const,
      learner_response: String(answer.selectedIndex),
      result: answer.isCorrect ? 'correct' : 'incorrect',
      latency: 'PT30S',
      timestamp: new Date(answer.timestamp).toISOString()
    }));
  }, [answers]);

  const getSCORMData = useCallback(() => {
    return {
      'cmi.location': String(currentSlideIndex),
      'cmi.progress_measure': progressMeasure.toFixed(2),
      'cmi.score.raw': stats.scoreRaw,
      'cmi.score.max': stats.scoreMax,
      'cmi.score.scaled': stats.totalAnswered > 0 ? (stats.scorePercentage / 100).toFixed(2) : '0',
      'cmi.completion_status': completionStatus,
      'cmi.success_status': stats.scorePercentage >= passingScore ? 'passed' : 'unknown',
      'cmi.interactions': getSCORMInteractions()
    };
  }, [currentSlideIndex, progressMeasure, stats, completionStatus, passingScore, getSCORMInteractions]);

  const reset = useCallback(() => {
    setAnswers({});
    setRevealed({});
    setCurrentSlideIndex(0);
  }, []);

  return {
    answers,
    revealed,
    submitAnswer,
    revealAnswer,
    isAnswered,
    isRevealed,
    getAnswer,
    stats,
    progressMeasure,
    completionStatus,
    currentSlideIndex,
    setCurrentSlideIndex,
    getSCORMData,
    getSCORMInteractions,
    reset
  };
}
