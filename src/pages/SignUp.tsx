import React, { useEffect, useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { SimpleAuthForm } from '@/components/auth/SimpleAuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { HeroThemeProvider } from '@/contexts/HeroThemeContext';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const { user, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasInitiatedSignOut, setHasInitiatedSignOut] = useState(false);

  // Sign out existing user when accessing signup page
  // Use hasInitiatedSignOut flag to prevent infinite loops
  useEffect(() => {
    if (!loading && user && !hasInitiatedSignOut) {
      setHasInitiatedSignOut(true);
      setIsSigningOut(true);
      supabase.auth.signOut().finally(() => {
        setIsSigningOut(false);
      });
    }
  }, [user, loading, hasInitiatedSignOut]);

  // Show loading while auth context is initializing
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while signing out existing user
  if (isSigningOut) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Preparing signup...</p>
        </div>
      </div>
    );
  }

  return (
    <HeroThemeProvider>
      <AuthPageLayout
        title="Create Account"
        subtitle="Join our community of English learners"
        icon={UserPlus}
        variant="default"
      >
        <SimpleAuthForm mode="signup" />
      </AuthPageLayout>
    </HeroThemeProvider>
  );
};

export default SignUp;
