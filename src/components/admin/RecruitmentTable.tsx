/**
 * RecruitmentTable — Cycle 4 Admin Recruitment Dashboard.
 *
 * Lists every teacher application with a derived 4-stage status:
 *   • pending   — application_id has no interview row and status is pending/under_review
 *   • invited   — application status='invited' (booking email sent, no slot yet)
 *   • scheduled — interview.scheduled_at IS NOT NULL
 *   • reviewed  — application status='accepted'/'rejected' OR interview.status='completed'
 *
 * For "pending" rows, exposes an [Invite to Interview] button that calls
 * `recruitment-invite-applicant` (creates the magic-link interview row,
 * flips status to 'invited', emails the booking link).
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Loader2, Send, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Stage = 'pending' | 'invited' | 'scheduled' | 'reviewed';

interface AppRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  hub_preference: string | null;
  status: string;
  created_at: string;
  iv_status: string | null;
  iv_scheduled_at: string | null;
  iv_room_token: string | null;
  grammar_test_status: string | null;
  grammar_score: number | null;
  interview_invite_token: string | null;
}

const stageColor: Record<Stage, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  invited: 'bg-sky-100 text-sky-800 border-sky-300',
  scheduled: 'bg-violet-100 text-violet-800 border-violet-300',
  reviewed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

function deriveStage(r: AppRow): Stage {
  if (r.status === 'accepted' || r.status === 'rejected') return 'reviewed';
  if (r.iv_status === 'completed' || r.iv_status === 'passed' || r.iv_status === 'failed') return 'reviewed';
  if (r.iv_scheduled_at) return 'scheduled';
  if (r.status === 'invited') return 'invited';
  return 'pending';
}

export function RecruitmentTable() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');

  async function load() {
    setLoading(true);
    const { data: apps, error } = await supabase
      .from('teacher_applications')
      .select('id, email, first_name, last_name, hub_preference, status, created_at, grammar_test_status, grammar_score, interview_invite_token')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load applications');
      setLoading(false);
      return;
    }
    const ids = (apps ?? []).map((a) => a.id);
    let interviews: Record<string, { status: string; scheduled_at: string | null; room_token: string }> = {};
    if (ids.length > 0) {
      const { data: ivs } = await supabase
        .from('interviews')
        .select('application_id, status, scheduled_at, room_token, created_at')
        .in('application_id', ids)
        .order('created_at', { ascending: false });
      for (const iv of ivs ?? []) {
        // Keep the most recent per application (already sorted desc).
        if (!interviews[iv.application_id]) {
          interviews[iv.application_id] = {
            status: iv.status,
            scheduled_at: iv.scheduled_at,
            room_token: iv.room_token,
          };
        }
      }
    }
    const merged: AppRow[] = (apps ?? []).map((a: any) => {
      const iv = interviews[a.id];
      return {
        ...a,
        iv_status: iv?.status ?? null,
        iv_scheduled_at: iv?.scheduled_at ?? null,
        iv_room_token: iv?.room_token ?? null,
        grammar_test_status: a.grammar_test_status ?? null,
        grammar_score: a.grammar_score ?? null,
        interview_invite_token: a.interview_invite_token ?? null,
      };
    });
    setRows(merged);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function invite(row: AppRow) {
    setInvitingId(row.id);
    try {
      const { data, error } = await supabase.functions.invoke('recruitment-invite-applicant', {
        body: { applicationId: row.id },
      });
      if (error) throw error;
      toast.success(`Booking link emailed to ${row.email}`);
      await load();
      if ((data as any)?.bookingLink) {
        navigator.clipboard?.writeText((data as any).bookingLink).catch(() => {});
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to send invite');
    } finally {
      setInvitingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const st = deriveStage(r);
      if (stageFilter !== 'all' && st !== stageFilter) return false;
      if (!q) return true;
      const name = `${r.first_name ?? ''} ${r.last_name ?? ''}`.toLowerCase();
      return name.includes(q) || r.email.toLowerCase().includes(q);
    });
  }, [rows, query, stageFilter]);

  const counts = useMemo(() => {
    const c: Record<Stage, number> = { pending: 0, invited: 0, scheduled: 0, reviewed: 0 };
    for (const r of rows) c[deriveStage(r)] += 1;
    return c;
  }, [rows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruitment Pipeline</CardTitle>
        <CardDescription>
          Review applicants, send self-serve interview booking links, and track stage.
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-3">
          {(['all', 'pending', 'invited', 'scheduled', 'reviewed'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={stageFilter === s ? 'default' : 'outline'}
              onClick={() => setStageFilter(s)}
              className="capitalize"
            >
              {s}
              {s !== 'all' && <span className="ml-2 text-xs opacity-70">{counts[s]}</span>}
            </Button>
          ))}
          <div className="ml-auto relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email…"
              className="pl-8 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No applications match.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hub</TableHead>
                  <TableHead>Grammar</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Interview Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const stage = deriveStage(r);
                  const name = `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—';
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                      <TableCell className="capitalize">{r.hub_preference ?? '—'}</TableCell>
                      <TableCell>
                        {r.grammar_test_status === 'passed' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300" variant="outline">
                            ✓ {r.grammar_score ?? 0}%
                          </Badge>
                        ) : r.grammar_test_status === 'failed' ? (
                          <Badge className="bg-rose-100 text-rose-800 border-rose-300" variant="outline">
                            ✗ {r.grammar_score ?? 0}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">not taken</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.iv_scheduled_at
                          ? format(new Date(r.iv_scheduled_at), 'MMM d, HH:mm')
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${stageColor[stage]} capitalize`}>{stage}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {r.grammar_test_status === 'passed' && !r.iv_scheduled_at && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={async () => {
                              const token = r.interview_invite_token ?? crypto.randomUUID();
                              if (!r.interview_invite_token) {
                                await supabase
                                  .from('teacher_applications')
                                  .update({
                                    interview_invite_token: token,
                                    interview_invite_sent_at: new Date().toISOString(),
                                  })
                                  .eq('id', r.id);
                              }
                              const link = `${window.location.origin}/teacher/interview/schedule/${token}`;
                              await navigator.clipboard.writeText(link);
                              toast.success('Hub-choice scheduling link copied');
                              await load();
                            }}
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Send Hub Link
                          </Button>
                        )}
                        {stage === 'pending' && r.grammar_test_status !== 'passed' && (
                          <Button
                            size="sm"
                            onClick={() => invite(r)}
                            disabled={invitingId === r.id}
                          >
                            {invitingId === r.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              : <Send className="h-3.5 w-3.5 mr-1" />}
                            Invite to Interview
                          </Button>
                        )}
                        {stage === 'invited' && r.iv_room_token && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = `${window.location.origin}/interview/${r.iv_room_token}`;
                              navigator.clipboard.writeText(link);
                              toast.success('Booking link copied');
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Copy Link
                          </Button>
                        )}
                        {stage === 'invited' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => invite(r)}
                            disabled={invitingId === r.id}
                          >
                            Resend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecruitmentTable;
