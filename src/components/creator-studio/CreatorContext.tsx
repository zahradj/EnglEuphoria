import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { persistLesson } from './persistLesson';

export type CreatorStep = 'blueprint' | 'playground-creator' | 'academy-creator' | 'success-creator' | 'library' | 'trial' | 'story' | 'characters' | 'game-maker' | 'unified-generator' | 'lesson-tests' | 'placement-assets' | 'vocab-games-analytics' | 'certificates';

export type CEFRLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type HubType = 'playground' | 'academy' | 'success';
export type Phase = 'warm-up' | 'presentation' | 'practice' | 'production' | 'review';

export type SkillFocus = 'Grammar' | 'Vocabulary' | 'Reading/Listening' | 'Speaking' | 'Review';

export interface BlueprintLessonRef {
  id: string;
  lesson_number?: number;
  title: string;
  skill_focus?: SkillFocus | string;
  objective?: string;
  /** @deprecated alias of objective, kept for back-compat */
  learning_objective?: string;
  unit_number?: number;
  unit_title?: string;
  unit_theme?: string;

  // ── Full structured lesson blueprint (enriched at curriculum generation
  // time). All optional for backwards compatibility with legacy curricula.
  communication_goal?: string;
  grammar_focus?: string[];
  vocabulary_focus?: string[];
  pronunciation_focus?: string[];
  phonics_focus?: string[];
  review_targets?: string[];
  adaptive_profile?: {
    difficulty_tier?: 1 | 2 | 3 | 4 | 5;
    scaffolding_boost?: 0 | 1 | 2;
    pacing_hint?: 'slow_down' | 'maintain' | 'accelerate';
  };
  story_state?: {
    arc?: string;
    theme?: string;
    characters?: string[];
  };
  game_targets?: string[];
  homework_targets?: string[];

  /** Pedagogical lesson role (7-lesson Unit Anatomy). */
  lesson_type?: 'core' | 'storybook' | 'extra_practice' | 'unit_review';
}

export interface CurriculumData {
  curriculum_title: string;
  cefr_level: CEFRLevel;
  hub: HubType;
  theme_hint?: string;
  units: Array<{
    id: string;
    unit_number?: number;
    unit_title: string;
    theme?: string;
    lessons: BlueprintLessonRef[];
  }>;
}

export type SlideType =
  | 'text_image'
  | 'multiple_choice'
  | 'drawing_prompt'
  | 'drawing_canvas'
  | 'drag_and_drop'
  | 'flashcard'
  | 'mascot_speech'
  | 'drag_and_match'
  | 'fill_in_the_gaps';

/** Slide types that are "full-screen interactive games" — hero image is hidden by default. */
export const GAME_SLIDE_TYPES: SlideType[] = [
  'drag_and_match',
  'fill_in_the_gaps',
  'drag_and_drop',
  'drawing_canvas',
  'drawing_prompt',
];
export const isGameSlideType = (t?: string): boolean =>
  !!t && (GAME_SLIDE_TYPES as string[]).includes(t);
export type LayoutStyle = 'split_left' | 'split_right' | 'center_card' | 'full_background';
export type MediaType = 'image' | 'video';
/**
 * 6-Step Integrated Skills Blueprint phases. Every slide MUST be tagged with
 * one of these so the Phase Tracker UI can lock student progression.
 */
export type LessonPhase =
  | 'Vocabulary'
  | 'Reading'
  | 'Comprehension'
  | 'Grammar'
  | 'Speaking'
  | 'Writing';

export const LESSON_PHASE_ORDER: LessonPhase[] = [
  'Vocabulary',
  'Reading',
  'Comprehension',
  'Grammar',
  'Speaking',
  'Writing',
];

export interface MCQData {
  question: string;
  options: string[];
  correct_index: number;
}
export interface FlashcardData {
  front: string;
  back: string;
}
export interface DrawingData {
  prompt: string;
}
export interface DragAndMatchPair {
  left_item: string;
  left_thumbnail_keyword?: string;
  left_thumbnail_url?: string;
  right_item: string;
  right_thumbnail_keyword?: string;
  right_thumbnail_url?: string;
}
export interface DragAndMatchData {
  instruction: string;
  pairs: DragAndMatchPair[];
}
export interface FillInTheGapsData {
  instruction: string;
  sentence_parts: [string, string];
  missing_word: string;
  distractors: string[];
}
export type InteractiveData =
  | MCQData
  | FlashcardData
  | DrawingData
  | DragAndMatchData
  | FillInTheGapsData
  | Record<string, unknown>;

export interface PPPSlide {
  id: string;
  phase: Phase | string;
  /** 6-Step Blueprint tag — drives Phase Tracker + locked student progression. */
  lesson_phase?: LessonPhase;
  slide_type?: SlideType;
  layout_style?: LayoutStyle;
  title?: string;
  content?: string;
  teacher_script?: string;
  visual_keyword?: string;
  /** Director's choice: 'image' for static nouns/backgrounds, 'video' for verbs/emotions/brain-breaks. */
  media_type?: MediaType;
  custom_image_url?: string;
  /** Public URL of an uploaded looping video clip (preferred over image when present). */
  custom_video_url?: string;
  /** Phonetic kid-friendly TTS string sent to ElevenLabs. */
  elevenlabs_script?: string;
  /** AI-engineered prompt the user can copy into a text-to-image tool. */
  image_generation_prompt?: string;
  /** AI-engineered prompt the user can copy into a text-to-video tool. */
  video_generation_prompt?: string;
  /** Prompt for AI background music (ElevenLabs Music / Lyria). */
  music_generation_prompt?: string;
  /** Public URL of the generated/uploaded voiceover MP3 attached to this slide. */
  audio_url?: string;
  /** Public URL of the generated/uploaded background music track attached to this slide. */
  background_music_url?: string;
  interactive_data?: InteractiveData;
  /** Skills exercised by this slide (Reading/Writing/Listening/Speaking/Grammar/Vocabulary). */
  target_skills?: string[];
  /** True only when audio is pedagogically essential (pronunciation, listening, dialogue, songs). */
  requires_audio?: boolean;
  /** Short kid-friendly hint shown after the 1st wrong answer in interactive games. */
  hint_text?: string;
  /** When true, force the hero image even on full-screen game slide types. */
  force_hero_image?: boolean;
  /** AI-Director: this slide should embed a real-world YouTube video (verbs / cultural moments). */
  requires_video?: boolean;
  /** Search query the YouTube fetcher will use when `requires_video` is true. */
  youtube_query?: string;
  /** Cached YouTube videoId after fetch. */
  youtube_video_id?: string;
  youtube_embed_url?: string;
  youtube_title?: string;
  youtube_thumbnail?: string;
  /** Animated game-style backdrop theme (Playground only). */
  game_background?: string;
  // legacy / optional
  teacher_instructions?: string;
  interactive_options?: string[];
  interaction_type?: string;
}

export type HomeworkMissionType = 'memory_match' | 'listen_and_choose' | 'word_scramble';

export interface MemoryMatchMission {
  id: string;
  mission_type: 'memory_match';
  prompt: string;
  pairs: { term: string; match: string }[];
}
export interface ListenAndChooseMission {
  id: string;
  mission_type: 'listen_and_choose';
  prompt: string;
  target_word: string;
  options: string[];
  correct_answer: string;
}
export interface WordScrambleMission {
  id: string;
  mission_type: 'word_scramble';
  prompt: string;
  target_word: string;
  scrambled: string;
}
export type HomeworkMission = MemoryMatchMission | ListenAndChooseMission | WordScrambleMission;

export interface ActiveLessonData {
  /** Supabase curriculum_lessons.id — set when editing an existing row. */
  lesson_id?: string;
  source_lesson?: BlueprintLessonRef;
  cefr_level: CEFRLevel;
  hub: HubType;
  lesson_title: string;
  target_goal?: string;
  target_grammar?: string;
  target_vocabulary?: string;
  roadmap?: string[];
  slides: PPPSlide[];
  /** AI-generated 3–5 app-style mini-games that recycle the lesson vocabulary as homework. */
  homework_missions?: HomeworkMission[];
  // Optional handoff metadata so we can persist links to the blueprint.
  level_id?: string;
  unit_id?: string;
  /** Optional self-link: stories (Graded Readers) point at the curriculum lesson they expand. */
  parent_lesson_id?: string | null;
  /** Lesson kind: standard PPP / trial / story (Graded Reader). */
  kind?: 'standard' | 'trial' | 'story';
  /** Visual style for story lessons (drives StoryBookViewer layout). */
  visual_style?: 'classic' | 'comic_western' | 'manga_rtl' | 'webtoon' | 'picture_book' | 'comic_spread';
  /** Legacy story layout flag — kept for back-compat with older viewer code. */
  story_layout?: 'classic' | 'immersive';
  /** Optional cached title for the linked curriculum lesson. */
  linked_lesson_title?: string | null;
}

/**
 * Context handed from the Curriculum Blueprint to the Unified Lesson Generator.
 * Holds the unit/lesson coordinates so the unified generator can prefill its
 * blueprint form AND save the resulting deck back to the exact same
 * curriculum_lessons slot (no duplicates).
 */
export interface ActiveBlueprintContext {
  unit_number: number;
  unit_title: string;
  unit_theme?: string;
  lesson_number: number;
  lesson_title: string;
  curriculum_title: string;
  hub: HubType;
  cefr_level: CEFRLevel;
  skill_focus?: string;
  objective?: string;
  previous_lesson_titles: string[];
  /** Stage requested by the curriculum action (homework / games / story / review / all). */
  stage?: 'all' | 'story' | 'games' | 'homework' | 'review';
  /** Auto-run the unified generator on mount with the prefilled blueprint. */
  autoRun?: boolean;
}

interface CreatorContextValue {
  currentStep: CreatorStep;
  setCurrentStep: (s: CreatorStep) => void;

  curriculumData: CurriculumData | null;
  setCurriculumData: (c: CurriculumData | null) => void;

  activeLessonData: ActiveLessonData | null;
  setActiveLessonData: (l: ActiveLessonData | null) => void;

  /** Blueprint coordinates for the active unified-generator session. */
  activeBlueprintContext: ActiveBlueprintContext | null;
  setActiveBlueprintContext: (c: ActiveBlueprintContext | null) => void;

  /** Patch a single slide on the active lesson and mark the studio dirty. */
  updateSlide: (id: string, patch: Partial<PPPSlide>) => void;
  /** Replace the whole slide deck on the active lesson. */
  replaceSlides: (slides: PPPSlide[]) => void;

  /** Computed working title for the studio header. */
  workingTitle: string;
  /** Dirty flag — set by feature components when there are unsaved edits. */
  isDirty: boolean;
  setDirty: (v: boolean) => void;
}

const CreatorContext = createContext<CreatorContextValue | null>(null);

// ── Persistence ──────────────────────────────────────────────────────────
// Creator Studio state (curriculum, active lesson, blueprint context) is
// persisted to sessionStorage so transient remounts — auth token refreshes,
// route protection races, navigation away & back — do not nuke generated
// curricula. Keys are namespaced so they can be cleared in one shot.
const STORAGE_KEY_PREFIX = 'creator_studio:';
const SK = {
  step: `${STORAGE_KEY_PREFIX}currentStep`,
  curriculum: `${STORAGE_KEY_PREFIX}curriculumData`,
  activeLesson: `${STORAGE_KEY_PREFIX}activeLessonData`,
  blueprintCtx: `${STORAGE_KEY_PREFIX}activeBlueprintContext`,
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Quota exceeded or storage disabled — fail silently, in-memory state still works.
  }
}

export const CreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<CreatorStep>(
    () => readStorage<CreatorStep>(SK.step, 'blueprint'),
  );
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(
    () => readStorage<CurriculumData | null>(SK.curriculum, null),
  );
  const [activeLessonData, setActiveLessonData] = useState<ActiveLessonData | null>(
    () => readStorage<ActiveLessonData | null>(SK.activeLesson, null),
  );
  const [activeBlueprintContext, setActiveBlueprintContext] = useState<ActiveBlueprintContext | null>(
    () => readStorage<ActiveBlueprintContext | null>(SK.blueprintCtx, null),
  );
  const [isDirty, setDirty] = useState(false);

  // Mirror state to sessionStorage on change.
  useEffect(() => writeStorage(SK.step, currentStep), [currentStep]);
  useEffect(() => writeStorage(SK.curriculum, curriculumData), [curriculumData]);
  useEffect(() => writeStorage(SK.activeLesson, activeLessonData), [activeLessonData]);
  useEffect(() => writeStorage(SK.blueprintCtx, activeBlueprintContext), [activeBlueprintContext]);

  const workingTitle = useMemo(() => {
    const inHubCreator =
      currentStep === 'playground-creator' ||
      currentStep === 'academy-creator' ||
      currentStep === 'success-creator';
    if (inHubCreator && activeLessonData) {
      return `Drafting: ${activeLessonData.lesson_title}`;
    }
    if (currentStep === 'blueprint' && curriculumData) {
      return `Blueprint: ${curriculumData.curriculum_title}`;
    }
    if (currentStep === 'library') return 'Master Library';
    if (currentStep === 'blueprint') return 'New Curriculum Blueprint';
    return 'Creator Studio';
  }, [currentStep, activeLessonData, curriculumData]);

  const updateSlide = (id: string, patch: Partial<PPPSlide>) => {
    setActiveLessonData((prev) => {
      if (!prev) return prev;
      const slides = prev.slides.map((s) => (s.id === id ? { ...s, ...patch } : s));
      return { ...prev, slides };
    });
    setDirty(true);
  };

  const replaceSlides = (slides: PPPSlide[]) => {
    setActiveLessonData((prev) => (prev ? { ...prev, slides } : prev));
    setDirty(true);
  };

  // ─── Debounced AUTOSAVE ──────────────────────────────────────
  // When `activeLessonData` is dirty, save to Supabase 2s after the user stops
  // editing. Surfaces RLS / permission errors via toast so they can never fail
  // silently. First save assigns a `lesson_id` so subsequent saves UPDATE in
  // place (no duplicates).
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    if (!isDirty || !activeLessonData) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const kind = activeLessonData.kind ?? 'standard';
        const extra: Record<string, unknown> = {};
        if (activeLessonData.visual_style) extra.visual_style = activeLessonData.visual_style;
        if (activeLessonData.story_layout) extra.story_layout = activeLessonData.story_layout;
        if (activeLessonData.parent_lesson_id !== undefined) extra.linked_lesson_id = activeLessonData.parent_lesson_id;
        if (activeLessonData.linked_lesson_title !== undefined) extra.linked_lesson_title = activeLessonData.linked_lesson_title;
        const result = await persistLesson(
          activeLessonData,
          activeLessonData.slides,
          false, // autosave never publishes
          kind,
          Object.keys(extra).length ? extra : undefined,
        );
        if (result.ok === false) {
          const msg = result.error;
          toast.error(`Autosave failed: ${msg}`, {
            description:
              msg.toLowerCase().includes('row-level') ||
              msg.toLowerCase().includes('permission')
                ? 'Your account is missing the content_creator role. Ask an admin to grant it.'
                : undefined,
          });
        } else {
          if (!activeLessonData.lesson_id) {
            setActiveLessonData((prev) =>
              prev ? { ...prev, lesson_id: result.lesson_id } : prev,
            );
          }
          setDirty(false);
        }
      } catch (err: any) {
        toast.error(`Autosave failed: ${err?.message || 'Unknown error'}`);
      } finally {
        inFlight.current = false;
      }
    }, 2000);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [isDirty, activeLessonData]);

  const value: CreatorContextValue = {
    currentStep,
    setCurrentStep,
    curriculumData,
    setCurriculumData,
    activeLessonData,
    setActiveLessonData,
    activeBlueprintContext,
    setActiveBlueprintContext,
    updateSlide,
    replaceSlides,
    workingTitle,
    isDirty,
    setDirty,
  };

  return <CreatorContext.Provider value={value}>{children}</CreatorContext.Provider>;
};

export const useCreator = (): CreatorContextValue => {
  const ctx = useContext(CreatorContext);
  if (!ctx) throw new Error('useCreator must be used within <CreatorProvider>');
  return ctx;
};
