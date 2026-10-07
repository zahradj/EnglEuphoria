import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { IncidentFlag } from './incidentFlags';
import { getClassroomHubTheme, type ClassroomHubKey } from '@/components/teacher/classroom/hubClassroomTheme';
import { endLesson } from '@/services/endLesson';
import { evaluateAndAssignExtraPractice } from '@/lib/remediation/evaluateAndAssignExtraPractice';
import { advanceCurriculumProgress, fetchLevelMap } from '@/services/activeCoreLessonResolver';
import { toLevelMapHub } from '@/components/teacher/classroom/UnitKnowledgeChecklist';
import { buildLearningPlan, UNITS_PER_LEVEL, type PlanUnitInfo } from '@/lib/learningPlan';
import { HUB_SKILL_PROFILE, normalizeSkillHub, scoreToCefr } from '@/hooks/useStudentSkills';
import { asPayoutCurrency, formatPay } from '@/lib/teacherPay';

/**
 * Session report — 3 short steps (redesigned from one long form):
 *   1. The class: auto-filled summary, how far the lesson got (decides
 *      whether the student moves on or repeats), anything that got in the way.
 *   2. How the student did: one tap per skill (😕 / 🙂 / 🤩) + "Great at" /
 *      "Practice more" sentences.
 *   3. Messages: a family message drafted from the taps (child + parents see
 *      it), a private note to parents (Playground only), a note for teachers.
 * Follows the platform's light/dark mode (semantic Tailwind tokens) and the
 * hub's brand colour. What gets saved, and where, is unchanged from the old
 * form (feedback row, incident report, skills, end_lesson pay, next-lesson
 * advance) so every reader keeps working.
 */

const REPORT_DEADLINE_MS = 24 * 60 * 60 * 1000;

// Trial lesson assessment — what the family reads first about their level.
const TRIAL_ENGLISH = [
  'Knows a few words',
  'Understands simple questions',
  'Speaks in short sentences',
  'Speaks with confidence',
];
const TRIAL_CONFIDENCE = ['Shy at first, warmed up', 'Happy and chatty', 'Needs lots of encouragement', 'Very confident'];
const TRIAL_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Languages the emailed report can be written in (matches users.preferred_language).
const REPORT_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'it', label: 'Italiano' },
];

type Progress = 'finished' | 'most' | 'early';
type Level = 'low' | 'mid' | 'good';

const HUB_ACCENT: Record<'playground' | 'academy' | 'professional', string> = {
  playground: '#FE6A2F',
  academy: '#7C3AED',
  professional: '#059669',
};

const ISSUES: { key: string; label: string; flag: IncidentFlag }[] = [
  { key: 'late', label: '⏰ Joined late', flag: 'student_late' },
  { key: 'left', label: '🚪 Left early', flag: 'student_left_early' },
  { key: 'audio', label: '🎙️ Audio / mic', flag: 'audio_issue' },
  { key: 'internet', label: '📶 Internet', flag: 'connection_issue' },
  { key: 'camera', label: '📷 Camera off', flag: 'video_issue' },
  { key: 'tired', label: '😴 Tired / distracted', flag: 'non_tech_issue' },
  { key: 'sick', label: '🤒 Sick', flag: 'non_tech_issue' },
  { key: 'platform', label: '🧩 Platform problem', flag: 'other' },
];

const FACES: { level: Level; emoji: string; label: string; score: number }[] = [
  { level: 'low', emoji: '😕', label: 'Needs help', score: 3 },
  { level: 'mid', emoji: '🙂', label: 'Good', score: 6 },
  { level: 'good', emoji: '🤩', label: 'Great', score: 9 },
];

const SENTENCES: Record<'playground' | 'academy' | 'professional', { great: string[]; more: string[] }> = {
  playground: {
    great: [
      'Learned the new words from today’s lesson.',
      'Said the new words clearly, with good pronunciation.',
      'Answered questions with full sentences.',
      'Followed my instructions without help.',
      'Stayed happy and joined in all the games.',
    ],
    more: [
      'Practise today’s new words at home.',
      'Ask questions on their own.',
      'Speak a little louder and with more confidence.',
      'Stay focused until the end of the class.',
    ],
  },
  academy: {
    great: [
      'Used today’s grammar correctly when speaking.',
      'Used new vocabulary from the lesson naturally.',
      'Asked and answered questions confidently.',
      'Understood the listening tasks well.',
    ],
    more: [
      'Review today’s grammar point with a few more examples.',
      'Use the new words in their own sentences.',
      'Give longer answers with “because” and “and then”.',
      'Check word endings (-s, -ed) when speaking.',
    ],
  },
  professional: {
    great: [
      'Communicated ideas clearly and fluently.',
      'Used relevant professional vocabulary.',
      'Asked good follow-up questions.',
      'Spoke with natural, confident intonation.',
    ],
    more: [
      'Review the grammar that caused mistakes today.',
      'Use more of today’s vocabulary in real situations.',
      'Use fewer filler words like “umm” and “like”.',
      'Slow down slightly when speaking under pressure.',
    ],
  },
};

export interface WrapUpClassSummary {
  minutes?: number | null;
  stars?: number | null;
  pagesReached?: number | null;
  totalPages?: number | null;
}

interface LessonWrapUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Curriculum lesson reference — used for feedback/completion records. */
  lessonId?: string;
  /** class_bookings.id — the actual booking this session belongs to. Required
   *  to close the booking and credit the teacher; distinct from lessonId. */
  bookingId?: string;
  studentId?: string;
  teacherId?: string;
  sharedNotes?: string;
  hubType?: ClassroomHubKey | 'professional' | string;
  /** True for the student's first-ever (trial) booking. */
  isTrial?: boolean;
  /**
   * Student's resolved CEFR level for this trial lesson. When set alongside
   * `isTrial`, wrap-up submission writes a `placement_results` row so the
   * student's NEXT booking resolves through the Master Library at the right
   * level instead of falling back to the trial slide deck again.
   */
  trialCefr?: string | null;
  /** Shown in the header and used in the drafted family message. */
  studentName?: string;
  lessonTitle?: string;
  /** Live classroom numbers for step 1's auto-filled summary (classroom only). */
  classSummary?: WrapUpClassSummary;
}

interface Draft {
  step: 1 | 2 | 3;
  progress: Progress;
  /** Required when the lesson stopped early: where the next class picks up. */
  resumeFrom: string;
  issues: string[];
  skills: Record<string, Level>;
  great: string[];
  more: string[];
  extraGreat: string;
  extraMore: string;
  family: string;
  familyEdited: boolean;
  parentNote: string;
  teacherNote: string;
  homeworkOn: boolean;
  homework: string;
  /** Trial lesson assessment + recommended plan. */
  trialLevel: string;
  trialEnglish: string;
  trialConfidence: string;
  trialGoal: string;
  trialLessons: number;
  /** Unit the plan starts at; 0 = the one saved from the in-class level check. */
  trialStartUnit: number;
  /** null = not touched yet: defaults to ON when the lesson was an email invite. */
  emailOn: boolean | null;
  /** null = the student's saved language (falls back to English). */
  emailLang: string | null;
}

const emptyDraft = (): Draft => ({
  step: 1, progress: 'finished', resumeFrom: '', issues: [], skills: {}, great: [], more: [], extraGreat: '', extraMore: '',
  family: '', familyEdited: false, parentNote: '', teacherNote: '', homeworkOn: false, homework: '',
  trialLevel: '', trialEnglish: '', trialConfidence: '', trialGoal: '', trialLessons: 0, trialStartUnit: 0, emailOn: null, emailLang: null,
});

const draftKey = (bookingId?: string) => (bookingId ? `wrapup-draft:${bookingId}` : null);

export const LessonWrapUpDialog: React.FC<LessonWrapUpDialogProps> = ({
  open,
  onOpenChange,
  lessonId,
  bookingId,
  studentId,
  teacherId,
  sharedNotes = '',
  hubType = 'academy',
  isTrial = false,
  trialCefr = null,
  studentName,
  lessonTitle,
  classSummary,
}) => {
  const theme = getClassroomHubTheme(hubType);
  const skillHub = normalizeSkillHub(hubType);
  const skillProfile = HUB_SKILL_PROFILE[skillHub];
  const SKILL_FIELDS = Object.entries(skillProfile.labels).map(([key, label]) => ({ key, label }));
  const accent = HUB_ACCENT[skillHub];
  const isPlayground = skillHub === 'playground';
  const sentences = SENTENCES[skillHub];
  const { toast } = useToast();

  const [d, setD] = useState<Draft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [bookingEndedAt, setBookingEndedAt] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [studentFeedback, setStudentFeedback] = useState<boolean | null>(null);
  const [resolvedName, setResolvedName] = useState<string | null>(studentName ?? null);
  const [done, setDone] = useState<null | { lines: [string, string][] }>(null);
  // Looked up from the booking itself so the report works the same from the
  // classroom and from the dashboard list (which doesn't pass isTrial).
  const [bookingMeta, setBookingMeta] = useState<{ isTrial: boolean; inviteEmail: string | null; language: string | null }>({ isTrial: false, inviteEmail: null, language: null });
  const isTrialLesson = isTrial || bookingMeta.isTrial;

  const name = resolvedName || 'The student';
  const set = useCallback(<K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v })), []);

  // Restore a saved draft ("Fill in later") when the report opens.
  useEffect(() => {
    if (!open) return;
    setDone(null);
    const key = draftKey(bookingId);
    let restored: Draft | null = null;
    if (key) {
      try { const raw = localStorage.getItem(key); if (raw) restored = { ...emptyDraft(), ...JSON.parse(raw) }; } catch { /* noop */ }
    }
    setD(restored ?? emptyDraft());
  }, [open, bookingId]);

  // Keep the draft saved while typing/tapping.
  useEffect(() => {
    if (!open || done) return;
    const key = draftKey(bookingId);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(d)); } catch { /* noop */ }
  }, [d, open, bookingId, done]);

  // Trial or not, and the email the teacher invited the student with (if any).
  useEffect(() => {
    if (!open || !bookingId) return;
    let cancelled = false;
    (async () => {
      const [{ data: b }, checkRes, { data: pref }] = await Promise.all([
        supabase.from('class_bookings').select('booking_type').eq('id', bookingId).maybeSingle(),
        // Asked of the server: only lessons created with "Invite a Student" can be emailed.
        supabase.functions.invoke('send-lesson-report', { body: { action: 'check', booking_id: bookingId } })
          .catch(() => ({ data: null, error: null })),
        studentId
          ? supabase.from('users').select('preferred_language').eq('id', studentId).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (cancelled) return;
      setBookingMeta({
        isTrial: String((b as any)?.booking_type ?? '').toLowerCase() === 'trial',
        inviteEmail: ((checkRes as any)?.data?.can_email ? (checkRes as any).data.to : null) as string | null,
        language: (pref as any)?.preferred_language ?? null,
      });
    })();
    return () => { cancelled = true; };
  }, [open, bookingId, studentId]);

  // Booking end time → 24h payment countdown.
  useEffect(() => {
    if (!open || !bookingId) return;
    setNow(Date.now());
    supabase.from('class_bookings').select('ended_at').eq('id', bookingId).maybeSingle()
      .then(({ data }) => setBookingEndedAt(data?.ended_at ?? null));
  }, [open, bookingId]);
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [open]);

  // The student's own 👍/👎 for this class (if given) + their name.
  useEffect(() => {
    if (!open) return;
    if (bookingId) {
      supabase.from('post_class_feedback').select('thumbs_up').eq('lesson_id', bookingId)
        .eq('submitted_by_role', 'student').limit(1).maybeSingle()
        .then(({ data }) => setStudentFeedback(typeof (data as any)?.thumbs_up === 'boolean' ? (data as any).thumbs_up : null));
    }
    if (!studentName && studentId) {
      supabase.from('users').select('full_name').eq('id', studentId).maybeSingle()
        .then(({ data }) => setResolvedName((data as any)?.full_name ?? null));
    } else {
      setResolvedName(studentName ?? null);
    }
  }, [open, bookingId, studentId, studentName]);

  const msRemaining = bookingEndedAt ? REPORT_DEADLINE_MS - (now - new Date(bookingEndedAt).getTime()) : null;
  const isOverdue = msRemaining !== null && msRemaining <= 0;
  const countdown = msRemaining === null
    ? '24 h to submit'
    : isOverdue
      ? 'Past 24 h — not paid'
      : `${Math.floor(msRemaining / 3_600_000)} h ${Math.floor((msRemaining % 3_600_000) / 60_000)} min left`;

  const greatList = useMemo(() => [...d.great, ...(d.extraGreat.trim() ? [d.extraGreat.trim()] : [])], [d.great, d.extraGreat]);
  const moreList = useMemo(() => [...d.more, ...(d.extraMore.trim() ? [d.extraMore.trim()] : [])], [d.more, d.extraMore]);

  const ratedLevels = Object.values(d.skills);
  const overall: Level | null = ratedLevels.length
    ? (() => {
      const avg = ratedLevels.map((l) => ({ low: 0, mid: 1, good: 2 })[l]).reduce((a, b) => a + b, 0) / ratedLevels.length;
      return avg >= 1.5 ? 'good' : avg >= 0.75 ? 'mid' : 'low';
    })()
    : null;

  // The trial's starting level: set in the classroom, else picked in this report.
  const trialLevel = trialCefr || d.trialLevel || '';

  // Learning plan for the family: the level's units + the start unit the teacher saved in class.
  const [planUnits, setPlanUnits] = useState<PlanUnitInfo[]>([]);
  const [savedStartUnit, setSavedStartUnit] = useState(1);
  useEffect(() => {
    if (!open || !isTrialLesson || !trialLevel) return;
    let cancelled = false;
    fetchLevelMap(toLevelMapHub(hubType), trialLevel).then((map) => {
      if (!cancelled) setPlanUnits(map.map((u) => ({ unitNumber: u.unitNumber, unitTitle: u.unitTitle, lessonCount: u.lessons.length })));
    });
    return () => { cancelled = true; };
  }, [open, isTrialLesson, trialLevel, hubType]);
  useEffect(() => {
    if (!open || !isTrialLesson || !studentId) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any).from('student_prior_knowledge').select('start_unit').eq('student_id', studentId).maybeSingle();
      if (!cancelled && data?.start_unit) setSavedStartUnit(Number(data.start_unit) || 1);
    })();
    return () => { cancelled = true; };
  }, [open, isTrialLesson, studentId]);
  const planStartUnit = d.trialStartUnit || savedStartUnit;
  const learningPlan = useMemo(
    () => (isTrialLesson
      ? buildLearningPlan({ level: trialLevel, startUnit: planStartUnit, lessonsPerWeek: d.trialLessons, units: planUnits })
      : null),
    [isTrialLesson, trialLevel, planStartUnit, d.trialLessons, planUnits],
  );

  // Family message drafted from the taps until the teacher edits it.
  const draftedFamily = useMemo(() => {
    const topic = lessonTitle ? `“${lessonTitle}”` : 'today’s lesson';
    const opener = isTrialLesson
      ? `Thank you for joining ${name}'s trial lesson! It was lovely to meet ${name}${trialLevel ? ` — we'll start at level ${trialLevel}` : ''}.`
      : {
      finished: `${name} did a great job today! We worked on ${topic}.`,
      most: `Good class today! ${name} worked on ${topic}.`,
      early: `Today we started ${topic}. We'll carry on with it next class.`,
    }[d.progress];
    let msg = opener;
    if (greatList.length) msg += `\n\n⭐ Great at:\n${greatList.map((x) => `• ${x}`).join('\n')}`;
    if (moreList.length) msg += `\n\n💪 Let's practise:\n${moreList.map((x) => `• ${x}`).join('\n')}`;
    if (d.homeworkOn && d.homework.trim()) msg += `\n\n📚 Homework: ${d.homework.trim()}`;
    return msg;
  }, [name, lessonTitle, d.progress, greatList, moreList, d.homeworkOn, d.homework, isTrialLesson, trialLevel]);
  const familyText = d.familyEdited ? d.family : draftedFamily;
  // Emailing is only for lessons the teacher created via "Invite a Student".
  const canEmail = !!bookingMeta.inviteEmail;
  const emailOn = canEmail && (d.emailOn ?? true);
  const emailLang = d.emailLang ?? (REPORT_LANGUAGES.some((l) => l.code === bookingMeta.language) ? bookingMeta.language! : 'en');

  const toggleIn = (k: 'issues' | 'great' | 'more', v: string) =>
    setD((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const handleSubmit = async () => {
    if (!teacherId) return;
    setSubmitting(true);
    const outcome: 'completed' | 'not_completed' = d.progress === 'early' ? 'not_completed' : 'completed';
    const issueDefs = ISSUES.filter((i) => d.issues.includes(i.key));
    const incidentFlags = Array.from(new Set(issueDefs.map((i) => i.flag)));
    if (d.progress === 'early' && !incidentFlags.includes('cut_short')) incidentFlags.push('cut_short');
    const skillScores = Object.fromEntries(
      Object.entries(d.skills).map(([k, lvl]) => [k, FACES.find((f) => f.level === lvl)!.score]),
    );
    const rating = overall ? { low: 2, mid: 4, good: 5 }[overall] : null;
    const homework = d.homeworkOn && d.homework.trim() ? d.homework.trim() : null;
    const lines: [string, string][] = [];
    const resumeFrom = d.progress === 'early' ? d.resumeFrom.trim() : '';
    if (d.progress === 'early' && !resumeFrom) {
      set('step', 1);
      setSubmitting(false);
      toast({ title: 'Where should the next class start?', description: 'The lesson stopped early — write where to pick up next time.', variant: 'destructive' });
      return;
    }

    try {
      if (lessonId) {
        const { error: incidentErr } = await supabase.from('lesson_incident_reports').upsert({
          room_id: lessonId,
          reporter_id: teacherId,
          reporter_role: 'teacher',
          outcome,
          flags: incidentFlags,
          notes: [issueDefs.map((i) => i.label).join(', '), resumeFrom && `Continue from: ${resumeFrom}`, d.teacherNote.trim()].filter(Boolean).join(' — ') || null,
        }, { onConflict: 'room_id,reporter_id' });
        if (incidentErr) console.error('[LessonWrapUp] lesson_incident_reports upsert failed:', incidentErr);
        supabase.functions.invoke('classroom-incident-verdict', { body: { room_id: lessonId } })
          .catch((e) => console.warn('verdict invoke failed', e));
      }

      // Keyed by the BOOKING id: every reader (teacher dashboard, student
      // lesson history, parent card, FeedbackReportDialog) looks it up that way.
      // quick_notes = the family message and areas_for_improvement = the
      // practice points, so existing report viewers show the new report.
      const { error: feedbackErr } = await supabase.from('lesson_feedback_submissions').insert({
        lesson_id: bookingId || lessonId || null,
        teacher_id: teacherId,
        student_id: studentId || null,
        feedback_content: {
          version: 2,
          progress: d.progress,
          outcome,
          resume_from: resumeFrom || undefined,
          issues: issueDefs.map((i) => i.label),
          incident_flags: incidentFlags,
          skill_levels: d.skills,
          skill_scores: Object.keys(skillScores).length ? skillScores : undefined,
          strengths: greatList,
          areas_for_improvement: moreList,
          quick_notes: familyText.trim(),
          teacher_note: d.teacherNote.trim() || undefined,
          trial: isTrialLesson ? {
            level: trialLevel || undefined,
            english_today: d.trialEnglish || undefined,
            confidence: d.trialConfidence || undefined,
            goal: d.trialGoal.trim() || undefined,
            lessons_per_week: d.trialLessons || undefined,
            plan: learningPlan ?? undefined,
          } : undefined,
        } as any,
        student_performance_rating: rating,
        lesson_objectives_met: outcome === 'completed',
        homework_assigned: homework,
        // Private note to parents — Playground only.
        parent_communication_notes: isPlayground && d.parentNote.trim() ? d.parentNote.trim() : null,
      });
      if (feedbackErr) {
        console.error('[LessonWrapUp] lesson_feedback_submissions insert failed:', feedbackErr);
        throw feedbackErr;
      }
      lines.push(['💌', `Report saved${homework ? ' with homework' : ''} — ${name}'s family can see it`]);
      if (isPlayground && d.parentNote.trim()) lines.push(['🔒', 'Private note saved for the parents only']);

      if (lessonId && studentId && sharedNotes) {
        const { error: completionErr } = await supabase.from('lesson_completions').upsert({
          lesson_id: lessonId,
          student_id: studentId,
          shared_notes: sharedNotes,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'lesson_id,student_id' });
        if (completionErr) console.error('[LessonWrapUp] lesson_completions upsert failed:', completionErr);
      }

      // Skill Radar: only the skills the teacher actually rated.
      if (studentId && Object.keys(skillScores).length) {
        for (const [key, score] of Object.entries(skillScores)) {
          const { error: skillErr } = await supabase.from('student_skills').upsert({
            student_id: studentId,
            skill_name: key,
            current_score: score,
            cefr_equivalent: scoreToCefr(score),
            next_focus: skillProfile.nextFocus[key],
            updated_at: new Date().toISOString(),
          }, { onConflict: 'student_id,skill_name' });
          if (skillErr) console.error(`[LessonWrapUp] student_skills upsert failed (${key}):`, skillErr);
        }
        lines.push(['📊', `Skill Radar updated for ${name}`]);
      }

      if (studentId && moreList.length > 0) {
        const { data: profile } = await supabase.from('student_profiles').select('mistake_history').eq('user_id', studentId).single();
        const currentHistory = Array.isArray(profile?.mistake_history) ? profile.mistake_history : [];
        const newEntries = moreList.map((area) => ({ error_type: area, timestamp: new Date().toISOString(), source: 'teacher_feedback' }));
        const { error: mistakeErr } = await supabase.from('student_profiles')
          .update({ mistake_history: [...currentHistory, ...newEntries].slice(-50) }).eq('user_id', studentId);
        if (mistakeErr) console.error('[LessonWrapUp] student_profiles.mistake_history update failed:', mistakeErr);
      }

      // Close the booking + pay (end_lesson). Past the 24h window the report
      // is still saved and the booking closed, but not paid.
      if (bookingId) {
        const overdue = bookingEndedAt ? Date.now() - new Date(bookingEndedAt).getTime() > REPORT_DEADLINE_MS : false;
        if (!overdue) {
          try {
            const res = await endLesson(bookingId);
            if (res?.teacher_amount != null) {
              lines.unshift(['💶', `${formatPay(Number(res.teacher_amount), asPayoutCurrency(res.currency))} added to your earnings`]);
            } else {
              lines.unshift(['💶', 'Lesson closed for payment']);
            }
          } catch (endErr: any) {
            console.error('end_lesson failed:', endErr);
            toast({
              title: 'Report saved, but payment failed',
              description: endErr?.message ?? 'Could not finalize this lesson for payment. Contact support if this keeps happening.',
              variant: 'destructive',
            });
          }
        } else {
          const { error: bookingErr } = await supabase.from('class_bookings')
            .update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', bookingId);
          if (bookingErr) console.error('[LessonWrapUp] class_bookings close (overdue) failed:', bookingErr);
          lines.unshift(['⏱', 'Submitted after 24 h — saved, but this session is not paid']);
        }

        try { await supabase.functions.invoke('post-class-sync', { body: { booking_id: bookingId } }); }
        catch (syncErr) { console.error('post-class-sync failed (non-blocking):', syncErr); }

        if (studentId) void evaluateAndAssignExtraPractice({ bookingId, studentId, hub: hubType as any });

        if (isTrialLesson && trialLevel && studentId) {
          // Saves the level to the student's profile, placement and learning
          // path (skipped if the teacher already set it with the level picker).
          try {
            const { error } = await (supabase as any).rpc('set_trial_level', {
              p_booking_id: bookingId, p_cefr: trialLevel, p_only_if_unset: true,
            });
            if (error) throw error;
          } catch (e) { console.warn('[LessonWrapUpDialog] trial handoff failed', e); }
        }

        // Finished / most of it → next lesson; stopped early → repeat.
        if (outcome === 'completed' && studentId && lessonId) {
          try {
            const next = await advanceCurriculumProgress(studentId, lessonId);
            lines.splice(1, 0, ['➡️', next ? 'Next class moves on to the next lesson' : 'Progress saved · the next lesson at this level opens as soon as it is added to the library']);
          } catch (e) { console.warn('[LessonWrapUpDialog] advanceCurriculumProgress failed', e); }
        } else if (outcome === 'not_completed') {
          lines.splice(1, 0, ['🔁', `Next class stays on this lesson, starting from: ${resumeFrom}`]);
        }
      }

      // Optional: email the report to the student (the address the teacher
      // invited them with). Never blocks or fails the report itself.
      if (emailOn && bookingId) {
        try {
          const { data: mail, error: mailErr } = await supabase.functions.invoke('send-lesson-report', {
            body: {
              booking_id: bookingId,
              report: {
                language: emailLang,
                studentName: name,
                lessonTitle: lessonTitle ?? '',
                progress: d.progress,
                skills: Object.entries(d.skills).map(([k, lvl]) => ({ label: (skillProfile.labels as Record<string, string>)[k] ?? k, level: lvl })),
                message: familyText.trim(),
                homework: homework ?? '',
                trial: isTrialLesson ? {
                  level: trialLevel, englishToday: d.trialEnglish, confidence: d.trialConfidence,
                  lessonsPerWeek: d.trialLessons || undefined, goal: d.trialGoal.trim(),
                  plan: learningPlan ?? undefined,
                } : undefined,
              },
            },
          });
          if (mailErr) throw mailErr;
          const langLabel = REPORT_LANGUAGES.find((l) => l.code === mail?.language)?.label;
          lines.push(mail?.sent
            ? ['✉️', `${isTrialLesson ? 'Trial report' : 'Report'} emailed to ${mail.to}${langLabel ? ` in ${langLabel}` : ''}${emailLang !== 'en' && !mail.translated ? ' (translation unavailable — sent in English)' : ''}`]
            : ['⚠️', `Report saved, but the email was not sent${mail?.reason ? ` — ${mail.reason}` : ''}`]);
        } catch (mailEx: any) {
          console.warn('[LessonWrapUp] report email failed', mailEx);
          lines.push(['⚠️', 'Report saved, but the email could not be sent']);
        }
      }

      if (issueDefs.length) lines.push(['🛟', `Flagged: ${issueDefs.map((i) => i.label.replace(/^\S+\s/, '')).join(', ')}`]);
      const key = draftKey(bookingId);
      if (key) { try { localStorage.removeItem(key); } catch { /* noop */ } }
      setDone({ lines });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast({ title: 'Report not saved', description: (err as any)?.message ?? 'Failed to save the report. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const fillLater = () => {
    toast({ title: 'Saved as a draft', description: 'Your answers will be here when you come back (within 24 h to be paid).' });
    onOpenChange(false);
  };

  // --- UI helpers -----------------------------------------------------------
  const pressedStyle = (on: boolean): React.CSSProperties =>
    on ? { borderColor: accent, background: `${accent}1A` } : {};
  const Chip = ({ on, onClick, children, tone }: { on: boolean; onClick: () => void; children: React.ReactNode; tone?: 'good' | 'more' | 'issue' | 'ok' }) => {
    const bg = tone === 'good' || tone === 'ok' ? '#059669' : tone === 'more' ? '#D97706' : tone === 'issue' ? '#E11D48' : accent;
    return (
      <button type="button" onClick={onClick} aria-pressed={on}
        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${on ? 'text-white border-transparent' : 'bg-card text-foreground border-border hover:border-foreground/30'}`}
        style={on ? { background: bg } : undefined}>
        {children}
      </button>
    );
  };
  const SentenceChip = ({ on, onClick, text, tone }: { on: boolean; onClick: () => void; text: string; tone: 'good' | 'more' }) => (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${on ? 'text-white border-transparent' : 'bg-card text-foreground border-border hover:border-foreground/30'}`}
      style={on ? { background: tone === 'good' ? '#059669' : '#D97706' } : undefined}>
      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border-2 ${on ? 'border-white bg-white' : 'border-border'}`}>
        {on && <span className="h-2 w-2 rounded-sm" style={{ background: tone === 'good' ? '#059669' : '#D97706' }} />}
      </span>
      {text}
    </button>
  );

  const step = d.step;
  const progressChoices: { key: Progress; title: string; pct: string; sub: string }[] = [
    { key: 'finished', title: '✅ Finished', pct: 'The whole lesson', sub: 'Next class: the next lesson' },
    { key: 'most', title: '🟡 Most of it', pct: 'More than 50%', sub: 'Next class: the next lesson' },
    { key: 'early', title: '🔁 Stopped early', pct: 'Less than 50%', sub: 'Next class continues this lesson' },
  ];
  const overallPill = overall ? { good: ['Great 🤩', '#059669'], mid: ['Good 🙂', '#2563EB'], low: ['Needs help 😕', '#D97706'] }[overall] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 overflow-x-hidden">
        <DialogTitle className="sr-only">Session report</DialogTitle>

        {/* Header in the hub's brand colours */}
        <div className="px-6 pt-5 pb-4 text-white" style={{ background: theme.hexGradient }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] opacity-90">{isTrialLesson ? 'Trial lesson report' : 'Session report'}</div>
              <h2 className="mt-0.5 text-xl font-extrabold leading-snug">{lessonTitle || 'How did today’s class go?'}</h2>
              <div className="text-sm opacity-95">{resolvedName ?? ''}</div>
            </div>
            <span className="whitespace-nowrap rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold" title="Reports submitted within 24 hours are paid">
              ⏱ {countdown}
            </span>
          </div>
          {!done && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([isTrialLesson ? 'The trial' : 'The class', 'How they did', isTrialLesson ? 'Plan & message' : 'Messages'] as const).map((label, i) => {
                const n = (i + 1) as 1 | 2 | 3;
                return (
                  <button key={label} type="button" onClick={() => set('step', n)} className={`grid gap-1 text-left text-xs font-extrabold ${n === step ? 'text-white' : 'text-white/75'}`}>
                    <span className={`h-1.5 rounded-full ${n <= step ? 'bg-white' : 'bg-white/30'}`} />
                    {n} · {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {done ? (
          <div className="grid justify-items-center gap-4 px-6 py-8 text-center">
            <div className="text-5xl">🎉</div>
            <h3 className="text-xl font-extrabold">Report sent</h3>
            <div className="grid w-full max-w-md gap-2 text-left">
              {done.lines.map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5 text-sm"><span>{icon}</span><span>{text}</span></div>
              ))}
            </div>
            <button type="button" onClick={() => onOpenChange(false)} className={`rounded-full px-6 py-2.5 text-sm font-extrabold ${theme.buttonPrimary}`}>Close</button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 px-6 py-5">
              {step === 1 && (
                <>
                  {(classSummary || studentFeedback !== null) && (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Filled in from the classroom</div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {classSummary?.minutes != null && <Tile v={`${classSummary.minutes} min`} l="Class time" accent={accent} />}
                        {classSummary?.stars != null && <Tile v={`⭐ ${classSummary.stars}`} l="Stars given" accent={accent} />}
                        {classSummary?.pagesReached != null && classSummary?.totalPages ? <Tile v={`${classSummary.pagesReached} / ${classSummary.totalPages}`} l="Pages reached" accent={accent} /> : null}
                        {studentFeedback !== null && <Tile v={studentFeedback ? '👍' : '👎'} l="Student’s feedback" accent={accent} />}
                      </div>
                    </div>
                  )}

                  <section className="grid gap-2">
                    <h3 className="text-base font-extrabold">How far did you get?</h3>
                    <p className="-mt-1 text-xs text-muted-foreground">This decides the student’s next class.</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {progressChoices.map((c) => (
                        <button key={c.key} type="button" onClick={() => set('progress', c.key)} aria-pressed={d.progress === c.key}
                          className="grid gap-0.5 rounded-2xl border-2 border-border bg-card p-3 text-left transition" style={pressedStyle(d.progress === c.key)}>
                          <span className="text-sm font-extrabold">{c.title}</span>
                          <span className="text-xs font-extrabold" style={{ color: accent }}>{c.pct}</span>
                          <span className="text-xs text-muted-foreground">{c.sub}</span>
                        </button>
                      ))}
                    </div>
                    {d.progress === 'early' && (
                      <div className="mt-1 grid gap-2 rounded-2xl border-2 p-3" style={{ borderColor: accent, background: `${accent}0F` }}>
                        <label htmlFor="wrapup-resume" className="text-sm font-extrabold">
                          Where should the next class start? <span className="text-rose-600">*</span>
                        </label>
                        <p className="-mt-1 text-xs text-muted-foreground">
                          The next class stays on this lesson. Name the section or page so it doesn’t restart from the beginning.
                        </p>
                        <Input id="wrapup-resume" value={d.resumeFrom} onChange={(e) => set('resumeFrom', e.target.value)}
                          placeholder="e.g. Page 9 — the “Rooms” song, then the matching game" />
                        {classSummary?.pagesReached != null && classSummary?.totalPages ? (
                          <button type="button" onClick={() => set('resumeFrom', `Page ${Math.min(classSummary.pagesReached! + 1, classSummary.totalPages!)} of ${classSummary.totalPages}`)}
                            className="justify-self-start rounded-full bg-muted px-2.5 py-1 text-xs font-bold">
                            + Page {Math.min(classSummary.pagesReached + 1, classSummary.totalPages)} (next after where you stopped)
                          </button>
                        ) : null}
                      </div>
                    )}
                  </section>

                  <section className="grid gap-2">
                    <h3 className="text-base font-extrabold">Anything get in the way?</h3>
                    <div className="flex flex-wrap gap-2">
                      <Chip tone="ok" on={d.issues.length === 0} onClick={() => set('issues', [])}>👌 All good</Chip>
                      {ISSUES.map((i) => (
                        <Chip key={i.key} tone="issue" on={d.issues.includes(i.key)} onClick={() => toggleIn('issues', i.key)}>{i.label}</Chip>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {step === 2 && (
                <>
                  {isTrialLesson && (
                    <section className="grid gap-3 rounded-2xl border-2 p-4" style={{ borderColor: accent, background: `${accent}0F` }}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-extrabold">Trial assessment</h3>
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Goes in the family’s report</span>
                      </div>
                      <div className="grid gap-1.5">
                        <div className="text-sm font-extrabold">Starting level</div>
                        {trialCefr ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="rounded-full px-3 py-1 text-sm font-extrabold text-white" style={{ background: accent }}>{trialCefr}</span>
                            <span className="text-xs text-muted-foreground">Set in the classroom</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {TRIAL_LEVELS.map((lv) => <Chip key={lv} on={d.trialLevel === lv} onClick={() => set('trialLevel', d.trialLevel === lv ? '' : lv)}>{lv}</Chip>)}
                          </div>
                        )}
                      </div>
                      <div className="grid gap-1.5">
                        <div className="text-sm font-extrabold">{name}’s English today</div>
                        <div className="flex flex-wrap gap-1.5">
                          {TRIAL_ENGLISH.map((t) => <Chip key={t} on={d.trialEnglish === t} onClick={() => set('trialEnglish', d.trialEnglish === t ? '' : t)}>{t}</Chip>)}
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <div className="text-sm font-extrabold">In class</div>
                        <div className="flex flex-wrap gap-1.5">
                          {TRIAL_CONFIDENCE.map((t) => <Chip key={t} on={d.trialConfidence === t} onClick={() => set('trialConfidence', d.trialConfidence === t ? '' : t)}>{t}</Chip>)}
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <div className="text-sm font-extrabold">Learning goal <span className="font-semibold text-muted-foreground">(optional)</span></div>
                        <Input value={d.trialGoal} onChange={(e) => set('trialGoal', e.target.value)} placeholder="e.g. Speak with confidence at school / pass an exam / travel" />
                      </div>
                    </section>
                  )}

                  <section className="grid gap-2">
                    <h3 className="text-base font-extrabold">How did {name} do?</h3>
                    <p className="-mt-1 text-xs text-muted-foreground">One tap per skill. These update the student’s Skill Radar. Skip any you didn’t see today.</p>
                    <div className="grid gap-2">
                      {SKILL_FIELDS.map((f) => (
                        <div key={f.key} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border py-2 pl-4 pr-2">
                          <span className="text-sm font-extrabold">{f.label}</span>
                          <span className="flex gap-1.5">
                            {FACES.map((face) => {
                              const on = d.skills[f.key] === face.level;
                              return (
                                <button key={face.level} type="button" aria-pressed={on} aria-label={`${f.label}: ${face.label}`}
                                  onClick={() => setD((p) => {
                                    const skills = { ...p.skills };
                                    if (skills[f.key] === face.level) delete skills[f.key]; else skills[f.key] = face.level;
                                    return { ...p, skills };
                                  })}
                                  className={`grid min-w-[64px] place-items-center rounded-xl border-2 border-border px-1.5 py-1 text-[11px] font-extrabold ${on ? 'text-foreground' : 'text-muted-foreground'}`}
                                  style={pressedStyle(on)}>
                                  <span className="text-xl leading-none">{face.emoji}</span>{face.label}
                                </button>
                              );
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                    {overallPill && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">Overall today:
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white" style={{ background: overallPill[1] }}>{overallPill[0]}</span>
                      </div>
                    )}
                  </section>

                  <section className="grid gap-2">
                    <h3 className="text-base font-extrabold">Great at</h3>
                    <p className="-mt-1 text-xs text-muted-foreground">Tap the ones that fit. They go into the family message.</p>
                    {sentences.great.map((t) => <SentenceChip key={t} tone="good" text={t} on={d.great.includes(t)} onClick={() => toggleIn('great', t)} />)}
                    <Input value={d.extraGreat} onChange={(e) => set('extraGreat', e.target.value)} placeholder="Add your own… e.g. Said “kitchen” and “bedroom” perfectly." />
                  </section>

                  <section className="grid gap-2">
                    <h3 className="text-base font-extrabold">Practice more</h3>
                    {sentences.more.map((t) => <SentenceChip key={t} tone="more" text={t} on={d.more.includes(t)} onClick={() => toggleIn('more', t)} />)}
                    <Input value={d.extraMore} onChange={(e) => set('extraMore', e.target.value)} placeholder="Add your own… e.g. Remember “hallway” and “dining room”." />
                  </section>
                </>
              )}

              {step === 3 && (
                <>
                  {isTrialLesson && (
                    <section className="grid gap-2">
                      <h3 className="text-base font-extrabold">Recommended plan</h3>
                      <p className="-mt-1 text-xs text-muted-foreground">How often would you suggest {name} has lessons? It appears in the trial report.</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[1, 2, 3].map((n) => (
                          <Chip key={n} on={d.trialLessons === n} onClick={() => set('trialLessons', d.trialLessons === n ? 0 : n)}>
                            {n} lesson{n === 1 ? '' : 's'} / week
                          </Chip>
                        ))}
                      </div>
                      {learningPlan ? (
                        <div className="grid gap-2 rounded-xl border border-border bg-muted/30 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-extrabold">Plan preview · {learningPlan.level}</span>
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              Start at unit
                              <select
                                value={planStartUnit}
                                onChange={(e) => set('trialStartUnit', Number(e.target.value))}
                                className="rounded-md border border-border bg-background px-1.5 py-0.5 text-xs font-bold text-foreground"
                              >
                                {Array.from({ length: UNITS_PER_LEVEL }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </label>
                          </div>
                          <ol className="grid gap-1 text-sm">
                            {learningPlan.weeks.map((w) => (
                              <li key={w.week}><span className="font-bold">Week {w.week}:</span> {w.title}</li>
                            ))}
                          </ol>
                          <p className="text-xs text-muted-foreground">
                            {learningPlan.unitsAfter > 0 ? `Then the rest of ${learningPlan.level} (units to ${learningPlan.lastUnit}). ` : ''}
                            About {learningPlan.totalWeeks} weeks to finish the level at {learningPlan.lessonsPerWeek} lesson{learningPlan.lessonsPerWeek === 1 ? '' : 's'} a week.
                            It goes in the family email and on their dashboard.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {trialLevel ? 'Pick lessons per week to see the learning plan the family will get.' : 'Set the level (in class or in step 2) to build the learning plan.'}
                        </p>
                      )}
                    </section>
                  )}

                  <section className="grid gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold">For the family</h3>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Seen by parents &amp; student</span>
                    </div>
                    <p className="-mt-1 text-xs text-muted-foreground">Drafted from your answers. Edit freely.</p>
                    <Textarea value={familyText} onChange={(e) => setD((p) => ({ ...p, family: e.target.value, familyEdited: true }))} className="min-h-[170px] text-sm" />
                    {d.familyEdited && (
                      <button type="button" onClick={() => setD((p) => ({ ...p, familyEdited: false }))} className="justify-self-start text-xs font-bold text-muted-foreground underline">
                        Rebuild from my answers
                      </button>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {['Amazing effort today! 🌟', 'Keep practising at home 🏠', 'Super pronunciation! 🗣️', 'So proud of you! 💛', 'See you next class! 👋'].map((p) => (
                        <button key={p} type="button" onClick={() => setD((s) => ({ ...s, family: `${(s.familyEdited ? s.family : familyText).trim()} ${p}`.trim(), familyEdited: true }))}
                          className="rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">+ {p}</button>
                      ))}
                    </div>
                  </section>

                  {canEmail && (
                  <section className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold">✉️ Email this {isTrialLesson ? 'trial report' : 'report'} to the student</div>
                        <div className="text-xs text-muted-foreground">
                          Sent to {bookingMeta.inviteEmail}
                        </div>
                      </div>
                      <Switch checked={emailOn} onCheckedChange={(v) => set('emailOn', v)} aria-label="Email this report" />
                    </div>
                    {emailOn && (
                      <div className="grid gap-1.5">
                        <div className="text-xs font-bold text-muted-foreground">
                          Write the email in
                          {bookingMeta.language && bookingMeta.language !== 'en' && d.emailLang === null ? ' (the family’s language)' : ''}:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {REPORT_LANGUAGES.map((l) => (
                            <Chip key={l.code} on={emailLang === l.code} onClick={() => set('emailLang', l.code)}>{l.label}</Chip>
                          ))}
                        </div>
                        {emailLang !== 'en' && (
                          <p className="text-xs text-muted-foreground">Your message and notes are translated automatically; labels are fixed translations. The in-app report stays in English.</p>
                        )}
                      </div>
                    )}
                  </section>
                  )}

                  <section className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div><div className="text-sm font-extrabold">Homework</div><div className="text-xs text-muted-foreground">Added to the family message</div></div>
                      <Switch checked={d.homeworkOn} onCheckedChange={(v) => set('homeworkOn', v)} aria-label="Add homework" />
                    </div>
                    {d.homeworkOn && <Input value={d.homework} onChange={(e) => set('homework', e.target.value)} placeholder="e.g. Practise the room words with the flashcards in the app." />}
                  </section>

                  {isPlayground && (
                    <section className="grid gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-extrabold">Private note to parents</h3>
                        <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-extrabold text-sky-700 dark:text-sky-300">Only parents · not shown to the child</span>
                      </div>
                      <p className="-mt-1 text-xs text-muted-foreground">For things the child shouldn’t read, e.g. tiredness, behaviour, or a health worry.</p>
                      <Textarea value={d.parentNote} onChange={(e) => set('parentNote', e.target.value)} className="min-h-[84px] text-sm"
                        placeholder={`e.g. ${name} seemed tired today. Please let us know if you’d like to move the next class.`} />
                    </section>
                  )}

                  <section className="grid gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold">Note for teachers</h3>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-extrabold text-muted-foreground">Only teachers &amp; admin</span>
                    </div>
                    <Textarea value={d.teacherNote} onChange={(e) => set('teacherNote', e.target.value)} className="min-h-[84px] text-sm"
                      placeholder="e.g. Shy at the start. Warm up with a song. Loves the cat character." />
                  </section>

                  {isOverdue && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                      <strong>The 24-hour window has passed.</strong> Submitting still saves your report, but this session will <strong>not be paid</strong>.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background/95 px-6 py-3 backdrop-blur">
              <button type="button" onClick={fillLater} disabled={submitting} className="rounded-full px-3 py-2 text-sm font-extrabold text-muted-foreground hover:text-foreground">
                Fill in later
              </button>
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button type="button" onClick={() => set('step', (step - 1) as 1 | 2)} disabled={submitting} className="rounded-full border border-border px-4 py-2 text-sm font-extrabold">
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={() => set('step', (step + 1) as 2 | 3)}
                    disabled={step === 1 && d.progress === 'early' && !d.resumeFrom.trim()}
                    title={step === 1 && d.progress === 'early' && !d.resumeFrom.trim() ? 'Write where the next class should start' : undefined}
                    className={`rounded-full px-6 py-2 text-sm font-extrabold disabled:opacity-50 ${theme.buttonPrimary}`}>
                    Next
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting} className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-extrabold ${isOverdue ? 'bg-rose-600 text-white hover:bg-rose-700' : theme.buttonPrimary}`}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isOverdue ? 'Submit (unpaid)' : 'Submit report'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

function Tile({ v, l, accent }: { v: string; l: string; accent: string }) {
  return (
    <div className="grid gap-0.5 rounded-xl px-3 py-2" style={{ background: `${accent}1A` }}>
      <span className="text-lg font-extrabold tabular-nums">{v}</span>
      <span className="text-[11px] font-bold text-muted-foreground">{l}</span>
    </div>
  );
}
