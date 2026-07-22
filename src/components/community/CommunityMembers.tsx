import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Crown, Shield, User, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CommunityMembership } from '@/types/community';
import { formatDistanceToNow } from 'date-fns';

interface CommunityMembersProps {
  communityId: string;
}

interface MemberWithProfile extends CommunityMembership {
  user_profile?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

export function CommunityMembers({ communityId }: CommunityMembersProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchMembers();
  }, [communityId]);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, roleFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_memberships')
        .select(`
          *,
          user_profile:users!user_id (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('community_id', communityId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.user_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'moderator':
        return 'Moderator';
      case 'guest':
        return 'Guest';
      default:
        return 'Member';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'guest':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="h-10 bg-muted rounded mb-4"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2 w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owners</SelectItem>
                <SelectItem value="moderator">Moderators</SelectItem>
                <SelectItem value="member">Members</SelectItem>
                <SelectItem value="guest">Guests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Community Members ({filteredMembers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.user_profile?.avatar_url} />
                      <AvatarFallback>
                        {member.user_profile?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.user_profile?.full_name || 'Anonymous User'}
                        </span>
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                        </span>
                        {member.total_contributions > 0 && (
                          <>
                            <span>•</span>
                            <span>{member.total_contributions} contributions</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </Badge>
                    
                    {member.weekly_hours_contributed > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {member.weekly_hours_contributed}h this week
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredMembers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No members found</h3>
            <p className="text-muted-foreground">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'This community has no members yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}