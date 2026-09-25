/**
 * JoinClassroomPage — magic-link entry for `/join-classroom/:token`.
 *
 * A teacher invites a specific student (by email) to one scheduled lesson.
 * This page redeems that one-time token: it asks `classroom-invite`'s
 * `enter` action for a magic-link credential tied to the student's real
 * account, verifies it client-side (no password, no Supabase-hosted
 * redirect), then hands off into the existing `/classroom/:id` route.
 *
 * Nothing about the classroom itself is touched by this page — the invited
 * student's real user id already matches the booking's student_id, so the
 * classroom's own access check passes unmodified.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ShieldAlert, DoorOpen } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function friendlyError(message: string | undefined): string {
  if (!message) return 'We could not open your classroom. Please contact your teacher.';
  if (/expired/i.test(message)) return 'This invite link has expired. Ask your teacher to send a new one.';
  if (/cancelled/i.test(message)) return 'This lesson was cancelled.';
  if (/invalid/i.test(message)) return 'This invite link is not valid.';
  return message;
}

export default function JoinClassroomPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Opening your invitation…');
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setError('Missing invite link.');
      return;
    }
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        setStatus('Checking your invitation…');
        const res = await fetch(`${supabaseUrl}/functions/v1/classroom-invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ action: 'enter', token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.tokenHash || !data?.bookingId) {
          setError(friendlyError(data?.error));
          return;
        }

        setStatus('Signing you in…');
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: 'magiclink',
        });
        if (verifyError) {
          setError(friendlyError(verifyError.message));
          return;
        }

        setStatus('Taking you to your classroom…');
        navigate(`/classroom/${data.bookingId}`, { replace: true });
      } catch (e: any) {
        setError(friendlyError(e?.message));
      }
    })();
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Classroom Invite</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {status}
        </div>
        <DoorOpen className="h-6 w-6 text-primary opacity-60" />
      </div>
    </div>
  );
}
