import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SlideComment {
  id: string;
  lesson_id: string;
  slide_id: string;
  user_id: string;
  author_name: string | null;
  body: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Realtime collaborative comments for a lesson's slides.
 * Returns all comments for the lesson; filter per slide in the UI.
 */
export function useSlideComments(lessonId: string | null) {
  const [comments, setComments] = useState<SlideComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('Anonymous');

  // Fetch current user once
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const u = data.user;
      setCurrentUserId(u?.id ?? null);
      const meta = (u?.user_metadata ?? {}) as Record<string, any>;
      setCurrentUserName(
        meta.full_name || meta.name || u?.email?.split('@')[0] || 'Anonymous'
      );
    });
    return () => { cancelled = true; };
  }, []);

  // Initial fetch + realtime subscription scoped to the lesson
  useEffect(() => {
    if (!lessonId) {
      setComments([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('creator_slide_comments')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[useSlideComments] fetch error', error);
      } else {
        setComments((data ?? []) as SlideComment[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel(`slide-comments:${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creator_slide_comments',
          filter: `lesson_id=eq.${lessonId}`,
        },
        (payload) => {
          setComments((prev) => {
            if (payload.eventType === 'INSERT') {
              const next = payload.new as SlideComment;
              if (prev.some((c) => c.id === next.id)) return prev;
              return [...prev, next].sort((a, b) =>
                a.created_at.localeCompare(b.created_at)
              );
            }
            if (payload.eventType === 'UPDATE') {
              const next = payload.new as SlideComment;
              return prev.map((c) => (c.id === next.id ? next : c));
            }
            if (payload.eventType === 'DELETE') {
              const old = payload.old as SlideComment;
              return prev.filter((c) => c.id !== old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  const addComment = useCallback(
    async (slideId: string, body: string) => {
      if (!lessonId) {
        toast.error('Save the lesson once before adding comments.');
        return null;
      }
      if (!currentUserId) {
        toast.error('You must be signed in to comment.');
        return null;
      }
      const trimmed = body.trim();
      if (!trimmed) return null;

      const { data, error } = await supabase
        .from('creator_slide_comments')
        .insert({
          lesson_id: lessonId,
          slide_id: slideId,
          user_id: currentUserId,
          author_name: currentUserName,
          body: trimmed,
        })
        .select()
        .single();

      if (error) {
        console.error('[useSlideComments] add error', error);
        toast.error('Could not post comment.');
        return null;
      }
      return data as SlideComment;
    },
    [lessonId, currentUserId, currentUserName]
  );

  const toggleResolved = useCallback(
    async (id: string, resolved: boolean) => {
      const { error } = await supabase
        .from('creator_slide_comments')
        .update({ resolved })
        .eq('id', id);
      if (error) {
        console.error('[useSlideComments] toggle error', error);
        toast.error('Could not update comment.');
      }
    },
    []
  );

  const deleteComment = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('creator_slide_comments')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[useSlideComments] delete error', error);
      toast.error('Could not delete comment.');
    }
  }, []);

  const commentsForSlide = useCallback(
    (slideId: string) => comments.filter((c) => c.slide_id === slideId),
    [comments]
  );

  return {
    comments,
    commentsForSlide,
    loading,
    currentUserId,
    addComment,
    toggleResolved,
    deleteComment,
  };
}
