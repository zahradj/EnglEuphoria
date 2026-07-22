import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2, ChevronLeft, ChevronRight, Sun, Moon, Check, X, Briefcase } from 'lucide-react';
import { useSuccessAudio } from '@/hooks/useSuccessAudio';
import type { CanvasGameSlide, LivingCanvasSlide, ScaffoldedMediaSlide } from '@/components/creator-studio/shared/canvasSchema';
import { LivingCanvas } from '@/components/creator-studio/shared/LivingCanvas';
import { ScaffoldedPlayer } from '@/components/creator-studio/shared/ScaffoldedPlayer';
import { SoloVocabCard } from '@/components/creator-studio/shared/SoloVocabCard';
import { StoryEngineSlot } from '@/story-engine';
import { EscapeRoomSlot } from '@/escape-room';
import { DetectiveSlot } from '@/detective';
import { HiddenObjectSlot } from '@/hidden-object';
import FrontPageSlide from '@/components/lesson-player/editorial/FrontPageSlide';
import { RichText } from '@/components/lesson-player/RichText';
import { getMultipleItems, getFillBlankItems } from '@/utils/practiceItemNormalize';

/**
 * Success Hub Engine — adult-focused (18+, A2–C1), 60-minute, 7-block
 * Business English lesson system.
 *
 * Strict design constraints:
 *  - Premium, minimal, corporate (Notion / Stripe feel).
 *  - Light-mode-first. Mint/Emerald identity. No emojis, no childish bubbles.
 *  - Every slide must feel useful: Learn → Practice → Apply → Reflect.
 *  - Audio is RESTRAINED: dialogues, listening and pronunciation only.
 */

// ─── Schema ──────────────────────────────────────────────────────────────────
export type Block = 'warmup' | 'vocab' | 'context' | 'functional' | 'practice' | 'simulation' | 'output' | 'buffer';

export const BLOCKS: { id: Block; label: string }[] = [
  { id: 'warmup', label: 'Warm-up' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'context', label: 'Context' },
  { id: 'functional', label: 'Functional' },
  { id: 'practice', label: 'Practice' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'output', label: 'Output' },
  { id: 'buffer', label: 'Buffer & Review' },
];

export type ClusterActivity =
  | { type: 'mcq'; question: string; options: string[]; answer: string; explanation?: string }
  | { type: 'fill'; text: string; answer: string; explanation?: string }
  | { type: 'rewrite'; text: string; instruction: string; sample: string };

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
  | { type: 'opinion'; block: Block; prompt: string; options: string[] }
  | { type: 'vocab'; block: Block; word: string; definition: string; example?: string }
  | { type: 'matching'; block: Block; prompt: string; pairs: { left: string; right: string }[] }
  | { type: 'vocab_image_match'; block: Block; prompt?: string; pairs: { word: string; image_url: string }[]; objective?: { title: string; skill: string; how: string }; source?: string }
  | { type: 'reading_passage'; block: Block; title: string; passage: string }
  | { type: 'listening'; block: Block; prompt: string; transcript: string }
  | { type: 'multiple'; block: Block; question?: string; options?: string[]; answer?: string; items?: { question: string; options: string[]; answer: string }[] }
  | { type: 'tone_compare'; block: Block; title: string; direct: string; polite: string; note?: string }
  | { type: 'functional_pattern'; block: Block; title: string; rule: string; examples: string[] }
  | { type: 'rewrite'; block: Block; prompt: string; original: string; instruction: string; sample: string }
  | { type: 'fill_blank'; block: Block; prompt: string; before?: string; after?: string; answer?: string; items?: { before: string; answer: string; after: string }[] }
  | { type: 'cluster'; block: Block; title: string; content?: string; activities: ClusterActivity[] }
  | { type: 'scenario'; block: Block; title: string; situation: string; task: string; placeholder?: string }
  | { type: 'email_task'; block: Block; subject: string; brief: string; sample: string }
  | { type: 'role_play'; block: Block; title: string; roleA: string; roleB: string; lineA: string; lineB: string }
  | { type: 'speaking_task'; block: Block; prompt: string; starters?: string[] }
  | { type: 'reflection'; block: Block; prompt: string }
  | (CanvasGameSlide & { block: Block })
  | (LivingCanvasSlide & { block: Block })
  | (ScaffoldedMediaSlide & { block: Block })
  | { type: 'vocab_solo'; block: Block; word: string; definition?: string; image_url?: string; audio_url?: string }
  | { type: 'story_engine_slot' | 'escape_room_slot' | 'detective_mystery_slot' | 'hidden_object_slot'; block: Block; title?: string; objective?: string; hub?: string; cefr?: string; graph?: any; room?: any; case?: any; scene?: any }
  | { type: 'lesson_summary'; block: Block; title?: string; vocab_recap: string[]; grammar_recap?: string; takeaway?: string };

// ─── Lesson content ──────────────────────────────────────────────────────────
// Topic: "Making Requests at Work" — B1 level, 32 slides, 60 min.
export const SLIDES: Slide[] = [
  // BLOCK 1 — Warm-up
  { type: 'intro', block: 'warmup', title: 'Making Requests at Work', subtitle: 'Speak with clarity and confidence in professional settings.', level: 'B1', unit_number: 4, unit_title: 'Workplace Communication', lesson_number: 2 },
  { type: 'question', block: 'warmup', prompt: 'Do you use English at work? In which situations?', placeholder: 'I use English when…' },
  { type: 'opinion', block: 'warmup', prompt: 'When do you most need English in your job?', options: ['Emails', 'Meetings', 'Calls', 'Presentations'] },

  // BLOCK 2 — Vocabulary
  { type: 'vocab', block: 'vocab', word: 'deadline', definition: 'the latest time by which something must be completed.', example: 'The deadline for the proposal is Friday.' },
  { type: 'vocab', block: 'vocab', word: 'meeting', definition: 'a planned discussion with colleagues or clients.', example: "Let's schedule a meeting for next week." },
  { type: 'vocab', block: 'vocab', word: 'follow up', definition: 'to check or take further action on something later.', example: "I'll follow up with the client tomorrow." },
  { type: 'vocab', block: 'vocab', word: 'agenda', definition: 'a list of items to be discussed in a meeting.', example: 'Could you send me the agenda before the call?' },
  { type: 'vocab', block: 'vocab', word: 'attachment', definition: 'a file sent with an email.', example: 'Please find the report in the attachment.' },
  { type: 'matching', block: 'vocab', prompt: 'Match each term to its meaning.', pairs: [
    { left: 'deadline', right: 'final time limit' },
    { left: 'follow up', right: 'check again later' },
    { left: 'agenda', right: 'list of topics for a meeting' },
    { left: 'attachment', right: 'file added to an email' },
  ]},

  // BLOCK 3 — Context (listening / reading)
  { type: 'reading_passage', block: 'context', title: 'A short message',
    passage: 'Hi Sarah, I hope you are well. Could you send me the latest version of the report by end of day? I would like to review it before our meeting tomorrow morning. Thanks for your help.' },
  { type: 'listening', block: 'context', prompt: 'Listen to the voicemail and answer the question.',
    transcript: 'Hi, this is Daniel from the marketing team. I would like to schedule a quick meeting this week to discuss the new campaign. Please let me know what time works for you. Thank you.' },
  { type: 'multiple', block: 'context', question: 'What does Daniel want?', options: ['To cancel the campaign', 'To schedule a meeting', 'To send a report'], answer: 'To schedule a meeting' },

  // BLOCK 4 — Functional Language
  { type: 'functional_pattern', block: 'functional', title: 'Making requests',
    rule: 'Use modals to soften requests in professional contexts.',
    examples: ['Can you send me the file?', 'Could you send me the file?', 'Would you mind sending me the file?'] },
  { type: 'tone_compare', block: 'functional', title: 'Direct vs. Polite',
    direct: 'Send me the report.',
    polite: 'Could you please send me the report when you have a moment?',
    note: 'In professional emails, polite forms protect relationships and reduce friction.' },
  { type: 'multiple', block: 'functional', question: 'Which request sounds most professional?',
    options: ['Send me the file now.', 'Could you please send me the file?', 'I want the file.'],
    answer: 'Could you please send me the file?' },

  // BLOCK 5 — Practice (cluster + targeted)
  { type: 'cluster', block: 'practice', title: 'Polite Requests — Quick Drill',
    content: 'Apply the patterns to short, real workplace situations.',
    activities: [
      { type: 'mcq', question: '___ you send me the report by Friday?', options: ['Can', 'Could', 'Do'], answer: 'Could', explanation: '“Could” is more polite than “Can” for written requests.' },
      { type: 'fill', text: 'Could you please ___ (send) me the agenda?', answer: 'send' },
      { type: 'rewrite', text: 'Send me the file.', instruction: 'Make it polite.', sample: 'Could you please send me the file?' },
    ],
  },
  { type: 'fill_blank', block: 'practice', prompt: 'Complete the polite request.', before: 'Would you mind', after: 'me the latest figures?', answer: 'sending' },
  { type: 'rewrite', block: 'practice', prompt: 'Rewrite to sound more professional.',
    original: 'I need the report today.',
    instruction: 'Use a polite modal and add context.',
    sample: 'Could you please share the report by end of day? I need it for tomorrow’s review.' },

  // BLOCK 6 — Simulation
  { type: 'scenario', block: 'simulation', title: 'Scenario · Asking a colleague',
    situation: 'You need the Q3 sales report from a colleague before tomorrow’s meeting.',
    task: 'Write a short, polite request (2–3 sentences).',
    placeholder: 'Hi [name], could you please…' },
  { type: 'email_task', block: 'simulation',
    subject: 'Quick request — agenda for Thursday',
    brief: 'Write a short email to your manager asking for the agenda before Thursday’s meeting. Keep it polite and concise.',
    sample: 'Hi Anna,\n\nI hope you are well. Could you please share the agenda for Thursday’s meeting when you have a moment? It would help me prepare in advance.\n\nThanks very much,\n[Your name]' },
  { type: 'role_play', block: 'simulation', title: 'Role play · Manager & employee',
    roleA: 'Manager',
    roleB: 'Employee',
    lineA: 'Could you give me a quick update on the project?',
    lineB: 'Of course. We are on track. I will follow up with the full report by Friday.' },
  { type: 'scenario', block: 'simulation', title: 'Scenario · Rescheduling a meeting',
    situation: 'A client asks for a meeting tomorrow, but you are not available.',
    task: 'Write a polite reply proposing a new time.',
    placeholder: 'Dear [client], thank you for…' },

  // BLOCK 7 — Output
  { type: 'speaking_task', block: 'output', prompt: 'Ask a colleague for help with a task you are working on. Speak for 30 seconds.',
    starters: ['Hi, could you…', 'When you have a moment…', 'Would you mind…'] },
  { type: 'speaking_task', block: 'output', prompt: 'Free speaking — describe a recent situation at work where you needed to ask for something.' },
  { type: 'reflection', block: 'output', prompt: 'How confident do you feel using these requests at work now?' },
];

// ─── Theme ───────────────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark';

export interface ThemeTokens {
  bg: string;
  card: string;
  text: string;
  muted: string;
  chip: string;
  inputBg: string;
  btnGhost: string;
  border: string;
  surface: string;
}

export const themeMap: Record<Theme, ThemeTokens> = {
  light: {
    bg: 'bg-[#fafbfa]',
    card: 'bg-white border-emerald-100',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    chip: 'bg-emerald-50 text-emerald-700',
    inputBg: 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
    btnGhost: 'border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700',
    border: 'border-slate-200',
    surface: 'bg-white',
  },
  dark: {
    bg: 'bg-[#0b1210]',
    card: 'bg-slate-900 border-emerald-900/40',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    chip: 'bg-emerald-900/30 text-emerald-300',
    inputBg: 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500',
    btnGhost: 'border border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-300',
    border: 'border-slate-800',
    surface: 'bg-slate-900',
  },
};

// ─── Audio button ────────────────────────────────────────────────────────────
function ListenButton({ text, label = 'Listen', variant = 'pill' }: { text: string; label?: string; variant?: 'pill' | 'block' }) {
  const { playVoice, isPlaying, isLoading } = useSuccessAudio();
  const base = 'inline-flex items-center gap-2 font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const sizes = variant === 'block'
    ? 'px-5 py-3 text-base bg-emerald-600 hover:bg-emerald-500 text-white'
    : 'px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white';
  return (
    <button onClick={() => playVoice(text)} className={`${base} ${sizes}`} aria-label={label}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />}
      <span>{isPlaying ? 'Playing…' : label}</span>
    </button>
  );
}

// ─── Slide components ───────────────────────────────────────────────────────
function Intro({ slide, t }: { slide: Extract<Slide, { type: 'intro' }>; t: ThemeTokens }) {
  const isLessonCover = slide.block === 'warmup';
  if (isLessonCover) {
    return (
      <FrontPageSlide
        hub="success"
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
    <div className="space-y-5">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>{slide.block}</div>
      <h1 className={`text-3xl md:text-5xl font-semibold tracking-tight ${t.text}`}>{slide.title}</h1>
      {slide.subtitle && <p className={`text-lg ${t.muted} max-w-2xl leading-relaxed`}>{slide.subtitle}</p>}
    </div>
  );
}

function QuestionSlide({ slide, t }: { slide: Extract<Slide, { type: 'question' }>; t: ThemeTokens }) {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={slide.placeholder ?? 'Type your answer…'}
        className={`w-full min-h-[120px] rounded-md border px-4 py-3 text-base outline-none focus:border-emerald-500 ${t.inputBg}`}
      />
    </div>
  );
}

function OpinionSlide({ slide, t }: { slide: Extract<Slide, { type: 'opinion' }>; t: ThemeTokens }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="flex flex-wrap gap-3">
        {slide.options.map((o) => (
          <button key={o} onClick={() => setPicked(o)}
            className={`px-5 py-2.5 rounded-md text-sm font-medium transition ${
              picked === o ? 'bg-emerald-600 text-white border border-emerald-600' : t.btnGhost
            }`}>
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
      <div className="w-full h-[40vh] md:h-[60vh] relative rounded-xl overflow-hidden bg-emerald-50/50 border border-emerald-100 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={slide.word} className="object-cover w-full h-full" />
        ) : (
          <div className="text-emerald-300 text-6xl">🖼️</div>
        )}
      </div>
      <div className="space-y-5 w-full">
        <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Vocabulary</div>
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className={`text-4xl md:text-5xl font-semibold ${t.text}`}>{slide.word}</h2>
          <ListenButton text={slide.word} label="Listen" />
        </div>
        <p className={`text-xl ${t.text}`}>
          <RichText text={slide.definition} highlightClassName="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md shadow-sm" />
        </p>
        {slide.example && (
          <p className={`text-base italic border-l-2 border-emerald-500 pl-4 ${t.muted}`}>
            “<RichText text={slide.example} highlightClassName="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md not-italic shadow-sm" />”
          </p>
        )}
      </div>
    </div>
  );
}

function MatchingSlide({ slide, t }: { slide: Extract<Slide, { type: 'matching' }>; t: ThemeTokens }) {
  const rights = useMemo(() => [...slide.pairs].sort(() => Math.random() - 0.5), [slide.pairs]);
  const [selL, setSelL] = useState<string | null>(null);
  const [solved, setSolved] = useState<Record<string, true>>({});
  const [wrong, setWrong] = useState<string | null>(null);

  const tryPair = (left: string, right: string) => {
    if (slide.pairs.some((p) => p.left === left && p.right === right)) {
      setSolved((s) => ({ ...s, [left]: true }));
    } else {
      setWrong(right);
      setTimeout(() => setWrong(null), 400);
    }
    setSelL(null);
  };

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {slide.pairs.map((p) => (
            <button key={p.left} disabled={!!solved[p.left]} onClick={() => setSelL(p.left)}
              className={`w-full text-left px-4 py-3 rounded-md border transition ${
                solved[p.left] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                selL === p.left ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700' :
                `${t.border} hover:border-emerald-400 ${t.text}`
              }`}>
              {p.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rights.map((p) => {
            const used = !!solved[p.left];
            const isWrong = wrong === p.right;
            return (
              <button key={p.right} disabled={used || !selL} onClick={() => selL && tryPair(selL, p.right)}
                className={`w-full text-left px-4 py-3 rounded-md border transition ${
                  used ? 'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-70' :
                  isWrong ? 'border-red-400 bg-red-50 text-red-700' :
                  `${t.border} hover:border-emerald-400 ${t.text}`
                }`}>
                {p.right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReadingSlide({ slide, t }: { slide: Extract<Slide, { type: 'reading_passage' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-5 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Reading</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <ListenButton text={slide.passage} label="Listen to the passage" variant="block" />
      <p className={`text-lg leading-relaxed ${t.text}`}>
        <RichText text={slide.passage} highlightClassName="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md shadow-sm" />
      </p>
    </div>
  );
}

function ListeningSlide({ slide, t }: { slide: Extract<Slide, { type: 'listening' }>; t: ThemeTokens }) {
  const [showTranscript, setShowTranscript] = useState(false);
  return (
    <div className="space-y-5 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Listening</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <ListenButton text={slide.transcript} label="Play audio" variant="block" />
      <button onClick={() => setShowTranscript((s) => !s)} className={`text-sm underline ${t.muted} hover:text-emerald-600`}>
        {showTranscript ? 'Hide transcript' : 'Show transcript'}
      </button>
      {showTranscript && <p className={`italic border-l-2 border-emerald-500 pl-4 ${t.muted}`}>{slide.transcript}</p>}
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
          className={`px-2 py-1 rounded border ${t.border} disabled:opacity-30`}>← Prev</button>
        <button disabled={index >= total - 1} onClick={() => setIndex(Math.min(total - 1, index + 1))}
          className={`px-2 py-1 rounded border ${t.border} disabled:opacity-30`}>Next →</button>
      </div>
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
          let cls = `${t.border} hover:border-emerald-400 ${t.text}`;
          if (picked && active && isAnswer) cls = 'border-emerald-500 bg-emerald-50 text-emerald-700';
          else if (picked && active && !isAnswer) cls = 'border-red-400 bg-red-50 text-red-700';
          else if (picked && isAnswer) cls = 'border-emerald-500 text-emerald-700';
          return (
            <button key={opt} onClick={() => picked === null && setPicks((p) => ({ ...p, [index]: opt }))}
              className={`w-full text-left px-4 py-3 rounded-md border transition ${cls}`}>
              {opt}
            </button>
          );
        })}
      </div>
      <ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />
    </div>
  );
}

function ToneCompareSlide({ slide, t }: { slide: Extract<Slide, { type: 'tone_compare' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Functional language</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`rounded-md border ${t.border} p-5 space-y-2`}>
          <div className="text-xs uppercase tracking-widest text-red-500">Direct</div>
          <p className={`text-lg ${t.text}`}>{slide.direct}</p>
        </div>
        <div className="rounded-md border border-emerald-500 bg-emerald-50/40 p-5 space-y-2">
          <div className="text-xs uppercase tracking-widest text-emerald-700">Polite</div>
          <p className="text-lg text-slate-900">{slide.polite}</p>
        </div>
      </div>
      {slide.note && <p className={`text-sm ${t.muted}`}>{slide.note}</p>}
    </div>
  );
}

function FunctionalPatternSlide({ slide, t }: { slide: Extract<Slide, { type: 'functional_pattern' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Pattern</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <p className={`text-base ${t.muted}`}>{slide.rule}</p>
      <ul className="space-y-2">
        {slide.examples.map((ex, i) => (
          <li key={i} className={`px-4 py-3 rounded-md border ${t.border} ${t.text}`}>{ex}</li>
        ))}
      </ul>
    </div>
  );
}

function RewriteSlide({ slide, t }: { slide: Extract<Slide, { type: 'rewrite' }>; t: ThemeTokens }) {
  const [val, setVal] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <p className={`text-sm uppercase tracking-widest ${t.muted}`}>{slide.instruction}</p>
      <p className={`text-lg italic border-l-2 border-slate-300 pl-4 ${t.muted}`}>{slide.original}</p>
      <textarea value={val} onChange={(e) => setVal(e.target.value)}
        placeholder="Write your improved version…"
        className={`w-full min-h-[100px] rounded-md border px-4 py-3 outline-none focus:border-emerald-500 ${t.inputBg}`} />
      <button onClick={() => setShow(true)} className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
        Show sample answer
      </button>
      {show && (
        <div className={`rounded-md border border-emerald-500 bg-emerald-50/50 p-4`}>
          <div className="text-xs uppercase tracking-widest text-emerald-700 mb-1">Sample</div>
          <p className="text-slate-900">{slide.sample}</p>
        </div>
      )}
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
  const norm = (s: string) => s.trim().toLowerCase();
  const correct = submitted && norm(val) === norm(item.answer);
  const score = items.reduce((s, it, i) => s + ((subs[i] && norm(vals[i] || '') === norm(it.answer)) ? 1 : 0), 0);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className={`text-2xl ${t.text} flex items-center gap-3 flex-wrap`}>
        <span>{item.before}</span>
        <input value={val}
          onChange={(e) => { setVals((p) => ({ ...p, [index]: e.target.value })); setSubs((p) => ({ ...p, [index]: false })); }}
          onKeyDown={(e) => e.key === 'Enter' && setSubs((p) => ({ ...p, [index]: true }))}
          className={`w-40 px-3 py-1.5 rounded-md border text-center outline-none focus:border-emerald-500 ${t.inputBg} ${
            submitted ? (correct ? 'border-emerald-500' : 'border-red-400') : ''
          }`} />
        <span>{item.after}</span>
      </div>
      <button onClick={() => setSubs((p) => ({ ...p, [index]: true }))} className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
        Check
      </button>
      {submitted && (
        <p className={`text-sm flex items-center gap-2 ${correct ? 'text-emerald-600' : 'text-red-500'}`}>
          {correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {correct ? 'Correct.' : `Expected: ${item.answer}`}
        </p>
      )}
      <ItemPager total={items.length} index={index} setIndex={setIndex} score={score} t={t} />
    </div>
  );
}

// Cluster
function ClusterMCQ({ a, t }: { a: Extract<ClusterActivity, { type: 'mcq' }>; t: ThemeTokens }) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === a.answer;
  return (
    <div className={`rounded-md border ${t.border} ${t.surface} p-4 space-y-3`}>
      <p className={`text-base font-medium ${t.text}`}>{a.question}</p>
      <div className="flex flex-wrap gap-2">
        {a.options.map((opt) => {
          const active = picked === opt;
          let cls = `px-3 py-1.5 rounded-md text-sm border transition ${t.btnGhost}`;
          if (picked && active && correct) cls = 'px-3 py-1.5 rounded-md text-sm border border-emerald-500 bg-emerald-50 text-emerald-700';
          else if (picked && active && !correct) cls = 'px-3 py-1.5 rounded-md text-sm border border-red-400 bg-red-50 text-red-700';
          else if (picked && opt === a.answer) cls = 'px-3 py-1.5 rounded-md text-sm border border-emerald-500 text-emerald-700';
          return <button key={opt} onClick={() => picked === null && setPicked(opt)} className={cls}>{opt}</button>;
        })}
      </div>
      {picked !== null && (
        <p className={`text-sm ${correct ? 'text-emerald-600' : 'text-red-500'}`}>
          {correct ? 'Correct.' : (a.explanation ?? 'Try again.')}
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
    <div className={`rounded-md border ${t.border} ${t.surface} p-4 space-y-3`}>
      <p className={`text-base font-medium ${t.text}`}>{a.text}</p>
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Type your answer…"
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500 ${t.inputBg}`} />
      {submitted && (
        <p className={`text-sm ${correct ? 'text-emerald-600' : 'text-red-500'}`}>
          {correct ? 'Correct.' : (a.explanation ?? `Answer: ${a.answer}`)}
        </p>
      )}
    </div>
  );
}

function ClusterRewrite({ a, t }: { a: Extract<ClusterActivity, { type: 'rewrite' }>; t: ThemeTokens }) {
  const [val, setVal] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className={`rounded-md border ${t.border} ${t.surface} p-4 space-y-3`}>
      <p className={`text-base font-medium ${t.text}`}>{a.instruction}</p>
      <p className={`text-sm italic ${t.muted}`}>“{a.text}”</p>
      <textarea value={val} onChange={(e) => setVal(e.target.value)} placeholder="Your rewrite…"
        className={`w-full min-h-[60px] rounded-md border px-3 py-2 text-sm outline-none focus:border-emerald-500 ${t.inputBg}`} />
      <button onClick={() => setShow(true)} className="text-xs underline text-emerald-700">Show sample</button>
      {show && <p className={`text-sm rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-slate-900`}>{a.sample}</p>}
    </div>
  );
}

function ClusterSlide({ slide, t }: { slide: Extract<Slide, { type: 'cluster' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-5 w-full max-w-3xl">
      <div className="space-y-2">
        <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>{slide.block}</div>
        <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
        {slide.content && <p className={`text-base ${t.muted}`}>{slide.content}</p>}
      </div>
      <div className="grid gap-3">
        {slide.activities.map((a, i) => {
          switch (a.type) {
            case 'mcq': return <ClusterMCQ key={i} a={a} t={t} />;
            case 'fill': return <ClusterFill key={i} a={a} t={t} />;
            case 'rewrite': return <ClusterRewrite key={i} a={a} t={t} />;
          }
        })}
      </div>
    </div>
  );
}

function ScenarioSlide({ slide, t }: { slide: Extract<Slide, { type: 'scenario' }>; t: ThemeTokens }) {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-5 max-w-2xl w-full">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.2em] ${t.muted}`}>
        <Briefcase className="w-3.5 h-3.5" /> Scenario
      </div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <div className={`rounded-md border ${t.border} p-4 ${t.surface}`}>
        <div className={`text-xs uppercase tracking-widest ${t.muted} mb-1`}>Situation</div>
        <p className={t.text}>{slide.situation}</p>
      </div>
      <div className="space-y-2">
        <div className={`text-xs uppercase tracking-widest ${t.muted}`}>Your task</div>
        <p className={t.text}>{slide.task}</p>
      </div>
      <textarea value={val} onChange={(e) => setVal(e.target.value)}
        placeholder={slide.placeholder ?? 'Write your response…'}
        className={`w-full min-h-[140px] rounded-md border px-4 py-3 outline-none focus:border-emerald-500 ${t.inputBg}`} />
    </div>
  );
}

function EmailTaskSlide({ slide, t }: { slide: Extract<Slide, { type: 'email_task' }>; t: ThemeTokens }) {
  const [val, setVal] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-4 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Email task</div>
      <div className={`rounded-md border ${t.border} ${t.surface}`}>
        <div className={`flex items-center justify-between px-4 py-2 border-b ${t.border} ${t.muted} text-xs`}>
          <span>Subject</span><span>Compose</span>
        </div>
        <div className={`px-4 py-3 border-b ${t.border} font-medium ${t.text}`}>{slide.subject}</div>
        <div className={`px-4 py-3 ${t.muted} text-sm`}>{slide.brief}</div>
        <textarea value={val} onChange={(e) => setVal(e.target.value)}
          placeholder="Hi [name], …"
          className={`w-full min-h-[180px] px-4 py-3 outline-none ${t.inputBg} border-0`} />
      </div>
      <button onClick={() => setShow(true)} className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
        Show sample answer
      </button>
      {show && (
        <pre className={`whitespace-pre-wrap rounded-md border border-emerald-500 bg-emerald-50/50 p-4 text-sm text-slate-900 font-sans`}>
{slide.sample}
        </pre>
      )}
    </div>
  );
}

function RolePlaySlide({ slide, t }: { slide: Extract<Slide, { type: 'role_play' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Role play</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.title}</h2>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-600 text-white">{slide.roleA}</span>
          <p className={`text-lg ${t.text}`}>{slide.lineA}</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-white">{slide.roleB}</span>
          <p className={`text-lg ${t.text}`}>{slide.lineB}</p>
        </div>
      </div>
    </div>
  );
}

function SpeakingTaskSlide({ slide, t }: { slide: Extract<Slide, { type: 'speaking_task' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Speaking</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      {slide.starters && slide.starters.length > 0 && (
        <div className={`rounded-md border ${t.border} p-4 space-y-2 ${t.surface}`}>
          <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Sentence starters</div>
          {slide.starters.map((s) => (
            <div key={s} className={`text-base ${t.text}`}>· {s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReflectionSlide({ slide, t }: { slide: Extract<Slide, { type: 'reflection' }>; t: ThemeTokens }) {
  const opts = ['Not yet', 'Somewhat', 'Confident'];
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>Reflection</div>
      <h2 className={`text-2xl md:text-3xl font-semibold ${t.text}`}>{slide.prompt}</h2>
      <div className="flex flex-wrap gap-3">
        {opts.map((o) => (
          <button key={o} onClick={() => setPicked(o)}
            className={`px-5 py-2.5 rounded-md text-sm font-medium transition ${
              picked === o ? 'bg-emerald-600 text-white' : t.btnGhost
            }`}>{o}</button>
        ))}
      </div>
      {picked && <p className={`text-sm ${t.muted}`}>Lesson complete. Excellent work.</p>}
    </div>
  );
}

function LessonSummarySlide({ slide, t }: { slide: Extract<Slide, { type: 'lesson_summary' }>; t: ThemeTokens }) {
  return (
    <div className="space-y-6 max-w-2xl w-full">
      <div className={`text-xs uppercase tracking-[0.2em] ${t.muted}`}>📋 Lesson Recap</div>
      <h2 className={`text-3xl md:text-4xl font-serif font-semibold ${t.text}`}>{slide.title || 'Review Sheet'}</h2>
      {slide.vocab_recap?.length > 0 && (
        <div className={`rounded-md border ${t.border} ${t.surface} p-4 space-y-2`}>
          <div className="text-xs uppercase tracking-widest text-emerald-700">Vocabulary mastered</div>
          <div className="flex flex-wrap gap-2">
            {slide.vocab_recap.slice(0, 5).map((w) => (
              <span key={w} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-sm font-medium border border-emerald-200">{w}</span>
            ))}
          </div>
        </div>
      )}
      {slide.grammar_recap && (
        <div className={`rounded-md border ${t.border} ${t.surface} p-4 space-y-1`}>
          <div className="text-xs uppercase tracking-widest text-emerald-700">Grammar rule</div>
          <p className={`text-base ${t.text}`}>{slide.grammar_recap}</p>
        </div>
      )}
      {slide.takeaway && (
        <div className={`rounded-md border border-emerald-500 bg-emerald-50/50 p-4 space-y-1`}>
          <div className="text-xs uppercase tracking-widest text-emerald-700">Your takeaway</div>
          <p className="text-slate-900">{slide.takeaway}</p>
        </div>
      )}
      <p className={`text-xs ${t.muted}`}>📸 Tip: screenshot this for review later.</p>
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
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-emerald-200">
          <iframe src={video} className="w-full h-full" allowFullScreen title="Slide video" />
        </div>
      ) : (
        <img src={url} alt="" className="max-h-64 w-auto rounded-lg object-contain border border-emerald-200" />
      )}
    </div>
  );
}

function renderSlideInner({ slide, t }: { slide: Slide; t: ThemeTokens }) {
  switch (slide.type) {
    case 'intro': return <Intro slide={slide} t={t} />;
    case 'question': return <QuestionSlide slide={slide} t={t} />;
    case 'opinion': return <OpinionSlide slide={slide} t={t} />;
    case 'vocab': return <VocabSlide slide={slide} t={t} />;
    case 'matching': return <MatchingSlide slide={slide} t={t} />;
    case 'vocab_image_match': return <VocabImageMatchSlide slide={slide as any} t={t} />;
    case 'reading_passage': return <ReadingSlide slide={slide} t={t} />;
    case 'listening': return <ListeningSlide slide={slide} t={t} />;
    case 'multiple': return <MultipleSlide slide={slide} t={t} />;
    case 'tone_compare': return <ToneCompareSlide slide={slide} t={t} />;
    case 'functional_pattern': return <FunctionalPatternSlide slide={slide} t={t} />;
    case 'rewrite': return <RewriteSlide slide={slide} t={t} />;
    case 'fill_blank': return <FillBlankSlide slide={slide} t={t} />;
    case 'cluster': return <ClusterSlide slide={slide} t={t} />;
    case 'scenario': return <ScenarioSlide slide={slide} t={t} />;
    case 'email_task': return <EmailTaskSlide slide={slide} t={t} />;
    case 'role_play': return <RolePlaySlide slide={slide} t={t} />;
    case 'speaking_task': return <SpeakingTaskSlide slide={slide} t={t} />;
    case 'reflection': return <ReflectionSlide slide={slide} t={t} />;
    case 'canvas_game':
    case 'living_canvas':
      return <LivingCanvas slide={slide as any} hub="success" />;
    case 'scaffolded_media':
      return <ScaffoldedPlayer slide={slide as any} hub="success" />;
    case 'vocab_solo': {
      const s: any = slide;
      return <SoloVocabCard hub="success" card={{ word: s.word, definition: s.definition, image_url: s.image_url, audio_url: s.audio_url }} />;
    }
    case 'story_engine_slot':
    case 'escape_room_slot':
    case 'detective_mystery_slot':
    case 'hidden_object_slot': return <LanguageEngineSlide slide={slide as any} t={t} />;
    case 'lesson_summary': return <LessonSummarySlide slide={slide} t={t} />;
  }
}

function VocabImageMatchSlide({ slide, t }: { slide: any; t: ThemeTokens }) {
  const pairs = Array.isArray(slide.pairs) ? slide.pairs : [];
  return (
    <div className="w-full max-w-4xl space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Vocabulary objective</div>
        <h2 className={`text-2xl font-semibold ${t.text}`}>{slide.objective?.title || 'Match terms to visuals'}</h2>
        <p className={`mt-2 text-sm ${t.muted}`}>{slide.prompt || 'Match each term to the corresponding visual.'}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {pairs.map((p: any, i: number) => (
          <div key={`${p.word}-${i}`} className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
            <div className="grid aspect-video place-items-center overflow-hidden rounded-xl bg-emerald-50">
              {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-emerald-700">Image pending</span>}
            </div>
            <div className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white">{p.word}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageEngineSlide({ slide, t }: { slide: any; t: ThemeTokens }) {
  const hub = slide.hub || 'success';
  const cefr = slide.cefr || 'B1';
  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Interactive language mission</div>
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
  const skipHeader = ['intro', 'vocab', 'canvas_game', 'living_canvas', 'scaffolded_media', 'vocab_solo', 'story_engine_slot', 'escape_room_slot', 'detective_mystery_slot', 'hidden_object_slot'].includes(slide.type as string);
  return (
    <>
      {!skipHeader && <SlideMediaHeader slide={slide} />}
      {renderSlideInner({ slide, t })}
    </>
  );
}

// ─── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ currentBlock, slideIndex, t }: { currentBlock: Block; slideIndex: number; t: ThemeTokens }) {
  const blockSlides = SLIDES.reduce<Record<Block, number[]>>((acc, s, i) => {
    acc[s.block] = acc[s.block] || [];
    acc[s.block].push(i);
    return acc;
  }, { warmup: [], vocab: [], context: [], functional: [], practice: [], simulation: [], output: [], buffer: [] });

  const currentBlockIdx = BLOCKS.findIndex((b) => b.id === currentBlock);
  const slidesInBlock = blockSlides[currentBlock] ?? [];
  const localPos = slidesInBlock.indexOf(slideIndex);
  const localPct = slidesInBlock.length > 0 ? ((localPos + 1) / slidesInBlock.length) * 100 : 0;

  return (
    <div className="w-full grid grid-cols-8 gap-1">
      {BLOCKS.map((b, i) => {
        const isCurrent = b.id === currentBlock;
        const isDone = i < currentBlockIdx;
        return (
          <div key={b.id} className="space-y-1.5">
            <div className={`h-1 rounded-full overflow-hidden ${isDone ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {isCurrent && (
                <motion.div className="h-full bg-emerald-500"
                  initial={{ width: 0 }} animate={{ width: `${localPct}%` }} transition={{ duration: 0.3 }} />
              )}
            </div>
            <div className={`text-[10px] md:text-xs uppercase tracking-wider text-center ${
              isCurrent ? 'text-emerald-700 font-semibold' : isDone ? t.muted : t.muted + ' opacity-60'
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
export default function SuccessDemo() {
  const [theme, setTheme] = useState<Theme>('light');
  const [i, setI] = useState(0);
  const t = themeMap[theme];
  const slide = SLIDES[i];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setI((n) => Math.min(SLIDES.length - 1, n + 1));
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const blockLabel = BLOCKS.find((b) => b.id === slide.block)?.label ?? '';

  return (
    <div className={`min-h-dvh ${t.bg} ${t.text} font-sans flex flex-col`}>
      {/* Header */}
      <header className={`relative z-10 border-b ${t.border} ${theme === 'light' ? 'bg-white/80' : 'bg-slate-950/60'} backdrop-blur-sm`}>
        <div className="max-w-6xl mx-auto px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">S</div>
              <div>
                <div className="text-sm font-semibold">Success Hub</div>
                <div className={`text-xs ${t.muted}`}>60 min · B1 · Making Requests at Work</div>
              </div>
            </div>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className={`p-2 rounded-md ${t.btnGhost}`} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
          <ProgressBar currentBlock={slide.block} slideIndex={i} t={t} />
        </div>
      </header>

      {/* Slide */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div key={i}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-4xl rounded-xl border ${t.card} px-8 py-12 md:px-12 md:py-16 min-h-[420px] flex items-center justify-center shadow-[0_10px_40px_rgba(5,150,105,0.06)]`}>
            <SlideRenderer slide={slide} t={t} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer nav */}
      <footer className={`relative z-10 border-t ${t.border} ${theme === 'light' ? 'bg-white/80' : 'bg-slate-950/60'} backdrop-blur-sm`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-30 ${t.btnGhost}`}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className={`text-sm ${t.muted}`}>
            <span className="font-semibold text-emerald-700">{blockLabel}</span>
            <span className="mx-2">·</span>
            <span>{i + 1} / {SLIDES.length}</span>
          </div>
          <button onClick={() => setI((n) => Math.min(SLIDES.length - 1, n + 1))} disabled={i === SLIDES.length - 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
