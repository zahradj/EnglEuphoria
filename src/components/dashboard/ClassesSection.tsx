
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClassCard, ClassInfo } from "@/components/ClassCard";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function ClassesSection() {
  const navigate = useNavigate();
  const { languageText } = useLanguage();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchClasses = async () => {
      setLoading(true);
      try {
        // Try RPC first
        const { data: rpcData } = await supabase.rpc('get_student_upcoming_lessons', {
          student_uuid: user.id,
        });

        if (rpcData && rpcData.length > 0) {
          setClasses(rpcData.map((l: any, i: number) => ({
            id: l.room_id || l.id || `lesson-${i}`,
            title: l.title || 'Upcoming Lesson',
            teacher: l.teacher_name || 'Teacher',
            time: new Date(l.scheduled_at).toLocaleString(),
            students: 1,
            color: '#FE6A2F',
          })));
          setLoading(false);
          return;
        }

        // Fallback: class_bookings
        const { data: bookings } = await supabase
          .from('class_bookings')
          .select('id, scheduled_at, booking_type, status, teacher_id, lesson_id')
          .eq('student_id', user.id)
          .in('status', ['confirmed', 'scheduled'])
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(3);

        if (bookings && bookings.length > 0) {
          setClasses(bookings.map((b: any, i: number) => ({
            id: b.lesson_id || b.id,
            title: b.booking_type === 'trial' ? 'Trial Lesson' : 'Upcoming Lesson',
            teacher: 'Teacher',
            time: new Date(b.scheduled_at).toLocaleString(),
            students: 1,
            color: ['#FE6A2F', '#14B8A6', '#9B87F5'][i % 3],
          })));
        }
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.id]);

  const handleJoinClass = (classId: string) => {
    navigate(`/classroom/${classId}`);
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{languageText.upcomingClasses}</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{languageText.upcomingClasses}</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No upcoming classes yet. Book a trial lesson to get started!
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{languageText.upcomingClasses}</h2>
        <Button variant="ghost" size="sm">
          {languageText.viewAll}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map((classInfo) => (
          <ClassCard
            key={classInfo.id}
            classInfo={classInfo}
            onJoin={handleJoinClass}
          />
        ))}
      </div>
    </div>
  );
}
