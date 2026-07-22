import { useState, useEffect, useCallback } from 'react';
import { quizService, QuizResponse } from '@/services/quizService';

interface UseQuizInteractionOptions {
  sessionId: string | undefined;
  slideId: string | undefined;
  roomId: string;
  isTeacher: boolean;
}

interface UseQuizInteractionReturn {
  // State
  responses: QuizResponse[];
  quizActive: boolean;
  quizLocked: boolean;
  quizRevealAnswer: boolean;
  
  // Teacher actions
  startQuiz: () => Promise<void>;
  lockQuiz: () => Promise<void>;
  revealAnswer: () => Promise<void>;
  resetQuiz: () => Promise<void>;
  
  // Setters for syncing from session
  setQuizState: (state: { quizActive: boolean; quizLocked: boolean; quizRevealAnswer: boolean }) => void;
}

export const useQuizInteraction = ({
  sessionId,
  slideId,
  roomId,
  isTeacher
}: UseQuizInteractionOptions): UseQuizInteractionReturn => {
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizActive, setQuizActive] = useState(false);
  const [quizLocked, setQuizLocked] = useState(false);
  const [quizRevealAnswer, setQuizRevealAnswer] = useState(false);

  // Load existing responses and subscribe to new ones
  useEffect(() => {
    if (!sessionId || !slideId) return;

    // Load existing responses
    const loadResponses = async () => {
      const existingResponses = await quizService.getResponsesForSlide(sessionId, slideId);
      setResponses(existingResponses);
    };

    loadResponses();

    // Subscribe to new responses (teacher only needs this)
    if (isTeacher) {
      const unsubscribe = quizService.subscribeToResponses(
        sessionId,
        slideId,
        (newResponse) => {
          setResponses(prev => {
            // Avoid duplicates
            if (prev.some(r => r.id === newResponse.id)) return prev;
            return [...prev, newResponse];
          });
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [sessionId, slideId, isTeacher]);

  // Reset state when slide changes
  useEffect(() => {
    setQuizActive(false);
    setQuizLocked(false);
    setQuizRevealAnswer(false);
    setResponses([]);
  }, [slideId]);

  // Teacher actions
  const startQuiz = useCallback(async () => {
    if (!isTeacher) return;
    await quizService.updateQuizState(roomId, {
      quizActive: true,
      quizLocked: false,
      quizRevealAnswer: false,
      currentQuizSlideId: slideId || null
    });
    setQuizActive(true);
    setQuizLocked(false);
    setQuizRevealAnswer(false);
  }, [isTeacher, roomId, slideId]);

  const lockQuiz = useCallback(async () => {
    if (!isTeacher) return;
    await quizService.updateQuizState(roomId, { quizLocked: true });
    setQuizLocked(true);
  }, [isTeacher, roomId]);

  const revealAnswer = useCallback(async () => {
    if (!isTeacher) return;
    await quizService.updateQuizState(roomId, { 
      quizRevealAnswer: true,
      quizLocked: true 
    });
    setQuizRevealAnswer(true);
    setQuizLocked(true);
  }, [isTeacher, roomId]);

  const resetQuiz = useCallback(async () => {
    if (!isTeacher || !sessionId || !slideId) return;
    
    // Clear responses from database
    await quizService.clearResponses(sessionId, slideId);
    
    // Reset quiz state
    await quizService.updateQuizState(roomId, {
      quizActive: false,
      quizLocked: false,
      quizRevealAnswer: false,
      currentQuizSlideId: null
    });
    
    setResponses([]);
    setQuizActive(false);
    setQuizLocked(false);
    setQuizRevealAnswer(false);
  }, [isTeacher, sessionId, slideId, roomId]);

  const setQuizState = useCallback((state: { quizActive: boolean; quizLocked: boolean; quizRevealAnswer: boolean }) => {
    setQuizActive(state.quizActive);
    setQuizLocked(state.quizLocked);
    setQuizRevealAnswer(state.quizRevealAnswer);
  }, []);

  return {
    responses,
    quizActive,
    quizLocked,
    quizRevealAnswer,
    startQuiz,
    lockQuiz,
    revealAnswer,
    resetQuiz,
    setQuizState
  };
};
