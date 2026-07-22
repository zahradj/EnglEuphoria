export type SystemId = 'kids' | 'teen' | 'adult';
export type SystemTag = SystemId | 'all';
export type TriggerReason = 'age_limit_reached' | 'course_completed' | 'manual_override' | 'placement_test';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type AssetFileType = 'pdf' | 'video' | 'audio' | 'interactive_quiz' | 'image' | 'document' | 'presentation';

// Track - top level curriculum organization
export interface Track {
  id: string;
  name: string;
  target_system: SystemId;
  description: string | null;
  thumbnail_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// CurriculumLevel - levels within a track
export interface CurriculumLevel {
  id: string;
  track_id: string | null;
  name: string;
  description: string;
  sequence_order: number;
  level_order: number;
  cefr_level: string;
  age_group: string;
  xp_required: number | null;
  estimated_hours: number | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  track?: Track;
}

// CurriculumLesson - lessons within a level
export interface CurriculumLesson {
  id: string;
  level_id: string | null;
  title: string;
  description: string | null;
  target_system: SystemId;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  thumbnail_url: string | null;
  content: Record<string, unknown>;
  xp_reward: number;
  order_index: number;
  sequence_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  level?: CurriculumLevel;
  materials?: LessonMaterial[];
}

// LibraryAsset - shared materials in the library
export interface LibraryAsset {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: AssetFileType;
  thumbnail_url: string | null;
  min_age: number | null;
  max_age: number | null;
  system_tag: SystemTag;
  is_teacher_only: boolean;
  tags: string[];
  duration_seconds: number | null;
  file_size_bytes: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// LessonMaterial - junction between lessons and assets
export interface LessonMaterial {
  id: string;
  lesson_id: string;
  asset_id: string;
  is_mandatory: boolean;
  display_order: number;
  created_at: string;
  // Joined data
  asset?: LibraryAsset;
}

// StudentLessonProgress - tracks student progress on lessons
export interface StudentLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score: number | null;
  time_spent_seconds: number;
  attempts: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  lesson?: CurriculumLesson;
}

// SystemTransition - audit log for system transitions
export interface SystemTransition {
  id: string;
  user_id: string;
  from_system: SystemId | null;
  to_system: SystemId;
  trigger_reason: TriggerReason;
  triggered_by: string | null;
  metadata: Record<string, unknown>;
  transition_date: string;
}

export interface SystemTheme {
  id: SystemId;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
  };
  borderRadius: string;
  fontFamily: string;
}

export const SYSTEM_THEMES: Record<SystemId, SystemTheme> = {
  kids: {
    id: 'kids',
    name: 'The Playground',
    colors: {
      primary: '330 85% 65%', // Pink
      secondary: '165 85% 55%', // Teal
      accent: '45 95% 55%', // Yellow
      background: '45 100% 97%', // Warm cream
      foreground: '280 30% 25%', // Purple-brown
      card: '0 0% 100%',
      cardForeground: '280 30% 25%',
    },
    borderRadius: '1.5rem',
    fontFamily: "'Fredoka', 'Comic Neue', cursive",
  },
  teen: {
    id: 'teen',
    name: 'The Academy',
    colors: {
      primary: '265 85% 60%', // Purple
      secondary: '190 90% 50%', // Cyan
      accent: '35 95% 55%', // Orange
      background: '240 10% 10%', // Dark
      foreground: '0 0% 95%', // Light
      card: '240 10% 15%',
      cardForeground: '0 0% 95%',
    },
    borderRadius: '0.75rem',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  adult: {
    id: 'adult',
    name: 'The Hub',
    colors: {
      primary: '220 75% 50%', // Blue
      secondary: '160 70% 45%', // Green
      accent: '245 60% 60%', // Indigo
      background: '0 0% 100%', // White
      foreground: '220 20% 20%', // Dark gray
      card: '0 0% 98%',
      cardForeground: '220 20% 20%',
    },
    borderRadius: '0.5rem',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};

export interface StudentWithSystem {
  id: string;
  display_name: string;
  system_id: SystemId;
  avatar_url?: string | null;
  current_level?: number;
  total_xp?: number;
}
