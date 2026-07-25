/**
 * InterviewSlotPicker — Calendly-style booking surface for interview applicants.
 *
 * Renders an admin-defined list of open slots fetched from the
 * `interview-availability-list` edge function and writes the choice back via
 * `interview-book-slot`. Fully public — the room_token is the credential.
 */
import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';

const SUPABASE_URL = supabaseUrl;
const SUPABASE_ANON_KEY = supabaseAnonKey;

interface Slot { starts_at: string; ends_at: string }
interface InterviewLite {
  id: string;
  hub_type: string | null;
  teacher_name: string | null;
  duration_minutes: number | null;
}

interface Props {
  token: string;
  interview: InterviewLite;
  onBooked: (scheduledAt: string, bookedInterview?: Partial<InterviewLite>) => void;
}

async function fetchSlots(token: string, hubType: string | null): Promise<{ slots: Slot[]; duration_minutes: number }> {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/interview-availability-list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ token, hub_type: hubType }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error ?? 'Failed to load slots');
  return { slots: data.slots ?? [], duration_minutes: data.duration_minutes ?? 25 };
}

async function bookSlot(token: string, startsAt: string, hubType: string | null) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/interview-book-slot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ token, starts_at: startsAt, hub_type: hubType }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error ?? 'Booking failed');
  return data;
}

export default function InterviewSlotPicker({ token, interview, onBooked }: Props) {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { slots } = await fetchSlots(token, interview.hub_type);
        setSlots(slots);
        if (slots.length > 0) setSelectedDay(startOfDay(parseISO(slots[0].starts_at)));
      } catch (e: any) {
        toast.error(e?.message ?? 'Could not load times');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, interview.hub_type]);

  const dayGroups = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = format(parseISO(s.starts_at), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).map(([key, list]) => ({
      day: parseISO(key + 'T00:00:00'),
      slots: list,
    }));
  }, [slots]);

  const todaysSlots = selectedDay
    ? slots.filter((s) => isSameDay(parseISO(s.starts_at), selectedDay))
    : [];

  const handlePick = async (slot: Slot) => {
    try {
      setSubmitting(slot.starts_at);
      const data = await bookSlot(token, slot.starts_at, interview.hub_type);
      toast.success('Your interview is booked!');
      onBooked(slot.starts_at, data?.interview);
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg === 'already_booked') {
        toast.info('This interview is already scheduled — opening your room.');
        onBooked(new Date().toISOString());
        return;
      }
      if (msg === 'slot_taken') {
        toast.error('Someone just took that slot — please pick another.');
      } else if (msg === 'slot_too_soon') {
        toast.error('That time is too soon — please pick a slot at least 15 minutes ahead.');
      } else if (msg === 'booking_expired') {
        toast.error('This booking link has expired. Contact the recruiting team.');
      } else if (msg === 'invalid_token') {
        toast.error('This booking link is invalid. Contact the recruiting team.');
      } else if (msg === 'interview_cancelled') {
        toast.error('This interview was cancelled.');
      } else {
        toast.error(msg ? `Failed to book a slot (${msg}).` : 'Could not book that slot. Please try another.');
      }
      // Refresh — someone else may have just taken it.
      const { slots } = await fetchSlots(token, interview.hub_type);
      setSlots(slots);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading available times…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <Badge variant="outline" className="mx-auto">Teacher Interview</Badge>
          <h1 className="text-3xl font-bold">
            Pick a time for your demo lesson{interview.teacher_name ? `, ${interview.teacher_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {interview.duration_minutes ?? 25}-minute session ·
            All times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </p>
        </header>

        {slots.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No open interview slots right now — the team will email you new
              times shortly.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
            {/* Day picker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Available days
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
                {dayGroups.map(({ day, slots }) => {
                  const active = selectedDay && isSameDay(day, selectedDay);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="font-medium">{format(day, 'EEE, MMM d')}</div>
                      <div className={`text-xs ${active ? 'opacity-80' : 'text-muted-foreground'}`}>
                        {slots.length} slot{slots.length === 1 ? '' : 's'}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Time picker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : 'Pick a day'}
                </CardTitle>
                <CardDescription>
                  Tap a time to confirm. You can re-open this link anytime to
                  enter the room and prepare your demo lesson.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {todaysSlots.map((s) => {
                    const isSubmitting = submitting === s.starts_at;
                    return (
                      <Button
                        key={s.starts_at}
                        variant="outline"
                        disabled={!!submitting}
                        onClick={() => handlePick(s)}
                        className="justify-center"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          format(parseISO(s.starts_at), 'h:mm a')
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> No login needed — this link is your private key.
        </p>
      </div>
    </div>
  );
}
