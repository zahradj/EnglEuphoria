import { useEffect, useMemo, useState } from 'react';
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
import { Plus, Trash2, Share2, ExternalLink, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLATFORMS = ['instagram', 'tiktok', 'x', 'facebook', 'linkedin', 'youtube', 'threads', 'pinterest'];
const POST_STATUSES = ['draft', 'scheduled', 'posted', 'failed', 'archived'];

const PLATFORM_LIMITS: Record<string, number> = {
  x: 280, threads: 500, instagram: 2200, tiktok: 2200, facebook: 63206,
  linkedin: 3000, youtube: 5000, pinterest: 500,
};

const PLATFORM_COLOR: Record<string, string> = {
  instagram: 'bg-pink-500', tiktok: 'bg-black', x: 'bg-slate-700', facebook: 'bg-blue-600',
  linkedin: 'bg-sky-700', youtube: 'bg-red-600', threads: 'bg-neutral-800', pinterest: 'bg-rose-600',
};

type Account = {
  id: string; platform: string; handle: string; profile_url: string | null;
  follower_count: number; is_active: boolean;
};
type Post = {
  id: string; platform: string; content: string; status: string;
  scheduled_for: string | null; posted_at: string | null;
  external_url: string | null; likes_count: number; comments_count: number;
  shares_count: number; impressions_count: number;
};

export const SocialMediaTab = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [acctOpen, setAcctOpen] = useState(false);
  const [acctForm, setAcctForm] = useState({ platform: 'instagram', handle: '', profile_url: '', follower_count: '0' });

  const [postOpen, setPostOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    platforms: ['instagram'] as string[],
    content: '',
    scheduled_for: '',
    external_url: '',
  });

  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [a, p] = await Promise.all([
      supabase.from('marketing_social_accounts').select('*').order('platform'),
      supabase.from('marketing_social_posts').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    if (a.error) toast.error(a.error.message);
    if (p.error) toast.error(p.error.message);
    setAccounts((a.data as Account[]) ?? []);
    setPosts((p.data as Post[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createAcct = async () => {
    if (!acctForm.handle) { toast.error('Handle required'); return; }
    const { error } = await supabase.from('marketing_social_accounts').insert({
      platform: acctForm.platform,
      handle: acctForm.handle,
      profile_url: acctForm.profile_url || null,
      follower_count: Number(acctForm.follower_count) || 0,
      created_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Account added'); setAcctOpen(false);
    setAcctForm({ platform: 'instagram', handle: '', profile_url: '', follower_count: '0' });
    load();
  };

  const togglePlatform = (p: string) => {
    setPostForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  };

  const createPost = async () => {
    if (!postForm.content) { toast.error('Content required'); return; }
    if (postForm.platforms.length === 0) { toast.error('Pick at least one platform'); return; }
    const status = postForm.scheduled_for ? 'scheduled' : 'draft';
    const rows = postForm.platforms.map(platform => ({
      platform,
      content: postForm.content,
      status,
      scheduled_for: postForm.scheduled_for || null,
      external_url: postForm.external_url || null,
      created_by: user?.id,
    }));
    const { error } = await supabase.from('marketing_social_posts').insert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success(`Queued ${rows.length} post${rows.length > 1 ? 's' : ''}`);
    setPostOpen(false);
    setPostForm({ platforms: ['instagram'], content: '', scheduled_for: '', external_url: '' });
    load();
  };

  const publishNow = async (id: string) => {
    setSendingId(id);
    const { error } = await supabase.functions.invoke('publish-social-post', { body: { post_id: id } });
    setSendingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success('Post marked as published');
    load();
  };

  const removeAcct = async (id: string) => {
    if (!confirm('Delete this account?')) return;
    const { error } = await supabase.from('marketing_social_accounts').delete().eq('id', id);
    if (error) toast.error(error.message); else load();
  };
  const removePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('marketing_social_posts').delete().eq('id', id);
    if (error) toast.error(error.message); else load();
  };

  // Calendar cells
  const calendar = useMemo(() => {
    const first = new Date(cursor);
    const startWeekday = first.getDay(); // 0=Sun
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: Array<{ date: Date | null; posts: Post[] }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, posts: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      const dayPosts = posts.filter(p => {
        const t = p.scheduled_for ?? p.posted_at;
        if (!t) return false;
        const dt = new Date(t);
        return dt.getFullYear() === day.getFullYear() && dt.getMonth() === day.getMonth() && dt.getDate() === day.getDate();
      });
      cells.push({ date: day, posts: dayPosts });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, posts: [] });
    return cells;
  }, [cursor, posts]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const shiftMonth = (d: number) => {
    const c = new Date(cursor); c.setMonth(c.getMonth() + d); setCursor(c);
  };

  const engagement = useMemo(() => posts.reduce((a, p) => ({
    likes: a.likes + p.likes_count, comments: a.comments + p.comments_count,
    shares: a.shares + p.shares_count, impressions: a.impressions + p.impressions_count,
  }), { likes: 0, comments: 0, shares: 0, impressions: 0 }), [posts]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Connected accounts</p><p className="text-2xl font-semibold">{accounts.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total followers</p><p className="text-2xl font-semibold">{accounts.reduce((s, a) => s + a.follower_count, 0).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Impressions</p><p className="text-2xl font-semibold">{engagement.impressions.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Engagement</p><p className="text-2xl font-semibold">{(engagement.likes + engagement.comments + engagement.shares).toLocaleString()}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        {/* CALENDAR */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                <CardTitle className="min-w-[180px] text-center">{monthLabel}</CardTitle>
                <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <Dialog open={postOpen} onOpenChange={setPostOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Cross-post</Button></DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Compose cross-platform post</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Platforms</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {PLATFORMS.map(p => (
                          <button
                            key={p} type="button"
                            onClick={() => togglePlatform(p)}
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium border transition',
                              postForm.platforms.includes(p)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:bg-muted',
                            )}
                          >{p}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea rows={6} value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {postForm.platforms.map(p => {
                          const limit = PLATFORM_LIMITS[p] ?? 5000;
                          const over = postForm.content.length > limit;
                          return (
                            <span key={p} className={cn('font-mono', over && 'text-destructive font-semibold')}>
                              {p}: {postForm.content.length}/{limit}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Schedule</Label><Input type="datetime-local" value={postForm.scheduled_for} onChange={(e) => setPostForm({ ...postForm, scheduled_for: e.target.value })} /></div>
                      <div><Label>External URL</Label><Input value={postForm.external_url} onChange={(e) => setPostForm({ ...postForm, external_url: e.target.value })} placeholder="https://…" /></div>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={createPost}>Save {postForm.platforms.length > 1 ? `(${postForm.platforms.length} posts)` : ''}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground mb-1">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="px-2 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendar.map((c, i) => (
                  <div key={i} className={cn(
                    'min-h-[92px] rounded-md border p-1.5 text-xs',
                    c.date ? 'bg-background' : 'bg-muted/30 border-dashed',
                  )}>
                    {c.date && (
                      <>
                        <div className="text-muted-foreground mb-1">{c.date.getDate()}</div>
                        <div className="flex flex-col gap-1">
                          {c.posts.slice(0, 3).map(p => (
                            <div key={p.id} className="flex items-center gap-1 truncate">
                              <span className={cn('h-2 w-2 rounded-full shrink-0', PLATFORM_COLOR[p.platform] ?? 'bg-muted-foreground')} />
                              <span className="truncate">{p.content.slice(0, 24)}</span>
                            </div>
                          ))}
                          {c.posts.length > 3 && <div className="text-muted-foreground">+{c.posts.length - 3} more</div>}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POSTS */}
        <TabsContent value="posts" className="mt-4">
          <Card>
            <CardHeader><CardTitle>All posts</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-muted-foreground">Loading…</p> : posts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No posts yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn('h-2 w-2 rounded-full', PLATFORM_COLOR[p.platform] ?? 'bg-muted-foreground')} />
                            <Badge variant="secondary">{p.platform}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{p.content}</TableCell>
                        <TableCell><Badge variant={p.status === 'posted' ? 'default' : 'outline'}>{p.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.scheduled_for ? new Date(p.scheduled_for).toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          ♥ {p.likes_count} · 💬 {p.comments_count} · ↗ {p.shares_count}
                        </TableCell>
                        <TableCell className="flex gap-1">
                          {p.status !== 'posted' && (
                            <Button variant="ghost" size="icon" title="Publish now" disabled={sendingId === p.id} onClick={() => publishNow(p.id)}><Send className="h-4 w-4" /></Button>
                          )}
                          {p.external_url && <a href={p.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex"><Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button></a>}
                          <Button variant="ghost" size="icon" onClick={() => removePost(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNTS */}
        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Connected accounts</CardTitle>
              <Dialog open={acctOpen} onOpenChange={setAcctOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add account</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add social account</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Platform</Label>
                      <Select value={acctForm.platform} onValueChange={(v) => setAcctForm({ ...acctForm, platform: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Handle</Label><Input value={acctForm.handle} onChange={(e) => setAcctForm({ ...acctForm, handle: e.target.value })} placeholder="@engleuphoria" /></div>
                    <div><Label>Profile URL</Label><Input value={acctForm.profile_url} onChange={(e) => setAcctForm({ ...acctForm, profile_url: e.target.value })} placeholder="https://…" /></div>
                    <div><Label>Follower count</Label><Input type="number" value={acctForm.follower_count} onChange={(e) => setAcctForm({ ...acctForm, follower_count: e.target.value })} /></div>
                  </div>
                  <DialogFooter><Button onClick={createAcct}>Add</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-muted-foreground">Loading…</p> : accounts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No accounts connected.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Platform</TableHead><TableHead>Handle</TableHead><TableHead>Followers</TableHead><TableHead></TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map(a => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn('h-2 w-2 rounded-full', PLATFORM_COLOR[a.platform] ?? 'bg-muted-foreground')} />
                            <Badge variant="secondary">{a.platform}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {a.profile_url ? (
                            <a href={a.profile_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                              {a.handle} <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : a.handle}
                        </TableCell>
                        <TableCell>{a.follower_count.toLocaleString()}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeAcct(a.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
