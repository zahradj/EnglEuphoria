import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageSquare, Clock, Globe, Lock, UserCheck } from 'lucide-react';
import { Community } from '@/types/community';
import { useNavigate } from 'react-router-dom';

interface CommunityCardProps {
  community: Community;
  onJoin?: () => void;
  showJoinButton?: boolean;
  userMembership?: 'none' | 'member' | 'moderator' | 'owner';
}

export function CommunityCard({ 
  community, 
  onJoin, 
  showJoinButton = true,
  userMembership = 'none'
}: CommunityCardProps) {
  const navigate = useNavigate();

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'conversation_practice': 'Conversation',
      'business_english': 'Business',
      'ielts_preparation': 'IELTS',
      'academic_english': 'Academic',
      'cultural_exchange': 'Cultural',
      'pronunciation': 'Pronunciation',
      'writing_practice': 'Writing',
      'general_discussion': 'General'
    };
    return categoryMap[category] || category;
  };

  const getPrivacyIcon = () => {
    switch (community.privacy_level) {
      case 'public':
        return <Globe className="w-3 h-3" />;
      case 'private':
        return <Lock className="w-3 h-3" />;
      case 'invite_only':
        return <UserCheck className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  const handleViewCommunity = () => {
    navigate(`/community/${community.id}`);
  };

  const isMember = userMembership !== 'none';
  const isFull = community.current_members >= community.max_members;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewCommunity}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{community.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getPrivacyIcon()}
              <span className="text-xs text-muted-foreground capitalize">
                {community.privacy_level}
              </span>
            </div>
          </div>
          {community.banner_url && (
            <Avatar className="w-12 h-12">
              <AvatarImage src={community.banner_url} alt={community.name} />
              <AvatarFallback>
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {community.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {getCategoryLabel(community.category)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {community.cefr_level}
          </Badge>
          {community.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{community.current_members}/{community.max_members}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{community.weekly_goal_hours}h/week</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {showJoinButton && (
          <div className="pt-2" onClick={(e) => e.stopPropagation()}>
            {isMember ? (
              <Button variant="outline" className="w-full" disabled>
                {userMembership === 'owner' ? 'Owner' : 
                 userMembership === 'moderator' ? 'Moderator' : 'Member'}
              </Button>
            ) : isFull ? (
              <Button variant="outline" className="w-full" disabled>
                Community Full
              </Button>
            ) : community.requires_approval ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onJoin}
              >
                Request to Join
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={onJoin}
              >
                Join Community
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}