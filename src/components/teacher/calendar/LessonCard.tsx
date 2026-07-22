
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Video } from "lucide-react";
import { ScheduledLesson } from "@/services/lessonService";

interface LessonCardProps {
  lesson: ScheduledLesson;
  onJoinClassroom: (lesson: ScheduledLesson) => void;
  compact?: boolean;
}

export const LessonCard = ({ lesson, onJoinClassroom, compact = false }: LessonCardProps) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const canJoinNow = (scheduledAt: string) => {
    const lessonTime = new Date(scheduledAt);
    const now = new Date();
    const tenMinutesBefore = new Date(lessonTime.getTime() - 10 * 60 * 1000);
    
    return now >= tenMinutesBefore;
  };

  const { time } = formatDateTime(lesson.scheduled_at);
  const canJoin = canJoinNow(lesson.scheduled_at);

  return (
    <div className={`p-3 rounded-lg border ${compact ? 'text-xs' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
          {lesson.title}
        </h4>
        <Badge variant={lesson.status === 'scheduled' ? 'default' : 'secondary'} className={compact ? 'text-xs px-1' : ''}>
          {lesson.status}
        </Badge>
      </div>
      
      <div className={`flex items-center gap-4 text-gray-600 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{lesson.student_name || 'Unknown Student'}</span>
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {lesson.duration} min
          </Badge>
          <Button
            onClick={() => onJoinClassroom(lesson)}
            disabled={!canJoin}
            size="sm"
            className={canJoin ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Video className="h-3 w-3 mr-1" />
            {canJoin ? "Join" : "Join Classroom"}
          </Button>
        </div>
      )}
    </div>
  );
};
