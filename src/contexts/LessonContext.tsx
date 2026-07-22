import React, { createContext, useContext, ReactNode } from 'react';

// This context is now deprecated for Playground.
// Use usePlaygroundLessons hook instead for the kids' world map.
// Keeping minimal structure for backwards compatibility with any remaining usages.

export interface LessonContent {
  vocabulary: string[];
  sentence: string;
  videoUrl?: string;
  quizQuestion: string;
  quizOptions: string[];
  quizAnswer: string;
}

export interface Lesson {
  id: number;
  number: number;
  title: string;
  type: 'video' | 'slide' | 'game' | 'pdf' | 'quiz' | 'interactive';
  status: 'completed' | 'current' | 'locked';
  position: { x: number; y: number };
  content: LessonContent;
  system: 'playground' | 'academy' | 'hub';
}

interface LessonContextType {
  lessons: Lesson[];
  addLesson: (lesson: Omit<Lesson, 'id' | 'number' | 'status' | 'position'>) => void;
  updateLessonStatus: (lessonId: number, status: Lesson['status']) => void;
  getPlaygroundLessons: () => Lesson[];
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

interface LessonProviderProps {
  children: ReactNode;
}

export const LessonProvider: React.FC<LessonProviderProps> = ({ children }) => {
  // Empty provider - Playground now uses usePlaygroundLessons hook
  // This is kept for backwards compatibility only
  
  const addLesson = () => {
    console.warn('LessonContext.addLesson is deprecated. Use usePlaygroundLessons hook instead.');
  };

  const updateLessonStatus = () => {
    console.warn('LessonContext.updateLessonStatus is deprecated. Use usePlaygroundLessons hook instead.');
  };

  const getPlaygroundLessons = () => {
    console.warn('LessonContext.getPlaygroundLessons is deprecated. Use usePlaygroundLessons hook instead.');
    return [];
  };

  return (
    <LessonContext.Provider value={{ 
      lessons: [], 
      addLesson, 
      updateLessonStatus, 
      getPlaygroundLessons 
    }}>
      {children}
    </LessonContext.Provider>
  );
};

export const useLessonContext = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
};
