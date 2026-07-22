import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MoreHorizontal, Star, DollarSign, Users, Clock, TrendingUp, Globe, Settings2, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HubPayoutSettings } from './HubPayoutSettings';

interface Teacher {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  totalReviews: number;
  lessonsCompleted: number;
  monthlyEarnings: number;
  status: 'active' | 'inactive' | 'pending';
  specializations: string[];
  joinDate: string;
  lastActive: string;
  responseTime: string;
  completionRate: number;
  studentSatisfaction: number;
  languages: string[];
  hubRole: string | null;
}

const hubRoleOptions = [
  { value: 'playground_specialist', label: '🎮 Playground Specialist', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'academy_mentor', label: '🎓 Academy Mentor', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'success_mentor', label: '💼 Success Coach', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'academy_success_mentor', label: '🎓💼 Academy + Success', color: 'bg-purple-100 text-purple-800 border-purple-200' },
];

const getHubRoleBadge = (role: string | null) => {
  const option = hubRoleOptions.find(o => o.value === role);
  if (!option) return <Badge variant="outline" className="text-xs">Unassigned</Badge>;
  return <Badge variant="outline" className={`text-xs ${option.color}`}>{option.label}</Badge>;
};

export const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [hubFilter, setHubFilter] = useState<string>('all');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [newHubRole, setNewHubRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteTeacher = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: pendingDelete.user_id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setTeachers((prev) => prev.filter((t) => t.user_id !== pendingDelete.user_id));
      toast.success(`Removed ${pendingDelete.name}`);
      setPendingDelete(null);
    } catch (err: any) {
      console.error('Failed to delete teacher:', err);
      toast.error(err?.message || 'Could not delete teacher');
    } finally {
      setDeleting(false);
    }
  };

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const totalEarnings = teachers.reduce((sum, t) => sum + t.monthlyEarnings, 0);
  const avgRating = teachers.length > 0 ? teachers.reduce((sum, t) => sum + t.rating, 0) / teachers.length : 0;

  const fetchTeachers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('teacher_profiles')
        .select('id, user_id, profile_image_url, rating, total_reviews, specializations, languages_spoken, can_teach, hub_role, created_at')
        .eq('profile_complete', true);

      if (error) throw error;

      if (!profiles || profiles.length === 0) {
        setTeachers([]);
        return;
      }

      const userIds = profiles.map(p => p.user_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds);

      const userMap = new Map((users || []).map(u => [u.id, u]));

      const transformed: Teacher[] = profiles.map((tp: any) => {
        const user = userMap.get(tp.user_id);
        return {
          id: tp.id,
          user_id: tp.user_id,
          name: user?.full_name || 'Unknown',
          email: user?.email || '',
          avatar: tp.profile_image_url || '',
          rating: tp.rating || 0,
          totalReviews: tp.total_reviews || 0,
          lessonsCompleted: 0,
          monthlyEarnings: 0,
          status: tp.can_teach ? 'active' as const : 'inactive' as const,
          specializations: tp.specializations || [],
          joinDate: tp.created_at?.split('T')[0] || '',
          lastActive: 'N/A',
          responseTime: 'N/A',
          completionRate: 0,
          studentSatisfaction: tp.rating ? tp.rating * 20 : 0,
          languages: tp.languages_spoken || [],
          hubRole: tp.hub_role,
        };
      });

      setTeachers(transformed);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSaveHubRole = async () => {
    if (!editingTeacher || !newHubRole) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('teacher_profiles')
        .update({ hub_role: newHubRole })
        .eq('id', editingTeacher.id);

      if (error) throw error;

      toast.success('Hub role updated', {
        description: `${editingTeacher.name} is now assigned as ${hubRoleOptions.find(o => o.value === newHubRole)?.label}`,
      });
      setEditingTeacher(null);
      fetchTeachers();
    } catch (error) {
      console.error('Error updating hub role:', error);
      toast.error('Failed to update hub role');
    } finally {
      setSaving(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || teacher.status === selectedStatus;
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                  teacher.specializations.includes(selectedSpecialization);
    const matchesHub = hubFilter === 'all' || teacher.hubRole === hubFilter;
    return matchesSearch && matchesStatus && matchesSpecialization && matchesHub;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allSpecializations = Array.from(new Set(teachers.flatMap(t => t.specializations)));

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
      </div>

      {/* Hub Payout Rates — admin sets per-hub teacher payout */}
      <HubPayoutSettings />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">{totalTeachers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Teachers</p>
                <p className="text-2xl font-bold">{activeTeachers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">€{totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <CardTitle>All Teachers</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Hubs</option>
                {hubRoleOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
                <option value="unassigned">Unassigned</option>
              </select>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Specializations</option>
                {allSpecializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={teacher.avatar} />
                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(teacher.status)}>
                        {teacher.status}
                      </Badge>
                      {getHubRoleBadge(teacher.hubRole)}
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs">{teacher.rating}</span>
                        <span className="text-xs text-muted-foreground">({teacher.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">€{teacher.monthlyEarnings}</p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">{teacher.lessonsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingTeacher(teacher);
                      setNewHubRole(teacher.hubRole || '');
                    }}
                  >
                    <Settings2 className="w-4 h-4 mr-1" />
                    Assign Hub
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(teacher)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Delete teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTeachers.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No teachers found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hub Role Assignment Dialog */}
      <Dialog open={!!editingTeacher} onOpenChange={() => setEditingTeacher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Assign Hub Role
            </DialogTitle>
            <DialogDescription>
              Change {editingTeacher?.name}'s hub assignment. This determines which students can see and book this teacher.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={editingTeacher?.avatar} />
                <AvatarFallback>{editingTeacher?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{editingTeacher?.name}</p>
                <p className="text-sm text-muted-foreground">{editingTeacher?.email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Hub Role</label>
              <Select value={newHubRole} onValueChange={setNewHubRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hub role..." />
                </SelectTrigger>
                <SelectContent>
                  {hubRoleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                • <strong>Playground Specialist</strong> — Kids 4-11, 30-min sessions<br/>
                • <strong>Academy Mentor</strong> — Teens 12-17, 60-min sessions<br/>
                • <strong>Success Coach</strong> — Adults 18+, 60-min sessions<br/>
                • <strong>Academy + Success</strong> — Visible in both Academy and Success hubs
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTeacher(null)}>Cancel</Button>
            <Button onClick={handleSaveHubRole} disabled={saving || !newHubRole}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Hub Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{pendingDelete?.name}</strong> ({pendingDelete?.email}),
              their authentication account, teacher profile, and role assignments. Lesson history
              and payouts remain for reporting. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => { e.preventDefault(); handleDeleteTeacher(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete teacher
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
