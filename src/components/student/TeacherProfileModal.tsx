import { useEffect, useState } from 'react';
import { Star, Globe, Clock, MessageSquareQuote, Languages as LanguagesIcon, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { TeacherProfile } from '@/pages/student/FindTeacher';

interface TeacherReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface TeacherProfileModalProps {
  teacher: TeacherProfile | null;
  hubLabel: string;
  ctaGradient: string;
  onClose: () => void;
  onBook: (teacherUserId: string) => void;
}

// Same YouTube/Vimeo URL -> embeddable player URL logic teachers already
// use to preview their own intro video in ProfileSetupTab.tsx.
function getEmbedUrl(url: string): string | null {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/videos\/)?([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

const formatReviewDate = (iso: string) => {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

export function TeacherProfileModal({ teacher, hubLabel, ctaGradient, onClose, onBook }: TeacherProfileModalProps) {
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch reviews only when a teacher's profile is actually opened — not
  // up front for every card in the grid, which would be one query per
  // teacher on a page that can list dozens of them.
  useEffect(() => {
    if (!teacher) {
      setReviews([]);
      return;
    }
    let cancelled = false;
    setLoadingReviews(true);
    supabase
      .from('teacher_reviews')
      .select('id, rating, review_text, created_at')
      .eq('teacher_id', teacher.user_id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn('[TeacherProfileModal] Failed to load reviews:', error);
          setReviews([]);
        } else {
          setReviews((data as TeacherReview[]) || []);
        }
        setLoadingReviews(false);
      });
    return () => { cancelled = true; };
  }, [teacher]);

  if (!teacher) return null;

  const embedUrl = teacher.video_url ? getEmbedUrl(teacher.video_url) : null;

  return (
    <Dialog open={!!teacher} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{teacher.full_name}'s profile</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 border-2 border-border">
              {teacher.profile_image_url ? (
                <AvatarImage src={teacher.profile_image_url} alt={teacher.full_name || 'Teacher'} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                {teacher.full_name?.charAt(0)?.toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            {teacher.is_available && (
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{teacher.full_name}</h2>
              <Badge variant="secondary" className="text-xs">{hubLabel}</Badge>
            </div>
            {teacher.rating ? (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{teacher.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({teacher.total_reviews ?? 0} review{(teacher.total_reviews ?? 0) === 1 ? '' : 's'})
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Intro video */}
        {embedUrl && (
          <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
            <iframe
              src={embedUrl}
              title={`${teacher.full_name}'s intro video`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Bio */}
        {teacher.bio && (
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{teacher.bio}</p>
        )}

        {/* Quick facts */}
        <div className="flex flex-wrap gap-2">
          {teacher.accent && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Globe className="h-3 w-3" /> {teacher.accent} accent
            </Badge>
          )}
          {!!teacher.years_experience && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Clock className="h-3 w-3" /> {teacher.years_experience} year{teacher.years_experience === 1 ? '' : 's'} experience
            </Badge>
          )}
          {teacher.timezone && (
            <Badge variant="secondary" className="text-xs gap-1">
              <MapPin className="h-3 w-3" /> {teacher.timezone}
            </Badge>
          )}
        </div>

        {/* Specializations */}
        {teacher.specializations && teacher.specializations.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Specializes in</h3>
            <div className="flex flex-wrap gap-1.5">
              {teacher.specializations.map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {teacher.languages_spoken && teacher.languages_spoken.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <LanguagesIcon className="h-3 w-3" /> Speaks
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {teacher.languages_spoken.map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <MessageSquareQuote className="h-3 w-3" /> Student reviews
          </h3>
          {loadingReviews ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No public reviews yet — be the first to book and leave one!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatReviewDate(review.created_at)}</span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-foreground/80 mt-1.5">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          onClick={() => onBook(teacher.user_id)}
          className={cn("w-full text-white shadow-md", ctaGradient)}
        >
          Book a Session with {teacher.full_name?.split(' ')[0] || 'this teacher'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
