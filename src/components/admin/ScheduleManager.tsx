import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Loader2, Baby, GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns';

interface ScheduledClass {
  id: string;
  title: string;
  scheduled_at: string;
  duration: number;
  teacher_name: string;
  student_name: string;
  student_system: string;
  status: string;
}

export const ScheduleManager = () => {
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [classes, setClasses] = useState<ScheduledClass[]>([]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    fetchClasses();
  }, [currentWeek]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          scheduled_at,
          duration,
          status,
          teacher:teacher_id(full_name),
          student:student_id(full_name, current_system)
        `)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString())
        .order('scheduled_at');

      if (error) throw error;

      const transformedClasses: ScheduledClass[] = (data || []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        scheduled_at: lesson.scheduled_at,
        duration: lesson.duration,
        teacher_name: lesson.teacher?.full_name || 'Unknown',
        student_name: lesson.student?.full_name || 'Unknown',
        student_system: lesson.student?.current_system || 'kids',
        status: lesson.status,
      }));

      setClasses(transformedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassesForDay = (day: Date) => {
    return classes.filter(c => {
      const classDate = new Date(c.scheduled_at);
      const matchesDay = isSameDay(classDate, day);
      const matchesSystem = systemFilter === 'all' || c.student_system === systemFilter;
      return matchesDay && matchesSystem;
    });
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'kids':
        return <Baby className="h-3 w-3 text-orange-500" />;
      case 'teen':
        return <GraduationCap className="h-3 w-3 text-purple-500" />;
      case 'adult':
        return <Briefcase className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'kids': return 'border-l-orange-500 bg-orange-50';
      case 'teen': return 'border-l-purple-500 bg-purple-50';
      case 'adult': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-primary bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">Scheduled</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Schedule Manager
          </h1>
          <p className="text-muted-foreground">
            Global class calendar across all systems
          </p>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="font-medium ml-2">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
            </div>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                <SelectItem value="kids">🎪 Playground (Kids)</SelectItem>
                <SelectItem value="teen">🏛️ Academy (Teens)</SelectItem>
                <SelectItem value="adult">🏢 Hub (Adults)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map(day => {
            const dayClasses = getClassesForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <Card 
                key={day.toISOString()} 
                className={`min-h-48 ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className={isToday ? 'text-primary font-bold' : ''}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-lg ${isToday ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                      {format(day, 'd')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                  {dayClasses.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No classes
                    </p>
                  ) : (
                    dayClasses.map(cls => (
                      <div
                        key={cls.id}
                        className={`p-2 rounded border-l-4 text-xs ${getSystemColor(cls.student_system)}`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {getSystemIcon(cls.student_system)}
                          <span className="font-medium truncate">{cls.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(cls.scheduled_at), 'HH:mm')}
                          <span>({cls.duration}m)</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{cls.student_name}</span>
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(cls.status)}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total This Week</span>
              <span className="text-2xl font-bold">{classes.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Baby className="h-4 w-4 text-orange-500" />
                Playground
              </span>
              <span className="text-2xl font-bold text-orange-600">
                {classes.filter(c => c.student_system === 'kids').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-4 w-4 text-purple-500" />
                Academy
              </span>
              <span className="text-2xl font-bold text-purple-600">
                {classes.filter(c => c.student_system === 'teen').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-blue-500" />
                Hub
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {classes.filter(c => c.student_system === 'adult').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
