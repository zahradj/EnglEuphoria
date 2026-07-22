/**
 * Unit Progress Report — student-facing modal.
 *
 * Mount `<UnitProgressReportHost/>` once at app root. It listens for the
 * `unit:completed` event emitted by `emitUnitCompleted()` and shows a
 * printable, celebratory summary card.
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Star, Printer, Trophy, Sparkles, BookOpen, Timer, Share2, Compass } from 'lucide-react';
import {
  UNIT_COMPLETED_EVENT,
  type UnitReport,
} from '@/lib/unitProgressReport';
import { supabase } from '@/integrations/supabase/client';

function fmtMinutes(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  return `${mins} min`;
}

const HUB_ACCENT: Record<UnitReport['hub'], string> = {
  playground: 'from-orange-400 to-yellow-300',
  academy: 'from-purple-500 to-indigo-400',
  success: 'from-emerald-500 to-teal-400',
};

export function UnitProgressReport({
  report,
  onClose,
}: {
  report: UnitReport;
  onClose: () => void;
}) {
  const pct = Math.round(report.accuracy * 100);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl print-report print:shadow-none print:border-0 print:max-w-full print:p-0">
        <div
          className={`rounded-t-lg -mx-6 -mt-6 px-6 py-5 bg-gradient-to-br ${HUB_ACCENT[report.hub]} text-white`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6" />
              Unit Complete!
            </DialogTitle>
            <DialogDescription className="text-white/90">
              {report.unitTitle ?? `Unit ${report.unitId}`} · {report.hub} · {report.cefr}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-1 mt-3" aria-label={`${report.stars} of 3 stars`}>
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                className={`h-8 w-8 ${i <= report.stars ? 'fill-yellow-300 text-yellow-300' : 'text-white/30'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5 pt-4">
          {report.studentName && (
            <p className="text-sm text-muted-foreground">
              Great work, <span className="font-semibold text-foreground">{report.studentName}</span>!
            </p>
          )}

          <div>
            <div className="flex items-center justify-between mb-1 text-sm">
              <span className="font-medium">Overall accuracy</span>
              <span className="font-bold">{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <StatCard
              icon={<BookOpen className="h-4 w-4" />}
              label="Lessons"
              value={`${report.lessonsCompleted}/${report.lessonsTotal}`}
            />
            <StatCard
              icon={<Sparkles className="h-4 w-4" />}
              label="Words mastered"
              value={report.masteredWords.length}
            />
            <StatCard
              icon={<Timer className="h-4 w-4" />}
              label="Time practiced"
              value={fmtMinutes(report.totalDurationMs)}
            />
          </div>

          {report.engineRuns && report.engineRuns.length > 0 && (
            <Section title="Immersive Quests">
              <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-900 dark:text-purple-100">
                    <Compass className="h-4 w-4" />
                    {report.engineRuns.length} quest{report.engineRuns.length === 1 ? '' : 's'} completed
                  </div>
                  <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                    {Math.round((report.engineAccuracy ?? 0) * 100)}% avg
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(
                    report.engineRuns.reduce<Record<string, number>>((acc, r) => {
                      acc[r.engine] = (acc[r.engine] ?? 0) + 1;
                      return acc;
                    }, {}),
                  ).map(([kind, n]) => (
                    <Badge key={kind} variant="outline" className="border-purple-300 text-purple-900 dark:text-purple-100">
                      {kind.replace(/_/g, ' ')} ×{n}
                    </Badge>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {report.masteredWords.length > 0 && (
            <Section title="You mastered">
              <div className="flex flex-wrap gap-1.5">
                {report.masteredWords.map((w) => (
                  <Badge key={w} variant="secondary" className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
                    {w}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {report.weakWords.length > 0 && (
            <Section title="Keep practicing">
              <div className="flex flex-wrap gap-1.5">
                {report.weakWords.map((w) => (
                  <Badge key={w} variant="outline">
                    {w}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1.5" /> Print
            </Button>
            <ShareButton report={report} />
            <Button onClick={onClose}>Continue</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}

function ShareButton({ report }: { report: UnitReport }) {
  const [loading, setLoading] = useState(false);
  const onShare = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        toast.error('Sign in to share your report');
        return;
      }
      const { data, error } = await supabase
        .from('unit_progress_reports')
        .insert({
          user_id: userId,
          unit_id: report.unitId,
          unit_title: report.unitTitle ?? null,
          hub: report.hub,
          cefr: report.cefr,
          student_name: report.studentName ?? null,
          accuracy: Number(report.accuracy.toFixed(3)),
          quiz_accuracy: report.quizAccuracy ?? null,
          total_attempts: report.totalAttempts,
          total_correct: report.totalCorrect,
          total_duration_ms: report.totalDurationMs,
          lessons_completed: report.lessonsCompleted ?? null,
          lessons_total: report.lessonsTotal ?? null,
          mastered_words: report.masteredWords,
          weak_words: report.weakWords,
          stars: report.stars,
          engine_runs: report.engineRuns ?? [],
          engine_accuracy: Number((report.engineAccuracy ?? 0).toFixed(3)),
        })
        .select('share_token')
        .single();
      if (error) throw error;
      const url = `${window.location.origin}/reports/${data.share_token}`;
      await navigator.clipboard.writeText(url).catch(() => {});

      // Best-effort: email linked parents with the share link.
      supabase.functions
        .invoke('send-parent-unit-report', {
          body: {
            share_token: data.share_token,
            student_name: report.studentName,
            unit_title: report.unitTitle,
            stars: report.stars,
            accuracy: report.accuracy,
            mastered_count: report.masteredWords?.length ?? 0,
            report_base_url: window.location.origin,
          },
        })
        .then(({ data: r }) => {
          const sent = (r as { sent?: number } | null)?.sent ?? 0;
          if (sent > 0) toast.success(`Sent to ${sent} parent${sent === 1 ? '' : 's'}`);
        })
        .catch(() => {});

      toast.success('Share link copied!', { description: url });
    } catch (e) {
      toast.error('Could not create share link', {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="outline" onClick={onShare} disabled={loading}>
      <Share2 className="h-4 w-4 mr-1.5" />
      {loading ? 'Sharing…' : 'Share with parent'}
    </Button>
  );
}

export function UnitProgressReportHost() {
  const [report, setReport] = useState<UnitReport | null>(null);
  useEffect(() => {
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent<UnitReport>).detail;
      if (detail) setReport(detail);
    };
    window.addEventListener(UNIT_COMPLETED_EVENT, onEvt);
    return () => window.removeEventListener(UNIT_COMPLETED_EVENT, onEvt);
  }, []);
  if (!report) return null;
  return <UnitProgressReport report={report} onClose={() => setReport(null)} />;
}
