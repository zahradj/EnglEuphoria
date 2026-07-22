
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScheduledLesson } from "@/services/lessonService";
import { LessonCard } from "./LessonCard";
import { format, isSameDay } from "date-fns";

interface MonthViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  lessons: ScheduledLesson[];
  onJoinClassroom: (lesson: ScheduledLesson) => void;
}

export const MonthView = ({ selectedDate, onDateSelect, lessons, onJoinClassroom }: MonthViewProps) => {
  const getLessonsForDate = (date: Date) => {
    return lessons.filter(lesson => 
      isSameDay(new Date(lesson.scheduled_at), date)
    );
  };

  const renderDayLessons = (date: Date) => {
    const dayLessons = getLessonsForDate(date);
    
    if (dayLessons.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          No lessons scheduled for this day
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
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border p-3 pointer-events-auto"
        components={{
          Day: ({ date, ...props }) => {
            const dayLessons = getLessonsForDate(date);
            return (
              <div {...props} className="relative">
                <div>{date.getDate()}</div>
                {dayLessons.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          }
        }}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderDayLessons(selectedDate)}
        </CardContent>
      </Card>
    </div>
  );
};
