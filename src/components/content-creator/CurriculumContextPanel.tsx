// Curriculum Context Panel — left rail rendered inside the Unified Generator
// when invoked from the Curriculum Blueprint. Surfaces lesson-state summary,
// curriculum alignment, prerequisites, review targets, and adaptive config.

import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Target, Layers, Sparkles, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LessonBlueprint } from '@/services/contentCreator/lessonBlueprint';

interface Props {
  blueprint: LessonBlueprint;
}

export const CurriculumContextPanel: React.FC<Props> = ({ blueprint }) => {
  return (
    <Card className="border-sky-200 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-sky-600" />
          Curriculum context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Curriculum</div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {blueprint.curriculum_title}
          </div>
          <div className="text-slate-500">
            {blueprint.hub} · {blueprint.cefr_level} · Unit {blueprint.unit_number} · Lesson{' '}
            {blueprint.lesson_number}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {blueprint.previous_lesson_title && (
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <ChevronLeft className="h-3 w-3" /> {blueprint.previous_lesson_title}
            </span>
          )}
          <span className="mx-1 text-slate-400">·</span>
          {blueprint.next_lesson_title && (
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
              {blueprint.next_lesson_title} <ChevronRight className="h-3 w-3" />
            </span>
          )}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <Target className="h-3 w-3" /> Communication goal
          </div>
          <div className="text-slate-800 dark:text-slate-200">{blueprint.communication_goal}</div>
        </div>

        {blueprint.grammar_focus.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Grammar focus
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {blueprint.grammar_focus.map((g) => (
                <Badge key={g} variant="secondary" className="text-[10px]">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {blueprint.review_targets.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Review targets</div>
            <ul className="list-disc pl-4 text-slate-700 dark:text-slate-300">
              {blueprint.review_targets.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {blueprint.prerequisite_skills.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Prerequisite skills
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {blueprint.prerequisite_skills.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-sky-200/60 dark:border-sky-900/40 pt-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <Activity className="h-3 w-3" /> Adaptive
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="secondary" className="text-[10px]">
              tier {blueprint.adaptive_profile.difficulty_tier ?? 3}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              pacing: {blueprint.adaptive_profile.pacing_hint ?? 'maintain'}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              scaffold +{blueprint.adaptive_profile.scaffolding_boost ?? 0}
            </Badge>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Theme:{' '}
          <span className="text-slate-700 dark:text-slate-300">
            {blueprint.story_state.theme ?? '—'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
