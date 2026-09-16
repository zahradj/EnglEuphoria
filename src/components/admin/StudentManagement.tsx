import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Users, Calendar, TrendingUp, BookOpen, CreditCard, Plus, Trash2, Loader2, Copy, GraduationCap, Check, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchHubLessonSequence, setCurrentLesson, type Hub, type LessonMeta } from '@/services/activeCoreLessonResolver';
import { LevelChangeRequestsPanel } from './LevelChangeRequestsPanel';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const HUBS = [
  { value: 'playground', label: 'Playground (Kids)' },
  { value: 'academy', label: 'Academy (Teens)' },
  { value: 'professional', label: 'Success (Adults)' },
] as const;
type HubValue = typeof HUBS[number]['value'];

interface Student {
  id: string;
  /** Friendly short identifier shown in the UI (e.g. "STU-3F2A1B"). */
  display_id: string;
  full_name: string;
  email: string;
  created_at: string;
  cefr_level?: string;
  student_level?: HubValue;
  total_lessons: number;
  available_credits: number;
  /** student_curriculum_progress.current_lesson_id — "which lesson does
   *  this student start from" per direct request; null means they've never
   *  had a pointer set (resolveActiveCoreLesson will fall back to the
   *  first published lesson in their hub, i.e. effectively Lesson 1). */
  current_lesson_id?: string | null;
  current_lesson_title?: string | null;
}

/** student_profiles.student_level uses 'professional' for the adult hub;
 *  activeCoreLessonResolver's Hub type (and its own internal target_system
 *  mapping) uses 'success' for the same concept — this project's one
 *  other spot with this exact naming mismatch, see HUB_TO_TARGET_SYSTEM. */
function toResolverHub(hubValue?: HubValue): Hub {
  if (hubValue === 'professional') return 'success';
  if (hubValue === 'academy') return 'academy';
  return 'playground';
}

/**
 * Build a short, human-friendly student id from the UUID.
 * Deterministic — same uuid always produces the same display id.
 */
const toDisplayId = (uuid: string) => `STU-${uuid.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

/** Emails that should never appear in the Students list. */
const isGuestOrSystemEmail = (email?: string | null) => {
  if (!email) return false;
  const e = email.toLowerCase();
  return (
    e.endsWith('@guest.engleuphoria.com') ||
    e.startsWith('interview-') ||
    e.includes('+guest@')
  );
};

interface DailyStats {
  date: string;
  classes: number;
  newStudents: number;
}

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    newToday: 0,
    classesToday: 0,
    activeStudents: 0,
  });

  const fetchStudents = async () => {
    try {
      // Drive the list off student_profiles (truthful "is a student" signal)
      // rather than users.role, which can be flipped to 'teacher' /
      // 'content_creator' for multi-role accounts and would otherwise hide
      // legitimate student registrations from this admin tab.
      const { data: profilesData, error: profilesError } = await supabase
        .from('student_profiles')
        .select('user_id, cefr_level, student_level, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (profilesError) throw profilesError;

      const userIds = (profilesData || []).map((r: any) => r.user_id);

      // Fetch user details separately — there is no PostgREST FK between
      // public.student_profiles.user_id and public.users.id (the FK points
      // to auth.users), so an embedded join silently fails. Merge in JS.
      const { data: usersData, error: usersError } = userIds.length
        ? await supabase
            .from('users')
            .select('id, full_name, email, created_at')
            .in('id', userIds)
        : { data: [], error: null };

      if (usersError) throw usersError;

      const usersById = new Map(
        (usersData || []).map((u: any) => [u.id, u])
      );

      // Pull every role assignment for these users so we can EXCLUDE accounts
      // that are actually teachers / admins / content_creators / interview
      // applicants. The student list must never mix staff or guests.
      const { data: rolesData } = userIds.length
        ? await supabase
            .from('user_roles')
            .select('user_id, role')
            .in('user_id', userIds)
        : { data: [] };

      const rolesByUser = new Map<string, Set<string>>();
      for (const r of rolesData || []) {
        const set = rolesByUser.get((r as any).user_id) ?? new Set<string>();
        set.add(String((r as any).role));
        rolesByUser.set((r as any).user_id, set);
      }

      const STAFF_ROLES = new Set(['teacher', 'admin', 'content_creator', 'parent']);

      // Fetch credits for all students in one query
      const { data: creditsData } = userIds.length
        ? await supabase
            .from('student_credits')
            .select('student_id, total_credits, used_credits, expired_credits')
            .in('student_id', userIds)
        : { data: [] };

      const creditsById = new Map(
        (creditsData || []).map((c: any) => [
          c.student_id,
          Math.max(0, (c.total_credits || 0) - (c.used_credits || 0) - (c.expired_credits || 0)),
        ])
      );

      // Current-lesson pointer (student_curriculum_progress) — "which
      // lesson does this student start from", per direct request to make
      // this visible/editable in the admin dashboard. Batched once for all
      // students rather than per-row, same reasoning as credits above.
      const { data: progressData } = userIds.length
        ? await supabase
            .from('student_curriculum_progress')
            .select('student_id, current_lesson_id')
            .in('student_id', userIds)
        : { data: [] };
      const lessonIdByStudent = new Map(
        (progressData || [])
          .filter((p: any) => p.current_lesson_id)
          .map((p: any) => [p.student_id, p.current_lesson_id as string])
      );
      const lessonIds = Array.from(new Set(Array.from(lessonIdByStudent.values())));
      const { data: lessonTitles } = lessonIds.length
        ? await supabase.from('curriculum_lessons').select('id, title').in('id', lessonIds)
        : { data: [] };
      const titleByLessonId = new Map((lessonTitles || []).map((l: any) => [l.id, l.title as string]));

      // Get lesson counts for each student
      const studentsWithLessons = await Promise.all(
        (profilesData || []).map(async (row: any) => {
          const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', row.user_id);

          const u = usersById.get(row.user_id) as any;
          const currentLessonId = lessonIdByStudent.get(row.user_id) ?? null;
          return {
            id: row.user_id,
            display_id: toDisplayId(row.user_id),
            full_name: u?.full_name || 'Unknown',
            email: u?.email || 'Unknown',
            created_at: u?.created_at || row.created_at,
            cefr_level: row.cefr_level,
            student_level: row.student_level,
            total_lessons: count || 0,
            available_credits: creditsById.get(row.user_id) || 0,
            current_lesson_id: currentLessonId,
            current_lesson_title: currentLessonId ? titleByLessonId.get(currentLessonId) ?? null : null,
          } satisfies Student;
        })
      );

      // Final filter — never show staff, admins, or interview/guest accounts.
      const studentsOnly = studentsWithLessons.filter((s) => {
        if (isGuestOrSystemEmail(s.email)) return false;
        const roles = rolesByUser.get(s.id);
        if (!roles || roles.size === 0) return true; // no roles row → trust student_profiles
        // Keep accounts that have the 'student' role even if they ALSO have
        // 'content_creator' (multi-role power users). Hide everything else.
        if (roles.has('student')) return true;
        for (const r of roles) if (STAFF_ROLES.has(r)) return false;
        return true;
      });

      setStudents(studentsOnly);

      // Get basic stats — count from student_profiles too so the totals
      // match the list above and don't undercount multi-role accounts.
      const today = new Date().toISOString().split('T')[0];

      const { count: totalCount } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: newTodayCount } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`);

      const { count: classesTodayCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_at', `${today}T00:00:00`)
        .lte('scheduled_at', `${today}T23:59:59`);

      setStats({
        totalStudents: totalCount || 0,
        newToday: newTodayCount || 0,
        classesToday: classesTodayCount || 0,
        activeStudents: studentsWithLessons.filter(s => s.total_lessons > 0).length,
      });

      // Get daily stats for chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyData = await Promise.all(
        last7Days.map(async (date) => {
          const { count: classes } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .gte('scheduled_at', `${date}T00:00:00`)
            .lte('scheduled_at', `${date}T23:59:59`);

          const { count: newStudents } = await supabase
            .from('student_profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${date}T00:00:00`)
            .lte('created_at', `${date}T23:59:59`);

          return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            classes: classes || 0,
            newStudents: newStudents || 0,
          };
        })
      );

      setDailyStats(dailyData);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleLevelChange = async (studentId: string, newLevel: string) => {
    const previous = students;
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, cefr_level: newLevel } : s))
    );
    try {
      const { error } = await supabase
        .from('student_profiles')
        .upsert(
          { user_id: studentId, cefr_level: newLevel },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
      toast.success(`Level updated to ${newLevel}`);
    } catch (err) {
      console.error('Failed to update CEFR level:', err);
      setStudents(previous);
      toast.error('Could not update level');
    }
  };

  const handleHubChange = async (studentId: string, newHub: HubValue) => {
    const previous = students;
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, student_level: newHub } : s))
    );
    try {
      const { error } = await supabase
        .from('student_profiles')
        .upsert(
          { user_id: studentId, student_level: newHub },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
      const label = HUBS.find(h => h.value === newHub)?.label ?? newHub;
      toast.success(`Hub updated to ${label}`);
    } catch (err) {
      console.error('Failed to update hub:', err);
      setStudents(previous);
      toast.error('Could not update hub');
    }
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const handleSetCurrentLesson = async (studentId: string, lesson: LessonMeta) => {
    const previous = students;
    const previousLessonId = students.find(s => s.id === studentId)?.current_lesson_id ?? null;
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, current_lesson_id: lesson.id, current_lesson_title: lesson.title } : s))
    );
    try {
      await setCurrentLesson(studentId, lesson.id, currentUserId, previousLessonId);
      toast.success(`Current lesson set to "${lesson.title}"`);
    } catch (err) {
      console.error('Failed to set current lesson:', err);
      setStudents(previous);
      toast.error('Could not update current lesson');
    }
  };

  const handleAddCredits = async (studentId: string, amount: number) => {
    if (!Number.isFinite(amount) || amount === 0) {
      toast.error('Enter a non-zero amount');
      return;
    }
    try {
      const { data: existing } = await supabase
        .from('student_credits')
        .select('id, total_credits')
        .eq('student_id', studentId)
        .maybeSingle();

      if (existing) {
        const newTotal = Math.max(0, (existing.total_credits || 0) + amount);
        const { error } = await supabase
          .from('student_credits')
          .update({ total_credits: newTotal })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('student_credits')
          .insert({ student_id: studentId, total_credits: Math.max(0, amount) });
        if (error) throw error;
      }

      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? { ...s, available_credits: Math.max(0, s.available_credits + amount) }
            : s
        )
      );
      toast.success(`${amount > 0 ? 'Added' : 'Removed'} ${Math.abs(amount)} credit${Math.abs(amount) === 1 ? '' : 's'}`);
    } catch (err: any) {
      console.error('Failed to update credits:', err);
      toast.error(err?.message || 'Could not update credits');
    }
  };

  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteStudent = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: pendingDelete.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setStudents((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      toast.success(`Deleted ${pendingDelete.full_name}`);
      setPendingDelete(null);
    } catch (err: any) {
      console.error('Failed to delete student:', err);
      toast.error(err?.message || 'Could not delete student');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">Loading student data...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.newToday}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Classes Today</p>
                <p className="text-2xl font-bold text-blue-600">{stats.classesToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeStudents}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Activity (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="classes" name="Classes" fill="#3b82f6" />
                <Bar dataKey="newStudents" name="New Students" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <LevelChangeRequestsPanel onResolved={fetchStudents} />

      {/* Recent Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Hub</TableHead>
                  <TableHead>CEFR Level</TableHead>
                  <TableHead>Total Lessons</TableHead>
                  <TableHead>Current Lesson</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(student.id);
                          toast.success('Full ID copied');
                        }}
                        title={`Click to copy full UUID\n${student.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs hover:bg-muted"
                      >
                        {student.display_id}
                        <Copy className="h-3 w-3 opacity-60" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={student.student_level || ''}
                        onValueChange={(v) => handleHubChange(student.id, v as HubValue)}
                      >
                        <SelectTrigger className="w-[170px] h-8">
                          <SelectValue placeholder="Set hub" />
                        </SelectTrigger>
                        <SelectContent>
                          {HUBS.map(hub => (
                            <SelectItem key={hub.value} value={hub.value}>{hub.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={student.cefr_level || ''}
                        onValueChange={(v) => handleLevelChange(student.id, v)}
                      >
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue placeholder="Set level" />
                        </SelectTrigger>
                        <SelectContent>
                          {CEFR_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{student.total_lessons}</TableCell>
                    <TableCell>
                      <CurrentLessonCell
                        hub={toResolverHub(student.student_level)}
                        currentLessonId={student.current_lesson_id}
                        currentLessonTitle={student.current_lesson_title}
                        onChange={(lesson) => handleSetCurrentLesson(student.id, lesson)}
                      />
                    </TableCell>
                    <TableCell>
                      <CreditsCell
                        balance={student.available_credits}
                        onAdd={(amt) => handleAddCredits(student.id, amt)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.total_lessons > 0 ? "default" : "secondary"}>
                        {student.total_lessons > 0 ? "Active" : "New"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setPendingDelete(student)}
                        title="Delete student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this student?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{pendingDelete?.full_name}</strong> ({pendingDelete?.email}),
              their authentication account, profile, credits, and role assignments.
              Lessons and historical records remain for reporting. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => { e.preventDefault(); handleDeleteStudent(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface CurrentLessonCellProps {
  hub: Hub;
  currentLessonId: string | null | undefined;
  currentLessonTitle: string | null | undefined;
  onChange: (lesson: LessonMeta) => Promise<void>;
}

const CEFR_LABELS: Record<string, string> = {
  'pre-a1': 'Pre-A1', a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2',
};

function lessonLabel(l: LessonMeta): string {
  const level = l.slot_cefr_level ? CEFR_LABELS[l.slot_cefr_level.toLowerCase()] ?? l.slot_cefr_level : null;
  const unitLesson = l.slot_unit_number != null && l.slot_lesson_number != null
    ? `U${l.slot_unit_number}L${l.slot_lesson_number}`
    : null;
  const prefix = [level, unitLesson].filter(Boolean).join(' ');
  return prefix ? `${prefix} — ${l.title}` : l.title;
}

const CurrentLessonCell: React.FC<CurrentLessonCellProps> = ({ hub, currentLessonId, currentLessonTitle, onChange }) => {
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState<LessonMeta[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (next && lessons === null) {
      setLoading(true);
      try {
        setLessons(await fetchHubLessonSequence(hub));
      } finally {
        setLoading(false);
      }
    }
  };

  const submit = async (lesson: LessonMeta) => {
    setSubmitting(true);
    try {
      await onChange(lesson);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 px-2 gap-1 max-w-[220px] justify-start">
          <BookOpen className="h-3 w-3 shrink-0" />
          <span className="truncate text-xs">
            {currentLessonTitle || 'Lesson 1 (default)'}
          </span>
          <Pencil className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2 max-h-96 overflow-y-auto" align="start">
        <p className="text-sm font-medium">Set current lesson</p>
        <p className="text-xs text-muted-foreground">
          The student's next class resumes from this lesson.
        </p>
        {loading && <Loader2 className="h-4 w-4 animate-spin mx-auto my-3" />}
        {!loading && lessons?.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No published lessons found for this hub.</p>
        )}
        {!loading && lessons?.map(l => (
          <button
            key={l.id}
            type="button"
            disabled={submitting}
            onClick={() => submit(l)}
            className={`w-full text-left text-xs rounded-md px-2 py-1.5 hover:bg-muted disabled:opacity-50 ${
              l.id === currentLessonId ? 'bg-muted font-medium' : ''
            }`}
          >
            {lessonLabel(l)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

interface CreditsCellProps {
  balance: number;
  onAdd: (amount: number) => Promise<void>;
}

const CreditsCell: React.FC<CreditsCellProps> = ({ balance, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>('10');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (value: number) => {
    setSubmitting(true);
    try {
      await onAdd(value);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1 font-medium">
        <CreditCard className="h-3 w-3" />
        {balance}
      </Badge>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1">
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3" align="start">
          <div>
            <p className="text-sm font-medium">Grant credits</p>
            <p className="text-xs text-muted-foreground">
              Use a negative number to remove credits.
            </p>
          </div>
          <div className="flex gap-2">
            {[5, 10, 25].map(n => (
              <Button
                key={n}
                size="sm"
                variant="outline"
                disabled={submitting}
                onClick={() => submit(n)}
              >
                +{n}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9"
            />
            <Button
              size="sm"
              disabled={submitting}
              onClick={() => submit(Number(amount))}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};