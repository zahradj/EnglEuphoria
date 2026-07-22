import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { lessonService, ScheduledLesson } from "@/services/lessonService";
import { ClassroomEntryButton } from "@/components/classroom/ClassroomEntryButton";

interface EnhancedUpcomingClassesTabProps {
  studentId: string;
}

export const EnhancedUpcomingClassesTab = ({ studentId }: EnhancedUpcomingClassesTabProps) => {
  const [lessons, setLessons] = useState<ScheduledLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadLessons = async () => {
    try {
      setIsLoading(true);
      const studentLessons = await lessonService.getStudentUpcomingLessons(studentId);
      setLessons(studentLessons);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load classes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadLessons();
  }, [studentId]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Upcoming Classes</h1>
        <Button variant="outline" onClick={loadLessons} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Classes Scheduled</h3>
            <p className="text-muted-foreground">Book a lesson with a teacher to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson) => {
            const { date, time } = formatDateTime(lesson.scheduled_at);
            return (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow border-border/50 bg-card/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{time} ({lesson.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{lesson.teacher_name || 'Teacher'}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{lesson.status}</Badge>
                    </div>

                    <div className="flex-shrink-0 w-52">
                      <ClassroomEntryButton
                        scheduledAt={lesson.scheduled_at}
                        roomId={lesson.room_id}
                        lessonTitle={lesson.title}
                        role="student"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
