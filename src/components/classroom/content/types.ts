
export interface ContentItem {
  id: string;
  type: "pdf" | "image" | "video" | "game" | "interactive" | "curriculum" | "lesson" | "bulk-curriculum" | "adventure";
  title: string;
  source: string;
  uploadedBy: string;
  timestamp: Date;
  size?: number;
  fileType?: string;
  level?: string;
  duration?: number;
  topic?: string;
  theme?: string;
  difficulty?: string;
  content?: string;
  metadata?: {
    estimated_duration?: number;
    difficulty_level?: string;
    learning_objectives?: string[];
    activities?: Array<{
      title?: string;
      description?: string;
      content?: string;
      duration?: number;
    }>;
    cefr_level?: string;
    phonics_focus?: string;
    completion_status?: 'completed' | 'locked' | 'available';
    unit_number?: number;
    lesson_number?: number;
  };
}

export interface AdventureLesson {
  id: string;
  title: string;
  level: string;
  cefr_level: string;
  phonics_focus: string;
  estimated_duration: string;
  completion_status: 'completed' | 'locked' | 'available';
  unit_number: number;
  lesson_number: number;
  description?: string;
  learning_objectives?: string[];
  vocabulary_focus?: string[];
  letter_focus?: string;
}

export type MaterialType = "pdf" | "image" | "video" | "interactive";
