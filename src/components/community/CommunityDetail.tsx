import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Globe, 
  Lock, 
  UserCheck,
  Trophy,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Community, CommunityMembership } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { CommunityPosts } from './CommunityPosts';
import { CommunityEvents } from './CommunityEvents';
import { CommunityMembers } from './CommunityMembers';

export function CommunityDetail() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [membership, setMembership] = useState<CommunityMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (communityError) throw communityError;
      setCommunity(communityData);

      // Check user membership
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: membershipData } = await supabase
          .from('community_memberships')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.user.id)
          .single();
        
        setMembership(membershipData);
      }
    } catch (error) {
      console.error('Error fetching community:', error);
      toast({
        title: 'Error',
        description: 'Failed to load community details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId!,
          user_id: user.user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: 'Joined Community',
        description: 'Welcome to the community!'
      });

      // Refresh data
      fetchCommunityData();
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: 'Error',
        description: 'Failed to join community',
        variant: 'destructive'
      });
    }
  };

  const leaveCommunity = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('community_id', communityId!)
        .eq('user_id', user.user.id);

      if (error) throw error;

      toast({
        title: 'Left Community',
        description: 'You have left the community.'
      });

      setMembership(null);
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave community',
        variant: 'destructive'
      });
    }
  };

  const getPrivacyIcon = () => {
    if (!community) return <Globe className="w-4 h-4" />;
    
    switch (community.privacy_level) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'invite_only':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'conversation_practice': 'Conversation Practice',
      'business_english': 'Business English',
      'ielts_preparation': 'IELTS Preparation',
      'academic_english': 'Academic English',
      'cultural_exchange': 'Cultural Exchange',
      'pronunciation': 'Pronunciation',
      'writing_practice': 'Writing Practice',
      'general_discussion': 'General Discussion'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <Card>
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded mb-4 w-1/2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Community not found</h3>
            <p className="text-muted-foreground mb-4">The community you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/communities')}>
              Back to Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMember = membership !== null;
  const canManage = membership?.role === 'owner' || membership?.role === 'moderator';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/communities')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Communities
        </Button>
      </div>

      {/* Community Info Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{community.name}</CardTitle>
                {getPrivacyIcon()}
                <span className="text-sm text-muted-foreground capitalize">
                  {community.privacy_level}
                </span>
              </div>
              
              {community.description && (
                <CardDescription className="text-base mb-4">
                  {community.description}
                </CardDescription>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  {getCategoryLabel(community.category)}
                </Badge>
                <Badge variant="outline">
                  {community.cefr_level}
                </Badge>
                {community.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{community.current_members}/{community.max_members} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{community.weekly_goal_hours}h/week goal</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span>Active discussions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Weekly events</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!isMember ? (
                <Button onClick={joinCommunity}>
                  {community.requires_approval ? 'Request to Join' : 'Join Community'}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={leaveCommunity}>
                    Leave Community
                  </Button>
                  {canManage && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Manage
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Community Rules */}
      {community.community_rules && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {community.community_rules}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      {isMember ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="posts" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="w-4 h-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <CommunityPosts communityId={community.id} />
          </TabsContent>

          <TabsContent value="events">
            <CommunityEvents communityId={community.id} />
          </TabsContent>

          <TabsContent value="members">
            <CommunityMembers communityId={community.id} />
          </TabsContent>

          <TabsContent value="challenges">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Community Challenges</h3>
                <p className="text-muted-foreground">Coming soon! Participate in weekly challenges to improve your skills.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Join to Access Community Content</h3>
            <p className="text-muted-foreground mb-4">
              Become a member to participate in discussions, attend events, and connect with other learners.
            </p>
            <Button onClick={joinCommunity}>
              {community.requires_approval ? 'Request to Join' : 'Join Community'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}