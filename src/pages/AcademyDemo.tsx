import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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
  | {
      type: 'role_play';
      block: Block;
      title: string;
      // One entry per texting partner the student can choose between (e.g.
      // Ava, Theo). A single entry skips the picker screen entirely and
      // starts that conversation directly -- multiple entries show a "Who
      // do you want to text?" character-select step first.
      characters: {
        id: string;
        name: string;
        lineA: string; // this character's first question, a complete real
        // sentence -- never a fill-in-the-blank template, that's what
        // hintsA is for
        hintsA: string[]; // tappable "try saying" chips near the compose
        // bar -- complete example sentences (not blanks) the student can
        // tap to drop into the box and edit, help for the answer, separate
        // from the character's own dialogue text
        // Optional second question: this character asks again (not the
        // student inventing a question to them) once the student has
        // answered the first -- same answer-in-your-own-words pattern as
        // the first turn. All optional so a single-question turn works too.
        lineC?: string;
        hintsC?: string[]; // hint chips for the second answer
        closing?: string; // closing line once both questions are answered
        bg_image_url?: string; // this character's own full-bleed scene
      }[];
    }
  // Full-bleed illustrated dialogue scene — background art with the cast already
  // painted into it (never a floating cutout, same convention Playground's
  // RoleplayScene uses), one line revealed at a time with a speech bubble
  // anchored above whoever is speaking.
  | {
      type: 'scene_dialogue';
      block: Block;
      title?: string;
      bg_image_url: string;
      cast: { id: string; name: string; anchor_left: string }[];
      // student_answer (optional): when a line is a question the STUDENT
      // should answer in their own words rather than just echo back, this
      // is what the repeat/answer gate asks for instead of the line's own
      // text — e.g. Ava asks "What is your name?" (text) and the gate
      // prompts "Hi! I am ___." (student_answer), a genuinely different
      // sentence, not a repeat of Ava's line.
      lines: { speaker: string; text: string; student_answer?: string }[];
    }
  // A full conversation recap shown as real chat bubbles (alternating side
  // per speaker, same visual language as scene_dialogue) with one word
  // missing per line -- the student taps a tile from the word bank, then
  // taps the blank it belongs in. Unlike scene_dialogue (one line revealed
  // at a time), every bubble is visible at once so the whole exchange reads
  // as a completed story once every blank is filled.
  | {
      type: 'conversation_fill';
      block: Block;
      title?: string;
      bg_image_url: string;
      cast: { id: string; name: string }[];
      lines: { speaker: string; before: string; answer: string; after: string }[];
    }
  // A tap-to-hear numbers grid (word list is fixed English vocabulary,
  // generated in the component, not authored per lesson) -- used to teach
  // the numbers a student needs before an activity asks them to state
  // their age. Tapping a number plays it and reinforces the target
  // sentence pattern ("I am ___ years old").
  | { type: 'number_chart'; block: Block; title?: string; from?: number; to?: number; bg_image_url?: string }
  // A gamified LISTENING quiz -- Ava SPEAKS a number, the student taps the
  // matching digit. No English text is required to play: Pre-A1 students
  // can't read yet, so word options ("Twelve"/"Twenty"/"Two") would make
  // the quiz unsolvable by reading alone. Digits are answered by ear +
  // numeral recognition only.
  | {
      type: 'number_quiz_game';
      block: Block;
      title?: string;
      bg_image_url?: string;
      items: { answer: number; choices: number[] }[];
    }
  // A real GAME for letter sounds, not a passive flashcard: Ava plays a
  // sound, the student taps the matching letter from a few choices --
  // same listen-tap-streak-confetti loop as number_quiz_game, culminating
  // in a "You found <WORD>!" reveal with the mnemonic pictures once every
  // round is answered.
  | {
      type: 'letter_sound_game';
      block: Block;
      word: string; // the CVC word being spelled out round by round, e.g. "dog"
      rounds: { letter: string; is_vowel?: boolean; image_url: string; distractors: string[] }[];
    }
  // A creative, illustrated "storybook page" for connected reading --
  // full-bleed scene, the passage laid out like a page from a picture
  // book with its target words highlighted in their own color, a
  // narrator button to hear the whole page read aloud.
  | {
      type: 'story_page';
      block: Block;
      title?: string;
      bg_image_url: string;
      passage: string;
      highlight_words: { word: string; color: string; emoji: string }[];
    }
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
        {/* True/False as thumbs up/down -- an icon a pre-reader recognizes
            instantly, not text they have to decode. True stays first. */}
        {[true, false].map((v) => {
          const active = picked === v;
          const isAnswer = picked !== null && v === item.answer;
          let cls = t.btnGhost;
          if (active && correct) cls = 'bg-emerald-600 text-white border-emerald-600';
          else if (active && !correct) cls = 'bg-red-600 text-white border-red-600';
          else if (picked !== null && isAnswer) cls = 'border border-emerald-500 text-emerald-300';
          return (
            <button
              key={String(v)}
              onClick={() => picked === null && setPicks((p) => ({ ...p, [index]: v }))}
              className={`flex flex-col items-center gap-1 px-8 py-3 rounded-xl font-medium transition ${cls}`}
              aria-label={v ? 'True' : 'False'}
            >
              <span className="text-3xl leading-none">{v ? '👍' : '👎'}</span>
              <span className="text-xs uppercase tracking-widest">{v ? 'True' : 'False'}</span>
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
      {/* GrammarMarkup (not raw text) so a "___" blank renders as its own
          dashed box, not plain underscore characters buried in the
          sentence -- confirmed live: a student couldn't tell the blank
          apart from the rest of the question. */}
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}><GrammarMarkup text={item.question} /></h2>
      {/* Chunky, colorful pill options with a clear correct/wrong icon on
          pick -- matches the true/false thumbs-up/down treatment instead of
          the old plain bordered rows that looked identical whichever theme
          wrapped them. */}
      <div className="grid gap-3 sm:grid-cols-2">
        {item.options.map((opt) => {
          const active = picked === opt;
          const isAnswer = opt === item.answer;
          let cls = `${t.btnGhost} bg-transparent`;
          if (picked && active && isAnswer) cls = 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600';
          else if (picked && active && !isAnswer) cls = 'border-2 border-red-500 bg-red-500/10 text-red-600';
          else if (picked && isAnswer) cls = 'border-2 border-emerald-500/50 text-emerald-600';
          return (
            <button
              key={opt}
              onClick={() => picked === null && setPicks((p) => ({ ...p, [index]: opt }))}
              className={`flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-lg font-semibold shadow-sm transition ${cls}`}
            >
              <span>{opt}</span>
              {picked && active && (isAnswer ? <span className="text-xl">✓</span> : <span className="text-xl">✗</span>)}
              {picked && !active && isAnswer && <span className="text-xl">✓</span>}
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
          <React.Fragment key={i}>
            <div className={`px-4 py-3 rounded-md border ${t.card}`}>
              <div className={`text-base ${t.text}`}><GrammarMarkup text={r.a} /></div>
            </div>
            {/* Was text-indigo-200 -- a near-white shade meant for a dark
                card, unreadable on the white speech-bubble this slide
                actually renders inside (confirmed live: invisible text).
                indigo-700 keeps the same accent hue with real contrast on
                a light card. */}
            <div className="px-4 py-3 rounded-md border border-indigo-500/40 bg-indigo-500/5">
              <div className="text-base font-semibold text-indigo-700"><GrammarMarkup text={r.b} /></div>
            </div>
          </React.Fragment>
        ))}
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

// Real phone-texting UI. Ava asks a question, the student answers in
// their OWN words (lineB is shown only as a faded, dashed example until
// they do); if the slide carries a second question (lineC), Ava asks
// again -- Ava is the one asking both times, not the student inventing a
// question to send her -- and the student answers a second time (lineD is
// that turn's faded example); once both are answered, Ava's closing line
// wraps up the exchange. A slide with no lineC behaves exactly like a
// single-question turn.
type RolePlayMsg = { from: 'char' | 'student'; text: string };
type RolePlayCharacter = Extract<Slide, { type: 'role_play' }>['characters'][number];

// Outer component: shows a "Who do you want to text?" picker when the
// slide offers more than one texting partner (Ava, Theo, ...), then hands
// off to RolePlayConversation for whichever one the student picks. A
// single-character slide skips the picker and starts straight in.
function RolePlaySlide({ slide, t, fullBleed }: { slide: Extract<Slide, { type: 'role_play' }>; t: ThemeTokens; fullBleed?: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(slide.characters.length === 1 ? slide.characters[0].id : null);
  const selected = slide.characters.find((c) => c.id === selectedId) ?? null;

  if (!selected) {
    const picker = (
      <div className="mx-auto w-full max-w-md space-y-5 text-center">
        <div className={fullBleed ? 'text-lg font-bold text-white drop-shadow-lg' : `text-lg font-bold ${t.text}`}>
          Who do you want to text? 💬
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {slide.characters.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 rounded-3xl bg-white/95 px-6 py-5 shadow-2xl backdrop-blur-sm transition"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
                {c.name[0]}
              </span>
              <span className="text-base font-bold text-slate-800">{c.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
    return fullBleed ? (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4">{picker}</div>
    ) : (
      picker
    );
  }

  return <RolePlayConversation key={selected.id} character={selected} title={slide.title} t={t} fullBleed={fullBleed} />;
}

function RolePlayConversation({
  character, title, t, fullBleed,
}: { character: RolePlayCharacter; title: string; t: ThemeTokens; fullBleed?: boolean }) {
  const { playVoice } = useAcademyAudio();
  const [messages, setMessages] = useState<RolePlayMsg[]>([{ from: 'char', text: character.lineA }]);
  const [stage, setStage] = useState<'q1' | 'q2' | 'done'>('q1');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const hasSecondQuestion = !!character.lineC;
  const spokenCount = useRef(0);

  // Every incoming message auto-plays once it arrives, and stays
  // replayable via the speaker button on its bubble -- a Pre-A1 student
  // who can't read yet still needs to know what's being asked; text alone
  // isn't enough.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (messages.length > spokenCount.current && last?.from === 'char') {
      void playVoice(stripMd(last.text));
    }
    spokenCount.current = messages.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // A brief "typing…" beat before the next message lands -- reads like a
  // real texting app, not a scripted line dumped on screen.
  const sendChar = (text: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: 'char', text }]);
    }, 900);
  };

  const send = () => {
    const msg = draft.trim();
    if (!msg) return;
    setDraft('');
    if (stage === 'q1') {
      setMessages((m) => [...m, { from: 'student', text: msg }]);
      if (hasSecondQuestion) {
        setStage('q2');
        sendChar(character.lineC!);
      } else {
        setStage('done');
        if (character.closing) sendChar(character.closing);
      }
    } else if (stage === 'q2') {
      setMessages((m) => [...m, { from: 'student', text: msg }]);
      setStage('done');
      if (character.closing) sendChar(character.closing);
    }
  };

  // Tappable "try saying" hints -- complete example sentences the student
  // can drop into the box and edit, never a fill-in-the-blank baked into
  // the message itself (the character's own lines are always whole
  // sentences).
  const hints = stage === 'q1' ? character.hintsA : stage === 'q2' ? character.hintsC : undefined;

  // Message bubbles -- shared between the fullBleed (floating directly on
  // the scene) and boxed (Creator Studio preview) layouts.
  const messageItems = (
    <AnimatePresence initial={false}>
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className={`flex ${m.from === 'char' ? 'justify-start' : 'justify-end'}`}
        >
          {m.from === 'char' && (
            <button
              onClick={() => playVoice(stripMd(m.text))}
              aria-label="Hear this message again"
              className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full bg-indigo-600 text-base text-white shadow-lg transition active:scale-95"
            >
              🔊
            </button>
          )}
          <div
            className={
              m.from === 'char'
                ? 'max-w-[75%] rounded-2xl rounded-bl-sm bg-white/95 px-4 py-3 text-base text-slate-800 shadow-lg backdrop-blur-sm'
                : 'max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-indigo-600 px-4 py-3 text-base text-white shadow-lg'
            }
          >
            <GrammarMarkup text={m.text} />
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  const typingBubble = typing && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/95 px-4 py-3.5 shadow-lg backdrop-blur-sm">
        {[0, 1, 2].map((d) => (
          <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 0.15}s` }} />
        ))}
      </div>
    </motion.div>
  );

  const doneBadge = stage === 'done' && !typing && (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center pt-1">
      <span className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
        ✓ Conversation complete
      </span>
    </motion.div>
  );

  const hintsRow = stage !== 'done' && !typing && hints && hints.length > 0 && (
    <div className={`flex flex-wrap items-center justify-center gap-1.5 ${fullBleed ? '' : 'border-t border-slate-200 bg-indigo-50/60 px-4 pt-2.5'}`}>
      <span className={`text-xs font-bold ${fullBleed ? 'text-white drop-shadow' : 'text-indigo-400'}`}>💡 Try:</span>
      {hints.map((h, i) => (
        <motion.button
          key={h}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => setDraft(h)}
          className="rounded-full border border-indigo-200 bg-white/95 px-3 py-1 text-xs font-semibold text-indigo-600 shadow-lg backdrop-blur-sm transition active:scale-95"
        >
          {h}
        </motion.button>
      ))}
    </div>
  );

  const composeBar = (
    <div className={`flex items-center gap-2 ${fullBleed ? 'rounded-full bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-sm' : 'border-t border-slate-200 bg-white px-4 py-3'}`}>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        disabled={stage === 'done'}
        placeholder="Type your reply…"
        className={`flex-1 text-base text-slate-900 outline-none disabled:opacity-50 ${fullBleed ? 'bg-transparent px-3' : 'rounded-full border border-slate-300 px-5 py-3 focus:border-indigo-500'}`}
      />
      <button
        onClick={send}
        disabled={!draft.trim() || stage === 'done'}
        aria-label="Send"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg text-white transition disabled:opacity-30"
      >
        ➤
      </button>
    </div>
  );

  // fullBleed: bubbles float directly on the illustrated scene -- no boxed
  // "phone screenshot" card sitting on top of the art. Per direction, the
  // enclosing panel competed with the background instead of showing it
  // off. The background image is THIS character's own (per-character, not
  // the page-level single image), painted here rather than by
  // PlayAcademyLesson, since which character's art applies is decided by
  // in-component selection state the page-level background logic can't see.
  if (fullBleed) {
    return (
      <div className="relative flex h-full w-full flex-col items-center overflow-hidden px-4 pb-6 pt-6">
        {character.bg_image_url && (
          <img src={character.bg_image_url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        )}
        <div className="flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 shadow-lg backdrop-blur-md">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
            {character.name[0]}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
          </span>
          <span className="text-sm font-semibold text-white">{character.name}</span>
          <span className="text-xs text-emerald-300">{typing ? 'typing…' : 'online'}</span>
        </div>
        <div className="mt-4 flex w-full max-w-xl flex-1 flex-col justify-end gap-3 overflow-y-auto">
          {messageItems}
          {typingBubble}
          {doneBadge}
        </div>
        <div className="mt-3 w-full max-w-xl space-y-2">
          {hintsRow}
          {composeBar}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <div className={`text-xs uppercase tracking-widest text-center ${t.muted}`}>{title}</div>
      <div className="overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-gradient-to-b from-slate-50 to-slate-100 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-base font-bold text-white">
            {character.name[0]}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          </span>
          <div>
            <div className="text-base font-semibold text-slate-800">{character.name}</div>
            <div className="text-xs font-medium text-emerald-500">{typing ? 'typing…' : 'online'}</div>
          </div>
        </div>
        <div className="flex min-h-[460px] flex-col gap-3 p-5">
          {messageItems}
          {typingBubble}
          {doneBadge}
        </div>
        {hintsRow}
        {composeBar}
      </div>
    </div>
  );
}

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
];

// Tap-to-hear numbers grid. Built specifically as a scaffold before an
// activity asks the student to state their age -- tapping a number plays
// it AND says the full target sentence ("I am seven years old."), so the
// student rehearses the exact pattern they'll need next, not just the
// isolated number word.
//
// fullBleed: same convention as SceneDialogueSlide/ConversationFillSlide --
// PlayAcademyLesson already paints bg_image_url as the whole page
// background, so this renders no <img> of its own, just a bigger, frosted
// card floating over that full-viewport scene instead of the small
// bottom-anchored bubble every other non-fullBleed slide gets.
function NumberChartSlide({ slide, t, fullBleed }: { slide: Extract<Slide, { type: 'number_chart' }>; t: ThemeTokens; fullBleed?: boolean }) {
  const { playVoice } = useAcademyAudio();
  const from = slide.from ?? 1;
  const to = slide.to ?? 20;
  const nums = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const [picked, setPicked] = useState<number | null>(null);

  const tap = (n: number) => {
    setPicked(n);
    void playVoice(`${NUMBER_WORDS[n]}. I am ${NUMBER_WORDS[n]} years old.`);
  };

  const grid = (
    <div className={`grid grid-cols-4 sm:grid-cols-5 ${fullBleed ? 'gap-3' : 'gap-2.5'}`}>
      {nums.map((n) => {
        const active = picked === n;
        return (
          <button
            key={n}
            onClick={() => tap(n)}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 shadow-sm transition active:scale-95 ${
              fullBleed ? 'py-5' : 'py-3'
            } ${active ? 'border-indigo-500 bg-indigo-600 text-white' : `${t.card} ${t.text} hover:border-indigo-400`}`}
          >
            <span className={fullBleed ? 'text-4xl font-black' : 'text-2xl font-black'}>{n}</span>
            <span className={`font-semibold uppercase tracking-wide ${fullBleed ? 'text-sm' : 'text-[11px]'} ${active ? 'text-indigo-100' : t.muted}`}>
              {NUMBER_WORDS[n]}
            </span>
          </button>
        );
      })}
    </div>
  );

  if (fullBleed) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4">
        <div className="w-full max-w-3xl space-y-6 rounded-[2rem] bg-white/95 p-6 shadow-2xl backdrop-blur-sm md:p-8">
          <div className="space-y-1 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-500">Numbers</div>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{slide.title || 'Numbers 1–20'}</h2>
            <p className="text-sm text-slate-500">Tap a number to hear it — practice saying your age!</p>
          </div>
          {grid}
          {picked !== null && (
            <div className="flex justify-center">
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                "I am {NUMBER_WORDS[picked]} years old!" 🎉
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      <div className="space-y-1 text-center">
        <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Numbers</div>
        <h2 className={`text-2xl font-semibold md:text-3xl ${t.text}`}>{slide.title || 'Numbers 1–20'}</h2>
        <p className={`text-sm ${t.muted}`}>Tap a number to hear it — practice saying your age!</p>
      </div>
      {grid}
      {picked !== null && (
        <div className="flex justify-center">
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
            "I am {NUMBER_WORDS[picked]} years old!" 🎉
          </span>
        </div>
      )}
    </div>
  );
}

// Gamified LISTENING quiz: Ava SPEAKS a number, the student taps the
// matching digit -- no English word to read, so a Pre-A1 student who
// can't read yet can still play. Big colorful digit buttons, a streak
// counter, confetti on a correct tap, over a full-bleed illustrated
// game-show scene, researched from kids-app gamification patterns
// (streaks, celebratory feedback, bite-sized rounds).
function NumberQuizGameSlide({ slide, fullBleed }: { slide: Extract<Slide, { type: 'number_quiz_game' }>; fullBleed?: boolean }) {
  const { playVoice } = useAcademyAudio();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const items = slide.items;
  const item = items[index];
  const finished = index >= items.length;

  const speakAnswer = () => item && void playVoice(NUMBER_WORDS[item.answer]);

  useEffect(() => {
    if (!finished && item) void playVoice(`Listen! ${NUMBER_WORDS[item.answer]}!`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const pick = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    const correct = n === item.answer;
    if (correct) {
      setStreak((s) => s + 1);
      setScore((s) => s + 1);
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
      void playVoice(`Yes! ${NUMBER_WORDS[n]}!`);
    } else {
      setStreak(0);
      void playVoice(`Not quite. ${NUMBER_WORDS[item.answer]}.`);
    }
    window.setTimeout(() => {
      setPicked(null);
      setIndex((i) => i + 1);
    }, 1100);
  };

  const card = (
    <div className={`w-full ${fullBleed ? 'max-w-lg rounded-[2rem] bg-white/95 p-6 shadow-2xl backdrop-blur-sm md:p-8' : 'max-w-lg mx-auto space-y-5'}`}>
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
          {finished ? 'Done!' : `Round ${index + 1} / ${items.length}`}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
          🔥 {streak}
        </span>
      </div>
      {finished ? (
        <div className="space-y-3 py-6 text-center">
          <div className="text-5xl">🏆</div>
          <h2 className="text-2xl font-bold text-slate-900">Great job!</h2>
          <p className="text-slate-500">
            You got <span className="font-bold text-indigo-600">{score} / {items.length}</span> right!
          </p>
        </div>
      ) : (
        <>
          {/* No English text to read -- just an ear icon inviting a replay,
              and the numeral choices themselves. */}
          <button
            onClick={speakAnswer}
            className="mx-auto mb-5 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-lg font-bold text-white shadow-lg transition active:scale-95"
          >
            🔊 Listen again
          </button>
          <div className="grid grid-cols-3 gap-3">
            {item.choices.map((n) => {
              const active = picked === n;
              const isAnswer = n === item.answer;
              let cls = 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400';
              if (picked !== null && active && isAnswer) cls = 'border-emerald-500 bg-emerald-500 text-white';
              else if (picked !== null && active && !isAnswer) cls = 'border-red-500 bg-red-500 text-white';
              else if (picked !== null && isAnswer) cls = 'border-emerald-500 bg-emerald-50 text-emerald-700';
              return (
                <button
                  key={n}
                  onClick={() => pick(n)}
                  disabled={picked !== null}
                  className={`rounded-2xl border-2 py-6 text-4xl font-black shadow-sm transition active:scale-95 ${cls}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  if (fullBleed) {
    return <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4">{card}</div>;
  }
  return card;
}

// A real GAME for letter sounds -- per direction, "it doesn't have to be
// flashcards... use it as a game" -- reusing the exact listen-tap-streak-
// confetti loop from NumberQuizGameSlide (already proven and, per the
// earlier accessibility fix, works with zero reading required). Each
// round: hear a sound, tap the matching letter from a few choices; the
// mnemonic picture is the reward for a correct pick, not a passive first
// step. Finishing all rounds reveals the spelled-out word with every
// mnemonic picture in a row.
function LetterSoundGameSlide({ slide, fullBleed }: { slide: Extract<Slide, { type: 'letter_sound_game' }>; fullBleed?: boolean }) {
  const { playVoice } = useAcademyAudio();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const rounds = slide.rounds;
  const round = rounds[index];
  const finished = index >= rounds.length;

  const choices = useMemo(
    () => (round ? [...round.distractors, round.letter].sort(() => Math.random() - 0.5) : []),
    [round],
  );

  const speakSound = () => round && void playVoice(`${round.letter}... ${round.letter}... ${round.letter}...`);

  useEffect(() => {
    if (!finished && round) void playVoice(`Listen! ${round.letter}... ${round.letter}... ${round.letter}...`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const pick = (letter: string) => {
    if (picked !== null) return;
    setPicked(letter);
    const correct = letter === round.letter;
    if (correct) {
      setStreak((s) => s + 1);
      setScore((s) => s + 1);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.55 } });
      void playVoice(`Yes! ${letter}!`);
    } else {
      setStreak(0);
      void playVoice(`Not quite. It's ${round.letter}.`);
    }
    window.setTimeout(() => {
      setPicked(null);
      setIndex((i) => i + 1);
    }, 1400);
  };

  const card = (
    <div className={`w-full ${fullBleed ? 'max-w-lg rounded-[2rem] bg-white/95 p-6 shadow-2xl backdrop-blur-sm md:p-8' : 'max-w-lg mx-auto space-y-5'}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
          {finished ? 'Done!' : `Sound ${index + 1} / ${rounds.length}`}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
          🔥 {streak}
        </span>
      </div>
      {finished ? (
        <div className="space-y-4 py-2 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900">You found {slide.word.toUpperCase()}!</h2>
          <div className="flex justify-center gap-3">
            {rounds.map((r, i) => (
              <img
                key={i}
                src={r.image_url}
                alt={r.letter}
                className={`h-16 w-16 rounded-2xl border-4 object-cover shadow-lg ${r.is_vowel ? 'border-rose-300' : 'border-indigo-300'}`}
              />
            ))}
          </div>
          <p className="text-slate-500">
            <span className="font-bold text-indigo-600">{score} / {rounds.length}</span> sounds found first try!
          </p>
        </div>
      ) : (
        <>
          {/* Mystery card until the right sound is tapped -- the mnemonic
              picture is a reward, not the first thing shown. */}
          <div
            className={`relative mx-auto mb-4 h-36 w-36 overflow-hidden rounded-3xl border-4 shadow-xl ${
              picked === round.letter ? (round.is_vowel ? 'border-rose-300' : 'border-indigo-300') : 'border-white'
            }`}
          >
            {picked === round.letter ? (
              <img src={round.image_url} alt={round.letter} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-5xl">❓</div>
            )}
          </div>
          <button
            onClick={speakSound}
            className="mx-auto mb-4 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-lg font-bold text-white shadow-lg transition active:scale-95"
          >
            🔊 Listen again
          </button>
          <div className="grid grid-cols-3 gap-3">
            {choices.map((l) => {
              const active = picked === l;
              const isAnswer = l === round.letter;
              let cls = 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400';
              if (picked !== null && active && isAnswer) cls = 'border-emerald-500 bg-emerald-500 text-white';
              else if (picked !== null && active && !isAnswer) cls = 'border-red-500 bg-red-500 text-white';
              else if (picked !== null && isAnswer) cls = 'border-emerald-500 bg-emerald-50 text-emerald-700';
              return (
                <button
                  key={l}
                  onClick={() => pick(l)}
                  disabled={picked !== null}
                  className={`rounded-2xl border-2 py-6 text-4xl font-black shadow-sm transition active:scale-95 ${cls}`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  if (fullBleed) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4">
        {/* Decorative floating sparkles -- per direction, "make it fun,
            entertaining", matching the game-show energy of the numbers
            quiz. */}
        <span className="pointer-events-none absolute left-10 top-10 text-3xl opacity-80">✨</span>
        <span className="pointer-events-none absolute right-12 top-16 text-2xl opacity-70">⭐</span>
        <span className="pointer-events-none absolute bottom-16 left-16 text-2xl opacity-70">🌟</span>
        {card}
      </div>
    );
  }
  return card;
}

// A creative, illustrated "storybook page" for connected reading -- full-
// bleed scene, the passage laid out like a real picture-book page with
// its target CVC words highlighted in their own color (tap one to hear
// it), a narrator button reads the whole page aloud.
function StoryPageSlide({ slide, fullBleed }: { slide: Extract<Slide, { type: 'story_page' }>; fullBleed?: boolean }) {
  const { playVoice } = useAcademyAudio();
  const tokens = useMemo(() => {
    const parts = slide.passage.split(/(\s+)/);
    return parts.map((tok) => {
      const clean = tok.replace(/[.,!?]/g, '').toLowerCase();
      const hit = slide.highlight_words.find((h) => h.word.toLowerCase() === clean);
      return { tok, hit };
    });
  }, [slide]);

  const page = (
    <div className={`relative w-full ${fullBleed ? 'max-w-lg' : 'max-w-2xl'} space-y-4 rounded-[2rem] bg-white/95 p-7 shadow-2xl backdrop-blur-sm md:p-9`}>
      <div className="text-xs font-bold uppercase tracking-widest text-indigo-500">📖 {slide.title || 'Read Together!'}</div>
      <button
        onClick={() => playVoice(slide.passage)}
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition active:scale-95"
      >
        🔊 Listen to the story
      </button>
      <p className="text-2xl font-bold leading-relaxed text-slate-800">
        {tokens.map((p, i) =>
          p.hit ? (
            <button
              key={i}
              onClick={() => playVoice(p.hit!.word)}
              className="mx-0.5 rounded-lg px-1.5 py-0.5 font-black transition active:scale-95"
              style={{ background: `${p.hit.color}22`, color: p.hit.color }}
            >
              {p.hit.emoji} {p.tok.trim()}
            </button>
          ) : (
            <React.Fragment key={i}>{p.tok}</React.Fragment>
          ),
        )}
      </p>
    </div>
  );

  return (
    <div className={fullBleed ? 'relative flex h-full w-full items-center justify-center overflow-hidden px-4' : 'relative w-full max-w-3xl aspect-video overflow-hidden rounded-2xl shadow-2xl mx-auto flex items-center justify-center px-4'}>
      {!fullBleed && <img src={slide.bg_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {!fullBleed && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />}
      {page}
    </div>
  );
}

// Dialogue lines can mark specific words as vocabulary with **word** —
// stripMd gives TTS the plain sentence; DialogueLineText renders those
// spans as individually tappable "say it again" chips so a student can
// click a word inside the conversation itself and hear + repeat just that
// word, instead of vocabulary living only in a separate card deck later.
const stripMd = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1');

function DialogueLineText({ text, onWordTap }: { text: string; onWordTap: (word: string) => void }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onWordTap(part); }}
            className="mx-0.5 rounded-md bg-indigo-100 px-1.5 py-0.5 font-bold text-indigo-700 underline decoration-indigo-400 decoration-2 underline-offset-2 transition active:scale-95"
          >
            {part}
          </button>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

function SceneDialogueSlide({ slide, fullBleed }: { slide: Extract<Slide, { type: 'scene_dialogue' }>; fullBleed?: boolean }) {
  const { playVoice } = useAcademyAudio();
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  // Per-line "hold to repeat" gate, mirroring Playground's MeetScene
  // (SceneRenderer.tsx) hold-and-confirm mechanic: a line only counts as
  // practiced once the student holds the repeat button for ~1.2s, not just
  // by tapping through. repeated tracks which line indices have cleared it;
  // Next line stays disabled until the current one has.
  const [repeated, setRepeated] = useState<Set<number>>(new Set());
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<number | null>(null);

  const anchorFor = (speakerId: string) =>
    slide.cast.find((c) => c.id === speakerId)?.anchor_left ?? '50%';
  const nameFor = (speakerId: string) =>
    slide.cast.find((c) => c.id === speakerId)?.name ?? speakerId;

  const current = started && step < slide.lines.length ? slide.lines[step] : null;
  const finished = started && step >= slide.lines.length;
  const hasVocabWords = slide.lines.some((l) => /\*\*(.+?)\*\*/.test(l.text));
  const currentRepeated = repeated.has(step);

  const begin = () => {
    setStarted(true);
    setStep(0);
    playVoice(stripMd(slide.lines[0]?.text ?? ''));
  };
  const replay = () => current && playVoice(stripMd(current.text));
  const advance = () => {
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep < slide.lines.length) playVoice(stripMd(slide.lines[nextStep].text));
  };
  const startHold = () => {
    if (currentRepeated) return;
    setHeld(true);
    holdTimer.current = window.setTimeout(() => {
      setHeld(false);
      setRepeated((s) => new Set(s).add(step));
    }, 1200);
  };
  const endHold = () => {
    setHeld(false);
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
  };

  // fullBleed (set by PlayAcademyLesson, the only edge-to-edge player) drops
  // the aspect-video/max-w-4xl/rounded-2xl bounded-card sizing in favor of
  // filling its parent completely — the parent itself is what's sized to the
  // viewport there. Every other caller (AcademyDemo's own split-pane preview,
  // Creator Studio) omits the prop and keeps the original bounded-card look.
  //
  // fullBleed ALSO skips this component's own <img>/scrim: PlayAcademyLesson
  // already paints this exact bg_image_url as the whole page's background
  // (covering the header and nav too, not just this component's own box —
  // see pageBgImage there). Drawing the same photo a second time here, at a
  // different container size (this component's box is only the area between
  // the header and the bottom nav, smaller than the full viewport), made
  // each layer's independent cover-crop math disagree at the edges — a
  // visible seam right where this box met the page background, i.e. a
  // letterboxed-looking border around what was meant to be one seamless
  // edge-to-edge photo. Rendering nothing here and letting the page
  // background show through removes the seam entirely.
  return (
    <div className={fullBleed ? 'relative h-full w-full overflow-hidden' : 'relative w-full aspect-video max-w-4xl overflow-hidden rounded-2xl shadow-2xl'}>
      {!fullBleed && (
        <>
          <img src={slide.bg_image_url} alt={slide.title || 'Dialogue scene'} className="absolute inset-0 h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,10,40,0.35) 0%, rgba(15,10,40,0) 30%, rgba(15,10,40,0) 55%, rgba(76,29,149,0.4) 100%)' }} />
        </>
      )}

      {slide.title && (
        <span className="absolute left-5 top-5 w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-700 shadow">
          {slide.title}
        </span>
      )}

      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
          <button
            onClick={begin}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-2xl transition hover:bg-indigo-500 active:scale-95"
          >
            ▶ Watch the conversation
          </button>
        </div>
      )}

      {current && (
        <>
          <button
            onClick={replay}
            className="absolute right-5 top-5 z-30 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-700 shadow-xl ring-1 ring-indigo-200 active:scale-95"
            aria-label="Hear this line again"
          >
            🔁 Replay
          </button>
          {/* A real speech bubble now — rounded card + a triangular tail —
              instead of a plain frameless rectangle, offset to sit beside
              the speaker (not centered on top of them), tail pointing back
              down-left toward whoever is talking. */}
          <div
            className="absolute top-[20%] z-20 max-w-[340px] px-4 transition-all duration-300"
            style={{ left: `calc(${anchorFor(current.speaker)} + 14%)` }}
          >
            <div className="relative rounded-2xl bg-white px-5 py-3 text-center shadow-2xl">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-500">{nameFor(current.speaker)}</div>
              <div className="text-lg font-semibold text-slate-800">
                <DialogueLineText text={current.text} onWordTap={(w) => playVoice(w)} />
              </div>
              <div className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 bg-white" />
            </div>
          </div>
          {hasVocabWords && step === 0 && (
            <div className="absolute inset-x-0 top-[14%] z-20 flex justify-center px-4">
              <span className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold text-indigo-700 shadow-lg">
                👆 Tap the highlighted words to hear and repeat them!
              </span>
            </div>
          )}

          {/* Mandatory "hold to repeat/answer" step, same shape as
              Playground's MeetScene bottom sheet: the student holds the
              button while saying the line out loud; Next line only unlocks
              once they have. When the line carries a student_answer, this
              becomes a real Q&A turn — the gate shows and asks for THAT
              sentence (the student's own answer), not an echo of Ava's
              question, so "What is your name?" is followed by the student
              actually saying their own name, not repeating the question. */}
          <div className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-3 px-4">
            {!currentRepeated ? (
              <div className="w-full max-w-sm rounded-t-3xl border-t-4 border-indigo-400 bg-white/95 p-4 text-center shadow-2xl backdrop-blur">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                  {current.student_answer ? '🎤 Your turn — answer!' : '🎤 Your turn — say it out loud'}
                </div>
                {current.student_answer && (
                  <div className="mb-2 text-sm font-semibold text-slate-700">"{current.student_answer}"</div>
                )}
                <button
                  onPointerDown={startHold}
                  onPointerUp={endHold}
                  onPointerLeave={endHold}
                  onPointerCancel={endHold}
                  className={`w-full rounded-full bg-indigo-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition active:scale-95 ${held ? 'scale-95 bg-indigo-700' : ''}`}
                >
                  {held ? 'Keep holding…' : current.student_answer ? 'Hold & say your answer' : 'Hold & repeat the line'}
                </button>
              </div>
            ) : (
              <button
                onClick={advance}
                className="rounded-full bg-white/95 px-6 py-3 text-sm font-bold uppercase tracking-widest text-indigo-700 shadow-xl ring-1 ring-indigo-200 active:scale-95"
              >
                {step === slide.lines.length - 1 ? 'Finish ✓' : 'Next line →'}
              </button>
            )}
          </div>
        </>
      )}

      {finished && (
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center">
          <span className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-xl">
            ✓ Scene complete
          </span>
        </div>
      )}
    </div>
  );
}

// Real chat bubbles (same rounded-card + rotated-square-tail language as
// SceneDialogueSlide), one bubble per line, alternating side by whichever
// speaker appears first in the data -- not a hardcoded id, so it works for
// any two-person cast. Every bubble is visible at once (unlike
// SceneDialogueSlide's one-line-at-a-time reveal) with a tap-to-fill blank;
// the student taps a word tile then taps the blank it belongs in.
function ConversationFillSlide({ slide, fullBleed }: { slide: Extract<Slide, { type: 'conversation_fill' }>; fullBleed?: boolean }) {
  const { playVoice } = useAcademyAudio();

  const tiles = useMemo(
    () => [...slide.lines.map((l, i) => ({ id: `tile-${i}`, word: l.answer }))].sort(() => Math.random() - 0.5),
    [slide],
  );
  const sideFor = useMemo(() => {
    const order: string[] = [];
    slide.lines.forEach((l) => { if (!order.includes(l.speaker)) order.push(l.speaker); });
    return (speaker: string) => (order.indexOf(speaker) === 0 ? 'left' : 'right');
  }, [slide]);

  const [placedTile, setPlacedTile] = useState<(string | null)[]>(() => slide.lines.map(() => null));
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongLine, setWrongLine] = useState<number | null>(null);

  const usedTileIds = new Set(placedTile.filter(Boolean) as string[]);
  const allDone = placedTile.every(Boolean);
  const nameFor = (id: string) => slide.cast.find((c) => c.id === id)?.name ?? id;

  const tapTile = (tileId: string) => {
    if (usedTileIds.has(tileId)) return;
    setSelected((s) => (s === tileId ? null : tileId));
  };

  const tapBlank = (lineIndex: number) => {
    const already = placedTile[lineIndex];
    if (already) {
      setPlacedTile((p) => { const next = [...p]; next[lineIndex] = null; return next; });
      return;
    }
    if (!selected) return;
    const tile = tiles.find((t) => t.id === selected);
    if (!tile) return;
    const line = slide.lines[lineIndex];
    if (tile.word.toLowerCase() === line.answer.toLowerCase()) {
      setPlacedTile((p) => { const next = [...p]; next[lineIndex] = tile.id; return next; });
      setSelected(null);
      void playVoice(`${line.before}${tile.word}${line.after}`);
    } else {
      setWrongLine(lineIndex);
      window.setTimeout(() => setWrongLine(null), 500);
    }
  };

  return (
    <div className={fullBleed ? 'relative h-full w-full overflow-hidden' : 'relative w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl'}>
      {!fullBleed && (
        <>
          <img src={slide.bg_image_url} alt={slide.title || 'Conversation'} className="absolute inset-0 h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,10,40,0.35) 0%, rgba(15,10,40,0) 30%, rgba(15,10,40,0) 55%, rgba(76,29,149,0.4) 100%)' }} />
        </>
      )}

      {slide.title && (
        <span className="absolute left-5 top-5 z-20 w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-700 shadow">
          {slide.title}
        </span>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-2 pt-16">
          {slide.lines.map((line, i) => {
            const side = sideFor(line.speaker);
            const filled = placedTile[i] !== null;
            const tileWord = filled ? tiles.find((t) => t.id === placedTile[i])?.word : null;
            return (
              <div key={i} className={`flex ${side === 'left' ? 'justify-start' : 'justify-end'}`}>
                <div className="relative max-w-[82%]">
                  <div className="rounded-2xl bg-white px-4 py-2.5 shadow-xl">
                    <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500">{nameFor(line.speaker)}</div>
                    <div className="text-base font-semibold leading-snug text-slate-800">
                      {line.before}
                      <button
                        onClick={() => tapBlank(i)}
                        className={
                          filled
                            ? 'mx-1 inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 align-middle font-bold text-emerald-700 ring-1 ring-emerald-400'
                            : `mx-1 inline-block min-w-[2.75rem] rounded-md border-2 border-dashed px-1 align-middle ${wrongLine === i ? 'border-red-400 bg-red-50' : 'border-indigo-400 bg-indigo-50'}`
                        }
                      >
                        {filled ? tileWord : ' '}
                      </button>
                      {line.after}
                    </div>
                  </div>
                  <div className={`absolute -bottom-1.5 h-3.5 w-3.5 rotate-45 bg-white ${side === 'left' ? 'left-6' : 'right-6'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Word bank -- tap a tile, then tap the blank it belongs in. */}
        <div className="shrink-0 border-t border-white/15 bg-black/25 px-4 py-3 backdrop-blur-sm">
          {allDone ? (
            <div className="text-center text-sm font-bold text-emerald-300">🎉 Great job! You completed the story.</div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {tiles.filter((t) => !usedTileIds.has(t.id)).map((t) => (
                <button
                  key={t.id}
                  onClick={() => tapTile(t.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold shadow transition active:scale-95 ${
                    selected === t.id ? 'bg-white text-indigo-700 ring-2 ring-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {t.word}
                </button>
              ))}
            </div>
          )}
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

function renderSlideInner({ slide, t, fullBleed }: { slide: Slide; t: ThemeTokens; fullBleed?: boolean }) {
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
    case 'role_play': return <RolePlaySlide slide={slide} t={t} fullBleed={fullBleed} />;
    case 'scene_dialogue': return <SceneDialogueSlide slide={slide} fullBleed={fullBleed} />;
    case 'conversation_fill': return <ConversationFillSlide slide={slide} fullBleed={fullBleed} />;
    case 'number_chart': return <NumberChartSlide slide={slide} t={t} fullBleed={fullBleed} />;
    case 'number_quiz_game': return <NumberQuizGameSlide slide={slide} fullBleed={fullBleed} />;
    case 'letter_sound_game': return <LetterSoundGameSlide slide={slide} fullBleed={fullBleed} />;
    case 'story_page': return <StoryPageSlide slide={slide} fullBleed={fullBleed} />;
    case 'speaking_task': return <SpeakingTaskSlide slide={slide} t={t} />;
    case 'reflection': return <ReflectionSlide slide={slide} t={t} />;
    case 'cluster': return <ClusterSlide slide={slide} t={t} />;
    case 'canvas_game':
    case 'living_canvas':
      return <LivingCanvas slide={slide as any} hub="academy" fullBleed={fullBleed} />;
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

export function SlideRenderer({ slide, t, fullBleed }: { slide: Slide; t: ThemeTokens; fullBleed?: boolean }) {
  // Slides that render their own image inline (cover, vocab 50/50, etc.)
  // must NOT also get the floating SlideMediaHeader image — it produces a
  // duplicate "small image at top" + "image inside card" bug.
  const skipHeader = ['intro', 'vocab', 'canvas_game', 'living_canvas', 'scaffolded_media', 'vocab_solo', 'vocab_deck', 'vocab_image_match', 'story_engine_slot', 'escape_room_slot', 'detective_mystery_slot', 'hidden_object_slot'].includes(slide.type as string);
  return (
    <>
      {!skipHeader && <SlideMediaHeader slide={slide} />}
      {renderSlideInner({ slide, t, fullBleed })}
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
