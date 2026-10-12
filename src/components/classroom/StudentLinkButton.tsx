import React, { useState } from 'react';
import { Link2, Copy, Check, MessageCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  bookingId: string;
  studentName?: string;
}

/**
 * Teacher-only: a join link for THIS lesson, for a student who cannot get in (not signed in, wrong account,
 * forgotten password). The link signs the student straight in to their own account and opens this classroom.
 * Created on demand by the classroom-invite function (action `link_for_booking`).
 */
export const StudentLinkButton: React.FC<Props> = ({ bookingId, studentName }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const make = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('classroom-invite', { body: { action: 'link_for_booking', bookingId } });
      if (error || !data?.joinLink) throw new Error(data?.error || error?.message || 'Could not create the link');
      setLink(data.joinLink as string);
      try { await navigator.clipboard.writeText(data.joinLink as string); setCopied(true); } catch { /* the link is shown below to copy by hand */ }
    } catch (e) {
      toast({ title: 'Could not create the link', description: (e as { message?: string })?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const copyAgain = async () => {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { /* shown below */ }
  };

  const name = studentName?.split(' ')[0] || 'your student';
  const whatsapp = link ? `https://wa.me/?text=${encodeURIComponent(`Your EnglEuphoria class is open. Tap to join: ${link}`)}` : '#';

  return (
    <Popover onOpenChange={(o) => { if (!o) setCopied(false); }}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary" className="h-9 gap-1.5 rounded-full shadow-md" title="Send the student a link to join this lesson">
          <Link2 className="h-4 w-4" /> Student link
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3">
        <div>
          <p className="text-sm font-semibold">Can’t {name} get in?</p>
          <p className="text-xs text-muted-foreground">
            Send this link. It signs {name} in to their own account and opens this classroom, no password needed.
          </p>
        </div>
        {!link ? (
          <Button onClick={make} disabled={busy} className="w-full">
            {busy ? 'Creating…' : 'Create the link'}
          </Button>
        ) : (
          <div className="space-y-2">
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border bg-muted px-2 py-1.5 text-xs" aria-label="Student join link" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyAgain} className="flex-1 gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" asChild className="flex-1 gap-1.5">
                <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Works for this lesson only, until an hour after it ends.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
