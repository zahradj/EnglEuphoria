/**
 * useInterviewScorecard — single source of truth for the admin observation
 * panel in the Interview Arena.
 *
 * Owns:
 *  - 12-item rubric checklist
 *  - free-text notes
 *  - recording markers (timestamps the admin tagged as worth revisiting)
 *  - AI Recruitment Agent report
 *  - autosave to `interviews.scorecard` (jsonb) + `interviews.admin_notes`
 *  - decision actions: approve / reject (with conditional flag passthrough)
 *
 * Pulled out of the original AdminScorecard so the new tabbed sidebar and
 * any future surfaces (review history, replay) can share one contract.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { InterviewMeta } from '@/hooks/useInterviewRole';

export interface ChecklistItem {
  key: string;
  label: string;
  hint: string;
}

export const INTERVIEW_CHECKLIST: ChecklistItem[] = [
  { key: 'av_clear',         label: 'Clear A/V setup',         hint: 'Camera framed, lit, mic crisp, no echo' },
  { key: 'energy_warm',      label: 'Warm Euphoria energy',    hint: 'Smiles, encouragement, student-first pacing' },
  { key: 'english_fluent',   label: 'Fluent natural English',  hint: 'Pronunciation, grammar, intonation, naturalness' },
  { key: 'tech_confident',   label: 'Confident platform use',  hint: 'God Mode, slide control, hints, rewards' },
  { key: 'lesson_objective', label: 'States lesson objective', hint: 'Opens with a clear, age-appropriate goal' },
  { key: 'cefr_appropriate', label: 'CEFR-appropriate level',  hint: 'Language and tasks match the hub + level' },
  { key: 'scaffolding',      label: 'Good scaffolding',        hint: 'Models, guides, then releases practice' },
  { key: 'interaction',      label: 'Elicits student talk',    hint: 'Asks, waits, recasts — not a monologue' },
  { key: 'feedback',         label: 'Constructive feedback',   hint: 'Specific, kind, immediate correction' },
  { key: 'culturally_safe',  label: 'Culturally safe content', hint: 'Globally inclusive, age-appropriate' },
  { key: 'closure',          label: 'Strong lesson closure',   hint: 'Recap, quick check, next step' },
  { key: 'no_red_flags',     label: 'No red flags',            hint: 'No safeguarding, professionalism, or honesty concerns' },
];

export const INTERVIEW_QUESTIONS: Array<{ category: string; q: string }> = [
  { category: 'Warm-up',      q: 'Tell me about yourself in one minute.' },
  { category: 'Warm-up',      q: 'Why do you want to teach English at EnglEuphoria specifically?' },
  { category: 'Experience',   q: 'Walk me through your most successful ESL lesson and why it worked.' },
  { category: 'Experience',   q: 'Which CEFR levels have you taught the most, and how do you adapt your language?' },
  { category: 'Pedagogy',     q: 'A 6-year-old freezes and refuses to speak. What do you do in the next 60 seconds?' },
  { category: 'Pedagogy',     q: 'How do you balance accuracy correction with fluency and learner confidence?' },
  { category: 'Pedagogy',     q: 'Show me how you would introduce the present continuous to an A1 teen.' },
  { category: 'Classroom',    q: 'How do you keep a Playground (5–8 yrs) student engaged for a full 30-minute lesson?' },
  { category: 'Classroom',    q: 'A parent watches the lesson and interrupts repeatedly. How do you handle it?' },
  { category: 'Safeguarding', q: 'A young student says something that worries you. What is your next step?' },
  { category: 'Tech',         q: 'Your camera dies mid-lesson. Walk me through your recovery plan.' },
  { category: 'Culture',      q: 'How do you make sure your examples feel inclusive to a global classroom?' },
  { category: 'Closing',      q: 'Where do you want to be as a teacher in 12 months — and how can we help?' },
];

export interface AgentReport {
  verdict: 'approve' | 'reject' | 'needs_review';
  confidence: number;
  summary: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
}

export interface RecordingMarker {
  t: string;             // ISO timestamp captured at click time
  label: string;         // short admin-typed label
  elapsed_ms?: number;   // optional offset from interview start
}

export type Decision = 'approve' | 'reject' | 'conditional';

export function useInterviewScorecard(interview: InterviewMeta, startedAt?: string | null) {
  const navigate = useNavigate();

  const initial = (interview.scorecard ?? {}) as {
    checklist?: Record<string, boolean>;
    notes?: string;
    report?: AgentReport;
    recording_markers?: RecordingMarker[];
  };

  const [checks, setChecks] = useState<Record<string, boolean>>(initial.checklist ?? {});
  const [notes, setNotes] = useState(initial.notes ?? interview.admin_notes ?? '');
  const [markers, setMarkers] = useState<RecordingMarker[]>(initial.recording_markers ?? []);
  const [report, setReport] = useState<AgentReport | null>(initial.report ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [deciding, setDeciding] = useState<Decision | null>(null);

  // Debounced autosave (800ms)
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void supabase
        .from('interviews')
        .update({
          scorecard: {
            checklist: checks,
            notes,
            report: report ?? null,
            recording_markers: markers,
          },
          admin_notes: notes,
        })
        .eq('id', interview.id);
    }, 800);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [checks, notes, markers, report, interview.id]);

  const passed = useMemo(
    () => INTERVIEW_CHECKLIST.filter((c) => checks[c.key]).length,
    [checks],
  );

  const addMarker = useCallback((label: string) => {
    const now = new Date();
    const elapsed_ms = startedAt ? now.getTime() - new Date(startedAt).getTime() : undefined;
    setMarkers((prev) => [
      ...prev,
      { t: now.toISOString(), label: label.trim() || 'Moment', elapsed_ms },
    ]);
  }, [startedAt]);

  const removeMarker = useCallback((index: number) => {
    setMarkers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const generateReport = useCallback(async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('recruitment-agent', {
        body: {
          action: 'evaluate_interview',
          applicationId: interview.application_id,
          interviewId: interview.id,
          checklist: checks,
          checklistLabels: INTERVIEW_CHECKLIST.reduce<Record<string, string>>((acc, c) => {
            acc[c.key] = c.label;
            return acc;
          }, {}),
          notes,
        },
      });
      if (error) throw error;
      const r: AgentReport | undefined = data?.report;
      if (!r) throw new Error('Agent returned no report.');
      setReport(r);
      toast.success(
        r.verdict === 'approve'
          ? '🤖 AI suggests APPROVE — confirm below.'
          : r.verdict === 'reject'
            ? '🤖 AI suggests DECLINE — confirm below.'
            : '🤖 AI flagged this for human review.',
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'Failed to generate AI report.');
    } finally {
      setSubmitting(false);
    }
  }, [checks, notes, interview.application_id, interview.id]);

  const decide = useCallback(async (verdict: Decision) => {
    setDeciding(verdict);
    try {
      const decided_at = new Date().toISOString();
      const scorecard = {
        checklist: checks,
        notes,
        report,
        recording_markers: markers,
        decided_at,
        admin_verdict: verdict,
      };

      if (verdict === 'approve' || verdict === 'conditional') {
        const { error } = await supabase.functions.invoke('approve-teacher', {
          body: {
            applicationId: interview.application_id,
            email: interview.teacher_email,
            firstName: interview.teacher_name?.split(' ')[0],
            lastName: interview.teacher_name?.split(' ').slice(1).join(' '),
            conditional: verdict === 'conditional',
          },
        });
        if (error) throw error;
        await supabase.from('interviews').update({
          status: 'passed',
          admin_notes: notes,
          scorecard,
        }).eq('id', interview.id);
        toast.success(
          verdict === 'conditional'
            ? 'Approved with conditions — invitation email sent.'
            : 'Approved — invitation email sent to the teacher.',
        );
      } else {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'post-interview-rejection',
            recipientEmail: interview.teacher_email,
            idempotencyKey: `interview-reject-${interview.id}`,
            templateData: { name: interview.teacher_name ?? 'Applicant' },
          },
        });
        await Promise.all([
          supabase.from('interviews').update({
            status: 'failed',
            admin_notes: notes,
            scorecard,
          }).eq('id', interview.id),
          supabase.from('teacher_applications').update({
            status: 'rejected', current_stage: 'rejected',
          }).eq('id', interview.application_id),
        ]);
        toast.success('Rejection email sent.');
      }
      setTimeout(() => navigate('/super-admin'), 1200);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? `Failed to ${verdict}.`);
    } finally {
      setDeciding(null);
    }
  }, [checks, notes, report, markers, interview.application_id, interview.id, interview.teacher_email, interview.teacher_name, navigate]);

  return {
    // state
    checks,
    notes,
    markers,
    report,
    passed,
    total: INTERVIEW_CHECKLIST.length,
    submitting,
    deciding,
    // setters
    setChecks,
    setNotes,
    addMarker,
    removeMarker,
    // actions
    generateReport,
    decide,
  };
}
