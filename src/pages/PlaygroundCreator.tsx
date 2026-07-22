import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, Download, Upload, Eye, Code2, X, Sparkles, Loader2, Image as ImageIcon, Save, BookOpen, Send, FolderOpen, History, Wand2, FileUp, ArrowLeft, ClipboardCheck } from 'lucide-react';
import { normalizePlaygroundSlide, type Slide } from './PlaygroundDemo';
import { detectLessonHub, creatorPathFor, deriveCefrLevel } from '@/utils/creatorHydration';
import { generateOnePlaygroundImage, generatePlaygroundImages } from '@/hooks/usePlaygroundImages';
import { PLAYGROUND_CAST_PRESETS } from '@/constants/playgroundCastPresets';
import { supabase } from '@/integrations/supabase/client';
import { normalizeCefr } from '@/services/lessonHubMapping';
import { toast } from 'sonner';
import { homeworkGuardReason } from '@/lib/homeworkGuard';
import HomeworkGenerationDialog from '@/components/creator-studio/homework/HomeworkGenerationDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlideMediaPanel } from '@/components/creator-studio/shared/SlideMediaPanel';
import { WandFieldButton } from '@/components/creator-studio/shared/WandFieldButton';
import { AIToolsPanel } from '@/components/creator-studio/shared/AIToolsPanel';
import { slideIcon } from '@/components/creator-studio/shared/slideIcons';
import { InsertSlideButton } from '@/components/creator-studio/shared/InsertSlideButton';
import { TeacherNotesField } from '@/components/creator-studio/shared/TeacherNotesField';
import { AssetVaultDialog } from '@/components/creator-studio/shared/AssetVaultDialog';
import { SlideTemplatesDialog } from '@/components/creator-studio/shared/SlideTemplatesDialog';
import { SlideCommentsPanel } from '@/components/creator-studio/shared/SlideCommentsPanel';
import { BulkActionsMenu } from '@/components/creator-studio/shared/BulkActionsMenu';
import { BulkAudioDialog } from '@/components/creator-studio/shared/BulkAudioDialog';
import { findSlidesMissingAudio } from '@/components/creator-studio/shared/slideAudioHelpers';
import { DifficultyTunerDialog } from '@/components/creator-studio/shared/DifficultyTunerDialog';
import { ImportFromTextDialog, IMPORTED_LESSON_STORAGE_KEY } from '@/components/creator-studio/shared/ImportFromTextDialog';
import { PublishTemplateDialog } from '@/components/creator-studio/marketplace/PublishTemplateDialog';
import { useCreatorLesson } from '@/hooks/useCreatorLesson';
import { useAutoSave, useRevisionHistory, type LessonRevision } from '@/hooks/useAutoSaveAndHistory';
import { SaveStatusBadge } from '@/components/creator-studio/shared/SaveStatusBadge';
import { RevisionHistoryModal } from '@/components/creator-studio/shared/RevisionHistoryModal';
import { getLibraryLessonSlides } from '@/services/lessonLibraryService';
import { StorybookEditor } from '@/components/creator-studio/shared/StorybookEditor';
import { MediaAnalyzerModal } from '@/components/creator-studio/shared/MediaAnalyzerModal';
import { mapAIQuizSlides } from '@/components/creator-studio/shared/aiQuizMapper';
import { EMPTY_BLUEPRINT, type LessonBlueprint } from '@/components/creator-studio/shared/LessonBlueprintPanel';
import GenerateLessonModal from '@/components/creator-studio/shared/GenerateLessonModal';
import { GenerationStepStream } from '@/components/creator/GenerationStepStream';
import { QualityPanel } from '@/components/creator-studio/QualityPanel';
import type { CreatorPublishVerdict } from '@/services/contentCreator/publishGateHelper';
import { verdictFromQualityReport } from '@/services/contentCreator/qualityReportAdapter';
import { logRepairOutcome } from '@/qa/telemetry/repairTelemetry';

import { CanvasElementEditor } from '@/components/creator-studio/shared/CanvasElementEditor';
import { ScaffoldedMediaEditor } from '@/components/creator-studio/shared/ScaffoldedMediaEditor';
import { Headphones, Gamepad2, Play } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { PlayAsGameDialog } from '@/components/playground-creator/PlayAsGameDialog';
import { ImmersivePreviewDialog } from '@/components/playground-creator/ImmersivePreviewDialog';
import { MomentsOutline } from '@/components/playground-creator/MomentsOutline';
import { isGenericBaselineAsset } from '@/playground/creator/genericAssetDetector';
import { PlaygroundJsonImporter } from '@/components/playground-creator/PlaygroundJsonImporter';
import { HomeworkSlidesPreview } from '@/components/creator-studio/shared/HomeworkSlidesPreview';
import { HomeworkSlideLivePreview } from '@/components/creator-studio/shared/HomeworkSlideLivePreview';
import type { HomeworkTask } from '@/coherence/types';
import { PlaygroundLessonPlayer } from '@/components/playground-player/PlaygroundLessonPlayer';
import { derivePages } from '@/playground-blueprint/derivePages';
import { PLAYGROUND_UNIT_LESSONS, type PlaygroundLessonNumber } from '@/playground-blueprint/unitTemplate';
import type { PlaygroundUnit } from '@/playground-blueprint/types';

/**
 * Playground Slide Creator
 * ------------------------
 * Authoring tool for the Playground Engine. Lets you build a deck of
 * dynamic slides (multiple choice, true/false, fill, drag, match, draw,
 * intro) with live preview, JSON editing, import/export.
 *
 * Branding: Playground hub — Orange (#FE6A2F) + Yellow (#FEFBDD).
 */

type SlideType = Slide['type'];

type SlidePreset = {
  key: string;
  type: SlideType;
  label: string;
  emoji: string;
  /** Short, kid-voice description shown under the title in the palette. */
  hint?: string;
  group: 'core' | 'phonics' | 'listening' | 'speaking' | 'grammar' | 'story' | 'break' | 'system';
  build?: () => Slide;
};

const SLIDE_TYPES: SlidePreset[] = [
  { key: 'intro', type: 'intro', label: 'Trail Intro', emoji: '👋', hint: 'Open the lesson with a warm welcome.', group: 'core' },
  { key: 'trail_choice', type: 'multiple', label: 'Picture Choice', emoji: '🎯', hint: 'Tap the picture that matches the word.', group: 'core', build: () => makeSlide('multiple') },
  { key: 'trail_drag_match', type: 'match', label: 'Drag Match', emoji: '🧩', hint: 'Drag each word to its picture.', group: 'core', build: () => makeSlide('match') },
  { key: 'trail_word_gap', type: 'fill', label: 'Word Gap', emoji: '🏗️', hint: 'Drop the missing word into the sentence.', group: 'core', build: () => makeSlide('fill') },
  { key: 'trail_memory', type: 'memory', label: 'Memory Pairs', emoji: '🧠', hint: 'Flip cards to find matching pairs.', group: 'core', build: () => makeSlide('memory') },
  { key: 'trail_tap_order', type: 'tap_order', label: 'Tap Order', emoji: '🔢', hint: 'Tap pictures in the right order.', group: 'core', build: () => makeSlide('tap_order') },
  { key: 'trail_sort', type: 'sort', label: 'Sort Buckets', emoji: '🗂️', hint: 'Drag items into the right bucket.', group: 'core', build: () => makeSlide('sort') },
  { key: 'trail_hotspot', type: 'hotspot', label: 'Hotspot Tap', emoji: '👀', hint: 'Find and tap the target on the scene.', group: 'core', build: () => makeSlide('hotspot') },
  { key: 'draw', type: 'draw', label: 'Drawing', emoji: '🎨', hint: 'Draw or trace on a blank canvas.', group: 'core' },
  { key: 'vocab_grid', type: 'vocab_grid' as SlideType, label: 'Vocab Grid', emoji: '✨', hint: 'Show 4–6 vocab cards with audio.', group: 'core', build: () => makeSlide('vocab_grid' as SlideType) },

  { key: 'missing_letter', type: 'missing_letter', label: 'Missing Letter', emoji: '🔎', hint: 'Pick the letter that completes the word.', group: 'phonics', build: () => makeSlide('missing_letter' as SlideType) },
  { key: 'cvc_builder', type: 'word_builder', label: 'CVC Builder', emoji: '🔤', hint: 'Build a 3-letter word from sounds.', group: 'phonics', build: () => makeSlide('word_builder') },
  { key: 'blend_builder', type: 'sound_blend', label: 'Sound Blending', emoji: '🔊', hint: 'Blend two sounds to read a word.', group: 'phonics', build: () => makeSlide('sound_blend') },
  { key: 'phonics_hunt', type: 'phonics_hunt', label: 'Phonics Hunt', emoji: '👂', hint: 'Hear the sound, tap the matching word.', group: 'phonics', build: () => makeSlide('phonics_hunt' as SlideType) },
  { key: 'trace_letter', type: 'trace', label: 'Trace Letter', emoji: '✍️', hint: 'Trace the letter with your finger.', group: 'phonics', build: () => ({ type: 'trace', instruction: 'Trace the letter A', letter: 'a', word: 'apple', phoneme: '/æ/', image_url: 'apple', voice: { text: 'Trace the letter A', autoPlay: true } } as Slide) },
  { key: 'phonics_focus', type: 'phonics_focus', label: 'Sound Card', emoji: '🔊', hint: 'Big card focused on one sound.', group: 'phonics' },

  { key: 'listen_and_match', type: 'match', label: 'Listen & Match', emoji: '🎧', hint: 'Listen to Pip, drag the matching word.', group: 'listening', build: () => ({ type: 'match', instruction: 'Listen, then drag the matching word', pairs: [{ word: 'DOG', image_url: 'dog' }, { word: 'CAT', image_url: 'cat' }], voice: { text: 'Listen carefully', autoPlay: true } }) },
  { key: 'media_player', type: 'media_player', label: 'Listening', emoji: '🎬', hint: 'Play a short clip or song.', group: 'listening' },
  { key: 'scaffolded_media', type: 'scaffolded_media', label: 'Media Checkpoint', emoji: '✅', hint: 'Watch + quick comprehension check.', group: 'listening' },

  { key: 'echo_repetition', type: 'vocab_solo', label: 'Echo Repeat', emoji: '🦜', hint: 'Hear Pip, then repeat after him.', group: 'speaking', build: () => ({ type: 'vocab_solo', word: 'HELLO', definition: 'Listen, then say it back.', voice: { text: 'Hello! Now you say it.', autoPlay: true } } as Slide) },
  { key: 'speaking_mission', type: 'intro', label: 'Speaking Mission', emoji: '🎤', hint: 'Frame a short say-it-out-loud task.', group: 'speaking', build: () => ({ type: 'intro', title: '🎤 Speaking Mission', text: 'Say it out loud!', voice: { text: 'Your turn to speak!', autoPlay: true } }) },

  { key: 'sentence_builder', type: 'fill', label: 'Sentence Builder', emoji: '🧱', hint: 'Pick the right word to complete it.', group: 'grammar', build: () => ({ type: 'fill', text: 'She ____ happy.', answer: 'is', options: ['is', 'are', 'am'], voice: { text: 'Build the sentence', autoPlay: true } }) },
  { key: 'grammar_sort', type: 'sort', label: 'Grammar Sort', emoji: '🗂️', hint: 'Sort words into grammar buckets.', group: 'grammar', build: () => makeSlide('sort') },
  { key: 'make_a_sentence', type: 'tap_order', label: 'Make a Sentence', emoji: '✏️', hint: 'Tap the words in order to build a sentence.', group: 'grammar', build: () => ({ type: 'tap_order', instruction: '✏️ Make a sentence — tap the words in order!', words: ['I', 'like', 'apples'], answer: ['I', 'like', 'apples'], voice: { text: 'Tap the words in the right order to make a sentence.', autoPlay: true } } as unknown as Slide) },

  { key: 'storybook', type: 'storybook', label: 'Storybook', emoji: '📖', hint: 'Multi-scene story with tap interactions.', group: 'story' },
  { key: 'mini_story', type: 'storybook', label: 'Mini Story', emoji: '🎞️', hint: 'Short 2–3 scene story slice.', group: 'story', build: () => makeSlide('storybook') },
  { key: 'canvas_game', type: 'canvas_game', label: 'Canvas Game', emoji: '🎯', hint: 'Free-placement interactive scene.', group: 'story' },
  { key: 'living_canvas', type: 'living_canvas', label: 'Click Reveal', emoji: '✨', hint: 'Tap hotspots to reveal vocab.', group: 'story' },

  { key: 'lesson_summary', type: 'lesson_summary', label: 'Lesson Summary', emoji: '🏆', hint: 'Celebrate stars + words learned.', group: 'system' },

  // ---------- Brain Break · cool-down mini-games ----------
  { key: 'break_puzzle', type: 'memory', label: 'Picture Puzzle', emoji: '🧩', hint: 'Quick memory pairs — reset focus.', group: 'break', build: () => ({ ...(makeSlide('memory') as any), instruction: '🧩 Brain break — find the pairs!', voice: { text: 'Brain break! Find the matching pairs.', autoPlay: true } } as Slide) },
  { key: 'break_maze', type: 'tap_order', label: 'Maze Path', emoji: '🌀', hint: 'Tap stops in the right order to reach the goal.', group: 'break', build: () => ({ ...(makeSlide('tap_order') as any), instruction: '🌀 Follow the maze — tap in order!', voice: { text: 'Tap the path from start to goal!', autoPlay: true } } as Slide) },
  { key: 'break_trace', type: 'trace', label: 'Trace & Relax', emoji: '✍️', hint: 'Calm tracing game — no scoring pressure.', group: 'break', build: () => ({ type: 'trace', instruction: '✍️ Take a breath and trace!', letter: 's', word: 'star', phoneme: '/s/', image_url: 'star', voice: { text: 'Trace slowly. You got this!', autoPlay: true } } as Slide) },
  { key: 'break_phonics_pop', type: 'phonics_hunt', label: 'Sound Pop', emoji: '🎈', hint: 'Hear the sound, pop the matching balloon.', group: 'break', build: () => ({ ...(makeSlide('phonics_hunt' as SlideType) as any), instruction: '🎈 Pop the sound!', voice: { text: 'Pop the balloons with the matching sound!', autoPlay: true } } as Slide) },
  { key: 'break_draw', type: 'draw', label: 'Doodle Break', emoji: '🎨', hint: 'Free drawing — pure brain rest.', group: 'break', build: () => ({ type: 'draw', prompt: '🎨 Doodle anything you like!', voice: { text: 'Take a break and draw!', autoPlay: true } } as Slide) },
];

const GROUP_LABELS: Record<SlidePreset['group'], string> = {
  core: 'Core',
  phonics: 'Phonics & Trace',
  listening: 'Listening',
  speaking: 'Speaking',
  grammar: 'Grammar',
  story: 'Story & Canvas',
  break: 'Brain Break',
  system: 'System',
};

function makeSlide(type: SlideType): Slide {
  switch (type) {
    case 'intro':
      return { type: 'intro', title: '👋 Hello!', text: 'Welcome to the lesson', voice: { text: 'Hello!', autoPlay: true } };
    case 'multiple':
      return { type: 'multiple', question: 'What is this? 🐶', image_url: 'dog', options: ['dog', 'cat', 'apple'], option_images: ['dog', 'cat', 'apple'], answer: 'dog', voice: { text: 'dog', autoPlay: false } } as Slide;
    case 'truefalse':
      return { type: 'truefalse', statement: 'This is a cat 🐱', answer: true, voice: { text: 'True or false?', autoPlay: true } };
    case 'fill':
      return { type: 'fill', text: 'I see a ____', answer: 'cat', options: ['cat', 'dog', 'sun'], image_url: 'cat', voice: { text: 'I see a cat', autoPlay: true } } as Slide;
    case 'drag':
      return {
        type: 'drag',
        instruction: 'Drag each word onto the right picture',
        pairs: [
          { word: 'APPLE', image_url: 'apple' },
          { word: 'DOG', image_url: 'dog' },
          { word: 'SUN', image_url: 'sun' },
          { word: 'FISH', image_url: 'fish' },
        ],
        voice: { text: 'Drag each word onto the picture', autoPlay: true },
      } as Slide;
    case 'match':
      return {
        type: 'match',
        instruction: 'Tap a word, then tap its picture',
        pairs: [
          { word: 'DOG', image_url: 'dog' },
          { word: 'CAT', image_url: 'cat' },
          { word: 'SUN', image_url: 'sun' },
          { word: 'BALL', image_url: 'ball' },
        ],
        voice: { text: 'Match them!', autoPlay: true },
      };
    case 'memory':
      return { type: 'memory', instruction: 'Find the matching pairs!', emoji: '🧠', pairs: [{ id: 'cat', label: 'cat', emoji: '🐱' }, { id: 'dog', label: 'dog', emoji: '🐶' }, { id: 'sun', label: 'sun', emoji: '☀️' }], voice: { text: 'Find the matching pairs', autoPlay: true } } as Slide;
    case 'tap_order':
      return { type: 'tap_order', instruction: 'Tap 1 to 5 in order!', emoji: '🔢', items: [{ label: '1', emoji: '1️⃣' }, { label: '2', emoji: '2️⃣' }, { label: '3', emoji: '3️⃣' }, { label: '4', emoji: '4️⃣' }, { label: '5', emoji: '5️⃣' }], voice: { text: 'Tap in order', autoPlay: true } } as Slide;
    case 'hotspot':
      return { type: 'hotspot', instruction: 'Tap each body part!', emoji: '👀', parts: [{ label: 'nose', emoji: '👃' }, { label: 'ear', emoji: '👂' }, { label: 'hand', emoji: '✋' }], prompts: ['nose', 'ear', 'hand'], voice: { text: 'Tap each one', autoPlay: true } } as Slide;
    case 'thumbs':
      return { type: 'thumbs', instruction: 'Do you like it?', emoji: '👍', items: [{ label: 'ice cream', emoji: '🍦', correct: 'like' }, { label: 'spider', emoji: '🕷️', correct: 'dislike' }, { label: 'cake', emoji: '🍰', correct: 'like' }], voice: { text: 'Do you like it?', autoPlay: true } } as Slide;
    case 'sort':
      return { type: 'sort', instruction: 'Sort the animals!', emoji: '🗂️', buckets: [{ id: 'farm', label: 'Farm', emoji: '🚜' }, { id: 'jungle', label: 'Jungle', emoji: '🌴' }], items: [{ label: 'cow', emoji: '🐄', bucket: 'farm' }, { label: 'pig', emoji: '🐷', bucket: 'farm' }, { label: 'tiger', emoji: '🐯', bucket: 'jungle' }], voice: { text: 'Sort them out', autoPlay: true } } as Slide;
    case 'word_builder':
      return { type: 'word_builder', instruction: 'Build the word!', emoji: '🔤', word: 'cat', image_url: '/playground/placeholder-dropzone.svg', extras: ['s', 'o'], show_sounds: true, voice: { text: 'Build cat', autoPlay: true } } as Slide;
    case 'sound_blend':
      return { type: 'sound_blend', instruction: 'Tap each sound, then blend!', emoji: '🔊', word: 'cat', sounds: ['c', 'a', 't'], image_url: '/playground/placeholder-dropzone.svg', voice: { text: 'c a t, cat', autoPlay: true } } as Slide;
    case 'missing_letter':
      return { type: 'missing_letter', instruction: 'What letter is missing?', emoji: '🔎', word: 'cat', image_url: 'cat', missing_letter: 'a', missing_position: 1, voice: { text: 'What letter is missing in cat?', autoPlay: true } } as Slide;
    case 'phonics_hunt':
      return { type: 'phonics_hunt', instruction: 'Find words that start with C', emoji: '👂', letter: 'c', items: [{ word: 'cat', image_url: 'cat', has_letter: true }, { word: 'cake', image_url: 'cake', has_letter: true }, { word: 'dog', image_url: 'dog', has_letter: false }], voice: { text: 'Find words that start with c', autoPlay: true } } as Slide;
    case 'trace':
      return { type: 'trace', instruction: 'Trace the letter C', emoji: '✍️', letter: 'c', word: 'cat', phoneme: '/k/', image_url: '/playground/placeholder-dropzone.svg', voice: { text: 'Trace c', autoPlay: true } } as Slide;
    case 'draw':
      return { type: 'draw', prompt: 'Draw your favourite animal!', voice: { text: 'Draw something!', autoPlay: true } };
    case 'vocab_solo':
      return { type: 'vocab_solo', word: 'APPLE', definition: 'A round red or green fruit.', image_url: '', audio_url: '', voice: { text: 'apple', autoPlay: false } } as Slide;
    case 'vocab_grid' as SlideType:
      return {
        type: 'vocab_grid',
        instruction: 'New Words',
        shape: 'circle',
        cards: [
          { word: 'DOG', definition: 'A friendly pet', image_url: 'dog' },
          { word: 'CAT', definition: 'A soft furry pet', image_url: 'cat' },
          { word: 'APPLE', definition: 'A red or green fruit', image_url: 'apple' },
          { word: 'SUN', definition: 'It shines in the sky', image_url: 'sun' },
          { word: 'BALL', definition: 'You can throw it', image_url: 'ball' },
          { word: 'FISH', definition: 'Swims in water', image_url: 'fish' },
        ],
        voice: { text: 'Look at the new words', autoPlay: true },
      } as unknown as Slide;
    case 'phonics_focus':
      return { type: 'phonics_focus', phoneme: '/æ/', grapheme: 'a', sound_ipa: '/æ/', label: 'Listen to the sound', example_words: ['CAT', 'BAT', 'HAT'], phonics_items: [
        { word: 'CAT', image_url: '', audio_url: '', spoken_text: '' },
        { word: 'BAT', image_url: '', audio_url: '', spoken_text: '' },
        { word: 'HAT', image_url: '', audio_url: '', spoken_text: '' },
      ], audio_url: '', voice: { text: 'a', autoPlay: true } } as unknown as Slide;
    case 'lesson_summary':
      return { type: 'lesson_summary', title: 'Level Complete!', vocab_recap: [], takeaway: 'You did amazing!', voice: { text: 'Great job! Level complete!', autoPlay: true } };
    case 'storybook':
      return { type: 'storybook', title: 'New Story', topic: '', pages: [{ page_number: 1, text: 'Once upon a time…', image_url: '', audio_url: '' }], voice: { text: 'Story time!', autoPlay: false } };
    case 'media_player':
      return { type: 'media_player', title: 'Listening Exercise', media_url: '', media_kind: 'youtube', transcript: '' };
    case 'canvas_game':
      return {
        type: 'canvas_game',
        title: 'Sort the Fruit',
        instruction: 'Drag the fruit into the basket!',
        instruction_audio: 'Drag the fruit into the basket!',
        elements: [
          { id: 'basket', type: 'shape', x: 70, y: 35, width: 18, z_index: 1, interaction: 'target', color: '#a7f3d0', text: 'BASKET' } as any,
          { id: 'apple', type: 'text', text: '🍎', x: 15, y: 80, width: 12, z_index: 3, interaction: 'draggable', target_x: 70, target_y: 35, snap_tolerance: 12, success_sfx: 'Yum!' } as any,
          { id: 'banana', type: 'text', text: '🍌', x: 35, y: 80, width: 12, z_index: 3, interaction: 'draggable', target_x: 70, target_y: 35, snap_tolerance: 12, success_sfx: 'Tasty!' } as any,
        ],
        voice: { text: 'Drag the fruit into the basket!', autoPlay: true },
      } as Slide;
    case 'living_canvas':
      return {
        type: 'living_canvas',
        title: 'Find the Sun',
        instruction: 'Tap the cloud to find the sun!',
        instruction_audio: 'Tap the cloud to find the sun!',
        elements: [
          { id: 'sun', type: 'text', text: '🌞', x: 50, y: 40, width: 18, z_index: 1, interaction: 'none', color: 'transparent' } as any,
          { id: 'cloud', type: 'text', text: '☁️', x: 50, y: 40, width: 22, z_index: 5, interaction: 'reveal', reveal_anim: 'fly', reveal_sfx: 'The sun is shining!' } as any,
        ],
        voice: { text: 'Tap the cloud!', autoPlay: true },
      } as Slide;
    case 'scaffolded_media':
      return {
        type: 'scaffolded_media',
        title: 'Listening Checkpoint',
        media_url: '',
        media_kind: 'youtube',
        segments: [
          { start_time: 0, end_time: 30, question: { prompt: 'What did the speaker say?', options: ['Option A', 'Option B', 'Option C'], answer: 'Option A' } },
        ],
        voice: { text: 'Listen carefully!', autoPlay: false },
      } as Slide;
  }
}

function slideTitle(slide: Slide): string {
  switch (slide.type) {
    case 'intro': return slide.title;
    case 'multiple': return slide.question;
    case 'truefalse': return slide.statement;
    case 'fill': return slide.text;
    case 'drag': return slide.instruction;
    case 'match': return slide.instruction;
    case 'memory': return slide.instruction || 'Trail Memory';
    case 'tap_order': return slide.instruction || 'Tap Order';
    case 'hotspot': return slide.instruction || 'Hotspot Tap';
    case 'thumbs': return slide.instruction || 'Thumbs Game';
    case 'sort': return slide.instruction || 'Sort Buckets';
    case 'word_builder': return slide.instruction || `Build ${slide.word}`;
    case 'sound_blend': return slide.instruction || `Blend ${slide.word}`;
    case 'trace': return slide.instruction || `Trace ${slide.word || slide.letter}`;
    case 'missing_letter': return (slide as any).instruction || `Missing letter: ${(slide as any).word}`;
    case 'phonics_hunt': return (slide as any).instruction || `Phonics hunt: ${(slide as any).letter}`;
    case 'draw': return slide.prompt;
    case 'storybook': return slide.title || 'Storybook';
    case 'media_player': return slide.title || 'Listening Exercise';
    case 'canvas_game': return slide.title || 'Canvas Game';
    case 'living_canvas': return slide.title || 'Click-to-Reveal';
    case 'scaffolded_media': return slide.title || 'Scaffolded Media';
    case 'lesson_summary': return slide.title || 'Lesson Summary';
  }
}

const STARTER: Slide[] = [
  { type: 'intro', title: '👋 Hello, friend!', text: "Let's play and learn!", voice: { text: "Let's play!", autoPlay: true } },
];

function createDefaultPreviewUnit(topic = 'Seed unit (edit me)'): PlaygroundUnit {
  const lessons = PLAYGROUND_UNIT_LESSONS.map((tpl) => {
    const lesson = {
      lesson_number: tpl.lesson_number as PlaygroundLessonNumber,
      vocab: tpl.lesson_number === 1
        ? ['cat', 'dog', 'cow', 'pig', 'duck', 'hen']
        : tpl.lesson_number === 2 ? ['red', 'blue', 'green']
        : tpl.lesson_number === 3 ? ['big', 'small', 'tiny']
        : undefined,
      phonic: tpl.lesson_number <= 3
        ? {
            letter: ['a', 'b', 'c'][tpl.lesson_number - 1],
            sound: '/' + ['æ', 'b', 'k'][tpl.lesson_number - 1] + '/',
            words: [['apple', 'ant', 'axe'], ['bat', 'ball', 'bus'], ['cat', 'cow', 'car']][tpl.lesson_number - 1],
          }
        : undefined,
    };
    return { ...lesson, pages: derivePages(lesson) };
  });

  return {
    unit_topic: topic,
    lessons,
    vocab_pool: lessons.flatMap((lesson) => lesson.vocab ?? []),
    phonics_pool: lessons.flatMap((lesson) => lesson.phonic ? [lesson.phonic] : []),
  };
}

import { useForceEnglishLocale } from '@/hooks/useForceEnglishLocale';
import CreatorShellV2 from './playground-creator/CreatorShell';


export default function PlaygroundCreator() {
  useForceEnglishLocale();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLessonId = searchParams.get('lessonId');
  const [shellUnit, setShellUnit] = useState<PlaygroundUnit>(() => createDefaultPreviewUnit(searchParams.get('topic') || undefined));

  // CreatorShell V2 is now the DEFAULT — slim topbar (Back · AI Lesson · AI Unit ·
  // View Code · Save · Publish), 7-lesson rail with page count chips, and per-page
  // inspector tabs (Content · Media · Activity · Homework). The legacy Academy-parity
  // editor with the Lesson-Slides palette and Moments/Scenes outline is still
  // reachable via `?editor=v1` for power users.
  if (searchParams.get('editor') !== 'v1') {
    const autogen = searchParams.get('autogen');
    const currentCefr = searchParams.get('cefr') ?? 'Pre-A1';
    const prefill = {
      lessonId: initialLessonId ?? undefined,
      unitId: searchParams.get('unitId') ?? undefined,
      topic: searchParams.get('topic') ?? undefined,
      cefr: currentCefr,
      autoGenerate: autogen === 'unit' || autogen === 'lesson' ? (autogen as 'unit' | 'lesson') : undefined,
    };
    const PG_CEFR_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1'] as const;
    const setCefr = (next: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('cefr', next);
      setSearchParams(params, { replace: true });
    };
    return (
      <div className="relative min-h-screen">
        {/* CEFR toggle — Playground floor Pre-A1, ceiling B1. Persists via URL. */}
        <div className="pointer-events-auto fixed left-4 top-16 z-40 flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-lg ring-1 ring-orange-200 backdrop-blur">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-orange-700">Level</span>
          {PG_CEFR_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setCefr(lvl)}
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                currentCefr === lvl
                  ? 'bg-[#FE6A2F] text-white shadow'
                  : 'text-[#3a1d0a] hover:bg-orange-100'
              }`}
              aria-pressed={currentCefr === lvl}
              aria-label={`Set level ${lvl}`}
            >
              {lvl}
            </button>
          ))}
        </div>
        <CreatorShellV2 initialUnit={shellUnit} onUnitChange={setShellUnit} prefill={prefill} />
      </div>
    );
  }




  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/content-creator');
  };

  const [slides, setSlides] = useState<Slide[]>(STARTER);
  const [bulkImagesBusy, setBulkImagesBusy] = useState(false);

  const generateAllImages = async () => {
    // Collect every slide that has a subject (word/letter/instruction) but no real image_url.
    type Job = { slideIdx: number; subject: string; path: string };
    const jobs: Job[] = [];
    const needsGen = (u?: string) => !u || u.trim() === '' || u.startsWith('/playground/placeholder');
    slides.forEach((s: any, idx) => {
      const subj = s.word || s.letter || s.instruction || s.title;
      if (subj && needsGen(s.image_url)) jobs.push({ slideIdx: idx, subject: String(subj), path: 'image_url' });
      if (Array.isArray(s.pairs)) s.pairs.forEach((p: any, i: number) => {
        if (p?.word && needsGen(p.image_url)) jobs.push({ slideIdx: idx, subject: p.word, path: `pairs.${i}.image_url` });
      });
      if (Array.isArray(s.items) && s.type !== 'sentence_builder') s.items.forEach((it: any, i: number) => {
        if (it?.word && needsGen(it.image_url)) jobs.push({ slideIdx: idx, subject: it.word, path: `items.${i}.image_url` });
      });
      if (Array.isArray(s.options) && Array.isArray(s.option_images)) s.options.forEach((o: string, i: number) => {
        if (o && needsGen(s.option_images[i])) jobs.push({ slideIdx: idx, subject: o, path: `option_images.${i}` });
      });
    });
    if (jobs.length === 0) { toast.info('All slides already have images ✨'); return; }
    setBulkImagesBusy(true);
    toast.info(`🎨 Generating ${jobs.length} image${jobs.length === 1 ? '' : 's'}…`);
    try {
      const results = await generatePlaygroundImages(jobs.map((j) => j.subject));
      const bySubject = new Map(results.map((r) => [r.subject.toLowerCase(), r.url]));
      setSlides((prev) => prev.map((s, idx) => {
        const mine = jobs.filter((j) => j.slideIdx === idx);
        if (mine.length === 0) return s;
        const next: any = { ...s };
        for (const j of mine) {
          const url = bySubject.get(j.subject.toLowerCase());
          if (!url) continue;
          const parts = j.path.split('.');
          if (parts.length === 1) { next[parts[0]] = url; continue; }
          if (parts[0] === 'pairs') {
            next.pairs = [...(next.pairs || [])];
            next.pairs[Number(parts[1])] = { ...next.pairs[Number(parts[1])], image_url: url };
          } else if (parts[0] === 'items') {
            next.items = [...(next.items || [])];
            next.items[Number(parts[1])] = { ...next.items[Number(parts[1])], image_url: url };
          } else if (parts[0] === 'option_images') {
            next.option_images = [...(next.option_images || [])];
            next.option_images[Number(parts[1])] = url;
          }
        }
        return next as Slide;
      }));
      toast.success(`✅ Generated ${results.length} image${results.length === 1 ? '' : 's'}`);
    } catch (e: any) {
      toast.error(e?.message || 'Bulk image generation failed');
    } finally {
      setBulkImagesBusy(false);
    }
  };

  const [title, setTitle] = useState<string>('Untitled Playground Lesson');
  const [selected, setSelected] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [bulkAudioOpen, setBulkAudioOpen] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [publishTemplateOpen, setPublishTemplateOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [playGameOpen, setPlayGameOpen] = useState(false);
  const [immersivePreviewOpen, setImmersivePreviewOpen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [homeworkOpen, setHomeworkOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<{ task: HomeworkTask; index: number } | null>(null);
  const [aiTopic, setAiTopic] = useState('Animals');
  // Playground floor is Pre-A1. Default the creator to Pre-A1 so students
  // aged 4–5 (non-readers) don't get silently upgraded to A1 content.
  const [aiLevel, setAiLevel] = useState('Pre-A1');
  const [aiBusy, setAiBusy] = useState(false);
  const [genSteps, setGenSteps] = useState<import('@/components/creator/GenerationStepStream').GenerationStep[]>([]);
  const [genOpen, setGenOpen] = useState(false);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [blueprint, setBlueprint] = useState<LessonBlueprint | null>(null);
  const [playgroundUnit, setPlaygroundUnit] = useState<import('@/playground-blueprint/types').PlaygroundUnit | null>(null);
  const [previewLessonNumber, setPreviewLessonNumber] = useState<import('@/playground-blueprint/unitTemplate').PlaygroundLessonNumber>(1);

  // ── Hydrate from Curriculum Blueprint hand-off (router state) ────
  // When the teacher clicks "Build Slides" inside the Master Blueprint,
  // we ship the planned vocab/grammar/phonics here via location.state.
  const location = useLocation();
  useEffect(() => {
    const st: any = location.state;
    if (!st || !st.fromBlueprint) return;
    if (st.lessonTitle) {
      setTitle(st.lessonTitle);
      setAiTopic(st.lessonTitle);
    }
    if (st.cefrLevel) {
      // Canonicalise — .toUpperCase() would turn "Pre-A1" into "PRE-A1",
      // which no downstream matcher (HUB_CEFR_RANGE, prea1Directive, planner)
      // recognises, silently degrading Pre-A1 lessons to A1.
      const canonical = normalizeCefr(String(st.cefrLevel));
      if (canonical) setAiLevel(canonical);
    }
    if (st.blueprint) {
      const bp = st.blueprint as any;
      setBlueprint({
        vocabulary: Array.isArray(bp.vocabulary) ? bp.vocabulary.slice(0, 5) : ['', '', '', '', ''],
        grammar: bp.grammar || st.skill_focus || '',
        rationale: bp.rationale,
        target_phonics: typeof bp.target_phonics === 'string' ? bp.target_phonics : bp.target_phonics?.focus || '',
        interests: '',
        specific_needs: '',
      } as LessonBlueprint);
    } else if (st.skill_focus) {
      setBlueprint({ ...EMPTY_BLUEPRINT, grammar: st.skill_focus });
    }
    toast.success('📋 Blueprint loaded — ready to generate slides');
    if (st.autoOpen) setAiOpen(true);
    // Clear state so a refresh doesn't re-hydrate
    navigate(location.pathname + location.search, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Insert quiz slides directly after the current slide (before any trailing lesson_summary).
  const insertAfterCurrent = (extra: Slide[]) => {
    setSlides((prev) => {
      const at = Math.min(selected + 1, prev.length);
      const next = [...prev.slice(0, at), ...extra, ...prev.slice(at)];
      return next;
    });
  };

  const lessonHook = useCreatorLesson({ hub: 'playground', initialLessonId });

  // Hydrate from DB when an existing lesson is loaded.
  useEffect(() => {
    const lesson = lessonHook.lesson;
    if (!lesson) return;
    // Hub-mismatch redirect: if this lesson was authored for a different hub,
    // bounce to its native creator so Pre-A1 / visual logic stays correct.
    const detected = detectLessonHub(lesson);
    if (detected && detected !== 'playground') {
      navigate(`${creatorPathFor(detected)}?lessonId=${lesson.id}`, { replace: true });
      return;
    }
    const dbSlides = getLibraryLessonSlides(lesson) as Slide[];
    setSlides(dbSlides.map((s) => normalizePlaygroundSlide(s)));
    setSelected(0);
    if (lesson.title) {
      setTitle(lesson.title);
      setAiTopic(lesson.title);
    }
    setAiLevel(deriveCefrLevel(lesson, 'playground'));
    const meta: any = (lesson as any).ai_metadata;
    if (meta?.lesson_blueprint) setBlueprint(meta.lesson_blueprint as LessonBlueprint);
    // Hydrate AI-generated PlaygroundUnit if present.
    const persistedUnit = (lesson as any)?.content?.playground_unit;
    if (persistedUnit && Array.isArray(persistedUnit.lessons)) {
      setPlaygroundUnit(persistedUnit);
    } else {
      setPlaygroundUnit(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonHook.lesson?.id]);

  // Keep ?lessonId= in sync when we create a new draft.
  useEffect(() => {
    if (lessonHook.lessonId && searchParams.get('lessonId') !== lessonHook.lessonId) {
      const next = new URLSearchParams(searchParams);
      next.set('lessonId', lessonHook.lessonId);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonHook.lessonId]);

  // Inject AI-imported lesson (from ImportFromTextDialog on the dashboard)
  useEffect(() => {
    if (searchParams.get('imported') !== '1') return;
    try {
      const raw = sessionStorage.getItem(IMPORTED_LESSON_STORAGE_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (payload.hub && payload.hub !== 'playground') return;
      if (Array.isArray(payload.slides) && payload.slides.length > 0) {
        setSlides(payload.slides.map((s: any) => normalizePlaygroundSlide(s)));
        setSelected(0);
        if (payload.title) setTitle(payload.title);
        toast.success(`Loaded ${payload.slides.length} imported slides`);
      }
      sessionStorage.removeItem(IMPORTED_LESSON_STORAGE_KEY);
      const next = new URLSearchParams(searchParams);
      next.delete('imported');
      setSearchParams(next, { replace: true });
    } catch (e) {
      console.error('Failed to inject imported lesson', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeIndex = slides.length === 0 ? 0 : Math.min(Math.max(selected, 0), slides.length - 1);
  const current = slides[safeIndex] ?? { type: 'intro', title: '', content: '' } as any;
  const slideId = `slide-${safeIndex}`;

  const generateWithAI = async (payload: import('@/components/creator-studio/shared/GenerateLessonModal').GenerateLessonPayload) => {
    const topic = payload.topic.trim();
    if (!topic) return;
    setAiBusy(true);

    // ── Live step timeline (Academy-style) ──────────────────────────
    type GS = import('@/components/creator/GenerationStepStream').GenerationStep;
    const initial: GS[] = [
      { id: 'bind',    label: 'Binding curriculum bucket', status: 'pending' },
      { id: 'lexicon', label: 'Locking topic lexicon',     status: 'pending' },
      { id: 'plan',    label: 'Planning 7-lesson arc',     status: 'pending' },
      { id: 'brain',   label: 'Calling Playground brain (Gemini)', status: 'pending' },
      { id: 'parse',   label: 'Parsing AI unit payload',   status: 'pending' },
      { id: 'build',   label: 'Building locked template',  status: 'pending' },
      { id: 'validate',label: 'Validating CEFR + lexicon', status: 'pending' },
      { id: 'ready',   label: 'Unit ready ✨',              status: 'pending' },
    ];
    setGenSteps(initial);
    setGenOpen(true);
    const mark = (id: string, patch: Partial<GS>) =>
      setGenSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    try {
      mark('bind', { status: 'active' });

      const interests = payload.interests?.trim() || blueprint?.interests?.trim();
      const specific_needs = payload.specific_needs?.trim() || blueprint?.specific_needs?.trim();

      // Hydrate sidebar immediately with the validated blueprint
      const hydrated: LessonBlueprint = {
        ...(blueprint ?? EMPTY_BLUEPRINT),
        vocabulary: payload.vocabulary,
        grammar: payload.grammar,
        target_phonics: payload.target_phonics,
        interests,
        specific_needs,
        language_variant: payload.language_variant,
        visual_theme: payload.visual_theme,
        learning_objective: payload.learning_objective,
        final_output_task: payload.final_output_task,
      };
      setBlueprint(hydrated);
      setAiTopic(topic);
      setAiLevel(payload.level);
      setTitle(topic);

      const { data: prevRows } = await supabase
        .from('curriculum_lessons').select('title')
        .order('created_at', { ascending: false }).limit(5);
      const previous_topics = (prevRows || []).map((r: any) => r.title).filter(Boolean);

      // ── Expert Curriculum Architect (optional pre-pass) ─────────────
      const { runCreatorArchitect, applyArchitectOverridesToPayload } = await import('@/architect/bridge');
      const { overrides: architectOverrides } = await runCreatorArchitect('playground', payload.level, {
        topic,
        vocabulary: payload.vocabulary,
        grammar: payload.grammar,
        learning_objective: payload.learning_objective,
        final_output_task: payload.final_output_task,
        interests,
        specific_needs,
        visual_theme: payload.visual_theme,
      });
      if (architectOverrides) toast.message('Architect pre-pass applied ✨');

      const basePayload = {
        lesson_title: topic,
        objective: payload.learning_objective || `Fun interactive Playground lesson about ${topic}. Target vocabulary: ${payload.vocabulary.join(', ')}. Target grammar: ${payload.grammar}.`,
        skill_focus: 'Vocabulary',
        cefr_level: payload.level,
        hub: 'playground',
        target_hub: 'playground',
        hub_type: 'playground',
        target_vocabulary: payload.vocabulary,
        grammar_focus: payload.grammar,
        target_phonics: payload.target_phonics,
        interests,
        specific_needs,
        previous_topics,
        language_variant: payload.language_variant,
        visual_theme: payload.visual_theme,
        learning_objective: payload.learning_objective,
        final_output_task: payload.final_output_task,
        blueprint: {
          lesson_title: topic,
          target_vocabulary: payload.vocabulary,
          grammar_focus: payload.grammar,
          target_phonics: payload.target_phonics,
          target_hub: 'playground',
          interests,
          specific_needs,
          language_variant: payload.language_variant,
          visual_theme: payload.visual_theme,
          learning_objective: payload.learning_objective,
          final_output_task: payload.final_output_task,
        },
        starring_character: payload.starring_character,
      };

      mark('bind', {
        status: 'done',
        detail: `${payload.level} · ${topic}`,
        payload: {
          cefr: payload.level,
          topic,
          grammar_focus: payload.grammar,
          vocab_focus: payload.vocabulary,
          communication_goal: payload.learning_objective || payload.final_output_task,
        },
      });
      mark('lexicon', { status: 'active' });
      mark('lexicon', { status: 'done', detail: 'topic lexicon contract sent to brain' });
      mark('plan', { status: 'active' });
      mark('plan', { status: 'done', detail: 'L1–L7 contract locked' });
      mark('brain', { status: 'active' });

      // ── New blueprint pipeline: generate-playground emits PlaygroundUnitContent ──
      const { data, error } = await supabase.functions.invoke('generate-playground', {
        body: {
          topic,
          cefr: payload.level,
          lesson_kind: 'discovery',
          // Top-level curriculum binding — hub-brain surfaces these as MUST-teach lines.
          grammar_focus: payload.grammar ? (Array.isArray(payload.grammar) ? payload.grammar : [payload.grammar]) : undefined,
          vocab_focus: Array.isArray(payload.vocabulary) && payload.vocabulary.length ? payload.vocabulary : undefined,
          communication_goal: payload.learning_objective || payload.final_output_task,
          learner_profile: {
            interests,
            specific_needs,
            target_vocabulary: payload.vocabulary,
            target_phonics: payload.target_phonics,
            grammar_focus: payload.grammar,
            visual_theme: payload.visual_theme,
            learning_objective: payload.learning_objective,
            final_output_task: payload.final_output_task,
            starring_character: payload.starring_character,
            language_variant: payload.language_variant,
          },
        },
      });
      if (error || data?.error) {
        mark('brain', { status: 'error', detail: 'AI call failed' });
        const { extractEdgeError } = await import('@/lib/extractEdgeError');
        throw new Error(await extractEdgeError({ error, data, fallback: 'AI generation failed' }));
      }
      mark('brain', { status: 'done', detail: 'Gemini returned JSON' });
      mark('parse', { status: 'active' });
      let unitContent = data?.lesson as import('@/playground-blueprint/types').PlaygroundUnitContent | undefined;
      if (typeof unitContent === 'string') {
        try { unitContent = JSON.parse(unitContent); } catch { /* fall through */ }
      }
      // Recursively walk the payload to find the first object with a `lessons` array.
      const findUnit = (node: any, depth = 0): any => {
        if (!node || typeof node !== 'object' || depth > 6) return null;
        if (Array.isArray(node.lessons)) return node;
        for (const v of Object.values(node)) {
          const hit = findUnit(v, depth + 1);
          if (hit) return hit;
        }
        return null;
      };
      const found = findUnit(unitContent) || findUnit(data);
      if (found) unitContent = found;

      if (!unitContent || !Array.isArray((unitContent as any).lessons)) {
        mark('parse', { status: 'error', detail: 'no lessons[] found' });
        const dump = (() => { try { return JSON.stringify(data?.lesson).slice(0, 400); } catch { return String(data?.lesson); } })();
        console.error('[PlaygroundCreator] Bad AI payload', data);
        throw new Error(
          `AI returned no Playground unit. Payload sample: ${dump}. ` +
          `Expected { unit_topic, lessons:[...7] }. Check edge function logs.`,
        );
      }
      mark('parse', {
        status: 'done',
        detail: `${(unitContent as any).lessons.length} lessons`,
        payload: unitContent,
      });

      // Build + validate the locked 7-lesson unit.
      mark('build', { status: 'active' });
      const { buildPlaygroundUnit } = await import('@/playground-blueprint/lessonBuilder').catch(() => { window.location.reload(); throw new Error('reloading'); });
      const { validatePlaygroundUnit } = await import('@/playground-blueprint/validator').catch(() => { window.location.reload(); throw new Error('reloading'); });
      const unit = buildPlaygroundUnit(unitContent);
      mark('build', { status: 'done', detail: `${unit.vocab_pool.length} vocab · ${unit.phonics_pool.length} phonics` });

      mark('validate', { status: 'active' });
      const verdict = validatePlaygroundUnit(unit);
      if (!verdict.ok) {
        mark('validate', {
          status: 'error',
          detail: `${verdict.issues.length} issue(s)`,
          payload: verdict.issues,
        });
        const summary = verdict.issues.map((i) => `• ${i.code}: ${i.message}`).join('\n');
        throw new Error(`Blueprint validation failed:\n${summary}`);
      }
      mark('validate', { status: 'done', detail: 'passed' });

      setPlaygroundUnit(unit);
      setPreviewLessonNumber(1);
      // Keep a minimal placeholder slide so the legacy slide editor still works
      // (the AI unit is the new source of truth; slides[] is kept for storage compat).
      setSlides([makeSlide('lesson_summary')]);
      setSelected(0);
      setAiOpen(false);
      mark('ready', { status: 'done', detail: unit.unit_topic, payload: unit });
      toast.success(`Unit "${unit.unit_topic}" generated ✨ — preview ready`);
      // Auto-close the timeline shortly after success.
      setTimeout(() => setGenOpen(false), 1500);
    } catch (e: any) {
      console.error(e);
      toast.error('Generation Failed', {
        description: e?.message || 'AI generation failed',
        duration: 15000,
        action: { label: 'Retry', onClick: () => generateWithAI(payload) },
      });
    } finally {
      setAiBusy(false);
    }
  };



  const update = (patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === selected ? ({ ...s, ...patch } as Slide) : s)));
  };

  const addSlide = (preset: SlidePreset) => {
    setSlides((prev) => {
      const next = [...prev, preset.build ? preset.build() : makeSlide(preset.type)];
      setSelected(next.length - 1);
      return next;
    });
  };

  const deleteSlide = (i: number) => {
    if (slides.length === 1) return;
    setSlides((prev) => prev.filter((_, idx) => idx !== i));
    setSelected((s) => Math.max(0, Math.min(s, slides.length - 2)));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setSelected(j);
  };

  const duplicate = (i: number) => {
    setSlides((prev) => {
      const next = [...prev];
      next.splice(i + 1, 0, JSON.parse(JSON.stringify(prev[i])));
      return next;
    });
    setSelected(i + 1);
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); return; }
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setSelected(i);
    setDragIdx(null);
  };

  const history = useRevisionHistory(lessonHook.lessonId);
  const [historyOpen, setHistoryOpen] = useState(false);

  const autoSave = useAutoSave({
    lessonId: lessonHook.lessonId,
    slides,
    title,
    silentSaveDraft: (s, m) => lessonHook.silentSaveDraft(s, { ...m, level: aiLevel, blueprint, playgroundUnit }),
  });

  const [publishVerdict, setPublishVerdict] = useState<CreatorPublishVerdict | null>(null);
  const handleSaveDraft = async () => {
    const id = await lessonHook.saveDraft(slides, { title, level: aiLevel, blueprint, playgroundUnit });
    if (id) history.captureRevision({ title, slides, kind: 'manual' });
    if (lessonHook.lastQAReport) setPublishVerdict(verdictFromQualityReport(lessonHook.lastQAReport));
  };
  const handlePublish = async () => {
    try {
      const id = await lessonHook.publish(slides, { title, level: aiLevel, blueprint, playgroundUnit });
      if (id) history.captureRevision({ title, slides, kind: 'publish' });
    } finally {
      if (lessonHook.lastQAReport) {
        const v = verdictFromQualityReport(lessonHook.lastQAReport);
        setPublishVerdict(v);
        void logRepairOutcome(
          { lessonId: lessonHook.lessonId ?? undefined, hub: 'playground', cefr: aiLevel, decision: v.decision, overallScore: v.overall, issues: (lessonHook.lastQAReport as any)?.issues },
          supabase as any,
        );
        try {
          const { autoHealVocabGamificationFromVerdict } = await import('@/lib/vocabGamificationRepair');
          const healed = autoHealVocabGamificationFromVerdict(slides as any[], v.decision.repair_codes ?? [], 'playground', aiLevel);
          if (healed.injected > 0) {
            setSlides(healed.slides.map((s: any) => normalizePlaygroundSlide(s)) as Slide[]);
            toast.success(`Auto-healed: added ${healed.injected} vocab reinforcement slide(s). Re-publish to apply.`, { duration: 8000 });
          }
        } catch (e) { console.warn('[PlaygroundCreator] vocab gamification auto-heal failed', e); }
      }
    }
  };
  const handleRestore = (rev: LessonRevision) => {
    const restored = Array.isArray(rev.content?.slides) ? rev.content.slides : [];
    if (restored.length === 0) { toast.error('Snapshot has no slides'); return; }
    setSlides(restored.map((s: any) => normalizePlaygroundSlide(s)));
    setSelected(0);
    if (rev.title) setTitle(rev.title);
    setHistoryOpen(false);
    toast.success('Restored snapshot — remember to Save or Publish');
  };
  const handleImportFromLibrary = async (id: string) => {
    const lesson = await lessonHook.importLesson(id);
    if (!lesson) return;
    const dbSlides = getLibraryLessonSlides(lesson) as Slide[];
    if (dbSlides.length === 0) { toast.error('That lesson has no slides yet'); return; }
    setSlides(dbSlides.map((s) => normalizePlaygroundSlide(s)));
    setTitle(lesson.title || 'Imported lesson');
    setSelected(0);
    toast.success(`Loaded "${lesson.title}"`);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(slides, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playground-lesson.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Expected non-empty array');
        setSlides(parsed.map((s: any) => normalizePlaygroundSlide(s)));
        setSelected(0);
      } catch (e: any) {
        alert('Invalid JSON: ' + e.message);
      }
    };
    reader.readAsText(file);
  };

  const openJsonEditor = () => {
    setJsonDraft(JSON.stringify(slides, null, 2));
    setJsonError(null);
    setJsonOpen(true);
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Expected non-empty array of slides');
      setSlides(parsed.map((s: any) => normalizePlaygroundSlide(s)));
      setSelected(0);
      setJsonOpen(false);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b-4 border-orange-400 shadow-sm">
        <div className="w-full flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={goBack}
              title="Back"
              className="flex items-center gap-1 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
              🎨
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-orange-600 tracking-wider uppercase">Playground · Slide Creator</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title…"
                className="text-lg font-bold text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-orange-400 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setAiOpen(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl px-3 py-2 text-xs shadow-md transition active:scale-95">
              <Sparkles className="w-3.5 h-3.5" /> AI
            </button>
            {(() => {
              const reason = homeworkGuardReason(lessonHook.lessonId, blueprint);
              return (
                <button
                  disabled={!!reason}
                  title={reason || 'Generate homework from this lesson'}
                  onClick={() => setHomeworkOpen(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl px-3 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ClipboardCheck className="w-3.5 h-3.5" /> Homework
                </button>
              );
            })()}
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                  <FolderOpen className="w-3.5 h-3.5" /> Library
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-2 max-h-96 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-2 py-1">Import from Library</div>
                {lessonHook.isLoadingLibrary ? (
                  <div className="p-3 text-xs text-slate-500"><Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Loading…</div>
                ) : lessonHook.library.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500">No saved Playground lessons yet.</div>
                ) : (
                  lessonHook.library.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleImportFromLibrary(l.id)}
                      className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-orange-50 text-sm"
                    >
                      <div className="font-semibold text-slate-800 truncate">{l.title}</div>
                      <div className="text-[10px] text-slate-500">{l.is_published ? 'Published' : 'Draft'} · {(l.content as any)?.slides?.length ?? 0} slides</div>
                    </button>
                  ))
                )}
              </PopoverContent>
            </Popover>
            <button
              onClick={() => setVaultOpen(true)}
              className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95"
              title="Open Asset Vault"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Vault
            </button>
            <button
              onClick={generateAllImages}
              disabled={bulkImagesBusy}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl px-3 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50"
              title="Generate AI images for every slide that's missing one"
            >
              {bulkImagesBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              Generate Images
            </button>

            <button
              onClick={() => setTemplatesOpen(true)}
              className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95"
              title="Insert pre-built slide templates"
            >
              <Sparkles className="w-3.5 h-3.5" /> Templates
            </button>
            <button
              onClick={() => setImmersivePreviewOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-orange-500 to-amber-400 hover:from-pink-600 hover:via-orange-600 hover:to-amber-500 text-white border-2 border-orange-600 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 shadow-md"
              title="Preview the lesson in the full-screen immersive student view"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Preview Lesson
            </button>
            <button
              onClick={() => setPlayGameOpen(true)}
              className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95"
              title="Play this lesson through the Unified Game Runtime"
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Runtime
            </button>
            <label className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
              <Upload className="w-3.5 h-3.5" /> JSON
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
            </label>
            <button onClick={exportJson} className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button onClick={openJsonEditor} className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPreviewOpen(true)} className="inline-flex items-center gap-2 bg-white border-2 border-orange-400 hover:bg-orange-50 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <a
              href={lessonHook.lessonId ? `/play/${lessonHook.lessonId}` : '/play'}
              target="_blank"
              rel="noopener noreferrer"
              title={lessonHook.lessonId ? 'Play this lesson in the game runtime' : 'Save first to play this lesson'}
              onClick={(e) => { if (!lessonHook.lessonId) e.preventDefault(); }}
              className={`inline-flex items-center gap-2 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 ${
                lessonHook.lessonId
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md hover:from-orange-600 hover:to-pink-600'
                  : 'bg-white border-2 border-orange-200 text-orange-300 cursor-not-allowed'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Play as Game
            </a>
            <SaveStatusBadge status={autoSave.status} lastSavedAt={autoSave.lastSavedAt} />
            <button
              onClick={() => setHistoryOpen(true)}
              disabled={!lessonHook.lessonId}
              title={lessonHook.lessonId ? 'Revision history' : 'Save the lesson once to enable history'}
              className="inline-flex items-center gap-1.5 bg-white border-2 border-orange-300 text-orange-700 font-bold rounded-xl px-2.5 py-2 text-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <History className="w-3.5 h-3.5" />
            </button>
            <BulkActionsMenu
              hub="playground"
              missingAudioCount={findSlidesMissingAudio(slides).length}
              onGenerateMissingAudio={() => setBulkAudioOpen(true)}
              onPublishTemplate={() => setPublishTemplateOpen(true)}
              canPublishTemplate={slides.length >= 8}
            />
            <button
              onClick={() => setImportOpen(true)}
              title="Convert raw text into a full lesson"
              className="inline-flex items-center gap-2 bg-white border-2 border-orange-400 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95"
            >
              <FileUp className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={() => setJsonImportOpen(true)}
              title="Paste raw JSON from an external AI (NotebookLM / OpenAI)"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-3 py-2 text-xs shadow-md transition active:scale-95"
            >
              📥 Import Lesson JSON
            </button>
            <button onClick={handleSaveDraft} disabled={lessonHook.isSaving} className="inline-flex items-center gap-2 bg-white border-2 border-orange-400 text-orange-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 disabled:opacity-50">
              {lessonHook.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Draft
            </button>
            <button onClick={handlePublish} disabled={lessonHook.isSaving} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50">
              {lessonHook.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Publish
            </button>
          </div>
        </div>
      </header>

      {publishVerdict && (
        <div className="px-4 pt-3">
          <QualityPanel
            verdict={publishVerdict}
            lessonId={lessonHook.lessonId}
            busy={lessonHook.isSaving}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            onRepair={async () => { toast.info('Re-running quality checks…'); await handleSaveDraft(); }}
          />
        </div>
      )}

      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[240px_1fr_380px] gap-4 p-4 min-h-0">
        {/* Slide list */}
        <aside className="min-h-0 flex flex-col order-1">
          <div className="mb-3">
            <MomentsOutline
              slides={slides}
              title={lessonHook.lesson?.title || 'Lesson'}
              selectedSlideIndex={selected}
              onSelectSlide={setSelected}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-md border-2 border-orange-200 p-3 flex flex-col flex-1 min-h-0">
            <h2 className="text-sm font-bold text-orange-600 px-2 py-1">LESSON SLIDES · {slides.length}</h2>
            <div className="space-y-1 overflow-y-auto pr-1 flex-1 min-h-0">
              {slides.map((s, i) => {
                const Icon = slideIcon((s as any).type);
                return (
                  <div key={i}>
                    {i > 0 && (
                      <InsertSlideButton
                        hub="playground"
                        options={[
                          { type: 'listen_repeat', label: 'Listen & Repeat', emoji: '🔁' },
                          { type: 'picture_match', label: 'Picture Match', emoji: '🖼️' },
                          { type: 'tap_the_word', label: 'Tap the Word', emoji: '👆' },
                          { type: 'mini_story', label: 'Mini Story', emoji: '🎞️' },
                          { type: 'storybook', label: 'Storybook', emoji: '📖' },
                          { type: 'scaffolded_media', label: 'Media Analyzer', emoji: '🎬' },
                          { type: 'canvas_game', label: 'Canvas Game', emoji: '🎮' },
                          { type: 'vocab_solo', label: 'Vocab Card', emoji: '✨' },
                          { type: 'phonics_focus', label: 'Phonics Focus', emoji: '🔊' },
                        ]}
                        onInsert={(t) => {
                          const preset = SLIDE_TYPES.find((p) => p.key === t);
                          const newSlide = preset?.build ? preset.build() : makeSlide((preset?.type ?? t) as SlideType);
                          setSlides((p) => { const n = [...p]; n.splice(i, 0, newSlide); return n; });
                          setSelected(i);
                        }}
                      />
                    )}
                    <div
                      draggable
                      onDragStart={() => onDragStart(i)}
                      onDragOver={onDragOver}
                      onDrop={() => onDrop(i)}
                      onClick={() => { setSelected(i); setSelectedHomework(null); }}
                      className={`w-full text-left rounded-xl p-3 border-2 transition cursor-pointer ${
                        i === selected ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 hover:border-orange-300 bg-white'
                      } ${dragIdx === i ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold text-orange-600 inline-flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          {s.type === 'lesson_summary' ? `🔒 #${i + 1}` : `#${i + 1} · ${s.type}`}
                        </span>
                        {s.type !== 'lesson_summary' && (
                          <div className="flex gap-1 opacity-70">
                            <span onClick={(e) => { e.stopPropagation(); move(i, -1); }} className="hover:text-orange-600"><ChevronUp className="w-3.5 h-3.5" /></span>
                            <span onClick={(e) => { e.stopPropagation(); move(i, 1); }} className="hover:text-orange-600"><ChevronDown className="w-3.5 h-3.5" /></span>
                            <span onClick={(e) => { e.stopPropagation(); duplicate(i); }} className="hover:text-orange-600"><Copy className="w-3.5 h-3.5" /></span>
                            <span onClick={(e) => { e.stopPropagation(); deleteSlide(i); }} className="hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {s.type === 'lesson_summary' ? 'Auto-Summary (system)' : slideTitle(s)}
                      </div>
                    </div>
                  </div>
                );
              })}

              <HomeworkSlidesPreview
                hub="playground"
                title={lessonHook.lesson?.title || title}
                slides={slides as any}
                selectedTaskIndex={selectedHomework?.index ?? null}
                onSelect={(task, index) => setSelectedHomework({ task, index })}
              />
            </div>


            <div className="mt-3 pt-3 border-t border-orange-100 flex-1 min-h-0 overflow-y-auto pr-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Add Scene</p>
                <span className="text-[10px] font-semibold text-orange-500/70">{SLIDE_TYPES.length} activities</span>
              </div>
              {(Object.keys(GROUP_LABELS) as SlidePreset['group'][]).map((group) => {
                const items = SLIDE_TYPES.filter((p) => p.group === group);
                if (!items.length) return null;
                return (
                  <div key={group} className="mb-4">
                    {/* Phase chip — mirrors the trail-chrome lesson header pill */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FE6A2F]" />
                      <p className="text-[10px] font-extrabold text-[#FE6A2F] uppercase tracking-[0.12em]">
                        {GROUP_LABELS[group]}
                      </p>
                      <span className="ml-auto text-[10px] font-semibold text-orange-400/70">{items.length}</span>
                    </div>
                    {/* Lesson-shell cards: full-width, rounded, emoji puck + title + hint */}
                    <div className="flex flex-col gap-1.5">
                      {items.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => addSlide(t)}
                          title={t.label}
                          className="group/card w-full text-left bg-white hover:bg-[#FFF6EE] border-2 border-orange-100 hover:border-[#FE6A2F]/60 rounded-2xl px-2.5 py-2 flex items-center gap-2.5 shadow-[0_1px_0_rgba(254,106,47,0.08)] hover:shadow-[0_4px_14px_-6px_rgba(254,106,47,0.45)] active:scale-[0.98] transition"
                        >
                          <span className="flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-[#FEFBDD] to-[#FFE3CF] border border-orange-200 grid place-items-center text-lg shadow-inner">
                            {t.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-extrabold text-[#3a1d0a] leading-tight truncate">
                              {t.label}
                            </span>
                            {t.hint && (
                              <span className="block text-[10px] font-medium text-slate-500 leading-snug line-clamp-2">
                                {t.hint}
                              </span>
                            )}
                          </span>
                          <Plus className="flex-shrink-0 w-3.5 h-3.5 text-orange-400 opacity-0 group-hover/card:opacity-100 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setMediaModalOpen(true)}
                className="mt-2 w-full text-xs font-bold text-white bg-gradient-to-r from-fuchsia-500 to-orange-500 rounded-2xl p-2.5 inline-flex items-center justify-center gap-2 active:scale-95 shadow-md"
              >
                <Headphones className="w-3.5 h-3.5" /> Add Listening Exercise
              </button>
            </div>
          </div>
        </aside>

        {/* Live preview (CENTER) */}
        <section className="min-h-0 flex flex-col order-2">
          <div className="bg-[#FEFBDD] rounded-2xl border-2 border-orange-200 flex flex-col flex-1 min-h-0 overflow-y-auto">
            {selectedHomework ? (
              <div className="p-3 overflow-y-auto">
                <HomeworkSlideLivePreview hub="playground" task={selectedHomework.task} taskNumber={selectedHomework.index + 1} />
              </div>
            ) : (
              <PlaygroundLessonPlayer
                slides={slides.map((s) => normalizePlaygroundSlide(s))}
                unit={playgroundUnit}
                lessonNumber={previewLessonNumber}
                title={title || 'Playground Lesson'}
                cefr={aiLevel}
                startIndex={selected}
                skipIntro
                embedded
              />
            )}
            {!selectedHomework && slides[selected] && (
              <TeacherNotesField
                value={(slides[selected] as any).teacher_notes}
                onChange={(next) => update({ teacher_notes: next } as any)}
              />
            )}
          </div>
        </section>

        {/* Editor (RIGHT) */}
        <section className="min-h-0 flex flex-col order-3">
          <div className="bg-white rounded-2xl shadow-md border-2 border-orange-200 p-5 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3 gap-2 flex-shrink-0">
              <h2 className="text-sm font-bold text-orange-600">EDIT SLIDE #{safeIndex + 1} · {(current?.type ?? 'intro').toString().toUpperCase()}</h2>
              <button
                onClick={() => setTunerOpen(true)}
                title="Rewrite this slide easier or harder"
                className="inline-flex items-center gap-1 text-xs font-bold border-2 border-orange-300 text-orange-700 rounded-lg px-2 py-1 hover:bg-orange-50"
              >
                <Wand2 className="w-3.5 h-3.5" /> Tune
              </button>
            </div>
            <Tabs defaultValue="basic" className="w-full flex-1 flex flex-col min-h-0">
              <TabsList className="grid grid-cols-3 w-full flex-shrink-0">
                <TabsTrigger value="basic">Content</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="ai">AI Tools</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="pt-4 flex-1 overflow-y-auto min-h-0">
                {current.type === 'storybook' ? (
                  <StorybookEditor
                    slide={current as any}
                    hub="playground"
                    cefrLevel="A1"
                    targetVocab={blueprint?.vocabulary || []}
                    grammarFocus={blueprint?.grammar || ''}
                    lessonTitle={title}
                    lessonSlides={slides}
                    onPatch={(patch) => update(patch as Partial<Slide>)}
                    onAppendQuiz={(quiz) => insertAfterCurrent(mapAIQuizSlides(quiz, 'playground') as Slide[])}
                  />
                ) : current.type === 'canvas_game' || current.type === 'living_canvas' ? (
                  <CanvasElementEditor
                    slide={current as any}
                    hub="playground"
                    onChange={(next) => update(next as Partial<Slide>)}
                  />
                ) : current.type === 'scaffolded_media' ? (
                  <ScaffoldedMediaEditor
                    slide={current as any}
                    onChange={(next) => update(next as Partial<Slide>)}
                  />
                ) : (
                  <SlideEditor slide={current} onChange={update} blueprint={blueprint} hub="playground" lessonId={lessonHook.lessonId} slideId={slideId} />
                )}
              </TabsContent>
              <TabsContent value="media" className="pt-4 flex-1 overflow-y-auto min-h-0">
                <SlideMediaPanel
                  slide={current as any}
                  onPatch={(patch) => update(patch as Partial<Slide>)}
                  hub="playground"
                  lessonId={lessonHook.lessonId}
                  slideId={slideId}
                  enableFlashcards={current.type === 'match' || current.type === 'multiple'}
                />
              </TabsContent>
              <TabsContent value="ai" className="pt-4 flex-1 overflow-y-auto min-h-0">
                <AIToolsPanel
                  hub="playground"
                  lessonId={lessonHook.lessonId}
                  slideId={slideId}
                  onTuneDifficulty={() => setTunerOpen(true)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>

      {/* Fullscreen preview */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"
          >
            <button onClick={() => setPreviewOpen(false)} className="absolute top-4 right-4 bg-white text-orange-600 rounded-full p-2 shadow-lg hover:bg-orange-50">
              <X className="w-5 h-5" />
            </button>
            <FullPreview slides={slides} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* JSON editor modal */}
      <AnimatePresence>
        {jsonOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-orange-200">
                <h3 className="font-bold text-orange-600">Edit Lesson JSON</h3>
                <button onClick={() => setJsonOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <textarea
                value={jsonDraft}
                onChange={(e) => setJsonDraft(e.target.value)}
                className="flex-1 font-mono text-xs p-4 outline-none resize-none"
                spellCheck={false}
      />


              {jsonError && <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-t border-red-200">{jsonError}</div>}
              <div className="p-4 border-t border-orange-200 flex justify-end gap-2">
                <button onClick={() => setJsonOpen(false)} className="px-4 py-2 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={applyJson} className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md">Apply</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI generation modal */}
      <GenerateLessonModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        hub="playground"
        defaultTopic={aiTopic}
        defaultLevel={aiLevel}
        defaultVocabulary={blueprint?.vocabulary}
        defaultGrammar={blueprint?.grammar}
        defaultPhonics={blueprint?.target_phonics}
        defaultInterests={blueprint?.interests}
        defaultNeeds={blueprint?.specific_needs}
        defaultLanguageVariant={blueprint?.language_variant}
        defaultVisualTheme={blueprint?.visual_theme}
        defaultLearningObjective={blueprint?.learning_objective}
        defaultFinalOutputTask={blueprint?.final_output_task}
        busy={aiBusy}
        onGenerate={generateWithAI}
      />

      {/* Live generation timeline (Academy-style) */}
      <GenerationStepStream
        open={genOpen}
        title="Generating Playground unit…"
        steps={genSteps}
        onClose={() => !aiBusy && setGenOpen(false)}
      />



      <RevisionHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        revisions={history.revisions}
        loading={history.loading}
        onRestore={handleRestore}
      />

      <AssetVaultDialog
        open={vaultOpen}
        onOpenChange={setVaultOpen}
        hub="playground"
        onPick={({ url, field }) => update({ [field]: url } as any)}
      />

      <HomeworkGenerationDialog
        open={homeworkOpen}
        onOpenChange={setHomeworkOpen}
        input={{
          lessonId: lessonHook.lessonId,
          blueprint,
          title: lessonHook.lesson?.title || 'Lesson',
          hub: 'playground',
        }}
      />


      <SlideTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        hub="playground"
        makeSlide={(t) => makeSlide(t as SlideType)}
        onInsert={(newSlides, tpl) => {
          setSlides((prev) => {
            const next = [...prev, ...newSlides];
            setSelected(next.length - newSlides.length);
            return next;
          });
          toast.success(`Added "${tpl.label}" (${newSlides.length} slides)`);
        }}
      />

      <BulkAudioDialog
        open={bulkAudioOpen}
        onOpenChange={setBulkAudioOpen}
        slides={slides}
        lessonId={lessonHook.lessonId}
        patchSlide={(idx, patch) =>
          setSlides((prev) => prev.map((s, i) => (i === idx ? ({ ...s, ...patch } as Slide) : s)))
        }
      />

      <DifficultyTunerDialog
        open={tunerOpen}
        onOpenChange={setTunerOpen}
        slide={current}
        onPatch={(patch) =>
          setSlides((prev) => prev.map((s, i) => (i === selected ? ({ ...s, ...patch } as Slide) : s)))
        }
        hub="playground"
      />

      <ImportFromTextDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultHub="playground"
      />

      <PlaygroundJsonImporter
        open={jsonImportOpen}
        onOpenChange={setJsonImportOpen}
        onImport={(imported) => {
          setSlides((prev) => {
            const insertAt = prev.length;
            const next = [...prev, ...imported.map((s: any) => normalizePlaygroundSlide(s))];
            setSelected(insertAt);
            return next;
          });
          toast.success(`Imported ${imported.length} block${imported.length === 1 ? '' : 's'}`);
        }}
      />

      <PlayAsGameDialog
        open={playGameOpen}
        onOpenChange={setPlayGameOpen}
        slides={slides}
        title={title}
        lessonId={lessonHook.lessonId}
        cefr={aiLevel}
      />

      <ImmersivePreviewDialog
        open={immersivePreviewOpen}
        onOpenChange={setImmersivePreviewOpen}
        slides={slides}
        title={title}
        cefr={aiLevel}
      />

      <MediaAnalyzerModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        hub="playground"
        cefrLevel="A1"
        onCreate={(mediaSlide, quiz) => {
          const mapped = mapAIQuizSlides(quiz, 'playground') as Slide[];
          setSlides((prev) => {
            const at = Math.min(selected + 1, prev.length);
            const next = [...prev.slice(0, at), mediaSlide as unknown as Slide, ...mapped, ...prev.slice(at)];
            setSelected(at);
            return next;
          });
        }}
      />

      <PublishTemplateDialog
        open={publishTemplateOpen}
        onOpenChange={setPublishTemplateOpen}
        hub="playground"
        title={title}
        slides={slides}
      />
    </div>
  );
}

// ─── Slide editor (per type) ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full border-2 border-orange-200 focus:border-orange-500 rounded-xl px-3 py-2 outline-none text-slate-800 bg-white';

const IMAGE_STYLES: { key: string; label: string; emoji: string; suffix: string }[] = [
  { key: 'cartoon',    label: 'Cartoon',    emoji: '🎨', suffix: 'flat 2D cartoon illustration, bright bold colors, thick outlines, child-friendly, clean white background, no text, no letters' },
  { key: 'sticker',    label: 'Sticker',    emoji: '🟡', suffix: 'die-cut sticker illustration, glossy, soft drop shadow, kawaii style, isolated on white background, no text' },
  { key: 'watercolor', label: 'Watercolor', emoji: '💧', suffix: 'soft watercolor storybook illustration, gentle pastel colors, paper texture, clean white background, no text' },
  { key: 'photo',      label: 'Photo',      emoji: '📷', suffix: 'bright cheerful product photo, soft daylight, isolated on pure white background, sharp focus, no text' },
];

const withFreshImageSeed = (prompt: string) =>
  `${prompt}. Fresh regeneration seed: ${Date.now()}-${Math.random().toString(36).slice(2)}. Use the seed only to create a new composition; do not draw or write it.`;

function ImageField({
  label, url, subject, onChange,
}: { label: string; url?: string; subject?: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [style, setStyle] = useState<string>('cartoon');
  const [character, setCharacter] = useState<string>('none');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const generate = async () => {
    const subj = (customPrompt.trim() || subject || '').trim();
    if (!subj) { toast.error('Set the word first'); return; }
    const styleDef = IMAGE_STYLES.find((s) => s.key === style) ?? IMAGE_STYLES[0];
    const charDef = PLAYGROUND_CAST_PRESETS.find((c) => c.name === character);
    const charPart = charDef
      ? `Featuring ${charDef.name} (${charDef.visual_blueprint}) acting out / impersonating "${subj}". `
      : '';
    const fullPrompt = withFreshImageSeed(`Concept to teach: "${subj}". ${charPart}${subj} — ${styleDef.suffix}`);
    setBusy(true);
    try {
      const u = await generateOnePlaygroundImage(fullPrompt);
      if (!u) throw new Error('No image returned');
      onChange(u);
      toast.success(`🎨 ${charDef ? charDef.name + ' as ' : ''}${styleDef.label} image generated`);
    } catch (e: any) {
      toast.error(e?.message || 'Image generation failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/60 to-white p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> {label}
        </span>
        {url && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wide"
          >
            Clear
          </button>
        )}
      </div>

      {/* Preview */}
      <div className="relative rounded-xl overflow-hidden border-2 border-orange-100 bg-white aspect-[4/3] flex items-center justify-center">
        {url ? (
          <img src={url} alt={subject || label} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-orange-300">
            <ImageIcon className="w-10 h-10 mx-auto mb-1" />
            <p className="text-[11px] font-bold uppercase">No image yet</p>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        )}
      </div>

      {/* Style chips */}
      <div className="flex flex-wrap gap-1.5">
        {IMAGE_STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStyle(s.key)}
            className={`text-[11px] font-bold rounded-full px-2.5 py-1 border-2 transition active:scale-95 ${
              style === s.key
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-orange-700 border-orange-200 hover:border-orange-400'
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Character impersonator */}
      <div>
        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Character (optional)</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCharacter('none')}
            className={`text-[11px] font-bold rounded-full px-2.5 py-1 border-2 transition active:scale-95 ${
              character === 'none'
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            ✖ None
          </button>
          {PLAYGROUND_CAST_PRESETS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setCharacter(c.name)}
              title={`${c.name} impersonates the subject`}
              className={`text-[11px] font-bold rounded-full px-2.5 py-1 border-2 transition active:scale-95 ${
                character === c.name
                  ? 'bg-fuchsia-500 text-white border-fuchsia-500 shadow-sm'
                  : 'bg-white text-fuchsia-700 border-fuchsia-200 hover:border-fuchsia-400'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="flex-1 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 rounded-xl px-3 py-2 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm active:scale-95"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {url ? 'Regenerate' : 'Generate with AI'}
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-xs font-bold text-orange-700 bg-white border-2 border-orange-200 hover:border-orange-400 rounded-xl px-3 py-2"
          title="More options"
        >
          {open ? '–' : '⋯'}
        </button>
      </div>

      {open && (
        <div className="space-y-2 pt-2 border-t border-orange-100">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Custom prompt (overrides word)</span>
            <input
              className={inputCls + ' text-xs'}
              placeholder={subject ? `e.g. "${subject} sitting on a chair"` : 'Describe the picture…'}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Image URL</span>
            <input
              className={inputCls + ' text-xs'}
              placeholder="https://…"
              value={url || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}



function SlideEditor({ slide, onChange, blueprint, hub = 'playground', lessonId, slideId }: { slide: Slide; onChange: (p: Partial<Slide>) => void; blueprint?: LessonBlueprint | null; hub?: 'playground' | 'academy' | 'success'; lessonId?: string | null; slideId?: string }) {
  const voice = (slide as any).voice as Slide['voice'] | undefined;
  const wandFor = (field: string, currentValue: string, apply: (v: string) => void) => (
    <WandFieldButton
      field={field}
      currentValue={currentValue}
      slideType={slide.type}
      hub={hub}
      cefrLevel="A1"
      blueprint={blueprint}
      onResult={apply}
    />
  );
  const VoiceFields = (
    <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-orange-100">
      <div className="col-span-2">
        <Field label="🔊 Voice (TTS)">
          <input
            className={inputCls}
            value={voice?.text || ''}
            placeholder="What the voice says..."
            onChange={(e) => onChange({ voice: { ...(voice || {}), text: e.target.value } } as any)}
          />
        </Field>
      </div>
      <Field label="Auto-play">
        <select
          className={inputCls}
          value={voice?.autoPlay ? 'yes' : 'no'}
          onChange={(e) => onChange({ voice: { text: voice?.text || '', autoPlay: e.target.value === 'yes' } } as any)}
        >
          <option value="yes">On</option>
          <option value="no">Off</option>
        </select>
      </Field>
    </div>
  );

  const wandRow = (children: React.ReactNode, wand: React.ReactNode) => (
    <div className="flex gap-2 items-center">{children}{wand}</div>
  );

  const patchJson = (field: string, value: string) => {
    try {
      onChange({ [field]: JSON.parse(value) } as any);
    } catch {
      toast.error(`Invalid JSON for ${field}`);
    }
  };

  const JsonField = ({ label, field, value }: { label: string; field: string; value: unknown }) => (
    <Field label={label}>
      <textarea
        key={`${slide.type}-${field}`}
        className={inputCls + ' min-h-[120px] font-mono text-xs'}
        defaultValue={JSON.stringify(value ?? [], null, 2)}
        onBlur={(e) => patchJson(field, e.target.value)}
        spellCheck={false}
      />
    </Field>
  );

  switch (slide.type) {
    case 'intro':
      return (
        <div className="space-y-3">
          <Field label="Title">{wandRow(
            <input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} />,
            wandFor('title', slide.title, (v) => onChange({ title: v } as any)),
          )}</Field>
          <Field label="Text">{wandRow(
            <input className={inputCls} value={slide.text || ''} onChange={(e) => onChange({ text: e.target.value } as any)} />,
            wandFor('text', slide.text || '', (v) => onChange({ text: v } as any)),
          )}</Field>
          {VoiceFields}
        </div>
      );

    case 'multiple': {
      const opts: string[] = Array.isArray((slide as any).options) ? (slide as any).options : [];
      const optImages: string[] = Array.isArray((slide as any).option_images)
        ? (slide as any).option_images.slice()
        : opts.map(() => '');
      while (optImages.length < opts.length) optImages.push('');
      const setOpt = (i: number, v: string) => {
        const next = [...opts]; const prev = next[i]; next[i] = v;
        const patch: any = { options: next };
        if ((slide as any).answer === prev) patch.answer = v;
        onChange(patch);
      };
      const setOptImg = (i: number, url: string) => {
        const nextImgs = [...optImages]; nextImgs[i] = url;
        onChange({ option_images: nextImgs } as any);
      };
      const addOpt = () => onChange({
        options: [...opts, `option ${opts.length + 1}`],
        option_images: [...optImages, ''],
      } as any);
      const removeOpt = (i: number) => onChange({
        options: opts.filter((_, idx) => idx !== i),
        option_images: optImages.filter((_, idx) => idx !== i),
        answer: (slide as any).answer === opts[i]
          ? (opts.find((_, idx) => idx !== i) || '')
          : (slide as any).answer,
      } as any);
      return (
        <div className="space-y-3">
          <Field label="Question">{wandRow(
            <input className={inputCls} value={slide.question} onChange={(e) => onChange({ question: e.target.value } as any)} />,
            wandFor('question', slide.question, (v) => onChange({ question: v } as any)),
          )}</Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Options (with images)</span>
              <button onClick={addOpt} className="inline-flex items-center gap-1 text-xs font-bold border-2 border-orange-300 text-orange-700 rounded-lg px-2 py-1 hover:bg-orange-50">
                + Add option
              </button>
            </div>
            <div className="space-y-2">
              {opts.map((o, i) => (
                <div key={i} className="border-2 border-orange-100 rounded-xl p-2 bg-orange-50/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className={inputCls + ' flex-1'}
                      value={o}
                      onChange={(e) => setOpt(i, e.target.value)}
                      placeholder={`option ${i + 1}`}
                    />
                    <label className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <input
                        type="radio"
                        name="mc-answer"
                        checked={(slide as any).answer === o}
                        onChange={() => onChange({ answer: o } as any)}
                      />
                      ✓
                    </label>
                    <button
                      onClick={() => removeOpt(i)}
                      disabled={opts.length <= 2}
                      className="text-rose-500 hover:text-rose-700 disabled:opacity-30 px-1"
                      title={opts.length <= 2 ? 'Need at least 2 options' : 'Remove'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ImageField
                    label={`Image for "${o || `option ${i + 1}`}"`}
                    url={optImages[i] || ''}
                    subject={o}
                    onChange={(url) => setOptImg(i, url)}
                  />
                </div>
              ))}
            </div>
          </div>
          {VoiceFields}
        </div>
      );
    }

    case 'truefalse':
      return (
        <div className="space-y-3">
          <Field label="Statement">{wandRow(
            <input className={inputCls} value={slide.statement} onChange={(e) => onChange({ statement: e.target.value } as any)} />,
            wandFor('statement', slide.statement, (v) => onChange({ statement: v } as any)),
          )}</Field>
          <Field label="Correct Answer">
            <select className={inputCls} value={slide.answer ? 'true' : 'false'} onChange={(e) => onChange({ answer: e.target.value === 'true' } as any)}>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </Field>
          {VoiceFields}
        </div>
      );

    case 'fill': {
      const opts: string[] = Array.isArray((slide as any).options) ? (slide as any).options : [];
      const setOpts = (next: string[]) => onChange({ options: next.filter(Boolean) } as any);
      return (
        <div className="space-y-3">
          <Field label="Sentence (use ____ where the blank goes)">{wandRow(
            <input className={inputCls} value={slide.text} onChange={(e) => onChange({ text: e.target.value } as any)} />,
            wandFor('sentence', slide.text, (v) => onChange({ text: v } as any)),
          )}</Field>
          <Field label="Answer">
            <input className={inputCls} value={slide.answer} onChange={(e) => onChange({ answer: e.target.value } as any)} />
          </Field>

          <Field label={`Word Bank (drag-and-drop mode)${opts.length ? ' — ACTIVE' : ''}`}>
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  className={inputCls}
                  placeholder={i === 0 ? `Correct word (e.g. ${slide.answer || 'can'})` : `Wrong choice ${i}`}
                  value={opts[i] ?? ''}
                  onChange={(e) => {
                    const next = [...opts];
                    next[i] = e.target.value;
                    setOpts(next);
                  }}
                />
              ))}
              <p className="text-[11px] text-slate-500 leading-snug">
                Add 2–4 words to turn this into a <b>drag-the-word-into-the-gap</b> activity.
                Leave empty for free typing. The first word should match the Answer.
              </p>
              {opts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpts([])}
                  className="text-[11px] font-bold text-red-500 hover:text-red-700 underline"
                >
                  Clear word bank (back to typing)
                </button>
              )}
            </div>
          </Field>

          {VoiceFields}
        </div>
      );
    }

    case 'drag':
      return (
        <div className="space-y-3">
          <Field label="Instruction">{wandRow(
            <input className={inputCls} value={slide.instruction} onChange={(e) => onChange({ instruction: e.target.value } as any)} />,
            wandFor('instruction', slide.instruction, (v) => onChange({ instruction: v } as any)),
          )}</Field>
          <Field label="Correct Word">{wandRow(
            <input className={inputCls} value={slide.word} onChange={(e) => onChange({ word: e.target.value } as any)} />,
            wandFor('word', slide.word, (v) => onChange({ word: v } as any)),
          )}</Field>
          <Field label="Correct word — chip image URL">
            <input
              className={inputCls}
              placeholder="https://… (picture shown on the correct chip)"
              value={(slide as any).correctImage ?? ''}
              onChange={(e) => onChange({ correctImage: e.target.value } as any)}
            />
          </Field>
          <Field label="Distractors (wrong choices) — word + chip image">
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr] gap-2">
                  <input
                    className={inputCls}
                    placeholder={i === 0 ? 'e.g. BANANA' : 'e.g. ORANGE'}
                    value={(slide as any).distractors?.[i] ?? ''}
                    onChange={(e) => {
                      const next = [...((slide as any).distractors ?? ['', ''])];
                      next[i] = e.target.value;
                      onChange({ distractors: next.slice(0, 2) } as any);
                    }}
                  />
                  <input
                    className={inputCls}
                    placeholder="Image URL for this wrong choice"
                    value={(slide as any).distractorImages?.[i] ?? ''}
                    onChange={(e) => {
                      const next = [...((slide as any).distractorImages ?? ['', ''])];
                      next[i] = e.target.value;
                      onChange({ distractorImages: next.slice(0, 2) } as any);
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Each chip shows its picture above the word. Students drag the correct one onto the big picture clue.</p>
          </Field>
          <ImageField
            label="Image (the picture clue students see)"
            url={slide.image_url}
            subject={slide.word}
            onChange={(url) => onChange({ image_url: url } as any)}
          />
          {VoiceFields}
        </div>
      );

    case 'vocab_solo':
      return (
        <div className="space-y-3">
          <Field label="Word">{wandRow(
            <input className={inputCls} value={(slide as any).word} onChange={(e) => onChange({ word: e.target.value } as any)} />,
            wandFor('word', (slide as any).word, (v) => onChange({ word: v } as any)),
          )}</Field>
          <Field label="Definition">{wandRow(
            <input className={inputCls} value={(slide as any).definition || ''} onChange={(e) => onChange({ definition: e.target.value } as any)} />,
            wandFor('definition', (slide as any).definition || '', (v) => onChange({ definition: v } as any)),
          )}</Field>
          <ImageField
            label="Image (AI-generated)"
            url={(slide as any).image_url}
            subject={(slide as any).word}
            onChange={(url) => onChange({ image_url: url } as any)}
          />
          {(() => {
            const url = (slide as any).image_url as string | undefined;
            const prompt = (slide as any).image_prompt as string | undefined;
            if (!prompt || !isGenericBaselineAsset(url)) return null;
            return (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-2 text-[11px] text-orange-900 space-y-1">
                <div className="font-bold">Generic baseline image detected.</div>
                <div className="italic">Prompt: {prompt}</div>
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-white font-bold hover:bg-orange-600"
                  onClick={async () => {
                    try {
                      const newUrl = await generateOnePlaygroundImage(withFreshImageSeed(prompt));
                      if (newUrl) {
                        onChange({ image_url: newUrl } as any);
                        toast.success('Unique image generated.');
                      } else {
                        toast.error('Image generator returned no URL.');
                      }
                    } catch (err: any) {
                      toast.error(err?.message || 'Image generation failed.');
                    }
                  }}
                >
                  <Sparkles className="w-3 h-3" /> Regenerate unique image
                </button>
              </div>
            );
          })()}

          <p className="text-[11px] text-slate-500">Generate audio in the <b>AI Media & Audio</b> tab → it auto-binds to the 🔊 Play button.</p>
          {VoiceFields}
        </div>
      );

    case 'phonics_focus':
      return (
        <PhonicsFocusEditor
          slide={slide as any}
          onChange={onChange as any}
          lessonId={lessonId || 'draft'}
          slideId={slideId || 'phonics'}
          VoiceFields={VoiceFields}
        />
      );

    case 'match':
      return (
        <div className="space-y-3">
          <Field label="Instruction">{wandRow(
            <input className={inputCls} value={slide.instruction} onChange={(e) => onChange({ instruction: e.target.value } as any)} />,
            wandFor('instruction', slide.instruction, (v) => onChange({ instruction: v } as any)),
          )}</Field>
          <div>
            <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Pairs</span>
            <div className="space-y-2">
              {slide.pairs.map((p, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Field label="Word">
                      <input
                        className={inputCls} placeholder="Word" value={p.word}
                        onChange={(e) => {
                          const next = [...slide.pairs]; next[i] = { ...p, word: e.target.value };
                          onChange({ pairs: next } as any);
                        }}
                      />
                    </Field>
                  </div>
                  <div className="flex-1">
                    <ImageField
                      label="Image"
                      url={p.image_url}
                      subject={p.word}
                      onChange={(url) => {
                        const next = [...slide.pairs]; next[i] = { ...p, image_url: url };
                        onChange({ pairs: next } as any);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => onChange({ pairs: slide.pairs.filter((_, j) => j !== i) } as any)}
                    className="text-red-500 hover:bg-red-50 rounded-lg px-2 mb-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => onChange({ pairs: [...slide.pairs, { word: '', image_url: '/playground/placeholder-dropzone.svg' }] } as any)}
              className="mt-2 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-1.5 inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add pair
            </button>
          </div>
          {VoiceFields}
        </div>
      );

    case 'memory':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Emoji"><input className={inputCls} value={(slide as any).emoji || ''} onChange={(e) => onChange({ emoji: e.target.value } as any)} /></Field>
          <JsonField label="Pairs JSON" field="pairs" value={(slide as any).pairs || []} />
          {VoiceFields}
        </div>
      );

    case 'tap_order':
    case 'thumbs':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Emoji"><input className={inputCls} value={(slide as any).emoji || ''} onChange={(e) => onChange({ emoji: e.target.value } as any)} /></Field>
          <JsonField label="Items JSON" field="items" value={(slide as any).items || []} />
          {VoiceFields}
        </div>
      );

    case 'hotspot':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Emoji"><input className={inputCls} value={(slide as any).emoji || ''} onChange={(e) => onChange({ emoji: e.target.value } as any)} /></Field>
          <ImageField label="Scene Image" url={(slide as any).image_url || ''} subject={(slide as any).instruction || 'playground scene'} onChange={(url) => onChange({ image_url: url } as any)} />
          <JsonField label="Parts JSON" field="parts" value={(slide as any).parts || []} />
          <JsonField label="Prompts JSON" field="prompts" value={(slide as any).prompts || []} />
          {VoiceFields}
        </div>
      );

    case 'sort':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Emoji"><input className={inputCls} value={(slide as any).emoji || ''} onChange={(e) => onChange({ emoji: e.target.value } as any)} /></Field>
          <JsonField label="Buckets JSON" field="buckets" value={(slide as any).buckets || []} />
          <JsonField label="Items JSON" field="items" value={(slide as any).items || []} />
          {VoiceFields}
        </div>
      );

    case 'word_builder':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Word"><input className={inputCls} value={(slide as any).word || ''} onChange={(e) => onChange({ word: e.target.value } as any)} /></Field>
          <ImageField label="Picture Clue" url={(slide as any).image_url || ''} subject={(slide as any).word || 'cat'} onChange={(url) => onChange({ image_url: url } as any)} />
          <JsonField label="Extra Letters JSON" field="extras" value={(slide as any).extras || []} />
          {VoiceFields}
        </div>
      );

    case 'sound_blend':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Word"><input className={inputCls} value={(slide as any).word || ''} onChange={(e) => onChange({ word: e.target.value } as any)} /></Field>
          <ImageField label="Picture Clue" url={(slide as any).image_url || ''} subject={(slide as any).word || 'cat'} onChange={(url) => onChange({ image_url: url } as any)} />
          <JsonField label="Sounds JSON" field="sounds" value={(slide as any).sounds || []} />
          {VoiceFields}
        </div>
      );

    case 'trace':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Letter"><input className={inputCls} value={(slide as any).letter || ''} onChange={(e) => onChange({ letter: e.target.value } as any)} /></Field>
          <Field label="Word"><input className={inputCls} value={(slide as any).word || ''} onChange={(e) => onChange({ word: e.target.value } as any)} /></Field>
          <Field label="Phoneme"><input className={inputCls} value={(slide as any).phoneme || ''} onChange={(e) => onChange({ phoneme: e.target.value } as any)} /></Field>
          <ImageField label="Picture Clue" url={(slide as any).image_url || ''} subject={(slide as any).word || (slide as any).letter || 'cat'} onChange={(url) => onChange({ image_url: url } as any)} />
          {VoiceFields}
        </div>
      );

    case 'missing_letter':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Word"><input className={inputCls} value={(slide as any).word || ''} onChange={(e) => onChange({ word: e.target.value } as any)} /></Field>
          <Field label="Missing letter"><input className={inputCls} value={(slide as any).missing_letter || ''} maxLength={1} onChange={(e) => onChange({ missing_letter: e.target.value } as any)} /></Field>
          <Field label="Missing position (0 = first letter)"><input className={inputCls} type="number" min={0} value={(slide as any).missing_position ?? 0} onChange={(e) => onChange({ missing_position: Number(e.target.value) } as any)} /></Field>
          <ImageField label="Picture Clue" url={(slide as any).image_url || ''} subject={(slide as any).word || 'cat'} onChange={(url) => onChange({ image_url: url } as any)} />
          {VoiceFields}
        </div>
      );

    case 'phonics_hunt':
      return (
        <div className="space-y-3">
          <Field label="Instruction"><input className={inputCls} value={(slide as any).instruction || ''} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Target letter / sound"><input className={inputCls} value={(slide as any).letter || ''} maxLength={2} onChange={(e) => onChange({ letter: e.target.value } as any)} /></Field>
          <JsonField label="Words JSON" field="items" value={(slide as any).items || []} />
          {VoiceFields}
        </div>
      );

    case 'draw':
      return (
        <div className="space-y-3">
          <Field label="Prompt">{wandRow(
            <input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} />,
            wandFor('prompt', slide.prompt, (v) => onChange({ prompt: v } as any)),
          )}</Field>
          {VoiceFields}
        </div>
      );
    case 'lesson_summary':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={(slide as any).title || ''} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Vocabulary recap (one word per line)">
            <textarea className={inputCls + ' h-24'} value={(slide as any).vocab_recap?.join('\n') || ''}
              onChange={(e) => onChange({ vocab_recap: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) } as any)} />
          </Field>
          <Field label="Takeaway"><input className={inputCls} value={(slide as any).takeaway || ''} onChange={(e) => onChange({ takeaway: e.target.value } as any)} /></Field>
          {VoiceFields}
        </div>
      );
    case 'storybook':
      return <div className="text-sm text-slate-600">Use the Storybook editor (auto-shown above). 📖</div>;
    case 'media_player':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={(slide as any).title || ''} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Media URL"><input className={inputCls} value={(slide as any).media_url || ''} onChange={(e) => onChange({ media_url: e.target.value } as any)} /></Field>
          <Field label="Transcript"><textarea className={inputCls + ' h-24'} value={(slide as any).transcript || ''} onChange={(e) => onChange({ transcript: e.target.value } as any)} /></Field>
        </div>
      );
  }
}
function FullPreview({ slides }: { slides: Slide[] }) {
  return (
    <div className="h-[82vh] w-[95vw] max-w-5xl overflow-auto rounded-[2rem] bg-[#FEFBDD]">
      <PlaygroundLessonPlayer slides={slides.map((s) => normalizePlaygroundSlide(s))} title="Playground Preview" skipIntro />
    </div>
  );
}

function PreviewConfetti({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  useEffect(() => {
    if (trigger === 0) return;
    setBursts((b) => [...b, trigger]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== trigger)), 1200);
    return () => clearTimeout(t);
  }, [trigger]);
  const colors = ['#FE6A2F', '#FBBF24', '#F59E0B', '#FCD34D', '#FB923C'];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bursts.map((id) => (
        <div key={id} className="absolute left-1/2 top-1/2">
          {Array.from({ length: 28 }).map((_, idx) => {
            const tx = (Math.random() - 0.5) * 480;
            const ty = (Math.random() - 0.5) * 480;
            const delay = Math.random() * 0.15;
            return (
              <span
                key={idx}
                className="absolute block rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: colors[idx % colors.length],
                  transform: `translate(${tx}px, ${ty}px)`,
                  animation: `fade-out 1s ease-out ${delay}s forwards`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface PhonicsItem { word: string; image_url?: string; audio_url?: string; spoken_text?: string }

function PhonicsFocusEditor({
  slide, onChange, lessonId, slideId, VoiceFields,
}: {
  slide: any;
  onChange: (p: any) => void;
  lessonId: string;
  slideId: string;
  VoiceFields: React.ReactNode;
}) {
  const items: PhonicsItem[] = Array.isArray(slide.phonics_items) && slide.phonics_items.length > 0
    ? slide.phonics_items
    : (slide.example_words || []).map((w: string) => ({ word: w, image_url: '', audio_url: '', spoken_text: '' }));

  const setItems = (next: PhonicsItem[]) => {
    onChange({
      phonics_items: next,
      example_words: next.map((it) => it.word).filter(Boolean),
    });
  };
  const updateItem = (i: number, patch: Partial<PhonicsItem>) =>
    setItems(items.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const addItem = () => setItems([...items, { word: '', image_url: '', audio_url: '', spoken_text: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const [busyAudio, setBusyAudio] = useState<number | null>(null);
  const [busySoundIso, setBusySoundIso] = useState(false);

  const generateItemAudio = async (i: number) => {
    const it = items[i];
    const text = (it.spoken_text || it.word || '').trim();
    if (!text) { toast.error('Add the word or spoken text first'); return; }
    setBusyAudio(i);
    try {
      const { generateSlideVoiceover } = await import('@/components/creator-studio/steps/slide-studio/mediaGeneration');
      const res = await generateSlideVoiceover(text, lessonId, `${slideId}-phon-${i}`);
      updateItem(i, { audio_url: res.url });
      toast.success(`Audio generated for "${it.word}"`);
    } catch (e: any) {
      toast.error(e?.message || 'Audio generation failed');
    } finally { setBusyAudio(null); }
  };

  const generateIsolatedSound = async () => {
    const grapheme = (slide.grapheme || '').trim();
    if (!grapheme) { toast.error('Set the grapheme first'); return; }
    setBusySoundIso(true);
    try {
      const { generateSlideVoiceover } = await import('@/components/creator-studio/steps/slide-studio/mediaGeneration');
      const res = await generateSlideVoiceover(grapheme, lessonId, `${slideId}-grapheme`, undefined, 'phonetic');
      onChange({ audio_url: res.url, voice: { ...(slide.voice || {}), text: grapheme, audio_url: res.url, autoPlay: true } });
      toast.success('Phonetic sound generated');
    } catch (e: any) {
      toast.error(e?.message || 'Sound generation failed');
    } finally { setBusySoundIso(false); }
  };

  return (
    <div className="space-y-3">
      <Field label="Grapheme / Letter (large display)">
        <input className={inputCls} value={slide.grapheme || ''} onChange={(e) => onChange({ grapheme: e.target.value })} placeholder="a" />
      </Field>
      <Field label="Phoneme (IPA)">
        <input className={inputCls} value={slide.phoneme || ''} onChange={(e) => onChange({ phoneme: e.target.value, sound_ipa: e.target.value })} placeholder="/æ/" />
      </Field>
      <Field label="Headline (optional)">
        <input className={inputCls} value={slide.label || ''} onChange={(e) => onChange({ label: e.target.value })} placeholder="Listen to the sound" />
      </Field>

      <div className="rounded-xl border-2 border-orange-100 bg-orange-50/40 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Isolated sound (🔊 Play sound)</span>
          <button
            type="button"
            onClick={generateIsolatedSound}
            disabled={busySoundIso}
            className="text-xs font-bold text-white bg-gradient-to-r from-fuchsia-500 to-orange-500 rounded-lg px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50"
          >
            {busySoundIso ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate phonetic
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Uses ElevenLabs SSML <code>&lt;phoneme&gt;</code> so the voice says the <b>sound</b> (/æ/), not the letter name (AY).
        </p>
        {slide.audio_url && <audio controls src={slide.audio_url} className="h-8 w-full mt-2" />}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Phonics Items (word + image + audio)</span>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg px-2 py-1 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Word
          </button>
        </div>
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-xs text-slate-500 italic">No words yet. Click "Add Word" to start.</p>
          )}
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border-2 border-orange-100 bg-white p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  className={inputCls + ' flex-1'}
                  placeholder={`Word ${i + 1} (e.g. CAT)`}
                  value={it.word}
                  onChange={(e) => updateItem(i, { word: e.target.value.toUpperCase() })}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-slate-400 hover:text-red-500 p-1.5"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <ImageField
                label="Image"
                url={it.image_url}
                subject={it.word}
                onChange={(url) => updateItem(i, { image_url: url })}
              />
              <Field label="Spoken text (override — leave blank to say the word)">
                <input
                  className={inputCls}
                  placeholder={`e.g. "aaah cat" or <phoneme alphabet="ipa" ph="kæt">cat</phoneme>`}
                  value={it.spoken_text || ''}
                  onChange={(e) => updateItem(i, { spoken_text: e.target.value })}
                />
              </Field>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generateItemAudio(i)}
                  disabled={busyAudio === i}
                  className="text-xs font-bold text-white bg-gradient-to-r from-fuchsia-500 to-orange-500 rounded-lg px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {busyAudio === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate audio
                </button>
                {it.audio_url && <audio controls src={it.audio_url} className="h-7 flex-1" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {VoiceFields}
    </div>
  );
}

