import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, User, MessageSquare } from 'lucide-react';
import { TeacherRatingModal } from './TeacherRatingModal';
import { supabase } from '@/lib/supabase';

interface CompletedLessonCardProps {
  lesson: {
    id: string;
    title: string;
    teacher_id: string;
    teacher_name?: string;
    scheduled_at: string;
    duration: number;
    completed_at?: string;
    status: string;
  };
  onUpdate?: () => void;
}

export const CompletedLessonCard = ({ lesson, onUpdate }: CompletedLessonCardProps) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [checkingRating, setCheckingRating] = useState(true);

  useEffect(() => {
    checkExistingRating();
  }, [lesson.id]);

  const checkExistingRating = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: rating, error } = await supabase
        .from('teacher_reviews')
        .select('rating')
        .eq('booking_id', lesson.id)
        .eq('student_id', user.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing rating:', error);
        return;
      }

      setHasRated(!!rating);
      setUserRating(rating?.rating || null);
    } catch (error) {
      console.error('Error in checkExistingRating:', error);
    } finally {
      setCheckingRating(false);
    }
  };

  const handleRatingSubmitted = () => {
    setHasRated(true);
    checkExistingRating();
    if (onUpdate) onUpdate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{lesson.title}</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Completed
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {lesson.teacher_name && (
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{lesson.teacher_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{lesson.duration} min</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Completed: {formatDate(lesson.completed_at || lesson.scheduled_at)}</p>
          </div>

          {!checkingRating && (
            <div className="flex items-center justify-between pt-2">
              {hasRated && userRating ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Your rating:</span>
                  {renderStars(userRating)}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Share your experience
                  </span>
                </div>
              )}
              
              <Button
                variant={hasRated ? "outline" : "default"}
                size="sm"
                onClick={() => setShowRatingModal(true)}
                className={hasRated ? "text-xs" : ""}
              >
                {hasRated ? 'Update Rating' : 'Rate Lesson'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TeacherRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        lesson={lesson}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </>
  );
};