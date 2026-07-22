import {
  MousePointerClick,
  GitCompareArrows,
  Pencil,
  Disc3,
  MessageCircle,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  PenLine,
  Brain,
  Volume2,
  Type,
  ListChecks,
  Theater,
  PuzzleIcon,
  type LucideIcon,
} from 'lucide-react';

export interface SlideTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for badge surface, scoped to neutral semantic tokens. */
  tone: string;
}

const FALLBACK: SlideTypeMeta = {
  label: 'Slide',
  icon: Layers,
  tone: 'bg-muted text-muted-foreground border-border',
};

export const SLIDE_TYPE_META: Record<string, SlideTypeMeta> = {
  // Gamified (new)
  drag_and_drop_sorting: { label: '🪣 Drag & Sort', icon: MousePointerClick, tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  matching_lines:        { label: '🔗 Matching Lines', icon: GitCompareArrows, tone: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  tracing_canvas:        { label: '✏️ Tracing', icon: Pencil, tone: 'bg-orange-50 text-orange-800 border-orange-200' },
  spinner_wheel:         { label: '🎯 Spinner Wheel', icon: Disc3, tone: 'bg-rose-50 text-rose-800 border-rose-200' },

  // Existing common types
  flashcard:           { label: '🃏 Flashcard', icon: Layers, tone: 'bg-sky-50 text-sky-800 border-sky-200' },
  vocab_list:          { label: '📚 Vocab List', icon: Layers, tone: 'bg-sky-50 text-sky-800 border-sky-200' },
  multiple_choice:     { label: '☑ Multiple Choice', icon: CheckSquare, tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  quiz_mcq:            { label: '☑ Quiz', icon: CheckSquare, tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  reading_quiz:        { label: '📖 Reading Quiz', icon: CheckSquare, tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  drag_and_match:      { label: '🔀 Drag & Match', icon: PuzzleIcon, tone: 'bg-violet-50 text-violet-800 border-violet-200' },
  drag_and_drop:       { label: '🎯 Drag & Drop', icon: MousePointerClick, tone: 'bg-violet-50 text-violet-800 border-violet-200' },
  fill_in_the_gaps:    { label: '✍ Fill the Gaps', icon: PenLine, tone: 'bg-teal-50 text-teal-800 border-teal-200' },
  fill_in_blanks:      { label: '✍ Fill the Blanks', icon: PenLine, tone: 'bg-teal-50 text-teal-800 border-teal-200' },
  drawing_canvas:      { label: '🎨 Drawing', icon: PenLine, tone: 'bg-pink-50 text-pink-800 border-pink-200' },
  mascot_speech:       { label: '🐾 Mascot', icon: MessageCircle, tone: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  hero_media:          { label: '🖼 Hero Media', icon: ImageIcon, tone: 'bg-slate-50 text-slate-800 border-slate-200' },
  grammar_explanation: { label: '🧠 Grammar', icon: Brain, tone: 'bg-purple-50 text-purple-800 border-purple-200' },
  sorting_game:        { label: '🪣 Sorting', icon: MousePointerClick, tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  match_halves:        { label: '🔗 Match Halves', icon: GitCompareArrows, tone: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  match_words:         { label: '🔀 Match Words', icon: PuzzleIcon, tone: 'bg-violet-50 text-violet-800 border-violet-200' },
  image_match:         { label: '🖼 Image Match', icon: ImageIcon, tone: 'bg-violet-50 text-violet-800 border-violet-200' },
  true_false:          { label: '✓✗ True/False', icon: ListChecks, tone: 'bg-lime-50 text-lime-800 border-lime-200' },
  sentence_builder:    { label: '🧩 Sentence Builder', icon: Type, tone: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200' },
  audio_listening:     { label: '🎧 Listening', icon: Volume2, tone: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  listening_comprehension: { label: '🎧 Listening Quiz', icon: Volume2, tone: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  role_play:           { label: '🎭 Role Play', icon: Theater, tone: 'bg-rose-50 text-rose-800 border-rose-200' },
  shadowing_drill:     { label: '🗣 Shadowing', icon: Volume2, tone: 'bg-blue-50 text-blue-800 border-blue-200' },
  real_world_task:     { label: '🌍 Real-World Task', icon: Theater, tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  branching_dialogue:  { label: '💬 Branching Dialogue', icon: MessageCircle, tone: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
};

export const getSlideTypeMeta = (type?: string | null): SlideTypeMeta =>
  (type && SLIDE_TYPE_META[type]) || FALLBACK;
