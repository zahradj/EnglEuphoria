import React, { useState } from 'react';
import { Loader2, Map, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { handleAIResponse } from '@/lib/aiErrorHandler';
import { useCreator, CEFRLevel, HubType, CurriculumData } from '../CreatorContext';
import { CurriculumMap } from './blueprint/CurriculumMap';

const HUB_LABEL: Record<HubType, string> = {
  playground: 'Playground (Kids 4–9)',
  academy: 'Academy (Teens 12–17)',
  success: 'Success Hub (Adults 18+)',
};

const HUB_DEFAULT_CEFR: Record<HubType, CEFRLevel> = {
  playground: 'A1',
  academy: 'B1',
  success: 'C1',
};

const HUB_TO_AGE_GROUP: Record<HubType, string> = {
  playground: 'kids',
  academy: 'teens',
  success: 'adults',
};

const uid = () => `u_${Math.random().toString(36).slice(2, 10)}`;

export const BlueprintEngine: React.FC = () => {
  const { curriculumData, setCurriculumData } = useCreator();

  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>(curriculumData?.cefr_level || 'B1');
  const [hub, setHub] = useState<HubType>(curriculumData?.hub || 'academy');
  const [theme, setTheme] = useState(curriculumData?.theme_hint || '');
  const [unitCount, setUnitCount] = useState(2);
  const [lessonsPerUnit, setLessonsPerUnit] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      // Anti-Repetition: pull this user's last 5 lesson titles so Gemini
      // can't recycle themes/storylines from their recent generations.
      let previousTopics: string[] = [];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const { data: recent } = await supabase
            .from('curriculum_lessons')
            .select('title')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          previousTopics = (recent || [])
            .map((r: any) => String(r?.title || '').trim())
            .filter(Boolean);
        }
      } catch (prevErr) {
        // Fail-open: missing previous topics shouldn't block generation.
        console.warn('Could not load previous lesson titles:', prevErr);
      }

      const { data, error } = await supabase.functions.invoke('generate-curriculum-blueprint', {
        body: {
          cefr_level: cefrLevel,
          age_group: HUB_TO_AGE_GROUP[hub],
          hub,
          unit_count: unitCount,
          lessons_per_unit: lessonsPerUnit,
          theme_hint: theme.trim(),
          previous_topics: previousTopics,
        },
      });
      if (!handleAIResponse({ data, error, onRetry: handleGenerate, context: 'Blueprint' })) {
        setIsGenerating(false);
        return;
      }

      const units = (data?.units || []).map((u: any) => ({
        id: uid(),
        unit_number: u.unit_number,
        unit_title: u.unit_title,
        theme: u.theme,
        lessons: (u.lessons || []).map((l: any) => ({
          id: l.lesson_id || uid(),
          lesson_number: l.lesson_number,
          title: l.title,
          skill_focus: l.skill_focus,
          objective: l.objective || l.learning_objective,
          unit_number: u.unit_number,
          unit_title: u.unit_title,
          unit_theme: u.theme,
          // Preserve structured blueprint fields from the edge function so
          // the Unified Generator can hydrate the lesson form correctly.
          communication_goal: l.communication_goal,
          grammar_focus: Array.isArray(l.grammar_focus) ? l.grammar_focus : undefined,
          vocabulary_focus: Array.isArray(l.vocabulary_focus) ? l.vocabulary_focus : undefined,
          pronunciation_focus: Array.isArray(l.pronunciation_focus) ? l.pronunciation_focus : undefined,
          phonics_focus: Array.isArray(l.phonics_focus) ? l.phonics_focus : undefined,
          review_targets: Array.isArray(l.review_targets) ? l.review_targets : undefined,
          adaptive_profile: l.adaptive_profile,
          story_state: l.story_state,
          game_targets: Array.isArray(l.game_targets) ? l.game_targets : undefined,
          homework_targets: Array.isArray(l.homework_targets) ? l.homework_targets : undefined,
          lesson_type: l.lesson_type,
        })),
      }));

      const next: CurriculumData = {
        curriculum_title: data?.curriculum_title || 'English Curriculum',
        cefr_level: cefrLevel,
        hub,
        theme_hint: theme.trim(),
        units,
      };
      setCurriculumData(next);
      const totalLessons = units.reduce((n: number, u: any) => n + u.lessons.length, 0);
      const genreNote = data?.chosen_genre ? ` · genre: ${data.chosen_genre}` : '';
      toast.success(`Blueprint ready · ${units.length} units · ${totalLessons} lessons${genreNote}`);

    } catch (err: any) {
      console.error('Blueprint generation error:', err);
      setError(err?.message || 'Failed to generate blueprint.');
      toast.error(err?.message || 'Failed to generate blueprint.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(320px,30%)_1fr] gap-6 min-h-0">
      {/* ── Left: Configuration Pane ──────────────────────────────── */}
      <aside className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Map className="h-4 w-4 text-sky-500" />
          <h2 className="font-bold tracking-tight text-slate-900 dark:text-slate-50">Configuration</h2>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <Field label="Target CEFR Level">
            <Select value={cefrLevel} onValueChange={(v) => setCefrLevel(v as CEFRLevel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pre-A1">Pre-A1 — Ages 4-5 (Phonics)</SelectItem>
                <SelectItem value="A1">A1 — Absolute Beginner</SelectItem>
                <SelectItem value="A2">A2 — Elementary</SelectItem>
                <SelectItem value="B1">B1 — Intermediate</SelectItem>
                <SelectItem value="B2">B2 — Upper-Intermediate</SelectItem>
                <SelectItem value="C1">C1 — Advanced</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Age Group">
            <Select
              value={hub}
              onValueChange={(v) => {
                const h = v as HubType;
                setHub(h);
                setCefrLevel(HUB_DEFAULT_CEFR[h]);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="playground">{HUB_LABEL.playground}</SelectItem>
                <SelectItem value="academy">{HUB_LABEL.academy}</SelectItem>
                <SelectItem value="success">{HUB_LABEL.success}</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Core Theme / Topic (Optional)">
            <Input
              placeholder="e.g., Space Travel (Optional - leave blank for AI suggestions)"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              maxLength={200}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Number of Units">
              <Input
                type="number"
                min={1}
                max={10}
                value={unitCount}
                onChange={(e) => setUnitCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              />
            </Field>
            <Field label="Lessons per Unit">
              <Input
                type="number"
                min={2}
                max={8}
                value={lessonsPerUnit}
                onChange={(e) => setLessonsPerUnit(Math.max(2, Math.min(8, Number(e.target.value) || 2)))}
              />
            </Field>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !cefrLevel || !hub}
            className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white border-0 shadow-md"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Blueprint…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                🗺️ {curriculumData ? 'Regenerate Blueprint' : 'Generate Master Blueprint'}
              </>
            )}
          </Button>
          {curriculumData && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurriculumData(null);
                toast.success('Blueprint cleared — change hub/CEFR/theme and regenerate.');
              }}
              disabled={isGenerating}
              className="w-full h-9 text-xs"
            >
              Clear current blueprint
            </Button>
          )}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">
            Unit Anatomy (7): L1–L4 core skills · L5 Storybook · L6 <strong>Extra Practice</strong> · L7 <strong>Unit Review & Boss Test</strong>.
          </p>
        </div>
      </aside>

      {/* ── Right: Curriculum Map ─────────────────────────────────── */}
      <section className="min-w-0 min-h-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <CurriculumMap data={curriculumData} loading={isGenerating} />
      </section>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </Label>
    {children}
  </div>
);
