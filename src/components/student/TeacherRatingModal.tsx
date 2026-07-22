import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface TeacherRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: {
    id: string;
    teacher_id: string;
    teacher_name?: string;
    title: string;
  };
  onRatingSubmitted: () => void;
}

export const TeacherRatingModal = ({ 
  isOpen, 
  onClose, 
  lesson, 
  onRatingSubmitted 
}: TeacherRatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const { toast } = useToast();

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('teacher_reviews')
        .insert({
          student_id: (await supabase.auth.getUser()).data.user?.id,
          teacher_id: lesson.teacher_id,
          booking_id: lesson.id,
          rating: rating,
          review_text: reviewText.trim() || null,
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback! Your rating has been submitted.",
      });

      onRatingSubmitted();
      onClose();
      
      // Reset form
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit your rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center my-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-colors duration-200"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
          >
            <Star 
              size={32}
              className={`${
                star <= (hoveredStar || rating)
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = () => {
    const texts = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return rating > 0 ? texts[rating as keyof typeof texts] : 'Select a rating';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Rate Your Lesson</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium text-lg mb-1">
              {lesson.title}
            </h3>
            {lesson.teacher_name && (
              <p className="text-muted-foreground">
                with {lesson.teacher_name}
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              How would you rate this lesson?
            </p>
            {renderStars()}
            <p className="text-sm font-medium text-primary">
              {getRatingText()}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Review (Optional)
            </label>
            <Textarea
              placeholder="Share your experience with this lesson..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
            {reviewText && (
              <p className="text-xs text-muted-foreground text-right">
                {reviewText.length}/500 characters
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmitRating}
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};