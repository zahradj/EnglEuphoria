import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video, Clock, CheckCircle, AlertCircle, PlayCircle, Calendar, User,
  MoreVertical, CalendarClock, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LessonManagementModal } from '@/components/student/LessonManagementModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClassroomConnectionProps {
  lesson: {
    id: string;
    title: string;
    scheduled_at: string;
    duration: number;
    room_id: string;
    room_link: string;
    teacher_id: string;
    student_id: string;
    teacher_name?: string;
    student_name?: string;
    status: string;
    lesson_price?: number;
    hub_type?: string;
  };
  userRole: 'teacher' | 'student';
  onJoinClassroom?: () => void;
}

export const ClassroomConnection: React.FC<ClassroomConnectionProps> = ({
  lesson,
  userRole,
  onJoinClassroom
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timeUntilClass, setTimeUntilClass] = useState('');
  const [canJoin, setCanJoin] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [managementModal, setManagementModal] = useState<{
    open: boolean;
    mode: 'cancel' | 'reschedule';
  }>({ open: false, mode: 'cancel' });

  useEffect(() => {
    const updateTimeStatus = () => {
      const now = new Date();
      const lessonTime = new Date(lesson.scheduled_at);
      const timeDiff = lessonTime.getTime() - now.getTime();
      const canJoinTime = lessonTime.getTime() - (10 * 60 * 1000);
      const lessonEndTime = lessonTime.getTime() + (lesson.duration * 60 * 1000);

      setCanJoin(now.getTime() >= canJoinTime && now.getTime() <= lessonEndTime);
      setIsLive(now.getTime() >= lessonTime.getTime() && now.getTime() <= lessonEndTime);

      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) setTimeUntilClass(`${hours}h ${minutes}m`);
        else if (minutes > 0) setTimeUntilClass(`${minutes}m`);
        else setTimeUntilClass('Starting soon...');
      } else if (now.getTime() <= lessonEndTime) {
        setTimeUntilClass('Class in session');
      } else {
        setTimeUntilClass('Class ended');
      }
    };

    updateTimeStatus();
    const interval = setInterval(updateTimeStatus, 60000);
    return () => clearInterval(interval);
  }, [lesson.scheduled_at, lesson.duration]);

  const handleJoinClassroom = () => {
    if (!canJoin) {
      toast({ title: "Cannot Join Yet", description: "The classroom opens 10 minutes before the lesson starts.", variant: "destructive" });
      return;
    }
    try {
      const url = new URL(lesson.room_link);
      url.searchParams.set('role', userRole);
      url.searchParams.set('name', userRole === 'teacher' ? 'Teacher' : 'Student');
      url.searchParams.set('userId', user?.id || '');
      window.open(url.toString(), '_blank');
      toast({ title: "Joining Classroom", description: `Opening ${lesson.title} in a new tab` });
      onJoinClassroom?.();
    } catch (error) {
      console.error('Error joining classroom:', error);
      toast({ title: "Error", description: "Failed to join classroom.", variant: "destructive" });
    }
  };

  const getStatusBadge = () => {
    if (isLive) return <Badge className="bg-red-500 text-white">● LIVE</Badge>;
    if (canJoin) return <Badge className="bg-blue-500 text-white">Ready to Join</Badge>;
    if (timeUntilClass === 'Class ended') return <Badge variant="secondary">Ended</Badge>;
    return <Badge variant="outline">Scheduled</Badge>;
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

  const getHubBorder = () => {
    switch (lesson.hub_type) {
      case 'playground': return 'border-orange-200';
      case 'academy': return 'border-blue-200';
      case 'success': return 'border-emerald-200';
      default: return 'border-border';
    }
  };

  return (
    <>
      <Card className={`w-full max-w-2xl mx-auto glass-card-hub ${getHubBorder()}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              {lesson.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {/* Manage Lesson Menu */}
              {userRole === 'student' && !isLive && timeUntilClass !== 'Class ended' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setManagementModal({ open: true, mode: 'reschedule' })}>
                      <CalendarClock className="h-4 w-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setManagementModal({ open: true, mode: 'cancel' })}
                      className="text-destructive focus:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Lesson
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatTime(lesson.scheduled_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{lesson.duration} minutes</span>
            </div>
            {userRole === 'student' && lesson.teacher_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Teacher: {lesson.teacher_name}</span>
              </div>
            )}
            {userRole === 'teacher' && lesson.student_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Student: {lesson.student_name}</span>
              </div>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isLive ? <CheckCircle className="h-5 w-5 text-primary" /> :
                  canJoin ? <PlayCircle className="h-5 w-5 text-primary" /> :
                    <AlertCircle className="h-5 w-5 text-orange-500" />}
                <span className="font-medium text-foreground">{timeUntilClass}</span>
              </div>
              <div className="text-sm text-muted-foreground">Room: {lesson.room_id}</div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleJoinClassroom}
              disabled={!canJoin}
              size="lg"
              className={`w-full max-w-sm ${
                isLive ? 'bg-red-600 hover:bg-red-700 animate-pulse' :
                  canJoin ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground'
              }`}
            >
              {isLive ? (<><Video className="h-5 w-5 mr-2" />Join Live Class</>) :
                canJoin ? (<><PlayCircle className="h-5 w-5 mr-2" />Join Classroom</>) :
                  (<><Clock className="h-5 w-5 mr-2" />{timeUntilClass === 'Class ended' ? 'Class Ended' : 'Opens 10 min before'}</>)}
            </Button>
          </div>

          {canJoin && (
            <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
              <p className="text-sm text-primary text-center">
                💡 Click "Join Classroom" to open the lesson in a new tab.
                Make sure your camera and microphone are ready!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Management Modal */}
      <LessonManagementModal
        open={managementModal.open}
        onClose={() => setManagementModal({ open: false, mode: 'cancel' })}
        mode={managementModal.mode}
        lesson={{
          id: lesson.id,
          title: lesson.title,
          scheduled_at: lesson.scheduled_at,
          teacher_name: lesson.teacher_name || 'Teacher',
          lesson_price: lesson.lesson_price || 0,
          hub_type: lesson.hub_type,
        }}
      />
    </>
  );
};
