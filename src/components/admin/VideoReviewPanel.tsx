import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle, XCircle, ChevronDown, Loader2, ExternalLink, Video, Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const REJECTION_PRESETS = [
  "Background is too cluttered/unprofessional.",
  "Energy level is too low for this track.",
  "Please follow the provided script template.",
  "Poor video/audio quality.",
];

interface VideoReviewPanelProps {
  teacherProfileId: string;
  teacherUserId: string;
  teacherName: string;
  teacherEmail: string;
  videoUrl: string | null;
  videoStatus: string;
  onStatusChange: () => void;
}

export const VideoReviewPanel: React.FC<VideoReviewPanelProps> = ({
  teacherProfileId,
  teacherUserId,
  teacherName,
  teacherEmail,
  videoUrl,
  videoStatus,
  onStatusChange,
}) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRejectPreset = (preset: string) => {
    setRejectionReason(preset);
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    setLoading(true);
    try {
      const fullReason = customNote
        ? `${rejectionReason} ${customNote}`
        : rejectionReason;

      const { error } = await supabase
        .from('teacher_profiles')
        .update({
          video_status: 'rejected',
          video_rejection_reason: fullReason,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', teacherProfileId);

      if (error) throw error;

      // Send rejection email
      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'video-rejected',
            recipientEmail: teacherEmail,
            idempotencyKey: `video-rejected-${teacherProfileId}-${Date.now()}`,
            templateData: { name: teacherName, reason: fullReason },
          }
        });
      } catch (emailErr) {
      }

      toast.success('Video rejected & teacher notified', {
        description: `${teacherName} has been asked to re-upload.`,
      });
      setShowRejectDialog(false);
      setRejectionReason('');
      setCustomNote('');
      onStatusChange();
    } catch (err) {
      console.error('Error rejecting video:', err);
      toast.error('Failed to reject video');
    } finally {
      setLoading(false);
    }
  };

  const confirmApprove = async () => {
    setLoading(true);
    try {
      // Update profile: video approved, teacher can teach, profile visible
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
        .eq('id', teacherProfileId);

      if (error) throw error;

      // Send approval email
      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'video-approved',
            recipientEmail: teacherEmail,
            idempotencyKey: `video-approved-${teacherProfileId}`,
            templateData: { name: teacherName },
          }
        });
      } catch (emailErr) {
      }

      // Create admin notification
      try {
        await supabase.from('admin_notifications').insert({
          notification_type: 'teacher_video_approved',
          title: 'Teacher Video Approved — Now Live',
          message: `${teacherName}'s intro video has been approved. They are now visible to students and can receive bookings.`,
          metadata: { teacher_user_id: teacherUserId, teacher_name: teacherName },
        });
      } catch { /* silent */ }

      toast.success('🎉 Teacher Approved & Live!', {
        description: `${teacherName}'s video is now live. Students can book sessions.`,
        duration: 6000,
      });
      setShowApproveDialog(false);
      onStatusChange();
    } catch (err) {
      console.error('Error approving video:', err);
      toast.error('Failed to approve video');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = () => {
    const map: Record<string, { label: string; cls: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      pending: { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-800', variant: 'outline' },
      ai_checked: { label: 'AI Checked', cls: 'bg-blue-100 text-blue-800', variant: 'secondary' },
      admin_review: { label: 'Admin Review', cls: 'bg-purple-100 text-purple-800', variant: 'secondary' },
      approved: { label: '✅ Approved — Live', cls: 'bg-green-100 text-green-800', variant: 'default' },
      rejected: { label: '❌ Rejected', cls: 'bg-red-100 text-red-800', variant: 'destructive' },
    };
    const cfg = map[videoStatus] || map.pending;
    return <Badge variant={cfg.variant} className={cfg.cls}>{cfg.label}</Badge>;
  };

  return (
    <>
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Review
          </h4>
          {statusBadge()}
        </div>

        {videoUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Watch Video
            </a>
          </Button>
        )}

        {videoStatus !== 'approved' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Approve Button */}
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowApproveDialog(true)}
              disabled={!videoUrl}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve & Go Live
            </Button>

            {/* Reject with presets */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="destructive" size="sm" disabled={!videoUrl}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                {REJECTION_PRESETS.map((preset) => (
                  <DropdownMenuItem key={preset} onClick={() => handleRejectPreset(preset)}>
                    {preset}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {videoStatus === 'approved' && (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Shield className="h-4 w-4" />
            This teacher is live and visible to students.
          </div>
        )}
      </div>

      {/* Reject Confirmation */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Video — {teacherName}</DialogTitle>
            <DialogDescription>
              The teacher will receive an email with this feedback and can re-upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm font-medium text-red-800">Reason:</p>
              <p className="text-sm text-red-700">{rejectionReason}</p>
            </div>
            <Textarea
              placeholder="Add a personal note (optional)…"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              Reject & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve {teacherName}'s Video
            </DialogTitle>
            <DialogDescription>
              This will activate the teacher's profile and make them visible to all students.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
            <p className="text-sm font-medium text-green-800">What happens next:</p>
            <ul className="text-sm text-green-700 space-y-1 list-disc pl-4">
              <li><strong>Profile status</strong> → <code>video_status = 'approved'</code></li>
              <li><strong>Teaching enabled</strong> → <code>can_teach = true</code></li>
              <li><strong>Teacher notified</strong> → Congratulations email sent</li>
              <li><strong>Visibility</strong> → Video icon appears in student search results</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmApprove} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
              Approve & Go Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
