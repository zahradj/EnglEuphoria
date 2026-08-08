import React, { useEffect, useRef, useState } from 'react';
import { Loader2, BookOpen, Palette, Target, CheckCircle2, Activity, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCreator, CurriculumData, BlueprintLessonRef } from '../../CreatorContext';
import { SkillBadge } from './SkillBadge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBlueprintLessonStatuses, rollupUnit } from './useBlueprintLessonStatuses';
import { LessonStatusBadge } from './LessonStatusBadge';
import { LessonActionsMenu, type LessonAction } from './LessonActionsMenu';
import { LessonBlueprintModal } from './LessonBlueprintModal';
import { loadLessonBlueprintFromCurriculum } from '@/services/contentCreator/curriculumBinding';
import type { LessonBlueprint } from '@/services/contentCreator/lessonBlueprint';
import type { LessonStage } from '@/services/contentCreator/unifiedLessonGenerator';

interface Props {
  data: CurriculumData | null;
  loading: boolean;
}

export const CurriculumMap: React.FC<Props> = ({ data, loading }) => {
  const { setActiveLessonData, setActiveBlueprintContext, setCurrentStep } = useCreator();
  const navigate = useNavigate();
  const autoSavedRef = useRef<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedCount, setSavedCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [blueprintModal, setBlueprintModal] = useState<{ open: boolean; bp: LessonBlueprint | null }>({
    open: false,
    bp: null,
  });

  // Orchestrator + stabilization signals for the lessons in this blueprint.
  const statuses = useBlueprintLessonStatuses(data);
  const totalLessons = data?.units.reduce((n, u) => n + u.lessons.length, 0) ?? 0;
  let publishedCount = 0;
  let repairCount = 0;
  let blockCount = 0;
  statuses.byKey.forEach((s) => {
    if (s.verdict === 'publish') publishedCount += 1;
    else if (s.verdict === 'repair') repairCount += 1;
    else if (s.verdict === 'block') blockCount += 1;
  });

  const HUB_ROUTE: Record<string, string> = {
    playground: '/playground-creator',
    academy: '/academy-creator',
    success: '/success-creator',
  };

  const handleBuildSlides = async (lesson: BlueprintLessonRef) => {
    if (!data) return;
    const hubKey = (data.hub || 'playground').toLowerCase();
    const route = HUB_ROUTE[hubKey] || '/playground-creator';

    // Stash for the destination Creator
    setActiveLessonData({
      source_lesson: lesson,
      cefr_level: data.cefr_level,
      hub: data.hub,
      lesson_title: lesson.title,
      target_goal: lesson.objective || lesson.learning_objective,
      slides: [],
      roadmap: ['Warm-up', 'Presentation', 'Practice', 'Production', 'Review'],
    });

    // Auto-plan the lesson blueprint (vocab + grammar + phonics) so the
    // destination Creator sidebar is pre-filled and ready for slide gen.
    let blueprint: any = null;
    const tId = toast.loading(`Planning blueprint for "${lesson.title}"…`);
    try {
      const { data: planData, error: planErr } = await supabase.functions.invoke(
        'plan-lesson-blueprint',
        {
          body: {
            topic: lesson.title,
            cefr_level: data.cefr_level,
            hub: hubKey,
            target_grammar: lesson.skill_focus,
          },
        },
      );
      if (planErr) throw planErr;
      if (planData?.error) throw new Error(planData.error);
      blueprint = planData;
      toast.success(`Blueprint ready · opening ${hubKey} creator…`, { id: tId });
    } catch (e: any) {
      console.warn('plan-lesson-blueprint failed; navigating without prefill', e);
      toast.error(e?.message || 'Could not pre-plan blueprint — opening creator anyway', { id: tId });
    }

    setCurrentStep(`${hubKey}-creator` as any);
    navigate(route, {
      state: {
        fromBlueprint: true,
        blueprint,
        lessonTitle: lesson.title,
        cefrLevel: data.cefr_level,
        hub: hubKey,
        objective: lesson.objective || lesson.learning_objective || null,
        skill_focus: lesson.skill_focus || null,
        unit_title: (lesson as any).unit_title || null,
        unit_number: (lesson as any).unit_number || null,
        lesson_number: (lesson as any).lesson_number || null,
      },
    });
  };

  /** Build the unit context (theme, prev lesson titles) for a lesson row. */
  const findUnitFor = (lesson: BlueprintLessonRef) =>
    data?.units.find((u) => u.lessons.some((l) => l.id === lesson.id));

  /**
   * Route a blueprint lesson to the appropriate Hub Creator with full prefill.
   * The slow Unified Lesson Generator was removed — each hub now owns its
   * own faster generation pipeline via GenerateLessonModal.
   */
  const handleGenerateUnified = (
    lesson: BlueprintLessonRef,
    lIdx: number,
    uIdx: number,
    stage: LessonStage = 'all',
    autoRun = false,
  ) => {
    if (!data) return;
    const unit = findUnitFor(lesson);
    const unitNumber = unit?.unit_number ?? uIdx + 1;
    const lessonNumber = lesson.lesson_number ?? lIdx + 1;
    const previous = (unit?.lessons || [])
      .filter((l) => l.id !== lesson.id)
      .slice(0, lIdx)
      .map((l) => l.title);

    const hubKey = (data.hub || 'playground').toLowerCase();
    const route = HUB_ROUTE[hubKey] || '/playground-creator';

    // Resolve the canonical blueprint from the curriculum so the destination
    // creator can prefill vocabulary / grammar / phonics / objective.
    let bp: LessonBlueprint | null = null;
    try {
      bp = loadLessonBlueprintFromCurriculum({
        curriculum: data,
        unitIdx: uIdx,
        lessonIdx: lIdx,
      });
    } catch (e) {
      console.warn('Could not resolve lesson blueprint:', e);
    }

    setActiveLessonData({
      source_lesson: lesson,
      cefr_level: data.cefr_level,
      hub: data.hub,
      lesson_title: lesson.title,
      target_goal: lesson.objective || lesson.learning_objective,
      slides: [],
      roadmap: ['Warm-up', 'Presentation', 'Practice', 'Production', 'Review'],
    });

    setActiveBlueprintContext({
      unit_number: unitNumber,
      unit_title: unit?.unit_title || '',
      unit_theme: unit?.theme,
      lesson_number: lessonNumber,
      lesson_title: lesson.title,
      curriculum_title: data.curriculum_title,
      hub: data.hub,
      cefr_level: data.cefr_level,
      skill_focus: lesson.skill_focus as string | undefined,
      objective: lesson.objective || lesson.learning_objective,
      previous_lesson_titles: previous,
      stage,
      autoRun,
    });

    setCurrentStep(`${hubKey}-creator` as any);
    toast.success(`Opening ${hubKey} creator for "${lesson.title}"…`);
    navigate(route, {
      state: {
        fromBlueprint: true,
        blueprint: bp,
        lessonTitle: lesson.title,
        cefrLevel: data.cefr_level,
        hub: hubKey,
        skill_focus: lesson.skill_focus,
        objective: lesson.objective || lesson.learning_objective,
        unit_theme: unit?.theme,
        unit_number: unitNumber,
        lesson_number: lessonNumber,
        previous_lesson_titles: previous,
        autoOpen: true,
        autoRun,
      },
    });
  };

  /** Dispatch a LessonActionsMenu action against a specific lesson row. */
  const handleLessonAction = (
    action: LessonAction,
    stage: LessonStage | null,
    lesson: BlueprintLessonRef,
    lIdx: number,
    uIdx: number,
  ) => {
    if (!data) return;
    if (action === 'view_blueprint') {
      const bp = loadLessonBlueprintFromCurriculum({
        curriculum: data,
        unitIdx: uIdx,
        lessonIdx: lIdx,
      });
      setBlueprintModal({ open: true, bp });
      return;
    }
    if (action === 'open_generator') {
      handleGenerateUnified(lesson, lIdx, uIdx, 'all', false);
      return;
    }
    handleGenerateUnified(lesson, lIdx, uIdx, stage ?? 'all', true);
  };

  const saveBlueprintToLibrary = async (
    payload: CurriculumData,
    opts: { silent?: boolean; navigateAfter?: boolean } = {},
  ): Promise<{ ok: boolean; count: number; error?: string }> => {
    // Normalize hub → target_system used by Master Library
    const hubToTargetSystem = (hub: string): string => {
      const h = (hub || '').toLowerCase();
      if (h === 'playground' || h === 'kids') return 'kids';
      if (h === 'academy' || h === 'teen' || h === 'teens') return 'teen';
      if (h === 'success' || h === 'adult' || h === 'adults' || h === 'professional') return 'adult';
      return h || 'teen';
    };

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      if (!opts.silent) toast.error('You must be signed in to save the blueprint.');
      return { ok: false, count: 0, error: 'not-signed-in' };
    }
    const uid = userData.user.id;
    const targetSystem = hubToTargetSystem(payload.hub);
    const cefr = (payload.cefr_level || 'A1').toUpperCase();
    // CHECK constraint on curriculum_lessons.difficulty_level only allows
    // 'beginner' | 'intermediate' | 'advanced'. Map CEFR → bucket.
    const cefrToDifficulty = (c: string): 'beginner' | 'intermediate' | 'advanced' => {
      if (['PRE-A1', 'A1', 'A2'].includes(c)) return 'beginner';
      if (['B1', 'B2'].includes(c)) return 'intermediate';
      return 'advanced'; // C1, C2, fallback
    };
    const difficulty = cefrToDifficulty(cefr);

    const lessonsToInsert = payload.units.flatMap((unit, uIdx) => {
      const unitNumber = unit.unit_number ?? uIdx + 1;
      return unit.lessons.map((lesson, lIdx) => {
        const lessonNumber = lIdx + 1;
        // Strict sequential global order: U1L1=101, U1L2=102, U2L1=201...
        // Keeps unit grouping AND lesson order intact via a single column.
        const globalOrder = unitNumber * 100 + lessonNumber;
        return {
          title: lesson.title,
          description: lesson.objective || lesson.learning_objective || null,
          target_system: targetSystem,
          difficulty_level: difficulty,
          is_published: false,
          created_by: uid,
          sequence_order: globalOrder,
          skills_focus: lesson.skill_focus ? [lesson.skill_focus] : [],
          content: { slides: [], homework_missions: [] },
          ai_metadata: {
            blueprint_ref: lesson,
            cefr_level: cefr,
            unit_title: unit.unit_title,
            unit_number: unitNumber,
            lesson_number: lessonNumber,
            curriculum_title: payload.curriculum_title,
            theme_hint: payload.theme_hint ?? null,
            hub: payload.hub,
          },
        };
      });
    });

    try {
      // Upsert against the partial unique index (creator + hub + cefr + unit + lesson).
      // If a row already exists for this slot, UPDATE it instead of creating a duplicate.
      const { data: inserted, error } = await supabase
        .from('curriculum_lessons')
        .upsert(lessonsToInsert as any, {
          onConflict: 'created_by,target_system,slot_cefr_level,slot_unit_number,slot_lesson_number',
          ignoreDuplicates: false,
        })
        .select('id, title');
      console.log('Library Save Result:', { inserted, error, count: lessonsToInsert.length, silent: opts.silent });
      if (error) throw error;

      const count = inserted?.length ?? lessonsToInsert.length;
      if (!opts.silent) {
        toast.success(`Blueprint saved! ${count} lessons synced to your library (no duplicates).`);
      }
      if (opts.navigateAfter) {
        setCurrentStep('library');
        navigate('/content-creator/library');
      }
      return { ok: true, count };
    } catch (err: any) {
      console.error('SAVE TO LIBRARY error:', err);
      if (!opts.silent) {
        toast.error(err?.message || JSON.stringify(err) || 'Unknown SQL error');
      }
      return { ok: false, count: 0, error: err?.message || 'unknown' };
    }
  };

  const forceSaveToLibrary = async () => {
    if (isSaving || hasSaved) return;
    if (!data) {
      toast.error('No curriculum lessons to save.');
      return;
    }
    setIsSaving(true);
    try {
      // Mark fingerprint so the auto-save effect cannot re-fire and double-write.
      autoSavedRef.current =
        `${data.curriculum_title}::${data.cefr_level}::${data.hub}::` +
        `${data.units.length}::${data.units.reduce((n, u) => n + u.lessons.length, 0)}`;
      const res = await saveBlueprintToLibrary(data, { navigateAfter: false });
      if (res.ok) {
        setHasSaved(true);
        toast.success(`✅ Synced ${res.count} lessons. Opening library…`);
        setTimeout(() => navigate('/content-creator/library'), 1000);
        // Intentionally keep isSaving=true so button stays locked during redirect
      } else {
        setIsSaving(false);
      }
    } catch (err) {
      setIsSaving(false);
    }
  };

  // ── Single-save guarantee ─────────────────────────────────────────
  // We intentionally do NOT auto-save the blueprint. The user must click
  // "Save Blueprint" exactly once. That click is protected by:
  //   1. React state lock      (isSaving / hasSaved — prevents double-click)
  //   2. autoSavedRef sentinel (kept for future-proofing against rerenders)
  //   3. DB partial unique index curriculum_lessons_unique_slot
  //      (creator + hub + cefr + unit + lesson) — final backstop, makes
  //      duplicates physically impossible even across page reloads.
  // We just surface a friendly "Ready to save" status in the UI.
  useEffect(() => {
    if (data && !loading && autoSaveStatus === 'idle') {
      setAutoSaveStatus('idle');
      setSavedCount(data.units.reduce((n, u) => n + u.lessons.length, 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading]);



  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-3" />
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">Architecting your curriculum…</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Spaced repetition, skill rotation, and CEFR-locked vocabulary.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <BookOpen className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">Your Curriculum Map will appear here</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Configure the level, age group, and theme on the left, then click <strong>Generate Master Blueprint</strong>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500">
            {data.cefr_level} · {data.hub}
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate">
            {data.curriculum_title}
          </h2>
          {data.theme_hint && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Theme: {data.theme_hint}</p>
          )}
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div><strong className="text-slate-900 dark:text-slate-50">{data.units.length}</strong> units</div>
          <div><strong className="text-slate-900 dark:text-slate-50">{data.units.reduce((n, u) => n + u.lessons.length, 0)}</strong> lessons</div>
        </div>
      </div>

      {/* ── Orchestrator + Stabilization health bar ───────────────── */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-50/60 to-indigo-50/60 dark:from-sky-950/30 dark:to-indigo-950/30 flex items-center gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <Activity className="h-3.5 w-3.5 text-indigo-500" />
          <span className="font-semibold">Orchestrator</span>
          <code className="text-[10px] text-slate-500">
            {statuses.orchestratorVersion ?? 'awaiting first generation'}
          </code>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-semibold">Publish gate</span>
          <span className="text-slate-500">{publishedCount} / {totalLessons}</span>
          {repairCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-300">
              · <AlertTriangle className="h-3 w-3" /> {repairCount} repair
            </span>
          )}
          {blockCount > 0 && (
            <span className="text-rose-700 dark:text-rose-300">· {blockCount} block</span>
          )}
        </div>

        {statuses.signalCount > 0 && (
          <div
            className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300"
            title="Unconsumed longitudinal signals — fed into the next generation at tier 6"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="font-semibold">{statuses.signalCount} stabilization signal{statuses.signalCount === 1 ? '' : 's'} pending</span>
          </div>
        )}

        <button
          onClick={statuses.refresh}
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          disabled={statuses.loading}
        >
          <RefreshCw className={`h-3 w-3 ${statuses.loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* ── Auto-save status banner ───────────────────────────── */}
        {autoSaveStatus !== 'idle' && (
          <div
            className={
              'mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ' +
              (autoSaveStatus === 'saved'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
                : autoSaveStatus === 'saving'
                ? 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200'
                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200')
            }
          >
            {autoSaveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Auto-saving all lessons to your Master Library…</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span className="flex-1">
                  <strong>{savedCount} draft lessons</strong> were automatically saved to your Master Library. Edit and publish them anytime.
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                  onClick={() => {
                    setCurrentStep('library');
                    navigate('/content-creator/library');
                  }}
                >
                  Open Library →
                </Button>
              </>
            )}
            {autoSaveStatus === 'error' && (
              <span className="flex-1">Auto-save didn't go through. Tap retry below.</span>
            )}
          </div>
        )}

        <Accordion type="multiple" defaultValue={data.units.map((u) => u.id)} className="space-y-3">
          {data.units.map((unit, uIdx) => (
            <AccordionItem
              key={unit.id}
              value={unit.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-900/60 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-900/60">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow text-white font-bold text-sm flex-shrink-0">
                    {unit.unit_number ?? uIdx + 1}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate">
                      {unit.unit_title}
                    </div>
                    {unit.theme && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        🎯 {unit.theme} · {unit.lessons.length} lessons
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-0 pb-4">
                <div>
                  {(() => {
                    const r = rollupUnit(
                      unit.lessons,
                      unit.unit_number ?? uIdx + 1,
                      statuses.byKey,
                    );
                    if (r.publish + r.repair + r.block === 0) return null;
                    return (
                      <div className="mb-3 flex items-center gap-3 text-[11px] font-medium flex-wrap">
                        {r.publish > 0 && <span className="text-emerald-700 dark:text-emerald-300">✅ {r.publish} publish</span>}
                        {r.repair > 0 && <span className="text-amber-700 dark:text-amber-300">⚠ {r.repair} repair</span>}
                        {r.block > 0 && <span className="text-rose-700 dark:text-rose-300">🚫 {r.block} block</span>}
                        {r.pending > 0 && <span className="text-slate-500">◻ {r.pending} pending</span>}
                      </div>
                    );
                  })()}
                  <ul className="space-y-2">
                  {unit.lessons.map((lesson, lIdx) => {
                    const unitNum = unit.unit_number ?? uIdx + 1;
                    const lessonNum = lesson.lesson_number ?? lIdx + 1;
                    const lessonStatus = statuses.byKey.get(`${unitNum}-${lessonNum}`);
                    const hasGenerated = !!lessonStatus && (lessonStatus.slideCount > 0 || !!lessonStatus.verdict);
                    return (
                    <li
                      key={lesson.id}
                      className="group rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-start gap-3"
                    >
                      <div className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                        {lessonNum}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                            {lesson.title}
                          </h4>
                          <SkillBadge skill={lesson.skill_focus} />
                          {(lesson as any).lesson_type === 'extra_practice' && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                              🎯 Extra Practice
                            </span>
                          )}
                          {(lesson as any).lesson_type === 'unit_review' && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                              🏆 Unit Review
                            </span>
                          )}
                          {(lesson as any).lesson_type === 'storybook' && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-800">
                              📖 Storybook
                            </span>
                          )}
                        </div>
                        {(lesson.objective || lesson.learning_objective) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1.5">
                            <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{lesson.objective || lesson.learning_objective}</span>
                          </p>
                        )}
                        <LessonStatusBadge status={lessonStatus} />
                      </div>
                      <div className="shrink-0 flex flex-col gap-1.5 items-end">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleGenerateUnified(lesson, lIdx, uIdx, 'all', true)}
                            className={
                              hasGenerated
                                ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 shadow-sm'
                                : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white border-0 shadow-sm'
                            }
                          >
                            {hasGenerated ? (
                              <><RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-generate</>
                            ) : (
                              <><Palette className="h-3.5 w-3.5 mr-1" /> Generate Lesson</>
                            )}
                          </Button>
                          <LessonActionsMenu
                            onAction={(a, s) => handleLessonAction(a, s, lesson, lIdx, uIdx)}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBuildSlides(lesson)}
                          className="text-[11px] h-7 text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        >
                          Open hub creator →
                        </Button>
                      </div>
                    </li>
                    );
                  })}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <button
          onClick={forceSaveToLibrary}
          disabled={isSaving || hasSaved}
          className={`w-full py-4 mt-8 font-bold text-lg rounded-xl shadow-lg transition-colors ${
            isSaving || hasSaved
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {isSaving
            ? '⏳ Saving to Database...'
            : hasSaved
            ? '✅ Saved Successfully!'
            : '🛑 FORCE SAVE TO LIBRARY 🛑'}
        </button>
      </div>

      <LessonBlueprintModal
        open={blueprintModal.open}
        blueprint={blueprintModal.bp}
        onOpenChange={(v) => setBlueprintModal((m) => ({ ...m, open: v }))}
      />
    </>
  );
};
