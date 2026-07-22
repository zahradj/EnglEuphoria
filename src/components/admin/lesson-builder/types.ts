export type SlideType = 'image' | 'video' | 'quiz' | 'poll' | 'draw';

export type PPPStage = 'Warm-Up' | 'Presentation' | 'Practice' | 'Production' | 'Review';

export interface StructuredTeacherNotes {
  script?: string;
  ccq?: string[];
  step_down?: string;
  step_up?: string;
}

export type CanvasElementType = 'text' | 'image' | 'shape' | 'quiz' | 'matching' | 'fill-blank' | 'drag-drop' | 'sorting' | 'sentence-builder' | 'audio' | 'video' | 'character';

export interface CanvasElementData {
  id: string;
  elementType: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content?: Record<string, any>;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface PollOption {
  id: string;
  text: string;
}

export interface Slide {
  id: string;
  order: number;
  type: SlideType;
  imageUrl?: string;
  videoUrl?: string;
  quizQuestion?: string;
  quizOptions?: QuizOption[];
  pollQuestion?: string;
  pollOptions?: PollOption[];
  teacherNotes: string;
  /** Structured PPP-style notes (script, ccq, step_down, step_up) */
  teacherNotesStructured?: StructuredTeacherNotes;
  /** PPP pedagogical stage badge */
  pppStage?: PPPStage;
  keywords: string[];
  title?: string;
  canvasElements?: CanvasElementData[];
}

export interface LessonDeck {
  id?: string;
  title: string;
  description?: string;
  level: string;
  ageGroup: string;
  slides: Slide[];
  createdAt?: string;
  updatedAt?: string;
}
