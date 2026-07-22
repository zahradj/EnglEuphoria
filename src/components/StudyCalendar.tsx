
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "class" | "homework" | "test" | "practice";
}

interface StudyCalendarProps {
  events: CalendarEvent[];
  className?: string;
  onDateSelect?: (date: Date) => void;
}

export function StudyCalendar({
  events = [],
  className = "",
  onDateSelect,
}: StudyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { languageText } = useLanguage();
  
  // Group events by date (yyyy-mm-dd)
  const eventsByDate = events.reduce((acc, event) => {
    const dateStr = event.date.toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };
  
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const selectedEvents = selectedDateStr ? eventsByDate[selectedDateStr] || [] : [];
  
  // Custom day rendering to show event indicators
  const renderDay = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    const dayEvents = eventsByDate[dateStr] || [];
    
    // Get unique event types for the day
    const eventTypes = [...new Set(dayEvents.map(event => event.type))];
    
    return (
      <div className="relative w-full h-full">
        <div>{day.getDate()}</div>
        
        {eventTypes.length > 0 && (
          <div className="flex gap-1 justify-center absolute bottom-1 left-0 right-0">
            {eventTypes.map((type, i) => (
              <div 
                key={type + i}
                className={`w-1.5 h-1.5 rounded-full ${
                  type === 'class' ? 'bg-purple' :
                  type === 'homework' ? 'bg-teal' :
                  type === 'test' ? 'bg-red-500' :
                  'bg-orange'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-purple/20 text-purple';
      case 'homework': return 'bg-teal/20 text-teal';
      case 'test': return 'bg-red-500/20 text-red-500';
      case 'practice': return 'bg-orange/20 text-orange';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };
  
  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'class': return languageText.class;
      case 'homework': return languageText.homework;
      case 'test': return languageText.test;
      case 'practice': return languageText.practice;
      default: return type;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{languageText.studyCalendar}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <Calendar 
              mode="single" 
              selected={selectedDate}
              onSelect={handleSelect}
              className="border rounded-lg p-2"
              components={{
                Day: ({ date, ...props }) => (
                  <div {...props}>
                    {renderDay(date)}
                  </div>
                ),
              }}
            />
          </div>
          
          <div className="md:w-1/2 flex flex-col">
            <h3 className="text-base font-semibold mb-4">
              {selectedDate ? (
                selectedDate.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              ) : (
                languageText.selectDate
              )}
            </h3>
            
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-md ${getEventTypeColor(event.type)}`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{event.title}</h4>
                      <span className="text-sm">{formatEventTime(event.date)}</span>
                    </div>
                    <p className="text-sm mt-1">{getEventTypeName(event.type)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                {languageText.noEventsForDay}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
