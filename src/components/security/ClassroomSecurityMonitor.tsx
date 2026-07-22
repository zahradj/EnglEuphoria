import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityAudit } from './SecurityAuditLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ClassroomSecurityEvent {
  id: string;
  roomId: string;
  userId: string;
  event: string;
  timestamp: string;
  metadata?: any;
}

interface ClassroomSecurityMonitorProps {
  roomId: string;
  isActive: boolean;
}

export const ClassroomSecurityMonitor: React.FC<ClassroomSecurityMonitorProps> = ({
  roomId,
  isActive
}) => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityAudit();
  const [securityEvents, setSecurityEvents] = useState<ClassroomSecurityEvent[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (!isActive || !roomId) return;

    // Log classroom access
    logSecurityEvent('classroom_access', {
      resource: 'classroom',
      resourceId: roomId,
      metadata: {
        userRole: user?.role,
        timestamp: new Date().toISOString()
      }
    });

    // Monitor for suspicious activity patterns
    const monitoringInterval = setInterval(() => {
      checkForSuspiciousActivity();
    }, 30000); // Check every 30 seconds

    // Set up real-time monitoring for classroom events
    const channel = supabase
      .channel(`classroom-security-${roomId}`)
      .on('broadcast', { event: 'security-event' }, (payload) => {
        handleSecurityEvent(payload);
      })
      .subscribe();

    return () => {
      clearInterval(monitoringInterval);
      channel.unsubscribe();
    };
  }, [roomId, isActive, user?.role]);

  const handleSecurityEvent = (payload: any) => {
    const event: ClassroomSecurityEvent = {
      id: Date.now().toString(),
      roomId: payload.roomId,
      userId: payload.userId,
      event: payload.event,
      timestamp: new Date().toISOString(),
      metadata: payload.metadata
    };

    setSecurityEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events

    // Check for suspicious patterns
    if (payload.event === 'unauthorized_access' || payload.event === 'multiple_failed_joins') {
      setSuspiciousActivity(true);
      logSecurityEvent('suspicious_classroom_activity', {
        resource: 'classroom',
        resourceId: roomId,
        metadata: payload
      });
    }
  };

  const checkForSuspiciousActivity = async () => {
    try {
      // Check for multiple rapid join/leave events
      const recentEvents = securityEvents.filter(
        event => Date.now() - new Date(event.timestamp).getTime() < 60000 // Last minute
      );

      const joinLeaveEvents = recentEvents.filter(
        event => event.event === 'participant_joined' || event.event === 'participant_left'
      );

      if (joinLeaveEvents.length > 10) {
        setSuspiciousActivity(true);
        logSecurityEvent('rapid_join_leave_pattern', {
          resource: 'classroom',
          resourceId: roomId,
          metadata: {
            eventCount: joinLeaveEvents.length,
            timeWindow: '1 minute'
          }
        });
      }

      // Check for unauthorized access attempts
      const { data: roomAccess, error } = await supabase
        .from('lessons')
        .select('teacher_id, student_id')
        .eq('room_id', roomId)
        .single();

      if (!error && roomAccess && user) {
        const isAuthorized = roomAccess.teacher_id === user.id || roomAccess.student_id === user.id;
        if (!isAuthorized) {
          setSuspiciousActivity(true);
          logSecurityEvent('unauthorized_room_access', {
            resource: 'classroom',
            resourceId: roomId,
            metadata: {
              attemptedBy: user.id,
              authorizedUsers: [roomAccess.teacher_id, roomAccess.student_id]
            }
          });
        }
      }
    } catch (error) {
      console.error('Security monitoring error:', error);
    }
  };

  const getSecurityStatus = () => {
    if (suspiciousActivity) return { color: 'destructive', icon: AlertTriangle, text: 'Threat Detected' };
    if (isActive) return { color: 'default', icon: Shield, text: 'Protected' };
    return { color: 'secondary', icon: Eye, text: 'Monitoring' };
  };

  const status = getSecurityStatus();

  if (!user?.role || (user.role !== 'teacher' && user.role !== 'admin')) {
    return null; // Only show to teachers and admins
  }

  return (
    <Card className="border-security-border bg-security-background">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <status.icon className="h-4 w-4" />
          Classroom Security
          <Badge variant={status.color as any} className="text-xs">
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Participants: {participantCount}
          </span>
          <span>Room: {roomId.slice(-8)}</span>
        </div>
        
        {suspiciousActivity && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Suspicious activity detected
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Events monitored: {securityEvents.length}
        </div>
      </CardContent>
    </Card>
  );
};