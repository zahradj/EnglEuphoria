import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, Download, Upload, Code2, X, Play, Sparkles, Loader2, Save, Send, FolderOpen, History, Wand2, FileUp, ArrowLeft, ClipboardCheck } from 'lucide-react';
import {
  SlideRenderer,
  themeMap,
  BLOCKS,
  type Slide,
  type Block,
  type ClusterActivity,
} from './AcademyDemo';
import { SOCIAL_MEDIA_LESSON } from '@/data/academyLessons/socialMediaHabits';
import { supabase } from '@/integrations/supabase/client';
import { normalizeCefr } from '@/services/lessonHubMapping';
import { toast } from 'sonner';
import { homeworkGuardReason } from '@/lib/homeworkGuard';
import HomeworkGenerationDialog from '@/components/creator-studio/homework/HomeworkGenerationDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SlideMediaPanel } from '@/components/creator-studio/shared/SlideMediaPanel';
import { slideIcon } from '@/components/creator-studio/shared/slideIcons';
import { InsertSlideButton } from '@/components/creator-studio/shared/InsertSlideButton';
import { PreviewModeToggle, type PreviewMode } from '@/components/creator-studio/shared/PreviewModeToggle';
import { PlayablePreviewPane } from '@/components/creator-studio/shared/PlayablePreviewPane';
import { UniversalMediaShell } from '@/components/creator-studio/shared/UniversalMediaShell';
import { PracticeItemsEditor } from '@/components/creator-studio/shared/PracticeItemsEditor';
import { PhonicsFocusCard } from '@/components/creator-studio/shared/PhonicsFocusCard';
import VocabSlideSplit from '@/components/lesson/VocabSlideSplit';
import VocabGamesSlot from '@/vocab-games/VocabGamesSlot';
import VocabGamesSlotPreviewCard from '@/vocab-games/VocabGamesSlotPreviewCard';
import { PreviewRoleToggle, type PreviewRole } from '@/components/creator-studio/shared/PreviewRoleToggle';
import GamesEditorPanel, { isGamesEditorSlide } from '@/components/creator-studio/GamesEditorPanel';
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
import { QualityPanel } from '@/components/creator-studio/QualityPanel';
import type { CreatorPublishVerdict } from '@/services/contentCreator/publishGateHelper';
import { verdictFromQualityReport } from '@/services/contentCreator/qualityReportAdapter';
import { logRepairOutcome } from '@/qa/telemetry/repairTelemetry';
import { detectLessonHub, creatorPathFor, deriveCefrLevel } from '@/utils/creatorHydration';
import { getLibraryLessonSlides } from '@/services/lessonLibraryService';
import { useAutoSave, useRevisionHistory, type LessonRevision } from '@/hooks/useAutoSaveAndHistory';
import { SaveStatusBadge } from '@/components/creator-studio/shared/SaveStatusBadge';
import { RevisionHistoryModal } from '@/components/creator-studio/shared/RevisionHistoryModal';
import { CanvasElementEditor } from '@/components/creator-studio/shared/CanvasElementEditor';
import { ScaffoldedMediaEditor } from '@/components/creator-studio/shared/ScaffoldedMediaEditor';
import { EMPTY_BLUEPRINT, type LessonBlueprint } from '@/components/creator-studio/shared/LessonBlueprintPanel';
import GenerateLessonModal from '@/components/creator-studio/shared/GenerateLessonModal';
import { WandFieldButton } from '@/components/creator-studio/shared/WandFieldButton';
import { AIToolsPanel } from '@/components/creator-studio/shared/AIToolsPanel';
import { StorybookEditor } from '@/components/creator-studio/shared/StorybookEditor';
import { StorybookRenderer } from '@/components/creator-studio/shared/StorybookRenderer';
import { mapAIQuizSlides } from '@/components/creator-studio/shared/aiQuizMapper';
import { MethodologyBadge } from '@/components/creator-studio/shared/MethodologyBadge';
import { HomeworkSlidesPreview } from '@/components/creator-studio/shared/HomeworkSlidesPreview';
import { HomeworkSlideLivePreview } from '@/components/creator-studio/shared/HomeworkSlideLivePreview';
import type { HomeworkTask } from '@/coherence/types';

/**
 * Academy Slide Creator — clean teacher-facing authoring tool.
 * Mirrors the structure of PlaygroundCreator but Academy-themed.
 */

type SlideType = Slide['type'];

const SLIDE_TYPES: { type: SlideType; label: string; defaultBlock: Block }[] = [
  { type: 'intro',            label: 'Intro / Title',          defaultBlock: 'warmup' },
  { type: 'question',         label: 'Open Question',          defaultBlock: 'warmup' },
  { type: 'opinion',          label: 'Opinion Prompt',         defaultBlock: 'warmup' },
  { type: 'poll',             label: 'Poll',                   defaultBlock: 'warmup' },
  { type: 'vocab',            label: 'Vocabulary',             defaultBlock: 'vocab' },
  { type: 'vocab_deck',       label: 'Vocabulary Deck 🃏 (paginated)', defaultBlock: 'vocab' },
  { type: 'vocab_image_match',label: 'Vocab ↔ Image (drag & drop)',   defaultBlock: 'vocab' },
  { type: 'matching',         label: 'Matching',               defaultBlock: 'vocab' },
  { type: 'reading_passage',  label: 'Reading Passage',        defaultBlock: 'reading' },
  { type: 'listening',        label: 'Listening',              defaultBlock: 'reading' },
  { type: 'multiple',         label: 'Multiple Choice',        defaultBlock: 'practice' },
  { type: 'truefalse',        label: 'True / False',           defaultBlock: 'practice' },
  { type: 'grammar_pattern',  label: 'Grammar Pattern',        defaultBlock: 'grammar' },
  { type: 'grammar_color_decode', label: 'Grammar Color Decode 🎨', defaultBlock: 'grammar' },
  { type: 'frequency_thermometer', label: 'Frequency Thermometer 🌡️', defaultBlock: 'grammar' },
  { type: 'grammar_formula',  label: 'Grammar Formula ➕',      defaultBlock: 'grammar' },
  { type: 'error_detection',  label: 'Error Detection',        defaultBlock: 'grammar' },
  { type: 'correction',       label: 'Correction',             defaultBlock: 'grammar' },
  { type: 'fill_blank',       label: 'Fill the Blank',         defaultBlock: 'practice' },
  { type: 'sentence_builder', label: 'Sentence Builder',       defaultBlock: 'practice' },
  { type: 'debate_scale',     label: 'Debate Scale (1–5)',     defaultBlock: 'interactive' },
  { type: 'role_play',        label: 'Role Play',              defaultBlock: 'interactive' },
  { type: 'speaking_task',    label: 'Speaking Task',          defaultBlock: 'speaking' },
  { type: 'reflection',      label: 'Reflection',             defaultBlock: 'speaking' },
  { type: 'cluster',          label: 'Cluster (multi-task)',   defaultBlock: 'practice' },
  { type: 'canvas_game',      label: 'Canvas Game 🎯',          defaultBlock: 'interactive' },
  { type: 'living_canvas',    label: 'Click-to-Reveal ✨',      defaultBlock: 'interactive' },
  { type: 'scaffolded_media', label: 'Scaffolded Media 🎬',     defaultBlock: 'reading' },
  { type: 'lesson_summary',   label: 'Lesson Summary 📋',      defaultBlock: 'speaking' },
];

/** Architect-driven activity presets (reuse existing slide renderers). */
const EXTRA_PRESETS: { key: string; label: string; defaultBlock: Block; build: () => Slide }[] = [
  {
    key: 'listen_pick', label: 'Listen & Pick 🎧', defaultBlock: 'practice',
    build: () => ({ type: 'multiple', block: 'practice', prompt: '🔊 Listen, then pick the matching image.',
      items: [{ question: 'What did you hear?', options: ['option A', 'option B', 'option C', 'option D'], answer: 'option A' }] } as any),
  },
  {
    key: 'memory_match', label: 'Card-Flip Memory 🃏', defaultBlock: 'vocab',
    build: () => ({ type: 'matching', block: 'vocab', prompt: 'Flip cards to find matching pairs.',
      mode: 'memory', pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }, { left: 'C', right: '3' }] } as any),
  },
  {
    key: 'word_scramble', label: 'Word Scramble 🔀', defaultBlock: 'practice',
    build: () => ({ type: 'fill_blank', block: 'practice', prompt: 'Unscramble the letters.',
      mode: 'scramble', items: [{ before: 'TAC →', answer: 'CAT', after: '' }] } as any),
  },
  {
    key: 'image_mcq_quiz', label: 'Image-Cued Quiz 🖼️', defaultBlock: 'practice',
    build: () => ({ type: 'multiple', block: 'practice', prompt: 'Choose the best caption for the image.',
      image_url: '', items: [{ question: 'What do you see?', options: ['A', 'B', 'C', 'D'], answer: 'A' }] } as any),
  },
];

function makeSlide(type: SlideType | 'storybook'): Slide {
  if (type === 'storybook') {
    return ({
      type: 'storybook', block: 'reading',
      title: 'New Story', topic: '', layout_mode: 'comic', theme: 'school',
      pages: [{ page_number: 1, text: 'Once…', image_url: '', audio_url: '' }],
      highlight_words: [],
    } as unknown) as Slide;
  }
  const entry = SLIDE_TYPES.find((s) => s.type === type);
  if (!entry) {
    return { type: 'intro', block: 'warmup', title: 'New section', subtitle: '' } as Slide;
  }
  const block = entry.defaultBlock;
  switch (type) {
    case 'intro': return { type, block, title: 'New section', subtitle: '' };
    case 'question': return { type, block, prompt: 'Open question…', placeholder: '' };
    case 'opinion': return { type, block, prompt: 'What do you think about…?' };
    case 'poll': return { type, block, prompt: 'Poll question…', options: [{ label: 'Option A', pct: 33 }, { label: 'Option B', pct: 34 }, { label: 'Option C', pct: 33 }] };
    case 'vocab': return { type, block, word: 'word', definition: 'simple definition', example: 'Example sentence.' };
    case 'vocab_deck': return { type, block, title: 'Today\'s words', cards: [
      { word: 'word one', definition: 'simple definition', example: 'Example sentence.', image_url: '' },
      { word: 'word two', definition: 'simple definition', example: 'Example sentence.', image_url: '' },
      { word: 'word three', definition: 'simple definition', example: 'Example sentence.', image_url: '' },
    ] } as any;
    case 'vocab_image_match': return { type, block, prompt: 'Drag each word onto the matching image.', pairs: [
      { word: 'word one', image_url: '' },
      { word: 'word two', image_url: '' },
      { word: 'word three', image_url: '' },
      { word: 'word four', image_url: '' },
    ] } as any;
    case 'matching': return { type, block, prompt: 'Match the pairs.', pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }] };
    case 'reading_passage': return { type, block, title: 'Reading title', passage: 'Short reading passage goes here…' };
    case 'listening': return { type, block, prompt: 'Listen and answer.', transcript: 'Audio transcript text used for TTS playback.' };
    case 'multiple': return { type, block, prompt: 'Choose the correct answer.', items: [{ question: 'Question?', options: ['A', 'B', 'C'], answer: 'A' }] } as any;
    case 'truefalse': return { type, block, prompt: 'True or false?', items: [{ statement: 'Statement is true.', answer: true }] } as any;
    case 'grammar_pattern': return { type, block, title: 'Pattern title', rows: [{ a: 'Example 1', b: 'Example 2' }], rule: 'Rule explanation.' };
    case 'grammar_color_decode': return { type, block, title: 'Sentence anatomy', chunks: [
      { role: 'subject', text: 'She' }, { role: 'aux', text: 'is' }, { role: 'verb', text: 'watching' }, { role: 'object', text: 'TikTok' }, { role: 'time', text: 'now' },
    ], variants: [
      { chunks: [{ role: 'subject', text: 'They' }, { role: 'aux', text: 'are' }, { role: 'verb', text: 'playing' }, { role: 'object', text: 'games' }, { role: 'time', text: 'today' }] },
    ], rule: 'Subject + be + verb-ing + object + time.' } as any;
    case 'frequency_thermometer': return { type, block, title: 'How often?', shape: 'thermometer', items: [
      { adverb: 'always', pct: 100, example: 'I always brush my teeth.' },
      { adverb: 'usually', pct: 85 }, { adverb: 'often', pct: 70 }, { adverb: 'sometimes', pct: 50 },
      { adverb: 'rarely', pct: 20 }, { adverb: 'hardly ever', pct: 10 }, { adverb: 'never', pct: 0, example: 'I never skip breakfast.' },
    ] } as any;
    case 'grammar_formula': return { type, block, title: 'Present perfect formula', terms: [
      { label: 'Subject', role: 'subject' }, { label: 'have / has', role: 'aux' }, { label: 'V3 (past participle)', role: 'verb', note: 'eaten, gone, seen' },
    ], example: [{ text: 'She', role: 'subject' }, { text: 'has', role: 'aux' }, { text: 'eaten', role: 'verb' }], rule: 'Use the present perfect for experiences and recent actions.' } as any;
    case 'error_detection': return { type, block, prompt: 'Tap the wrong word.', items: [{ sentence: 'He go to school.', wrongIndex: 1 }] };
    case 'correction': return { type, block, prompt: 'Fix the sentence.', items: [{ wrong: 'She go home.', answer: 'She goes home.' }] };
    case 'fill_blank': return { type, block, prompt: 'Complete the sentence.', items: [{ before: 'He', answer: 'goes', after: 'to school.' }] };
    case 'sentence_builder': return { type, block, prompt: 'Order the words.', items: [{ words: ['I', 'a', 'have', 'phone'], answer: ['I', 'have', 'a', 'phone'] }] } as any;
    case 'debate_scale': return { type, block, prompt: 'Statement to debate.' };
    case 'role_play': return { type, block, title: 'Role play', lineA: 'Speaker A line.', lineB: 'Speaker B line.' };
    case 'speaking_task': return { type, block, prompt: 'Speak about…', starters: ['I think…', 'In my opinion…'] };
    case 'reflection': return { type, block, prompt: 'Reflect on what you learned.' };
    case 'cluster': return { type, block, title: 'Quick Drill', content: 'Apply the rule four ways below.', activities: [
      { type: 'mcq', question: 'She ___ every day.', options: ['use', 'uses', 'using'], answer: 'uses', explanation: "Use 'uses' for she/he/it." },
      { type: 'fill', text: 'He ___ (use) his phone.', answer: 'uses' },
      { type: 'tf', statement: 'He use TikTok.', answer: false },
      { type: 'build', prompt: 'Build the sentence.', words: ['I', 'use', 'my', 'phone'], answer: ['I', 'use', 'my', 'phone'] },
    ]};
    case 'canvas_game': return { type, block, title: 'Sort the Items', instruction: 'Drag each item to the correct box.', instruction_audio: 'Drag each item to the correct box.', elements: [
      { id: 'box', type: 'shape', x: 70, y: 35, width: 18, z_index: 1, interaction: 'target', color: '#c7d2fe', text: 'TARGET' } as any,
      { id: 'item1', type: 'text', text: 'Item 1', x: 20, y: 80, width: 14, z_index: 3, interaction: 'draggable', target_x: 70, target_y: 35, snap_tolerance: 10, success_sfx: 'Correct!' } as any,
    ] } as any;
    case 'living_canvas': return { type, block, title: 'Reveal the answer', instruction: 'Tap to reveal.', instruction_audio: 'Tap to reveal.', elements: [
      { id: 'answer', type: 'text', text: 'ANSWER', x: 50, y: 45, width: 30, z_index: 1, interaction: 'none', color: '#dbeafe' } as any,
      { id: 'cover', type: 'shape', x: 50, y: 45, width: 30, z_index: 5, interaction: 'reveal', reveal_anim: 'lift', color: '#1e293b', text: 'TAP', reveal_sfx: 'Here is the answer' } as any,
    ] } as any;
    case 'scaffolded_media': return { type, block, title: 'Listening Checkpoints', media_url: '', media_kind: 'youtube', segments: [
      { start_time: 0, end_time: 30, question: { prompt: 'What did the speaker say?', options: ['A', 'B', 'C'], answer: 'A' } },
    ] } as any;
    case 'lesson_summary': return { type, block, title: 'Review Sheet', vocab_recap: [], grammar_recap: '', takeaway: '' };
  }
}

function slideTitle(s: Slide): string {
  switch (s.type) {
    case 'intro': return s.title;
    case 'reading_passage': return s.title;
    case 'role_play': return s.title;
    case 'grammar_pattern': return s.title;
    case 'vocab': return s.word;
    case 'multiple': return (s as any).items?.[0]?.question ?? (s as any).question ?? (s as any).prompt ?? 'Multiple choice';
    case 'truefalse': return (s as any).items?.[0]?.statement ?? (s as any).statement ?? (s as any).prompt ?? 'True / False';
    case 'correction': return (s as any).items?.[0]?.wrong ?? (s as any).wrong ?? s.prompt;
    case 'cluster': return s.title;
    default: return (s as any).prompt ?? s.type;
  }
}

const inputCls = 'w-full border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 rounded-lg px-3 py-2 outline-none text-slate-900 bg-white text-sm transition';
const labelCls = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className={labelCls}>{label}</span>{children}</label>;
}

import { useForceEnglishLocale } from '@/hooks/useForceEnglishLocale';

export default function AcademyCreator() {
  useForceEnglishLocale();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLessonId = searchParams.get('lessonId');

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/content-creator');
  };

  const [slides, setSlides] = useState<Slide[]>(SOCIAL_MEDIA_LESSON.slides);
  const [title, setTitle] = useState(SOCIAL_MEDIA_LESSON.title);
  const [level, setLevel] = useState(SOCIAL_MEDIA_LESSON.level);
  const [selected, setSelected] = useState(0);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [homeworkOpen, setHomeworkOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<{ task: HomeworkTask; index: number } | null>(null);
  const [aiTopic, setAiTopic] = useState('Social media habits');
  const [aiLevel, setAiLevel] = useState('A2');
  const [aiGrammar, setAiGrammar] = useState('Present simple');
  const [aiBusy, setAiBusy] = useState(false);
  const [blueprint, setBlueprint] = useState<LessonBlueprint | null>(null);
  const [aiCriticReport, setAiCriticReport] = useState<{
    verdict: 'pass' | 'needs_repair';
    scores: Record<string, number>;
    issues: { dimension: string; note: string }[];
    repair_instructions: string;
  } | null>(null);

  // ── Hydrate from Curriculum Blueprint hand-off (router state) ────
  const location = useLocation();
  useEffect(() => {
    const st: any = location.state;
    if (!st || !st.fromBlueprint) return;
    if (st.lessonTitle) {
      setTitle(st.lessonTitle);
      setAiTopic(st.lessonTitle);
    }
    if (st.cefrLevel) {
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
        // plan-lesson-blueprint computes these — carry them through so the
        // publish-time objective gate (MISSING_LEARNING_OBJECTIVE) doesn't
        // fire for a lesson that already has one from the Curriculum Map.
        learning_objective: bp.learning_objective || st.objective || '',
        final_output_task: bp.final_output_task || '',
      } as LessonBlueprint);
    } else if (st.skill_focus) {
      setBlueprint({ vocabulary: ['', '', '', '', ''], grammar: st.skill_focus, interests: '', specific_needs: '', target_phonics: '' });
    }
    toast.success('📋 Blueprint loaded — ready to generate slides');
    if (st.autoOpen) setAiOpen(true);
    navigate(location.pathname + location.search, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('editor');
  const [previewRole, setPreviewRole] = useState<PreviewRole>('teacher');
  const [vaultOpen, setVaultOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [bulkAudioOpen, setBulkAudioOpen] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [publishTemplateOpen, setPublishTemplateOpen] = useState(false);

  const lessonHook = useCreatorLesson({ hub: 'academy', initialLessonId });

  useEffect(() => {
    const lesson = lessonHook.lesson;
    if (!lesson) return;
    const detected = detectLessonHub(lesson);
    if (detected && detected !== 'academy') {
      navigate(`${creatorPathFor(detected)}?lessonId=${lesson.id}`, { replace: true });
      return;
    }
    const dbSlides = getLibraryLessonSlides(lesson) as Slide[];
    if (!Array.isArray(dbSlides) || dbSlides.length === 0) {
      toast.message('This lesson has no slides yet — starting with a blank deck');
    } else {
      setSlides(dbSlides);
      const storyIdx = dbSlides.findIndex((s: any) => s?.type === 'storybook');
      setSelected(storyIdx >= 0 ? storyIdx : 0);
    }
    if (lesson.title) {
      setTitle(lesson.title);
      setAiTopic(lesson.title);
    }
    if (lesson.difficulty_level) setLevel(lesson.difficulty_level);
    setAiLevel(deriveCefrLevel(lesson, 'academy'));
    const meta: any = (lesson as any).ai_metadata;
    if (meta?.lesson_blueprint) setBlueprint(meta.lesson_blueprint as LessonBlueprint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonHook.lesson?.id]);

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
      if (payload.hub && payload.hub !== 'academy') return;
      if (Array.isArray(payload.slides) && payload.slides.length > 0) {
        setSlides(payload.slides);
        setSelected(0);
        if (payload.title) setTitle(payload.title);
        if (payload.level) setLevel(payload.level);
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

  const generateWithAI = async (payload: import('@/components/creator-studio/shared/GenerateLessonModal').GenerateLessonPayload) => {
    const topic = payload.topic.trim();
    if (!topic) return;
    setAiBusy(true);
    try {
      const interests = payload.interests?.trim() || blueprint?.interests?.trim();
      const specific_needs = payload.specific_needs?.trim() || blueprint?.specific_needs?.trim();

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
      setAiGrammar(payload.grammar);
      setTitle(topic);
      setLevel(payload.level);

      const { data: prevRows } = await supabase
        .from('curriculum_lessons').select('title')
        .order('created_at', { ascending: false }).limit(5);
      const previous_topics = (prevRows || []).map((r: any) => r.title).filter(Boolean);

      // ── Expert Curriculum Architect (optional pre-pass) ─────────────
      const { runCreatorArchitect, applyArchitectOverridesToPayload } = await import('@/architect/bridge');
      const { overrides: architectOverrides } = await runCreatorArchitect('academy', payload.level, {
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
        objective: payload.learning_objective || `60-minute teen Academy lesson on ${topic}. Target vocabulary: ${payload.vocabulary.join(', ')}. Target grammar: ${payload.grammar}.`,
        skill_focus: 'Integrated',
        cefr_level: payload.level,
        hub: 'academy',
        target_hub: 'academy',
        hub_type: 'academy',
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
          target_hub: 'academy',
          interests,
          specific_needs,
          language_variant: payload.language_variant,
          visual_theme: payload.visual_theme,
          learning_objective: payload.learning_objective,
          final_output_task: payload.final_output_task,
        },
        starring_character: payload.starring_character,
      };

      const { data, error } = await supabase.functions.invoke('generate-ppp-slides', {
        body: applyArchitectOverridesToPayload(basePayload, architectOverrides),
      });
      if (error || data?.error) {
        const { extractEdgeError } = await import('@/lib/extractEdgeError');
        throw new Error(await extractEdgeError({ error, data, fallback: 'AI generation failed' }));
      }
      const academySlides: Slide[] | undefined = data?.academy_slides || data?.slides;
      if (!academySlides || !Array.isArray(academySlides) || academySlides.length === 0) {
        const keys = data && typeof data === 'object' ? Object.keys(data).join(', ') : 'none';
        throw new Error(`AI returned no Academy slides. Response keys: [${keys}]`);
      }
      // AI Quality Critic report (server-side senior-teacher-trainer review,
      // separate from the deterministic checks in lastQAReport). Absent on
      // older/undeployed edge function versions — treat as optional.
      setAiCriticReport(data?.quality_report ?? null);

      // ── Vocabulary safety net ──────────────────────────────────────────
      // The AI sometimes returns fewer vocab slides than the target list. Make sure
      // every target word has a slide; backfill missing ones at the end of the
      // vocab block using the word as a placeholder definition the teacher can edit.
      const targetWords = (payload.vocabulary || [])
        .map((w) => (typeof w === 'string' ? w.trim() : ''))
        .filter(Boolean);
      // Vocabulary can arrive as flat "vocab" slides (one per word) or as a
      // single paginated "vocab_deck" (cards[]) / "vocab_image_match"
      // (pairs[]) — check all three shapes, or every AI-generated deck reads
      // as "0 vocab cards" and gets its real words replaced with blank
      // backfills below.
      const presentWords = new Set<string>();
      for (const s of academySlides as any[]) {
        if (s.type === 'vocab' && typeof s.word === 'string') {
          presentWords.add(s.word.trim().toLowerCase());
        } else if (s.type === 'vocab_deck' && Array.isArray(s.cards)) {
          for (const c of s.cards) if (typeof c?.word === 'string') presentWords.add(c.word.trim().toLowerCase());
        } else if (s.type === 'vocab_image_match' && Array.isArray(s.pairs)) {
          for (const p of s.pairs) if (typeof p?.word === 'string') presentWords.add(p.word.trim().toLowerCase());
        }
      }
      const missingWords = targetWords.filter((w) => !presentWords.has(w.toLowerCase()));
      let backfilledSlides: Slide[] = academySlides;
      if (missingWords.length > 0) {
        const lastVocabIdx = (() => {
          for (let i = backfilledSlides.length - 1; i >= 0; i--) {
            if ((backfilledSlides[i] as any).type === 'vocab') return i;
          }
          // No flat "vocab" slide (deck used vocab_deck/vocab_image_match
          // instead) — fall back to the last slide in the vocab block so
          // backfills land inside that block, not appended after "speaking".
          for (let i = backfilledSlides.length - 1; i >= 0; i--) {
            if ((backfilledSlides[i] as any).block === 'vocab') return i;
          }
          return -1;
        })();
        const newCards: Slide[] = missingWords.map((w) => ({
          type: 'vocab',
          block: 'vocab',
          word: w,
          definition: '',
          example: '',
        } as Slide));
        const insertAt = lastVocabIdx >= 0 ? lastVocabIdx + 1 : backfilledSlides.length;
        backfilledSlides = [
          ...backfilledSlides.slice(0, insertAt),
          ...newCards,
          ...backfilledSlides.slice(insertAt),
        ];
        toast.warning(
          `AI returned ${targetWords.length - missingWords.length}/${targetWords.length} vocab cards — backfilled ${missingWords.length} (${missingWords.join(', ')}). Auto-generating definitions & examples…`,
          { duration: 12000 },
        );
      }

      // Auto-generate definition + example for any vocab card missing them.
      try {
        const { fillMissingVocabCards } = await import('@/lib/fillMissingVocabCards');
        const filled = await fillMissingVocabCards(backfilledSlides as any[], {
          hub: 'academy',
          cefr: payload.level,
          topic,
        });
        if (filled.filled > 0) {
          backfilledSlides = filled.slides as Slide[];
          toast.success(`Filled ${filled.filled} vocab definition/example field(s).`, { duration: 5000 });
        }
      } catch (e) {
        console.warn('[AcademyCreator] fillMissingVocabCards failed', e);
      }

      // ── Vocab gamification for low-CEFR learners ──────────────────────
      // Pre-A1 / A1 / A2 need visual + retrieval reinforcement to memorize
      // lexis. Inject a 3-slide arc (image-match → memory → def-match) bound
      // to target_vocabulary. Skips if AI already gamified or CEFR is high.
      const { injectAcademyVocabGamification } = await import('@/lib/academyVocabGamification');
      const gamified = injectAcademyVocabGamification(
        backfilledSlides as any,
        targetWords,
        payload.level,
      );
      if (gamified.injected > 0) {
        toast.success(`Added ${gamified.injected} vocab reinforcement games 🎯 (CEFR ${payload.level})`, { duration: 6000 });
      }
      const gamifiedSlides = gamified.slides as Slide[];

      // ── Bulk-fill images for injected vocab_image_match pairs ─────────
      // Visual Architect V3: single subject / hub style / guard tail is
      // already baked into image_prompt. We just need to run each prompt
      // through ai-image-generation and populate image_url deterministically.
      if (gamified.injected > 0) {
        const { generateSlideImage } = await import('@/services/lessonImageService');
        toast.info('🖼️ Generating vocab match images…', { duration: 4000 });
        for (const slide of gamifiedSlides) {
          if ((slide as any).type !== 'vocab_image_match') continue;
          const pairs = (slide as any).pairs as Array<{ word: string; image_url: string; image_prompt: string }>;
          for (let i = 0; i < pairs.length; i++) {
            const p = pairs[i];
            if (p.image_url || !p.image_prompt) continue;
            const res = await generateSlideImage(`vocab-match-${p.word}`, p.image_prompt, 'cartoon');
            if (res.imageUrl) p.image_url = res.imageUrl;
            await new Promise((r) => setTimeout(r, 400));
          }
        }
      }

      const finalSlides = gamifiedSlides.some((s: any) => s.type === 'lesson_summary')
        ? gamifiedSlides
        : [...gamifiedSlides, makeSlide('lesson_summary')];
      setSlides(finalSlides);
      setSelected(0);
      setAiOpen(false);
      toast.success(`Generated ${finalSlides.length} slides ✨`);
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

  const t = themeMap.light;
  const safeSelected = Math.max(0, Math.min(selected, Math.max(0, slides.length - 1)));
  const current = slides[safeSelected];

  const grouped = useMemo(() => {
    const m: Record<Block, { slide: Slide; idx: number }[]> = { warmup: [], vocab: [], reading: [], grammar: [], practice: [], interactive: [], speaking: [] };
    slides.forEach((s, idx) => {
      const block = (s?.block && (m as any)[s.block]) ? s.block : 'warmup';
      m[block as Block].push({ slide: s, idx });
    });
    return m;
  }, [slides]);

  const update = (patch: Partial<Slide>) =>
    setSlides((p) => p.map((s, i) => (i === selected ? ({ ...s, ...patch } as Slide) : s)));

  const addSlide = (type: SlideType) => {
    setSlides((p) => {
      const next = [...p, makeSlide(type)];
      setSelected(next.length - 1);
      return next;
    });
    setPickerOpen(false);
  };

  const addCustomSlide = (slide: Slide) => {
    setSlides((p) => {
      const next = [...p, slide];
      setSelected(next.length - 1);
      return next;
    });
    setPickerOpen(false);
  };

  // Insert quiz slides directly after the current slide
  const insertAfterCurrent = (extra: Slide[]) => {
    setSlides((prev) => {
      const at = Math.min(selected + 1, prev.length);
      return [...prev.slice(0, at), ...extra, ...prev.slice(at)];
    });
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    setSlides((p) => { const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n; });
    setSelected(j);
  };
  const dup = (i: number) => {
    setSlides((p) => { const n = [...p]; n.splice(i + 1, 0, JSON.parse(JSON.stringify(p[i]))); return n; });
    setSelected(i + 1);
  };
  const del = (i: number) => {
    if (slides.length === 1) return;
    setSlides((p) => p.filter((_, x) => x !== i));
    setSelected((s) => Math.max(0, Math.min(s, slides.length - 2)));
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
    silentSaveDraft: (s, m) => lessonHook.silentSaveDraft(s, { ...m, level, blueprint }),
  });

  const [publishVerdict, setPublishVerdict] = useState<CreatorPublishVerdict | null>(null);
  const criticResultForSave = (): { verdict: string; overall: number } | null => {
    if (!aiCriticReport) return null;
    const values = Object.values(aiCriticReport.scores ?? {});
    const overall = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    return { verdict: aiCriticReport.verdict, overall };
  };
  const handleSaveDraft = async () => {
    const id = await lessonHook.saveDraft(slides, { title, level, blueprint, criticResult: criticResultForSave() });
    if (id) history.captureRevision({ title, slides, kind: 'manual' });
    if (lessonHook.lastQAReport) setPublishVerdict(verdictFromQualityReport(lessonHook.lastQAReport));
  };
  const handlePublish = async () => {
    try {
      const id = await lessonHook.publish(slides, { title, level, blueprint, criticResult: criticResultForSave() });
      if (id) history.captureRevision({ title, slides, kind: 'publish' });
    } finally {
      if (lessonHook.lastQAReport) {
        const v = verdictFromQualityReport(lessonHook.lastQAReport);
        setPublishVerdict(v);
        void logRepairOutcome(
          { lessonId: lessonHook.lessonId ?? undefined, hub: 'academy', cefr: level, decision: v.decision, overallScore: v.overall, issues: (lessonHook.lastQAReport as any)?.issues },
          supabase as any,
        );
        // Auto-heal: if QA flagged missing vocab gamification arc, inject
        // idempotently and prompt user to re-publish.
        try {
          const { autoHealVocabGamificationFromVerdict } = await import('@/lib/vocabGamificationRepair');
          const healed = autoHealVocabGamificationFromVerdict(slides as any[], v.decision.repair_codes ?? [], 'academy', level);
          if (healed.injected > 0) {
            setSlides(healed.slides as Slide[]);
            toast.success(`Auto-healed: added ${healed.injected} vocab reinforcement slide(s). Re-publish to apply.`, { duration: 8000 });
          }
        } catch (e) { console.warn('[AcademyCreator] vocab gamification auto-heal failed', e); }
      }
    }
  };
  const handleRestore = (rev: LessonRevision) => {
    const restored = Array.isArray(rev.content?.slides) ? rev.content.slides : [];
    if (restored.length === 0) { toast.error('Snapshot has no slides'); return; }
    setSlides(restored);
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
    setSlides(dbSlides);
    setTitle(lesson.title || 'Imported lesson');
    if (lesson.difficulty_level) setLevel(lesson.difficulty_level);
    setSelected(0);
    toast.success(`Loaded "${lesson.title}"`);
  };

  const slideId = `slide-${selected}`;

  const exportJson = () => {
    const payload = { id: 'custom-' + Date.now(), title, level, durationMin: 60, slides };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const p = JSON.parse(String(r.result));
        const s = Array.isArray(p) ? p : p.slides;
        if (!Array.isArray(s) || s.length === 0) throw new Error('Expected slides array');
        setSlides(s);
        if (p.title) setTitle(p.title);
        if (p.level) setLevel(p.level);
        setSelected(0);
      } catch (e: any) { alert('Invalid JSON: ' + e.message); }
    };
    r.readAsText(file);
  };

  const [openingClassroom, setOpeningClassroom] = useState(false);
  const openClassroom = async () => {
    // Persist current edits first so this preview can never drift from what's
    // actually stored in curriculum_lessons — the classroom preview used to
    // show whatever was in the editor's in-memory state, which could be
    // unsaved changes a student would never actually see.
    setOpeningClassroom(true);
    try {
      await lessonHook.silentSaveDraft(slides, { title, level, blueprint });
    } catch (e) {
      console.warn('[AcademyCreator] pre-preview save failed (non-fatal)', e);
    } finally {
      setOpeningClassroom(false);
    }
    (window as any).__ACADEMY_DECK__ = slides;
    (window as any).__ACADEMY_DECK_META__ = { title, level };
    navigate('/academy-classroom');
  };

  if (!current) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-md border-2 border-purple-200 p-8 max-w-md text-center space-y-4">
          <div className="text-xs font-bold text-purple-600 tracking-wider uppercase">Academy · Slide Creator</div>
          <h2 className="text-xl font-bold text-slate-900">No slides yet</h2>
          <p className="text-sm text-slate-600">This lesson has no slides. Generate a deck with AI or add a slide to get started.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setAiOpen(true)} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md">
              Generate with AI
            </button>
            <button onClick={() => setPickerOpen(true)} className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">
              Add a slide
            </button>
          </div>
          <button onClick={goBack} className="text-xs text-slate-500 hover:text-slate-700 underline">Back</button>
        </div>
        {pickerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPickerOpen(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Add a slide</h3>
                <button onClick={() => setPickerOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SLIDE_TYPES.map((s) => (
                  <button key={s.type} onClick={() => addSlide(s.type)}
                    className="text-left p-3 rounded-xl border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition">
                    <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">{s.defaultBlock}</div>
                    <div className="text-sm font-semibold text-slate-800">{s.label}</div>
                  </button>
                ))}
                {EXTRA_PRESETS.map((p) => (
                  <button key={p.key} onClick={() => addCustomSlide(p.build())}
                    className="text-left p-3 rounded-xl border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-50 transition">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{p.defaultBlock} · architect</div>
                    <div className="text-sm font-semibold text-slate-800">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <GenerateLessonModal
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          hub="academy"
          defaultTopic={aiTopic}
          defaultLevel={aiLevel}
          defaultVocabulary={blueprint?.vocabulary}
          defaultGrammar={blueprint?.grammar || aiGrammar}
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
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b-4 border-purple-500 shadow-sm">
        <div className="w-full px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={goBack}
              title="Back"
              className="flex items-center gap-1 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">E</div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-purple-600 tracking-wider uppercase">Academy · Slide Creator</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-purple-500 w-full"
              />
            </div>
          </div>
          <div className="flex items-center flex-wrap justify-end gap-2 flex-shrink min-w-0">
            {/* Group A — Lesson config */}
            <div className="flex items-center gap-1.5">
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                className="border-2 border-purple-300 rounded-xl px-3 py-2 text-xs font-bold text-purple-700 bg-white"
                aria-label="Lesson CEFR level">
                {/* Academy × CEFR: Pre-A1 → C1 (per Hub × CEFR matrix) */}
                <option>Pre-A1</option>
                <option>A1</option>
                <option>A2</option>
                <option>B1</option>
                <option>A2 / B1</option>
                <option>B2</option>
                <option>C1</option>
              </select>

              <SaveStatusBadge status={autoSave.status} lastSavedAt={autoSave.lastSavedAt} />
              <button
                onClick={() => setHistoryOpen(true)}
                disabled={!lessonHook.lessonId}
                title={lessonHook.lessonId ? 'Revision history' : 'Save the lesson once to enable history'}
                className="inline-flex items-center gap-1.5 border-2 border-purple-300 text-purple-700 font-bold rounded-xl px-2.5 py-2 text-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            <div className="h-7 w-px bg-purple-200" />

            {/* Group B — File & content tools */}
            <div className="flex items-center gap-1.5">
              <label className="cursor-pointer inline-flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                <Upload className="w-4 h-4" /> Import
                <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
              </label>
              <button onClick={exportJson} className="inline-flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={() => { setJsonDraft(JSON.stringify(slides, null, 2)); setJsonError(null); setJsonOpen(true); }}
                className="inline-flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                <Code2 className="w-4 h-4" /> JSON
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                    <FolderOpen className="w-4 h-4" /> Library
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-2 max-h-96 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-2 py-1">Import from Library</div>
                  {lessonHook.isLoadingLibrary ? (
                    <div className="p-3 text-xs text-slate-500"><Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Loading…</div>
                  ) : lessonHook.library.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500">No saved Academy lessons yet.</div>
                  ) : (
                    lessonHook.library.map((l) => (
                      <button key={l.id} onClick={() => handleImportFromLibrary(l.id)}
                        className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-purple-50 text-sm">
                        <div className="font-semibold text-slate-800 truncate">{l.title}</div>
                        <div className="text-[10px] text-slate-500">{l.is_published ? 'Published' : 'Draft'} · {(l.content as any)?.slides?.length ?? 0} slides</div>
                      </button>
                    ))
                  )}
                </PopoverContent>
              </Popover>
              <button
                onClick={() => setVaultOpen(true)}
                className="inline-flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95"
                title="Open Asset Vault"
              >
                <FolderOpen className="w-4 h-4" /> Vault
              </button>
              <button
                onClick={() => setTemplatesOpen(true)}
                className="inline-flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95"
                title="Insert pre-built slide templates"
              >
                <Sparkles className="w-4 h-4" /> Templates
              </button>
              <BulkActionsMenu
                hub="academy"
                missingAudioCount={findSlidesMissingAudio(slides).length}
                onGenerateMissingAudio={() => setBulkAudioOpen(true)}
                onPublishTemplate={() => setPublishTemplateOpen(true)}
                canPublishTemplate={slides.length >= 8}
              />
              <button
                onClick={() => setImportOpen(true)}
                title="Convert raw text into a full lesson"
                className="inline-flex items-center gap-2 border-2 border-purple-400 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 hover:bg-purple-50"
              >
                <FileUp className="w-4 h-4" /> Import text
              </button>
            </div>

            <div className="h-7 w-px bg-purple-200" />

            {/* Group C — Primary actions */}
            <div className="flex items-center gap-1.5">
              <button onClick={handleSaveDraft} disabled={lessonHook.isSaving}
                className="inline-flex items-center gap-2 border-2 border-purple-400 text-purple-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 disabled:opacity-50">
                {lessonHook.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
              </button>
              <button onClick={handlePublish} disabled={lessonHook.isSaving}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50">
                {lessonHook.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish
              </button>
              <button onClick={() => setAiOpen(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95">
                <Sparkles className="w-4 h-4" /> Generate AI
              </button>
              {(() => {
                const reason = homeworkGuardReason(lessonHook.lessonId, blueprint);
                return (
                  <button
                    disabled={!!reason}
                    title={reason || 'Generate homework from this lesson'}
                    onClick={() => setHomeworkOpen(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ClipboardCheck className="w-4 h-4" /> Homework
                  </button>
                );
              })()}
              <button onClick={openClassroom} disabled={openingClassroom} title="Preview — saves your current draft first, then opens it exactly as it will look for students"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50">
                {openingClassroom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Classroom
              </button>
            </div>
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

      {aiCriticReport && (
        <div className="px-4 pt-3">
          <div className={`rounded-xl border-2 p-3 text-xs ${aiCriticReport.verdict === 'pass' ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-800">
                AI Teacher-Trainer Review — {aiCriticReport.verdict === 'pass' ? '✅ Pass' : '⚠️ Needs work'}
              </span>
              <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-slate-500">
                {Object.entries(aiCriticReport.scores ?? {}).map(([dim, score]) => (
                  <span key={dim}>{dim.replace(/_/g, ' ')}: {score}</span>
                ))}
              </span>
            </div>
            {aiCriticReport.issues?.length > 0 && (
              <ul className="mt-1.5 list-disc pl-4 text-slate-600 space-y-0.5">
                {aiCriticReport.issues.map((iss, i) => (
                  <li key={i}><strong>{iss.dimension.replace(/_/g, ' ')}:</strong> {iss.note}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[240px_1fr_380px] gap-4 p-4 min-h-0">
        {/* Left: slide list grouped by block */}
        <aside className="min-h-0 flex flex-col order-1">
          <div className="bg-white rounded-2xl shadow-md border-2 border-purple-200 p-3 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-2 py-1 mb-2 flex-shrink-0">
              <h2 className="text-xs font-bold text-purple-600 tracking-wider uppercase">Slides · {slides.length}</h2>
              <button onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1 text-purple-600 hover:bg-purple-50 rounded-md px-2 py-1 text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 min-h-0">
              {BLOCKS.map((b) => {
                const items = grouped[b.id];
                if (items.length === 0) return null;
                return (
                  <div key={b.id}>
                    <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-2 mb-1">{b.label}</div>
                    <div className="space-y-1">
                      {items.map(({ slide: s, idx }, k) => {
                        const Icon = slideIcon((s as any).type);
                        return (
                        <div key={idx}>
                          {(idx > 0) && (
                            <InsertSlideButton
                              hub="academy"
                              options={[
                                { type: 'storybook', label: 'Storybook', emoji: '📖' },
                                { type: 'scaffolded_media', label: 'Media Analyzer', emoji: '🎬' },
                                { type: 'canvas_game', label: 'Canvas Game', emoji: '🎮' },
                                { type: 'vocab_solo', label: 'Vocab Card', emoji: '✨' },
                                { type: 'phonics_focus', label: 'Phonics Focus', emoji: '🔊' },
                              ]}
                              onInsert={(t) => { setSlides((p) => { const n = [...p]; n.splice(idx, 0, makeSlide(t as SlideType)); return n; }); setSelected(idx); }}
                            />
                          )}
                          <button onClick={() => { setSelected(idx); setSelectedHomework(null); }}
                          className={`w-full text-left rounded-lg p-2 border transition ${
                            idx === selected ? 'border-purple-500 bg-purple-50' : 'border-transparent hover:bg-slate-50'
                          }`}>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-semibold text-purple-500 inline-flex items-center gap-1.5">
                              <Icon className="w-3 h-3" />
                              {s.type === 'lesson_summary' ? `🔒 #${idx + 1} · auto-summary` : `#${idx + 1} · ${s.type}`}
                            </span>
                            {s.type !== 'lesson_summary' && (
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                                <span onClick={(e) => { e.stopPropagation(); move(idx, -1); }} className="hover:text-purple-600 cursor-pointer"><ChevronUp className="w-3 h-3" /></span>
                                <span onClick={(e) => { e.stopPropagation(); move(idx, 1); }} className="hover:text-purple-600 cursor-pointer"><ChevronDown className="w-3 h-3" /></span>
                                <span onClick={(e) => { e.stopPropagation(); dup(idx); }} className="hover:text-purple-600 cursor-pointer"><Copy className="w-3 h-3" /></span>
                                <span onClick={(e) => { e.stopPropagation(); del(idx); }} className="hover:text-red-500 cursor-pointer"><Trash2 className="w-3 h-3" /></span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-slate-700 truncate font-medium">
                            {s.type === 'lesson_summary' ? 'Auto-Summary (system)' : slideTitle(s)}
                          </div>
                          {s.type !== 'lesson_summary' && (
                            <div className="flex gap-1 mt-1">
                              <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); move(idx, -1); }} className="text-slate-400 hover:text-purple-600 cursor-pointer"><ChevronUp className="w-3 h-3" /></span>
                              <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); move(idx, 1); }} className="text-slate-400 hover:text-purple-600 cursor-pointer"><ChevronDown className="w-3 h-3" /></span>
                              <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); dup(idx); }} className="text-slate-400 hover:text-purple-600 cursor-pointer"><Copy className="w-3 h-3" /></span>
                              <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); del(idx); }} className="text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3 h-3" /></span>
                            </div>
                          )}
                        </button>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <HomeworkSlidesPreview
                hub="academy"
                title={lessonHook.lesson?.title || title}
                slides={slides as any}
                selectedTaskIndex={selectedHomework?.index ?? null}
                onSelect={(task, index) => setSelectedHomework({ task, index })}
              />
            </div>
          </div>
        </aside>


        {/* Middle: live preview (CENTER) */}
        <section className="min-h-0 flex flex-col order-2">
          <div className="bg-white rounded-2xl shadow-md border-2 border-purple-200 p-3 flex flex-col flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-2 gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-purple-600 tracking-wider uppercase">Live Preview</h2>
              <div className="flex items-center gap-2">
                <PreviewRoleToggle value={previewRole} onChange={setPreviewRole} hub="academy" />
                <PreviewModeToggle value={previewMode} onChange={setPreviewMode} hub="academy" />
              </div>
            </div>
            {selectedHomework ? (
              <HomeworkSlideLivePreview hub="academy" task={selectedHomework.task} taskNumber={selectedHomework.index + 1} />
            ) : (
              <PlayablePreviewPane
                mode={previewMode}
                slides={slides}
                startIndex={selected}
                hub="academy"
                previewRole={previewRole}
                getTeacherNotes={(s) => (s as any).teacher_notes}
                renderSlide={(slide) => {
                const sType = (slide as any).type;
                const isPhonics = sType === 'phonics_focus';
                const isStorybook = sType === 'storybook';
                const isVocab = sType === 'vocab' || sType === 'vocab_solo';
                const isVocabGames = sType === 'vocab_games_slot';
                return (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 min-h-[450px] flex items-center justify-center">
                    <div className="w-full">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-semibold mb-3 text-center">
                        {BLOCKS.find((b) => b.id === (slide as Slide).block)?.label}
                      </div>
                      {isVocabGames ? (
                        (() => {
                          const s = slide as any;
                          return (
                            <VocabGamesSlotPreviewCard
                              hub={s.hub ?? 'academy'}
                              cefr={s.cefr ?? 'A2'}
                              lessonId={String(s.lessonId ?? '')}
                              unitId={s.unitId}
                              unitTitle={s.unitTitle}
                              targets={s.targets ?? []}
                              mode={s.mode ?? 'lesson'}
                              passThreshold={s.passThreshold}
                              maxGames={s.maxGames}
                            />
                          );
                        })()
                      ) : isPhonics ? (
                        <PhonicsFocusCard slide={slide as any} hub="academy" />
                      ) : isStorybook ? (
                        <StorybookRenderer slide={slide as any} hub="academy" />
                      ) : isVocab ? (
                        (() => {
                          const s = slide as any;
                          return (
                            <VocabSlideSplit
                              hub="academy"
                              word={s.word}
                              phonetic_spelling={s.phonetic_spelling}
                              definition={s.definition}
                              example_sentence={s.example}
                              image_url={s.image_url}
                              audio_url={s.audio_url || s.voice?.audio_url}
                            />
                          );
                        })()
                      ) : (
                        <UniversalMediaShell slide={slide as any} hub="academy">
                          <SlideRenderer slide={slide as Slide} t={t} />
                        </UniversalMediaShell>
                      )}
                    </div>
                  </div>
                );
                }}
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

        {/* Right: editor */}
        <section className="min-h-0 flex flex-col order-3">
          <div className="bg-white rounded-2xl shadow-md border-2 border-purple-200 p-6 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 gap-2 flex-shrink-0">
              <h2 className="text-xs font-bold text-purple-600 tracking-wider uppercase">
                Edit · #{selected + 1} · {current.type}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTunerOpen(true)}
                  title="Rewrite this slide easier or harder for a target CEFR level"
                  className="inline-flex items-center gap-1 text-xs font-semibold border border-purple-300 text-purple-700 rounded-md px-2 py-1 hover:bg-purple-50"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Tune difficulty
                </button>
                <select
                  value={current.block}
                  onChange={(e) => update({ block: e.target.value as Block } as any)}
                  className="text-xs font-semibold border border-slate-300 rounded-md px-2 py-1 bg-white"
                >
                  {BLOCKS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>
            </div>
            <Tabs defaultValue="basic" className="w-full flex-1 flex flex-col min-h-0">
              <TabsList className="grid grid-cols-3 w-full flex-shrink-0">
                <TabsTrigger value="basic">Content</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="ai">AI Tools</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="pt-4 flex-1 overflow-y-auto min-h-0">
                {isGamesEditorSlide((current as any).type) ? (
                  <GamesEditorPanel
                    slide={current as any}
                    onChange={(patch) => update(patch as Partial<Slide>)}
                    hub="academy"
                    cefrLevel={level}
                    topic={title}
                  />
                ) : (current as any).type === 'storybook' ? (
                  <StorybookEditor
                    slide={current as any}
                    hub="academy"
                    cefrLevel={level}
                    targetVocab={blueprint?.vocabulary || []}
                    grammarFocus={blueprint?.grammar || ''}
                    lessonTitle={title}
                    lessonSlides={slides}
                    onPatch={(patch) => update(patch as unknown as Partial<Slide>)}
                    onAppendQuiz={(quiz) => insertAfterCurrent(mapAIQuizSlides(quiz, 'academy') as Slide[])}
                  />
                ) : current.type === 'canvas_game' || current.type === 'living_canvas' ? (
                  <CanvasElementEditor slide={current as any} hub="academy" onChange={(next) => update(next as Partial<Slide>)} />
                ) : current.type === 'scaffolded_media' ? (
                  <ScaffoldedMediaEditor slide={current as any} hub="academy" onChange={(next) => update(next as Partial<Slide>)} />
                ) : (
                  <SlideEditor slide={current} onChange={update} blueprint={blueprint} hub="academy" cefrLevel={level} />
                )}
              </TabsContent>
              <TabsContent value="media" className="pt-4 flex-1 overflow-y-auto min-h-0">
                <SlideMediaPanel
                  slide={current as any}
                  onPatch={(patch) => update(patch as Partial<Slide>)}
                  hub="academy"
                  lessonId={lessonHook.lessonId}
                  slideId={slideId}
                  enableFlashcards={current.type === 'vocab' || current.type === 'matching'}
                />
              </TabsContent>
              <TabsContent value="ai" className="pt-4 flex-1 overflow-y-auto min-h-0">
                <AIToolsPanel
                  hub="academy"
                  lessonId={lessonHook.lessonId}
                  slideId={slideId}
                  onTuneDifficulty={() => setTunerOpen(true)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>

      {/* Add-slide picker modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPickerOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add a slide</h3>
              <button onClick={() => setPickerOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SLIDE_TYPES.map((s) => (
                <button key={s.type} onClick={() => addSlide(s.type)}
                  className="text-left p-3 rounded-xl border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition">
                  <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">{s.defaultBlock}</div>
                  <div className="text-sm font-semibold text-slate-800">{s.label}</div>
                </button>
              ))}
              {EXTRA_PRESETS.map((p) => (
                <button key={p.key} onClick={() => addCustomSlide(p.build())}
                  className="text-left p-3 rounded-xl border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-50 transition">
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{p.defaultBlock} · architect</div>
                  <div className="text-sm font-semibold text-slate-800">{p.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* JSON modal */}
      {jsonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Edit Lesson JSON</h3>
              <button onClick={() => setJsonOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <textarea value={jsonDraft} onChange={(e) => setJsonDraft(e.target.value)}
              className="flex-1 font-mono text-xs p-4 outline-none resize-none" spellCheck={false} />
            {jsonError && <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-t border-red-200">{jsonError}</div>}
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setJsonOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => {
                try {
                  const p = JSON.parse(jsonDraft);
                  if (!Array.isArray(p) || p.length === 0) throw new Error('Expected non-empty array of slides');
                  setSlides(p); setSelected(0); setJsonOpen(false);
                } catch (e: any) { setJsonError(e.message); }
              }} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* AI generation modal */}
      <GenerateLessonModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        hub="academy"
        defaultTopic={aiTopic}
        defaultLevel={aiLevel}
        defaultVocabulary={blueprint?.vocabulary}
        defaultGrammar={blueprint?.grammar || aiGrammar}
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
        hub="academy"
        onPick={({ url, field }) => update({ [field]: url } as any)}
      />

      <HomeworkGenerationDialog
        open={homeworkOpen}
        onOpenChange={setHomeworkOpen}
        input={{
          lessonId: lessonHook.lessonId,
          blueprint,
          title: lessonHook.lesson?.title || 'Lesson',
          hub: 'academy',
        }}
      />


      <SlideTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        hub="academy"
        makeSlide={(t) => makeSlide(t as SlideType)}
        onInsert={(newSlides, tpl) => {
          setSlides((p) => {
            const next = [...p, ...newSlides];
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
          setSlides((p) => p.map((s, i) => (i === idx ? ({ ...s, ...patch } as Slide) : s)))
        }
      />

      <DifficultyTunerDialog
        open={tunerOpen}
        onOpenChange={setTunerOpen}
        slide={current}
        onPatch={(patch) => update(patch as Partial<Slide>)}
        hub="academy"
      />

      <ImportFromTextDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultHub="academy"
      />

      <PublishTemplateDialog
        open={publishTemplateOpen}
        onOpenChange={setPublishTemplateOpen}
        hub="academy"
        title={title}
        level={level}
        slides={slides}
      />
    </div>
  );
}

// ─── Type-aware editor ─────────────────────────────────────────────────────
function SlideEditor({ slide, onChange, blueprint, hub = 'academy', cefrLevel = 'A2' }: { slide: Slide; onChange: (p: Partial<Slide>) => void; blueprint?: LessonBlueprint | null; hub?: 'playground' | 'academy' | 'success'; cefrLevel?: string }) {
  const wand = (field: string, current: string, apply: (v: string) => void) => (
    <WandFieldButton field={field} currentValue={current} slideType={slide.type} hub={hub} cefrLevel={cefrLevel} blueprint={blueprint} onResult={apply} />
  );
  const row = (children: React.ReactNode, w: React.ReactNode) => (
    <div className="flex gap-2 items-center">{children}{w}</div>
  );
  switch (slide.type) {
    case 'intro':
      return (
        <div className="space-y-3">
          <Field label="Title">{row(<input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} />, wand('title', slide.title, (v) => onChange({ title: v } as any)))}</Field>
          <Field label="Subtitle">{row(<input className={inputCls} value={slide.subtitle || ''} onChange={(e) => onChange({ subtitle: e.target.value } as any)} />, wand('subtitle', slide.subtitle || '', (v) => onChange({ subtitle: v } as any)))}</Field>
        </div>
      );
    case 'question':
      return (
        <div className="space-y-3">
          <Field label="Prompt">{row(<input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} />, wand('prompt', slide.prompt, (v) => onChange({ prompt: v } as any)))}</Field>
          <Field label="Placeholder"><input className={inputCls} value={slide.placeholder || ''} onChange={(e) => onChange({ placeholder: e.target.value } as any)} /></Field>
        </div>
      );
    case 'opinion':
    case 'reflection':
    case 'debate_scale':
      return <Field label="Prompt">{row(<textarea className={inputCls + ' h-24'} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} />, wand('prompt', slide.prompt, (v) => onChange({ prompt: v } as any)))}</Field>;

    case 'poll':
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <div>
            <span className={labelCls}>Options & %</span>
            <div className="space-y-2">
              {slide.options.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls + ' flex-1'} value={o.label}
                    onChange={(e) => { const n = [...slide.options]; n[i] = { ...o, label: e.target.value }; onChange({ options: n } as any); }} />
                  <input type="number" className={inputCls + ' w-20'} value={o.pct}
                    onChange={(e) => { const n = [...slide.options]; n[i] = { ...o, pct: Number(e.target.value) }; onChange({ options: n } as any); }} />
                  <button onClick={() => onChange({ options: slide.options.filter((_, j) => j !== i) } as any)} className="text-red-500 hover:bg-red-50 rounded-lg px-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => onChange({ options: [...slide.options, { label: 'New option', pct: 0 }] } as any)}
              className="mt-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded px-2 py-1 inline-flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add option
            </button>
          </div>
        </div>
      );

    case 'vocab':
      return (
        <div className="space-y-3">
          <Field label="Word">{row(<input className={inputCls} value={slide.word} onChange={(e) => onChange({ word: e.target.value } as any)} />, wand('word', slide.word, (v) => onChange({ word: v } as any)))}</Field>
          <Field label="Definition">{row(<input className={inputCls} value={slide.definition} onChange={(e) => onChange({ definition: e.target.value } as any)} />, wand('definition', slide.definition, (v) => onChange({ definition: v } as any)))}</Field>
          <Field label="Example">{row(<input className={inputCls} value={slide.example || ''} onChange={(e) => onChange({ example: e.target.value } as any)} />, wand('example', slide.example || '', (v) => onChange({ example: v } as any)))}</Field>
        </div>
      );

    case 'matching':
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <div>
            <span className={labelCls}>Pairs</span>
            <div className="space-y-2">
              {slide.pairs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls + ' flex-1'} placeholder="Left" value={p.left}
                    onChange={(e) => { const n = [...slide.pairs]; n[i] = { ...p, left: e.target.value }; onChange({ pairs: n } as any); }} />
                  <input className={inputCls + ' flex-1'} placeholder="Right" value={p.right}
                    onChange={(e) => { const n = [...slide.pairs]; n[i] = { ...p, right: e.target.value }; onChange({ pairs: n } as any); }} />
                  <button onClick={() => onChange({ pairs: slide.pairs.filter((_, j) => j !== i) } as any)} className="text-red-500 hover:bg-red-50 rounded-lg px-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => onChange({ pairs: [...slide.pairs, { left: '', right: '' }] } as any)}
              className="mt-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded px-2 py-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add pair</button>
          </div>
        </div>
      );

    case 'vocab_image_match': {
      const pairs = (slide as any).pairs as Array<{ word: string; image_url: string; image_prompt?: string }>;
      const setPairs = (n: typeof pairs) => onChange({ pairs: n } as any);
      const patch = (i: number, p: Partial<{ word: string; image_url: string; image_prompt: string }>) => {
        const n = pairs.slice(); n[i] = { ...n[i], ...p }; setPairs(n);
      };
      const genImage = async (i: number) => {
        const p = pairs[i]; if (!p?.word) return;
        const promptText = p.image_prompt?.trim() || `A single "${p.word}" on a soft pastel background, centered, thick outlines, child-safe. NO TEXT.`;
        try {
          const { data } = await supabase.functions.invoke('ai-image-generation', { body: { prompt: promptText, style: 'educational' } });
          const url = (data as any)?.imageUrl || (data as any)?.url;
          if (url) patch(i, { image_url: url });
        } catch { /* noop */ }
      };
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={(slide as any).prompt || ''} onChange={(e) => onChange({ prompt: e.target.value } as any)} placeholder="Drag each word onto the matching image." /></Field>
          <div>
            <span className={labelCls}>Word ↔ Image pairs</span>
            <div className="space-y-3 mt-2">
              {pairs.map((p, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                    <input className={inputCls + ' flex-1'} placeholder="Word" value={p.word || ''}
                      onChange={(e) => patch(i, { word: e.target.value })} />
                    <button onClick={() => setPairs(pairs.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 rounded-lg px-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="w-16 h-16 rounded-md border border-slate-200 bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                      {p.image_url ? <img src={p.image_url} alt={p.word} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-300">no img</span>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input className={inputCls} placeholder="image_prompt (optional)" value={p.image_prompt || ''}
                        onChange={(e) => patch(i, { image_prompt: e.target.value })} />
                      <div className="flex gap-2">
                        <input className={inputCls + ' flex-1 text-xs'} placeholder="image_url" value={p.image_url || ''}
                          onChange={(e) => patch(i, { image_url: e.target.value })} />
                        <button onClick={() => genImage(i)} disabled={!p.word}
                          className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50 whitespace-nowrap">
                          <Sparkles className="w-3 h-3" /> Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setPairs([...pairs, { word: '', image_url: '', image_prompt: '' }])}
              className="mt-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded px-2 py-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add pair</button>
          </div>
        </div>
      );
    }

    case 'reading_passage':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Passage"><textarea className={inputCls + ' h-40'} value={slide.passage} onChange={(e) => onChange({ passage: e.target.value } as any)} /></Field>
        </div>
      );

    case 'listening':
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <Field label="Transcript (used for voice playback)"><textarea className={inputCls + ' h-32'} value={slide.transcript} onChange={(e) => onChange({ transcript: e.target.value } as any)} /></Field>
        </div>
      );

    case 'multiple': {
      const items = (slide as any).items ?? (
        (slide as any).question != null || Array.isArray((slide as any).options)
          ? [{
              question: (slide as any).question ?? '',
              options: Array.isArray((slide as any).options) ? (slide as any).options : ['A', 'B', 'C'],
              answer: (slide as any).answer ?? '',
            }]
          : []
      );
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={(slide as any).prompt ?? ''} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <PracticeItemsEditor
            slideType={'multiple' as any}
            items={items}
            onChange={(next) => onChange({ items: next, question: undefined, options: undefined, answer: undefined } as any)}
            renderRow={(it, _i, update) => (
              <div className="space-y-2">
                <input className={inputCls} placeholder="Question" value={it.question || ''} onChange={(e) => update({ question: e.target.value })} />
                <textarea className={inputCls + ' h-20'} placeholder="Options (one per line)" value={(it.options || []).join('\n')}
                  onChange={(e) => {
                    const opts = e.target.value.split('\n').filter(Boolean);
                    const stillValid = opts.includes(it.answer);
                    update({ options: opts, answer: stillValid ? it.answer : (opts[0] || '') });
                  }} />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Correct:</span>
                  <select className={inputCls + ' flex-1'} value={it.answer || ''} onChange={(e) => update({ answer: e.target.value })}>
                    {(it.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            )}
            newItem={() => ({ question: 'New question?', options: ['A', 'B', 'C'], answer: 'A' })}
            slide={slide}
          />
        </div>
      );
    }

    case 'truefalse': {
      const items = (slide as any).items ?? (
        (slide as any).statement != null || (slide as any).answer != null
          ? [{ statement: (slide as any).statement ?? '', answer: !!(slide as any).answer }]
          : []
      );
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={(slide as any).prompt ?? ''} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <PracticeItemsEditor
            slideType={'truefalse' as any}
            items={items}
            onChange={(next) => onChange({ items: next, statement: undefined, answer: undefined } as any)}
            renderRow={(it, _i, update) => (
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <input className={inputCls} placeholder="Statement" value={it.statement || ''} onChange={(e) => update({ statement: e.target.value })} />
                <select className={inputCls + ' w-28'} value={it.answer ? 'true' : 'false'} onChange={(e) => update({ answer: e.target.value === 'true' })}>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            )}
            newItem={() => ({ statement: 'New statement.', answer: true })}
            slide={slide}
          />
        </div>
      );
    }

    case 'grammar_pattern':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Rule"><input className={inputCls} value={slide.rule || ''} onChange={(e) => onChange({ rule: e.target.value } as any)} /></Field>
          <div>
            <span className={labelCls}>Comparison rows</span>
            <div className="space-y-2">
              {slide.rows.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls + ' flex-1'} placeholder="Column A" value={r.a}
                    onChange={(e) => { const n = [...slide.rows]; n[i] = { ...r, a: e.target.value }; onChange({ rows: n } as any); }} />
                  <input className={inputCls + ' flex-1'} placeholder="Column B" value={r.b}
                    onChange={(e) => { const n = [...slide.rows]; n[i] = { ...r, b: e.target.value }; onChange({ rows: n } as any); }} />
                  <button onClick={() => onChange({ rows: slide.rows.filter((_, j) => j !== i) } as any)} className="text-red-500 hover:bg-red-50 rounded-lg px-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => onChange({ rows: [...slide.rows, { a: '', b: '' }] } as any)} className="mt-2 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded px-2 py-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add row</button>
          </div>
        </div>
      );

    case 'error_detection': {
      const items = (slide as any).items ?? (
        (slide as any).sentence != null
          ? [{ sentence: (slide as any).sentence, wrongIndex: (slide as any).wrongIndex ?? 0 }]
          : []
      );
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <PracticeItemsEditor
            slideType="error_detection"
            items={items}
            onChange={(next) => onChange({ items: next, sentence: undefined, wrongIndex: undefined } as any)}
            renderRow={(it, _i, update) => {
              const wordCount = String(it.sentence || '').split(' ').length;
              return (
                <div className="space-y-2">
                  <input className={inputCls} placeholder="Sentence (with one wrong word)" value={it.sentence || ''} onChange={(e) => update({ sentence: e.target.value })} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Wrong word index (0…{Math.max(0, wordCount - 1)}):</span>
                    <input type="number" min={0} max={Math.max(0, wordCount - 1)} className={inputCls + ' w-20'}
                      value={it.wrongIndex ?? 0} onChange={(e) => update({ wrongIndex: Number(e.target.value) })} />
                  </div>
                  <div className="text-xs text-slate-500 break-words">
                    {String(it.sentence || '').split(' ').map((w: string, k: number) => (
                      <span key={k} className={k === (it.wrongIndex ?? 0) ? 'text-red-500 font-bold' : ''}>{w} </span>
                    ))}
                  </div>
                </div>
              );
            }}
            newItem={() => ({ sentence: 'New sentence here.', wrongIndex: 0 })}
            slide={slide}
          />
        </div>
      );
    }

    case 'correction': {
      const items = (slide as any).items ?? (
        (slide as any).wrong != null || (slide as any).answer != null
          ? [{ wrong: (slide as any).wrong || '', answer: (slide as any).answer || '' }]
          : []
      );
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <PracticeItemsEditor
            slideType="correction"
            items={items}
            onChange={(next) => onChange({ items: next, wrong: undefined, answer: undefined } as any)}
            renderRow={(it, _i, update) => (
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Wrong sentence" value={it.wrong || ''} onChange={(e) => update({ wrong: e.target.value })} />
                <input className={inputCls} placeholder="Correct sentence" value={it.answer || ''} onChange={(e) => update({ answer: e.target.value })} />
              </div>
            )}
            newItem={() => ({ wrong: '', answer: '' })}
            slide={slide}
          />
        </div>
      );
    }

    case 'fill_blank': {
      const items = (slide as any).items ?? (
        ((slide as any).before != null || (slide as any).after != null || (slide as any).answer != null)
          ? [{ before: (slide as any).before || '', answer: (slide as any).answer || '', after: (slide as any).after || '' }]
          : []
      );
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <PracticeItemsEditor
            slideType="fill_blank"
            items={items}
            onChange={(next) => onChange({ items: next, before: undefined, answer: undefined, after: undefined } as any)}
            renderRow={(it, _i, update) => (
              <div className="grid grid-cols-3 gap-2">
                <input className={inputCls} placeholder="Before" value={it.before || ''} onChange={(e) => update({ before: e.target.value })} />
                <input className={inputCls} placeholder="Answer" value={it.answer || ''} onChange={(e) => update({ answer: e.target.value })} />
                <input className={inputCls} placeholder="After" value={it.after || ''} onChange={(e) => update({ after: e.target.value })} />
              </div>
            )}
            newItem={() => ({ before: '', answer: '', after: '' })}
            slide={slide}
          />
        </div>
      );
    }

    case 'sentence_builder': {
      const items = (slide as any).items ?? (
        Array.isArray((slide as any).words) || Array.isArray((slide as any).answer)
          ? [{
              words: Array.isArray((slide as any).words) ? (slide as any).words : [],
              answer: Array.isArray((slide as any).answer) ? (slide as any).answer : [],
            }]
          : []
      );
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <PracticeItemsEditor
            slideType={'sentence_builder' as any}
            items={items}
            onChange={(next) => onChange({ items: next, words: undefined, answer: undefined } as any)}
            renderRow={(it, _i, update) => (
              <div className="space-y-2">
                <input className={inputCls} placeholder="Word bank (comma separated, will be shuffled)"
                  value={(it.words || []).join(', ')}
                  onChange={(e) => update({ words: e.target.value.split(',').map((w: string) => w.trim()).filter(Boolean) })} />
                <input className={inputCls} placeholder="Correct order (comma separated)"
                  value={(it.answer || []).join(', ')}
                  onChange={(e) => update({ answer: e.target.value.split(',').map((w: string) => w.trim()).filter(Boolean) })} />
              </div>
            )}
            newItem={() => ({ words: ['I', 'a', 'have', 'phone'], answer: ['I', 'have', 'a', 'phone'] })}
            slide={slide}
          />
        </div>
      );
    }

    case 'role_play':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Speaker A"><input className={inputCls} value={slide.lineA} onChange={(e) => onChange({ lineA: e.target.value } as any)} /></Field>
          <Field label="Speaker B"><input className={inputCls} value={slide.lineB} onChange={(e) => onChange({ lineB: e.target.value } as any)} /></Field>
        </div>
      );

    case 'speaking_task':
      return (
        <div className="space-y-3">
          <Field label="Prompt"><textarea className={inputCls + ' h-20'} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <Field label="Sentence starters (one per line, optional)">
            <textarea className={inputCls + ' h-24'} value={(slide.starters || []).join('\n')}
              onChange={(e) => onChange({ starters: e.target.value.split('\n').filter(Boolean) } as any)} />
          </Field>
        </div>
      );

    case 'cluster': {
      const update = (next: ClusterActivity[]) => onChange({ activities: next } as any);
      const blank = (type: ClusterActivity['type']): ClusterActivity => {
        switch (type) {
          case 'mcq': return { type, question: 'New question?', options: ['A', 'B', 'C'], answer: 'A' };
          case 'fill': return { type, text: 'Fill ___ blank.', answer: 'the' };
          case 'tf': return { type, statement: 'New statement.', answer: true };
          case 'build': return { type, prompt: 'Build the sentence.', words: ['I', 'am', 'here'], answer: ['I', 'am', 'here'] };
        }
      };
      return (
        <div className="space-y-3">
          <Field label="Slide title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Intro / context (optional)">
            <textarea className={inputCls + ' h-16'} value={slide.content || ''} onChange={(e) => onChange({ content: e.target.value } as any)} />
          </Field>
          <div>
            <span className={labelCls}>Activities ({slide.activities.length})</span>
            <div className="space-y-3">
              {slide.activities.map((a, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">#{i + 1} · {a.type}</span>
                    <button onClick={() => update(slide.activities.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 rounded px-2 py-1 text-xs"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  {a.type === 'mcq' && (
                    <>
                      <input className={inputCls} value={a.question} onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, question: e.target.value }; update(n); }} />
                      <input className={inputCls} value={a.options.join(', ')} placeholder="Options (comma separated)"
                        onChange={(e) => { const opts = e.target.value.split(',').map((w) => w.trim()).filter(Boolean); const n = [...slide.activities]; n[i] = { ...a, options: opts }; update(n); }} />
                      <input className={inputCls} value={a.answer} placeholder="Correct answer (must match an option)"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, answer: e.target.value }; update(n); }} />
                      <input className={inputCls} value={a.explanation || ''} placeholder="Explanation when wrong (optional)"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, explanation: e.target.value }; update(n); }} />
                    </>
                  )}
                  {a.type === 'fill' && (
                    <>
                      <input className={inputCls} value={a.text} placeholder="Sentence with ___"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, text: e.target.value }; update(n); }} />
                      <input className={inputCls} value={a.answer} placeholder="Answer"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, answer: e.target.value }; update(n); }} />
                    </>
                  )}
                  {a.type === 'tf' && (
                    <>
                      <input className={inputCls} value={a.statement} placeholder="Statement"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, statement: e.target.value }; update(n); }} />
                      <select className={inputCls} value={a.answer ? 'true' : 'false'}
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, answer: e.target.value === 'true' }; update(n); }}>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </>
                  )}
                  {a.type === 'build' && (
                    <>
                      <input className={inputCls} value={a.prompt || ''} placeholder="Prompt"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, prompt: e.target.value }; update(n); }} />
                      <input className={inputCls} value={a.words.join(', ')} placeholder="Word bank (comma separated)"
                        onChange={(e) => { const words = e.target.value.split(',').map((w) => w.trim()).filter(Boolean); const n = [...slide.activities]; n[i] = { ...a, words }; update(n); }} />
                      <input className={inputCls} value={a.answer.join(', ')} placeholder="Correct order (comma separated)"
                        onChange={(e) => { const answer = e.target.value.split(',').map((w) => w.trim()).filter(Boolean); const n = [...slide.activities]; n[i] = { ...a, answer }; update(n); }} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(['mcq', 'fill', 'tf', 'build'] as const).map((tp) => (
                <button key={tp} onClick={() => update([...slide.activities, blank(tp)])}
                  className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add {tp.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case 'lesson_summary':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={(slide as any).title || ''} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Vocabulary recap (one word per line)">
            <textarea className={inputCls + ' h-24'} value={(slide as any).vocab_recap?.join('\n') || ''}
              onChange={(e) => onChange({ vocab_recap: e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean) } as any)} />
          </Field>
          <Field label="Grammar rule"><input className={inputCls} value={(slide as any).grammar_recap || ''} onChange={(e) => onChange({ grammar_recap: e.target.value } as any)} /></Field>
          <Field label="Takeaway"><textarea className={inputCls + ' h-20'} value={(slide as any).takeaway || ''} onChange={(e) => onChange({ takeaway: e.target.value } as any)} /></Field>
        </div>
      );
  }
}
