import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, Star, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
interface WelcomeSectionProps {
  teacherName: string;
  onJoinClassroom: () => void;
  weeklyEarnings: number;
  todaysClasses?: number;
  totalStudents?: number;
  rating?: string;
  onStartClass?: () => void;
}
export const WelcomeSection = ({
  teacherName,
  onJoinClassroom,
  weeklyEarnings,
  todaysClasses = 3,
  totalStudents = 24,
  rating = "4.8",
  onStartClass
}: WelcomeSectionProps) => {
  const navigate = useNavigate();
  const [upcomingBookingId, setUpcomingBookingId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: booking }, { data: profile }] = await Promise.all([
        supabase
          .from('class_bookings')
          .select('id')
          .eq('teacher_id', user.id)
          .in('status', ['scheduled', 'confirmed'])
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('teacher_profiles')
          .select('avatar_url, profile_photo_url')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setUpcomingBookingId(booking?.id ?? null);
      setAvatarUrl((profile as any)?.avatar_url || (profile as any)?.profile_photo_url || null);
    };
    load();

    const channel = supabase
      .channel('welcome-upcoming-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_bookings' }, load)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEnterClassroom = () => {
    if (upcomingBookingId) navigate(`/classroom/${upcomingBookingId}`);
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  return <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/50 dark:via-pink-900/50 dark:to-blue-900/50 border border-purple-300/50 dark:border-purple-600/50 p-8 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-pink-200/30 to-blue-200/30 dark:from-purple-800/20 dark:via-pink-800/20 dark:to-blue-800/20" />
      <div className="absolute top-4 right-4">
        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-300/40 to-indigo-300/40 animate-pulse" />
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-300/40 to-purple-300/40 animate-pulse delay-1000" />
      </div>
      <div className="absolute top-1/2 right-1/4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-300/30 to-blue-300/30 animate-pulse delay-500" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4 space-y-0">
          <Avatar className="h-20 w-20 ring-4 ring-white/60 dark:ring-white/20 shadow-lg shrink-0">
            <AvatarImage src={avatarUrl ?? undefined} alt={teacherName} />
            <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
              {teacherName?.charAt(0)?.toUpperCase() ?? 'T'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {getGreeting()}, {teacherName}! 👋
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Ready to inspire your students today?
              </p>
            </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-300">
              <Calendar className="h-4 w-4" />
              📅 {todaysClasses} classes today
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-300">
              <Users className="h-4 w-4" />
              👥 {totalStudents} active students
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-300">
              <Star className="h-4 w-4 text-yellow-500" />
              ⭐ {rating} rating
            </Badge>
          </div>
          </div>
        </div>
        
        {upcomingBookingId && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white px-6 shadow-lg hover:shadow-xl transition-all" onClick={handleEnterClassroom}>
              <Video className="mr-2 h-5 w-5" />
              🎥 Enter Classroom
            </Button>
          </div>
        )}
      </div>
    </div>;
};