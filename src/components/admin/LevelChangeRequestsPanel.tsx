import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LevelChangeRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  current_level: string | null;
  requested_level: string;
  reason: string | null;
  created_at: string;
  hub: string | null;
  requested_start_unit: number | null;
  unit_marks: Record<string, string> | null;
  student_name: string;
  teacher_name: string;
}

interface LevelChangeRequestsPanelProps {
  /** Called after a request is approved, so the students table (which shows
   *  cefr_level) can refetch and reflect the change. */
  onResolved: () => void;
}

export const LevelChangeRequestsPanel: React.FC<LevelChangeRequestsPanelProps> = ({ onResolved }) => {
  const [requests, setRequests] = useState<LevelChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: pending, error } = await (supabase as any)
        .from('level_change_requests')
        .select('id, student_id, teacher_id, current_level, requested_level, reason, created_at, hub, requested_start_unit, unit_marks')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;

      const ids = Array.from(new Set(((pending || []) as any[]).flatMap(r => [r.student_id, r.teacher_id])));
      const { data: users } = ids.length
        ? await supabase.from('users').select('id, full_name, email').in('id', ids)
        : { data: [] };
      const nameById = new Map((users || []).map((u: any) => [u.id, u.full_name || u.email || 'Unknown']));

      setRequests(
        (pending || []).map((r: any) => ({
          ...r,
          student_name: nameById.get(r.student_id) ?? 'Unknown student',
          teacher_name: nameById.get(r.teacher_id) ?? 'Unknown teacher',
        }))
      );
    } catch (err) {
      console.error('Failed to load level change requests:', err);
      toast.error('Could not load level change requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const resolve = async (request: LevelChangeRequest, decision: 'approved' | 'rejected') => {
    setBusyId(request.id);
    try {
      // Approval applies the change everywhere: placement (dashboard level),
      // profile, prior-knowledge marks and the learning path (start unit).
      const { error } = await (supabase as any).rpc('review_level_change', {
        p_request: request.id,
        p_approve: decision === 'approved',
        p_note: notes[request.id] || null,
      });
      if (error) throw error;

      setRequests(prev => prev.filter(r => r.id !== request.id));
      toast.success(decision === 'approved' ? `Level updated to ${request.requested_level}` : 'Request rejected');
      if (decision === 'approved') onResolved();
    } catch (err) {
      console.error(`Failed to ${decision} level change request:`, err);
      toast.error('Could not update this request');
    } finally {
      setBusyId(null);
    }
  };

  if (!loading && requests.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Level Change Requests
          {requests.length > 0 && <Badge variant="secondary">{requests.length} pending</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <Loader2 className="h-5 w-5 animate-spin mx-auto my-4" />}
        {!loading && requests.map(request => (
          <div key={request.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-sm">
                <span className="font-medium">{request.student_name}</span>
                <span className="text-muted-foreground"> — requested by {request.teacher_name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Badge variant="outline">{request.current_level || 'unset'}</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge>{request.requested_level}{request.requested_start_unit ? ` · Unit ${request.requested_start_unit}` : ''}</Badge>
              </div>
            </div>
            {request.reason && (
              <p className="text-sm text-muted-foreground">{request.reason}</p>
            )}
            {(() => {
              const known = Object.entries(request.unit_marks ?? {})
                .filter(([, m]) => m === 'known').map(([u]) => Number(u)).sort((a, b) => a - b);
              const partly = Object.entries(request.unit_marks ?? {})
                .filter(([, m]) => m === 'partly').map(([u]) => Number(u)).sort((a, b) => a - b);
              return (
                <p className="text-xs text-muted-foreground">
                  {request.hub ? `${request.hub} · ` : ''}
                  Starts at Unit {request.requested_start_unit ?? 1}
                  {known.length ? ` · knows Units ${known.join(', ')}` : ''}
                  {partly.length ? ` · partly ${partly.join(', ')}` : ''}
                </p>
              );
            })()}
            <Textarea
              placeholder="Optional note (visible in history)"
              value={notes[request.id] || ''}
              onChange={(e) => setNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
              className="h-16 text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === request.id}
                onClick={() => resolve(request, 'rejected')}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                disabled={busyId === request.id}
                onClick={() => resolve(request, 'approved')}
              >
                {busyId === request.id ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1" />
                )}
                Approve
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
