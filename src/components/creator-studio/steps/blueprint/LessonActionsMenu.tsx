// LessonActionsMenu — 7-action dropdown rendered on every lesson row inside
// the Curriculum Blueprint. Each action loads the same LessonBlueprint and
// routes it to the Unified Generator with a stage filter (or opens a modal).

import React from 'react';
import { MoreHorizontal, Sparkles, FolderOpen, Eye, BookOpen, Gamepad2, ScrollText, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { LessonStage } from '@/services/contentCreator/unifiedLessonGenerator';

export type LessonAction =
  | 'generate'
  | 'open_generator'
  | 'view_blueprint'
  | 'generate_homework'
  | 'generate_games'
  | 'generate_story'
  | 'generate_review';

interface Props {
  onAction: (action: LessonAction, stage: LessonStage | null) => void;
}

const STAGE_FOR: Record<LessonAction, LessonStage | null> = {
  generate: 'all',
  open_generator: null,
  view_blueprint: null,
  generate_homework: 'homework',
  generate_games: 'games',
  generate_story: 'story',
  generate_review: 'review',
};

export const LessonActionsMenu: React.FC<Props> = ({ onAction }) => {
  const fire = (a: LessonAction) => onAction(a, STAGE_FOR[a]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          aria-label="Lesson actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-500">
          Curriculum-driven actions
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => fire('generate')}>
          <Sparkles className="mr-2 h-3.5 w-3.5" /> Generate Lesson
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fire('open_generator')}>
          <FolderOpen className="mr-2 h-3.5 w-3.5" /> Open Generator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fire('view_blueprint')}>
          <Eye className="mr-2 h-3.5 w-3.5" /> View Blueprint
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => fire('generate_homework')}>
          <BookOpen className="mr-2 h-3.5 w-3.5" /> Generate Homework
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fire('generate_games')}>
          <Gamepad2 className="mr-2 h-3.5 w-3.5" /> Generate Games
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fire('generate_story')}>
          <ScrollText className="mr-2 h-3.5 w-3.5" /> Generate Story
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fire('generate_review')}>
          <Repeat className="mr-2 h-3.5 w-3.5" /> Generate Review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
