import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoReviewPanel } from './VideoReviewPanel';
import { supabase } from '@/integrations/supabase/client';
import {
  Loader2, UserCheck, Clock, FileText, Globe, GraduationCap,
  ExternalLink, ChevronDown, ChevronUp, RefreshCw, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingTeacher {
  id: string;
  user_id: string;
  bio: string | null;
  video_url: string | null;
  intro_video_url: string | null;
  profile_image_url: string | null;
  specializations: string[] | null;
  languages_spoken: string[] | null;
  years_experience: number | null;
  accent: string | null;
  certificate_urls: string[] | null;
  video_status: string | null;
  video_rejection_reason: string | null;
  profile_complete: boolean | null;
  profile_approved_by_admin: boolean | null;
  can_teach: boolean | null;
  hub_role: string | null;
  created_at: string;
  updated_at: string;
  // joined from users table
  full_name: string;
  email: string;
}

const hubRoleLabels: Record<string, { label: string; color: string }> = {
  'playground_specialist': { label: '🎮 Playground', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'academy_mentor': { label: '🎓 Academy', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'success_mentor': { label: '💼 Success', color: 'bg-green-100 text-green-800 border-green-200' },
  'academy_success_mentor': { label: '🎓💼 Academy + Success', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

export const TeacherProfileReviewQueue = () => {
  const [pending, setPending] = useState<PendingTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      // Get teacher profiles that are complete but not yet approved
      const { data: profiles, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('profile_complete', true)
        .eq('profile_approved_by_admin', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!profiles || profiles.length === 0) {
        setPending([]);
        return;
      }

      // Fetch user info for each profile
      const userIds = profiles.map(p => p.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', userIds);

      if (usersError) throw usersError;

      const userMap = new Map((users || []).map(u => [u.id, u]));

      const merged: PendingTeacher[] = profiles.map(p => {
        const user = userMap.get(p.user_id);
        return {
          ...p,
          full_name: user?.full_name || 'Unknown',
          email: user?.email || '',
        } as PendingTeacher;
      });

      setPending(merged);
      // Auto-expand the first pending teacher so the reviewer is one click from Approve.
      setExpandedId(prev => prev ?? (merged[0]?.id ?? null));
    } catch (err) {
      console.error('Error fetching pending profiles:', err);
      toast.error('Failed to load pending profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const approveTeacherProfile = async (teacher: PendingTeacher) => {
    setApprovingId(teacher.id);
    try {
      const { error } = await supabase
        .from('teacher_profiles')
        .update({
          video_status: 'approved',
          video_rejection_reason: null,
          can_teach: true,
          is_available: true,
          profile_approved_by_admin: true,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', teacher.id);

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'video-approved',
            recipientEmail: teacher.email,
            idempotencyKey: `profile-approved-${teacher.id}`,
            templateData: { name: teacher.full_name },
          }
        });
      } catch { /* Approval must not fail if email delivery fails. */ }

      try {
        await supabase.from('admin_notifications').insert({
          notification_type: 'teacher_profile_approved',
          title: 'Teacher Profile Approved — Now Live',
          message: `${teacher.full_name}'s profile has been approved. They are now visible to students and can receive bookings.`,
          metadata: { teacher_user_id: teacher.user_id, teacher_name: teacher.full_name },
        });
      } catch { /* Non-blocking notification. */ }

      toast.success('Teacher approved and live', {
        description: `${teacher.full_name} can now receive bookings.`,
      });
      setPending(prev => prev.filter(item => item.id !== teacher.id));
      setExpandedId(prev => prev === teacher.id ? null : prev);
    } catch (err) {
      console.error('Error approving teacher profile:', err);
      toast.error('Failed to approve teacher profile');
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading pending profiles…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Teacher Profile Review
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review completed profiles, watch intro videos, and approve teachers to go live.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPending}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Awaiting Review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {pending.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <UserCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground mt-1">No pending teacher profiles to review.</p>
          </CardContent>
        </Card>
      )}

      {/* Profile cards */}
      {pending.map(teacher => {
        const isExpanded = expandedId === teacher.id;
        const videoUrl = teacher.intro_video_url || teacher.video_url;

        return (
          <Card key={teacher.id} className="overflow-hidden">
            {/* Collapsed header */}
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleExpand(teacher.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.profile_image_url || ''} />
                    <AvatarFallback>{teacher.full_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{teacher.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Review
                  </Badge>
                  <Button
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      approveTeacherProfile(teacher);
                    }}
                    disabled={approvingId === teacher.id}
                  >
                    {approvingId === teacher.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Approve Profile
                  </Button>
                  {teacher.hub_role && hubRoleLabels[teacher.hub_role] && (
                    <Badge variant="outline" className={hubRoleLabels[teacher.hub_role].color}>
                      {hubRoleLabels[teacher.hub_role].label}
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>

            {/* Expanded details */}
            {isExpanded && (
              <CardContent className="border-t space-y-6 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Profile info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Bio
                      </h4>
                      <p className="text-sm leading-relaxed bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {teacher.bio || <span className="italic text-muted-foreground">No bio provided</span>}
                      </p>
                    </div>

                    {teacher.specializations && teacher.specializations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" /> Specializations
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.specializations.map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {teacher.languages_spoken && teacher.languages_spoken.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" /> Languages
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.languages_spoken.map(l => (
                            <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {teacher.accent && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Accent</h4>
                        <p className="text-sm">{teacher.accent}</p>
                      </div>
                    )}

                    {teacher.years_experience != null && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Experience</h4>
                        <p className="text-sm">{teacher.years_experience} year{teacher.years_experience !== 1 ? 's' : ''}</p>
                      </div>
                    )}

                    {teacher.certificate_urls && teacher.certificate_urls.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Certificates</h4>
                        <div className="space-y-1">
                          {teacher.certificate_urls.map((url, i) => (
                            <Button key={i} variant="outline" size="sm" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Certificate {i + 1}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Video review panel */}
                  <div>
                    <VideoReviewPanel
                      teacherProfileId={teacher.id}
                      teacherUserId={teacher.user_id}
                      teacherName={teacher.full_name}
                      teacherEmail={teacher.email}
                      videoUrl={videoUrl}
                      videoStatus={teacher.video_status || 'pending'}
                      onStatusChange={fetchPending}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
