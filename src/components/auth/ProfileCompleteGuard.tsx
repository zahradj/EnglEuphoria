
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProfileCompleteGuardProps {
  children: React.ReactNode;
}

export const ProfileCompleteGuard: React.FC<ProfileCompleteGuardProps> = ({ children }) => {
  const { user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  // Safety timeout to prevent hanging indefinitely
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⏱️ ProfileCompleteGuard safety timeout - allowing through');
        setProfileComplete(true);
        setLoading(false);
      }
    }, 8000);
    return () => clearTimeout(safetyTimeout);
  }, [loading]);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user || !isConfigured) {
        setLoading(false);
        setProfileComplete(true); // Allow demo mode to proceed
        return;
      }

      // Validate user ID before making database query
      if (!user.id || typeof user.id !== 'string' || user.id.trim() === '') {
        console.error('Invalid user ID:', user.id);
        setLoading(false);
        setProfileComplete(true); // Allow to proceed to avoid blocking
        return;
      }

      try {
        if (user.role === 'teacher') {
          const { data: profile, error } = await supabase
            .from('teacher_profiles')
            .select('profile_complete')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error checking profile status:', error);
            // If profile doesn't exist, redirect to application
            if (error.code === 'PGRST116') {
              navigate('/for-teachers');
              return;
            }
            // For other errors, allow to proceed to avoid blocking
            setProfileComplete(true);
          } else {
            setProfileComplete(profile?.profile_complete || false);
            if (!profile?.profile_complete) {
              navigate('/teacher-application');
              return;
            }
          }
        } else if (user.role === 'student') {
          // For students, check if they have completed their profile
          const { data: profile, error } = await supabase
            .from('student_profiles')
            .select('profile_complete')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error checking student profile:', error);
            // If profile doesn't exist, redirect to application
            if (error.code === 'PGRST116') {
              navigate('/student-application');
              return;
            }
            // For other errors, allow to proceed
            setProfileComplete(true);
          } else {
            setProfileComplete(profile?.profile_complete || false);
            if (!profile?.profile_complete) {
              navigate('/student-application');
              return;
            }
          }
        } else {
          // Admin users don't need profile completion
          setProfileComplete(true);
        }
      } catch (error) {
        console.error('Unexpected error in profile check:', error);
        setProfileComplete(true); // Allow to proceed to avoid blocking
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [user, navigate, isConfigured]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking profile status...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
