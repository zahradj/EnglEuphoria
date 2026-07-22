import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Users, Video, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CommunityEvent } from '@/types/community';
import { format, isAfter, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CommunityEventsProps {
  communityId: string;
}

export function CommunityEvents({ communityId }: CommunityEventsProps) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [communityId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          organizer:users!organizer_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_event_participants')
        .insert({
          event_id: eventId,
          user_id: user.user.id
        });

      if (error) throw error;

      toast({
        title: 'Joined Event',
        description: 'You have successfully joined the event!'
      });

      fetchEvents(); // Refresh to update participant count
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: 'Error',
        description: 'Failed to join event',
        variant: 'destructive'
      });
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'speaking_session':
        return <Video className="w-4 h-4" />;
      case 'workshop':
        return <Calendar className="w-4 h-4" />;
      case 'cultural_exchange':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'speaking_session':
        return 'Speaking Session';
      case 'workshop':
        return 'Workshop';
      case 'cultural_exchange':
        return 'Cultural Exchange';
      default:
        return 'Event';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'speaking_session':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-green-100 text-green-800';
      case 'cultural_exchange':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((groups: { [key: string]: CommunityEvent[] }, event) => {
    const date = format(new Date(event.scheduled_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isSameDay(new Date(date), new Date()) 
              ? 'Today' 
              : format(new Date(date), 'EEEE, MMMM d, yyyy')
            }
          </h3>
          
          <div className="space-y-3">
            {dayEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge className={`text-xs ${getEventTypeColor(event.event_type)}`}>
                          {getEventTypeIcon(event.event_type)}
                          <span className="ml-1">{getEventTypeLabel(event.event_type)}</span>
                        </Badge>
                        {event.status !== 'scheduled' && (
                          <Badge variant="outline" className="text-xs">
                            {event.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.scheduled_at), 'h:mm a')} 
                          ({event.duration_minutes} min)
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.current_participants}/{event.max_participants} participants
                        </div>
                        
                        {event.organizer && (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={event.organizer.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {event.organizer.full_name?.substring(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span>Organized by {event.organizer.full_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {event.current_participants >= event.max_participants ? (
                        <Button variant="outline" disabled>
                          Full
                        </Button>
                      ) : isAfter(new Date(), new Date(event.scheduled_at)) ? (
                        <Button variant="outline" disabled>
                          Past Event
                        </Button>
                      ) : (
                        <Button onClick={() => joinEvent(event.id)}>
                          {event.requires_signup ? 'Sign Up' : 'Join'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {events.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
            <p className="text-muted-foreground">
              Community events will appear here when they're scheduled.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}