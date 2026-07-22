
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScheduledLesson } from "@/services/lessonService";
import { LessonCard } from "./LessonCard";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from "date-fns";

interface WeekViewProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  lessons: ScheduledLesson[];
  onJoinClassroom: (lesson: ScheduledLesson) => void;
}

export const WeekView = ({ currentWeek, onWeekChange, lessons, onJoinClassroom }: WeekViewProps) => {
  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
    return eachDayOfInterval({
      start,
      end: endOfWeek(currentWeek, { weekStartsOn: 1 })
    });
  };

  const getLessonsForDate = (date: Date) => {
    return lessons.filter(lesson => 
      isSameDay(new Date(lesson.scheduled_at), date)
    );
  };

  const renderDayLessons = (date: Date, compact = false) => {
    const dayLessons = getLessonsForDate(date);
    
    if (dayLessons.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          {compact ? "No lessons" : "No lessons scheduled for this day"}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {dayLessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onJoinClassroom={onJoinClassroom}
            compact={compact}
          />
        ))}
      </div>
    );
  };

  const weekDays = getWeekDays();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onWeekChange(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onWeekChange(addWeeks(currentWeek, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <Card key={day.toISOString()} className="min-h-[200px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-center">
                <div>{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {renderDayLessons(day, true)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
