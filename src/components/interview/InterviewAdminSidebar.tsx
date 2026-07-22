/**
 * InterviewAdminSidebar — hub-themed, tabbed observation panel that mirrors
 * the right-rail anatomy of the 1-on-1 classroom but is interview-specific.
 *
 * Tabs:
 *   • Scorecard — 12-item rubric, autosaves
 *   • Notes     — free-text + interview question bank, autosaves
 *   • Decision  — AI report + Hire / Conditional / Reject actions
 *   • Recording — timestamped markers the admin tags during the session
 *
 * Visual coat comes from `useHubClassroomTheme` so the panel matches
 * Playground orange / Academy purple / Success emerald.
 */
import { useState } from 'react';
import {
  ChevronRight,
  ClipboardCheck,
  StickyNote,
  Gavel,
  Bookmark,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useHubClassroomTheme, type HubType } from '@/components/classroom/shared/useHubClassroomTheme';
import {
  INTERVIEW_CHECKLIST,
  INTERVIEW_QUESTIONS,
  useInterviewScorecard,
} from '@/hooks/useInterviewScorecard';
import type { InterviewMeta } from '@/hooks/useInterviewRole';

interface Props {
  interview: InterviewMeta;
  hub: HubType;
  startedAt?: string | null;
}

export function InterviewAdminSidebar({ interview, hub, startedAt }: Props) {
  const theme = useHubClassroomTheme(hub);
  const [collapsed, setCollapsed] = useState(false);
  const sc = useInterviewScorecard(interview, startedAt);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={theme.buttonGradient}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 text-white rounded-l-xl px-2.5 py-4 shadow-xl hover:opacity-90 transition"
        aria-label="Open interview observation panel"
      >
        <ClipboardCheck className="h-5 w-5" />
      </button>
    );
  }

  return (
    <aside
      style={theme.glowShadow}
      className={cn(
        'fixed right-0 top-0 bottom-0 z-40 w-[400px] max-w-[94vw] bg-card/95 backdrop-blur-xl border-l border-border flex flex-col',
        theme.radiusClass,
        'rounded-none rounded-l-2xl',
      )}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/70">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0"
            style={theme.buttonGradient}
          >
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold leading-tight truncate">Interview Observation</h2>
            <p className="text-[11px] text-muted-foreground truncate">
              {interview.teacher_name ?? 'Applicant'} · {theme.label} Hub
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {sc.passed}/{sc.total}
        </Badge>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground hover:text-foreground p-1 shrink-0 ml-1"
          aria-label="Collapse panel"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </header>

      <Tabs defaultValue="scorecard" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 mx-3 mt-3">
          <TabsTrigger value="scorecard" className="text-[11px] gap-1">
            <ClipboardCheck className="h-3.5 w-3.5" /> Rubric
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-[11px] gap-1">
            <StickyNote className="h-3.5 w-3.5" /> Notes
          </TabsTrigger>
          <TabsTrigger value="decision" className="text-[11px] gap-1">
            <Gavel className="h-3.5 w-3.5" /> Decide
          </TabsTrigger>
          <TabsTrigger value="recording" className="text-[11px] gap-1">
            <Bookmark className="h-3.5 w-3.5" /> Marks
          </TabsTrigger>
        </TabsList>

        {/* ───────── Scorecard ───────── */}
        <TabsContent value="scorecard" className="flex-1 overflow-y-auto px-4 pb-4 mt-3 space-y-2">
          <Card className="p-3 bg-muted/40 text-[11px] text-muted-foreground leading-snug">
            You are joined as the <span className="font-semibold text-foreground">student</span>.
            Tick what you observed live — autosaves.
          </Card>
          {INTERVIEW_CHECKLIST.map((item) => (
            <label
              key={item.key}
              htmlFor={`chk-${item.key}`}
              className={cn(
                'flex items-start gap-3 p-2 rounded-lg border border-border hover:bg-muted/40 cursor-pointer transition-colors',
                sc.checks[item.key] && 'bg-muted/60',
              )}
            >
              <Checkbox
                id={`chk-${item.key}`}
                checked={!!sc.checks[item.key]}
                onCheckedChange={(v) =>
                  sc.setChecks((c) => ({ ...c, [item.key]: v === true }))
                }
                className="mt-0.5"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium leading-tight">{item.label}</div>
                <p className="text-[11px] text-muted-foreground leading-snug">{item.hint}</p>
              </div>
            </label>
          ))}
        </TabsContent>

        {/* ───────── Notes ───────── */}
        <TabsContent value="notes" className="flex-1 overflow-y-auto px-4 pb-4 mt-3 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live notes
            </label>
            <Textarea
              value={sc.notes}
              onChange={(e) => sc.setNotes(e.target.value)}
              placeholder="Observations, examples, red flags, strengths…"
              rows={6}
              className="resize-y"
            />
            <p className="text-[10px] text-muted-foreground">Autosaves to interview record.</p>
          </div>

          <details className="rounded-lg border border-border bg-muted/20 group" open>
            <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold flex items-center justify-between">
              <span>Interview question bank</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {INTERVIEW_QUESTIONS.length} prompts
              </span>
            </summary>
            <ol className="px-3 pb-3 space-y-1.5 max-h-72 overflow-y-auto">
              {INTERVIEW_QUESTIONS.map((it, i) => (
                <li key={i} className="text-[11px] leading-snug flex gap-2">
                  <span className={cn('font-bold tabular-nums shrink-0', theme.accentText)}>
                    {i + 1}.
                  </span>
                  <div className="min-w-0">
                    <span className="inline-block text-[9px] uppercase tracking-wide font-bold text-muted-foreground mr-1">
                      {it.category}
                    </span>
                    <span>{it.q}</span>
                  </div>
                </li>
              ))}
            </ol>
          </details>
        </TabsContent>

        {/* ───────── Decision ───────── */}
        <TabsContent value="decision" className="flex-1 overflow-y-auto px-4 pb-4 mt-3 space-y-3">
          <Button
            onClick={sc.generateReport}
            disabled={sc.submitting || sc.passed === 0}
            className="w-full gap-2"
            variant="secondary"
          >
            {sc.submitting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4" />}
            {sc.report ? 'Re-run AI Recruitment Report' : 'Generate AI Recruitment Report'}
          </Button>

          {sc.report && (
            <Card className="p-3 space-y-2 border-2" style={{ borderColor: `hsl(${theme.primaryHsl} / 0.4)` }}>
              <div className="flex items-center gap-2">
                {sc.report.verdict === 'approve' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : sc.report.verdict === 'reject' ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <span className="font-bold text-sm uppercase tracking-wide">
                  {sc.report.verdict === 'approve'
                    ? 'Approve'
                    : sc.report.verdict === 'reject' ? 'Decline' : 'Needs Review'}
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {Math.round(sc.report.confidence * 100)}% conf.
                </Badge>
              </div>
              <p className="text-xs text-foreground/90 whitespace-pre-wrap">{sc.report.summary}</p>
              {sc.report.strengths?.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase text-emerald-700">Strengths</div>
                  <ul className="list-disc pl-4 text-xs space-y-0.5">
                    {sc.report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {sc.report.risks?.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase text-destructive">Risks</div>
                  <ul className="list-disc pl-4 text-xs space-y-0.5">
                    {sc.report.risks.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                Recommendation
              </div>
              <p className="text-xs">{sc.report.recommendation}</p>
            </Card>
          )}

          <div className="space-y-2 pt-2 border-t border-border/70">
            <p className="text-[11px] text-muted-foreground">Confirm the final outcome:</p>
            <Button
              onClick={() => sc.decide('approve')}
              disabled={sc.deciding !== null}
              className="w-full gap-2 text-white hover:opacity-90"
              style={theme.buttonGradient}
            >
              {sc.deciding === 'approve'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />}
              Hire
            </Button>
            <Button
              onClick={() => sc.decide('conditional')}
              disabled={sc.deciding !== null}
              variant="outline"
              className="w-full gap-2 border-amber-400/60 text-amber-700 hover:bg-amber-50"
            >
              {sc.deciding === 'conditional'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ShieldCheck className="h-4 w-4" />}
              Conditional Hire
            </Button>
            <Button
              onClick={() => sc.decide('reject')}
              disabled={sc.deciding !== null}
              variant="outline"
              className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              {sc.deciding === 'reject'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <XCircle className="h-4 w-4" />}
              Reject
            </Button>
            <p className="text-[10px] text-muted-foreground text-center leading-tight pt-1">
              Hire / Conditional send the onboarding email. Reject sends the post-interview decline.
            </p>
          </div>
        </TabsContent>

        {/* ───────── Recording markers ───────── */}
        <TabsContent value="recording" className="flex-1 overflow-y-auto px-4 pb-4 mt-3 space-y-3">
          <MarkerComposer onAdd={sc.addMarker} accent={theme.accentText} />
          {sc.markers.length === 0 ? (
            <Card className="p-4 text-[11px] text-muted-foreground text-center">
              No markers yet. Tag standout moments — strong scaffolding, a red flag, a great recovery — and you'll have a list of timestamps to revisit when reviewing.
            </Card>
          ) : (
            <ul className="space-y-1.5">
              {sc.markers
                .slice()
                .sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime())
                .map((m, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{m.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatElapsed(m.elapsed_ms)} · {new Date(m.t).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => sc.removeMarker(i)}
                      className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                      aria-label="Remove marker"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <p className="text-[10px] text-muted-foreground leading-tight">
            Markers are bookmarks only — no media recording is stored. They're saved on the interview record for later review.
          </p>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function MarkerComposer({ onAdd, accent }: { onAdd: (label: string) => void; accent: string }) {
  const [label, setLabel] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(label);
        setLabel('');
      }}
      className="flex gap-2"
    >
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Tag this moment…"
        className="text-sm"
      />
      <Button type="submit" size="sm" className="gap-1.5" variant="outline">
        <Bookmark className={cn('h-3.5 w-3.5', accent)} />
        Mark
      </Button>
    </form>
  );
}

function formatElapsed(ms?: number): string {
  if (!ms || ms < 0) return 'live';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default InterviewAdminSidebar;
