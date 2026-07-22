import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LessonCard } from './LessonCard';
import { Input } from '@/components/ui/input';
import { Search, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MaterialsGalleryProps {
  track: 'kids' | 'teens' | 'adults';
}

const TRACK_SYSTEM_MAP: Record<string, string> = {
  kids: 'kids',
  teens: 'teen',
  adults: 'adult',
};

export const MaterialsGallery: React.FC<MaterialsGalleryProps> = ({ track }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['materials-gallery', track],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('*')
        .eq('target_system', TRACK_SYSTEM_MAP[track] || track)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch student progress for these lessons
  const { data: progressMap = {} } = useQuery({
    queryKey: ['lesson-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      const { data } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completion_percentage')
        .eq('student_id', user.id);

      const map: Record<string, number> = {};
      data?.forEach((p: any) => { map[p.lesson_id] = p.completion_percentage || 0; });
      return map;
    },
    enabled: !!user?.id,
  });

  const filtered = lessons.filter((l: any) =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Lessons Library</h3>
        </div>
        <div className="relative w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No lessons available yet</p>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((lesson: any) => (
            <LessonCard
              key={lesson.id}
              id={lesson.id}
              title={lesson.title}
              level={lesson.difficulty_level}
              track={track}
              coverImageUrl={lesson.ai_metadata?.coverImageUrl}
              durationMinutes={lesson.duration_minutes}
              progress={progressMap[lesson.id] || 0}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};
