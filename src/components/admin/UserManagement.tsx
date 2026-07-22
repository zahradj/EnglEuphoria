import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, UserPlus, ArrowRightLeft, Loader2, Baby, GraduationCap, Briefcase, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ASSIGNABLE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'parent', label: 'Parent' },
] as const;

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  current_system: 'kids' | 'teen' | 'adult';
  age?: number;
  current_level?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Migration modal state
  const [migrateModalOpen, setMigrateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetSystem, setTargetSystem] = useState<string>('');
  const [migrationReason, setMigrationReason] = useState<string>('');
  const [migrating, setMigrating] = useState(false);

  // Create-user modal state
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('');
  const [creatingUser, setCreatingUser] = useState(false);

  // Generated-password reveal modal state — shown exactly once after creation.
  const [generatedPasswordModalOpen, setGeneratedPasswordModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedUserEmail, setGeneratedUserEmail] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedUsers: User[] = (data || []).map((user: any) => ({
        id: user.id,
        full_name: user.full_name || user.email || 'Unknown User',
        email: user.email,
        role: user.role,
        current_system: user.current_system || 'kids',
        age: user.age,
        current_level: user.current_level_id,
        status: 'active',
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateClick = (user: User) => {
    setSelectedUser(user);
    setTargetSystem('');
    setMigrationReason('');
    setMigrateModalOpen(true);
  };

  const handleOpenCreateUser = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('');
    setCreateUserModalOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || !newUserRole) return;

    setCreatingUser(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { fullName: newUserName, email: newUserEmail, role: newUserRole },
      });

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || 'Failed to create user');
        return;
      }

      setCreateUserModalOpen(false);
      setGeneratedPassword(data.generatedPassword);
      setGeneratedUserEmail(newUserEmail);
      setPasswordCopied(false);
      setGeneratedPasswordModalOpen(true);
      toast.success(data.message || 'User created');
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      toast.success('Password copied to clipboard');
    } catch {
      toast.error('Could not copy — select and copy the password manually');
    }
  };

  const handleMigrate = async () => {
    if (!selectedUser || !targetSystem) return;

    setMigrating(true);
    try {
      // Update user's current system
      const { error: updateError } = await supabase
        .from('users')
        .update({ current_system: targetSystem })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Record the transition
      const { error: transitionError } = await supabase
        .from('system_transitions')
        .insert({
          student_id: selectedUser.id,
          from_system: selectedUser.current_system,
          to_system: targetSystem,
          transition_type: 'manual',
          reason: migrationReason || 'Manual admin migration',
        });

      if (transitionError) throw transitionError;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, current_system: targetSystem as User['current_system'] }
          : u
      ));

      toast.success(`Successfully migrated ${selectedUser.full_name} to ${getSystemLabel(targetSystem)}`);
      setMigrateModalOpen(false);
    } catch (error) {
      console.error('Error migrating user:', error);
      toast.error('Failed to migrate user');
    } finally {
      setMigrating(false);
    }
  };

  const getSystemLabel = (system: string) => {
    switch (system) {
      case 'kids': return 'Playground';
      case 'teen': return 'Academy';
      case 'adult': return 'Hub';
      default: return system;
    }
  };

  const getSystemBadge = (system: string) => {
    switch (system) {
      case 'kids':
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <Baby className="h-3 w-3 mr-1" />
            Playground
          </Badge>
        );
      case 'teen':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <GraduationCap className="h-3 w-3 mr-1" />
            Academy
          </Badge>
        );
      case 'adult':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Briefcase className="h-3 w-3 mr-1" />
            Hub
          </Badge>
        );
      default:
        return <Badge variant="secondary">{system}</Badge>;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-primary/10 text-primary';
      case 'teacher': return 'bg-green-100 text-green-700';
      case 'parent': return 'bg-amber-100 text-amber-700';
      case 'admin': return 'bg-red-100 text-red-700';
      case 'marketing': return 'bg-pink-100 text-pink-700';
      case 'content_creator': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSystem = selectedSystem === 'all' || user.current_system === selectedSystem;
    return matchesSearch && matchesRole && matchesSystem;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Manager</h1>
        <Button onClick={handleOpenCreateUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="parent">Parents</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="content_creator">Content Creators</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                <SelectItem value="kids">🎪 Playground</SelectItem>
                <SelectItem value="teen">🏛️ Academy</SelectItem>
                <SelectItem value="adult">🏢 Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Age</th>
                  <th className="text-left py-3 px-4 font-medium">Current System</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.age || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {getSystemBadge(user.current_system)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {user.role === 'student' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMigrateClick(user)}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-1" />
                          Migrate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Migration Modal */}
      <Dialog open={migrateModalOpen} onOpenChange={setMigrateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrate User to Different System</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">{selectedUser?.full_name}</p>
              <p className="text-sm text-muted-foreground">
                Current: {selectedUser && getSystemLabel(selectedUser.current_system)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Target System</Label>
              <Select value={targetSystem} onValueChange={setTargetSystem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target system..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedUser?.current_system !== 'kids' && (
                    <SelectItem value="kids">🎪 Playground (Kids)</SelectItem>
                  )}
                  {selectedUser?.current_system !== 'teen' && (
                    <SelectItem value="teen">🏛️ Academy (Teens)</SelectItem>
                  )}
                  {selectedUser?.current_system !== 'adult' && (
                    <SelectItem value="adult">🏢 Hub (Adults)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                placeholder="e.g., Parent request, Placement test result..."
                value={migrationReason}
                onChange={(e) => setMigrationReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMigrateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMigrate} disabled={!targetSystem || migrating}>
              {migrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                'Confirm Migration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createUserModalOpen} onOpenChange={setCreateUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-name">Full Name</Label>
              <Input
                id="new-user-name"
                placeholder="e.g., Zahra Djaanine"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                type="email"
                placeholder="name@engleuphoria.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              A secure password is generated automatically and shown once after creation.
              The new user can change it anytime from "Forgot password?" on the login page.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUserName || !newUserEmail || !newUserRole || creatingUser}
            >
              {creatingUser ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Password Reveal Modal — shown exactly once */}
      <Dialog open={generatedPasswordModalOpen} onOpenChange={setGeneratedPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Share these sign-in details with <span className="font-medium text-foreground">{generatedUserEmail}</span>.
              This password is only shown once — copy it now.
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={generatedPassword} className="font-mono" />
              <Button type="button" variant="outline" size="icon" onClick={handleCopyPassword}>
                {passwordCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setGeneratedPasswordModalOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
