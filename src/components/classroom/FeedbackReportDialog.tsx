import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star, ClipboardCheck, Loader2, History } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId?: string | null;
  lessonTitle?: string;
  /** Teacher-only: when provided alongside viewerRole="teacher", also loads
   *  every other feedback report on file for this student — including ones
   *  written by a *previous* teacher, so a new teacher has context. */
  studentId?: string | null;
  viewerRole?: 'teacher' | 'student';
}

interface FeedbackContent {
  areas_for_improvement?: string[];
  quick_notes?: string;
  skill_scores?: Record<string, number>;
}

interface HistoryEntry {
  id: string;
  lesson_id: string;
  teacher_id: string;
  teacherName: string;
  submitted_at: string;
  content: FeedbackContent;
  rating: number;
}

const SKILL_LABELS: Record<string, string> = {
  professional_vocabulary: 'Professional Vocabulary',
  fluency: 'Fluency',
  grammar_accuracy: 'Grammar Accuracy',
  business_writing: 'Business Writing',
  listening: 'Listening',
};

export const FeedbackReportDialog: React.FC<FeedbackReportDialogProps> = ({
  open,
  onOpenChange,
  lessonId,
  lessonTitle,
  studentId,
  viewerRole,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [parsedContent, setParsedContent] = useState<FeedbackContent | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!open || !lessonId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFeedback(null);
      setParsedContent(null);
      try {
        const { data } = await supabase
          .from('lesson_feedback_submissions')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;
        setFeedback(data);

        if (data?.feedback_content) {
          try {
            const parsed = typeof data.feedback_content === 'string'
              ? JSON.parse(data.feedback_content)
              : data.feedback_content;
            setParsedContent(parsed);
          } catch {
            setParsedContent({ quick_notes: String(data.feedback_content) });
          }
        }
      } catch (err) {
        console.error('Failed to load feedback:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, lessonId]);

  // Teacher viewer only: pull every other report on file for this student —
  // including ones written by a previous teacher — so a teacher who just
  // inherited the student has real context, not a blank slate.
  useEffect(() => {
    if (!open || viewerRole !== 'teacher' || !studentId) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      try {
        const { data: rows } = await supabase
          .from('lesson_feedback_submissions')
          .select('id, lesson_id, teacher_id, submitted_at, feedback_content, student_performance_rating')
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false })
          .limit(20);

        if (cancelled) return;
        const others = (rows ?? []).filter((r) => r.lesson_id !== lessonId);
        if (others.length === 0) { setHistory([]); return; }

        const teacherIds = Array.from(new Set(others.map((r) => r.teacher_id).filter(Boolean)));
        const { data: profs } = teacherIds.length
          ? await supabase.from('users').select('id, full_name').in('id', teacherIds)
          : { data: [] as { id: string; full_name: string | null }[] };
        const nameById: Record<string, string> = {};
        (profs ?? []).forEach((p) => { nameById[p.id] = p.full_name || 'Teacher'; });

        setHistory(others.map((r) => {
          let content: FeedbackContent = {};
          try {
            content = typeof r.feedback_content === 'string' ? JSON.parse(r.feedback_content) : (r.feedback_content ?? {});
          } catch { /* leave empty */ }
          return {
            id: r.id,
            lesson_id: r.lesson_id,
            teacher_id: r.teacher_id,
            teacherName: nameById[r.teacher_id] || 'Teacher',
            submitted_at: r.submitted_at,
            content,
            rating: r.student_performance_rating ?? 0,
          };
        }));
      } catch (err) {
        console.error('Failed to load student feedback history:', err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, viewerRole, studentId, lessonId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-500" />
            Session Feedback Report
          </DialogTitle>
          {lessonTitle && (
            <p className="text-sm text-muted-foreground">{lessonTitle}</p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading feedback…</span>
          </div>
        ) : !feedback ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No feedback has been submitted for this lesson yet.
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Performance Rating */}
            {feedback.student_performance_rating > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Performance Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= feedback.student_performance_rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {parsedContent?.areas_for_improvement && parsedContent.areas_for_improvement.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Areas for Improvement</p>
                <div className="flex flex-wrap gap-2">
                  {parsedContent.areas_for_improvement.map(area => (
                    <Badge key={area} variant="outline" className="border-amber-500/40 text-amber-600">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Scores */}
            {parsedContent?.skill_scores && Object.keys(parsedContent.skill_scores).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Skill Scores</p>
                <div className="space-y-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                  {Object.entries(parsedContent.skill_scores).map(([key, score]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span>{SKILL_LABELS[key] || key}</span>
                      <span className="font-mono text-blue-600">{Number(score).toFixed(1)} / 10</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Notes */}
            {parsedContent?.quick_notes && (
              <div>
                <p className="text-sm font-medium mb-2">Teacher Notes</p>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm whitespace-pre-wrap">
                  {parsedContent.quick_notes}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-right">
              Submitted {new Date(feedback.submitted_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* Previous notes from other teachers — continuity when a student
            switches teachers. Shown regardless of whether this specific
            lesson has its own report yet. */}
        {viewerRole === 'teacher' && (historyLoading || history.length > 0) && (
          <div className="mt-2 pt-4 border-t border-border/60">
            <p className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-muted-foreground">
              <History className="w-4 h-4" /> Previous notes on this student
            </p>
            {historyLoading ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-xs">Loading history…</span>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold">{h.teacherName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(h.submitted_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {h.rating > 0 && (
                      <div className="flex gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= h.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'}`}
                          />
                        ))}
                      </div>
                    )}
                    {h.content.quick_notes && (
                      <p className="text-xs text-foreground/80 whitespace-pre-wrap">{h.content.quick_notes}</p>
                    )}
                    {h.content.areas_for_improvement && h.content.areas_for_improvement.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {h.content.areas_for_improvement.map((area) => (
                          <Badge key={area} variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
