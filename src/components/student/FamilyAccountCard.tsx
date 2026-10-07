import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * "Switch to a family account" for someone who signed up as a student but is really a parent.
 * The role is granted by the become-family-account function (which also refuses when it is not
 * safe to switch: unconfirmed email, upcoming lessons, a family member's own profile). Shown to
 * plain students only.
 */
export const FamilyAccountCard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if ((user as { role?: string } | null)?.role !== 'student') return null;

  const handleSwitch = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('become-family-account');
      if (error) {
        // supabase-js hides the function's own message behind a generic one; pull the real reason out.
        let detail = '';
        try {
          const body = await (error as { context?: { json?: () => Promise<{ error?: string }> } }).context?.json?.();
          detail = typeof body?.error === 'string' ? body.error : '';
        } catch { /* not JSON: use the generic message */ }
        throw new Error(detail || error.message);
      }
      if (data?.error) throw new Error(data.error);

      // The signed-in role is cached for fast page loads; forget it so the next load reads the new one.
      try {
        sessionStorage.removeItem('auth_resolved_role');
        sessionStorage.removeItem('auth_redirect_done');
        localStorage.removeItem('auth_resolved_role');
      } catch { /* storage can be unavailable */ }
      toast({ title: 'Your family account is ready', description: 'Taking you to your family dashboard…' });
      window.location.assign('/parent');
    } catch (err) {
      toast({
        title: 'Could not switch your account',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      setBusy(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Family account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Are you a parent or guardian? Switch this account to a family account to add your children and follow each
            one's lessons from a single login.
          </p>
          <Button variant="outline" onClick={() => setOpen(true)}>Switch to a family account</Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(next) => { if (!busy) setOpen(next); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch to a family account?</DialogTitle>
            <DialogDescription>
              You'll sign in to the family dashboard, where you add your children and see their progress.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Your own lessons and progress stay saved, but they won't open from this login after you switch.</li>
            <li>To keep learning yourself, add yourself as a learner in your family.</li>
            <li>You need to have no upcoming lessons booked on this account.</li>
          </ul>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Not now</Button>
            <Button onClick={handleSwitch} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Switch to a family account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
