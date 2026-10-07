import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Users, TrendingUp, MessageSquare, Bell, CalendarDays, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ParentStudentList } from '@/components/parent/ParentStudentList';
import { ParentStudentProgress } from '@/components/parent/ParentStudentProgress';
import { ParentMessages } from '@/components/parent/ParentMessages';
import { ParentNotificationSettings } from '@/components/parent/ParentNotificationSettings';
import { FamilyCalendarView } from '@/components/parent/FamilyCalendarView';
import { AddChildDialog } from '@/components/parent/AddChildDialog';
import { FamilyHero } from '@/components/parent/FamilyHero';
import { FamilyTopBar } from '@/components/family/FamilyTopBar';
import type { ChildCardData } from '@/components/parent/ChildCard';
import type { FamilyChildProfile } from '@/lib/familyBuddy';
import { useChildSnapshots } from '@/hooks/useChildSnapshots';
import { useFamilyCredits } from '@/hooks/useFamilyCredits';
import { useClaimReferral } from '@/hooks/useClaimReferral';
import { ReferralTab } from '@/components/student/tabs/ReferralTab';
import { BuyForChildDialog, type FamilyLearner } from '@/components/parent/BuyForChildDialog';
import { MoveCreditsDialog } from '@/components/parent/MoveCreditsDialog';
import '@/components/parent/family-dashboard.css';

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

const TABS = [
  { value: 'students', icon: Users, label: 'pd.tab.students' },
  { value: 'calendar', icon: CalendarDays, label: 'pd.tab.calendar' },
  { value: 'progress', icon: TrendingUp, label: 'pd.tab.progress' },
  { value: 'messages', icon: MessageSquare, label: 'pd.tab.messages' },
  { value: 'notifications', icon: Bell, label: 'pd.tab.alerts' },
  { value: 'referrals', icon: Gift, label: 'pd.tab.referrals', fallback: 'Invite friends' },
] as const;

const ParentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useClaimReferral(user?.id);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>('students');
  const [buyFor, setBuyFor] = useState<FamilyLearner | null>(null);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);

  const { data: students = [], isLoading } = useQuery<StudentRelationship[]>({
    queryKey: ['parent-students', user?.id],
    queryFn: async (): Promise<StudentRelationship[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('student_parent_relationships')
        .select(`
          id,
          student_id,
          relationship_type,
          is_primary_contact,
          can_view_progress,
          can_book_lessons,
          can_communicate_teachers,
          student:users!student_parent_relationships_student_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('parent_id', user.id);

      if (error) throw error;

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

  const studentIds = students.map((s) => s.student_id);

  // Hub, age and buddy for each child (parents may read their approved children's student_profiles).
  const { data: profiles = {} } = useQuery<Record<string, FamilyChildProfile>>({
    queryKey: ['parent-student-profiles', user?.id, studentIds.join(',')],
    enabled: !!user?.id && studentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('user_id, hub_type, age, companion_id')
        .in('user_id', studentIds);
      if (error) throw error;
      const map: Record<string, FamilyChildProfile> = {};
      (data ?? []).forEach((p: any) => {
        map[p.user_id] = { hub: p.hub_type ?? null, age: p.age ?? null, companionId: p.companion_id ?? null };
      });
      return map;
    },
  });

  const snapshots = useChildSnapshots(studentIds, user?.id);
  const { data: familyCredits = {} } = useFamilyCredits(studentIds, user?.id);

  const children: ChildCardData[] = students
    .filter((s) => s.student)
    .map((s) => ({
      studentId: s.student_id,
      name: s.student.full_name,
      email: s.student.email,
      profile: profiles[s.student_id],
      snapshot: snapshots[s.student_id] ?? { data: null, isLoading: true, failed: false },
      isPrimaryContact: s.is_primary_contact,
    }));

  const allSnapshotsKnown = children.length > 0 && children.every((c) => !c.snapshot.isLoading);
  const upcomingTotal = allSnapshotsKnown
    ? children.reduce((sum, c) => sum + (c.snapshot.data?.upcoming_lessons ?? 0), 0)
    : null;

  const parentName = (user as any)?.full_name ?? (user as any)?.name ?? null;

  const startBuy = (studentId: string) => {
    const child = children.find((c) => c.studentId === studentId);
    if (!child) return;
    const hub = child.profile?.hub;
    setBuyFor({
      studentId,
      name: child.name,
      hub: hub === 'academy' || hub === 'professional' ? hub : 'playground',
    });
  };
  const startMove = (studentId: string) => {
    setMoveFrom(studentId);
    setMoveOpen(true);
  };

  const viewProgress = (studentId: string) => {
    setSelectedStudentId(studentId);
    setTab('progress');
  };

  if (isLoading) {
    return (
      <div className="family-dash min-h-dvh">
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-6" aria-busy="true">
          <div className="fd-skel h-[210px] rounded-[28px]" />
          <div className="fd-skel h-14 rounded-full" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="fd-skel h-[330px] rounded-[28px]" />)}
          </div>
        </div>
      </div>
    );
  }

  const addChild = (variant: 'hero' | 'default') =>
    user?.id ? (
      <AddChildDialog
        parentId={user.id}
        existingCount={students.length}
        variant={variant}
        relationshipType={students[0]?.relationship_type}
      />
    ) : null;

  return (
    <div className="family-dash min-h-dvh">
      <main
        className="mx-auto max-w-6xl space-y-6 px-4 py-4 md:py-8"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)' }}
      >
        <FamilyTopBar backTo="/" />

        <FamilyHero
          parentName={parentName}
          children={children.map((c) => ({ studentId: c.studentId, name: c.name, profile: c.profile }))}
          upcomingLessons={upcomingTotal}
          addChildAction={addChild('hero')}
        />

        <TabsPrimitive.Root value={tab} onValueChange={setTab} className="space-y-6">
          <TabsPrimitive.List className="fd-tabs" aria-label={t('pd.title')}>
            {TABS.map(({ value, icon: Icon, label, ...rest }) => (
              <TabsPrimitive.Trigger key={value} value={value} className="fd-tab">
                <Icon className="h-4 w-4" aria-hidden />
                <span>{t(label, { defaultValue: 'fallback' in rest ? rest.fallback : undefined })}</span>
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>

          <TabsPrimitive.Content value="students" className="focus-visible:outline-none">
            <ParentStudentList
              children={children}
              onViewProgress={viewProgress}
              credits={studentIds.length > 0 && Object.keys(familyCredits).length > 0 ? familyCredits : undefined}
              onBuy={startBuy}
              onMove={startMove}
              addChildAction={addChild('default')}
            />
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="calendar" className="focus-visible:outline-none">
            {user?.id && <FamilyCalendarView parentId={user.id} />}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="progress" className="focus-visible:outline-none">
            <ParentStudentProgress
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
            />
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="messages" className="focus-visible:outline-none">
            {user?.id && <ParentMessages parentId={user.id} students={students} />}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="notifications" className="focus-visible:outline-none">
            {user?.id && <ParentNotificationSettings parentId={user.id} />}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="referrals" className="focus-visible:outline-none">
            <ReferralTab signupPath="/parent-signup" family />
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>

        <BuyForChildDialog learner={buyFor} onOpenChange={(open) => { if (!open) setBuyFor(null); }} />
        <MoveCreditsDialog
          open={moveOpen}
          onOpenChange={setMoveOpen}
          learners={children.map((c) => ({ studentId: c.studentId, name: c.name }))}
          credits={familyCredits}
          fromId={moveFrom}
        />
      </main>
    </div>
  );
};

export default ParentDashboard;
