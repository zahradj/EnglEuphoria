
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useTeacherHandlers } from "@/hooks/useTeacherHandlers";

interface ScheduledClass {
  id: string;
  title: string;
  studentName: string;
  time: string;
  duration: number; // in minutes
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  type: "group" | "individual";
  studentId: string;
}

export const CalendarTab = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { handleScheduleClass, handleJoinClass } = useTeacherHandlers();

  // Generate time slots from 6:00 to 15:30 in 30-minute intervals
  const timeSlots = [];
  for (let hour = 6; hour < 16; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 15) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Mock scheduled classes
  const scheduledClasses: ScheduledClass[] = [
    {
      id: "1",
      title: "#421451 PL",
      studentName: "Zuzanna",
      time: "09:00",
      duration: 55,
      day: 0, // Monday
      type: "individual",
      studentId: "421451"
    },
    {
      id: "2", 
      title: "#944665 FR",
      studentName: "Diakhite",
      time: "10:00",
      duration: 25,
      day: 0,
      type: "individual",
      studentId: "944665"
    },
    {
      id: "3",
      title: "#1443231 IL",
      studentName: "Omri",
      time: "12:00",
      duration: 55,
      day: 1, // Tuesday
      type: "individual",
      studentId: "1443231"
    },
    {
      id: "4",
      title: "#1334758 JP",
      studentName: "Touyama Koharu",
      time: "12:30",
      duration: 55,
      day: 1,
      type: "individual",
      studentId: "1334758"
    },
    {
      id: "5",
      title: "#982001 ARAB",
      studentName: "Mokhles Adri",
      time: "13:00",
      duration: 25,
      day: 2, // Wednesday
      type: "individual",
      studentId: "982001"
    }
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getClassesForTimeSlot = (timeSlot: string, dayIndex: number) => {
    return scheduledClasses.filter(cls => 
      cls.time === timeSlot && cls.day === dayIndex
    );
  };

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Weekly Schedule</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')} className="border-purple/30 hover:bg-purple-light/50">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center text-muted-foreground">
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')} className="border-purple/30 hover:bg-purple-light/50">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-purple to-teal hover:from-purple-dark hover:to-teal-dark text-white" onClick={handleScheduleClass}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Class
        </Button>
      </div>

      <Card className="border-purple/20 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header with days */}
              <div className="grid grid-cols-8 border-b bg-gradient-to-r from-purple-light/30 to-teal-light/30">
                <div className="p-3 border-r border-purple/20 font-medium text-sm text-foreground">Time</div>
                {weekDays.map((day, index) => (
                  <div key={day} className="p-3 border-r border-purple/20 text-center">
                    <div className="font-medium text-sm text-foreground">{day}</div>
                    <div className="text-xs text-muted-foreground">
                      {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots grid */}
              <div className="max-h-[600px] overflow-y-auto">
                {timeSlots.map((timeSlot) => (
                  <div key={timeSlot} className="grid grid-cols-8 border-b border-purple/10 min-h-[60px]">
                    <div className="p-3 border-r border-purple/20 text-sm font-medium bg-gradient-to-r from-purple-light/20 to-teal-light/20 flex items-center text-foreground">
                      {timeSlot}
                    </div>
                    {weekDays.map((_, dayIndex) => (
                      <div key={dayIndex} className="border-r border-purple/10 p-1 relative hover:bg-purple-light/10 transition-colors">
                        {getClassesForTimeSlot(timeSlot, dayIndex).map((cls) => (
                          <div
                            key={cls.id}
                            className="bg-gradient-to-r from-teal-light to-purple-light border border-teal/40 rounded-lg p-2 mb-1 text-xs cursor-pointer hover:from-teal hover:to-purple hover:text-white transition-all duration-200 shadow-sm"
                            onClick={handleJoinClass}
                          >
                            <div className="font-mono font-semibold text-teal-dark">#{cls.studentId}</div>
                            <div className="text-purple-dark font-medium">{cls.studentName}</div>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              <Badge 
                                variant="secondary"
                                className={cls.duration === 25 ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]" : "bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]"}
                              >
                                {cls.duration} min
                              </Badge>
                              <Badge 
                                variant={cls.type === "group" ? "default" : "outline"}
                                className="text-[10px]"
                              >
                                {cls.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
