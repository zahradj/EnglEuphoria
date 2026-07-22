/**
 * AdminScorecard — private side drawer for the bound super admin during an
 * Interview Arena session.
 *
 * The admin no longer approves/rejects manually. They complete an observation
 * checklist + notes, then submit it to the AI Recruitment Agent which
 * produces the analytics report and the hire/decline verdict.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { InterviewMeta } from '@/hooks/useInterviewRole';

interface Props {
  interview: InterviewMeta;
}

interface ChecklistItem {
  key: string;
  label: string;
  hint: string;
}

const CHECKLIST: ChecklistItem[] = [
  { key: 'av_clear',          label: 'Clear A/V setup',            hint: 'Camera framed, lit, mic crisp, no echo' },
  { key: 'energy_warm',       label: 'Warm Euphoria energy',       hint: 'Smiles, encouragement, student-first pacing' },
  { key: 'english_fluent',    label: 'Fluent natural English',     hint: 'Pronunciation, grammar, intonation, naturalness' },
  { key: 'tech_confident',    label: 'Confident platform use',     hint: 'God Mode, slide control, hints, rewards' },
  { key: 'lesson_objective',  label: 'States lesson objective',    hint: 'Opens with a clear, age-appropriate goal' },
  { key: 'cefr_appropriate',  label: 'CEFR-appropriate level',     hint: 'Language and tasks match the hub + level' },
  { key: 'scaffolding',       label: 'Good scaffolding',           hint: 'Models, guides, then releases practice' },
  { key: 'interaction',       label: 'Elicits student talk',       hint: 'Asks, waits, recasts — not a monologue' },
  { key: 'feedback',          label: 'Constructive feedback',      hint: 'Specific, kind, immediate correction' },
  { key: 'culturally_safe',   label: 'Culturally safe content',    hint: 'Globally inclusive, age-appropriate' },
  { key: 'closure',           label: 'Strong lesson closure',      hint: 'Recap, quick check, next step' },
  { key: 'no_red_flags',      label: 'No red flags',               hint: 'No safeguarding, professionalism, or honesty concerns' },
];
const INTERVIEW_QUESTIONS: Array<{ category: string; q: string }> = [
  { category: 'Warm-up',     q: 'Tell me about yourself in one minute.' },
  { category: 'Warm-up',     q: 'Why do you want to teach English at EnglEuphoria specifically?' },
  { category: 'Experience',  q: 'Walk me through your most successful ESL lesson and why it worked.' },
  { category: 'Experience',  q: 'Which CEFR levels have you taught the most, and how do you adapt your language?' },
  { category: 'Pedagogy',    q: 'A 6-year-old freezes and refuses to speak. What do you do in the next 60 seconds?' },
  { category: 'Pedagogy',    q: 'How do you balance accuracy correction with fluency and learner confidence?' },
  { category: 'Pedagogy',    q: 'Show me how you would introduce the present continuous to an A1 teen.' },
  { category: 'Classroom',   q: 'How do you keep a Playground (5–8 yrs) student engaged for a full 30-minute lesson?' },
  { category: 'Classroom',   q: 'A parent watches the lesson and interrupts repeatedly. How do you handle it?' },
  { category: 'Safeguarding',q: 'A young student says something that worries you. What is your next step?' },
  { category: 'Tech',        q: 'Your camera dies mid-lesson. Walk me through your recovery plan.' },
  { category: 'Culture',     q: 'How do you make sure your examples feel inclusive to a global classroom?' },
  { category: 'Closing',     q: 'Where do you want to be as a teacher in 12 months — and how can we help?' },
];

interface AgentReport {
  verdict: 'approve' | 'reject' | 'needs_review';
  confidence: number;
  summary: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
}

export function AdminScorecard({ interview }: Props) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initial = (interview.scorecard ?? {}) as {
    checklist?: Record<string, boolean>;
    notes?: string;
    report?: AgentReport;
  };

  const [checks, setChecks] = useState<Record<string, boolean>>(initial.checklist ?? {});
  const [notes, setNotes] = useState(initial.notes ?? interview.admin_notes ?? '');
  const [report, setReport] = useState<AgentReport | null>(initial.report ?? null);
  const [deciding, setDeciding] = useState<'approve' | 'reject' | null>(null);

  async function decide(verdict: 'approve' | 'reject') {
    setDeciding(verdict);
    try {
      if (verdict === 'approve') {
        const { error } = await supabase.functions.invoke('approve-teacher', {
          body: {
            applicationId: interview.application_id,
            email: interview.teacher_email,
            firstName: interview.teacher_name?.split(' ')[0],
            lastName: interview.teacher_name?.split(' ').slice(1).join(' '),
          },
        });
        if (error) throw error;
        await supabase.from('interviews').update({
          status: 'passed',
          admin_notes: notes,
          scorecard: { checklist: checks, notes, report, decided_at: new Date().toISOString(), admin_verdict: 'approve' },
        }).eq('id', interview.id);
        toast.success('Approved — invitation email sent to the teacher.');
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
            scorecard: { checklist: checks, notes, report, decided_at: new Date().toISOString(), admin_verdict: 'reject' },
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
  }

  // Debounced autosave of checklist + notes
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void supabase
        .from('interviews')
        .update({
          scorecard: { checklist: checks, notes, report: report ?? null },
          admin_notes: notes,
        })
        .eq('id', interview.id);
    }, 800);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [checks, notes, report, interview.id]);

  const passed = useMemo(
    () => CHECKLIST.filter((c) => checks[c.key]).length,
    [checks],
  );
  const total = CHECKLIST.length;

  async function generateReport() {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('recruitment-agent', {
        body: {
          action: 'evaluate_interview',
          applicationId: interview.application_id,
          interviewId: interview.id,
          checklist: checks,
          checklistLabels: CHECKLIST.reduce<Record<string, string>>((acc, c) => {
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
          ? '🤖 AI suggests APPROVE — review and confirm below.'
          : r.verdict === 'reject'
            ? '🤖 AI suggests DECLINE — review and confirm below.'
            : '🤖 AI flagged this interview for human review.',
      );
      // Admin decides manually via Approve/Reject buttons — no auto-redirect.
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'Failed to generate AI report.');
    } finally {
      setSubmitting(false);
    }
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground rounded-l-xl px-2 py-4 shadow-lg"
        aria-label="Open admin scorecard"
      >
        <ClipboardCheck className="h-5 w-5" />
      </button>
    );
  }

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-40 w-[380px] max-w-[92vw] bg-card border-l border-border shadow-2xl flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold leading-tight truncate">Interview Observation</h2>
            <p className="text-xs text-muted-foreground truncate">
              {interview.teacher_name ?? 'Applicant'}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {passed}/{total}
        </Badge>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground hover:text-foreground p-1 shrink-0"
          aria-label="Collapse scorecard"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            You are joined as the <span className="font-semibold text-foreground">student</span>.
            Tick what you observed and add notes — the AI Recruitment Agent will produce the
            analytics report and decide whether to hire. Notes autosave.
          </p>
        </Card>

        <details className="rounded-lg border border-border bg-muted/20 group" open>
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold flex items-center justify-between">
            <span>Interview Questions</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {INTERVIEW_QUESTIONS.length} prompts
            </span>
          </summary>
          <ol className="px-3 pb-3 space-y-1.5">
            {INTERVIEW_QUESTIONS.map((it, i) => (
              <li key={i} className="text-xs leading-snug flex gap-2">
                <span className="font-bold text-primary tabular-nums shrink-0">{i + 1}.</span>
                <div className="min-w-0">
                  <span className="inline-block text-[10px] uppercase tracking-wide font-bold text-muted-foreground mr-1">
                    {it.category}
                  </span>
                  <span>{it.q}</span>
                </div>
              </li>
            ))}
          </ol>
        </details>



        <div className="space-y-2">
          {CHECKLIST.map((item) => (
            <label
              key={item.key}
              htmlFor={`chk-${item.key}`}
              className="flex items-start gap-3 p-2 rounded-lg border border-border hover:bg-muted/40 cursor-pointer transition-colors"
            >
              <Checkbox
                id={`chk-${item.key}`}
                checked={!!checks[item.key]}
                onCheckedChange={(v) =>
                  setChecks((c) => ({ ...c, [item.key]: v === true }))
                }
                className="mt-0.5"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium leading-tight">{item.label}</div>
                <p className="text-[11px] text-muted-foreground leading-snug">{item.hint}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Notes for the AI Agent</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations, examples, red flags, strengths…"
            rows={4}
          />
        </div>

        {report && (
          <Card className="p-3 space-y-2 border-2 border-primary/40">
            <div className="flex items-center gap-2">
              {report.verdict === 'approve' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : report.verdict === 'reject' ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <span className="font-bold text-sm uppercase tracking-wide">
                {report.verdict === 'approve'
                  ? 'Approved'
                  : report.verdict === 'reject'
                    ? 'Declined'
                    : 'Needs Review'}
              </span>
              <Badge variant="secondary" className="ml-auto">
                {Math.round(report.confidence * 100)}% conf.
              </Badge>
            </div>
            <p className="text-xs text-foreground/90 whitespace-pre-wrap">{report.summary}</p>
            {report.strengths?.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase text-emerald-700">
                  Strengths
                </div>
                <ul className="list-disc pl-4 text-xs space-y-0.5">
                  {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {report.risks?.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase text-destructive">
                  Risks
                </div>
                <ul className="list-disc pl-4 text-xs space-y-0.5">
                  {report.risks.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">
              Recommendation
            </div>
            <p className="text-xs">{report.recommendation}</p>
          </Card>
        )}
      </div>

      <footer className="border-t border-border p-3 bg-card sticky bottom-0 space-y-2">
        <Button
          onClick={generateReport}
          disabled={submitting || passed === 0}
          className="w-full gap-2"
          variant="secondary"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {report ? 'Re-run AI Recruitment Report' : 'Generate AI Recruitment Report'}
        </Button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            onClick={() => decide('reject')}
            disabled={deciding !== null}
            variant="outline"
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            {deciding === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject
          </Button>
          <Button
            onClick={() => decide('approve')}
            disabled={deciding !== null}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {deciding === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Approve
          </Button>
        </div>

        {passed === 0 && !report && (
          <p className="text-[11px] text-muted-foreground text-center">
            Tick observations or generate the AI report before deciding.
          </p>
        )}
        <p className="text-[10px] text-muted-foreground text-center leading-tight">
          Approving sends the "complete your profile" email. Rejecting sends the post-interview rejection.
        </p>
      </footer>
    </aside>
  );
}

export default AdminScorecard;
