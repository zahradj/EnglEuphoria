import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TeacherStatus = 'NEW' | 'PENDING_APPROVAL' | 'APPROVED';

interface TeacherProfile {
  id: string;
  user_id: string;
  bio: string | null;
  video_url: string | null;
  profile_image_url: string | null;
  profile_complete: boolean;
  can_teach: boolean;
  profile_approved_by_admin: boolean;
  timezone: string;
  hourly_rate_dzd: number;
  hourly_rate_eur: number;
  years_experience: number;
  rating: number;
  total_reviews: number;
  specializations: string[];
  languages_spoken: string[];
  certificate_urls: string[];
}

interface UseTeacherStatusReturn {
  status: TeacherStatus;
  loading: boolean;
  profile: TeacherProfile | null;
  refetch: () => void;
}

export const useTeacherStatus = (teacherId: string): UseTeacherStatusReturn => {
  const [status, setStatus] = useState<TeacherStatus>('NEW');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  const determineStatus = (profileData: TeacherProfile | null): TeacherStatus => {
    if (!profileData) return 'NEW';
    
    // Check if profile is complete
    if (!profileData.profile_complete) {
      return 'NEW';
    }
    
    // Profile is complete but waiting for admin approval
    if (!profileData.profile_approved_by_admin) {
      return 'PENDING_APPROVAL';
    }
    
    // Profile is complete and approved
    if (profileData.profile_approved_by_admin && profileData.can_teach) {
      return 'APPROVED';
    }
    
    // Fallback to pending if approved but can_teach is false
    return 'PENDING_APPROVAL';
  };

  const fetchProfile = useCallback(async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', teacherId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching teacher profile:', error);
        setStatus('NEW');
        setProfile(null);
        return;
      }

      setProfile(data);
      setStatus(determineStatus(data));
    } catch (error) {
      console.error('Error in useTeacherStatus:', error);
      setStatus('NEW');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    status,
    loading,
    profile,
    refetch: fetchProfile
  };
};
