/**
 * Resolves the canonical Master Library lesson + hub for a classroom booking.
 *
 * Priority chain:
 *   1. class_bookings.lesson_id      → lessons row for this booking
 *   2. lessons.curriculum_lesson_id  → curriculum_lessons row (THE master library)
 *   3. class_bookings.hub_type       → just the hub (no slides)
 */
import { supabase } from '@/integrations/supabase/client';
import { getLessonById, getLibraryLessonSlides, type LibraryLesson } from './lessonLibraryService';
import { resolveActiveCoreLesson, findFirstLessonForLevel, type Hub as CoreHub } from './activeCoreLessonResolver';
import { buildPreviewHomeworkPack } from '@/components/lesson-player/buildPreviewHomeworkPack';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { isSceneLessonFormat } from '@/content/playground-library/sceneLessonFormats';


export type ClassroomHub = 'playground' | 'academy' | 'professional';

export interface ResolvedClassroomLesson {
  hubType: ClassroomHub;
  lesson: LibraryLesson | null;
  lessonId: string | null;
  lessonTitle: string | null;
  slides: any[];
}

const FALLBACK_HUB: ClassroomHub = 'academy';

export function normalizeHub(value?: string | null): ClassroomHub {
  const v = String(value ?? '').toLowerCase();
  if (v === 'playground' || v === 'kids') return 'playground';
  if (v === 'professional' || v === 'success' || v === 'adult' || v === 'adults') return 'professional';
  if (v === 'academy' || v === 'teen' || v === 'teens') return 'academy';
  return FALLBACK_HUB;
}

/**
 * Synthesize "homework task" slides and append them at the end of the lesson deck
 * so teachers can present every homework activity inside the classroom flow.
 *
 * Each synthesized slide carries `type: 'homework_task'` and an embedded
 * `homeworkTask` payload that `CenterStage` renders via `HomeworkSlideLivePreview`.
 */
function appendHomeworkSlides(
  baseSlides: any[],
  hub: ClassroomHub,
  lessonTitle: string | null,
  homeworkPack?: { tasks?: any[] } | null,
): any[] {
  try {
    const packHub: HubType = hub;
    const pack = homeworkPack?.tasks?.length
      ? homeworkPack
      : buildPreviewHomeworkPack(packHub, lessonTitle ?? '', baseSlides);
    if (!pack.tasks?.length) return baseSlides;
    const previewHub = hub === 'professional' ? 'success' : hub;
    const homeworkSlides = pack.tasks.map((task, idx) => ({
      id: `homework-${idx + 1}`,
      type: 'homework_task',
      slide_type: 'homework_task',
      title: `Homework ${idx + 1}: ${task.prompt.slice(0, 60)}${task.prompt.length > 60 ? '…' : ''}`,
      hub: previewHub,
      homeworkTask: task,
      homeworkIndex: idx + 1,
      homeworkTotal: pack.tasks.length,
    }));
    return [...baseSlides, ...homeworkSlides];
  } catch (e) {
    console.warn('[classroomLessonResolver] failed to append homework slides:', e);
    return baseSlides;
  }
}

function getTrialLessonTitle(hub: ClassroomHub): string {
  if (hub === 'playground') return 'First English Adventure · Trial Lesson';
  if (hub === 'professional') return 'Success Hub Diagnostic · Trial Lesson';
  return 'Academy English Adventure · Trial Lesson';
}

function buildTrialLessonSlides(hub: ClassroomHub, cefr?: string | null): any[] {
  const level = cefr || (hub === 'playground' ? 'Pre-A1' : hub === 'professional' ? 'B1' : 'A2');
  if (hub === 'playground') {
    return [
      { id: 'trial-pg-1', type: 'intro', title: 'Hello, English explorer!', text: `${level} trial · Meet your teacher, play, speak, and shine.`, voice: { text: 'Hello English explorer! Let us play and speak English.', autoPlay: false } },
      { id: 'trial-pg-2', type: 'multiple', question: 'What do we say when we meet?', options: ['Hello!', 'Apple!', 'Sleep!'], answer: 'Hello!', feedback: { correct: 'Yes! Hello!', wrong: 'Try again. We say hello.' } },
      { id: 'trial-pg-3', type: 'match', instruction: 'Match the friendly words.', pairs: [{ word: 'HELLO', image_url: '/playground/placeholder-dropzone.svg' }, { word: 'BYE', image_url: '/playground/placeholder-dropzone.svg' }, { word: 'CAT', image_url: '/playground/placeholder-dropzone.svg' }, { word: 'SUN', image_url: '/playground/placeholder-dropzone.svg' }] },
      { id: 'trial-pg-4', type: 'fill', text: 'My name is ____', answer: 'Alex', feedback: { correct: 'Great speaking sentence!', wrong: 'Say: My name is Alex.' } },
      { id: 'trial-pg-5', type: 'truefalse', statement: '“I am happy” is an English sentence.', answer: true },
      { id: 'trial-pg-6', type: 'draw', prompt: 'Draw how you feel today, then say: I am happy / excited / ready.' },
      { id: 'trial-pg-7', type: 'lesson_summary', title: 'Trial Complete!', vocab_recap: ['hello', 'bye', 'name', 'happy'], grammar_recap: 'I am… / My name is…', takeaway: 'You used English with your teacher today.' },
    ];
  }

  if (hub === 'professional') {
    return [
      { id: 'trial-su-1', type: 'intro', block: 'warmup', title: 'Professional English Diagnostic', subtitle: `${level} · Trial lesson · Speak clearly in real situations.` },
      { id: 'trial-su-2', type: 'question', block: 'warmup', prompt: 'Where do you need English most: meetings, emails, calls, or interviews?', placeholder: 'I need English for…' },
      { id: 'trial-su-3', type: 'vocab', block: 'vocab', word: 'deadline', definition: 'the latest time something must be finished.', example: 'The deadline for the report is Friday.' },
      { id: 'trial-su-4', type: 'matching', block: 'vocab', prompt: 'Match each workplace word to its meaning.', pairs: [{ left: 'deadline', right: 'final time limit' }, { left: 'agenda', right: 'meeting plan' }, { left: 'follow up', right: 'check again later' }] },
      { id: 'trial-su-5', type: 'functional_pattern', block: 'functional', title: 'Polite requests', rule: 'Use could / would to sound professional.', examples: ['Could you send me the file?', 'Would you mind sharing the agenda?', 'Could we schedule a quick call?'] },
      { id: 'trial-su-6', type: 'scenario', block: 'simulation', title: 'Client message', situation: 'You need a client to send missing information before tomorrow.', task: 'Say or write a polite 2-sentence request.', placeholder: 'Could you please…' },
      { id: 'trial-su-7', type: 'lesson_summary', block: 'output', title: 'Diagnostic Snapshot', vocab_recap: ['deadline', 'agenda', 'follow up'], grammar_recap: 'Polite requests with could / would', takeaway: 'Your teacher can now recommend the right Success Hub roadmap.' },
    ];
  }

  return [
    { id: 'trial-ac-1', type: 'intro', block: 'warmup', title: 'Academy English Adventure', subtitle: `${level} · Trial lesson · Show what you can understand and say.` },
    { id: 'trial-ac-2', type: 'question', block: 'warmup', prompt: 'What do you like doing after school?', placeholder: 'I like…' },
    { id: 'trial-ac-3', type: 'vocab', block: 'vocab', word: 'routine', definition: 'things you usually do every day', example: 'My routine starts with breakfast.' },
    { id: 'trial-ac-4', type: 'matching', block: 'vocab', prompt: 'Match each word to its meaning.', pairs: [{ left: 'routine', right: 'daily habits' }, { left: 'usually', right: 'most days' }, { left: 'practice', right: 'do something to improve' }] },
    { id: 'trial-ac-5', type: 'grammar_pattern', block: 'grammar', title: 'Present simple', rows: [{ a: 'I play football.', b: 'She plays football.' }, { a: 'I study English.', b: 'He studies English.' }, { a: 'They watch videos.', b: 'It watches videos.' }], rule: 'For he / she / it, add -s or -es to the verb.' },
    { id: 'trial-ac-6', type: 'sentence_builder', block: 'practice', prompt: 'Build the sentence.', words: ['usually', 'I', 'English', 'practice'], answer: ['I', 'usually', 'practice', 'English'] },
    { id: 'trial-ac-7', type: 'speaking_task', block: 'speaking', prompt: 'Tell your teacher three things about your daily routine.', starters: ['I usually…', 'After school, I…', 'At night, I…'] },
    { id: 'trial-ac-8', type: 'lesson_summary', block: 'speaking', title: 'Trial Complete', vocab_recap: ['routine', 'usually', 'practice'], grammar_recap: 'Present simple: I play / she plays', takeaway: 'Your teacher can now choose the best Academy path for you.' },
  ];
}

export async function resolveBookingLesson(booking: {
  id: string;
  lesson_id?: string | null;
  curriculum_lesson_id?: string | null;
  hub_type?: string | null;
  booking_type?: string | null;
  cefr_level?: string | null;
  student_id?: string | null;
  use_trial_fallback?: boolean;
}): Promise<ResolvedClassroomLesson> {
  let curriculumLessonId: string | null = booking.curriculum_lesson_id ?? null;
  const bookingHub = normalizeHub(booking.hub_type);
  const isTrialBooking = String(booking.booking_type ?? '').toLowerCase() === 'trial';
  const allowTrialSlides = isTrialBooking && booking.use_trial_fallback !== false;

  // A trial class opens the real Unit 1 Lesson 1 of the student's level
  // (the teacher can change the level in class; that pins
  // curriculum_lesson_id, which then wins above). Success has no library
  // lessons yet, so it keeps its own trial stage.
  if (!curriculumLessonId && allowTrialSlides && bookingHub !== 'professional') {
    try {
      curriculumLessonId = await findFirstLessonForLevel(bookingHub, booking.cefr_level);
    } catch (e) {
      console.warn('[classroomLessonResolver] trial level lesson lookup failed:', e);
    }
  }

  let unresolvedLessonRowTitle: string | null = null;
  if (!curriculumLessonId && booking.lesson_id) {
    const { data: lessonRow } = await supabase
      .from('lessons')
      .select('curriculum_lesson_id, title')
      .eq('id', booking.lesson_id)
      .maybeSingle();
    curriculumLessonId = (lessonRow as any)?.curriculum_lesson_id ?? null;

    if (!curriculumLessonId) {
      // A real, committed incident: a booking's `lessons` row existing but
      // never getting linked to a real curriculum_lessons row (created
      // with curriculum_lesson_id left null) used to dead-end HERE with an
      // immediate return — permanently pinning the booking to a blank
      // "Playground Lesson with Teacher, content isn't available yet"
      // screen for BOTH participants, even though the student's own
      // student_curriculum_progress correctly pointed at a real, built
      // lesson (confirmed live: booking eb8ce92f's lessons row has
      // curriculum_lesson_id=null, but the student was mid-lesson on Pre-A1
      // Unit 2 Lesson 3). Trial bookings still want their special
      // diagnostic-only content immediately — a first-time student usually
      // has no curriculum progress yet, so letting them fall through to
      // resolveActiveCoreLesson below would hand them a real lesson's FIRST
      // page instead of the intended trial flow. Every other booking now
      // falls through to try the Master Library / student progress lookup
      // first, and only uses this blank/trial fallback if that ALSO finds
      // nothing — never before trying it.
      if (allowTrialSlides) {
        const hubType = bookingHub;
        const trialSlides = buildTrialLessonSlides(hubType, booking.cefr_level);
        return {
          hubType,
          lesson: null,
          lessonId: booking.lesson_id,
          lessonTitle: getTrialLessonTitle(hubType),
          slides: trialSlides,
        };
      }
      unresolvedLessonRowTitle = (lessonRow as any)?.title ?? null;
    }
  }

  // No explicit booking.lesson_id (or it didn't resolve) → fall back to the
  // Master Library via student_lesson_pointers / placement CEFR.
  if (!curriculumLessonId && booking.student_id) {
    const coreHub: CoreHub = bookingHub === 'professional' ? 'success' : bookingHub;
    try {
      curriculumLessonId = await resolveActiveCoreLesson(booking.student_id, coreHub);
    } catch (e) {
      console.warn('[classroomLessonResolver] resolveActiveCoreLesson failed:', e);
    }
  }


  let lesson: LibraryLesson | null = null;
  if (curriculumLessonId) {
    try {
      lesson = await getLessonById(curriculumLessonId);
    } catch (e) {
      console.warn('[classroomLessonResolver] failed to load curriculum lesson:', e);
    }
  }

  // The booking's hub is authoritative: an Academy booking opens the Academy
  // classroom, a Playground booking the Playground classroom, a Success booking
  // the Success classroom — never decided by whichever lesson a student's
  // progress pointer happened to resolve to. If the resolved lesson belongs to
  // a different hub, drop it and use the booking hub's own first lesson.
  const bookingHubIsExplicit = !!booking.hub_type;
  if (lesson && bookingHubIsExplicit && normalizeHub(lesson.target_system) !== bookingHub) {
    console.warn('[classroomLessonResolver] lesson hub mismatch — ignoring', {
      bookingHub, lessonHub: lesson.target_system, lessonId: lesson.id,
    });
    lesson = null;
    if (bookingHub !== 'professional') {
      try {
        const sameHubId = await findFirstLessonForLevel(bookingHub, booking.cefr_level);
        if (sameHubId) lesson = await getLessonById(sameHubId);
      } catch (e) {
        console.warn('[classroomLessonResolver] same-hub fallback failed:', e);
      }
    }
  }

  const hubFromLesson = lesson ? normalizeHub(lesson.target_system) : null;
  const hubType = bookingHubIsExplicit ? bookingHub : (hubFromLesson ?? bookingHub);
  let baseSlides = lesson ? getLibraryLessonSlides(lesson) : (allowTrialSlides ? buildTrialLessonSlides(hubType, booking.cefr_level) : []);

  // Playground lessons render through <PlaygroundLessonPlayer/>, which reads
  // the full unit blueprint from `rawSlides[0].playgroundUnit`. Persistence
  // stores it at `content.playground_unit` — surface it onto the first slide
  // so the classroom stage can actually open the lesson.
  const playgroundUnit =
    (lesson?.content as any)?.playground_unit ??
    (lesson?.content as any)?.playground_lesson ??
    null;
  const contentFormat = (lesson?.ai_metadata as any)?.contentFormat;
  const isSceneLesson = isSceneLessonFormat(contentFormat);
  if (hubType === 'playground' && isSceneLesson) {
    // Scene-based lessons (Little Explorers Phonics = lep1-rich, Welcome
    // Town A1/A2 = wt-rich/wt-a2-rich) render through <EmbeddedSceneLesson/>
    // or <EmbeddedWelcomeTownLesson/>, which look up the static Scene[] by
    // unit/lesson number — replace whatever (possibly stale legacy
    // blueprint) slides this row carries with a single synthetic slide
    // carrying that reference. `contentFormat` travels along so MainStage
    // knows which of the two embedders (and which scene registry) to use.
    const unitNumber = Number((lesson?.ai_metadata as any)?.unit_number ?? 1);
    const lessonNumber = Number((lesson?.ai_metadata as any)?.lesson_number ?? 1);
    baseSlides = [{
      id: `scene-lesson-${unitNumber}-${lessonNumber}`,
      type: 'playground_scene',
      sceneLessonRef: { unitNumber, lessonNumber, contentFormat },
    }];
  } else if (hubType === 'playground' && playgroundUnit && baseSlides.length > 0) {
    baseSlides = baseSlides.map((s, i) =>
      i === 0 ? { ...s, playgroundUnit } : s,
    );
  }

  // Academy lessons carry one illustrated background per pedagogical block
  // (content.blockImages). The student player paints it behind each slide; stamp
  // it onto the slide so the live classroom can do the same.
  const blockImages = (lesson?.content as any)?.blockImages as Record<string, string> | undefined;
  if (blockImages && hubType === 'academy') {
    baseSlides = baseSlides.map((sl: any) =>
      sl && sl.block && blockImages[sl.block] ? { ...sl, _blockImage: blockImages[sl.block] } : sl,
    );
  }

  const homeworkPack = lesson
    ? ((lesson.content as any)?.homework_pack ?? (lesson.ai_metadata as any)?.unified_output?.homework_pack ?? null)
    : null;
  const slides = allowTrialSlides && !lesson
    ? baseSlides
    : appendHomeworkSlides(baseSlides, hubType, lesson?.title ?? null, homeworkPack);


  return {
    hubType,
    lesson,
    lessonId: lesson?.id ?? booking.lesson_id ?? null,
    lessonTitle: lesson?.title ?? (allowTrialSlides ? getTrialLessonTitle(hubType) : unresolvedLessonRowTitle),
    slides,
  };
}
