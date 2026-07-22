import {
  BookOpenText, Gamepad2, Sparkles, Film, CheckSquare, Flag, Square,
  Headphones, MessageSquare, Image as ImageIcon, Type, Move, ListChecks,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  intro: Flag,
  lesson_summary: Flag,
  cool_off: Flag,
  storybook: BookOpenText,
  reading_passage: BookOpenText,
  canvas_game: Gamepad2,
  living_canvas: Gamepad2,
  scaffolded_media: Film,
  listening: Headphones,
  vocab: Sparkles,
  vocab_solo: Sparkles,
  multiple: CheckSquare,
  truefalse: CheckSquare,
  fill: CheckSquare,
  fill_blank: CheckSquare,
  matching: ListChecks,
  match: ListChecks,
  drag: Move,
  question: MessageSquare,
  reflection: MessageSquare,
  opinion: MessageSquare,
  speaking_task: MessageSquare,
  role_play: MessageSquare,
  image: ImageIcon,
  text: Type,
  phonics_focus: Megaphone,
};

export function slideIcon(type: string): LucideIcon {
  return MAP[type] || Square;
}
