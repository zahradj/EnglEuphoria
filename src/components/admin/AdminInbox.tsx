import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Mail, RefreshCw, Trash2, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ContactInquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  status: string;
  user_id: string | null;
}

const STATUS_OPTIONS = ['new', 'in_progress', 'resolved'] as const;

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
};

export const AdminInbox: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | typeof STATUS_OPTIONS[number]>('all');

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch inquiries:', error);
      toast.error('Failed to load inquiries');
    } else {
      setInquiries((data ?? []) as ContactInquiry[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const previous = inquiries;
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error(error);
      toast.error('Could not update status');
      setInquiries(previous);
    } else {
      toast.success(`Marked as ${status.replace('_', ' ')}`);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry permanently?')) return;
    const previous = inquiries;
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
    if (error) {
      console.error(error);
      toast.error('Could not delete inquiry');
      setInquiries(previous);
    } else {
      toast.success('Inquiry deleted');
    }
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);
  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            Contact Inbox
            {newCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {newCount} new
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Messages submitted from the homepage contact form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({inquiries.length})</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchInquiries} disabled={loading}>
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
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No messages {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => (
            <Card key={inq.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      <span className="truncate">{inq.name}</span>
                      <Badge variant={statusVariant[inq.status] ?? 'default'}>
                        {inq.status.replace('_', ' ')}
                      </Badge>
                      {inq.user_id && (
                        <Badge variant="outline" className="text-[10px]">
                          Logged-in user
                        </Badge>
                      )}
                    </CardTitle>
                    <a
                      href={`mailto:${inq.email}`}
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {inq.email}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(inq.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={inq.status}
                      onValueChange={(v) => updateStatus(inq.id, v)}
                    >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteInquiry(inq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap text-foreground/90 bg-muted/40 rounded-md p-3 border border-border/50">
                  {inq.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInbox;
