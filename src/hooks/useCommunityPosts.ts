import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { CommunityPost, CreatePostData, CreateReplyData, CommunityPostReply } from '@/types/community';
import { useToast } from './use-toast';

export function useCommunityPosts(communityId: string | null) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    if (!communityId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:users!author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreatePostData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: post, error } = await supabase
        .from('community_posts')
        .insert({
          ...postData,
          author_id: user.user.id
        })
        .select(`
          *,
          author:users!author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setPosts(prev => [post, ...prev]);
      toast({
        title: 'Post Created',
        description: 'Your post has been published!'
      });

      return post;
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create post',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('content_type', 'post')
        .eq('content_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('community_likes')
          .delete()
          .eq('user_id', user.user.id)
          .eq('content_type', 'post')
          .eq('content_id', postId);

        // Update post likes count
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        // Like
        await supabase
          .from('community_likes')
          .insert({
            user_id: user.user.id,
            content_type: 'post',
            content_id: postId
          });

        // Update post likes count
        await supabase.rpc('increment_post_likes', { post_id: postId });
      }

      // Refresh posts
      fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!communityId) return;

    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
          filter: `community_id=eq.${communityId}`
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId]);

  return {
    posts,
    loading,
    error,
    createPost,
    likePost,
    refetch: fetchPosts
  };
}

export function usePostReplies(postId: string | null) {
  const [replies, setReplies] = useState<CommunityPostReply[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReplies = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_post_replies')
        .select(`
          *,
          author:users!author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (err) {
      console.error('Error fetching replies:', err);
    } finally {
      setLoading(false);
    }
  };

  const createReply = async (replyData: CreateReplyData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: reply, error } = await supabase
        .from('community_post_replies')
        .insert({
          ...replyData,
          author_id: user.user.id
        })
        .select(`
          *,
          author:users!author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setReplies(prev => [...prev, reply]);
      toast({
        title: 'Reply Posted',
        description: 'Your reply has been added!'
      });

      return reply;
    } catch (err) {
      console.error('Error creating reply:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to post reply',
        variant: 'destructive'
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [postId]);

  return {
    replies,
    loading,
    createReply,
    refetch: fetchReplies
  };
}