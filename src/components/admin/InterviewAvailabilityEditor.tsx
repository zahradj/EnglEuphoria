/**
 * InterviewAvailabilityEditor — admin UI for setting recurring weekly hours
 * when interview slots are open. Applicants pick from these via the
 * Calendly-style /interview/:token picker.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Rule {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  hub_type: string | null;
  active: boolean;
}

export default function InterviewAvailabilityEditor() {
  const { user } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({
    weekday: 1,
    start_time: '14:00',
    end_time: '18:00',
    slot_minutes: 25,
    hub_type: 'any',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('interview_availability_rules')
      .select('*')
      .order('weekday', { ascending: true });
    if (error) toast.error(error.message);
    setRules((data as Rule[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addRule = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from('interview_availability_rules').insert({
      admin_id: user.id,
      weekday: draft.weekday,
      start_time: draft.start_time,
      end_time: draft.end_time,
      slot_minutes: draft.slot_minutes,
      hub_type: draft.hub_type === 'any' ? null : draft.hub_type,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      active: true,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Availability added');
    load();
  };

  const removeRule = async (id: string) => {
    const { error } = await supabase.from('interview_availability_rules').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Removed');
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Availability</CardTitle>
        <CardDescription>
          Define the recurring weekly hours when you can run teacher interviews.
          Applicants will see only these slots in their booking link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add rule */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end p-4 rounded-lg border bg-muted/30">
          <div className="space-y-1.5">
            <Label className="text-xs">Day</Label>
            <Select value={String(draft.weekday)} onValueChange={(v) => setDraft({ ...draft, weekday: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input type="time" value={draft.start_time} onChange={(e) => setDraft({ ...draft, start_time: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input type="time" value={draft.end_time} onChange={(e) => setDraft({ ...draft, end_time: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Slot length (min)</Label>
            <Input type="number" min={25} max={25} step={25} value={25} disabled
              readOnly />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Hub</Label>
            <Select value={draft.hub_type} onValueChange={(v) => setDraft({ ...draft, hub_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any hub</SelectItem>
                <SelectItem value="playground">Playground</SelectItem>
                <SelectItem value="academy">Academy</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addRule} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </div>

        {/* Existing rules */}
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No weekly hours yet — add at least one block so applicants can book.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-md border">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary">{WEEKDAYS[r.weekday]}</Badge>
                  <span className="font-mono text-sm">{r.start_time.slice(0,5)} – {r.end_time.slice(0,5)}</span>
                  <span className="text-xs text-muted-foreground">{r.slot_minutes} min slots</span>
                  {r.hub_type && <Badge variant="outline" className="capitalize">{r.hub_type}</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeRule(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
