import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Upload, Video, FileCheck, AlertCircle, CheckCircle, Clapperboard, CheckCircle2, X } from 'lucide-react';
import { VideoInstructionsModal } from './VideoInstructionsModal';
import { VideoPreCheck } from './VideoPreCheck';

interface TeacherProfile {
  id?: string;
  user_id: string;
  bio: string;
  video_url: string;
  profile_image_url?: string;
  specializations: string[];
  accent?: string;
  languages_spoken: string[];
  years_experience: number;
  profile_complete: boolean;
  can_teach: boolean;
  certificate_urls: string[];
}

interface ProfileSetupTabProps {
  teacherId: string;
  onProfileComplete?: (complete: boolean) => void;
}

export const ProfileSetupTab = ({ teacherId, onProfileComplete }: ProfileSetupTabProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile>({
    user_id: teacherId,
    bio: '',
    video_url: '',
    specializations: [],
    languages_spoken: [],
    years_experience: 0,
    profile_complete: false,
    can_teach: false,
    certificate_urls: []
  });
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selfReviewComplete, setSelfReviewComplete] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [teacherId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', teacherId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        if (data.video_url) {
          setVideoPreview(getEmbedUrl(data.video_url));
        }
        if (onProfileComplete) {
          onProfileComplete(data.profile_complete);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getEmbedUrl = (url: string): string | null => {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/videos\/)?([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const validateVideoUrl = (url: string): boolean => {
    return getEmbedUrl(url) !== null;
  };

  const handleVideoUrlChange = (url: string) => {
    setProfile(prev => ({ ...prev, video_url: url }));
    
    if (url && validateVideoUrl(url)) {
      setVideoPreview(getEmbedUrl(url));
    } else {
      setVideoPreview(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingCert(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${teacherId}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('teacher-certificates')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('teacher-certificates')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      setProfile(prev => ({
        ...prev,
        certificate_urls: [...prev.certificate_urls, ...uploadedUrls]
      }));

      toast({
        title: "Certificates uploaded successfully",
        description: `${uploadedUrls.length} file(s) uploaded`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload certificates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingCert(false);
    }
  };

  const handleRemoveCertificate = async (index: number) => {
    const url = profile.certificate_urls[index];
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

    setProfile(prev => ({
      ...prev,
      certificate_urls: prev.certificate_urls.filter((_, i) => i !== index)
    }));

    toast({
      title: 'Certificate removed'
    });
  };

  const handleSave = async () => {
    if (!profile.bio.trim()) {
      toast({
        title: "Bio required",
        description: "Please write a short bio about yourself",
        variant: "destructive",
      });
      return;
    }

    if (!profile.video_url.trim()) {
      toast({
        title: "Video URL required",
        description: "Please provide a YouTube introduction video",
        variant: "destructive",
      });
      return;
    }

    if (!validateVideoUrl(profile.video_url)) {
      toast({
        title: "Invalid video URL",
        description: "Please provide a valid YouTube link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const isComplete = !!(profile.bio.trim() && profile.video_url.trim() && validateVideoUrl(profile.video_url) && profile.profile_image_url && profile.certificate_urls.length > 0);

      const payload = {
        user_id: teacherId,
        bio: profile.bio,
        video_url: profile.video_url,
        profile_image_url: profile.profile_image_url || null,
        specializations: profile.specializations,
        languages_spoken: profile.languages_spoken,
        years_experience: profile.years_experience,
        certificate_urls: profile.certificate_urls,
        profile_complete: isComplete,
        profile_approved_by_admin: false,
        updated_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('teacher_profiles')
        .insert(payload)
        .select()
        .single();

      if (!insertError) {
        setProfile(insertedData);
        if (onProfileComplete) {
          onProfileComplete(insertedData.profile_complete);
        }

        // If profile is now complete, update application stage to final_review
        if (insertedData.profile_complete) {
          await supabase
            .from('teacher_applications')
            .update({ current_stage: 'final_review' })
            .eq('user_id', teacherId);
        }

        toast({
          title: "Profile saved successfully",
          description: insertedData.profile_complete
            ? "Your profile has been submitted for review!"
            : "Profile saved. Complete all required fields to submit for review.",
        });
        return;
      }

      if (insertError.code !== '23505') {
        throw insertError;
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('teacher_profiles')
        .update(payload)
        .eq('user_id', teacherId)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(updatedData);
      if (onProfileComplete) {
        onProfileComplete(updatedData.profile_complete);
      }

      // If profile is now complete, update application stage to final_review
      if (updatedData.profile_complete) {
        await supabase
          .from('teacher_applications')
          .update({ current_stage: 'final_review' })
          .eq('user_id', teacherId);
      }

      toast({
        title: "Profile saved successfully",
        description: updatedData.profile_complete
          ? "Your profile has been submitted for review!"
          : "Profile saved. Complete all required fields to submit for review.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requiredFieldsComplete = profile.bio.trim() && profile.video_url.trim() && validateVideoUrl(profile.video_url) && profile.profile_image_url && profile.certificate_urls.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Complete your profile to start teaching
          </p>
        </div>
        <Badge 
          variant={profile.profile_complete ? "default" : "secondary"}
          className="flex items-center gap-1"
        >
          {profile.profile_complete ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Profile Complete
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              Profile Incomplete
            </>
          )}
        </Badge>
      </div>

      {!profile.profile_complete && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Complete all required fields (*) to unlock your teaching dashboard and start scheduling lessons.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bio">
                Short Bio/Introduction *
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell students about your teaching experience, qualifications, and what makes you a great teacher..."
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="mt-1"
              />
              <p className="text-sm mt-1 text-muted-foreground">
                {profile.bio.length} characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={profile.years_experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="accent">Accent</Label>
                <Input
                  id="accent"
                  placeholder="e.g., American, British, Canadian"
                  value={profile.accent || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, accent: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Introduction Video
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="video-url">
                  YouTube Video Link *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuideModal(true)}
                >
                  <Clapperboard className="h-4 w-4 mr-1" />
                  View Script & Filming Guide
                </Button>
              </div>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={profile.video_url}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className="mt-1"
              />
              <div className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground space-y-1">
                <p><strong className="text-foreground">How to upload on YouTube:</strong></p>
                <p>1. Record a 1–3 minute introduction video.</p>
                <p>2. Upload it to YouTube.</p>
                <p>3. Set the video to <strong className="text-foreground">Private</strong> and share access with reviewers, or use <strong className="text-foreground">Unlisted</strong> if private preview is blocked.</p>
                <p>4. Paste the YouTube link here.</p>
              </div>
            </div>

            {selfReviewComplete && (
              <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
                {[
                  'Audio quality verified',
                  'Lighting verified',
                  'Script structure followed',
                ].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                ))}
              </div>
            )}

            {!selfReviewComplete && profile.video_url && (
              <p className="text-sm text-muted-foreground">
                Complete the filming checklist to improve your approval chances.
              </p>
            )}

            {videoPreview && (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={videoPreview}
                  width="100%"
                  height="300"
                  frameBorder="0"
                  allowFullScreen
                  title="Video Preview"
                  className="w-full"
                />
              </div>
            )}

            <VideoPreCheck
              onCheckComplete={(passed, results) => {
                if (passed) {
                  toast({ title: 'Video passed AI pre-check!', description: 'All quality checks are green. You\'re ready to submit!' });
                }
              }}
            />

            {profile.video_url && !validateVideoUrl(profile.video_url) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please provide a valid YouTube link
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Certificates & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="certificates">
                Upload Certificates *
              </Label>
              <Input
                id="certificates"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={uploadingCert}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload teaching certificates, diplomas, or other relevant documents (PDF, JPG, PNG)
              </p>
            </div>

            {profile.certificate_urls.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Uploaded Certificates:</p>
                <div className="space-y-2">
                  {profile.certificate_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <span>Certificate {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertificate(index)}
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove certificate ${index + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={loading || !requiredFieldsComplete}
            size="lg"
          >
            {loading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>
      </div>

      <VideoInstructionsModal
        open={showGuideModal}
        onOpenChange={setShowGuideModal}
        onSelfReviewComplete={setSelfReviewComplete}
      />
    </div>
  );
};