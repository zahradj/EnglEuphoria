import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDiagnosticsSnapshot } from '@/lib/connectionDebugLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, LifeBuoy, ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SupportTicket {
  id: string;
  created_at: string;
  message: string;
  diagnostics: string | null;
  status: string;
  admin_response: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
  closed: 'outline',
};

/**
 * Teacher-facing "report a technical problem" panel. Not a live chat with a
 * standing support agent — it's a ticket thread: the teacher writes what's
 * wrong (optionally attaching the last class's connection log), an admin
 * reviews it in the Tech Support inbox and can leave a reply, and the
 * teacher sees status/replies update here without reloading.
 */
export const TechnicalSupportTab: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [attachDiagnostics, setAttachDiagnostics] = useState(true);
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const diagnosticsPreview = formatDiagnosticsSnapshot();
  const hasDiagnostics = !diagnosticsPreview.startsWith('(no connection events');

  const fetchTickets = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('support_tickets')
      .select('id, created_at, message, diagnostics, status, admin_response')
      .eq('user_id', user.id)
      .eq('category', 'technical')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load support tickets:', error);
    } else {
      setTickets((data ?? []) as SupportTicket[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    if (!user) return;
    const channel = supabase
      .channel(`support-tickets-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets', filter: `user_id=eq.${user.id}` },
        () => fetchTickets(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        user_email: user.email || '',
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Teacher',
        category: 'technical',
        message: message.trim(),
        diagnostics: attachDiagnostics && hasDiagnostics ? diagnosticsPreview : null,
        priority: 'high',
        status: 'open',
      });
      if (error) throw error;
      toast.success('Report sent — the admin team can now see it.');
      setMessage('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-primary" />
          Technical Support
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Describe the problem and, if you just came out of a class, attach the connection
          log — it goes straight to the admin team.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Report a problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What went wrong? e.g. 'My video froze 5 minutes into class with a Playground student.'"
            className="min-h-[100px]"
            maxLength={2000}
          />

          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
            <Checkbox
              id="attach-diagnostics"
              checked={attachDiagnostics}
              onCheckedChange={(v) => setAttachDiagnostics(!!v)}
              disabled={!hasDiagnostics}
            />
            <label htmlFor="attach-diagnostics" className="text-sm leading-snug cursor-pointer">
              <span className="font-medium text-foreground">Attach connection log</span>
              <br />
              <span className="text-muted-foreground">
                {hasDiagnostics
                  ? "Includes the sync/signaling/video events from your last class in this browser tab."
                  : 'No connection events captured yet in this tab — join a class, then come back here to attach the log.'}
              </span>
            </label>
          </div>

          {attachDiagnostics && hasDiagnostics && (
            <pre className="max-h-40 overflow-y-auto rounded-lg border border-border/60 bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">
              {diagnosticsPreview}
            </pre>
          )}

          <Button onClick={handleSubmit} disabled={!message.trim() || sending} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'Sending…' : 'Send report'}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Your reports</h3>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <Card key={t.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={STATUS_VARIANT[t.status] ?? 'default'}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-foreground/90">{t.message}</p>
                  {t.diagnostics && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground flex items-center gap-1">
                        <ClipboardCopy className="h-3 w-3" /> Attached connection log
                      </summary>
                      <pre className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border/60 bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {t.diagnostics}
                      </pre>
                    </details>
                  )}
                  {t.admin_response && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Admin reply</p>
                      <p className="text-sm whitespace-pre-wrap text-foreground/90">{t.admin_response}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalSupportTab;
