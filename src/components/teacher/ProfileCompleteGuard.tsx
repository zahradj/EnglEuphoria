import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProfileSetupTab } from './ProfileSetupTab';

interface ProfileCompleteGuardProps {
  teacherId: string;
  children: React.ReactNode;
}

export const ProfileCompleteGuard = ({ teacherId, children }: ProfileCompleteGuardProps) => {
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    checkProfileStatus();
  }, [teacherId]);

  const checkProfileStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('profile_complete, can_teach, profile_approved_by_admin')
        .eq('user_id', teacherId)
        .maybeSingle();

      if (error) throw error;

      
      setProfileComplete(data?.profile_complete && data?.can_teach);
    } catch (error) {
      console.error('Error checking profile status:', error);
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = (complete: boolean) => {
    setProfileComplete(complete);
    if (complete) {
      setShowProfileSetup(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking profile status...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <ProfileSetupTab 
        teacherId={teacherId} 
        onProfileComplete={handleProfileComplete}
      />
    );
  }

  if (!profileComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl">Profile Incomplete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Please complete your profile to unlock your teaching dashboard.
              </AlertDescription>
            </Alert>
            
            <p className="text-muted-foreground">
              You need to complete your teacher profile before you can access teaching features like scheduling lessons, viewing students, and managing assignments.
            </p>

            <div className="space-y-2">
              <p className="font-medium">Required to complete:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Write a short bio/introduction</li>
                <li>• Add a YouTube or Vimeo introduction video</li>
              </ul>
            </div>

            <Button 
              onClick={() => setShowProfileSetup(true)}
              size="lg"
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              Complete My Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
};