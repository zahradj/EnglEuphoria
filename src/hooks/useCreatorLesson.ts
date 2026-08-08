import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  getLibraryLessons,
  getLessonById,
  type LibraryLesson,
} from '@/services/lessonLibraryService';
import { cefrToDifficulty, hubToTargetSystem, normalizeCefr } from '@/services/lessonHubMapping';
import { runLessonQualityCheck, summarizeQualityReport, type LessonQualityReport } from '@/lib/lessonQualityCheck';

/**
 * Auto-inject the bookend slides (`intro`, `lesson_summary`) every hub requires.
 * Prevents the quality gate from blocking publish for purely structural omissions
 * that we can safely scaffold from the lesson title.
 */
function ensureBookendSlides(slides: any[], title: string): any[] {
  const out = Array.isArray(slides) ? [...slides] : [];
  const types = new Set(out.map((s) => String(s?.type || '')));
  if (!types.has('intro')) {
    out.unshift({
      type: 'intro',
      title: title || 'Welcome',
      subtitle: "Let's start today's lesson.",
      auto_generated: true,
    });
  }
  if (!types.has('lesson_summary')) {
    out.push({
      type: 'lesson_summary',
      title: 'Great work!',
      takeaway: 'You completed the lesson.',
      auto_generated: true,
    });
  }
  return out;
}

/**
 * Shared persistence hook for the Playground & Academy slide creators.
 *
 * Routes everything through `curriculum_lessons` (the canonical table the
 * Master Library reads from). Slides are stored as `content.slides`.
 */

export type CreatorHub = 'playground' | 'academy' | 'success';

interface UseCreatorLessonArgs {
  hub: CreatorHub;
  initialLessonId?: string | null;
}

export function useCreatorLesson({ hub, initialLessonId }: UseCreatorLessonArgs) {
  const qc = useQueryClient();
  const [lessonId, setLessonId] = useState<string | null>(initialLessonId ?? null);
  const lessonIdRef = useRef<string | null>(initialLessonId ?? null);
  useEffect(() => { lessonIdRef.current = lessonId; }, [lessonId]);
  // Serialises persist() so concurrent autosaves cannot each INSERT a new
  // curriculum_lessons row before setLessonId() has committed. Without this
  // guard, rapid edits (autosave every 1.5s) create duplicate rows and the
  // Publish click only flips is_published on the latest one — earlier drafts
  // linger in the Master Library as unpublished copies.
  const persistLockRef = useRef<Promise<any> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastQAReport, setLastQAReport] = useState<LessonQualityReport | null>(null);

  useEffect(() => {
    if (initialLessonId && initialLessonId !== lessonId) {
      setLessonId(initialLessonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLessonId]);

  const lessonQuery = useQuery({
    queryKey: ['creator-lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      return getLessonById(lessonId);
    },
    enabled: !!lessonId,
  });

  const libraryQuery = useQuery({
    queryKey: ['creator-library', hub],
    // Include drafts so lessons appear in the Master Library the moment
    // "Save Draft" is clicked — not only after Publish.
    queryFn: () => getLibraryLessons(hub, { includeDrafts: true }),
  });

  const persistImpl = useCallback(
    async (
      slides: any[],
      meta: { title: string; level?: string; publish: boolean; silent?: boolean; blueprint?: any; bypassQA?: boolean; playgroundUnit?: any; criticResult?: { verdict: string; overall: number } | null; unitNumber?: number; lessonNumber?: number },
    ): Promise<string | null> => {
      if (!meta.silent) setIsSaving(true);
      try {
        // Auto-scaffold required bookend slides so the QA gate can't block
        // publish over missing intro / lesson_summary alone.
        slides = ensureBookendSlides(slides, meta.title);

        // ── Pre-save Quality Gate ───────────────────────────────────
        // Runs structure / reading-level / rubric checks. Hard blockers
        // stop publish; warnings surface as toasts but do not block save.
        let qaReport: LessonQualityReport | null = null;
        try {
          qaReport = runLessonQualityCheck({
            slides,
            hub,
            cefr: meta.level,
            blueprint: meta.blueprint ?? undefined,
          });
          setLastQAReport(qaReport);
          if (qaReport.verdict === 'block' && meta.publish && !meta.bypassQA) {
            const codes = qaReport.issues.filter((i) => i.severity === 'block').map((i) => i.code).join(', ');
            throw new Error(`Quality gate blocked publish (${codes}). Fix issues or save as draft.`);
          }
          if (!meta.silent && qaReport.verdict !== 'pass') {
            toast.warning(summarizeQualityReport(qaReport));
          }
        } catch (qaErr: any) {
          if (qaErr?.message?.startsWith('Quality gate blocked')) throw qaErr;
          console.warn('[useCreatorLesson] QA check failed (non-fatal)', qaErr);
        }

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;
        const targetSystem = hubToTargetSystem(hub);
        const levelRaw = (meta.level || '').trim();
        const cefr = normalizeCefr(levelRaw);
        const difficulty = cefr ? cefrToDifficulty(cefr) : cefrToDifficulty(levelRaw || 'A1');
        const successToast = '✅ Saved to Master Library';

        const currentLessonId = lessonIdRef.current;
        if (currentLessonId) {
          // Preserve existing content (blueprint metadata: objectives,
          // vocabularyTheme, ai_wizard_manifest, mediaAssets, homework_missions, etc.)
          // and existing ai_metadata while merging the new slides + hub/cefr.
          const { data: existing } = await supabase
            .from('curriculum_lessons')
            .select('content, ai_metadata, is_published')
            .eq('id', currentLessonId)
            .maybeSingle();
          const prevContent = (existing?.content as Record<string, any> | null) ?? {};
          const mergedContent = {
            ...prevContent,
            slides,
            hub,
            ...(meta.playgroundUnit ? { playground_unit: meta.playgroundUnit } : {}),
            updated_at: new Date().toISOString(),
          };
          const mergedMeta = {
            ...(existing?.ai_metadata as Record<string, any> | null ?? {}),
            hub,
            ...(cefr ? { cefr_level: cefr } : {}),
            slideCount: slides.length,
            ...(meta.blueprint ? { lesson_blueprint: meta.blueprint } : {}),
            ...(qaReport ? { qa_report: qaReport, quality_score: qaReport.overall ?? null } : {}),
            ...(meta.criticResult ? { critic_verdict: meta.criticResult.verdict, critic_score: meta.criticResult.overall, critic_scored_at: new Date().toISOString() } : {}),
          };
          // Silent autosaves must NEVER downgrade a published lesson back to draft.
          // Only an explicit Publish/SaveDraft click (non-silent) can change is_published.
          const nextIsPublished = meta.silent
            ? (existing?.is_published ?? false)
            : meta.publish;
          const { error } = await supabase
            .from('curriculum_lessons')
            .update({
              title: meta.title,
              content: mergedContent,
              is_published: nextIsPublished,
              difficulty_level: difficulty,
              // The library groups by slot_cefr_level first, falling back to the
              // coarse 3-bucket difficulty_level only when this is null — write
              // the real level so the classroom library shows all 6 CEFR
              // sections instead of collapsing them into 3.
              ...(cefr ? { slot_cefr_level: cefr } : {}),
              // Curriculum-slot position — only set when the caller actually
              // knows it (e.g. opened from the Curriculum Map), so a
              // from-scratch lesson's already-correct slot never gets
              // clobbered by an unrelated save.
              ...(meta.unitNumber != null ? { slot_unit_number: meta.unitNumber } : {}),
              ...(meta.lessonNumber != null ? { slot_lesson_number: meta.lessonNumber } : {}),
              target_system: targetSystem,
              ai_metadata: mergedMeta,
            })
            .eq('id', currentLessonId);
          if (error) throw error;

          qc.invalidateQueries({ queryKey: ['creator-lesson', currentLessonId] });
          qc.invalidateQueries({ queryKey: ['creator-library', hub] });
          qc.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
          if (!meta.silent) toast.success(successToast);
          return currentLessonId;
        }

        const content = {
          slides,
          hub,
          ...(meta.playgroundUnit ? { playground_unit: meta.playgroundUnit } : {}),
          updated_at: new Date().toISOString(),
        };


        const { data, error } = await supabase
          .from('curriculum_lessons')
          .insert({
            title: meta.title,
            description: `${hub === 'playground' ? 'Playground' : hub === 'success' ? 'Success Hub' : 'Academy'} lesson`,
            target_system: targetSystem,
            difficulty_level: difficulty,
            ...(cefr ? { slot_cefr_level: cefr } : {}),
            ...(meta.unitNumber != null ? { slot_unit_number: meta.unitNumber } : {}),
            ...(meta.lessonNumber != null ? { slot_lesson_number: meta.lessonNumber } : {}),
            duration_minutes: hub === 'playground' ? 30 : 60,
            content,
            is_published: meta.publish,
            created_by: userId,
            ai_metadata: { hub, cefr_level: cefr ?? undefined, slideCount: slides.length, ...(meta.blueprint ? { lesson_blueprint: meta.blueprint } : {}), ...(qaReport ? { qa_report: qaReport, quality_score: qaReport.overall ?? null } : {}), ...(meta.criticResult ? { critic_verdict: meta.criticResult.verdict, critic_score: meta.criticResult.overall, critic_scored_at: new Date().toISOString() } : {}) },
          } as any)
          .select('id')
          .single();
        if (error) throw error;
        const newId = (data as any).id as string;
        setLessonId(newId);
        lessonIdRef.current = newId;
        qc.invalidateQueries({ queryKey: ['creator-library', hub] });
        qc.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
        if (!meta.silent) toast.success(successToast);
        return newId;
      } catch (e: any) {
        console.error('[useCreatorLesson] persist error', e);
        if (!meta.silent) toast.error(e?.message || 'Failed to save lesson');
        return null;
      } finally {
        if (!meta.silent) setIsSaving(false);
      }
    },
    [hub, qc],
  );

  // Serialised wrapper: chains every persist() call so a slow INSERT completes
  // (and setLessonId lands) before the next autosave runs. Prevents duplicate
  // curriculum_lessons rows during rapid edits.
  const persist = useCallback(
    (slides: any[], meta: Parameters<typeof persistImpl>[1]): Promise<string | null> => {
      const prev = persistLockRef.current ?? Promise.resolve(null);
      const next = prev.catch(() => null).then(() => persistImpl(slides, meta));
      persistLockRef.current = next;
      return next;
    },
    [persistImpl],
  );

  const saveDraft = useCallback(
    (slides: any[], meta: { title: string; level?: string; blueprint?: any; playgroundUnit?: any; criticResult?: { verdict: string; overall: number } | null; unitNumber?: number; lessonNumber?: number }) =>
      persist(slides, { ...meta, publish: false }),
    [persist],
  );

  const publish = useCallback(
    (slides: any[], meta: { title: string; level?: string; blueprint?: any; playgroundUnit?: any; criticResult?: { verdict: string; overall: number } | null; unitNumber?: number; lessonNumber?: number }) =>
      persist(slides, { ...meta, publish: true }),
    [persist],
  );

  const silentSaveDraft = useCallback(
    (slides: any[], meta: { title: string; level?: string; blueprint?: any; playgroundUnit?: any; unitNumber?: number; lessonNumber?: number }) =>
      persist(slides, { ...meta, publish: false, silent: true }),
    [persist],
  );

  /**
   * Upsert all 7 lessons of a Playground unit into curriculum_lessons,
   * one row per lesson, identified by (unit_id, ai_metadata.lesson_number).
   * Each row gets its own resolved title so the Master Library shows
   * "Lesson 1 · …", "Lesson 2 · …" etc. instead of 7 copies of the unit topic.
   */
  const saveUnitLessons = useCallback(
    async (args: {
      unitId: string;
      unitTopic: string;
      unitTheme?: string;
      cefr?: string;
      lessons: Array<{
        lesson_number: number;
        title: string;
        slides: any[];
        playground_lesson: any;
      }>;
      publish: boolean;
      silent?: boolean;
    }): Promise<boolean> => {
      if (!args.silent) setIsSaving(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;
        const targetSystem = hubToTargetSystem(hub);
        const levelRaw = (args.cefr || '').trim();
        const cefr = normalizeCefr(levelRaw);
        const difficulty = cefr ? cefrToDifficulty(cefr) : cefrToDifficulty(levelRaw || 'A1');

        // Find existing rows for this unit so we can update in place.
        const { data: existingRows } = await supabase
          .from('curriculum_lessons')
          .select('id, ai_metadata, content, sequence_order, is_published')
          .eq('unit_id', args.unitId);
        const existingByNumber = new Map<number, any>();
        for (const r of existingRows ?? []) {
          const n = Number((r as any)?.ai_metadata?.lesson_number) || Number((r as any)?.sequence_order) || null;
          if (n) existingByNumber.set(n, r);
        }


        const touchedLessonIds: string[] = [];

        for (const l of args.lessons) {
          const slides = ensureBookendSlides(l.slides ?? [], l.title);
          const baseContent = {
            slides,
            hub,
            playground_lesson: l.playground_lesson,
            playground_unit_ref: {
              unit_id: args.unitId,
              unit_topic: args.unitTopic,
              ...(args.unitTheme ? { unit_theme: args.unitTheme } : {}),
            },
            updated_at: new Date().toISOString(),
          };
          const baseMeta = {
            hub,
            ...(cefr ? { cefr_level: cefr } : {}),
            lesson_number: l.lesson_number,
            unit_topic: args.unitTopic,
            ...(args.unitTheme ? { unit_theme: args.unitTheme } : {}),
            slideCount: slides.length,
          };
          const existing = existingByNumber.get(l.lesson_number);
          if (existing) {
            const prevContent = (existing.content as Record<string, any> | null) ?? {};
            const prevMeta = (existing.ai_metadata as Record<string, any> | null) ?? {};
            const { error } = await supabase
              .from('curriculum_lessons')
              .update({
                title: l.title,
                content: { ...prevContent, ...baseContent },
                ai_metadata: { ...prevMeta, ...baseMeta },
                is_published: args.silent ? (existing.is_published ?? false) : args.publish,

                difficulty_level: difficulty,
                target_system: targetSystem,
                unit_id: args.unitId,
                sequence_order: l.lesson_number,
              } as any)
              .eq('id', existing.id);
            if (error) throw error;
            if (existing.id) touchedLessonIds.push(existing.id);
          } else {
            const { data: inserted, error } = await supabase
              .from('curriculum_lessons')
              .insert({
                title: l.title,
                description: `${hub === 'playground' ? 'Playground' : hub === 'success' ? 'Success Hub' : 'Academy'} lesson`,
                target_system: targetSystem,
                difficulty_level: difficulty,
                duration_minutes: hub === 'playground' ? 30 : 60,
                content: baseContent,
                ai_metadata: baseMeta,
                is_published: args.publish,
                created_by: userId,
                unit_id: args.unitId,
                sequence_order: l.lesson_number,
              } as any)
              .select('id')
              .single();
            if (error) throw error;
            if ((inserted as any)?.id) touchedLessonIds.push((inserted as any).id);
          }
        }
        for (const id of touchedLessonIds) {
          qc.invalidateQueries({ queryKey: ['creator-lesson', id] });
        }
        if (lessonId) qc.invalidateQueries({ queryKey: ['creator-lesson', lessonId] });
        qc.invalidateQueries({ queryKey: ['creator-library', hub] });
        qc.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
        if (!args.silent) toast.success(`✅ Saved ${args.lessons.length} lessons to Master Library`);
        return true;
      } catch (e: any) {
        console.error('[useCreatorLesson] saveUnitLessons error', e);
        if (!args.silent) toast.error(e?.message || 'Failed to save unit');
        return false;
      } finally {
        if (!args.silent) setIsSaving(false);
      }
    },
    [hub, lessonId, qc],
  );

  const importLesson = useCallback(async (id: string): Promise<LibraryLesson | null> => {
    try {
      const lesson = await getLessonById(id);
      setLessonId(id);
      return lesson;
    } catch (e: any) {
      toast.error(e?.message || 'Failed to import lesson');
      return null;
    }
  }, []);

  return {
    lessonId,
    setLessonId,
    lesson: lessonQuery.data,
    isLoadingLesson: lessonQuery.isLoading,
    library: libraryQuery.data ?? [],
    isLoadingLibrary: libraryQuery.isLoading,
    refreshLibrary: () => qc.invalidateQueries({ queryKey: ['creator-library', hub] }),
    saveDraft,
    publish,
    silentSaveDraft,
    saveUnitLessons,
    isSaving,
    importLesson,
    lastQAReport,
  };
}
