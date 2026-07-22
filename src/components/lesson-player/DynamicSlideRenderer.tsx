// ============================================================================
// L1/L2 PEDAGOGICAL RULE — DO NOT TRANSLATE LESSON CONTENT
// ----------------------------------------------------------------------------
// The student's UI chrome (sidebar, headers, buttons) is localized via i18n,
// but ALL curriculum content rendered here MUST stay in English. Never wrap
// `slide.target_phrase`, `slide.questions`, vocabulary, example sentences,
// `lesson.title`, or `lesson.description` in `t()`. They come from the
// `curriculum_lessons` / lesson_slides tables and must render verbatim so
// students get authentic English (L2) input regardless of their UI language (L1).
// ============================================================================
import React, { Component, ReactNode } from 'react';
import SpeakingPractice from './activities/SpeakingPractice';
import { motion, Variants } from 'framer-motion';
import { HubType, AnimationType, GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';


/* ── Local Error Boundary for individual slides ────────────────────── */
interface SlideBoundaryState { hasError: boolean; error?: Error }
class SlideErrorBoundary extends Component<{ children: ReactNode; slideId?: string; slide?: any }, SlideBoundaryState> {
  state: SlideBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error): SlideBoundaryState { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: any) { console.error('[SlideErrorBoundary] Slide crashed:', this.props.slideId, error, info); }
  render() {
    if (this.state.hasError) {
      // Graceful degradation: render the slide's title + content as a hero card
      // so the live class can keep flowing instead of seeing a scary error.
      const slide: any = (this.props as any).slide;
      const title = slide?.title || 'Slide';
      const text = (typeof slide?.content === 'string' ? slide.content : slide?.content?.prompt || slide?.content?.text || slide?.teacher_script || '');
      const img = slide?.imageUrl || slide?.image_url || slide?.custom_image_url || slide?.generated_image_url;
      return (
        <div className="w-full h-full min-h-[420px] grid gap-6 content-center p-8 text-center">
          {img && <img src={img} alt={title} className="mx-auto max-h-[280px] w-full max-w-2xl rounded-lg object-contain" />}
          <h2 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">{title}</h2>
          {text && <p className="mx-auto max-w-2xl text-lg text-muted-foreground whitespace-pre-line">{text}</p>}
        </div>
      );
    }
    return this.props.children;
  }
}
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import PlaygroundDragDrop from './activities/PlaygroundDragDrop';
import PlaygroundMatchPictures from './activities/PlaygroundMatchPictures';
import PlaygroundPopBubble from './activities/PlaygroundPopBubble';
import DragAndDropSortingSlide from './activities/DragAndDropSortingSlide';
import MatchingLinesSlide from './activities/MatchingLinesSlide';
import VocabMatchBoard from './activities/VocabMatchBoard';
import TracingCanvasSlide from './activities/TracingCanvasSlide';
import SpinnerWheelSlide from './activities/SpinnerWheelSlide';
import AcademyQuiz from './activities/AcademyQuiz';
import AcademyFillBlanks from './activities/AcademyFillBlanks';
import AcademySentenceUnscramble from './activities/AcademySentenceUnscramble';
import ProCaseStudy from './activities/ProCaseStudy';
import ProAdvancedFill from './activities/ProAdvancedFill';
import ProBusinessEmail from './activities/ProBusinessEmail';
import WordBank from './activities/WordBank';
import TimeAttack from './activities/TimeAttack';
import VisualDictation from './activities/VisualDictation';
import ExecutiveChoice from './activities/ExecutiveChoice';
// Practice Layer Activities — Phonics
import PhonicsSlider from './activities/PhonicsSlider';
import PhonemeTap from './activities/PhonemeTap';
import SoundSort from './activities/SoundSort';
import MouthMirror from './activities/MouthMirror';
// Practice Layer Activities — Vocabulary
import SoundToLetter from './activities/SoundToLetter';
import WordBuilder from './activities/WordBuilder';
import PictureLabel from './activities/PictureLabel';
import OddOneOut from './activities/OddOneOut';
// Practice Layer Activities — Grammar
import GrammarBlocks from './activities/GrammarBlocks';
import ArticlePicker from './activities/ArticlePicker';
import SentenceTransform from './activities/SentenceTransform';
// Four-Skill Activities
import SoundSpotting from './activities/SoundSpotting';
import TactileTracing from './activities/TactileTracing';
import LetterHunt from './activities/LetterHunt';
import SoundTrigger from './activities/SoundTrigger';
// Director PPP interactive types
import DragAndMatch from './activities/DragAndMatch';
import FillInTheGaps from './activities/FillInTheGaps';
// Novakid-style activities (Phase: lesson-content parity)
import ListenRepeatActivity from './activities/ListenRepeatActivity';
import PictureMatchActivity from './activities/PictureMatchActivity';
import TapTheWordActivity from './activities/TapTheWordActivity';
import MiniStoryActivity from './activities/MiniStoryActivity';
// Editorial Canvas components (Premium wide layout)
import EditorialHeroMedia from './editorial/EditorialHeroMedia';
import EditorialVocabList from './editorial/EditorialVocabList';
import EditorialGrammar from './editorial/EditorialGrammar';
import EditorialSortingGame from './editorial/EditorialSortingGame';
import EditorialFillBlanks from './editorial/EditorialFillBlanks';
import EditorialMatchHalves from './editorial/EditorialMatchHalves';
import EditorialQuizMCQ from './editorial/EditorialQuizMCQ';
import EditorialRolePlay from './editorial/EditorialRolePlay';
import EditorialAudioListening from './editorial/EditorialAudioListening';
import EditorialTrueFalse from './editorial/EditorialTrueFalse';
import EditorialSentenceBuilder from './editorial/EditorialSentenceBuilder';
import EditorialShadowingDrill from './editorial/EditorialShadowingDrill';
import EditorialRealWorldTask from './editorial/EditorialRealWorldTask';
import EditorialBranchingDialogue from './editorial/EditorialBranchingDialogue';
import FrontPageSlide from './editorial/FrontPageSlide';
import CelebrationSlide from './editorial/CelebrationSlide';
import VideoSlide from './editorial/VideoSlide';
import VocabFlipGrid from './editorial/VocabFlipGrid';
import TeacherDiscussionFallback from './editorial/TeacherDiscussionFallback';
import SlideShell from './SlideShell';
import EarlyLearnerOverlay from './EarlyLearnerOverlay';
// Slide types
import SlideHook from './slides/SlideHook';
import SlideVocabulary from './slides/SlideVocabulary';
import SlideConcept from './slides/SlideConcept';
import SlideSummary from './slides/SlideSummary';
import SlideReadingSplit from './SlideReadingSplit';
// New unified phonics system (Hear → See → Say → Do, hub-skinned)
import PhonicsCard from './phonics/PhonicsCard';
import PhonicsDoStep from './phonics/PhonicsDoStep';
import type { PhonicsCardData, PhonicsDoStep as PhonicsDoStepData } from './phonics/phonicsCardTypes';

// Cartoon-style motion: bouncy springs, ease-out-back overshoot, playful entrances.
// Follows the Playful personality (motion-design skill): 200–400ms, overshoot 10–20%.
const CARTOON_SPRING = { type: 'spring' as const, stiffness: 380, damping: 14, mass: 0.7 };
const EASE_OUT_BACK: [number, number, number, number] = [0.175, 0.885, 0.32, 1.275];

const ANIMATION_VARIANTS: Record<string, Variants> = {
  bounce: {
    initial: { opacity: 0, scale: 0.6, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { ...CARTOON_SPRING, opacity: { duration: 0.25 } },
    },
  },
  zoom_in: {
    initial: { opacity: 0, scale: 0.4 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 420, damping: 12, mass: 0.6 },
    },
  },
  wiggle: {
    initial: { opacity: 0, rotate: -12, scale: 0.85 },
    animate: {
      opacity: 1,
      rotate: [-12, 8, -4, 0],
      scale: 1,
      transition: { duration: 0.55, ease: EASE_OUT_BACK },
    },
  },
  float: {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: EASE_OUT_BACK },
    },
  },
  smooth_slide: {
    initial: { opacity: 0, x: 80, scale: 0.92 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { ...CARTOON_SPRING, opacity: { duration: 0.3 } },
    },
  },
  fade_up: {
    initial: { opacity: 0, y: 40, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: EASE_OUT_BACK },
    },
  },
  glitch: {
    initial: { opacity: 0, scale: 0.7, rotate: -6 },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: [-6, 4, -2, 0],
      transition: { duration: 0.5, ease: EASE_OUT_BACK },
    },
  },
  slide_fast: {
    initial: { opacity: 0, x: 120, scale: 0.9 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 450, damping: 16, mass: 0.6 },
    },
  },
  neon_pulse: {
    initial: { opacity: 0, scale: 0.7 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { ...CARTOON_SPRING, opacity: { duration: 0.3 } },
    },
  },
  none: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
  },
};


const getSlidePayload = (slide: any) => slide?.interactive_data || slide?.content || {};

const getSlideText = (slide: any) => {
  const payload = getSlidePayload(slide);
  return typeof slide?.content === 'string'
    ? slide.content
    : payload.prompt || payload.text || payload.body || payload.description || slide?.teacher_script || '';
};

const getSlideMediaUrl = (slide: any) =>
  slide?.imageUrl || slide?.image_url || slide?.generated_image_url || slide?.custom_image_url || slide?.media_url || slide?.youtube_thumbnail;

const normalizePairs = (slide: any) => {
  const payload = getSlidePayload(slide);
  const rawPairs = payload.pairs || payload.matches || payload.items || slide?.pairs || [];
  return Array.isArray(rawPairs)
    ? rawPairs.map((pair: any) => ({
        left_item: pair.left_item || pair.left || pair.term || pair.word || pair.prompt || '',
        right_item: pair.right_item || pair.right || pair.match || pair.definition || pair.answer || '',
        left_thumbnail_url: pair.left_thumbnail_url || pair.leftImageUrl,
        right_thumbnail_url: pair.right_thumbnail_url || pair.rightImageUrl,
      })).filter((pair: any) => pair.left_item && pair.right_item)
    : [];
};

/** ── Interactive data validation ───────────────────────────────────────
 * Maps each interactive slide_type to the key its UI requires inside
 * `interactive_data`. If the AI emits the type without that payload, we
 * render a friendly fallback instead of an empty quiz shell. */
const INTERACTIVE_REQUIRED_KEYS: Record<string, string[]> = {
  quiz_mcq: ['options'],
  multiple_choice: ['options'],
  reading_quiz: ['options'],
  listening_comprehension: ['options'],
  fill_in_blanks: ['sentences'],
  fill_in_the_gaps: ['sentence_parts', 'missing_word'],
  match_halves: ['pairs'],
  match_words: ['items', 'categories'],
  image_match: ['items', 'categories'],
  sorting_game: ['items', 'categories'],
  sentence_builder: ['scrambled_words'],
  true_false: ['statements'],
  drag_and_match: ['pairs'],
  drag_and_drop: ['items', 'targets'],
  drag_and_drop_sorting: ['categories', 'draggable_items'],
  matching_lines: ['left_column', 'right_column'],
  tracing_canvas: ['target_letters'],
  spinner_wheel: ['wheel_segments'],
};

const hasValidInteractiveData = (slide: any, type: string): boolean => {
  const required = INTERACTIVE_REQUIRED_KEYS[type];
  if (!required) return true;
  const data = slide?.activity_data || slide?.interactive_data || slide?.content;
  if (!data || typeof data !== 'object') return false;
  return required.some((k) => {
    const v = (data as any)[k];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== '';
  });
};

function MissingDataFallback({ slide }: { slide: any }) {
  return <TeacherDiscussionFallback slide={slide} />;
}

function LiveHeroMediaSlide({ slide }: { slide: any }) {
  const mediaUrl = getSlideMediaUrl(slide);
  const text = getSlideText(slide);
  return (
    <div className="w-full h-full min-h-[520px] grid gap-6 content-center p-6 text-center text-foreground">
      {mediaUrl && <img src={mediaUrl} alt={slide.title || 'Lesson visual'} className="mx-auto max-h-[320px] w-full max-w-3xl rounded-lg object-contain" loading="lazy" />}
      <div className="mx-auto max-w-3xl space-y-3">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
        {text && <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-line">{text}</p>}
      </div>
    </div>
  );
}

function LiveVocabularyGrid({ slide, hub }: { slide: any; hub: HubType }) {
  const config = HUB_CONFIGS[hub];
  const payload = getSlidePayload(slide);
  const words = payload.words || payload.vocabulary || payload.vocab_list || payload.items || [];
  const entries = Array.isArray(words) ? words : [];
  return (
    <div className="w-full min-h-[520px] p-6 flex flex-col justify-center gap-6 text-foreground">
      <h2 className="text-3xl md:text-4xl font-bold text-center" style={{ color: config.colorPalette.primary }}>{slide.title || 'Vocabulary'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto">
        {entries.map((entry: any, index: number) => {
          const item = typeof entry === 'string' ? { word: entry } : entry;
          const imageUrl = item.imageUrl || item.image_url || item.thumbnail_url;
          return (
            <div key={`${item.word || item.term || index}`} className="rounded-lg border border-border bg-card p-4 text-card-foreground">
              {imageUrl && <img src={imageUrl} alt={item.word || item.term || 'Vocabulary image'} className="mb-3 h-32 w-full rounded-md object-cover" loading="lazy" />}
              <h3 className="text-xl font-bold">{item.word || item.term || item.title}</h3>
              {(item.definition || item.meaning) && <p className="mt-1 text-sm text-muted-foreground">{item.definition || item.meaning}</p>}
              {item.sentence && <p className="mt-3 text-sm italic text-foreground/80">“{item.sentence}”</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveGrammarExplanation({ slide, hub }: { slide: any; hub: HubType }) {
  const config = HUB_CONFIGS[hub];
  const payload = getSlidePayload(slide);
  const examples = payload.examples || payload.sample_sentences || [];
  return (
    <div className="w-full min-h-[520px] p-8 flex items-center justify-center text-foreground">
      <article className="w-full max-w-4xl space-y-6">
        <h2 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: config.colorPalette.primary }}>{slide.title || 'Grammar Focus'}</h2>
        {(payload.rule || payload.pattern) && <div className="rounded-lg border border-border bg-muted p-5 text-2xl font-bold">{payload.rule || payload.pattern}</div>}
        {(payload.explanation || getSlideText(slide)) && <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-line">{payload.explanation || getSlideText(slide)}</p>}
        {Array.isArray(examples) && examples.length > 0 && (
          <div className="grid gap-3">
            {examples.map((example: any, index: number) => <div key={index} className="rounded-md border border-border bg-card p-4 text-lg">{typeof example === 'string' ? example : example.text || example.sentence}</div>)}
          </div>
        )}
      </article>
    </div>
  );
}

interface DynamicSlideRendererProps {
  slide: GeneratedSlide;
  hub: HubType;
  onCorrectAnswer: () => void;
  onIncorrectAnswer?: () => void;
  onComplete?: () => void;
  /** Optional metadata for the branded shell. */
  level?: string;
  unit?: number | string;
  lesson?: number | string;
  slideIndex?: number;
  totalSlides?: number;
  /** When true, do not wrap output in the SlideShell (used by host containers that already provide one). */
  disableShell?: boolean;
}

export default function DynamicSlideRenderer({
  slide,
  hub,
  onCorrectAnswer,
  onIncorrectAnswer,
  onComplete,
  level,
  unit,
  lesson,
  slideIndex,
  totalSlides,
  disableShell = false,
}: DynamicSlideRendererProps) {
  const config = HUB_CONFIGS[hub];
  const animKey = slide.animation || config.defaultAnimation;
  const variants = ANIMATION_VARIANTS[animKey] || ANIMATION_VARIANTS.none;

  const renderContent = () => {
    // ── 6-Step Blueprint: Reading phase always uses split-screen layout ──
    // The AI guarantees passages > 100 words are split across multiple Reading
    // slides, and wraps target vocab in **bold** markdown for highlighting.
    const lessonPhase = (slide as any).lesson_phase as string | undefined;
    if (lessonPhase === 'Reading') {
      return <SlideReadingSplit slide={slide as any} />;
    }

    // ── 6-Step Blueprint: Speaking phase uses VoiceRecorder grading ──
    if (lessonPhase === 'Speaking' && (slide as any).requires_audio) {
      const target = (slide as any).interactive_data?.speech?.target_sentence
        || (slide as any).content
        || (slide as any).title
        || '';
      return (
        <SpeakingPractice
          targetSentence={target}
          hub={hub === 'professional' ? 'success' : hub as any}
          context={(slide as any).teacher_script}
          lessonId={(slide as any).lesson_id}
          slideId={slide.id}
          onComplete={() => onCorrectAnswer()}
        />
      );
    }

    // ── Director PPP interactive types (highest priority) ─────────
    // The generate-ppp-slides edge function emits slide_type = 'drag_and_match' | 'fill_in_the_gaps'.
    const directorType = (slide as any).slide_type || (slide as any).activityType || (slide as any).type;

    // ── Empty interactive_data fallback ─────────────────────────
    // Avoid showing an empty quiz/match shell when the AI forgot the payload.
    if (directorType && INTERACTIVE_REQUIRED_KEYS[directorType] && !hasValidInteractiveData(slide, directorType)) {
      console.warn('[DynamicSlideRenderer] Missing interactive_data for', directorType, slide?.id);
      return <MissingDataFallback slide={slide} />;
    }

    // ── Bookend slides ────────────────────────────────────────────
    if (directorType === 'front_page' || directorType === 'title_page') {
      return <FrontPageSlide
        lessonTitle={(slide as any).title || ''}
        topic={(slide as any).topic}
        subtitle={(slide as any).subtitle}
        level={(slide as any).level}
        hub={hub}
        coverImageUrl={(slide as any).coverImageUrl || (slide as any).imageUrl || (slide as any).custom_image_url}
        unitNumber={(slide as any).unitNumber ?? (slide as any).unit_number}
        unitTitle={(slide as any).unitTitle ?? (slide as any).unit_title}
        lessonNumber={(slide as any).lessonNumber ?? (slide as any).lesson_number}
      />;
    }
    if (directorType === 'celebration') {
      return <CelebrationSlide lessonTitle={(slide as any).title || ''} topic={(slide as any).topic} hub={hub} onFinish={onComplete} />;
    }
    if (directorType === 'video_page') {
      return <VideoSlide slide={slide} />;
    }

    // ── New: handle generator-emitted slide_types not yet in the editorial map ──
    if (directorType === 'mascot_speech') {
      const ytEmbed = (slide as any).youtube_embed_url || (slide as any).youtube_video_id;
      if (ytEmbed) return <VideoSlide slide={slide} />;
      return <SlideConcept slide={slide} hub={hub} />;
    }
    if (directorType === 'flashcard' || directorType === 'vocabulary') {
      return <VocabFlipGrid slide={slide} />;
    }
    if (directorType === 'text_image') {
      return <LiveHeroMediaSlide slide={slide} />;
    }
    if (directorType === 'drawing_canvas') {
      return <LiveHeroMediaSlide slide={slide} />;
    }

    if (directorType === 'hero_media') {
      return <EditorialHeroMedia slide={slide} />;
    }
    if (directorType === 'vocab_list') {
      return <VocabFlipGrid slide={slide} />;
    }
    if (directorType === 'grammar_explanation') {
      return <EditorialGrammar slide={slide} />;
    }
    if (directorType === 'sorting_game') {
      return <EditorialSortingGame slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'fill_in_blanks') {
      return <EditorialFillBlanks slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'match_halves') {
      return <EditorialMatchHalves slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'quiz_mcq' || directorType === 'multiple_choice') {
      return <EditorialQuizMCQ slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'drawing_prompt') {
      return <LiveHeroMediaSlide slide={slide} />;
    }
    if (directorType === 'role_play') {
      return <EditorialRolePlay slide={slide} onCorrect={onCorrectAnswer} />;
    }
    // ── New Context-Aware Sequencing types ──────────────────────
    if (directorType === 'audio_listening') {
      return <EditorialAudioListening slide={slide} onCorrect={onCorrectAnswer} />;
    }
    if (directorType === 'true_false') {
      return <EditorialTrueFalse slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'sentence_builder') {
      return <EditorialSentenceBuilder slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'shadowing_drill') {
      return <EditorialShadowingDrill slide={slide} onCorrect={onCorrectAnswer} />;
    }
    if (directorType === 'real_world_task') {
      return <EditorialRealWorldTask slide={slide} onCorrect={onCorrectAnswer} />;
    }
    if (directorType === 'branching_dialogue') {
      return <EditorialBranchingDialogue slide={slide} onCorrect={onCorrectAnswer} />;
    }
    // Aliases: reading_quiz maps to quiz_mcq, match_words/image_match map to sorting_game
    if (directorType === 'reading_quiz' || directorType === 'listening_comprehension') {
      return <EditorialQuizMCQ slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'match_words' || directorType === 'image_match') {
      return <EditorialSortingGame slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'drag_and_match') {
      return <DragAndMatch slide={slide} hub={hub} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'drag_and_drop') {
      return <PlaygroundDragDrop slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'drag_and_drop_sorting') {
      return <DragAndDropSortingSlide slide={slide} hub={hub === 'professional' ? 'success' : hub as any} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} onComplete={onComplete} />;
    }
    if (directorType === 'matching_lines') {
      return <MatchingLinesSlide slide={slide} hub={hub === 'professional' ? 'success' : hub as any} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} onComplete={onComplete} />;
    }
    if (directorType === 'vocab_match_board' || (slide.activityType as string) === 'vocab_match_board') {
      return <VocabMatchBoard slide={slide} hub={hub as any} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} onComplete={onComplete} />;
    }
    if (directorType === 'tracing_canvas') {
      return <TracingCanvasSlide slide={slide} hub={hub === 'professional' ? 'success' : hub as any} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} onComplete={onComplete} />;
    }
    if (directorType === 'spinner_wheel') {
      return <SpinnerWheelSlide slide={slide} hub={hub === 'professional' ? 'success' : hub as any} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} onComplete={onComplete} />;
    }
    if (directorType === 'fill_in_the_gaps') {
      return <FillInTheGaps slide={slide} hub={hub} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }

    // ── Novakid-style content beats ────────────────────────────────
    if (directorType === 'listen_repeat') {
      return <ListenRepeatActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'picture_match') {
      return <PictureMatchActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'tap_the_word') {
      return <TapTheWordActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (directorType === 'mini_story') {
      return <MiniStoryActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} onComplete={onComplete} />;
    }

    // ── Skill-flag routing ────────────────────────────────────────
    // If the slide has explicit skill flags, route to the corresponding component
    if (slide.has_writing && slide.activityType === 'tactile_tracing') {
      return <TactileTracing slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (slide.has_writing && slide.activityType === 'letter_hunt') {
      return <LetterHunt slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (slide.has_listening && slide.activityType === 'sound_spotting') {
      return <SoundSpotting slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (slide.has_listening && slide.activityType === 'sound_trigger') {
      return <SoundTrigger slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (slide.has_grammar_blocks && slide.activityType === 'grammar_blocks') {
      return <GrammarBlocks slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    if (slide.has_phonics && slide.activityType === 'phonics_slider') {
      return <PhonicsSlider slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }

    // ── Activity type routing ─────────────────────────────────────
    if (slide.slideType === 'activity' || slide.activityType) {
      return renderActivity();
    }

    switch (slide.slideType) {
      case 'hook':
      case 'warmup':
        return <SlideHook slide={slide} hub={hub} />;
      case 'vocabulary':
        return <SlideVocabulary slide={slide} hub={hub} />;
      case 'core_concept':
      case 'dialogue':
        return <SlideConcept slide={slide} hub={hub} />;
      case 'summary':
      case 'goodbye':
      case 'review':
        return <SlideSummary slide={slide} hub={hub} />;
      default:
        return renderActivity() || <SlideHook slide={slide} hub={hub} />;
    }
  };

  const renderActivity = () => {
    const actType = (slide.activityType || slide.type) as string;

    // ── Cross-hub practice layer activities ──────────────────────
    // ── New unified Phonics system (hub-skinned Hear → See → Say → Do) ──
    if (actType === 'phonics_card') {
      const data: PhonicsCardData = (slide as any).phonics_card || (slide as any).data || {
        grapheme: (slide as any).grapheme ?? slide.title ?? '?',
        phoneme: (slide as any).phoneme ?? '',
        examples: (slide as any).examples ?? [],
      };
      return <PhonicsCard hub={hub} data={data} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
    // Standalone "Do" beats — usable on their own slides for spaced reinforcement.
    const phonicsSkin = hub === 'professional' || (hub as string) === 'success' ? 'success'
                      : hub === 'academy' ? 'academy' : 'playground';
    if (actType === 'phoneme_isolation' || actType === 'blending_animation'
        || actType === 'minimal_pair_tap' || actType === 'grapheme_hunt'
        || actType === 'decoding_probe') {
      const step = ((slide as any).do_step || (slide as any).step || { kind: actType, ...(slide as any) }) as PhonicsDoStepData;
      return (
        <div className="w-full h-full p-6 grid content-center">
          <PhonicsDoStep skin={phonicsSkin} step={step} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />
        </div>
      );
    }

    // Phonics Layer (legacy components retained for back-compat)
    if (actType === 'phonics_slider') return <PhonicsSlider slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'phoneme_tap') return <PhonemeTap slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'sound_sort') return <SoundSort slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'mouth_mirror') return <MouthMirror slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    // Vocabulary Layer
    if (actType === 'sound_to_letter') return <SoundToLetter slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'word_builder') return <WordBuilder slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'picture_label') return <PictureLabel slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'odd_one_out') return <OddOneOut slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    // Grammar Layer
    if (actType === 'grammar_blocks') return <GrammarBlocks slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'article_picker') return <ArticlePicker slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'sentence_transform') return <SentenceTransform slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    // Four-Skill Activities
    if (actType === 'sound_spotting') return <SoundSpotting slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'tactile_tracing') return <TactileTracing slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'letter_hunt') return <LetterHunt slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'sound_trigger') return <SoundTrigger slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;

    // ── Cross-hub generic activities ─────────────────────────────
    if (actType === 'word_bank') return <WordBank slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'drag_and_match') return <DragAndMatch slide={slide} hub={hub} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'drag_and_drop') return <PlaygroundDragDrop slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'fill_in_the_gaps') return <FillInTheGaps slide={slide} hub={hub} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    // Novakid-style content beats
    if (actType === 'listen_repeat') return <ListenRepeatActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'picture_match') return <PictureMatchActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'tap_the_word') return <TapTheWordActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    if (actType === 'mini_story') return <MiniStoryActivity slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} onComplete={onComplete} />;

    switch (hub) {
      case 'playground':
        if (actType === 'visual_dictation') return <VisualDictation slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        if (actType === 'pop_the_word_bubble') return <PlaygroundPopBubble slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        if (actType === 'match_pictures' || actType === 'match_sound_to_picture') return <PlaygroundMatchPictures slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        return <PlaygroundDragDrop slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;

      case 'academy':
        if (actType === 'time_attack' || actType === 'speed_quiz') return <TimeAttack slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        if (actType === 'sentence_unscramble') return <AcademySentenceUnscramble slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        if (actType === 'fill_in_blanks') return <WordBank slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        return <AcademyQuiz slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;

      case 'professional':
        if (actType === 'executive_choice') return <ExecutiveChoice slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        if (actType === 'business_email_reply') return <ProBusinessEmail slide={slide} onCorrect={onCorrectAnswer} onComplete={onComplete} />;
        if (actType === 'advanced_fill_blanks' || actType === 'vocabulary_expansion') return <ProAdvancedFill slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
        return <ProCaseStudy slide={slide} onCorrect={onCorrectAnswer} onComplete={onComplete} />;

      default:
        return <PlaygroundDragDrop slide={slide} onCorrect={onCorrectAnswer} onIncorrect={onIncorrectAnswer} />;
    }
  };

  const inner = (
    <SlideErrorBoundary slideId={slide.id} slide={slide}>
      {renderContent()}
    </SlideErrorBoundary>
  );

  return (
    <motion.div
      key={slide.id}
      initial={{ x: 60, opacity: 0, scale: 0.98 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -60, opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="w-full h-full flex items-center justify-center"
    >
      {disableShell ? (
        <EarlyLearnerOverlay hub={hub} level={level} slide={slide}>
          {inner}
        </EarlyLearnerOverlay>
      ) : (
        <SlideShell
          hub={hub}
          level={level}
          unit={unit}
          lesson={lesson}
          slideIndex={slideIndex}
          totalSlides={totalSlides}
        >
          <EarlyLearnerOverlay hub={hub} level={level} slide={slide}>
            {inner}
          </EarlyLearnerOverlay>
        </SlideShell>
      )}
    </motion.div>
  );
}
