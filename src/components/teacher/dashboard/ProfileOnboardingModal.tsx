import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Upload, 
  Video, 
  FileCheck, 
  AlertCircle, 
  Loader2,
  Camera,
  GraduationCap,
  X,
  CheckCircle2,
  PartyPopper
} from 'lucide-react';

interface ProfileOnboardingModalProps {
  teacherId: string;
  teacherName: string;
  onComplete: () => void;
}

export const ProfileOnboardingModal: React.FC<ProfileOnboardingModalProps> = ({
  teacherId,
  teacherName,
  onComplete
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCerts, setUploadingCerts] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    videoUrl: '',
    profileImageUrl: '',
    certificateUrls: [] as string[]
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const getEmbedUrl = (url: string): string | null => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

    const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/videos\/)?([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return null;
  };

  const isValidVideoUrl = formData.videoUrl ? getEmbedUrl(formData.videoUrl) !== null : false;
  const videoPreview = formData.videoUrl ? getEmbedUrl(formData.videoUrl) : null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, photo: 'Photo must be under 5MB' }));
      return;
    }

    setUploadingPhoto(true);
    setFieldErrors(prev => ({ ...prev, photo: '' }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${teacherId}/profile.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('teacher-certificates')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-certificates')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, profileImageUrl: publicUrl }));
      toast({ title: 'Photo uploaded successfully' });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setFieldErrors(prev => ({ ...prev, photo: 'Failed to upload photo. Please try again.' }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file sizes
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setFieldErrors(prev => ({ ...prev, certs: `"${file.name}" exceeds 10MB limit` }));
        return;
      }
    }

    setUploadingCerts(true);
    setFieldErrors(prev => ({ ...prev, certs: '' }));
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${teacherId}/certs/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('teacher-certificates')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('teacher-certificates')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        certificateUrls: [...prev.certificateUrls, ...uploadedUrls]
      }));
      toast({ title: `${uploadedUrls.length} certificate(s) uploaded` });
    } catch (error) {
      console.error('Error uploading certificates:', error);
      setFieldErrors(prev => ({ ...prev, certs: 'Failed to upload certificates. Please try again.' }));
    } finally {
      setUploadingCerts(false);
    }
  };

  const handleRemoveCertificate = async (index: number) => {
    const url = formData.certificateUrls[index];
    try {
      const bucketUrl = '/storage/v1/object/public/teacher-certificates/';
      const pathIndex = url.indexOf(bucketUrl);
      if (pathIndex !== -1) {
        const filePath = decodeURIComponent(url.substring(pathIndex + bucketUrl.length));
        await supabase.storage.from('teacher-certificates').remove([filePath]);
      }
    } catch (error) {
      console.error('Error deleting certificate file:', error);
    }
    setFormData(prev => ({
      ...prev,
      certificateUrls: prev.certificateUrls.filter((_, i) => i !== index)
    }));
    toast({ title: 'Certificate removed' });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.bio.trim()) {
      errors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 50) {
      errors.bio = 'Bio must be at least 50 characters';
    }

    if (!formData.videoUrl.trim()) {
      errors.video = 'YouTube video link is required';
    } else if (!isValidVideoUrl) {
      errors.video = 'Please provide a valid YouTube or Vimeo link';
    }

    if (!formData.profileImageUrl) {
      errors.photo = 'Professional headshot is required';
    }

    if (formData.certificateUrls.length === 0) {
      errors.certs = 'At least one certificate is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const parseSupabaseError = (error: any): string => {
    if (!error) return 'An unexpected error occurred';
    
    const msg = error.message || error.details || String(error);
    
    if (msg.includes('violates row-level security')) {
      return 'Permission denied. Please ensure you are logged in with the correct account.';
    }
    if (msg.includes('duplicate key') || error.code === '23505') {
      return 'Profile already exists. Attempting to update instead...';
    }
    if (msg.includes('value too long')) {
      return 'One of your fields exceeds the allowed length. Please shorten your bio or other text fields.';
    }
    if (msg.includes('check constraint')) {
      return 'A database constraint was violated. The admin notification system may need updating. Please contact support or try again.';
    }
    
    return `Save failed: ${msg}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        user_id: teacherId,
        bio: formData.bio.trim(),
        video_url: formData.videoUrl.trim(),
        profile_image_url: formData.profileImageUrl || null,
        certificate_urls: formData.certificateUrls,
        profile_complete: true,
        profile_approved_by_admin: false,
        can_teach: false,
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('teacher_profiles')
        .insert(payload);

      if (insertError && insertError.code !== '23505') {
        throw insertError;
      }

      if (insertError?.code === '23505') {
        const { error: updateError } = await supabase
          .from('teacher_profiles')
          .update({
            ...payload,
            profile_complete: true,
          })
          .eq('user_id', teacherId);

        if (updateError) throw updateError;
      }

      // Update the teacher's application stage to final_review so admins see them
      // Use user_id first (reliable), fall back to email if user_id not set on application
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const userEmail = userData.user?.email;

      if (userId) {
        const { data: appByUserId } = await supabase
          .from('teacher_applications')
          .update({ current_stage: 'final_review' })
          .eq('user_id', userId)
          .select('id')
          .maybeSingle();

        // If no application found by user_id, try email as fallback
        if (!appByUserId && userEmail) {
          await supabase
            .from('teacher_applications')
            .update({ current_stage: 'final_review' })
            .eq('email', userEmail);
        }
      }

      setSubmitted(true);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const friendlyMessage = parseSupabaseError(error);
      toast({ 
        title: 'Profile submission failed', 
        description: friendlyMessage,
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const canSubmit = formData.bio.trim().length >= 50 && formData.videoUrl.trim() && isValidVideoUrl && formData.profileImageUrl && formData.certificateUrls.length > 0;

  // Success state after submission
  if (submitted) {
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Profile Submitted!</h2>
            <p className="text-muted-foreground max-w-sm">
              Congratulations, {teacherName}! Your profile has been submitted for review. 
              Our team will review your profile and notify you once approved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Status: Pending Review
            </div>
            <Button onClick={onComplete} className="mt-4">
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
              <DialogDescription>
                Set up your teacher profile to get started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.profileImageUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(teacherName)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                {uploadingPhoto ? (
                  <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-primary-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            <div>
              <p className="font-medium">{teacherName}</p>
              <p className="text-sm text-muted-foreground">Upload a professional headshot with a plain white background *</p>
              {fieldErrors.photo && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.photo}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Bio / Introduction *
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell students about your teaching experience, qualifications, and what makes you a great teacher..."
              value={formData.bio}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, bio: e.target.value }));
                if (fieldErrors.bio) setFieldErrors(prev => ({ ...prev, bio: '' }));
              }}
              rows={4}
              className={fieldErrors.bio ? 'border-destructive' : ''}
            />
            <div className="flex justify-between">
              {fieldErrors.bio ? (
                <p className="text-sm text-destructive">{fieldErrors.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Minimum 50 characters</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formData.bio.length} characters
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              YouTube Introduction Video Link *
            </Label>
            <Input
              id="video"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, videoUrl: e.target.value }));
                if (fieldErrors.video) setFieldErrors(prev => ({ ...prev, video: '' }));
              }}
              className={fieldErrors.video ? 'border-destructive' : ''}
            />
            {fieldErrors.video && (
              <p className="text-sm text-destructive">{fieldErrors.video}</p>
            )}
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground space-y-1">
              <p><strong className="text-foreground">How to submit your YouTube video:</strong></p>
              <p>1. Record a 1–3 minute introduction video.</p>
              <p>2. Upload it to YouTube.</p>
              <p>3. Set visibility to <strong className="text-foreground">Private</strong> and share access with reviewers, or use <strong className="text-foreground">Unlisted</strong> if private preview does not work.</p>
              <p>4. Paste the YouTube link here.</p>
            </div>
            
            {formData.videoUrl && !isValidVideoUrl && formData.videoUrl.length > 5 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please provide a valid YouTube or Vimeo link</AlertDescription>
              </Alert>
            )}

            {videoPreview && (
              <div className="border rounded-lg overflow-hidden mt-2">
                <iframe
                  src={videoPreview}
                  width="100%"
                  height="200"
                  frameBorder="0"
                  allowFullScreen
                  title="Video Preview"
                />
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Certificates & Documents *
            </Label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center ${fieldErrors.certs ? 'border-destructive' : ''}`}>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleCertificateUpload}
                disabled={uploadingCerts}
                className="hidden"
                id="cert-upload"
              />
              <label htmlFor="cert-upload" className="cursor-pointer">
                {uploadingCerts ? (
                  <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  Click to upload certificates (PDF, JPG, PNG — max 10MB each)
                </p>
              </label>
            </div>
            {fieldErrors.certs && (
              <p className="text-sm text-destructive">{fieldErrors.certs}</p>
            )}
            
            {formData.certificateUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.certificateUrls.map((_, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                    <FileCheck className="w-3 h-3 text-green-500" />
                    Certificate {index + 1}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(index)}
                      className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove certificate ${index + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !canSubmit}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Profile for Review'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
