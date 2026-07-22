import { supabase } from '@/integrations/supabase/client';
import { GeneratedSlide, HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

export interface LibraryLesson {
  id: string;
  title: string;
  description: string | null;
  target_system: string;
  difficulty_level: string;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  content: any;
  is_published: boolean;
  created_at: string;
  created_by: string | null;
  ai_metadata: any;
}

export type LibraryHub = 'playground' | 'academy' | 'professional';

export interface LibraryLessonCard {
  id: string;
  title: string;
  description: string | null;
  hub: LibraryHub;
  target_system: string;
  difficulty_level: string;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  slide_count: number;
  created_at: string;
}

export interface ClassroomSlide {
  id: string;
  title: string;
  imageUrl?: string;
  content?: string;
}

const HUB_TO_TARGET_SYSTEM: Record<string, string> = {
  playground: 'kids',
  academy: 'teen',
  professional: 'adult',
  kids: 'kids',
  teen: 'teen',
  teens: 'teen',
  adult: 'adult',
  adults: 'adult',
};

export function targetSystemToHub(targetSystem?: string | null): LibraryHub {
  const normalized = String(targetSystem ?? '').toLowerCase();
  if (normalized === 'kids' || normalized === 'playground') return 'playground';
  if (normalized === 'teen' || normalized === 'teens' || normalized === 'academy') return 'academy';
  return 'professional';
}

function getSlidesArray(content: any): any[] {
  if (Array.isArray(content)) return content;
  if (Array.isArray(content?.slides)) return content.slides;
  if (Array.isArray(content?.lesson?.slides)) return content.lesson.slides;
  return [];
}

export function getLibraryLessonSlides(lesson: Pick<LibraryLesson, 'content'>): any[] {
  return getSlidesArray(lesson.content);
}

export function getLibrarySlideCount(lesson: Pick<LibraryLesson, 'content'>): number {
  return getSlidesArray(lesson.content).length;
}

export function toLibraryLessonCard(lesson: LibraryLesson): LibraryLessonCard {
  return {
    id: lesson.id,
    title: lesson.title || 'Untitled Lesson',
    description: lesson.description,
    hub: targetSystemToHub(lesson.target_system),
    target_system: lesson.target_system,
    difficulty_level: lesson.difficulty_level,
    duration_minutes: lesson.duration_minutes,
    thumbnail_url: lesson.thumbnail_url,
    slide_count: getLibrarySlideCount(lesson),
    created_at: lesson.created_at,
  };
}

function getSlideText(slide: any): string | undefined {
  const candidates = [
    typeof slide?.content === 'string' ? slide.content : undefined,
    slide?.content?.definition,
    slide?.content?.sentence,
    slide?.content?.prompt,
    slide?.hint_text,
    slide?.teacher_script,
  ];
  return candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
}

export function extractClassroomSlides(lesson: LibraryLesson): ClassroomSlide[] {
  const slides = getSlidesArray(lesson.content);
  if (slides.length === 0) {
    return [{ id: lesson.id, title: lesson.title, content: lesson.description ?? undefined }];
  }

  return slides.map((slide, index) => ({
    id: String(slide?.id ?? index + 1),
    title: String(slide?.title || slide?.content?.title || `Slide ${index + 1}`),
    imageUrl: slide?.imageUrl || slide?.image_url || slide?.generated_image_url || slide?.media_url || slide?.content?.imageUrl,
    content: getSlideText(slide),
  }));
}

/**
 * Save a generated lesson to curriculum_lessons (the library).
 */
export async function saveToLibrary(
  topic: string,
  hub: HubType,
  level: string,
  slides: GeneratedSlide[],
  thumbnailUrl?: string
) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  // Standalone lesson save: this isn't part of a numbered blueprint slot
  // (no unit_number/lesson_number), so a plain INSERT is correct. The
  // blueprint slot UNIQUE constraint only applies when all slot_* columns
  // are populated, and we don't want to dedupe one-off saves anyway.
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .insert({
      title: topic,
      description: `AI-generated ${hub} lesson on "${topic}"`,
      target_system: hub,
      difficulty_level: level,
      duration_minutes: 30,
      thumbnail_url: thumbnailUrl || null,
      content: { slides, hub, generatedAt: new Date().toISOString() },
      is_published: true,
      created_by: userId || null,
      ai_metadata: { hub, level, cefr_level: level, slideCount: slides.length },
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all published lessons from the library.
 */
export async function getLibraryLessons(hubFilter?: string, opts?: { includeDrafts?: boolean }) {
  let query = supabase
    .from('curriculum_lessons')
    .select('*')
    .order('created_at', { ascending: false });

  if (!opts?.includeDrafts) {
    query = query.eq('is_published', true);
  }

  if (hubFilter && hubFilter !== 'all') {
    query = query.eq('target_system', HUB_TO_TARGET_SYSTEM[hubFilter] || hubFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as LibraryLesson[];
}

/**
 * Fetch a single lesson by ID.
 */
export async function getLessonById(id: string) {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as LibraryLesson;
}
