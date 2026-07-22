import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trash2, Megaphone, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';

type AudienceFilter = {
  hub?: string;
  role?: string;
  min_lessons?: number;
};

type Broadcast = {
  id: string;
  subject: string;
  preview_text: string | null;
  from_name: string | null;
  body_html: string;
  channel: string;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  recipients_count: number;
  opens_count: number;
  clicks_count: number;
  audience_filter: AudienceFilter | null;
};

const CHANNELS = ['email', 'in_app', 'push'];
const STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'];
const HUBS = ['all', 'playground', 'academy', 'success'];
const ROLES = ['all', 'student', 'teacher', 'parent'];

const emptyForm = {
  subject: '',
  from_name: 'Engleuphoria',
  preview_text: '',
  body_html: '',
  channel: 'email',
  status: 'draft',
  scheduled_for: '',
  hub: 'all',
  role: 'student',
  min_lessons: '0',
};

export const BroadcastsTab = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRow, setPreviewRow] = useState<Broadcast | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marketing_broadcasts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Broadcast[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.subject || !form.body_html) { toast.error('Subject and body required'); return; }
    const { error } = await supabase.from('marketing_broadcasts').insert({
      subject: form.subject,
      from_name: form.from_name || null,
      preview_text: form.preview_text || null,
      body_html: form.body_html,
      channel: form.channel,
      status: form.scheduled_for ? 'scheduled' : form.status,
      scheduled_for: form.scheduled_for || null,
      audience_filter: {
        hub: form.hub,
        role: form.role,
        min_lessons: Number(form.min_lessons) || 0,
      },
      created_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Broadcast saved');
    setOpen(false);
    setForm(emptyForm);
    load();
  };

  const sendNow = async (id: string) => {
    setSendingId(id);
    const { data, error } = await supabase.functions.invoke('send-marketing-broadcast', {
      body: { broadcast_id: id },
    });
    setSendingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`Sent to ${data?.recipients ?? 0} recipients`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this broadcast?')) return;
    const { error } = await supabase.from('marketing_broadcasts').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  const rate = (num: number, den: number) => den ? `${((num / den) * 100).toFixed(1)}%` : '—';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Broadcasts</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Compose, target, preview and send email/in-app/push announcements.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New broadcast</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Compose broadcast</DialogTitle></DialogHeader>
            <Tabs defaultValue="content">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>From name</Label><Input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} /></div>
                  <div>
                    <Label>Channel</Label>
                    <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CHANNELS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div><Label>Preview text</Label><Input value={form.preview_text} onChange={(e) => setForm({ ...form, preview_text: e.target.value })} placeholder="Shown next to the subject in the inbox" /></div>
                <div><Label>Body (HTML)</Label><Textarea rows={10} value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })} placeholder="<h1>Hello…</h1>" /></div>
                <div><Label>Schedule (optional)</Label><Input type="datetime-local" value={form.scheduled_for} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} /></div>
              </TabsContent>

              <TabsContent value="audience" className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Hub</Label>
                    <Select value={form.hub} onValueChange={(v) => setForm({ ...form, hub: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{HUBS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Minimum lessons completed</Label><Input type="number" value={form.min_lessons} onChange={(e) => setForm({ ...form, min_lessons: e.target.value })} /></div>
                <p className="text-xs text-muted-foreground">Audience is resolved server-side when the broadcast is sent.</p>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="rounded-lg border bg-background">
                  <div className="border-b p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">From: {form.from_name || '(no from name)'}</p>
                    <p className="font-semibold">{form.subject || '(no subject)'}</p>
                    {form.preview_text && <p className="text-xs text-muted-foreground">{form.preview_text}</p>}
                  </div>
                  <div className="p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: form.body_html || '<p class="text-muted-foreground">Body preview…</p>' }} />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter><Button onClick={create}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No broadcasts yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Open rate</TableHead>
                <TableHead className="text-right">Click rate</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const af = r.audience_filter ?? {};
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-xs truncate">{r.subject}</TableCell>
                    <TableCell><Badge variant="secondary">{r.channel}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{af.role ?? 'all'} · {af.hub ?? 'all'}</TableCell>
                    <TableCell><Badge variant={r.status === 'sent' ? 'default' : 'outline'}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">{r.recipients_count}</TableCell>
                    <TableCell className="text-right">{rate(r.opens_count, r.recipients_count)}</TableCell>
                    <TableCell className="text-right">{rate(r.clicks_count, r.recipients_count)}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button variant="ghost" size="icon" title="Preview" onClick={() => { setPreviewRow(r); setPreviewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                      {r.status !== 'sent' && (
                        <Button variant="ghost" size="icon" title="Send now" disabled={sendingId === r.id} onClick={() => sendNow(r.id)}><Send className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{previewRow?.subject}</DialogTitle></DialogHeader>
            {previewRow && (
              <div className="rounded-lg border">
                <div className="border-b p-3 text-xs text-muted-foreground">From: {previewRow.from_name ?? 'Engleuphoria'}</div>
                <div className="p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewRow.body_html }} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
