import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostClassFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * When provided (class still running), dismissing the dialog keeps the
   * student in class instead of leaving, and a "Stay in class" button is shown.
   */
  onStay?: () => void;
  teacherName: string;
  teacherId: string;
  lessonId: string;
  roomId?: string;
}

export const PostClassFeedbackModal: React.FC<PostClassFeedbackModalProps> = ({
  isOpen,
  onClose,
  onStay,
  teacherName,
  teacherId,
  lessonId,
  roomId,
}) => {
  const { toast } = useToast();
  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endedAt, setEndedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !roomId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('classroom_timeline_events')
        .select('occurred_at')
        .eq('room_id', roomId)
        .eq('event_type', 'session_ended')
        .order('occurred_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data?.occurred_at) setEndedAt(data.occurred_at);
    })();
    return () => { cancelled = true; };
  }, [isOpen, roomId]);

  // Reset for the next lesson's feedback prompt rather than carrying over
  // whatever was picked last time.
  useEffect(() => {
    if (isOpen) {
      setThumbsUp(null);
      setSuggestion('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (thumbsUp === null) {
      toast({ title: 'Please choose thumbs up or down', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('post_class_feedback').insert({
        student_id: user.id,
        teacher_id: teacherId,
        lesson_id: lessonId,
        thumbs_up: thumbsUp,
        submitted_by_role: 'student',
        submitted_by_user_id: user.id,
        improvement_suggestion: !thumbsUp ? (suggestion.trim() || null) : null,
      });

      if (error) throw error;

      toast({
        title: 'Thank you! 🎉',
        description: 'Your feedback helps us improve every session.',
      });
    } catch (err) {
      console.error('Feedback submission error:', err);
      toast({ title: 'Could not save feedback', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) (onStay ?? onClose)(); }}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            How was your session with {teacherName}?
          </DialogTitle>
        </DialogHeader>

        {endedAt && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Class ended at{' '}
              {new Date(endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        <div className="space-y-6 py-2">
          <div className="flex justify-center gap-6">
            <button
              type="button"
              onClick={() => setThumbsUp(true)}
              aria-label="Thumbs up"
              aria-pressed={thumbsUp === true}
              className={`flex flex-col items-center gap-2 rounded-2xl px-8 py-5 border-2 transition-all hover:scale-105 ${
                thumbsUp === true
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-border bg-muted/30 hover:border-emerald-500/50'
              }`}
            >
              <ThumbsUp className={`w-10 h-10 ${thumbsUp === true ? 'fill-emerald-500 text-emerald-500' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${thumbsUp === true ? 'text-emerald-600' : 'text-muted-foreground'}`}>Good</span>
            </button>
            <button
              type="button"
              onClick={() => setThumbsUp(false)}
              aria-label="Thumbs down"
              aria-pressed={thumbsUp === false}
              className={`flex flex-col items-center gap-2 rounded-2xl px-8 py-5 border-2 transition-all hover:scale-105 ${
                thumbsUp === false
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-border bg-muted/30 hover:border-red-500/50'
              }`}
            >
              <ThumbsDown className={`w-10 h-10 ${thumbsUp === false ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${thumbsUp === false ? 'text-red-600' : 'text-muted-foreground'}`}>Not great</span>
            </button>
          </div>

          {/* Only asked on a thumbs-down — a thumbs-up doesn't need a reason. */}
          {thumbsUp === false && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <p className="text-sm font-medium text-muted-foreground">
                One thing that could be better (optional)
              </p>
              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value.slice(0, 500))}
                placeholder="Share your thoughts..."
                className="resize-none h-20"
                maxLength={500}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-right">
                {suggestion.length}/500
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={isSubmitting || thumbsUp === null}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {onStay ? 'Skip & leave' : 'Skip'}
          </button>
          {onStay && (
            <Button type="button" variant="outline" onClick={onStay}>
              Stay in class
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
