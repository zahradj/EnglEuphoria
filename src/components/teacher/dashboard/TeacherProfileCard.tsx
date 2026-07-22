import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
export const TeacherProfileCard = () => {
  const {
    user
  } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState({
    total: 0,
    count: 0
  });
  const teacherName = user?.user_metadata?.full_name || user?.email || "Teacher";
  const initials = teacherName.split(' ').map(n => n[0]).join('').toUpperCase();
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      const {
        data
      } = await supabase.from('teacher_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile(data);

      // Calculate earnings from completed lessons
      const {
        data: lessons
      } = await supabase.from('lessons').select('*').eq('teacher_id', user.id).eq('status', 'completed');
      if (lessons) {
        const total = lessons.reduce((sum, lesson) => sum + (lesson.teacher_rate || 20), 0);
        setEarnings({
          total,
          count: lessons.length
        });
      }
    };
    fetchProfile();
  }, [user?.id]);
  const rate = profile?.hourly_rate || 20;
  const timezone = profile?.timezone || 'UTC';
  const accountHealth = 10; // Full health for now

  return <Card className="border-0 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 text-white">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-white/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-white/10 text-white text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-xl font-bold">{teacherName}</h3>
            <p className="text-sm text-white/80 flex items-center justify-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {timezone}
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Balance</span>
              <span className="text-lg font-bold">${earnings.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Rate per lesson</span>
              <span className="text-lg font-bold">${rate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Total classes</span>
              <span className="text-lg font-bold">{earnings.count}</span>
            </div>
          </div>

          
        </div>
      </div>
    </Card>;
};