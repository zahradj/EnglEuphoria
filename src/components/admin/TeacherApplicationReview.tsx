import React, { useState, useEffect } from 'react'; // force rebuild
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Video,
  User,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Calendar,
  MessageSquare,
  ExternalLink,
  Loader2,
  CalendarCheck,
  FileDown,
  Trash2,
  Send,
  AlertTriangle,
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TeacherApplication {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nationality: string | null;
  phone: string | null;
  bio: string | null;
  education: string | null;
  teaching_experience_years: number | null;
  esl_certification: string | null;
  teaching_philosophy: string | null;
  teaching_methodology: string | null;
  classroom_management: string | null;
  video_description: string | null;
  preferred_age_groups: string[] | null;
  professional_photo_url?: string;
  cv_url?: string | null;
  current_stage: string;
  status: string;
  created_at: string;
  updated_at: string;
  availability: string | null;
  cover_letter: string | null;
  motivation: string | null;
  certifications: string[] | null;
  languages_spoken: string[] | null;
  video_url?: string;
  hub_preference?: string | null;
}

interface InterviewEmailTemplate {
  subject: string;
  body: string;
  meetingLink: string;
  useInternalRoom: boolean;
}

const stageConfig: Record<string, { label: string; color: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  'application_received': { label: 'New Application', color: 'bg-blue-100 text-blue-800', variant: 'outline' },
  'application_submitted': { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', variant: 'outline' },
  'under_review': { label: 'Under Review', color: 'bg-orange-100 text-orange-800', variant: 'secondary' },
  'documents_review': { label: 'Documents Under Review', color: 'bg-blue-100 text-blue-800', variant: 'secondary' },
  'interview_pending': { label: 'Interview Pending', color: 'bg-purple-100 text-purple-800', variant: 'secondary' },
  'interview_scheduled': { label: 'Interview Scheduled', color: 'bg-indigo-100 text-indigo-800', variant: 'secondary' },
  'interview_completed': { label: 'Interview Completed', color: 'bg-cyan-100 text-cyan-800', variant: 'secondary' },
  'approved': { label: 'Active', color: 'bg-green-100 text-green-800', variant: 'default' },
  'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800', variant: 'destructive' },
};

const ageGroupLabels: Record<string, string> = {
  'kids': '👶 Kids (4-11)',
  'teens': '🎓 Teens (12-17)',
  'adults': '💼 Adults (18+)',
  'all': '🌟 All Ages',
};

const hubPreferenceLabels: Record<string, { label: string; color: string }> = {
  'playground_specialist': { label: '🎮 Playground Specialist', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'academy_mentor': { label: '🎓 Academy Mentor', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'success_mentor': { label: '💼 Success Coach', color: 'bg-green-100 text-green-800 border-green-200' },
  'academy_success_mentor': { label: '🎓💼 Academy + Success', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const getDisplayName = (app: TeacherApplication | null) => {
  if (!app) return 'Unknown';
  return `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Unknown';
};

export const TeacherApplicationReview: React.FC = () => {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TeacherApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<TeacherApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [emailTemplate, setEmailTemplate] = useState<InterviewEmailTemplate>({
    subject: '',
    body: '',
    meetingLink: '',
    useInternalRoom: true,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, stageFilter]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load teacher applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        getDisplayName(app)?.toLowerCase().includes(term) ||
        app.email?.toLowerCase().includes(term) ||
        app.nationality?.toLowerCase().includes(term)
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(app => app.current_stage === stageFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleApproveForInterview = async (application: TeacherApplication) => {
    setEmailTemplate({
      subject: `Interview Invitation - EnglEuphoria Teaching Position`,
      body: `Dear ${application.first_name || getDisplayName(application)?.split(' ')[0]},

Thank you for your interest in joining EnglEuphoria as an ESL teacher!

We have reviewed your application and are pleased to invite you for an interview. Your experience and teaching philosophy align well with our mission.

The interview will last approximately 15 minutes and will include:
• Discussion of your teaching experience
• A brief demo lesson (5 minutes)
• Q&A about our platform and expectations

You will receive a link to join the interview room at the scheduled time.

We look forward to speaking with you!

Best regards,
The EnglEuphoria Hiring Team`,
      meetingLink: '',
      useInternalRoom: true,
    });
    setSelectedApplication(application);
    setShowInterviewDialog(true);
  };

  const confirmInterviewInvitation = async () => {
    if (!selectedApplication) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('recruitment-invite-applicant', {
        body: { applicationId: selectedApplication.id },
      });

      if (error) throw error;

      toast.success('Booking invitation sent', {
        description: `${getDisplayName(selectedApplication)} can now pick a date for the interview.`,
        duration: 5000,
      });

      setShowInterviewDialog(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    setActionLoading(true);
    try {
      // Routed through reject-teacher-application: send-transactional-email
      // requires an internal secret on every caller, which can't be attached
      // safely from the browser. The previous direct invoke() here always
      // hit that 403 silently (swallowed by the empty catch below it used to
      // have) — rejection emails were never actually being delivered.
      const { data, error } = await supabase.functions.invoke('reject-teacher-application', {
        body: { applicationId: selectedApplication.id, reason: rejectionReason || null },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.emailSent === false) {
        console.error('Rejection email failed to send:', data.emailError);
        toast.warning('Application rejected, but the notification email failed to send.', {
          description: data.emailError,
        });
      } else {
        toast.success('Application Rejected', {
          description: `${getDisplayName(selectedApplication)} has been notified.`,
        });
      }

      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application', { description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalApprove = async (application: TeacherApplication) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('approve-teacher', {
        body: {
          applicationId: application.id,
          email: application.email,
          firstName: application.first_name,
          lastName: application.last_name,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Teacher Approved & Invited! 🎉', {
        description: `${getDisplayName(application)} will receive an email to set their password and access the platform.`,
        duration: 5000,
      });

      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error approving teacher:', error);
      toast.error('Failed to approve teacher', {
        description: error.message || 'An unexpected error occurred',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (stage: string) => {
    const config = stageConfig[stage] || stageConfig['application_submitted'];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const rejectedCount = applications.filter(a => a.current_stage === 'rejected').length;
  const pendingCount = applications.filter(a => a.current_stage === 'application_submitted').length;
  const interviewCount = applications.filter(a => ['interview_pending', 'interview_scheduled', 'interview_completed'].includes(a.current_stage)).length;
  const approvedCount = applications.filter(a => a.current_stage === 'approved').length;

  const handleDeleteApplication = async (application: TeacherApplication) => {
    const isApproved = application.current_stage === 'approved';
    const confirmMsg = isApproved
      ? `Permanently delete ${getDisplayName(application)}'s application AND their teacher profile? This cannot be undone.`
      : `Permanently delete ${getDisplayName(application)}'s application? This cannot be undone.`;
    if (!confirm(confirmMsg)) return;
    try {
      // Delete associated interviews first
      await supabase.from('interviews').delete().eq('application_id', application.id);
      
      // If approved, also clean up teacher_profiles and profiles
      if (isApproved) {
        // Look up user by email to clean up their teacher data
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', application.email).maybeSingle();
        if (profile) {
          await supabase.from('teacher_profiles').delete().eq('user_id', profile.id);
          await supabase.from('profiles').update({ role: 'student', status: 'inactive' }).eq('id', profile.id);
        }
      }
      
      const { error } = await supabase.from('teacher_applications').delete().eq('id', application.id);
      if (error) throw error;
      toast.success('Application deleted', { description: `${getDisplayName(application)}'s record has been removed.` });
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const handleResendInvite = async (application: TeacherApplication) => {
    try {
      const { error } = await supabase.functions.invoke('recruitment-invite-applicant', {
        body: { applicationId: application.id },
      });
      if (error) throw error;
      toast.success('Booking invitation sent', {
        description: `${application.email} can now pick a date for the interview.`,
      });
    } catch (error) {
      console.error('Error sending booking invitation:', error);
      toast.error('Failed to send booking invitation');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Review Applications</h1>
        <p className="text-muted-foreground">Review and manage teacher applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <User className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interview Stage</p>
                <p className="text-2xl font-bold text-purple-600">{interviewCount}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs defaultValue="all" onValueChange={setStageFilter}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="application_submitted">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="interview_pending">Interview ({interviewCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <ApplicationGrid 
            applications={filteredApplications}
            onView={setSelectedApplication}
            onApprove={handleApproveForInterview}
            onFinalApprove={handleFinalApprove}
            finalApproveLoading={actionLoading}
            onReject={(app) => { setSelectedApplication(app); setShowRejectDialog(true); }}
            getStatusBadge={getStatusBadge}
            onDelete={handleDeleteApplication}
            onResendInvite={handleResendInvite}
          />
        </TabsContent>
        <TabsContent value="application_submitted" className="mt-6">
          <ApplicationGrid 
            applications={filteredApplications}
            onView={setSelectedApplication}
            onApprove={handleApproveForInterview}
            onFinalApprove={handleFinalApprove}
            finalApproveLoading={actionLoading}
            onReject={(app) => { setSelectedApplication(app); setShowRejectDialog(true); }}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        <TabsContent value="interview_pending" className="mt-6">
          <ApplicationGrid 
            applications={filteredApplications}
            onView={setSelectedApplication}
            onApprove={handleApproveForInterview}
            onFinalApprove={handleFinalApprove}
            finalApproveLoading={actionLoading}
            onReject={(app) => { setSelectedApplication(app); setShowRejectDialog(true); }}
            getStatusBadge={getStatusBadge}
            onResendInvite={handleResendInvite}
          />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <ApplicationGrid 
            applications={filteredApplications}
            onView={setSelectedApplication}
            onApprove={handleApproveForInterview}
            onFinalApprove={handleFinalApprove}
            finalApproveLoading={actionLoading}
            onReject={(app) => { setSelectedApplication(app); setShowRejectDialog(true); }}
            getStatusBadge={getStatusBadge}
            onDelete={handleDeleteApplication}
            onResendInvite={handleResendInvite}
          />
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          <ApplicationGrid 
            applications={filteredApplications}
            onView={setSelectedApplication}
            onApprove={handleApproveForInterview}
            onFinalApprove={handleFinalApprove}
            finalApproveLoading={actionLoading}
            onReject={(app) => { setSelectedApplication(app); setShowRejectDialog(true); }}
            getStatusBadge={getStatusBadge}
            onDelete={handleDeleteApplication}
          />
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication && !showRejectDialog && !showInterviewDialog} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedApplication.professional_photo_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getDisplayName(selectedApplication)?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{getDisplayName(selectedApplication)}</DialogTitle>
                    <DialogDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedApplication.email}
                      </span>
                      {selectedApplication.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedApplication.phone}
                        </span>
                      )}
                    </DialogDescription>
                  </div>
                  {getStatusBadge(selectedApplication.current_stage)}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="font-medium">{selectedApplication.nationality || 'Not specified'}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedApplication.teaching_experience_years} years</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Age Group</p>
                    <p className="font-medium">{selectedApplication.preferred_age_groups?.map(g => ageGroupLabels[g] || g).join(', ') || 'Not specified'}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Hub Preference</p>
                    <p className="font-medium">
                      {selectedApplication.hub_preference && hubPreferenceLabels[selectedApplication.hub_preference]
                        ? hubPreferenceLabels[selectedApplication.hub_preference].label
                        : 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Applied</p>
                    <p className="font-medium">{format(new Date(selectedApplication.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Bio */}
                {selectedApplication.bio && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      Bio
                    </h4>
                    <p className="text-muted-foreground">{selectedApplication.bio}</p>
                  </div>
                )}

                {/* Education */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <GraduationCap className="h-4 w-4" />
                    Education & Qualifications
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="font-medium">{selectedApplication.education || 'Not specified'}</p>
                    {selectedApplication.education && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedApplication.education}</p>
                    )}
                    {selectedApplication.esl_certification && (
                      <Badge variant="secondary" className="mt-2">{selectedApplication.esl_certification}</Badge>
                    )}
                  </div>
                </div>

                {/* CV View / Download */}
                {selectedApplication.cv_url && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <FileDown className="h-4 w-4" />
                      Curriculum Vitae
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const { viewCv } = await import('@/lib/teacherCv');
                            await viewCv(selectedApplication.cv_url!);
                          } catch (err) {
                            console.error('CV view error:', err);
                            toast.error('Failed to open CV');
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                      >
                        <FileDown className="h-4 w-4" />
                        View CV
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const { downloadCv } = await import('@/lib/teacherCv');
                            await downloadCv(selectedApplication.cv_url!);
                          } catch (err) {
                            console.error('CV download error:', err);
                            toast.error('Failed to download CV');
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        <FileDown className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                )}
                {selectedApplication.teaching_philosophy && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      Teaching Philosophy
                    </h4>
                    <p className="text-muted-foreground">{selectedApplication.teaching_philosophy}</p>
                  </div>
                )}

                {/* Applicants don't submit an actual video during application —
                    only a text description (video_description). A real video
                    is only collected after hiring, in the teacher's profile. */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Video className="h-4 w-4" />
                    Introduction Video
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.video_description || 'No video description submitted yet.'}
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-6">
                {(selectedApplication.current_stage === 'application_submitted' || selectedApplication.current_stage === 'application_received') && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={() => { setShowRejectDialog(true); }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleApproveForInterview(selectedApplication)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Send Interview Invite
                    </Button>
                  </>
                )}
                {['interview_pending', 'interview_scheduled', 'interview_completed', 'final_review'].includes(selectedApplication.current_stage) && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={() => { setShowRejectDialog(true); }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleFinalApprove(selectedApplication)}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve as Teacher
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {getDisplayName(selectedApplication!)}'s application.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection (optional)..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Invitation Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />
              Send Interview Invitation
            </DialogTitle>
            <DialogDescription>
              Review and customize the interview invitation email for {getDisplayName(selectedApplication!)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Internal Interview Room</p>
                <p className="text-xs text-muted-foreground">
                  A private EnglEuphoria interview room with Jitsi video will be created automatically.
                  The link will be sent to the teacher.
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Or use external link instead (optional)</label>
              <Input
                value={emailTemplate.meetingLink}
                onChange={(e) => setEmailTemplate(prev => ({ 
                  ...prev, 
                  meetingLink: e.target.value,
                  useInternalRoom: !e.target.value 
                }))}
                placeholder="Leave empty to use internal room, or paste Calendly/Zoom link..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Preview</label>
              <Textarea
                value={emailTemplate.body}
                onChange={(e) => setEmailTemplate(prev => ({ ...prev, body: e.target.value }))}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmInterviewInvitation}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CalendarCheck className="h-4 w-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Application Card Grid Component
interface ApplicationGridProps {
  applications: TeacherApplication[];
  onView: (app: TeacherApplication) => void;
  onApprove: (app: TeacherApplication) => void;
  onReject: (app: TeacherApplication) => void;
  getStatusBadge: (stage: string) => React.ReactNode;
  onDelete?: (app: TeacherApplication) => void;
  onResendInvite?: (app: TeacherApplication) => void;
  onFinalApprove?: (app: TeacherApplication) => void;
  finalApproveLoading?: boolean;
}

const FINAL_APPROVE_STAGES = ['interview_pending', 'interview_scheduled', 'interview_completed', 'final_review'];

const ApplicationGrid: React.FC<ApplicationGridProps> = ({
  applications,
  onView,
  onApprove,
  onReject,
  getStatusBadge,
  onDelete,
  onResendInvite,
  onFinalApprove,
  finalApproveLoading,
}) => {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No applications found</h3>
          <p className="text-muted-foreground">No teacher applications match your current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.professional_photo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getDisplayName(application)?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{getDisplayName(application)}</CardTitle>
                  <CardDescription className="text-sm">{application.email}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{application.nationality || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{application.teaching_experience_years} years experience</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{application.preferred_age_groups?.length ? application.preferred_age_groups.map(g => ageGroupLabels[g] || g).join(', ') : 'Not specified'}</span>
              </div>
              {application.hub_preference && hubPreferenceLabels[application.hub_preference] && (
                <div className="mt-1">
                  <Badge variant="outline" className={hubPreferenceLabels[application.hub_preference].color}>
                    {hubPreferenceLabels[application.hub_preference].label}
                  </Badge>
                </div>
              )}
              {application.video_url && (
                <div className="flex items-center gap-2 text-primary">
                  <Video className="h-4 w-4" />
                  <span>Video submitted</span>
                </div>
              )}
            </div>
            <div className="mt-3">
              {getStatusBadge(application.current_stage)}
            </div>
          </CardContent>
          <CardFooter className="pt-0 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView(application)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {(application.current_stage === 'application_submitted' || application.current_stage === 'application_received') && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onReject(application)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove(application)}
                >
                  <CalendarCheck className="h-4 w-4" />
                </Button>
              </>
            )}
            {application.current_stage === 'interview_scheduled' && onResendInvite && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResendInvite(application)}
              >
                <Send className="h-4 w-4 mr-1" />
                Resend
              </Button>
            )}
            {FINAL_APPROVE_STAGES.includes(application.current_stage) && onFinalApprove && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onReject(application)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={finalApproveLoading}
                  onClick={() => onFinalApprove(application)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve as Teacher
                </Button>
              </>
            )}
            {(application.current_stage === 'rejected' || application.current_stage === 'approved') && onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(application)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
