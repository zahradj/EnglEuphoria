import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star, ClipboardCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId?: string | null;
  lessonTitle?: string;
}

interface FeedbackContent {
  words_mastered?: string[];
  areas_for_improvement?: string[];
  quick_notes?: string;
  skill_scores?: Record<string, number>;
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
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [parsedContent, setParsedContent] = useState<FeedbackContent | null>(null);

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

            {/* Words Mastered */}
            {parsedContent?.words_mastered && parsedContent.words_mastered.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Words Mastered</p>
                <div className="flex flex-wrap gap-2">
                  {parsedContent.words_mastered.map(word => (
                    <Badge key={word} className="bg-emerald-600 hover:bg-emerald-600 text-white">
                      ✓ {word}
                    </Badge>
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
      </DialogContent>
    </Dialog>
  );
};
