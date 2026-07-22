import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ParentStudentList } from '@/components/parent/ParentStudentList';
import { ParentStudentProgress } from '@/components/parent/ParentStudentProgress';
import { ParentMessages } from '@/components/parent/ParentMessages';
import { ParentNotificationSettings } from '@/components/parent/ParentNotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp, MessageSquare, Bell } from 'lucide-react';

interface StudentRelationship {
  id: string;
  student_id: string;
  relationship_type: string;
  is_primary_contact: boolean;
  can_view_progress: boolean;
  can_book_lessons: boolean;
  can_communicate_teachers: boolean;
  student: {
    id: string;
    full_name: string;
    email: string;
  };
}

const ParentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { data: students = [], isLoading } = useQuery<StudentRelationship[]>({
    queryKey: ['parent-students', user?.id],
    queryFn: async (): Promise<StudentRelationship[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('parent_student_relationships')
        .select(`
          id,
          student_id,
          relationship_type,
          is_primary_contact,
          can_view_progress,
          can_book_lessons,
          can_communicate_teachers,
          student:users!parent_student_relationships_student_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('parent_id', user.id);

      if (error) throw error;
      
      // Transform the data to match the expected interface
      // Supabase may return student as an object or array depending on the join
      return (data || []).map(item => ({
        id: item.id,
        student_id: item.student_id,
        relationship_type: item.relationship_type,
        is_primary_contact: item.is_primary_contact,
        can_view_progress: item.can_view_progress,
        can_book_lessons: item.can_book_lessons,
        can_communicate_teachers: item.can_communicate_teachers,
        student: Array.isArray(item.student) ? item.student[0] : item.student
      }));
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Mobile sticky header */}
      <header className="sticky top-0 z-30 md:hidden bg-card/90 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">{t('pd.title')}</h1>
        <p className="text-xs text-muted-foreground">{t('pd.subtitleMobile')}</p>
      </header>

      <div
        className="container mx-auto py-4 md:py-8 px-3 md:px-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('pd.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('pd.subtitleDesktop')}
          </p>
        </div>

        <Tabs defaultValue="students" className="space-y-4 md:space-y-6">
          {/* Sticky bottom-sheet style tabs on mobile, inline on desktop */}
          <TabsList
            className="
              grid w-full grid-cols-4 h-14 md:h-10 gap-1
              sticky top-[60px] md:top-auto md:relative
              z-20 bg-card/90 backdrop-blur-xl
              lg:w-auto lg:inline-grid
            "
          >
            <TabsTrigger
              value="students"
              className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 text-[11px] md:text-sm min-h-[44px]"
            >
              <Users className="h-5 w-5 md:h-4 md:w-4" />
              <span>{t('pd.tab.students')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 text-[11px] md:text-sm min-h-[44px]"
            >
              <TrendingUp className="h-5 w-5 md:h-4 md:w-4" />
              <span>{t('pd.tab.progress')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 text-[11px] md:text-sm min-h-[44px]"
            >
              <MessageSquare className="h-5 w-5 md:h-4 md:w-4" />
              <span>{t('pd.tab.messages')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 text-[11px] md:text-sm min-h-[44px]"
            >
              <Bell className="h-5 w-5 md:h-4 md:w-4" />
              <span className="truncate max-w-full">{t('pd.tab.alerts')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <ParentStudentList 
              students={students} 
              onSelectStudent={setSelectedStudentId} 
            />
          </TabsContent>

          <TabsContent value="progress">
            <ParentStudentProgress 
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
            />
          </TabsContent>

          <TabsContent value="messages">
            {user?.id && (
              <ParentMessages 
                parentId={user.id} 
                students={students} 
              />
            )}
          </TabsContent>

          <TabsContent value="notifications">
            {user?.id && (
              <ParentNotificationSettings parentId={user.id} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
