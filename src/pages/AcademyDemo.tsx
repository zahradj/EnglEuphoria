import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2, ChevronLeft, ChevronRight, Sun, Moon, Check, X } from 'lucide-react';
import { AcademyHubProvider } from '@/components/academy/HubGuard';
import ProfileAvatar from '@/components/academy/ProfileAvatar';
import CoinBalance from '@/components/academy/CoinBalance';
import AcademyLessonCompleteModal from '@/components/academy/AcademyLessonCompleteModal';
import { awardAcademyCoins, ACADEMY_COINS_PER_BLOCK } from '@/lib/academy/coins';
import { staticContextForSlide, FocusPanel } from '@/components/academy/splitSlide';
import { useAuth } from '@/contexts/AuthContext';
import { useAcademyAudio } from '@/hooks/useAcademyAudio';
import type { CanvasGameSlide, LivingCanvasSlide, ScaffoldedMediaSlide } from '@/components/creator-studio/shared/canvasSchema';
import { LivingCanvas } from '@/components/creator-studio/shared/LivingCanvas';
import { ScaffoldedPlayer } from '@/components/creator-studio/shared/ScaffoldedPlayer';
import { SoloVocabCard } from '@/components/creator-studio/shared/SoloVocabCard';
import { StoryEngineSlot } from '@/story-engine';
import { EscapeRoomSlot } from '@/escape-room';
import { DetectiveSlot } from '@/detective';
import { HiddenObjectSlot } from '@/hidden-object';
import { GrammarMarkup } from '@/components/lesson-player/grammarMarkup';
import FrontPageSlide from '@/components/lesson-player/editorial/FrontPageSlide';
import { RichText } from '@/components/lesson-player/RichText';
import { emitVocabArcComplete, isVocabArcSource } from '@/lib/vocabArcTelemetry';
import {
  getErrorDetectionItems,
  getCorrectionItems,
  getFillBlankItems,
  getMultipleItems,
  getTrueFalseItems,
  getSentenceBuilderItems,
} from '@/utils/practiceItemNormalize';

/**
 * Academy Engine — teen-focused (12–17, A1–B1), 60-minute, 7-block lesson system.
 *
 * Strict design constraints:
 *  - Mature, sleek, dark-mode-first. Indigo/Purple identity.
 *  - No childish bubbles, no confetti, no bouncy animations.
 *  - Audio is RESTRAINED: only on vocab / reading_passage / listening slides,
 *    and never auto-plays.
 *  - Every slide has one goal.
 *
 * Edit the SLIDES array below to swap the lesson — the engine is content-driven.
 */

// ─── Schema ──────────────────────────────────────────────────────────────────
export type Block = 'warmup' | 'vocab' | 'reading' | 'grammar' | 'practice' | 'interactive' | 'speaking';

export const BLOCKS: { id: Block; label: string }[] = [
  { id: 'warmup', label: 'Warm-up' },
  { id: 'vocab', label: 'Vocab' },
  { id: 'reading', label: 'Reading' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'practice', label: 'Practice' },
  { id: 'interactive', label: 'Interactive' },
  { id: 'speaking', label: 'Speaking' },
];

/**
 * ClusterActivity — one mini-task inside a `cluster` slide.
 * Allows 3–6 related exercises to live on a single slide so a slide acts like
 * a focused, dense practice page rather than a single-question card.
 */
export type ClusterActivity =
  | { type: 'mcq'; question: string; options: string[]; answer: string; explanation?: string }
  | { type: 'fill'; text: string; answer: string; explanation?: string }
  | { type: 'tf'; statement: string; answer: boolean; explanation?: string }
  | { type: 'build'; prompt?: string; words: string[]; answer: string[] };

export type Slide =
  | {
      type: 'intro';
      block: Block;
      title: string;
      subtitle?: string;
      // Optional cover-slide enrichments — when present render the unified 50/50 cover.
      image_url?: string;
      level?: string | null;
      unit_number?: number | string | null;
      unit_title?: string | null;
      lesson_number?: number | string | null;
    }
  | { type: 'question'; block: Block; prompt: string; placeholder?: string }
  | { type: 'poll'; block: Block; prompt: string; options: { label: string; pct: number }[] }
  | { type: 'opinion'; block: Block; prompt: string }
  | { type: 'vocab'; block: Block; word: string; definition: string; example?: string }
  | { type: 'matching'; block: Block; prompt: string; pairs: { left: string; right: string }[]; objective?: { title: string; skill: string; how: string }; source?: string }
  | { type: 'reading_passage'; block: Block; title: string; passage: string }
  | { type: 'listening'; block: Block; prompt: string; transcript: string }
  | { type: 'truefalse'; block: Block; statement?: string; answer?: boolean; items?: { statement: string; answer: boolean }[] }
  | { type: 'multiple'; block: Block; question?: string; options?: string[]; answer?: string; items?: { question: string; options: string[]; answer: string }[] }
  | { type: 'grammar_pattern'; block: Block; title: string; rows: { a: string; b: string }[]; rule?: string }
  | { type: 'grammar_color_decode'; block: Block; title: string; chunks: { role: string; text: string }[]; variants?: { chunks: { role: string; text: string }[] }[]; legend?: string[]; rule?: string }
  | { type: 'frequency_thermometer'; block: Block; title: string; items: { adverb: string; pct: number; example?: string }[]; shape?: 'thermometer' | 'triangle' | 'pyramid'; rule?: string }
  | { type: 'grammar_formula'; block: Block; title: string; terms: { label: string; role: string; note?: string }[]; example: { text: string; role: string }[]; rule?: string }
  | { type: 'error_detection'; block: Block; prompt: string; sentence?: string; wrongIndex?: number; items?: { sentence: string; wrongIndex: number }[] }
  | { type: 'correction'; block: Block; prompt: string; wrong?: string; answer?: string; items?: { wrong: string; answer: string }[] }
  | { type: 'fill_blank'; block: Block; prompt: string; before?: string; after?: string; answer?: string; items?: { before: string; answer: string; after: string }[] }
  | { type: 'sentence_builder'; block: Block; prompt: string; words?: string[]; answer?: string[]; items?: { words: string[]; answer: string[] }[] }
  | { type: 'debate_scale'; block: Block; prompt: string }
  | { type: 'role_play'; block: Block; title: string; lineA: string; lineB: string }
  | { type: 'speaking_task'; block: Block; prompt: string; starters?: string[] }
  | { type: 'reflection'; block: Block; prompt: string }
  | { type: 'cluster'; block: Block; title: string; content?: string; activities: ClusterActivity[] }
  | (CanvasGameSlide & { block: Block })
  | (LivingCanvasSlide & { block: Block })
  | (ScaffoldedMediaSlide & { block: Block })
  | { type: 'vocab_solo'; block: Block; word: string; definition?: string; image_url?: string; audio_url?: string }
  | { type: 'vocab_deck'; block: Block; title?: string; cards: { word: string; definition: string; example?: string; image_url?: string }[] }
  | { type: 'vocab_image_match'; block: Block; prompt?: string; pairs: { word: string; image_url: string }[]; objective?: { title: string; skill: string; how: string }; source?: string }
  | { type: 'story_engine_slot' | 'escape_room_slot' | 'detective_mystery_slot' | 'hidden_object_slot'; block: Block; title?: string; objective?: string; hub?: string; cefr?: string; graph?: any; room?: any; case?: any; scene?: any }
  | { type: 'lesson_summary'; block: Block; title?: string; vocab_recap: string[]; grammar_recap?: string; takeaway?: string };

// ─── Lesson content (edit only this) ─────────────────────────────────────────
// Topic: "How much time do you spend on your phone?" — A2 level, 36 slides.
const SLIDES: Slide[] = [
  // BLOCK 1 — Warm-up (1–3)
  { type: 'intro', block: 'warmup', title: 'Phones & You', subtitle: 'Talk about daily phone habits', level: 'A2', unit_number: 3, unit_title: 'Everyday Technology', lesson_number: 1 },
  { type: 'question', block: 'warmup', prompt: 'Do you use your phone every day?', placeholder: 'Yes, I…' },
  { type: 'poll', block: 'warmup', prompt: 'How many hours a day are you on your phone?', options: [
    { label: '1–2 hours', pct: 22 },
    { label: '3–5 hours', pct: 48 },
    { label: '5+ hours', pct: 30 },
  ]},

  // BLOCK 2 — Vocabulary (4–8)
  { type: 'vocab', block: 'vocab', word: 'scroll', definition: 'to move your finger up or down on a screen', example: 'I scroll through TikTok before bed.' },
  { type: 'vocab', block: 'vocab', word: 'post', definition: 'to share something online', example: 'She posts a photo every weekend.' },
  { type: 'vocab', block: 'vocab', word: 'spend time', definition: 'to use time on something', example: 'I spend time on YouTube every day.' },
  { type: 'matching', block: 'vocab', prompt: 'Match each word to its meaning.', pairs: [
    { left: 'scroll', right: 'move your finger on a screen' },
    { left: 'post', right: 'share something online' },
    { left: 'spend', right: 'use time' },
  ]},
  { type: 'multiple', block: 'vocab', question: 'What does “post” mean?', options: ['delete a photo', 'share something online', 'turn off your phone'], answer: 'share something online' },

  // BLOCK 3 — Reading + Listening (9–13)
  { type: 'reading_passage', block: 'reading', title: 'Alex’s phone day',
    passage: "Hi, I'm Alex. I spend three hours online every day. I scroll through Instagram in the morning and post photos with my friends after school. I think my phone is useful, but sometimes I use it too much." },
  { type: 'listening', block: 'reading', prompt: 'Listen to Alex describe his evening, then answer.',
    transcript: "In the evening I usually watch videos for one hour. After that I message my friends and then I go to sleep around eleven." },
  { type: 'multiple', block: 'reading', question: 'How many hours does Alex spend online each day?', options: ['One hour', 'Three hours', 'Five hours'], answer: 'Three hours' },
  { type: 'truefalse', block: 'reading', statement: 'Alex thinks he sometimes uses his phone too much.', answer: true },
  { type: 'opinion', block: 'reading', prompt: 'Is Alex’s habit healthy? Why or why not?' },

  // BLOCK 4 — Grammar (14–18)
  { type: 'grammar_pattern', block: 'grammar', title: 'Present simple — verb + s', rows: [
    { a: 'I use my phone.', b: 'He uses his phone.' },
    { a: 'You scroll a lot.', b: 'She scrolls a lot.' },
    { a: 'We post photos.', b: 'It posts updates.' },
  ], rule: 'For he / she / it, add -s to the verb.' },
  { type: 'intro', block: 'grammar', title: 'The Rule', subtitle: 'Add -s to the verb when the subject is he, she, or it.' },
  { type: 'multiple', block: 'grammar', question: 'Which sentence is correct?', options: ['She use Instagram every day.', 'She uses Instagram every day.', 'She using Instagram every day.'], answer: 'She uses Instagram every day.' },
  { type: 'error_detection', block: 'grammar', prompt: 'Tap the word with the mistake.', sentence: 'He use TikTok every night.', wrongIndex: 1 },
  { type: 'correction', block: 'grammar', prompt: 'Fix the sentence.', wrong: 'My sister post photos every day.', answer: 'My sister posts photos every day.' },

  // BLOCK 5 — Controlled Practice (19–24)
  // 🆕 Cluster slide: 4 related micro-tasks on a single page (faster, denser, smarter).
  { type: 'cluster', block: 'practice', title: 'Present Simple — Quick Drill',
    content: 'He uses Instagram. She posts photos. Apply the rule four ways below.',
    activities: [
      { type: 'mcq', question: 'She ___ every day.', options: ['use', 'uses', 'using'], answer: 'uses', explanation: "Use 'uses' for she/he/it." },
      { type: 'fill', text: 'He ___ (use) his phone.', answer: 'uses' },
      { type: 'tf', statement: 'He use TikTok.', answer: false, explanation: "Should be 'He uses TikTok.'" },
      { type: 'build', prompt: 'Build the sentence.', words: ['I', 'use', 'my', 'phone'], answer: ['I', 'use', 'my', 'phone'] },
    ],
  },
  { type: 'fill_blank', block: 'practice', prompt: 'Complete with the correct verb form.', before: 'He', after: '(use) his phone too much.', answer: 'uses' },
  { type: 'multiple', block: 'practice', question: 'She ___ Instagram every day.', options: ['use', 'uses', 'using'], answer: 'uses' },
  { type: 'sentence_builder', block: 'practice', prompt: 'Build the sentence.', words: ['phone', 'I', 'my', 'use'], answer: ['I', 'use', 'my', 'phone'] },
  { type: 'sentence_builder', block: 'practice', prompt: 'Put the words in order.', words: ['posts', 'photos', 'She', 'often'], answer: ['She', 'often', 'posts', 'photos'] },
  { type: 'matching', block: 'practice', prompt: 'Match the subject to the correct verb form.', pairs: [
    { left: 'I', right: 'use' },
    { left: 'She', right: 'uses' },
    { left: 'They', right: 'use' },
    { left: 'He', right: 'uses' },
  ]},
  { type: 'truefalse', block: 'practice', statement: '“He scroll every night.” is correct.', answer: false },

  // BLOCK 6 — Interactive (25–32)
  { type: 'debate_scale', block: 'interactive', prompt: 'Phones are good for students.' },
  { type: 'speaking_task', block: 'interactive', prompt: 'Speed challenge — 10 seconds. Say one sentence using “use”.' },
  { type: 'role_play', block: 'interactive', title: 'Role play — meeting a classmate',
    lineA: 'Hi! How much time do you spend on your phone?',
    lineB: 'I spend about ____ hours a day. And you?' },
  { type: 'speaking_task', block: 'interactive', prompt: 'You meet a new friend online. Introduce yourself in 3 sentences.', starters: ['Hi, my name is…', 'I spend…', 'I like to…'] },
  { type: 'question', block: 'interactive', prompt: 'Guess the word: “I use this every day to talk to my friends.”', placeholder: 'It is a…' },
  { type: 'error_detection', block: 'interactive', prompt: 'Find the mistake.', sentence: 'My brother spend hours on YouTube.', wrongIndex: 2 },
  { type: 'debate_scale', block: 'interactive', prompt: 'Social media makes me happy.' },
  { type: 'speaking_task', block: 'interactive', prompt: 'Mini challenge — say two sentences about your own phone habits.' },

  // BLOCK 7 — Speaking Output (33–36)
  { type: 'speaking_task', block: 'speaking', prompt: 'Talk for 60 seconds about how you use your phone.', starters: ['I use…', 'I spend…', 'I usually…'] },
  { type: 'speaking_task', block: 'speaking', prompt: 'Now describe a friend’s phone habits.', starters: ['My friend uses…', 'They post…'] },
  { type: 'speaking_task', block: 'speaking', prompt: 'Free speaking — no support. Tell us about your perfect day without a phone.' },
  { type: 'reflection', block: 'speaking', prompt: 'How did this lesson feel? Easy, challenging, or just right?' },
];

// ─── Theme ───────────────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light';

export interface ThemeTokens {
  bg: string;
  card: string;
  text: string;
  muted: string;
  chip: string;
  inputBg: string;
  btnGhost: string;
}

export const themeMap: Record<'dark' | 'light', ThemeTokens> = {
  dark: {
    bg: 'bg-slate-950',
    card: 'bg-slate-900 border-slate-800',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    chip: 'bg-slate-800 text-slate-300',
    inputBg: 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500',
    btnGhost: 'border border-slate-700 text-slate-200 hover:border-indigo-500 hover:text-indigo-300',
  },
  light: {
    bg: 'bg-slate-50',
    card: 'bg-white border-slate-200',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    chip: 'bg-slate-100 text-slate-700',
    inputBg: 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
    btnGhost: 'border border-slate-300 text-slate-700 hover:border-indigo-500 hover:text-indigo-600',
  },
};

// ─── Audio button (shared by vocab / reading / listening) ────────────────────
function ListenButton({ text, label = 'Listen', variant = 'pill' }: { text: string; label?: string; variant?: 'pill' | 'block' }) {
  const { playVoice, isPlaying, isLoading } = useAcademyAudio();
  const base = 'inline-flex items-center gap-2 font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const sizes = variant === 'block'
    ? 'px-5 py-3 text-base bg-indigo-600 hover:bg-indigo-500 text-white'
    : 'px-3 py-1.5 text-sm bg-indigo-600/90 hover:bg-indigo-500 text-white';
  return (
    <button onClick={() => playVoice(text)} className={`${base} ${sizes}`} aria-label={label}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />}
      <span>{isPlaying ? 'Playing…' : label}</span>
    </button>
  );
}

// ─── Slide components ───────────────────────────────────────────────────────
function Intro({ slide, t }: { slide: Extract<Slide, { type: 'intro' }>; t: ThemeTokens }) {
  // First intro of the lesson (warmup block) renders as the unified 50/50
  // hub-themed cover. Mid-lesson "intro" slides (e.g. grammar block intros)
  // keep the lighter section-header treatment.
  const isLessonCover = slide.block === 'warmup';
  if (isLessonCover) {
    return (
      <FrontPageSlide
        hub="academy"
        lessonTitle={slide.title}
        topic={slide.title}
        subtitle={slide.subtitle}
        coverImageUrl={slide.image_url}
        level={slide.level}
        unitNumber={slide.unit_number}
        unitTitle={slide.unit_title}
        lessonNumber={slide.lesson_number}
      />
    );
  }
  return (
    <div className="space-y-4">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>{slide.block}</div>
      <h1 className={`text-3xl md:text-5xl font-semibold ${t.text}`}>{slide.title}</h1>
      {slide.subtitle && <p className={`text-lg ${t.muted}`}>{slide.subtitle}</p>}
    </div>
  );
}

function QuestionSlide({ slide, t }: { slide: Extract<Slide, { type: 'question' }>; t: ThemeTokens }) {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={slide.placeholder ?? 'Type your answer…'}
        className={`w-full min-h-[120px] rounded-md border px-4 py-3 text-base outline-none focus:border-indigo-500 ${t.inputBg}`}
      />
    </div>
  );
}

function PollSlide({ slide, t }: { slide: Extract<Slide, { type: 'poll' }>; t: ThemeTokens }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="space-y-3">
        {slide.options.map((opt, i) => {
          const active = picked === i;
          const showResults = picked !== null;
          return (
            <button
              key={opt.label}
              onClick={() => setPicked(i)}
              className={`relative w-full text-left rounded-md border overflow-hidden transition ${active ? 'border-indigo-500' : 'border-slate-700 hover:border-indigo-500/60'}`}
            >
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${opt.pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 ${active ? 'bg-indigo-600/40' : 'bg-slate-800'}`}
                />
              )}
              <div className="relative flex justify-between items-center px-4 py-3">
                <span className={`font-medium ${t.text}`}>{opt.label}</span>
                {showResults && <span className={`text-sm ${t.muted}`}>{opt.pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OpinionSlide({ slide, t }: { slide: Extract<Slide, { type: 'opinion' }>; t: ThemeTokens }) {
  const [picked, setPicked] = useState<string | null>(null);
  const opts = ['Agree', 'Not sure', 'Disagree'];
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="flex flex-wrap gap-3">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => setPicked(o)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
              picked === o ? 'bg-indigo-600 text-white' : t.btnGhost
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function VocabSlide({ slide, t }: { slide: Extract<Slide, { type: 'vocab' }>; t: ThemeTokens }) {
  const imageUrl = (slide as any).image_url as string | undefined;
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-2 md:p-6">
      <div className="w-full h-[40vh] md:h-[60vh] relative rounded-xl overflow-hidden bg-indigo-50/40 border border-indigo-100 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={slide.word} className="object-cover w-full h-full" />
        ) : (
          <div className="text-indigo-300 text-6xl">🖼️</div>
        )}
      </div>
      <div className="space-y-5 w-full">
        <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Vocabulary</div>
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className={`text-4xl md:text-5xl font-semibold ${t.text}`}>{slide.word}</h2>
          <ListenButton text={slide.word} label="Listen" />
        </div>
        <p className={`text-xl ${t.text}`}>
          <RichText text={slide.definition} highlightClassName="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md shadow-sm" />
        </p>
        {slide.example && (
          <p className={`text-base italic border-l-2 border-indigo-500 pl-4 ${t.muted}`}>
            “<RichText text={slide.example} highlightClassName="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md not-italic shadow-sm" />”
          </p>
        )}
      </div>
    </div>
  );
}

function ObjectiveBanner({ objective }: { objective?: { title: string; skill: string; how: string } }) {
  if (!objective) return null;
  return (
    <div className="w-full max-w-3xl rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3 className="text-base md:text-lg font-semibold text-indigo-900 leading-tight">{objective.title}</h3>
        <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-600 whitespace-nowrap">
          {objective.skill}
        </span>
      </div>
      <p className="text-sm text-slate-700 leading-snug">
        <span className="font-medium text-slate-900">How:</span> {objective.how}
      </p>
    </div>
  );
}

function MatchingSlide({ slide, t }: { slide: Extract<Slide, { type: 'matching' }>; t: ThemeTokens }) {
  const rights = useMemo(() => [...slide.pairs].sort(() => Math.random() - 0.5), [slide.pairs]);
  const [selL, setSelL] = useState<string | null>(null);
  const [solved, setSolved] = useState<Record<string, true>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const attemptsRef = useRef({ attempts: 0, correct: 0, startedAt: Date.now(), emitted: false });

  const tryPair = (left: string, right: string) => {
    attemptsRef.current.attempts += 1;
    if (slide.pairs.some((p) => p.left === left && p.right === right)) {
      attemptsRef.current.correct += 1;
      setSolved((s) => ({ ...s, [left]: true }));
    } else {
      setWrong(right);
      setTimeout(() => setWrong(null), 400);
    }
    setSelL(null);
  };

  // Emit vocab-arc completion once when board is fully solved (source-tagged only).
  useEffect(() => {
    const total = slide.pairs.length;
    if (total === 0 || attemptsRef.current.emitted) return;
    if (Object.keys(solved).length < total) return;
    const s = slide as any;
    if (!isVocabArcSource(s.source)) return;
    attemptsRef.current.emitted = true;
    const { attempts, correct, startedAt } = attemptsRef.current;
    emitVocabArcComplete({
      telemetry_tag: s.telemetry_tag ?? 'vocab_arc_matching',
      skill_key: s.reinforcement_target?.skill_key ?? 'vocab_retrieval',
      target_words: s.reinforcement_target?.target_words ?? slide.pairs.map((p) => p.left),
      attempts,
      correct,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 100,
      duration_ms: Date.now() - startedAt,
      source: s.source,
    });
  }, [solved, slide]);

  const objective = (slide as any).objective as { title: string; skill: string; how: string } | undefined;
  const total = slide.pairs.length;
  const done = Object.keys(solved).length;
  return (
    <div className="space-y-5 w-full max-w-3xl">
      <ObjectiveBanner objective={objective} />
      <div className="flex items-baseline justify-between gap-3">
        <h2 className={`text-xl md:text-2xl font-semibold ${t.text}`}>{slide.prompt}</h2>
        <span className="text-xs font-semibold text-indigo-600 whitespace-nowrap">
          {done} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-indigo-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          {slide.pairs.map((p) => (
            <button
              key={p.left}
              disabled={!!solved[p.left]}
              onClick={() => setSelL(p.left)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 font-semibold transition ${
                solved[p.left]
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 opacity-70'
                  : selL === p.left
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm scale-[1.01]'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400'
              }`}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rights.map((p) => {
            const used = !!solved[p.left];
            const isWrong = wrong === p.right;
            return (
              <button
                key={p.right}
                disabled={used || !selL}
                onClick={() => selL && tryPair(selL, p.right)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                  used
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700 opacity-70'
                    : isWrong
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : selL
                        ? 'border-slate-200 bg-white text-slate-800 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                        : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {p.right}
              </button>
            );
          })}
        </div>
      </div>
      {!selL && done < total && (
        <p className="text-xs text-slate-500 text-center">Tap a word on the left, then tap its match on the right.</p>
      )}
    </div>
  );
}

function ReadingSlide({ slide, t }: { slide: Extract<Slide, { type: 'reading_passage' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-5 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Reading</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <ListenButton text={slide.passage} label="Listen to the passage" variant="block" />
      <p className={`text-lg leading-relaxed ${t.text}`}>
        <RichText text={slide.passage} highlightClassName="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md shadow-sm" />
      </p>
    </div>
  );
}

function ListeningSlide({ slide, t }: { slide: Extract<Slide, { type: 'listening' }>; t: ThemeTokens }) {
  const [showTranscript, setShowTranscript] = useState(false);
  return (
    <div className="space-y-5 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Listening</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <ListenButton text={slide.transcript} label="Play audio" variant="block" />
      <button onClick={() => setShowTranscript((s) => !s)} className={`text-sm underline ${t.muted} hover:text-indigo-400`}>
        {showTranscript ? 'Hide transcript' : 'Show transcript'}
      </button>
      {showTranscript && <p className={`italic border-l-2 border-indigo-500 pl-4 ${t.muted}`}>{slide.transcript}</p>}
    </div>
  );
}

function TrueFalseSlide({ slide, t }: { slide: Extract<Slide, { type: 'truefalse' }>; t: ThemeTokens }) {
  const items = getTrueFalseItems(slide);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<number, boolean>>({});
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
    setPicks({});
  }, [items.length, JSON.stringify(items)]);
  const item = items[index];
  if (!item) return <div className={t.muted}>No items.</div>;
  const picked = picks[index] ?? null;
  const correct = picked !== null && picked === item.answer;
  const score = items.reduce((s, it, i) => s + ((picks[i] !== undefined && picks[i] === it.answer) ? 1 : 0), 0);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{item.statement}</h2>
      <div className="flex gap-3">
        {[true, false].map((v) => {
          const active = picked === v;
          const isAnswer = picked !== null && v === item.answer;
          let cls = t.btnGhost;
          if (active && correct) cls = 'bg-emerald-600 text-white border-emerald-600';
          else if (active && !correct) cls = 'bg-red-600 text-white border-red-600';
          else if (picked !== null && isAnswer) cls = 'border border-emerald-500 text-emerald-300';
          return (
            <button key={String(v)} onClick={() => picked === null && setPicks((p) => ({ ...p, [index]: v }))} className={`px-6 py-2.5 rounded-md font-medium transition ${cls}`}>
              {v ? 'True' : 'False'}
            </button>
          );
        })}
      </div>
      <ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />
    </div>
  );
}

function MultipleSlide({ slide, t }: { slide: Extract<Slide, { type: 'multiple' }>; t: ThemeTokens }) {
  const items = getMultipleItems(slide);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<number, string>>({});
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
    setPicks({});
  }, [items.length, JSON.stringify(items)]);
  const item = items[index];
  if (!item) return <div className={t.muted}>No items.</div>;
  const picked = picks[index] ?? null;
  const score = items.reduce((s, it, i) => s + ((picks[i] && picks[i] === it.answer) ? 1 : 0), 0);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{item.question}</h2>
      <div className="space-y-2">
        {item.options.map((opt) => {
          const active = picked === opt;
          const isAnswer = opt === item.answer;
          let cls = `border-slate-700 hover:border-indigo-500/60 ${t.text}`;
          if (picked && active && isAnswer) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
          else if (picked && active && !isAnswer) cls = 'border-red-500 bg-red-500/10 text-red-200';
          else if (picked && isAnswer) cls = 'border-emerald-500/50 text-emerald-300';
          return (
            <button
              key={opt}
              onClick={() => picked === null && setPicks((p) => ({ ...p, [index]: opt }))}
              className={`w-full text-left px-4 py-3 rounded-md border transition ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />
    </div>
  );
}

function GrammarPatternSlide({ slide, t }: { slide: Extract<Slide, { type: 'grammar_pattern' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Grammar</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>
        <GrammarMarkup text={slide.title} />
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {slide.rows.map((r, i) => (
          <div key={i} className={`px-4 py-3 rounded-md border ${t.card.replace('bg-', 'bg-')} border-slate-700`}>
            <div className={`text-base ${t.text}`}><GrammarMarkup text={r.a} /></div>
          </div>
        )).flatMap((node, i) => [node,
          <div key={`b${i}`} className="px-4 py-3 rounded-md border border-indigo-500/40 bg-indigo-500/5">
            <div className="text-base text-indigo-200"><GrammarMarkup text={slide.rows[i].b} /></div>
          </div>
        ])}
      </div>
      {slide.rule && (
        <p className={`text-sm ${t.muted}`}>
          <GrammarMarkup text={slide.rule} />
        </p>
      )}
    </div>
  );
}

// ─── Color-decoded grammar building blocks ─────────────────────────────────
// One palette shared by grammar_color_decode + grammar_formula.
// Pure Tailwind so it adapts to dark mode via existing theme tokens.
const ROLE_STYLES: Record<string, { pill: string; label: string; name: string }> = {
  subject:  { pill: 'bg-sky-100 text-sky-900 border-sky-300',           label: 'text-sky-700',    name: 'Subject' },
  verb:     { pill: 'bg-rose-100 text-rose-900 border-rose-300',         label: 'text-rose-700',   name: 'Verb' },
  aux:      { pill: 'bg-violet-100 text-violet-900 border-violet-300',   label: 'text-violet-700', name: 'Auxiliary' },
  neg:      { pill: 'bg-red-100 text-red-900 border-red-300',            label: 'text-red-700',    name: 'Negative' },
  object:   { pill: 'bg-amber-100 text-amber-900 border-amber-300',      label: 'text-amber-700',  name: 'Object' },
  time:     { pill: 'bg-emerald-100 text-emerald-900 border-emerald-300',label: 'text-emerald-700',name: 'Time' },
  place:    { pill: 'bg-teal-100 text-teal-900 border-teal-300',         label: 'text-teal-700',   name: 'Place' },
  freq:     { pill: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',label: 'text-fuchsia-700',name: 'Frequency' },
  adj:      { pill: 'bg-lime-100 text-lime-900 border-lime-300',         label: 'text-lime-700',   name: 'Adjective' },
  adv:      { pill: 'bg-cyan-100 text-cyan-900 border-cyan-300',         label: 'text-cyan-700',   name: 'Adverb' },
  question: { pill: 'bg-indigo-100 text-indigo-900 border-indigo-300',   label: 'text-indigo-700', name: 'Question word' },
  conn:     { pill: 'bg-slate-100 text-slate-900 border-slate-300',      label: 'text-slate-700',  name: 'Connector' },
  other:    { pill: 'bg-slate-50 text-slate-900 border-slate-200',       label: 'text-slate-700',  name: 'Other' },
};
const roleStyle = (r?: string) => ROLE_STYLES[(r || 'other').toLowerCase()] || ROLE_STYLES.other;

function GrammarColorDecodeSlide({ slide, t }: { slide: Extract<Slide, { type: 'grammar_color_decode' }>; t: ThemeTokens }) {
  const rolesUsed = Array.from(new Set([
    ...slide.chunks.map((c) => c.role),
    ...(slide.variants?.flatMap((v) => v.chunks.map((c) => c.role)) ?? []),
  ]));
  const renderRow = (chunks: { role: string; text: string }[], key: React.Key, big = false) => (
    <div key={key} className="flex flex-wrap items-center gap-2 md:gap-3 justify-center">
      {chunks.map((c, i) => {
        const s = roleStyle(c.role);
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className={`uppercase tracking-widest text-[10px] font-semibold ${s.label}`}>{s.name}</span>
            <span className={`inline-flex items-center rounded-xl border-2 ${s.pill} ${big ? 'px-4 py-3 text-xl md:text-2xl font-semibold' : 'px-3 py-2 text-base md:text-lg'} shadow-sm`}>
              {c.text}
            </span>
          </div>
        );
      })}
    </div>
  );
  return (
    <div className="space-y-6 max-w-4xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Grammar · Color decode</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 md:p-7 space-y-5">
        {renderRow(slide.chunks, 'main', true)}
        {slide.variants && slide.variants.length > 0 && (
          <div className="border-t border-dashed border-slate-300 pt-5 space-y-3">
            <div className={`text-xs uppercase tracking-widest ${t.muted} text-center`}>Same pattern, new words</div>
            {slide.variants.map((v, i) => renderRow(v.chunks, `v${i}`))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {rolesUsed.map((r) => {
          const s = roleStyle(r);
          return (
            <span key={r} className={`text-xs px-2.5 py-1 rounded-full border ${s.pill}`}>● {s.name}</span>
          );
        })}
      </div>
      {slide.rule && <p className={`text-sm text-center ${t.muted}`}><GrammarMarkup text={slide.rule} /></p>}
    </div>
  );
}

function FrequencyThermometerSlide({ slide, t }: { slide: Extract<Slide, { type: 'frequency_thermometer' }>; t: ThemeTokens }) {
  const shape = slide.shape || 'thermometer';
  const items = [...slide.items].sort((a, b) => b.pct - a.pct);
  const colorFor = (pct: number) => {
    // Red (cold/never 0) → Amber (50) → Emerald (hot/always 100)
    if (pct >= 85) return 'from-emerald-500 to-emerald-400';
    if (pct >= 60) return 'from-lime-500 to-lime-400';
    if (pct >= 40) return 'from-amber-500 to-amber-400';
    if (pct >= 15) return 'from-orange-500 to-orange-400';
    return 'from-rose-500 to-rose-400';
  };
  return (
    <div className="space-y-6 max-w-4xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Adverbs of frequency</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>

      <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-x-4 md:gap-x-6">
        {/* Left: vertical thermometer / triangle */}
        <div className="relative flex justify-center">
          <div className="relative w-12 md:w-16 h-[420px] rounded-full bg-slate-100 border-2 border-slate-300 overflow-hidden">
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-rose-500 via-amber-400 to-emerald-500"
              style={{
                height: '100%',
                clipPath: shape === 'triangle' || shape === 'pyramid'
                  ? 'polygon(50% 0%, 100% 100%, 0% 100%)'
                  : 'none',
              }}
            />
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((p) => (
              <div key={p} className="absolute left-0 right-0 border-t border-white/70" style={{ bottom: `${p}%` }} />
            ))}
          </div>
          {/* Bulb at bottom for thermometer */}
          {shape === 'thermometer' && (
            <div className="absolute -bottom-4 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 border-4 border-rose-200" />
          )}
        </div>

        {/* Right: rungs */}
        <div className="relative h-[420px]">
          {items.map((it, i) => {
            const pct = Math.max(0, Math.min(100, it.pct));
            const grad = colorFor(pct);
            return (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-center gap-3"
                style={{ bottom: `calc(${pct}% - 18px)` }}
              >
                <div className={`h-8 rounded-r-lg bg-gradient-to-r ${grad} shadow-sm`} style={{ width: `${Math.max(30, pct)}%`, minWidth: '60px' }}>
                  <div className="h-full px-3 flex items-center text-white text-sm font-semibold drop-shadow">
                    {pct}%
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-lg md:text-xl font-bold ${t.text}`}>{it.adverb}</span>
                  {it.example && <span className={`text-xs md:text-sm italic ${t.muted}`}>“{it.example}”</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slide.rule && <p className={`text-sm text-center ${t.muted}`}><GrammarMarkup text={slide.rule} /></p>}
    </div>
  );
}

function GrammarFormulaSlide({ slide, t }: { slide: Extract<Slide, { type: 'grammar_formula' }>; t: ThemeTokens }) {
  const cols = slide.terms.length;
  return (
    <div className="space-y-6 max-w-4xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Grammar · Formula</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>

      {/* Formula row */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 rounded-2xl border border-slate-200 bg-white/70 p-5">
        {slide.terms.map((term, i) => {
          const s = roleStyle(term.role);
          return (
            <React.Fragment key={`t${i}`}>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[10px] uppercase tracking-widest font-semibold ${s.label}`}>{s.name}</span>
                <span className={`inline-flex items-center rounded-xl border-2 ${s.pill} px-4 py-3 text-lg md:text-xl font-semibold shadow-sm`}>
                  {term.label}
                </span>
                {term.note && <span className={`text-[11px] ${t.muted}`}>{term.note}</span>}
              </div>
              {i < slide.terms.length - 1 && (
                <span className="text-3xl md:text-4xl font-light text-slate-400">+</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Worked example aligned to formula */}
      {slide.example?.length > 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-5">
          <div className={`text-xs uppercase tracking-widest ${t.muted} text-center mb-3`}>Example</div>
          <div className={`grid items-center justify-center gap-2 md:gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}>
            {slide.example.map((ex, i) => {
              const s = roleStyle(ex.role);
              return (
                <span key={`e${i}`} className={`inline-flex items-center rounded-lg border-2 ${s.pill} px-3 py-2 text-base md:text-lg font-medium text-center`}>
                  {ex.text}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {slide.rule && <p className={`text-sm text-center ${t.muted}`}><GrammarMarkup text={slide.rule} /></p>}
    </div>
  );
}

function ItemPager({ total, index, setIndex, score, t }: { total: number; index: number; setIndex: (i: number) => void; score: number; t: ThemeTokens }) {
  if (total <= 1) return null;
  return (
    <div className={`flex items-center justify-between text-xs ${t.muted}`}>
      <span>Item {index + 1} of {total} · Score: {score}/{total}</span>
      <div className="flex gap-2">
        <button disabled={index === 0} onClick={() => setIndex(Math.max(0, index - 1))}
          className="px-2 py-1 rounded border border-slate-700 disabled:opacity-30">← Prev</button>
        <button disabled={index >= total - 1} onClick={() => setIndex(Math.min(total - 1, index + 1))}
          className="px-2 py-1 rounded border border-slate-700 disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}

function ErrorDetectionSlide({ slide, t }: { slide: Extract<Slide, { type: 'error_detection' }>; t: ThemeTokens }) {
  const items = getErrorDetectionItems(slide);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  // Reset when the underlying items change (teacher edits in Creator) so
  // we never render with a stale index past the new array length.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
    setPicks({});
  }, [items.length, JSON.stringify(items)]);
  const item = items[index];
  if (!item) return <div className={t.muted}>No items.</div>;
  const words = item.sentence.split(/\s+/);
  const picked = picks[index] ?? null;
  const score = items.reduce((s, it, i) => s + ((picks[i] ?? -1) === it.wrongIndex ? 1 : 0), 0);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="flex flex-wrap gap-2 text-xl">
        {words.map((w, i) => {
          const isPicked = picked === i;
          const isWrong = i === item.wrongIndex;
          let cls = `border-slate-700 hover:border-indigo-500 ${t.text}`;
          if (picked !== null && isPicked && isWrong) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
          else if (picked !== null && isPicked && !isWrong) cls = 'border-red-500 bg-red-500/10 text-red-200';
          else if (picked !== null && isWrong) cls = 'border-emerald-500/60 text-emerald-300';
          return (
            <button key={i} onClick={() => picked === null && setPicks((p) => ({ ...p, [index]: i }))}
              className={`px-3 py-1.5 rounded-md border transition ${cls}`}>
              {w}
            </button>
          );
        })}
      </div>
      <ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />
    </div>
  );
}

function CorrectionSlide({ slide, t }: { slide: Extract<Slide, { type: 'correction' }>; t: ThemeTokens }) {
  const items = getCorrectionItems(slide);
  const [index, setIndex] = useState(0);
  const [vals, setVals] = useState<Record<number, string>>({});
  const [subs, setSubs] = useState<Record<number, boolean>>({});
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
    setVals({}); setSubs({});
  }, [items.length, JSON.stringify(items)]);
  const item = items[index];
  if (!item) return <div className={t.muted}>No items.</div>;
  const val = vals[index] ?? '';
  const submitted = !!subs[index];
  const norm = (s: string) => s.trim().toLowerCase().replace(/[.!?]/g, '');
  const correct = submitted && norm(val) === norm(item.answer);
  const score = items.reduce((s, it, i) => s + ((subs[i] && norm(vals[i] || '') === norm(it.answer)) ? 1 : 0), 0);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <p className={`text-lg italic border-l-2 border-red-500 pl-4 ${t.muted}`}>{item.wrong}</p>
      <input
        value={val}
        onChange={(e) => { setVals((p) => ({ ...p, [index]: e.target.value })); setSubs((p) => ({ ...p, [index]: false })); }}
        placeholder="Write the corrected sentence…"
        className={`w-full rounded-md border px-4 py-3 outline-none focus:border-indigo-500 ${t.inputBg} ${
          submitted ? (correct ? 'border-emerald-500' : 'border-red-500') : ''
        }`}
      />
      <button onClick={() => setSubs((p) => ({ ...p, [index]: true }))}
        className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
        Check
      </button>
      {submitted && (
        <div className={`text-sm flex items-center gap-2 ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {correct ? 'Correct.' : `Try again. Expected: ${item.answer}`}
        </div>
      )}
      <ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />
    </div>
  );
}

function FillBlankSlide({ slide, t }: { slide: Extract<Slide, { type: 'fill_blank' }>; t: ThemeTokens }) {
  const items = getFillBlankItems(slide);
  const [index, setIndex] = useState(0);
  const [vals, setVals] = useState<Record<number, string>>({});
  const [subs, setSubs] = useState<Record<number, boolean>>({});
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
    setVals({}); setSubs({});
  }, [items.length, JSON.stringify(items)]);
  const item = items[index];
  if (!item) return <div className={t.muted}>No items.</div>;
  const val = vals[index] ?? '';
  const submitted = !!subs[index];
  const correct = submitted && val.trim().toLowerCase() === item.answer.toLowerCase();
  const score = items.reduce((s, it, i) => s + ((subs[i] && (vals[i] || '').trim().toLowerCase() === it.answer.toLowerCase()) ? 1 : 0), 0);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className={`text-2xl ${t.text} flex items-center gap-3 flex-wrap`}>
        <span>{item.before}</span>
        <input
          value={val}
          onChange={(e) => { setVals((p) => ({ ...p, [index]: e.target.value })); setSubs((p) => ({ ...p, [index]: false })); }}
          onKeyDown={(e) => e.key === 'Enter' && setSubs((p) => ({ ...p, [index]: true }))}
          className={`w-32 px-3 py-1.5 rounded-md border text-center outline-none focus:border-indigo-500 ${t.inputBg} ${
            submitted ? (correct ? 'border-emerald-500' : 'border-red-500') : ''
          }`}
        />
        <span>{item.after}</span>
      </div>
      <button onClick={() => setSubs((p) => ({ ...p, [index]: true }))}
        className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
        Check
      </button>
      {submitted && !correct && (
        <div className="text-sm text-red-400 flex items-center gap-2">
          <X className="w-4 h-4" /> Expected: {item.answer}
        </div>
      )}
      <ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />
    </div>
  );
}

function SentenceBuilderSlide({ slide, t }: { slide: Extract<Slide, { type: 'sentence_builder' }>; t: ThemeTokens }) {
  const items = getSentenceBuilderItems(slide);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<number, boolean>>({});
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
    setScores({});
  }, [items.length, JSON.stringify(items)]);
  const item = items[index];
  if (!item) return <div className={t.muted}>No items.</div>;
  const score = Object.values(scores).filter(Boolean).length;
  return (
    <div className="space-y-4 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <SentenceBuilderItemView
        key={index}
        item={item}
        t={t}
        onScored={(ok) => setScores((p) => ({ ...p, [index]: ok }))}
        footer={<ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />}
      />
    </div>
  );
}

function SentenceBuilderItemView({ item, t, onScored, footer }: {
  item: { words: string[]; answer: string[] };
  t: ThemeTokens;
  onScored: (correct: boolean) => void;
  footer: React.ReactNode;
}) {
  const shuffled = useMemo(() => [...item.words].sort(() => Math.random() - 0.5), [item.words]);
  const [bank, setBank] = useState<string[]>(shuffled);
  const [answer, setAnswer] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const correct = checked && answer.join(' ') === item.answer.join(' ');

  const pick = (w: string, i: number) => {
    setBank((b) => b.filter((_, idx) => idx !== i));
    setAnswer((a) => [...a, w]);
    setChecked(false);
  };
  const unpick = (w: string, i: number) => {
    setAnswer((a) => a.filter((_, idx) => idx !== i));
    setBank((b) => [...b, w]);
    setChecked(false);
  };
  const reset = () => { setBank(shuffled); setAnswer([]); setChecked(false); };
  const check = () => {
    setChecked(true);
    onScored(answer.join(' ') === item.answer.join(' '));
  };

  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`min-h-[60px] rounded-md border-2 border-dashed p-3 flex flex-wrap gap-2 ${
        checked ? (correct ? 'border-emerald-500' : 'border-red-500') : 'border-slate-700'
      }`}>
        {answer.length === 0 && <span className={`text-sm ${t.muted}`}>Tap words below to build the sentence.</span>}
        {answer.map((w, i) => (
          <button key={`${w}-${i}`} onClick={() => unpick(w, i)} className="px-3 py-1.5 rounded-md bg-indigo-600/20 border border-indigo-500/50 text-indigo-200">
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((w, i) => (
          <button key={`${w}-${i}`} onClick={() => pick(w, i)} className={`px-3 py-1.5 rounded-md border transition ${t.btnGhost}`}>
            {w}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={check} disabled={answer.length !== item.answer.length} className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium">
          Check
        </button>
        <button onClick={reset} className={`px-5 py-2 rounded-md text-sm ${t.btnGhost}`}>Reset</button>
      </div>
      {footer}
    </div>
  );
}

function DebateScaleSlide({ slide, t }: { slide: Extract<Slide, { type: 'debate_scale' }>; t: ThemeTokens }) {
  const labels = ['Strongly\ndisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nagree'];
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="space-y-8 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="grid grid-cols-5 gap-2">
        {labels.map((l, i) => (
          <button
            key={i}
            onClick={() => setPicked(i)}
            className={`px-2 py-3 rounded-md text-xs font-medium whitespace-pre-line transition ${
              picked === i ? 'bg-indigo-600 text-white' : t.btnGhost
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function RolePlaySlide({ slide, t }: { slide: Extract<Slide, { type: 'role_play' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Role play</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-600 text-white">A</span>
          <p className={`text-lg ${t.text}`}>{slide.lineA}</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-pink-600 text-white">B</span>
          <p className={`text-lg ${t.text}`}>{slide.lineB}</p>
        </div>
      </div>
    </div>
  );
}

function SpeakingTaskSlide({ slide, t }: { slide: Extract<Slide, { type: 'speaking_task' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Speaking</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      {slide.starters && slide.starters.length > 0 && (
        <div className={`rounded-md border border-slate-700 p-4 space-y-2`}>
          <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Sentence starters</div>
          {slide.starters.map((s) => (
            <div key={s} className={`text-base ${t.text}`}>· {s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReflectionSlide({ slide, t }: { slide: Extract<Slide, { type: 'reflection' }>; t: ThemeTokens }) {
  const opts = ['Easy', 'Just right', 'Challenging'];
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Reflection</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="flex flex-wrap gap-3">
        {opts.map((o) => (
          <button key={o} onClick={() => setPicked(o)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
            picked === o ? 'bg-indigo-600 text-white' : t.btnGhost
          }`}>{o}</button>
        ))}
      </div>
      {picked && <p className={`text-sm ${t.muted}`}>Lesson complete. Great work.</p>}
    </div>
  );
}

// ─── Cluster slide (multi-activity) ─────────────────────────────────────────
function ClusterMCQ({ a, t }: { a: Extract<ClusterActivity, { type: 'mcq' }>; t: ThemeTokens }) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === a.answer;
  return (
    <div className={`rounded-lg border ${t.card} p-4 space-y-3`}>
      <p className={`text-base font-medium ${t.text}`}>{a.question}</p>
      <div className="flex flex-wrap gap-2">
        {a.options.map((opt) => {
          const active = picked === opt;
          let cls = `px-3 py-1.5 rounded-md text-sm border transition ${t.btnGhost}`;
          if (picked && active && correct) cls = 'px-3 py-1.5 rounded-md text-sm border border-emerald-500 bg-emerald-500/10 text-emerald-200';
          else if (picked && active && !correct) cls = 'px-3 py-1.5 rounded-md text-sm border border-red-500 bg-red-500/10 text-red-200';
          else if (picked && opt === a.answer) cls = 'px-3 py-1.5 rounded-md text-sm border border-emerald-500/50 text-emerald-300';
          return <button key={opt} onClick={() => picked === null && setPicked(opt)} className={cls}>{opt}</button>;
        })}
      </div>
      {picked !== null && (
        <p className={`text-sm ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {correct ? '✓ Correct.' : (a.explanation ?? 'Try again.')}
        </p>
      )}
    </div>
  );
}

function ClusterFill({ a, t }: { a: Extract<ClusterActivity, { type: 'fill' }>; t: ThemeTokens }) {
  const [val, setVal] = useState('');
  const submitted = val.trim().length > 0;
  const correct = val.trim().toLowerCase() === a.answer.trim().toLowerCase();
  return (
    <div className={`rounded-lg border ${t.card} p-4 space-y-3`}>
      <p className={`text-base font-medium ${t.text}`}>{a.text}</p>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Type your answer…"
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-indigo-500 ${t.inputBg}`}
      />
      {submitted && (
        <p className={`text-sm ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {correct ? '✓ Correct.' : (a.explanation ?? `Answer: ${a.answer}`)}
        </p>
      )}
    </div>
  );
}

function ClusterTF({ a, t }: { a: Extract<ClusterActivity, { type: 'tf' }>; t: ThemeTokens }) {
  const [picked, setPicked] = useState<boolean | null>(null);
  const correct = picked !== null && picked === a.answer;
  return (
    <div className={`rounded-lg border ${t.card} p-4 space-y-3`}>
      <p className={`text-base font-medium ${t.text}`}>{a.statement}</p>
      <div className="flex gap-2">
        {[true, false].map((v) => {
          const active = picked === v;
          let cls = `px-4 py-1.5 rounded-md text-sm font-medium transition ${t.btnGhost}`;
          if (active && correct) cls = 'px-4 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white';
          else if (active && !correct) cls = 'px-4 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white';
          return <button key={String(v)} onClick={() => picked === null && setPicked(v)} className={cls}>{v ? 'True' : 'False'}</button>;
        })}
      </div>
      {picked !== null && (
        <p className={`text-sm ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
          {correct ? '✓ Correct.' : (a.explanation ?? 'Not quite.')}
        </p>
      )}
    </div>
  );
}

function ClusterBuild({ a, t }: { a: Extract<ClusterActivity, { type: 'build' }>; t: ThemeTokens }) {
  const [picked, setPicked] = useState<number[]>([]);
  const sentence = picked.map((i) => a.words[i]).join(' ');
  const submitted = picked.length === a.words.length;
  const correct = submitted && JSON.stringify(picked.map((i) => a.words[i])) === JSON.stringify(a.answer);
  const reset = () => setPicked([]);
  const toggle = (i: number) => {
    if (picked.includes(i)) setPicked(picked.filter((x) => x !== i));
    else setPicked([...picked, i]);
  };
  return (
    <div className={`rounded-lg border ${t.card} p-4 space-y-3`}>
      <p className={`text-base font-medium ${t.text}`}>{a.prompt ?? 'Build the sentence.'}</p>
      <div className="flex flex-wrap gap-2">
        {a.words.map((w, i) => {
          const used = picked.includes(i);
          return (
            <button
              key={i}
              disabled={used}
              onClick={() => toggle(i)}
              className={`px-3 py-1.5 rounded-md text-sm border transition ${used ? 'opacity-30 line-through' : t.btnGhost}`}
            >
              {w}
            </button>
          );
        })}
      </div>
      <div className={`min-h-[2rem] px-3 py-2 rounded-md border border-dashed border-slate-700 text-sm ${t.text}`}>
        {sentence || <span className={t.muted}>Tap words to build…</span>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={reset} className={`text-xs underline ${t.muted}`}>Reset</button>
        {submitted && (
          <span className={`text-sm ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
            {correct ? '✓ Correct.' : `Try: ${a.answer.join(' ')}`}
          </span>
        )}
      </div>
    </div>
  );
}

function ClusterSlide({ slide, t }: { slide: Extract<Slide, { type: 'cluster' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-5 w-full max-w-3xl">
      <div className="space-y-2">
        <div className={`text-xs uppercase tracking-widest ${t.muted}`}>{slide.block}</div>
        <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
        {slide.content && <p className={`text-base ${t.muted}`}>{slide.content}</p>}
      </div>
      <div className="grid gap-3">
        {slide.activities.map((a, i) => {
          switch (a.type) {
            case 'mcq': return <ClusterMCQ key={i} a={a} t={t} />;
            case 'fill': return <ClusterFill key={i} a={a} t={t} />;
            case 'tf': return <ClusterTF key={i} a={a} t={t} />;
            case 'build': return <ClusterBuild key={i} a={a} t={t} />;
          }
        })}
      </div>
    </div>
  );
}

// ─── Renderer ───────────────────────────────────────────────────────────────
function SlideMediaHeader({ slide }: { slide: Slide }) {
  const url = (slide as any).image_url as string | undefined;
  const video = (slide as any).video_embed_url as string | undefined;
  if (!url && !video) return null;
  return (
    <div className="w-full max-w-2xl mb-4 flex justify-center">
      {video ? (
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-700/50">
          <iframe src={video} className="w-full h-full" allowFullScreen title="Slide video" />
        </div>
      ) : (
        <img src={url} alt="" className="max-h-64 w-auto rounded-lg object-contain border border-slate-700/40" />
      )}
    </div>
  );
}

function VocabDeckSlide({ slide, t }: { slide: Extract<Slide, { type: 'vocab_deck' }>; t: ThemeTokens }) {
  const cards = slide.cards?.length ? slide.cards : [{ word: '—', definition: '' }];
  const [i, setI] = useState(0);
  const card = cards[Math.min(i, cards.length - 1)];
  const prev = () => setI((n) => Math.max(0, n - 1));
  const next = () => setI((n) => Math.min(cards.length - 1, n + 1));
  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className={`text-xs uppercase tracking-widest ${t.muted}`}>{slide.title || 'Vocabulary'}</div>
        <div className={`text-xs font-semibold ${t.muted}`}>{i + 1} / {cards.length}</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
        >
          <div className="w-full h-[42vh] rounded-xl overflow-hidden bg-indigo-50/40 border border-indigo-100 flex items-center justify-center">
            {card.image_url ? (
              <img src={card.image_url} alt={card.word} className="object-cover w-full h-full" />
            ) : (
              <div className="text-indigo-300 text-6xl">🖼️</div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-4xl md:text-5xl font-semibold ${t.text}`}>{card.word}</h2>
              <ListenButton text={card.word} label="Listen" />
            </div>
            <p className={`text-lg ${t.text}`}>{card.definition}</p>
            {card.example && (
              <p className={`text-base italic border-l-2 border-indigo-500 pl-4 ${t.muted}`}>“{card.example}”</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={prev}
          disabled={i === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex gap-1.5">
          {cards.map((_, idx) => (
            <span key={idx} className={`w-2 h-2 rounded-full ${idx === i ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
          ))}
        </div>
        <button
          onClick={next}
          disabled={i >= cards.length - 1}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function VocabImageMatchSlide({ slide, t }: { slide: Extract<Slide, { type: 'vocab_image_match' }>; t: ThemeTokens }) {
  const pairs = slide.pairs || [];
  const shuffledImages = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);
  const [solved, setSolved] = useState<Record<string, string>>({}); // word -> image_url
  const [dragWord, setDragWord] = useState<string | null>(null);
  const [wrongImg, setWrongImg] = useState<string | null>(null);
  const attemptsRef = useRef({ attempts: 0, correct: 0, startedAt: Date.now(), emitted: false });

  const tryMatch = (word: string, imageUrl: string) => {
    const match = pairs.find((p) => p.word === word);
    attemptsRef.current.attempts += 1;
    if (match && match.image_url === imageUrl) {
      attemptsRef.current.correct += 1;
      setSolved((s) => ({ ...s, [word]: imageUrl }));
    } else {
      setWrongImg(imageUrl);
      setTimeout(() => setWrongImg(null), 400);
    }
    setDragWord(null);
  };

  useEffect(() => {
    if (pairs.length === 0 || attemptsRef.current.emitted) return;
    if (Object.keys(solved).length < pairs.length) return;
    const s = slide as any;
    if (!isVocabArcSource(s.source)) return;
    attemptsRef.current.emitted = true;
    const { attempts, correct, startedAt } = attemptsRef.current;
    emitVocabArcComplete({
      telemetry_tag: s.telemetry_tag ?? 'vocab_arc_image_match',
      skill_key: s.reinforcement_target?.skill_key ?? 'vocab_recognition',
      target_words: s.reinforcement_target?.target_words ?? pairs.map((p) => p.word),
      attempts,
      correct,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 100,
      duration_ms: Date.now() - startedAt,
      source: s.source,
    });
  }, [solved, pairs, slide]);

  const objective = (slide as any).objective as { title: string; skill: string; how: string } | undefined;
  const doneCount = Object.keys(solved).length;
  const totalCount = pairs.length;
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 flex flex-col items-center">
      <ObjectiveBanner objective={objective} />
      <div className="w-full flex items-baseline justify-between gap-3">
        <h2 className={`text-xl md:text-2xl font-semibold ${t.text}`}>
          {slide.prompt || 'Drag each word onto the matching image.'}
        </h2>
        <span className="text-xs font-semibold text-indigo-600 whitespace-nowrap">
          {doneCount} / {totalCount}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-indigo-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
        />
      </div>


      {/* Words row — centered above the image grid */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {pairs.map((p) => {
          const done = !!solved[p.word];
          return (
            <div
              key={p.word}
              draggable={!done}
              onDragStart={() => setDragWord(p.word)}
              onClick={() => !done && setDragWord(dragWord === p.word ? null : p.word)}
              className={`px-5 py-3 rounded-xl border-2 font-semibold text-lg cursor-grab active:cursor-grabbing select-none transition ${
                done
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 opacity-60'
                  : dragWord === p.word
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md scale-105'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-400'
              }`}
            >
              {p.word}
            </div>
          );
        })}
      </div>

      {/* 2×2 image grid — aligned, equal squares, centered */}
      <div className="grid grid-cols-2 gap-5 w-full max-w-[28rem] mx-auto place-items-center">
        {shuffledImages.map((p) => {
          const matchedWord = Object.entries(solved).find(([, url]) => url === p.image_url)?.[0];
          const isWrong = wrongImg === p.image_url;
          return (
            <div
              key={p.image_url}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragWord && tryMatch(dragWord, p.image_url)}
              onClick={() => dragWord && tryMatch(dragWord, p.image_url)}
              className={`relative aspect-square w-full rounded-2xl overflow-hidden border-2 transition flex items-center justify-center bg-white ${
                matchedWord
                  ? 'border-emerald-500'
                  : isWrong
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-indigo-500'
              }`}
            >
              {p.image_url ? (
                <img src={p.image_url} alt="" className="object-contain w-full h-full p-2" />
              ) : (
                <div className="text-indigo-300 text-5xl">🖼️</div>
              )}
              {matchedWord && (
                <div className="absolute inset-x-0 bottom-0 bg-emerald-600/90 text-white text-sm font-semibold py-1.5 text-center">
                  {matchedWord} <Check className="inline w-4 h-4 ml-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={`text-sm ${t.muted}`}>
        {Object.keys(solved).length} / {pairs.length} matched
      </div>
    </div>
  );

}

function renderSlideInner({ slide, t }: { slide: Slide; t: ThemeTokens }) {
  switch (slide.type) {
    case 'intro': return <Intro slide={slide} t={t} />;
    case 'question': return <QuestionSlide slide={slide} t={t} />;
    case 'poll': return <PollSlide slide={slide} t={t} />;
    case 'opinion': return <OpinionSlide slide={slide} t={t} />;
    case 'vocab': return <VocabSlide slide={slide} t={t} />;
    case 'matching': return <MatchingSlide slide={slide} t={t} />;
    case 'reading_passage': return <ReadingSlide slide={slide} t={t} />;
    case 'listening': return <ListeningSlide slide={slide} t={t} />;
    case 'truefalse': return <TrueFalseSlide slide={slide} t={t} />;
    case 'multiple': return <MultipleSlide slide={slide} t={t} />;
    case 'grammar_pattern': return <GrammarPatternSlide slide={slide} t={t} />;
    case 'grammar_color_decode': return <GrammarColorDecodeSlide slide={slide} t={t} />;
    case 'frequency_thermometer': return <FrequencyThermometerSlide slide={slide} t={t} />;
    case 'grammar_formula': return <GrammarFormulaSlide slide={slide} t={t} />;
    case 'error_detection': return <ErrorDetectionSlide slide={slide} t={t} />;
    case 'correction': return <CorrectionSlide slide={slide} t={t} />;
    case 'fill_blank': return <FillBlankSlide slide={slide} t={t} />;
    case 'sentence_builder': return <SentenceBuilderSlide slide={slide} t={t} />;
    case 'debate_scale': return <DebateScaleSlide slide={slide} t={t} />;
    case 'role_play': return <RolePlaySlide slide={slide} t={t} />;
    case 'speaking_task': return <SpeakingTaskSlide slide={slide} t={t} />;
    case 'reflection': return <ReflectionSlide slide={slide} t={t} />;
    case 'cluster': return <ClusterSlide slide={slide} t={t} />;
    case 'canvas_game':
    case 'living_canvas':
      return <LivingCanvas slide={slide as any} hub="academy" />;
    case 'scaffolded_media':
      return <ScaffoldedPlayer slide={slide as any} hub="academy" />;
    case 'vocab_solo': {
      const s: any = slide;
      return <SoloVocabCard hub="academy" card={{ word: s.word, definition: s.definition, image_url: s.image_url, audio_url: s.audio_url }} />;
    }
    case 'vocab_deck': return <VocabDeckSlide slide={slide} t={t} />;
    case 'vocab_image_match': return <VocabImageMatchSlide slide={slide} t={t} />;
    case 'story_engine_slot':
    case 'escape_room_slot':
    case 'detective_mystery_slot':
    case 'hidden_object_slot': return <LanguageEngineSlide slide={slide as any} t={t} />;
    case 'lesson_summary': return <AcademyLessonSummary slide={slide} t={t} />;
  }
}

function LanguageEngineSlide({ slide, t }: { slide: any; t: ThemeTokens }) {
  const hub = slide.hub || 'academy';
  const cefr = slide.cefr || 'A2';
  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-indigo-300">Interactive language mission</div>
        <h2 className={`text-2xl font-semibold ${t.text}`}>{slide.title || 'Language Game'}</h2>
        {slide.objective && <p className={`mt-2 text-sm ${t.muted}`}>{slide.objective}</p>}
      </div>
      {slide.type === 'story_engine_slot' && slide.graph && <StoryEngineSlot hub={hub} cefr={cefr} graph={slide.graph} lessonId={slide.lessonId} />}
      {slide.type === 'escape_room_slot' && slide.room && <EscapeRoomSlot hub={hub} cefr={cefr} room={slide.room} lessonId={slide.lessonId} />}
      {slide.type === 'detective_mystery_slot' && slide.case && <DetectiveSlot hub={hub} cefr={cefr} case={slide.case} lessonId={slide.lessonId} />}
      {slide.type === 'hidden_object_slot' && slide.scene && <HiddenObjectSlot scene={slide.scene} />}
    </div>
  );
}

export function SlideRenderer({ slide, t }: { slide: Slide; t: ThemeTokens }) {
  // Slides that render their own image inline (cover, vocab 50/50, etc.)
  // must NOT also get the floating SlideMediaHeader image — it produces a
  // duplicate "small image at top" + "image inside card" bug.
  const skipHeader = ['intro', 'vocab', 'canvas_game', 'living_canvas', 'scaffolded_media', 'vocab_solo', 'vocab_deck', 'vocab_image_match', 'story_engine_slot', 'escape_room_slot', 'detective_mystery_slot', 'hidden_object_slot'].includes(slide.type as string);
  return (
    <>
      {!skipHeader && <SlideMediaHeader slide={slide} />}
      {renderSlideInner({ slide, t })}
    </>
  );
}

function AcademyLessonSummary({ slide, t }: { slide: Extract<Slide, { type: 'lesson_summary' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>📋 Lesson Recap</div>
      <h2 className={`text-3xl md:text-4xl font-semibold ${t.text}`}>{slide.title || 'Review Sheet'}</h2>
      {slide.vocab_recap?.length > 0 && (
        <div className={`rounded-md border border-slate-700/50 p-4 space-y-2`}>
          <div className="text-xs uppercase tracking-widest text-indigo-400">Vocabulary mastered</div>
          <div className="flex flex-wrap gap-2">
            {slide.vocab_recap.slice(0, 5).map((w) => (
              <span key={w} className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-medium border border-indigo-500/30">{w}</span>
            ))}
          </div>
        </div>
      )}
      {slide.grammar_recap && (
        <div className={`rounded-md border border-slate-700/50 p-4 space-y-1`}>
          <div className="text-xs uppercase tracking-widest text-indigo-400">Grammar rule</div>
          <p className={`text-base ${t.text}`}>{slide.grammar_recap}</p>
        </div>
      )}
      {slide.takeaway && (
        <div className={`rounded-md border border-indigo-500/40 p-4 space-y-1`}>
          <div className="text-xs uppercase tracking-widest text-indigo-400">Your takeaway</div>
          <p className={`text-base ${t.text}`}>{slide.takeaway}</p>
        </div>
      )}
      <p className={`text-xs ${t.muted}`}>📸 Tip: screenshot this for review later.</p>
    </div>
  );
}

// ─── Progress bar ───────────────────────────────────────────────────────────
export function ProgressBar({ currentBlock, slideIndex, t, slides = SLIDES }: { currentBlock: Block; slideIndex: number; t: ThemeTokens; slides?: Slide[] }) {
  const blockSlides = slides.reduce<Record<Block, number[]>>((acc, s, i) => {
    acc[s.block] = acc[s.block] || [];
    acc[s.block].push(i);
    return acc;
  }, { warmup: [], vocab: [], reading: [], grammar: [], practice: [], interactive: [], speaking: [] });

  const currentBlockIdx = BLOCKS.findIndex((b) => b.id === currentBlock);
  const slidesInBlock = blockSlides[currentBlock] ?? [];
  const localPos = slidesInBlock.indexOf(slideIndex);
  const localPct = slidesInBlock.length > 0 ? ((localPos + 1) / slidesInBlock.length) * 100 : 0;

  return (
    <div className="w-full grid grid-cols-7 gap-1">
      {BLOCKS.map((b, i) => {
        const isCurrent = b.id === currentBlock;
        const isDone = i < currentBlockIdx;
        return (
          <div key={b.id} className="space-y-1.5">
            <div className={`h-1.5 rounded-full overflow-hidden ${isDone ? 'bg-indigo-600' : 'bg-slate-800'}`}>
              {isCurrent && (
                <motion.div
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${localPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
            <div className={`text-[10px] md:text-xs uppercase tracking-wider text-center ${
              isCurrent ? 'text-indigo-300 font-semibold' : isDone ? t.muted : t.muted + ' opacity-60'
            }`}>
              {b.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function AcademyDemo() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');
  const [i, setI] = useState(0);
  const [completeOpen, setCompleteOpen] = useState(false);
  const creditedBlocks = useRef<Set<string>>(new Set());
  const t = themeMap[theme];
  const slide = SLIDES[i];

  // Award coins the first time the student visits each block (idempotent via DB unique index).
  useEffect(() => {
    if (!user?.id) return;
    const blockKey = `${slide.block}`;
    if (creditedBlocks.current.has(blockKey)) return;
    creditedBlocks.current.add(blockKey);
    awardAcademyCoins({
      studentId: user.id,
      lessonId: null,
      blockId: `academy-demo:${blockKey}`,
      amount: ACADEMY_COINS_PER_BLOCK,
      reason: 'lesson_block_complete',
    });
  }, [slide.block, user?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setI((n) => Math.min(SLIDES.length - 1, n + 1));
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const blockLabel = BLOCKS.find((b) => b.id === slide.block)?.label ?? '';
  const coinsEarned = creditedBlocks.current.size * ACADEMY_COINS_PER_BLOCK;

  const handleNext = () => {
    if (i === SLIDES.length - 1) {
      setCompleteOpen(true);
      return;
    }
    setI((n) => Math.min(SLIDES.length - 1, n + 1));
  };

  return (
    <AcademyHubProvider>
    <div className={`min-h-dvh ${t.bg} ${t.text} font-sans flex flex-col`} data-hub="academy">
      {/* subtle indigo mesh backdrop (dark mode only) */}
      {theme === 'dark' && (
        <div className="pointer-events-none fixed inset-0 opacity-40"
             style={{ backgroundImage: 'radial-gradient(at 20% 10%, rgba(99,102,241,0.25), transparent 50%), radial-gradient(at 80% 90%, rgba(168,85,247,0.18), transparent 50%)' }} />
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">A</div>
              <div>
                <div className="text-sm font-semibold">Academy</div>
                <div className={`text-xs ${t.muted}`}>60 min · A2 · Phones & You</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CoinBalance />
              <ProfileAvatar size="sm" />
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className={`p-2 rounded-md ${t.btnGhost}`} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <ProgressBar currentBlock={slide.block} slideIndex={i} t={t} />
        </div>
      </header>

      {/* Split-pane body: static context left, interactive right */}
      <main className="relative z-10 flex-1">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={`static-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {staticContextForSlide(slide) ?? (
                  <FocusPanel
                    lessonTitle="Phones & You"
                    blockLabel={blockLabel}
                    block={slide.block}
                    slideIndex={i}
                    totalSlides={SLIDES.length}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </aside>

          <section>
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className={`w-full rounded-xl border ${t.card} px-6 py-8 md:px-8 md:py-10 min-h-[420px] flex items-center justify-center`}
              >
                <SlideRenderer slide={slide} t={t} />
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>


      {/* Footer nav */}
      <footer className="relative z-10 border-t border-slate-800/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-30 ${t.btnGhost}`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className={`text-sm ${t.muted}`}>
            <span className="font-semibold text-indigo-400">{blockLabel}</span>
            <span className="mx-2">·</span>
            <span>{i + 1} / {SLIDES.length}</span>
          </div>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {i === SLIDES.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      <AcademyLessonCompleteModal
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        xpGained={SLIDES.length * 5}
        coinsEarned={coinsEarned}
      />
    </div>
    </AcademyHubProvider>
  );
}
