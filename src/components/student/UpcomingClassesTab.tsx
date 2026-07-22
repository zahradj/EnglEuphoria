
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, User, CheckCircle, MoreVertical, CalendarClock, XCircle } from "lucide-react";
import { CompletedLessonCard } from "./CompletedLessonCard";
import { LessonManagementModal } from "./LessonManagementModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Lesson {
  id: string;
  title: string;
  teacher_id: string;
  teacher_name?: string;
  scheduled_at: string;
  duration: number;
  status: string;
  completed_at?: string;
  room_link?: string;
  lesson_price?: number;
  hub_type?: string;
}

export const UpcomingClassesTab = () => {
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [managementModal, setManagementModal] = useState<{
    open: boolean;
    mode: 'cancel' | 'reschedule';
    lesson: Lesson | null;
  }>({ open: false, mode: 'cancel', lesson: null });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          id, title, teacher_id, scheduled_at, duration, status, completed_at, room_link, lesson_price, hub_type,
          users!lessons_teacher_id_fkey(full_name)
        `)
        .eq('student_id', user.user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      const formattedLessons = (lessons || []).map(lesson => ({
        ...lesson,
        teacher_name: Array.isArray(lesson.users) && lesson.users.length > 0
          ? lesson.users[0].full_name
          : 'Teacher'
      }));

      const now = new Date();
      setUpcomingLessons(formattedLessons.filter(l =>
        ['scheduled', 'confirmed', 'pending'].includes(l.status) && new Date(l.scheduled_at) > now
      ));
      setCompletedLessons(formattedLessons.filter(l => l.status === 'completed'));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({ title: "Error", description: "Failed to load your lessons.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleJoinClass = (lesson: Lesson) => {
    // Use the meeting_link (now set to /classroom/{classroom_id} by trigger)
    if (lesson.room_link) {
      window.location.href = lesson.room_link;
    } else {
      toast({ title: "Room Link Not Available", description: "The classroom link is not available yet.", variant: "destructive" });
    }
  };

  const openManagement = (lesson: Lesson, mode: 'cancel' | 'reschedule') => {
    setManagementModal({ open: true, mode, lesson });
  };

  const getHubBadgeColor = (hubType?: string) => {
    const h = hubType?.toLowerCase();
    switch (h) {
      case 'playground':
      case 'playground hub': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'academy':
      case 'academy hub': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success':
      case 'success hub':
      case 'professional': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Lessons</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Lessons</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule New Lesson
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingLessons.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedLessons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingLessons.length === 0 ? (
            <Card className="glass-card-hub">
              <CardContent className="p-8 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Lessons</h3>
                <p className="text-muted-foreground mb-4">You don't have any lessons scheduled at the moment.</p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Your First Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingLessons.map((lesson) => (
              <Card key={lesson.id} className="glass-card-hub hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                        <Badge variant="outline" className={getHubBadgeColor(lesson.hub_type)}>
                          {lesson.status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
                        </Badge>
                        {(!lesson.lesson_price || lesson.lesson_price === 0) && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            🎁 Trial
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-muted-foreground mb-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(lesson.scheduled_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{formatTime(lesson.scheduled_at)} ({lesson.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{lesson.teacher_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Manage Lesson Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <MoreVertical className="h-4 w-4" />
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openManagement(lesson, 'reschedule')}>
                            <CalendarClock className="h-4 w-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openManagement(lesson, 'cancel')}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Lesson
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => handleJoinClass(lesson)}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedLessons.length === 0 ? (
            <Card className="glass-card-hub">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Completed Lessons</h3>
                <p className="text-muted-foreground mb-4">Your completed lessons will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            completedLessons.map((lesson) => (
              <CompletedLessonCard key={lesson.id} lesson={lesson} onUpdate={fetchLessons} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Lesson Management Modal */}
      {managementModal.lesson && (
        <LessonManagementModal
          open={managementModal.open}
          onClose={() => setManagementModal({ open: false, mode: 'cancel', lesson: null })}
          mode={managementModal.mode}
          lesson={{
            id: managementModal.lesson.id,
            title: managementModal.lesson.title,
            scheduled_at: managementModal.lesson.scheduled_at,
            teacher_name: managementModal.lesson.teacher_name || 'Teacher',
            lesson_price: managementModal.lesson.lesson_price || 0,
            hub_type: managementModal.lesson.hub_type,
          }}
          onSuccess={fetchLessons}
        />
      )}
    </div>
  );
};
