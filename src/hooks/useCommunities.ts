import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Community, CommunityFilters, CreateCommunityData } from '@/types/community';
import { useToast } from './use-toast';

export function useCommunities(filters?: CommunityFilters) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.cefr_level) {
        query = query.eq('cefr_level', filters.cefr_level);
      }
      if (filters?.privacy_level) {
        query = query.eq('privacy_level', filters.privacy_level);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      console.error('Error fetching communities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [filters]);

  const createCommunity = async (data: CreateCommunityData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: community, error } = await supabase
        .from('communities')
        .insert({
          ...data,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await supabase
        .from('community_memberships')
        .insert({
          community_id: community.id,
          user_id: user.user.id,
          role: 'owner'
        });

      setCommunities(prev => [community, ...prev]);
      toast({
        title: 'Community Created',
        description: 'Your community has been successfully created!'
      });

      return community;
    } catch (err) {
      console.error('Error creating community:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create community',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId,
          user_id: user.user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: 'Joined Community',
        description: 'Welcome to the community!'
      });

      // Refresh communities to update member count
      fetchCommunities();
    } catch (err) {
      console.error('Error joining community:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to join community',
        variant: 'destructive'
      });
    }
  };

  const leaveCommunity = async (communityId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.user.id);

      if (error) throw error;

      toast({
        title: 'Left Community',
        description: 'You have left the community.'
      });

      // Refresh communities to update member count
      fetchCommunities();
    } catch (err) {
      console.error('Error leaving community:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to leave community',
        variant: 'destructive'
      });
    }
  };

  return {
    communities,
    loading,
    error,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    refetch: fetchCommunities
  };
}