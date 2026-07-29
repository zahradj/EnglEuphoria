import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Star, ClipboardCheck, BarChart3, CheckCircle2, AlertTriangle, Sparkles, MessageSquareText, Clock3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IncidentFlag, TEACHER_FLAG_OPTIONS, FLAG_META } from './incidentFlags';
import { getClassroomHubTheme, type ClassroomHubKey } from '@/components/teacher/classroom/hubClassroomTheme';
import { endLesson } from '@/services/endLesson';

const REPORT_DEADLINE_MS = 24 * 60 * 60 * 1000;

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
}

const IMPROVEMENT_AREAS = ['Grammar', 'Pronunciation', 'Vocabulary', 'Fluency', 'Listening'];

const SKILL_FIELDS = [
  { key: 'professional_vocabulary', label: 'Professional Vocabulary' },
  { key: 'fluency', label: 'Fluency' },
  { key: 'grammar_accuracy', label: 'Grammar Accuracy' },
  { key: 'business_writing', label: 'Business Writing' },
  { key: 'listening', label: 'Listening' },
] as const;

const scoreToCefr = (score: number): string => {
  if (score >= 8) return 'C1';
  if (score >= 6) return 'B2';
  if (score >= 4) return 'B1';
  if (score >= 2) return 'A2';
  return 'A1';
};

export const LessonWrapUpDialog: React.FC<LessonWrapUpDialogProps> = ({
  open,
  onOpenChange,
  lessonId,
  bookingId,
  studentId,
  teacherId,
  sharedNotes = '',
  hubType = 'academy'
}) => {
  const theme = getClassroomHubTheme(hubType);
  const { toast } = useToast();
  const [areasForImprovement, setAreasForImprovement] = useState<string[]>([]);
  const [quickNotes, setQuickNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSkillScores, setShowSkillScores] = useState(false);
  const [outcome, setOutcome] = useState<'completed' | 'not_completed'>('completed');
  const [incidentFlags, setIncidentFlags] = useState<IncidentFlag[]>([]);
  const [skillScores, setSkillScores] = useState<Record<string, number>>({
    professional_vocabulary: 5,
    fluency: 5,
    grammar_accuracy: 5,
    business_writing: 5,
    listening: 5,
  });
  const [bookingEndedAt, setBookingEndedAt] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const toggleFlag = (f: IncidentFlag) =>
    setIncidentFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  // Load existing skill scores when dialog opens
  useEffect(() => {
    if (!open || !studentId) return;
    const loadSkills = async () => {
      const { data } = await supabase
        .from('student_skills')
        .select('skill_name, current_score')
        .eq('student_id', studentId);
      if (data && data.length > 0) {
        const scores: Record<string, number> = {};
        data.forEach((row: any) => {
          scores[row.skill_name] = Number(row.current_score);
        });
        setSkillScores(prev => ({ ...prev, ...scores }));
      }
    };
    loadSkills();
  }, [open, studentId]);

  // Load the booking's ended_at so we can show a real countdown against the
  // 24h payment deadline instead of a static warning string.
  useEffect(() => {
    if (!open || !bookingId) return;
    setNow(Date.now());
    supabase
      .from('class_bookings')
      .select('ended_at')
      .eq('id', bookingId)
      .maybeSingle()
      .then(({ data }) => setBookingEndedAt(data?.ended_at ?? null));
  }, [open, bookingId]);

  // Tick the countdown once a minute while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [open]);

  const msRemaining = bookingEndedAt
    ? REPORT_DEADLINE_MS - (now - new Date(bookingEndedAt).getTime())
    : null;
  const isOverdue = msRemaining !== null && msRemaining <= 0;
  const hoursRemaining = msRemaining !== null ? Math.max(0, msRemaining / (60 * 60 * 1000)) : null;

  // A quick at-a-glance session score — the closest thing to a single
  // "verified progress" number this report produces. Only meaningful once
  // skill scores are in play; otherwise it just reflects outcome + rating.
  const sessionScore = showSkillScores
    ? Math.round((Object.values(skillScores).reduce((a, b) => a + b, 0) / Object.values(skillScores).length) * 10)
    : null;

  const toggleArea = (area: string) => {
    setAreasForImprovement(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async () => {
    if (!teacherId) return;
    setSubmitting(true);

    try {
      // Persist incident report for this room (teacher-side)
      if (lessonId) {
        await supabase.from('lesson_incident_reports').upsert({
          room_id: lessonId,
          reporter_id: teacherId,
          reporter_role: 'teacher',
          outcome,
          flags: incidentFlags,
          notes: quickNotes.trim() || null,
        }, { onConflict: 'room_id,reporter_id' });
        // AI Senior Engineer stamps a classroom verdict (fire-and-forget)
        supabase.functions.invoke('classroom-incident-verdict', { body: { room_id: lessonId } })
          .catch((e) => console.warn('verdict invoke failed', e));
      }

      // Insert feedback
      await supabase.from('lesson_feedback_submissions').insert({
        lesson_id: lessonId || null,
        teacher_id: teacherId,
        student_id: studentId || null,
        feedback_content: {
          areas_for_improvement: areasForImprovement,
          quick_notes: quickNotes,
          skill_scores: showSkillScores ? skillScores : undefined,
          outcome,
          incident_flags: incidentFlags,
        },
        student_performance_rating: rating,
        lesson_objectives_met: outcome === 'completed'
      });


      // Save shared notes to lesson_completions
      if (lessonId && studentId && sharedNotes) {
        await supabase.from('lesson_completions').upsert({
          lesson_id: lessonId,
          student_id: studentId,
          shared_notes: sharedNotes,
          completed_at: new Date().toISOString()
        }, { onConflict: 'lesson_id,student_id' });
      }

      // Update student_skills table if skill scores were provided
      if (showSkillScores && studentId) {
        for (const field of SKILL_FIELDS) {
          const score = skillScores[field.key];
          const nextFocusMap: Record<string, string> = {
            professional_vocabulary: 'Industry Terminology',
            fluency: 'Conversational Practice',
            grammar_accuracy: 'Advanced Structures',
            business_writing: 'Email Etiquette',
            listening: 'Comprehension Drills',
          };
          await supabase
            .from('student_skills')
            .upsert({
              student_id: studentId,
              skill_name: field.key,
              current_score: score,
              cefr_equivalent: scoreToCefr(score),
              next_focus: nextFocusMap[field.key],
              updated_at: new Date().toISOString(),
            }, { onConflict: 'student_id,skill_name' });
        }
      }

      // Update student mistake_history if improvements noted
      if (studentId && areasForImprovement.length > 0) {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('mistake_history')
          .eq('user_id', studentId)
          .single();

        const currentHistory = Array.isArray(profile?.mistake_history) ? profile.mistake_history : [];
        const newEntries = areasForImprovement.map(area => ({
          error_type: area,
          timestamp: new Date().toISOString(),
          source: 'teacher_feedback'
        }));

        await supabase
          .from('student_profiles')
          .update({
            mistake_history: [...currentHistory, ...newEntries].slice(-50)
          })
          .eq('user_id', studentId);
      }

      // ───────────────────────────────────────────────────────────────────────
      // CLOSE THE BOOKING + RECORD EARNINGS
      // bookingId is class_bookings.id — the single source of truth for
      // closing the booking and crediting the teacher is the end_lesson RPC
      // (atomic: booking, classroom session, completion row, earnings,
      // payout ledger, performance metrics — all in one transaction).
      // Submitting after the 24h deadline still saves this report (the
      // teacher's notes still matter for the student's record) but does NOT
      // credit any earnings — that's the "mandatory or unpaid" rule.
      // ───────────────────────────────────────────────────────────────────────
      let paid = false;
      if (bookingId) {
        const overdue = bookingEndedAt
          ? Date.now() - new Date(bookingEndedAt).getTime() > REPORT_DEADLINE_MS
          : false;

        if (!overdue) {
          try {
            await endLesson(bookingId);
            paid = true;
          } catch (endErr: any) {
            console.error('end_lesson failed:', endErr);
            toast({
              title: 'Report saved, but payment failed',
              description: endErr?.message ?? 'Could not finalize this lesson for payment. Contact support if this keeps happening.',
              variant: 'destructive',
            });
          }
        } else {
          // Past the 24h window — still close the booking for record-keeping,
          // just without crediting earnings.
          await supabase
            .from('class_bookings')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', bookingId);
        }

        // Post-Class Sync — push the lesson's blueprint vocab + phonics
        // into the student's Vocabulary Vault and Map of Sounds.
        try {
          await supabase.functions.invoke('post-class-sync', {
            body: { booking_id: bookingId },
          });
        } catch (syncErr) {
          console.error('post-class-sync failed (non-blocking):', syncErr);
        }
      }

      if (bookingId && !paid) {
        const overdue = bookingEndedAt
          ? Date.now() - new Date(bookingEndedAt).getTime() > REPORT_DEADLINE_MS
          : false;
        toast({
          title: overdue ? 'Report saved — past the 24h window' : 'Session Report Saved',
          description: overdue
            ? 'This report was submitted more than 24 hours after the lesson ended, so this session will not be paid.'
            : 'Saved. Payment will be finalized shortly.',
          className: overdue ? undefined : 'bg-emerald-600 text-white border-emerald-700',
          variant: overdue ? 'destructive' : undefined,
        });
      } else {
        toast({
          title: 'Session Report Saved ✓',
          description: showSkillScores
            ? 'Lesson closed for the student, earnings credited, and skill scores synced to dashboard.'
            : 'Lesson closed for the student and earnings credited.',
          className: 'bg-emerald-600 text-white border-emerald-700'
        });
      }

      onOpenChange(false);
      // Reset
      setAreasForImprovement([]);
      setQuickNotes('');
      setRating(0);
      setShowSkillScores(false);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast({ title: 'Error', description: 'Failed to save feedback.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-x-hidden">
        <DialogTitle className="sr-only">Session Report</DialogTitle>
        {/* Hub-branded header banner */}
        <div
          className="relative overflow-hidden px-6 pt-6 pb-5 text-white"
          style={{ background: theme.hexGradient }}
        >
          <div className="absolute -right-6 -top-10 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-[-2.5rem] w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center gap-2 text-white/85 text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5">
            <ClipboardCheck className="w-4 h-4" />
            Session Report
          </div>
          <h2 className="relative z-10 text-xl font-extrabold leading-snug">
            How did today's lesson go?
          </h2>
          {sessionScore !== null && (
            <div className="relative z-10 mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Session score: {sessionScore}%
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Lesson outcome */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Outcome</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome('completed')}
                className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-1 transition ${
                  outcome === 'completed'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-border bg-card hover:border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Lesson completed</span>
                <span className="text-[10px] text-muted-foreground">No redo needed</span>
              </button>
              <button
                type="button"
                onClick={() => setOutcome('not_completed')}
                className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-1 transition ${
                  outcome === 'not_completed'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-border bg-card hover:border-rose-300'
                }`}
              >
                <AlertTriangle className="w-7 h-7 text-rose-600" />
                <span className="text-sm font-bold text-rose-700">Had issues</span>
                <span className="text-[10px] text-muted-foreground">Flag what happened</span>
              </button>
            </div>
          </div>

          {/* Incident flags */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              Flag what happened {outcome === 'completed' && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {TEACHER_FLAG_OPTIONS.map((f) => {
                const meta = FLAG_META[f];
                const active = incidentFlags.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFlag(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active
                        ? `text-white border-transparent ${theme.buttonPrimary}`
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Assessment — the section that actually verifies progress */}
          <div className={`rounded-2xl border ${theme.panelBorder} overflow-hidden`}>
            <button
              type="button"
              onClick={() => setShowSkillScores(!showSkillScores)}
              className={`flex items-center justify-between gap-2 px-4 py-3 w-full text-sm font-semibold transition-colors ${
                showSkillScores ? `${theme.accentSoftBg} ${theme.accentText}` : 'bg-muted/40 text-foreground hover:bg-muted/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Progress Assessment
              </span>
              <span className="text-[11px] font-medium opacity-70">
                {showSkillScores ? 'Hide' : 'Score this session'}
              </span>
            </button>

            {showSkillScores && (
              <div className="space-y-4 p-4 bg-card">
                <p className="text-xs text-muted-foreground -mt-1">
                  Scores (0–10) sync straight to the student's Skill Radar and progress dashboard.
                </p>
                {SKILL_FIELDS.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{field.label}</span>
                      <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${theme.accentSoftBg} ${theme.accentText}`}>
                        {skillScores[field.key].toFixed(1)} · {scoreToCefr(skillScores[field.key])}
                      </span>
                    </div>
                    <Slider
                      value={[skillScores[field.key]]}
                      onValueChange={([val]) => setSkillScores(prev => ({ ...prev, [field.key]: val }))}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Areas for Improvement — chips, matches the incident-flag style above */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Areas for Improvement</p>
            <div className="flex flex-wrap gap-2">
              {IMPROVEMENT_AREAS.map(area => {
                const active = areasForImprovement.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'
                    }`}
                  >
                    {active ? '✓ ' : ''}{area}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4" /> Quick Notes
            </p>
            <Textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Any observations about the lesson — these are visible to the student and to any future teacher."
              className="text-sm min-h-[70px]"
            />
          </div>

          {/* Performance Rating */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Student Performance</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/40'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {isOverdue ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-[11px] leading-relaxed text-rose-800 flex items-start gap-2">
              <Clock3 className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>The 24-hour window has passed.</strong> Submitting now still saves your notes, but this session will <strong>not be paid</strong>.</span>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800 flex items-start gap-2">
              <Clock3 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {hoursRemaining !== null ? (
                  <><strong>{hoursRemaining < 1 ? '< 1 hour' : `${Math.floor(hoursRemaining)} hour${Math.floor(hoursRemaining) === 1 ? '' : 's'}`} left</strong> to submit this report.</>
                ) : (
                  <><strong>You have 24 hours</strong> to submit this report.</>
                )} If you skip it now, you can finish it from your dashboard within that window — otherwise this session <strong>won't be paid</strong>.
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Fill in later
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full text-white ${isOverdue ? 'bg-rose-600 hover:bg-rose-700' : theme.buttonPrimary}`}
            >
              {submitting ? 'Saving...' : isOverdue ? 'Submit (unpaid — past deadline)' : 'Submit Session Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
