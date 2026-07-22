import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Zap, BookOpen, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostClassFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  teacherId: string;
  lessonId: string;
  roomId?: string;
}

const StarRating = ({
  value,
  onChange,
  label,
  icon: Icon,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  icon: React.ElementType;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  </div>
);

export const PostClassFeedbackModal: React.FC<PostClassFeedbackModalProps> = ({
  isOpen,
  onClose,
  teacherName,
  teacherId,
  lessonId,
  roomId,
}) => {
  const { toast } = useToast();
  const [teacherEnergy, setTeacherEnergy] = useState(0);
  const [materialRelevance, setMaterialRelevance] = useState(0);
  const [feelsConfident, setFeelsConfident] = useState<boolean | null>(null);
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

  const handleSubmit = async () => {
    if (teacherEnergy === 0 || materialRelevance === 0) {
      toast({ title: 'Please rate both categories', variant: 'destructive' });
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
        teacher_energy_rating: teacherEnergy,
        material_relevance_rating: materialRelevance,
        feels_more_confident: feelsConfident,
        improvement_suggestion: suggestion.trim() || null,
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
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
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
          <StarRating
            value={teacherEnergy}
            onChange={setTeacherEnergy}
            label="Teacher Energy"
            icon={Zap}
          />

          <StarRating
            value={materialRelevance}
            onChange={setMaterialRelevance}
            label="Material Relevance"
            icon={BookOpen}
          />

          {/* Euphoria Metric */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Do you feel more confident in English after this lesson?
            </p>
            <div className="flex gap-3">
              {[
                { label: 'Yes 🙌', value: true },
                { label: 'Not really', value: false },
              ].map((opt) => (
                <Button
                  key={String(opt.value)}
                  type="button"
                  variant={feelsConfident === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeelsConfident(opt.value)}
                  className="flex-1"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Suggestion */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              One thing that could be better (optional)
            </p>
            <Textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value.slice(0, 500))}
              placeholder="Share your thoughts..."
              className="resize-none h-20"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {suggestion.length}/500
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
