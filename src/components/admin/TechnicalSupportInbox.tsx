import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, LifeBuoy, RefreshCw, ClipboardCopy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SupportTicket {
  id: string;
  created_at: string;
  user_email: string;
  user_name: string | null;
  message: string;
  diagnostics: string | null;
  status: string;
  admin_response: string | null;
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'] as const;

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
  closed: 'outline',
};

/**
 * Admin inbox for teacher-submitted technical reports (support_tickets,
 * category='technical'). This is where "the admin team sees it" resolves to
 * — there's no separate live-monitoring process, so getting a report
 * actually fixed still means someone here reads it and, if it's a real bug,
 * brings it to a dev session.
 */
export const TechnicalSupportInbox: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | typeof STATUS_OPTIONS[number]>('open');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('category', 'technical')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch support tickets:', error);
      toast.error('Failed to load technical reports');
    } else {
      setTickets((data ?? []) as SupportTicket[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    const channel = supabase
      .channel('technical-support-inbox')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchTickets(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const previous = tickets;
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
    if (error) {
      console.error(error);
      toast.error('Could not update status');
      setTickets(previous);
    } else {
      toast.success(`Marked as ${status.replace('_', ' ')}`);
    }
  };

  const sendReply = async (id: string) => {
    const reply = replyDrafts[id]?.trim();
    if (!reply) return;
    const { error } = await supabase
      .from('support_tickets')
      .update({ admin_response: reply, status: 'in_progress' })
      .eq('id', id);
    if (error) {
      console.error(error);
      toast.error('Could not send reply');
      return;
    }
    toast.success('Reply sent to the teacher');
    setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
    fetchTickets();
  };

  const copyDiagnostics = async (diagnostics: string) => {
    try {
      await navigator.clipboard.writeText(diagnostics);
      toast.success('Diagnostics copied');
    } catch {
      toast.error('Clipboard blocked by browser');
    }
  };

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);
  const openCount = tickets.filter((t) => t.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            Tech Support
            {openCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {openCount} open
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Technical problems reported by teachers from their dashboard, with connection
            diagnostics when attached.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({tickets.length})</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchTickets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <LifeBuoy className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No reports {filter !== 'all' ? `with status "${filter.replace('_', ' ')}"` : 'yet'}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      <span className="truncate">{t.user_name || t.user_email}</span>
                      <Badge variant={statusVariant[t.status] ?? 'default'}>
                        {t.status.replace('_', ' ')}
                      </Badge>
                      {t.diagnostics && (
                        <Badge variant="outline" className="text-[10px]">
                          Diagnostics attached
                        </Badge>
                      )}
                    </CardTitle>
                    <a href={`mailto:${t.user_email}`} className="text-sm text-primary hover:underline break-all">
                      {t.user_email}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap text-foreground/90 bg-muted/40 rounded-md p-3 border border-border/50">
                  {t.message}
                </p>

                {t.diagnostics && (
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground flex items-center gap-1">
                      <ClipboardCopy className="h-3 w-3" /> View connection diagnostics
                    </summary>
                    <div className="mt-2 space-y-2">
                      <pre className="max-h-64 overflow-y-auto rounded-lg border border-border/60 bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {t.diagnostics}
                      </pre>
                      <Button variant="outline" size="sm" onClick={() => copyDiagnostics(t.diagnostics!)}>
                        <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" /> Copy
                      </Button>
                    </div>
                  </details>
                )}

                {t.admin_response && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary mb-1">Your reply</p>
                    <p className="text-sm whitespace-pre-wrap text-foreground/90">{t.admin_response}</p>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <Textarea
                    value={replyDrafts[t.id] ?? ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))}
                    placeholder="Reply to the teacher…"
                    className="min-h-[60px] text-sm"
                  />
                  <Button size="sm" onClick={() => sendReply(t.id)} disabled={!replyDrafts[t.id]?.trim()}>
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicalSupportInbox;
