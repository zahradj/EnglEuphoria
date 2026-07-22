import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Eye, Edit2, Check, X, 
  GraduationCap, BookOpen, TrendingUp, Video,
  RefreshCw, Search, Filter, UserCheck, DollarSign,
  HeartPulse, Bell, Signal, SignalMedium, SignalLow,
  ShieldCheck, Wrench, ArrowRight, History
} from 'lucide-react';

import { SalesPanel } from './SalesPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  student_level: string;
  cefr_level: string;
  fluency_score: number;
  current_streak: number;
  onboarding_completed: boolean;
  progress: number; // computed
  teacher_name?: string;
}

interface LiveSession {
  id: string;
  room_id: string;
  session_status: string;
  started_at: string | null;
  teacher_name: string | null;
  teacher_id: string;
}

const LEVEL_OPTIONS = ['playground', 'academy', 'professional'];

const levelBadgeColor: Record<string, string> = {
  playground: 'bg-orange-100 text-orange-700',
  academy: 'bg-purple-100 text-purple-700',
  professional: 'bg-emerald-100 text-emerald-700',
};

export const SuperAdminControlCenter: React.FC = () => {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'monitor' | 'override' | 'sales' | 'pulse' | 'engineering'>('analytics');
  const navigate = useNavigate();
  const [engineeringCounts, setEngineeringCounts] = useState<{ sentinelPending: number; sentinelNeedsHuman: number; learnerSignals: number }>({ sentinelPending: 0, sentinelNeedsHuman: 0, learnerSignals: 0 });


  // Stats summary
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, activeNow: 0 });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          user_id,
          student_level,
          cefr_level,
          fluency_score,
          current_streak,
          onboarding_completed,
          users!inner(id, full_name, email)
        `)
        .limit(100);

      if (error) throw error;

      const rows: StudentRow[] = (data || []).map((row: any) => ({
        id: row.user_id,
        full_name: row.users?.full_name || 'Unknown',
        email: row.users?.email || '',
        student_level: row.student_level || 'academy',
        cefr_level: row.cefr_level || 'A1',
        fluency_score: row.fluency_score || 0,
        current_streak: row.current_streak || 0,
        onboarding_completed: row.onboarding_completed || false,
        // compute progress % from fluency_score (capped at 100)
        progress: Math.min(Math.round((row.fluency_score || 0) * 2), 100),
      }));

      setStudents(rows);

      // Fetch summary stats
      const [{ count: totalStudents }, { count: totalTeachers }] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      ]);
      setStats(s => ({ ...s, totalStudents: totalStudents || 0, totalTeachers: totalTeachers || 0 }));
    } catch (err: any) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveSessions = async () => {
    setSessionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classroom_sessions')
        .select('id, room_id, session_status, started_at, teacher_id')
        .in('session_status', ['active', 'started'])
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Enrich with teacher names
      const sessions: LiveSession[] = await Promise.all(
        (data || []).map(async (s: any) => {
          const { data: u } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', s.teacher_id)
            .maybeSingle();
          return {
            ...s,
            teacher_name: (u as any)?.full_name || 'Unknown Teacher',
          };
        })
      );

      setLiveSessions(sessions);
      setStats(prev => ({ ...prev, activeNow: sessions.length }));
    } catch {
      toast.error('Failed to load live sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleLevelChange = async (studentId: string, level: string) => {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({ student_level: level })
        .eq('user_id', studentId);

      if (error) throw error;

      setStudents(prev =>
        prev.map(s => s.id === studentId ? { ...s, student_level: level } : s)
      );
      setEditingId(null);
      toast.success(`Student level updated to "${level}"`);
    } catch {
      toast.error('Failed to update student level');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchLiveSessions();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.student_level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  // ─── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'analytics' as const, label: 'Global Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'monitor' as const, label: 'Live Monitor', icon: <Activity className="w-4 h-4" /> },
    { id: 'override' as const, label: 'Manual Override', icon: <Edit2 className="w-4 h-4" /> },
    { id: 'sales' as const, label: 'Sales & Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'pulse' as const, label: 'Classroom Pulse', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'engineering' as const, label: 'Engineering & Reliability', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  // Lazy-load engineering counts the first time the tab is opened.
  useEffect(() => {
    if (activeTab !== 'engineering') return;
    let cancelled = false;
    (async () => {
      try {
        const [pending, needsHuman, signals] = await Promise.all([
          (supabase as any).from('sentinel_incidents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          (supabase as any).from('sentinel_incidents').select('id', { count: 'exact', head: true }).eq('status', 'needs_human'),
          (supabase as any).from('learner_signals').select('id', { count: 'exact', head: true }),
        ]);
        if (cancelled) return;
        setEngineeringCounts({
          sentinelPending: pending?.count ?? 0,
          sentinelNeedsHuman: needsHuman?.count ?? 0,
          learnerSignals: signals?.count ?? 0,
        });
      } catch {
        // RLS or table-missing — just leave zeros, badges hide themselves.
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🎛️ Super-Control Center</h1>
          <p className="text-muted-foreground text-sm">God View — full platform oversight</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchStudents(); fetchLiveSessions(); }} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: <Users className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' },
          { label: 'Total Teachers', value: stats.totalTeachers, icon: <GraduationCap className="w-5 h-5 text-emerald-500" />, color: 'text-emerald-600' },
          { label: 'Live Sessions', value: stats.activeNow, icon: <Video className="w-5 h-5 text-red-500" />, color: 'text-red-600' },
        ].map(({ label, value, icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">{icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── ANALYTICS ─────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-44">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {LEVEL_OPTIONS.map(l => (
                  <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Students
                <Badge variant="secondary" className="ml-2">{filteredStudents.length}</Badge>
              </CardTitle>
              <CardDescription>Complete student roster with progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading students...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>CEFR</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Streak</TableHead>
                      <TableHead>Fluency</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{s.full_name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize text-xs ${levelBadgeColor[s.student_level] || 'bg-gray-100 text-gray-700'}`}>
                            {s.student_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.cefr_level || '—'}</Badge>
                        </TableCell>
                        <TableCell className="w-32">
                          <div className="flex items-center gap-2">
                            <Progress value={s.progress} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">{s.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">🔥 {s.current_streak}d</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{s.fluency_score} pts</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.onboarding_completed ? 'default' : 'secondary'}>
                            {s.onboarding_completed ? 'Active' : 'Onboarding'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── LIVE MONITOR ──────────────────────────────────────────────────── */}
      {activeTab === 'monitor' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                Active Classroom Sessions
                {liveSessions.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <Badge variant="destructive">{liveSessions.length} LIVE</Badge>
                  </span>
                )}
              </CardTitle>
              <CardDescription>Real-time view of all ongoing virtual classrooms</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading sessions...</div>
              ) : liveSessions.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">No active sessions right now</p>
                  <p className="text-xs text-muted-foreground mt-1">Sessions will appear here when teachers start classes</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {liveSessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <div>
                          <p className="font-medium text-sm">Room: <span className="font-mono">{session.room_id}</span></p>
                          <p className="text-xs text-muted-foreground">
                            Teacher: {session.teacher_name} · 
                            Started: {session.started_at
                              ? new Date(session.started_at).toLocaleTimeString()
                              : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{session.session_status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/classroom/${session.room_id}`, '_blank')}
                          className="gap-1 text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          View Logs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── MANUAL OVERRIDE ───────────────────────────────────────────────── */}
      {activeTab === 'override' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                Manual Override — Student Levels
              </CardTitle>
              <CardDescription>
                Change a student's world (Playground → Academy → Professional) or re-assign teacher access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Current Level</TableHead>
                      <TableHead>CEFR</TableHead>
                      <TableHead>Fluency</TableHead>
                      <TableHead className="text-right">Override Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{s.full_name}</p>
                              <p className="text-xs text-muted-foreground">{s.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${levelBadgeColor[s.student_level] || 'bg-gray-100 text-gray-700'}`}>
                            {s.student_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.cefr_level || '—'}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{s.fluency_score} pts</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === s.id ? (
                            <div className="flex items-center gap-2 justify-end">
                              <Select
                                value={newLevel}
                                onValueChange={setNewLevel}
                              >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  {LEVEL_OPTIONS.map(l => (
                                    <SelectItem key={l} value={l} className="capitalize text-xs">{l}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                onClick={() => newLevel && handleLevelChange(s.id, newLevel)}
                                disabled={!newLevel}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => { setEditingId(null); setNewLevel(''); }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1"
                              onClick={() => { setEditingId(s.id); setNewLevel(s.student_level); }}
                            >
                              <Edit2 className="w-3 h-3" />
                              Change Level
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── SALES & REVENUE ──────────────────────────────────────────────── */}
      {activeTab === 'sales' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SalesPanel />
        </motion.div>
      )}

      {/* ─── CLASSROOM PULSE (Emergency View) ─────────────────────────────── */}
      {activeTab === 'pulse' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
            <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-sm font-medium">
              {liveSessions.length} class{liveSessions.length !== 1 ? 'es' : ''} live
            </span>
            <Badge variant="default" className="bg-green-600">
              {liveSessions.length} healthy
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-500" />
                Live Classroom Pulse
              </CardTitle>
              <CardDescription>
                Emergency view — monitor active sessions and intervene if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading sessions...</div>
              ) : liveSessions.length === 0 ? (
                <div className="text-center py-12">
                  <HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">No active sessions right now</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {liveSessions.map(session => {
                    const elapsed = session.started_at
                      ? Math.round((Date.now() - new Date(session.started_at).getTime()) / 60000)
                      : 0;
                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                          <div>
                            <p className="font-medium text-sm">
                              Teacher: {session.teacher_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Room: <span className="font-mono">{session.room_id}</span> · {elapsed} min elapsed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600 text-xs gap-1">
                            <Signal className="w-3 h-3" />
                            Connected
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await supabase.from('notifications').insert({
                                  user_id: session.teacher_id,
                                  title: 'Admin Alert',
                                  content: 'Admin is monitoring your session. Please check your connection if you experience issues.',
                                  type: 'admin_alert',
                                });
                                toast.success('Teacher notified');
                              } catch {
                                toast.error('Failed to notify teacher');
                              }
                            }}
                            className="gap-1 text-xs"
                          >
                            <Bell className="w-3 h-3" />
                            Notify
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── ENGINEERING & RELIABILITY ─────────────────────────────────────── */}
      {activeTab === 'engineering' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Engineering & Reliability</h2>
            <p className="text-sm text-muted-foreground">
              Self-healing agent incidents, AI/learner telemetry, and platform health reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sentinel-1 — Senior SWE / Self-Healing Agent */}
            <Card
              role="button"
              tabIndex={0}
              onClick={() => navigate('/admin/sentinel')}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/sentinel'); }}
              className="cursor-pointer hover:border-primary transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Senior SWE Agent — Sentinel-1</CardTitle>
                      <CardDescription>Self-healing agent: incident reports, root-cause analyses, proposed patches.</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Wrench className="w-3 h-3" />
                    {engineeringCounts.sentinelPending} pending
                  </Badge>
                  {engineeringCounts.sentinelNeedsHuman > 0 && (
                    <Badge variant="destructive">
                      {engineeringCounts.sentinelNeedsHuman} need human
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Beta Analytics */}
            <Card
              role="button"
              tabIndex={0}
              onClick={() => navigate('/admin/beta-analytics')}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/beta-analytics'); }}
              className="cursor-pointer hover:border-primary transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Beta Analytics</CardTitle>
                      <CardDescription>Real-learner telemetry, frustration/engagement detectors, tuning log.</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {engineeringCounts.learnerSignals} learner signals
                </Badge>
              </CardContent>
            </Card>

            {/* Lesson Switch Audit */}
            <Card
              role="button"
              tabIndex={0}
              onClick={() => navigate('/admin/audit/lesson-switches')}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/audit/lesson-switches'); }}
              className="cursor-pointer hover:border-primary transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Lesson Switch Audit</CardTitle>
                      <CardDescription>Teacher-initiated Master Library swaps, with mid-lesson flags.</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};

