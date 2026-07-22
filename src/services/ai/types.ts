
export interface AIContentRequest {
  type: 'worksheet' | 'activity' | 'lesson_plan' | 'quiz' | 'flashcards' | 'lesson';
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  specificRequirements?: string;
  studentAge?: string;
  learningObjectives?: string[];
  objectives?: string[];
  requirements?: string;
}

export interface AIGeneratedContent {
  id: string;
  title: string;
  type: string;
  topic: string;
  level: string;
  duration: number;
  content: string | any; // Allow both string and object content
  worksheet?: {
    title: string;
    content: string;
    answers: string;
    instructions: string;
  };
  activities?: {
    matchPairs?: Array<{
      id: string;
      left: string;
      right: string;
      leftImage?: string;
      rightImage?: string;
    }>;
    dragDropItems?: Array<{
      id: string;
      text: string;
      targetId: string;
      image?: string;
    }>;
    dragDropTargets?: Array<{
      id: string;
      text: string;
      acceptsItemIds: string[];
      image?: string;
    }>;
    clozeText?: string;
    clozeGaps?: Array<{
      id: string;
      correctAnswers: string[];
      options?: string[];
    }>;
  };
  vocabulary?: Array<{
    word: string;
    definition: string;
    example: string;
    imagePrompt: string;
    pronunciation: string;
    partOfSpeech: string;
  }>;
  slides?: Array<{
    id: string;
    type: string;
    prompt: string;
    instructions?: string;
    media?: {
      type: string;
      imagePrompt?: string;
    };
    options?: Array<{
      id: string;
      text: string;
      isCorrect?: boolean;
    }>;
    correct?: string;
  }>;
  metadata: {
    generatedAt: string;
    model?: string;
    isAIGenerated: boolean;
    generationTime?: number;
    isFallback?: boolean;
    fallbackReason?: string;
  };
}

export interface ContentLibraryItem extends AIGeneratedContent {
  downloads?: number;
  rating?: number;
  tags?: string[];
  isPublic?: boolean;
  createdBy?: string;
}
