import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionPrivacyGuardProps {
  sessionId: string;
  children: React.ReactNode;
}

type AccessState = 'loading' | 'granted' | 'denied';

/**
 * Verifies that the current user is the booked student, teacher, or an admin
 * for the given session before rendering the classroom.
 */
export const SessionPrivacyGuard: React.FC<SessionPrivacyGuardProps> = ({
  sessionId,
  children,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [access, setAccess] = useState<AccessState>('loading');

  const userRole = (user as any)?.role;
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!user?.id || !sessionId) {
      setAccess('denied');
      return;
    }

    // Admin "God Mode" — instant access
    if (isAdmin) {
      setAccess('granted');
      return;
    }

    const verify = async () => {
      // Use the server-side security definer function
      const { data, error } = await supabase.rpc('can_access_booking_session', {
        p_session_id: sessionId,
        p_user_id: user.id,
      });

      if (error) {
        console.error('[SessionPrivacyGuard] RPC error:', error);
        // Fallback: try can_access_lesson for teacher rooms keyed by room_id
        const { data: lessonAccess } = await supabase.rpc('can_access_lesson', {
          room_uuid: sessionId,
          user_uuid: user.id,
        });
        setAccess(lessonAccess ? 'granted' : 'denied');
        return;
      }

      setAccess(data ? 'granted' : 'denied');
    };

    verify();
  }, [user?.id, sessionId, isAdmin]);

  if (access === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-foreground text-lg font-medium">Verifying session access...</p>
        </div>
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
            <ShieldOff className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">This session is private</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You don't have access to this classroom. Only the student and teacher
              associated with this booking can enter.
            </p>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
