import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostLessonRatingCardProps {
  bookingId: string;
  teacherId: string;
  studentId: string;
  accentClass: string;
}

/**
 * Small inline card shown to the student right on the post-lesson summary
 * page — tap a star, done. Writes to the same teacher_reviews table the
 * fuller TeacherRatingModal (dashboard) uses, so both feed teacher_profiles.rating.
 */
export const PostLessonRatingCard: React.FC<PostLessonRatingCardProps> = ({
  bookingId,
  teacherId,
  studentId,
  accentClass,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('teacher_reviews')
      .select('rating')
      .eq('booking_id', bookingId)
      .eq('student_id', studentId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.rating) {
          setRating(data.rating);
          setSubmitted(true);
        }
        setChecking(false);
      });
    return () => { cancelled = true; };
  }, [bookingId, studentId]);

  const submitRating = async (stars: number) => {
    if (submitting || submitted) return;
    setRating(stars);
    setSubmitting(true);
    try {
      const { error } = await supabase.from('teacher_reviews').upsert({
        student_id: studentId,
        teacher_id: teacherId,
        booking_id: bookingId,
        rating: stars,
        is_public: true,
      }, { onConflict: 'booking_id,student_id' });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit teacher rating:', err);
      toast({ title: 'Could not save your rating', description: 'Please try again.', variant: 'destructive' });
      setRating(0);
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return null;

  return (
    <div className="mt-6 mx-auto max-w-xs rounded-2xl border border-slate-200 bg-white/85 backdrop-blur p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
        {submitted ? 'Thanks for your rating!' : 'Rate your teacher'}
      </p>
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting || submitted}
            onMouseEnter={() => !submitted && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => submitRating(star)}
            className="transition-transform hover:scale-110 disabled:cursor-default"
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            <Star
              className={`w-7 h-7 ${
                star <= (hovered || rating) ? `${accentClass} fill-current` : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
