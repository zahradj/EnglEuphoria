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
} from './SuccessDemo';
import { MAKING_REQUESTS_AT_WORK } from '@/data/successLessons/makingRequestsAtWork';
import { supabase } from '@/integrations/supabase/client';
import { normalizeCefr } from '@/services/lessonHubMapping';
import { toast } from 'sonner';
import { homeworkGuardReason } from '@/lib/homeworkGuard';
import HomeworkGenerationDialog from '@/components/creator-studio/homework/HomeworkGenerationDialog';
import { handleAIResponse } from '@/lib/aiErrorHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SlideMediaPanel } from '@/components/creator-studio/shared/SlideMediaPanel';
import { slideIcon } from '@/components/creator-studio/shared/slideIcons';
import { InsertSlideButton } from '@/components/creator-studio/shared/InsertSlideButton';
import { PreviewModeToggle, type PreviewMode } from '@/components/creator-studio/shared/PreviewModeToggle';
import { PlayablePreviewPane } from '@/components/creator-studio/shared/PlayablePreviewPane';
import { UniversalMediaShell } from '@/components/creator-studio/shared/UniversalMediaShell';
import { PhonicsFocusCard } from '@/components/creator-studio/shared/PhonicsFocusCard';
import VocabGamesSlot from '@/vocab-games/VocabGamesSlot';
import VocabGamesSlotPreviewCard from '@/vocab-games/VocabGamesSlotPreviewCard';
import { PracticeItemsEditor } from '@/components/creator-studio/shared/PracticeItemsEditor';
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
import { HomeworkSlidesPreview } from '@/components/creator-studio/shared/HomeworkSlidesPreview';
import { HomeworkSlideLivePreview } from '@/components/creator-studio/shared/HomeworkSlideLivePreview';
import type { HomeworkTask } from '@/coherence/types';

/**
 * Success Slide Creator — adult Business English authoring tool.
 * Mirrors AcademyCreator with mint/emerald palette and Success slide types.
 */

type SlideType = Slide['type'];

const SLIDE_TYPES: { type: SlideType; label: string; defaultBlock: Block }[] = [
  { type: 'intro',              label: 'Intro / Title',          defaultBlock: 'warmup' },
  { type: 'question',           label: 'Open Question',          defaultBlock: 'warmup' },
  { type: 'opinion',            label: 'Opinion (multi-choice)', defaultBlock: 'warmup' },
  { type: 'vocab',              label: 'Vocabulary',             defaultBlock: 'vocab' },
  { type: 'matching',           label: 'Matching',               defaultBlock: 'vocab' },
  { type: 'reading_passage',    label: 'Reading Passage',        defaultBlock: 'context' },
  { type: 'listening',          label: 'Listening',              defaultBlock: 'context' },
  { type: 'multiple',           label: 'Multiple Choice',        defaultBlock: 'context' },
  { type: 'tone_compare',       label: 'Tone Compare',           defaultBlock: 'functional' },
  { type: 'functional_pattern', label: 'Functional Pattern',     defaultBlock: 'functional' },
  { type: 'rewrite',            label: 'Rewrite (polite)',       defaultBlock: 'practice' },
  { type: 'fill_blank',         label: 'Fill the Blank',         defaultBlock: 'practice' },
  { type: 'cluster',            label: 'Cluster (multi-task)',   defaultBlock: 'practice' },
  { type: 'scenario',           label: 'Scenario',               defaultBlock: 'simulation' },
  { type: 'email_task',         label: 'Email Task',             defaultBlock: 'simulation' },
  { type: 'role_play',          label: 'Role Play',              defaultBlock: 'simulation' },
  { type: 'speaking_task',      label: 'Speaking Task',          defaultBlock: 'output' },
  { type: 'reflection',         label: 'Reflection',             defaultBlock: 'output' },
  { type: 'canvas_game',        label: 'Canvas Game 🎯',          defaultBlock: 'simulation' },
  { type: 'living_canvas',      label: 'Click-to-Reveal ✨',      defaultBlock: 'simulation' },
  { type: 'scaffolded_media',   label: 'Scaffolded Media 🎬',     defaultBlock: 'context' },
  { type: 'lesson_summary',     label: 'Lesson Summary 📋',      defaultBlock: 'buffer' },
];

/** Architect-driven activity presets (reuse existing slide renderers). */
const EXTRA_PRESETS: { key: string; label: string; defaultBlock: Block; build: () => Slide }[] = [
  {
    key: 'listen_pick', label: 'Listen & Pick 🎧', defaultBlock: 'context',
    build: () => ({ type: 'multiple', block: 'context', prompt: '🔊 Listen, then pick the matching option.',
      items: [{ question: 'What did the speaker say?', options: ['option A', 'option B', 'option C', 'option D'], answer: 'option A' }] } as any),
  },
  {
    key: 'memory_match', label: 'Card-Flip Memory 🃏', defaultBlock: 'vocab',
    build: () => ({ type: 'matching', block: 'vocab', prompt: 'Flip cards to find matching pairs.',
      mode: 'memory', pairs: [{ left: 'term A', right: 'definition A' }, { left: 'term B', right: 'definition B' }, { left: 'term C', right: 'definition C' }] } as any),
  },
  {
    key: 'word_scramble', label: 'Word Scramble 🔀', defaultBlock: 'practice',
    build: () => ({ type: 'fill_blank', block: 'practice', prompt: 'Unscramble the term.',
      mode: 'scramble', items: [{ before: 'EGOTIATION →', answer: 'NEGOTIATION', after: '' }] } as any),
  },
  {
    key: 'image_mcq_quiz', label: 'Image-Cued Quiz 🖼️', defaultBlock: 'practice',
    build: () => ({ type: 'multiple', block: 'practice', prompt: 'Read the situation in the image and choose the best response.',
      image_url: '', items: [{ question: 'Best professional reply?', options: ['A', 'B', 'C', 'D'], answer: 'A' }] } as any),
  },
];

function makeSlide(type: SlideType | 'storybook'): Slide {
  if (type === 'storybook') {
    return ({
      type: 'storybook', block: 'context',
      title: 'New Case Study', topic: '', layout_mode: 'case_study', theme: 'business_trip',
      pages: [{ page_number: 1, text: 'Background…', image_url: '', audio_url: '' }],
      highlight_words: [],
    } as unknown) as Slide;
  }
  const entry = SLIDE_TYPES.find((s) => s.type === type);
  if (!entry) {
    return { type: 'intro', block: 'warmup', title: 'New section', subtitle: '' } as Slide;
  }
  const block = entry.defaultBlock;
  switch (type) {
    case 'intro':              return { type, block, title: 'New section', subtitle: '' };
    case 'question':           return { type, block, prompt: 'Open question…', placeholder: '' };
    case 'opinion':            return { type, block, prompt: 'What do you think?', options: ['Option A', 'Option B', 'Option C'] };
    case 'vocab':              return { type, block, word: 'word', definition: 'professional definition', example: 'Use the word in a workplace example.' };
    case 'matching':           return { type, block, prompt: 'Match the pairs.', pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }] };
    case 'reading_passage':    return { type, block, title: 'Short message', passage: 'Hi team, I hope you are well…' };
    case 'listening':          return { type, block, prompt: 'Listen and answer.', transcript: 'Audio transcript used for TTS playback.' };
    case 'multiple':           return { type, block, prompt: 'Choose the correct answer.', items: [{ question: 'Question?', options: ['A', 'B', 'C'], answer: 'A' }] } as any;
    case 'tone_compare':       return { type, block, title: 'Direct vs. Polite', direct: 'Send me the file.', polite: 'Could you please send me the file when you have a moment?', note: 'Polite forms protect relationships in professional settings.' };
    case 'functional_pattern': return { type, block, title: 'Pattern title', rule: 'Rule explanation.', examples: ['Example 1', 'Example 2', 'Example 3'] };
    case 'rewrite':            return { type, block, prompt: 'Rewrite to sound more professional.', original: 'I need this now.', instruction: 'Use a polite modal and add context.', sample: 'Could you please share this when you have a moment?' };
    case 'fill_blank':         return { type, block, prompt: 'Complete the polite request.', items: [{ before: 'Would you mind', answer: 'sending', after: 'me the figures?' }] } as any;
    case 'cluster':            return { type, block, title: 'Quick Drill', content: 'Apply the patterns to short scenarios.', activities: [
      { type: 'mcq', question: '___ you send me the report?', options: ['Can', 'Could', 'Do'], answer: 'Could', explanation: '“Could” is more polite for written requests.' },
      { type: 'fill', text: 'Could you please ___ (send) me the agenda?', answer: 'send' },
      { type: 'rewrite', text: 'Send me the file.', instruction: 'Make it polite.', sample: 'Could you please send me the file?' },
    ]};
    case 'scenario':           return { type, block, title: 'Scenario', situation: 'Describe the workplace situation here.', task: 'Write a short, polite response (2–3 sentences).', placeholder: 'Hi [name], could you please…' };
    case 'email_task':         return { type, block, subject: 'Quick request', brief: 'Write a short, polite email to your colleague…', sample: 'Hi [name],\n\nI hope you are well. Could you please…\n\nThanks very much,\n[Your name]' };
    case 'role_play':          return { type, block, title: 'Role play', roleA: 'Manager', roleB: 'Employee', lineA: 'Could you give me a quick update?', lineB: 'Of course. We are on track.' };
    case 'speaking_task':      return { type, block, prompt: 'Speak about a recent workplace situation.', starters: ['When you have a moment…', 'Would you mind…'] };
    case 'reflection':         return { type, block, prompt: 'How confident do you feel using this language at work now?' };
    case 'canvas_game':        return { type, block, title: 'Sort the Items', instruction: 'Drag each item to the right column.', instruction_audio: 'Drag each item to the right column.', elements: [
      { id: 'box', type: 'shape', x: 70, y: 35, width: 18, z_index: 1, interaction: 'target', color: '#a7f3d0', text: 'TARGET' } as any,
      { id: 'item1', type: 'text', text: 'Item 1', x: 20, y: 80, width: 12, z_index: 3, interaction: 'draggable', target_x: 70, target_y: 35, snap_tolerance: 8, success_sfx: 'Correct!' } as any,
    ] } as any;
    case 'living_canvas':      return { type, block, title: 'Reveal the data', instruction: 'Tap to reveal the answer.', instruction_audio: 'Tap to reveal.', elements: [
      { id: 'data', type: 'text', text: 'KPI: 42%', x: 50, y: 45, width: 30, z_index: 1, interaction: 'none', color: '#d1fae5' } as any,
      { id: 'cover', type: 'shape', x: 50, y: 45, width: 30, z_index: 5, interaction: 'reveal', reveal_anim: 'lift', color: '#0f172a', text: 'TAP', reveal_sfx: 'Here is the figure' } as any,
    ] } as any;
    case 'scaffolded_media':   return { type, block, title: 'Listening Checkpoints', media_url: '', media_kind: 'youtube', segments: [
      { start_time: 0, end_time: 45, question: { prompt: 'What was the speakers main point?', options: ['A', 'B', 'C'], answer: 'A' } },
    ] } as any;
    case 'lesson_summary':     return { type, block, title: 'Review Sheet', vocab_recap: [], grammar_recap: '', takeaway: '' };
  }
}

function slideTitle(s: Slide): string {
  switch (s.type) {
    case 'intro': return s.title;
    case 'reading_passage': return s.title;
    case 'role_play': return s.title;
    case 'functional_pattern': return s.title;
    case 'tone_compare': return s.title;
    case 'scenario': return s.title;
    case 'email_task': return s.subject;
    case 'vocab': return s.word;
    case 'multiple': return (s as any).items?.[0]?.question ?? (s as any).question ?? (s as any).prompt ?? 'Multiple choice';
    case 'cluster': return s.title;
    default: return (s as any).prompt ?? s.type;
  }
}

const inputCls = 'w-full border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 py-2 outline-none text-slate-900 bg-white text-sm transition';
const labelCls = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className={labelCls}>{label}</span>{children}</label>;
}

import { useForceEnglishLocale } from '@/hooks/useForceEnglishLocale';

export default function SuccessCreator() {
  useForceEnglishLocale();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLessonId = searchParams.get('lessonId');

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/content-creator');
  };

  const [slides, setSlides] = useState<Slide[]>(MAKING_REQUESTS_AT_WORK.slides);
  const [title, setTitle] = useState(MAKING_REQUESTS_AT_WORK.title);
  const [level, setLevel] = useState(MAKING_REQUESTS_AT_WORK.level);
  const [selected, setSelected] = useState(0);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [homeworkOpen, setHomeworkOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<{ task: HomeworkTask; index: number } | null>(null);
  const [aiTopic, setAiTopic] = useState('Making requests at work');
  const [aiLevel, setAiLevel] = useState('B1');
  const [aiGrammar, setAiGrammar] = useState('Polite modals (could / would / would you mind)');
  const [aiBusy, setAiBusy] = useState(false);
  const [blueprint, setBlueprint] = useState<LessonBlueprint | null>(null);

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
      } as LessonBlueprint);
    } else if (st.skill_focus) {
      setBlueprint({ vocabulary: ['', '', '', '', ''], grammar: st.skill_focus, interests: '', specific_needs: '', target_phonics: '' });
    }
    toast.success('📋 Blueprint loaded — ready to generate slides');
    if (st.autoOpen) setAiOpen(true);
    navigate(location.pathname + location.search, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('editor');
  const [previewRole, setPreviewRole] = useState<PreviewRole>('teacher');
  const [vaultOpen, setVaultOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [bulkAudioOpen, setBulkAudioOpen] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [publishTemplateOpen, setPublishTemplateOpen] = useState(false);

  const lessonHook = useCreatorLesson({ hub: 'success', initialLessonId });

  useEffect(() => {
    const lesson = lessonHook.lesson;
    if (!lesson) return;
    const detected = detectLessonHub(lesson);
    if (detected && detected !== 'success') {
      navigate(`${creatorPathFor(detected)}?lessonId=${lesson.id}`, { replace: true });
      return;
    }
    const dbSlides = getLibraryLessonSlides(lesson) as Slide[];
    setSlides(dbSlides);
    setSelected(0);
    if (lesson.title) {
      setTitle(lesson.title);
      setAiTopic(lesson.title);
    }
    if (lesson.difficulty_level) setLevel(lesson.difficulty_level);
    setAiLevel(deriveCefrLevel(lesson, 'success'));
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

  useEffect(() => {
    if (searchParams.get('imported') !== '1') return;
    try {
      const raw = sessionStorage.getItem(IMPORTED_LESSON_STORAGE_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (payload.hub && payload.hub !== 'success') return;
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
      const { overrides: architectOverrides } = await runCreatorArchitect('success', payload.level, {
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
        objective: payload.learning_objective || `60-minute Business English Success lesson on ${topic}. Target vocabulary: ${payload.vocabulary.join(', ')}. Target grammar: ${payload.grammar}.`,
        skill_focus: 'Professional Communication',
        cefr_level: payload.level,
        hub: 'success',
        target_hub: 'success',
        hub_type: 'success',
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
          target_hub: 'success',
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
        const msg = await extractEdgeError({ error, data, fallback: 'AI generation failed' });
        // Auto-retry ONCE on 422 vocabulary-coverage failures (transient AI miss).
        const status = (error as any)?.context?.status;
        const looksLikeCoverage = /skipped these target words|coverage|Phase 1/i.test(msg);
        if ((status === 422 || looksLikeCoverage) && !(payload as any).__retried) {
          console.warn('[SuccessCreator] auto-retry once due to coverage gap:', msg);
          toast.message('Retrying with stricter vocabulary coverage…');
          (payload as any).__retried = true;
          setAiBusy(false);
          return generateWithAI(payload);
        }
        throw new Error(msg);
      }
      const successSlides: Slide[] | undefined =
        data?.success_slides || data?.academy_slides || data?.slides;
      if (!successSlides || !Array.isArray(successSlides) || successSlides.length === 0) {
        const keys = data && typeof data === 'object' ? Object.keys(data).join(', ') : 'none';
        throw new Error(`AI returned no Success slides. Response keys: [${keys}]`);
      }
      let finalSlides: Slide[] = successSlides.some((s: any) => s.type === 'lesson_summary')
        ? successSlides
        : [...successSlides, makeSlide('lesson_summary')];

      // Auto-generate definition + example for any vocab card missing them.
      try {
        const { fillMissingVocabCards } = await import('@/lib/fillMissingVocabCards');
        const filled = await fillMissingVocabCards(finalSlides as any[], {
          hub: 'success',
          cefr: payload.level,
          topic,
        });
        if (filled.filled > 0) {
          finalSlides = filled.slides as Slide[];
          toast.success(`Filled ${filled.filled} vocab definition/example field(s).`, { duration: 5000 });
        }
      } catch (e) {
        console.warn('[SuccessCreator] fillMissingVocabCards failed', e);
      }

      // ── Vocab gamification for A2 / B1 / B2 Success learners ────────
      // Editorial-style image match + memory + definition matching, bound to
      // target_vocabulary. Skips at C1 (proficient recall) and if AI gamified.
      const { injectSuccessVocabGamification } = await import('@/lib/successVocabGamification');
      const gamified = injectSuccessVocabGamification(
        finalSlides as any,
        payload.vocabulary || [],
        payload.level,
      );
      const withGames = gamified.slides as Slide[];
      if (gamified.injected > 0) {
        toast.success(
          `Added ${gamified.injected} vocab reinforcement games (CEFR ${payload.level})`,
          { duration: 6000 },
        );
      }

      // Bulk-fill images for injected vocab_image_match pairs.
      if (gamified.injected > 0) {
        const { generateSlideImage } = await import('@/services/lessonImageService');
        toast.info('Generating vocab match images…', { duration: 4000 });
        for (const slide of withGames) {
          if ((slide as any).type !== 'vocab_image_match') continue;
          const pairs = (slide as any).pairs as Array<{
            word: string;
            image_url: string;
            image_prompt: string;
          }>;
          for (const p of pairs) {
            if (p.image_url || !p.image_prompt) continue;
            try {
              const res = await generateSlideImage(
                `vocab-match-${p.word}`,
                p.image_prompt,
                'cartoon',
              );
              if (res.imageUrl) p.image_url = res.imageUrl;
            } catch (e) {
              console.warn('[SuccessCreator] vocab image gen failed for', p.word, e);
            }
            await new Promise((r) => setTimeout(r, 400));
          }
        }
      }

      setSlides(withGames);
      setSelected(0);
      setAiOpen(false);
      toast.success(`Generated ${withGames.length} slides ✨`);

    } catch (e: any) {
      console.error('[SuccessCreator] generation failed', e);
      const desc = String(e?.message || 'AI generation failed').slice(0, 600);
      toast.error('Generation Failed', {
        description: desc,
        duration: 20000,
        action: { label: 'Retry', onClick: () => { delete (payload as any).__retried; generateWithAI(payload); } },
      });
    } finally {
      setAiBusy(false);
    }
  };

  const t = themeMap.light;
  // Guard: if a loaded lesson has no/invalid slides, seed an intro slide so the
  // editor never tries to render `current.type` on undefined (was crashing the page).
  useEffect(() => {
    if (!Array.isArray(slides) || slides.length === 0) {
      setSlides([makeSlide('intro')]);
      setSelected(0);
    } else if (selected >= slides.length) {
      setSelected(Math.max(0, slides.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);
  const current = slides[selected] ?? slides[0] ?? makeSlide('intro');

  const grouped = useMemo(() => {
    const m: Record<Block, { slide: Slide; idx: number }[]> = { warmup: [], vocab: [], context: [], functional: [], practice: [], simulation: [], output: [], buffer: [] };
    slides.forEach((s, idx) => {
      const block = (s?.block && (m as any)[s.block]) ? s.block : 'buffer';
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

  const history = useRevisionHistory(lessonHook.lessonId);
  const [historyOpen, setHistoryOpen] = useState(false);

  const autoSave = useAutoSave({
    lessonId: lessonHook.lessonId,
    slides,
    title,
    silentSaveDraft: (s, m) => lessonHook.silentSaveDraft(s, { ...m, level, blueprint }),
  });

  const [publishVerdict, setPublishVerdict] = useState<CreatorPublishVerdict | null>(null);
  const handleSaveDraft = async () => {
    const id = await lessonHook.saveDraft(slides, { title, level, blueprint });
    if (id) history.captureRevision({ title, slides, kind: 'manual' });
    if (lessonHook.lastQAReport) setPublishVerdict(verdictFromQualityReport(lessonHook.lastQAReport));
  };
  const handlePublish = async () => {
    try {
      const id = await lessonHook.publish(slides, { title, level, blueprint });
      if (id) history.captureRevision({ title, slides, kind: 'publish' });
    } finally {
      if (lessonHook.lastQAReport) {
        const v = verdictFromQualityReport(lessonHook.lastQAReport);
        setPublishVerdict(v);
        void logRepairOutcome(
          { lessonId: lessonHook.lessonId ?? undefined, hub: 'success', cefr: level, decision: v.decision, overallScore: v.overall, issues: (lessonHook.lastQAReport as any)?.issues },
          supabase as any,
        );
        try {
          const { autoHealVocabGamificationFromVerdict } = await import('@/lib/vocabGamificationRepair');
          const healed = autoHealVocabGamificationFromVerdict(slides as any[], v.decision.repair_codes ?? [], 'success', level);
          if (healed.injected > 0) {
            setSlides(healed.slides as Slide[]);
            toast.success(`Auto-healed: added ${healed.injected} vocab reinforcement slide(s). Re-publish to apply.`, { duration: 8000 });
          }
        } catch (e) { console.warn('[SuccessCreator] vocab gamification auto-heal failed', e); }
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

  const openClassroom = () => {
    (window as any).__SUCCESS_DECK__ = slides;
    navigate('/success-demo');
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-emerald-100 via-teal-50 to-green-50 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b-4 border-emerald-500 shadow-sm">
        <div className="w-full px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={goBack}
              title="Back"
              className="flex items-center gap-1 border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">S</div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Success · Slide Creator</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-emerald-500 w-full"
              />
            </div>
          </div>
          <div className="flex items-center flex-wrap justify-end gap-2 flex-shrink min-w-0">
            {/* Group A — Lesson config */}
            <div className="flex items-center gap-1.5">
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                className="border-2 border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 bg-white"
                aria-label="Lesson CEFR level">
                {/* Success × CEFR: Pre-A1 → C1 (per Hub × CEFR matrix) */}
                <option>Pre-A1</option>
                <option>A1</option>
                <option>A2</option>
                <option>B1</option>
                <option>B2</option>
                <option>C1</option>
              </select>

              <SaveStatusBadge status={autoSave.status} lastSavedAt={autoSave.lastSavedAt} />
              <button
                onClick={() => setHistoryOpen(true)}
                disabled={!lessonHook.lessonId}
                title={lessonHook.lessonId ? 'Revision history' : 'Save the lesson once to enable history'}
                className="inline-flex items-center gap-1.5 border-2 border-emerald-300 text-emerald-700 font-bold rounded-xl px-2.5 py-2 text-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            <div className="h-7 w-px bg-emerald-200" />

            {/* Group B — File & content tools */}
            <div className="flex items-center gap-1.5">
              <label className="cursor-pointer inline-flex items-center gap-2 border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                <Upload className="w-4 h-4" /> Import
                <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
              </label>
              <button onClick={exportJson} className="inline-flex items-center gap-2 border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={() => { setJsonDraft(JSON.stringify(slides, null, 2)); setJsonError(null); setJsonOpen(true); }}
                className="inline-flex items-center gap-2 border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                <Code2 className="w-4 h-4" /> JSON
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-2 border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95">
                    <FolderOpen className="w-4 h-4" /> Library
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-2 max-h-96 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-2 py-1">Import from Library</div>
                  {lessonHook.isLoadingLibrary ? (
                    <div className="p-3 text-xs text-slate-500"><Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Loading…</div>
                  ) : lessonHook.library.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500">No saved Success lessons yet.</div>
                  ) : (
                    lessonHook.library.map((l) => (
                      <button key={l.id} onClick={() => handleImportFromLibrary(l.id)}
                        className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-emerald-50 text-sm">
                        <div className="font-semibold text-slate-800 truncate">{l.title}</div>
                        <div className="text-[10px] text-slate-500">{l.is_published ? 'Published' : 'Draft'} · {(l.content as any)?.slides?.length ?? 0} slides</div>
                      </button>
                    ))
                  )}
                </PopoverContent>
              </Popover>
              <button onClick={() => setVaultOpen(true)} className="inline-flex items-center gap-2 border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95" title="Open Asset Vault">
                <FolderOpen className="w-4 h-4" /> Vault
              </button>
              <button onClick={() => setTemplatesOpen(true)} className="inline-flex items-center gap-2 border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95" title="Insert pre-built slide templates">
                <Sparkles className="w-4 h-4" /> Templates
              </button>
              <BulkActionsMenu
                hub="success"
                missingAudioCount={findSlidesMissingAudio(slides).length}
                onGenerateMissingAudio={() => setBulkAudioOpen(true)}
                onPublishTemplate={() => setPublishTemplateOpen(true)}
                canPublishTemplate={slides.length >= 8}
              />
              <button
                onClick={() => setImportOpen(true)}
                title="Convert raw text into a full lesson"
                className="inline-flex items-center gap-2 border-2 border-emerald-400 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 hover:bg-emerald-50"
              >
                <FileUp className="w-4 h-4" /> Import text
              </button>
            </div>

            <div className="h-7 w-px bg-emerald-200" />

            {/* Group C — Primary actions */}
            <div className="flex items-center gap-1.5">
              <button onClick={handleSaveDraft} disabled={lessonHook.isSaving}
                className="inline-flex items-center gap-2 border-2 border-emerald-400 text-emerald-700 font-bold rounded-xl px-3 py-2 text-xs transition active:scale-95 disabled:opacity-50">
                {lessonHook.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
              </button>
              <button onClick={handlePublish} disabled={lessonHook.isSaving}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95 disabled:opacity-50">
                {lessonHook.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish
              </button>
              <button onClick={() => setAiOpen(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95">
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
              <button onClick={openClassroom} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md transition active:scale-95">
                <Play className="w-4 h-4" /> Classroom
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

      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[240px_1fr_380px] gap-4 p-4 min-h-0">
        {/* Left: slide list grouped by block */}
        <aside className="min-h-0 flex flex-col order-1">
          <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-200 p-3 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-2 py-1 mb-2 flex-shrink-0">
              <h2 className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Slides · {slides.length}</h2>
              <button onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1 text-emerald-600 hover:bg-emerald-50 rounded-md px-2 py-1 text-xs font-bold">
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
                      {items.map(({ slide: s, idx }) => {
                        const Icon = slideIcon((s as any).type);
                        return (
                        <div key={idx}>
                          {(idx > 0) && (
                            <InsertSlideButton
                              hub="success"
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
                            idx === selected ? 'border-emerald-500 bg-emerald-50' : 'border-transparent hover:bg-slate-50'
                          }`}>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                            <span className="font-semibold text-emerald-600 inline-flex items-center gap-1.5">
                              <Icon className="w-3 h-3" />
                              {s.type === 'lesson_summary' ? `🔒 #${idx + 1} · auto-summary` : `#${idx + 1} · ${s.type}`}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 truncate font-medium">
                            {s.type === 'lesson_summary' ? 'Auto-Summary (system)' : slideTitle(s)}
                          </div>
                          {s.type !== 'lesson_summary' && (
                            <div className="flex gap-1 mt-1">
                              <button onClick={(e) => { e.stopPropagation(); move(idx, -1); }} className="text-slate-400 hover:text-emerald-600"><ChevronUp className="w-3 h-3" /></button>
                              <button onClick={(e) => { e.stopPropagation(); move(idx, 1); }} className="text-slate-400 hover:text-emerald-600"><ChevronDown className="w-3 h-3" /></button>
                              <button onClick={(e) => { e.stopPropagation(); dup(idx); }} className="text-slate-400 hover:text-emerald-600"><Copy className="w-3 h-3" /></button>
                              <button onClick={(e) => { e.stopPropagation(); del(idx); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
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
                hub="success"
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
          <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-200 p-3 flex flex-col flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-2 gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Live Preview</h2>
              <div className="flex items-center gap-2">
                <PreviewRoleToggle value={previewRole} onChange={setPreviewRole} hub="success" />
                <PreviewModeToggle value={previewMode} onChange={setPreviewMode} hub="success" />
              </div>
            </div>
            {selectedHomework ? (
              <HomeworkSlideLivePreview hub="success" task={selectedHomework.task} taskNumber={selectedHomework.index + 1} />
            ) : (
              <PlayablePreviewPane
                mode={previewMode}
                slides={slides}
                startIndex={selected}
                hub="success"
                previewRole={previewRole}
                getTeacherNotes={(s) => (s as any).teacher_notes}
                renderSlide={(slide) => {
                const sType = (slide as any).type;
                const isPhonics = sType === 'phonics_focus';
                const isStorybook = sType === 'storybook';
                const isVocabGames = sType === 'vocab_games_slot';
                return (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 min-h-[450px] flex items-center justify-center">
                    <div className="w-full">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-semibold mb-3 text-center">
                        {BLOCKS.find((b) => b.id === (slide as Slide).block)?.label}
                      </div>
                      {isVocabGames ? (
                        (() => {
                          const s = slide as any;
                          return (
                            <VocabGamesSlotPreviewCard
                              hub={s.hub ?? 'success'}
                              cefr={s.cefr ?? 'B1'}
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
                        <PhonicsFocusCard slide={slide as any} hub="success" />
                      ) : isStorybook ? (
                        <StorybookRenderer slide={slide as any} hub="success" />
                      ) : (
                        <UniversalMediaShell slide={slide as any} hub="success">
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
          <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-200 p-6 flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 gap-2 flex-shrink-0">
              <h2 className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
                Edit · #{selected + 1} · {current.type}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTunerOpen(true)}
                  title="Rewrite this slide easier or harder for a target CEFR level"
                  className="inline-flex items-center gap-1 text-xs font-semibold border border-emerald-300 text-emerald-700 rounded-md px-2 py-1 hover:bg-emerald-50"
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
                    hub="success"
                    cefrLevel={level}
                    topic={title}
                  />
                ) : (current as any).type === 'storybook' ? (
                  <StorybookEditor
                    slide={current as any}
                    hub="success"
                    cefrLevel={level}
                    targetVocab={blueprint?.vocabulary || []}
                    grammarFocus={blueprint?.grammar || ''}
                    lessonTitle={title}
                    lessonSlides={slides}
                    onPatch={(patch) => update(patch as unknown as Partial<Slide>)}
                    onAppendQuiz={(quiz) => insertAfterCurrent(mapAIQuizSlides(quiz, 'success') as Slide[])}
                  />
                ) : current.type === 'canvas_game' || current.type === 'living_canvas' ? (
                  <CanvasElementEditor slide={current as any} hub="success" onChange={(next) => update(next as Partial<Slide>)} />
                ) : current.type === 'scaffolded_media' ? (
                  <ScaffoldedMediaEditor slide={current as any} hub="success" onChange={(next) => update(next as Partial<Slide>)} />
                ) : (
                  <SlideEditor slide={current} onChange={update} blueprint={blueprint} hub="success" cefrLevel={level} />
                )}
              </TabsContent>
              <TabsContent value="media" className="pt-4 flex-1 overflow-y-auto min-h-0">
                <SlideMediaPanel
                  slide={current as any}
                  onPatch={(patch) => update(patch as Partial<Slide>)}
                  hub="success"
                  lessonId={lessonHook.lessonId}
                  slideId={slideId}
                  enableFlashcards={current.type === 'vocab' || current.type === 'matching'}
                />
              </TabsContent>
              <TabsContent value="ai" className="pt-4 flex-1 overflow-y-auto min-h-0">
                <AIToolsPanel
                  hub="success"
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
                  className="text-left p-3 rounded-xl border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{s.defaultBlock}</div>
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
              }} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* AI generation modal */}
      <GenerateLessonModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        hub="success"
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
        hub="success"
        onPick={({ url, field }) => update({ [field]: url } as any)}
      />

      <HomeworkGenerationDialog
        open={homeworkOpen}
        onOpenChange={setHomeworkOpen}
        input={{
          lessonId: lessonHook.lessonId,
          blueprint,
          title: lessonHook.lesson?.title || 'Lesson',
          hub: 'success',
        }}
      />


      <SlideTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        hub="success"
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
        hub="success"
      />

      <ImportFromTextDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultHub="success"
      />

      <PublishTemplateDialog
        open={publishTemplateOpen}
        onOpenChange={setPublishTemplateOpen}
        hub="success"
        title={title}
        level={level}
        slides={slides}
      />
    </div>
  );
}

// ─── Type-aware editor ─────────────────────────────────────────────────────
function SlideEditor({ slide, onChange, blueprint, hub = 'success', cefrLevel = 'B1' }: { slide: Slide; onChange: (p: Partial<Slide>) => void; blueprint?: LessonBlueprint | null; hub?: 'playground' | 'academy' | 'success'; cefrLevel?: string }) {
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
    case 'reflection':
      return <Field label="Prompt">{row(<textarea className={inputCls + ' h-24'} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} />, wand('prompt', slide.prompt, (v) => onChange({ prompt: v } as any)))}</Field>;

    case 'opinion':
      return (
        <div className="space-y-3">
          <Field label="Prompt">{row(<input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} />, wand('prompt', slide.prompt, (v) => onChange({ prompt: v } as any)))}</Field>
          <Field label="Options (one per line)">
            <textarea className={inputCls + ' h-24'} value={slide.options.join('\n')}
              onChange={(e) => onChange({ options: e.target.value.split('\n').filter(Boolean) } as any)} />
          </Field>
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
              className="mt-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded px-2 py-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add pair</button>
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
        const promptText = p.image_prompt?.trim() || `A single "${p.word}" on a soft pastel background, centered, thick outlines. NO TEXT.`;
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
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50 whitespace-nowrap">
                          <Sparkles className="w-3 h-3" /> Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setPairs([...pairs, { word: '', image_url: '', image_prompt: '' }])}
              className="mt-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded px-2 py-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add pair</button>
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
            hub="success"
          />
        </div>
      );
    }

    case 'tone_compare':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Direct version"><textarea className={inputCls + ' h-20'} value={slide.direct} onChange={(e) => onChange({ direct: e.target.value } as any)} /></Field>
          <Field label="Polite version"><textarea className={inputCls + ' h-20'} value={slide.polite} onChange={(e) => onChange({ polite: e.target.value } as any)} /></Field>
          <Field label="Note (optional)"><textarea className={inputCls + ' h-16'} value={slide.note || ''} onChange={(e) => onChange({ note: e.target.value } as any)} /></Field>
        </div>
      );

    case 'functional_pattern':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Rule"><textarea className={inputCls + ' h-20'} value={slide.rule} onChange={(e) => onChange({ rule: e.target.value } as any)} /></Field>
          <Field label="Examples (one per line)">
            <textarea className={inputCls + ' h-32'} value={slide.examples.join('\n')}
              onChange={(e) => onChange({ examples: e.target.value.split('\n').filter(Boolean) } as any)} />
          </Field>
        </div>
      );

    case 'rewrite':
      return (
        <div className="space-y-3">
          <Field label="Prompt"><input className={inputCls} value={slide.prompt} onChange={(e) => onChange({ prompt: e.target.value } as any)} /></Field>
          <Field label="Original sentence"><textarea className={inputCls + ' h-16'} value={slide.original} onChange={(e) => onChange({ original: e.target.value } as any)} /></Field>
          <Field label="Instruction"><input className={inputCls} value={slide.instruction} onChange={(e) => onChange({ instruction: e.target.value } as any)} /></Field>
          <Field label="Sample rewrite"><textarea className={inputCls + ' h-20'} value={slide.sample} onChange={(e) => onChange({ sample: e.target.value } as any)} /></Field>
        </div>
      );

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
            hub="success"
          />
        </div>
      );
    }

    case 'scenario':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <Field label="Situation"><textarea className={inputCls + ' h-24'} value={slide.situation} onChange={(e) => onChange({ situation: e.target.value } as any)} /></Field>
          <Field label="Task"><textarea className={inputCls + ' h-20'} value={slide.task} onChange={(e) => onChange({ task: e.target.value } as any)} /></Field>
          <Field label="Placeholder (optional)"><input className={inputCls} value={slide.placeholder || ''} onChange={(e) => onChange({ placeholder: e.target.value } as any)} /></Field>
        </div>
      );

    case 'email_task':
      return (
        <div className="space-y-3">
          <Field label="Subject"><input className={inputCls} value={slide.subject} onChange={(e) => onChange({ subject: e.target.value } as any)} /></Field>
          <Field label="Brief"><textarea className={inputCls + ' h-24'} value={slide.brief} onChange={(e) => onChange({ brief: e.target.value } as any)} /></Field>
          <Field label="Sample email"><textarea className={inputCls + ' h-40 font-mono text-xs'} value={slide.sample} onChange={(e) => onChange({ sample: e.target.value } as any)} /></Field>
        </div>
      );

    case 'role_play':
      return (
        <div className="space-y-3">
          <Field label="Title"><input className={inputCls} value={slide.title} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Role A"><input className={inputCls} value={slide.roleA} onChange={(e) => onChange({ roleA: e.target.value } as any)} /></Field>
            <Field label="Role B"><input className={inputCls} value={slide.roleB} onChange={(e) => onChange({ roleB: e.target.value } as any)} /></Field>
          </div>
          <Field label="Line A"><textarea className={inputCls + ' h-16'} value={slide.lineA} onChange={(e) => onChange({ lineA: e.target.value } as any)} /></Field>
          <Field label="Line B"><textarea className={inputCls + ' h-16'} value={slide.lineB} onChange={(e) => onChange({ lineB: e.target.value } as any)} /></Field>
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
          case 'rewrite': return { type, text: 'Send me the file.', instruction: 'Make it polite.', sample: 'Could you please send me the file?' };
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
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">#{i + 1} · {a.type}</span>
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
                  {a.type === 'rewrite' && (
                    <>
                      <input className={inputCls} value={a.text} placeholder="Original sentence"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, text: e.target.value }; update(n); }} />
                      <input className={inputCls} value={a.instruction} placeholder="Instruction"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, instruction: e.target.value }; update(n); }} />
                      <input className={inputCls} value={a.sample} placeholder="Sample rewrite"
                        onChange={(e) => { const n = [...slide.activities]; n[i] = { ...a, sample: e.target.value }; update(n); }} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(['mcq', 'fill', 'rewrite'] as const).map((tp) => (
                <button key={tp} onClick={() => update([...slide.activities, blank(tp)])}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-1">
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
              onChange={(e) => onChange({ vocab_recap: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) } as any)} />
          </Field>
          <Field label="Grammar rule"><input className={inputCls} value={(slide as any).grammar_recap || ''} onChange={(e) => onChange({ grammar_recap: e.target.value } as any)} /></Field>
          <Field label="Takeaway"><textarea className={inputCls + ' h-20'} value={(slide as any).takeaway || ''} onChange={(e) => onChange({ takeaway: e.target.value } as any)} /></Field>
        </div>
      );
  }
}
