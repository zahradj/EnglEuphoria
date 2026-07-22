import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Loader2, CheckCircle, Sparkles, Link2, AlertTriangle, CreditCard, Repeat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StudentBookingCalendar } from './StudentBookingCalendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePackageValidation } from '@/hooks/usePackageValidation';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '@/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { mergeAdjacentSlots, MergedSlot } from '@/utils/slotMerger';

interface TimeSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  isAvailable: boolean;
}

type HubType = 'playground' | 'academy' | 'professional';

interface BookMyClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentClass?: string;
  studentLevel?: HubType;
  /** When set, show only this specific teacher's slots (from FindTeacher card). */
  teacherId?: string | null;
}

const HUB_CONFIG = {
  playground: {
    label: 'Playground',
    duration: 30,
    icon: '🌈',
    headerBg: 'from-amber-400 via-orange-400 to-red-400',
    description: 'Quick 30-minute fun sessions — half price!',
    bookLabel: 'Book a Class',
  },
  academy: {
    label: 'Academy Hub',
    duration: 60,
    icon: '📘',
    headerBg: 'from-indigo-800 via-blue-800 to-purple-800',
    description: 'Deep 60-minute learning sessions',
    bookLabel: 'Book a Slot',
  },
  professional: {
    label: 'Success Hub',
    duration: 60,
    icon: '🎯',
    headerBg: 'from-emerald-700 via-green-700 to-teal-600',
    description: 'Professional 60-minute coaching',
    bookLabel: 'Schedule a Session',
  },
};

export const BookMyClassModal: React.FC<BookMyClassModalProps> = ({
  isOpen,
  onClose,
  accentClass,
  studentLevel = 'academy',
  teacherId,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { totalCredits, trialAvailable, loading: creditsLoading } = usePackageValidation(user?.id || null);
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

  // Lock hub to the student's level — no switching allowed
  const selectedHub: HubType = studentLevel;
  const [rawSlots, setRawSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState<4 | 8 | 12>(4);
  const [recurringSummary, setRecurringSummary] = useState<{ booked: number; skipped: number } | null>(null);

  const hasCredits = totalCredits > 0 || trialAvailable;
  const config = HUB_CONFIG[selectedHub];
  const slotDuration = config.duration;

  // Compute display slots based on hub selection
  const displaySlots: (TimeSlot & { sourceSlotIds?: string[] })[] = useMemo(() => {
    // Strict per-hub duration: Playground = 30, Academy/Success = 60
    const filtered = rawSlots.filter(s => s.duration === slotDuration);
    return filtered.map(s => ({ ...s, sourceSlotIds: [s.id] }));
  }, [rawSlots, slotDuration]);

  // Allowed teacher hub_roles for this student's hub
  const allowedHubRoles = useMemo<string[]>(() => {
    if (selectedHub === 'playground') return ['playground_specialist'];
    if (selectedHub === 'academy') return ['academy_mentor', 'academy_success_mentor'];
    return ['success_mentor', 'academy_success_mentor']; // professional
  }, [selectedHub]);

  // Fetch available slots — only for teachers in the student's hub, matching duration
  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      // Always compare in UTC to avoid local timezone offsets hiding valid slots
      const nowUtcIso = new Date().toISOString();

      // 1. Find teachers in this hub
      const { data: hubTeachers, error: hubError } = await supabase
        .from('teacher_profiles')
        .select('user_id, hub_role')
        .in('hub_role', allowedHubRoles);

      console.log('[BookMyClassModal] hub:', selectedHub, 'allowedHubRoles:', allowedHubRoles);
      console.log('[BookMyClassModal] hubTeachers:', hubTeachers, 'hub error:', hubError);

      const teacherIds = (hubTeachers || []).map((t: any) => t.user_id).filter(Boolean);
      console.log('[BookMyClassModal] teacherIds:', teacherIds);

      let query = supabase
        .from('teacher_availability')
        .select('id, teacher_id, start_time, end_time, duration, is_available, is_booked, hub_specialty')
        .eq('duration', slotDuration)
        .eq('is_available', true)
        .eq('is_booked', false)
        .gte('start_time', nowUtcIso)
        .order('start_time', { ascending: true })
        .limit(120);

      // Strict hub filter — never silently fall back to all teachers,
      // so a Playground student can never see Academy/Success teachers.
      if (teacherId) {
        // Single-teacher mode (booking from a specific teacher card)
        query = query.eq('teacher_id', teacherId);
      } else if (teacherIds.length > 0) {
        query = query.in('teacher_id', teacherIds);
      } else {
        console.warn('[BookMyClassModal] No teachers in hub', selectedHub, '— returning empty result.');
        setRawSlots([]);
        setLoadingSlots(false);
        return;
      }

      const { data, error } = await query;

      console.log('[BookMyClassModal] Fetched slots:', data, 'Fetch error:', error);

      if (error) throw error;

      if (data) {
        const usedTeacherIds = [...new Set(data.map(s => s.teacher_id))];
        const { data: teachers } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', usedTeacherIds);

        const teacherMap: Record<string, string> = {};
        teachers?.forEach(t => { teacherMap[t.id] = t.full_name || 'Teacher'; });

        const mapped: TimeSlot[] = data.map(s => ({
          id: s.id,
          teacherId: s.teacher_id,
          teacherName: teacherMap[s.teacher_id] || 'Teacher',
          startTime: new Date(s.start_time),
          endTime: new Date(s.end_time),
          duration: s.duration || slotDuration,
          isAvailable: s.is_available && !s.is_booked,
        }));

        setRawSlots(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch availability slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [allowedHubRoles, slotDuration, teacherId, selectedHub]);

  useEffect(() => {
    if (isOpen) {
      setBooked(false);
      setMeetingLink(null);
      fetchSlots();
    }
  }, [isOpen, fetchSlots]);

  useEffect(() => {
    const handleChange = () => fetchSlots();
    window.addEventListener('availability-changed', handleChange);
    return () => window.removeEventListener('availability-changed', handleChange);
  }, [fetchSlots]);

  const handleBookSlot = async (slot: TimeSlot & { sourceSlotIds?: string[] }) => {
    if (!user?.id || booking) return;

    // Validate payload before doing anything else
    const slotIds = (slot.sourceSlotIds && slot.sourceSlotIds.length > 0)
      ? slot.sourceSlotIds
      : (slot.id ? [slot.id] : []);

    if (slotIds.length === 0 || !slot.teacherId || !slot.startTime) {
      console.error('[BookMyClassModal] Invalid booking payload', { slot, userId: user.id });
      toast({
        title: 'Invalid booking',
        description: 'This slot is missing required information. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    const isTrial = trialAvailable;
    // Recurring bookings cannot use the free trial — each session needs a credit
    const useRecurring = repeatWeekly && !isTrial;
    const requiredCredits = useRecurring ? repeatWeeks : 1;

    // Trial bookings bypass the credit gate
    if (!isTrial && totalCredits < requiredCredits) {
      toast({
        title: 'Not enough credits',
        description: useRecurring
          ? `Weekly series needs ${requiredCredits} credits (you have ${totalCredits}). Add more credits or pick fewer weeks.`
          : 'You need credits to book this session. Redirecting to purchase...',
        variant: 'destructive',
      });
      setTimeout(() => {
        onClose();
        navigate('/student?tab=packages');
      }, 1800);
      return;
    }

    setBooking(true);

    const lessonTitle = isTrial
      ? `Trial Lesson with ${slot.teacherName}`
      : `${config.label} Lesson with ${slot.teacherName}`;
    const hubTypeMap: Record<string, string> = {
      playground: 'playground',
      academy: 'academy',
      professional: 'professional',
    };
    const hubType = hubTypeMap[selectedHub] || 'academy';

    // Helper: book a single occurrence via existing RPC
    const bookOnce = async (ids: string[], teacherId: string, startIso: string, trial: boolean) => {
      const payload = {
        p_slot_ids: ids,
        p_teacher_id: teacherId,
        p_scheduled_at: startIso,
        p_duration: slotDuration,
        p_hub_type: hubType,
        p_lesson_title: lessonTitle,
        p_is_trial: trial,
      };
      const { data, error } = await supabase.rpc('book_class_slot', payload);
      if (error) throw error;
      return (data || {}) as { booking_id?: string; classroom_id?: string; meeting_link?: string | null };
    };

    try {
      // 1) Always book the originally selected slot first
      const firstResult = await bookOnce(slotIds, slot.teacherId, slot.startTime.toISOString(), isTrial);
      const classroomLink = firstResult.classroom_id
        ? `/classroom/${firstResult.classroom_id}`
        : firstResult.meeting_link ?? null;
      setMeetingLink(classroomLink);

      let bookedCount = 1;
      let skippedCount = 0;

      // 2) For recurring: find + book the matching slot for each subsequent week
      if (useRecurring) {
        for (let week = 1; week < repeatWeeks; week++) {
          const targetStart = new Date(slot.startTime.getTime() + week * 7 * 24 * 60 * 60 * 1000);
          const windowStart = new Date(targetStart.getTime() - 60 * 1000).toISOString();
          const windowEnd = new Date(targetStart.getTime() + 60 * 1000).toISOString();

          const { data: match } = await supabase
            .from('teacher_availability')
            .select('id')
            .eq('teacher_id', slot.teacherId)
            .eq('duration', slotDuration)
            .eq('is_available', true)
            .eq('is_booked', false)
            .gte('start_time', windowStart)
            .lte('start_time', windowEnd)
            .limit(1)
            .maybeSingle();

          if (!match?.id) {
            skippedCount++;
            continue;
          }

          try {
            await bookOnce([match.id], slot.teacherId, targetStart.toISOString(), false);
            bookedCount++;
          } catch (err) {
            console.warn('[BookMyClassModal] recurring week failed', week, err);
            skippedCount++;
          }
        }
        setRecurringSummary({ booked: bookedCount, skipped: skippedCount });
      }

      setBooked(true);
      fireConfetti();
      window.dispatchEvent(new Event('availability-changed'));

      toast({
        title: useRecurring ? '🎉 Weekly series booked!' : '🎉 Class booked!',
        description: useRecurring
          ? `Booked ${bookedCount} of ${repeatWeeks} weekly sessions${skippedCount ? ` (${skippedCount} skipped — teacher unavailable)` : ''}.`
          : `Success! Your ${slotDuration}-minute ${config.label} session has been booked.`,
      });

      setTimeout(() => {
        onClose();
        setBooked(false);
        setRecurringSummary(null);
      }, useRecurring ? 3500 : 2500);
    } catch (err: any) {
      console.error('Booking Error Detail:', err, { slotIds, studentId: user.id });
      toast({
        title: 'Booking failed',
        description: err?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      await fetchSlots();
    } finally {
      setBooking(false);
    }
  };

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#06b6d4', '#ec4899'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#06b6d4', '#ec4899'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        {/* Film grain overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.02]">
          <svg width="100%" height="100%">
            <filter id="booking-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            </filter>
            <rect width="100%" height="100%" filter="url(#booking-grain)" />
          </svg>
        </div>

        <div className={cn(
          "relative rounded-2xl overflow-hidden border",
          isDark
            ? "bg-background/80 backdrop-blur-xl border-white/10"
            : "bg-white/90 backdrop-blur-xl border-gray-200/50"
        )}>
          {/* Glass Gradient Header */}
          <div className={cn(
            "relative bg-gradient-to-r p-6 backdrop-blur-md",
            config.headerBg
          )}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-white text-xl font-bold">
                <span className="text-2xl">{config.icon}</span>
                {config.bookLabel}
                {!creditsLoading && (
                  <Badge className={cn(
                    "ml-2 text-xs font-medium",
                    hasCredits
                      ? "bg-white/20 text-white border-white/30 hover:bg-white/30"
                      : "bg-red-500/30 text-white border-red-400/30"
                  )}>
                    <CreditCard className="w-3 h-3 mr-1" />
                    {trialAvailable ? '🎁 Free Trial Available' : `${totalCredits} credit${totalCredits !== 1 ? 's' : ''} remaining`}
                  </Badge>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </DialogTitle>
              <p className="text-white/80 text-sm mt-1">
                {config.description} • {slotDuration} minutes per session
              </p>
            </DialogHeader>
          </div>

          <div className="p-6">
            {/* Hub info (locked to student level) */}
            <div className="mb-5">
              <div className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium border inline-flex items-center gap-2",
                "bg-primary/10 text-primary border-primary/20"
              )}>
                <span>{config.icon}</span>
                {config.label} • {slotDuration} min sessions
              </div>
            </div>

            {/* No credits warning */}
            {!creditsLoading && !hasCredits && !booked && (
              <div className={cn(
                "mb-4 p-4 rounded-xl border flex items-start gap-3",
                isDark
                  ? "bg-red-500/10 border-red-500/20 backdrop-blur-sm"
                  : "bg-red-50/80 border-red-200/50"
              )}>
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">No credits available</p>
                  <p className="text-sm text-destructive/80 mt-1">
                    You need at least 1 credit to book a session. Purchase a credit pack to continue.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => { onClose(); navigate('/student?tab=packages'); }}
                >
                  Get Credits
                </Button>
              </div>
            )}

            {/* Trial banner — hidden for Success Hub (no try-before-you-buy) */}
            {!creditsLoading && trialAvailable && !booked && selectedHub !== 'professional' && (
              <div className={cn(
                "mb-4 p-4 rounded-xl border flex items-start gap-3",
                isDark
                  ? "bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm"
                  : "bg-emerald-50/80 border-emerald-200/50"
              )}>
                <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-700">🎁 Your First Lesson is Free!</p>
                  <p className="text-sm text-emerald-600/80 mt-1">
                    Book your free trial lesson at no cost. Pick a time and start learning!
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {booked ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 blur-xl" />
                    <CheckCircle className="relative w-20 h-20 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground">Booking Confirmed! 🎉</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your {slotDuration}-minute {config.label} session is booked.
                  </p>
                  {meetingLink && (
                    <div className={cn(
                      "w-full max-w-sm rounded-lg p-3 border",
                      isDark ? "bg-white/5 border-white/10" : "bg-muted/50 border-border"
                    )}>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        Your classroom link
                      </p>
                      <p className="text-sm font-mono text-foreground break-all">{meetingLink}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Keep up the great work!
                  </div>
                </motion.div>
              ) : loadingSlots ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 gap-4"
                >
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading available slots...</p>
                </motion.div>
              ) : displaySlots.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-3 text-center"
                >
                  <Calendar className="w-12 h-12 text-muted-foreground/60" />
                  <h3 className="text-lg font-semibold text-foreground">
                    No {config.label} teachers available right now
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {teacherId
                      ? `This teacher has no upcoming ${slotDuration}-minute openings yet. Try again later.`
                      : `No ${slotDuration}-minute slots are open in this hub yet. Please check back soon.`}
                  </p>
                  <Button variant="outline" size="sm" onClick={fetchSlots} disabled={loadingSlots}>
                    Refresh availability
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Repeat Weekly panel — disabled for trial bookings */}
                  <div className={cn(
                    "mb-4 rounded-xl border p-4",
                    isDark ? "bg-white/5 border-white/10" : "bg-muted/40 border-border"
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                          "bg-primary/10 text-primary"
                        )}>
                          <Repeat className="w-4 h-4" />
                        </div>
                        <div>
                          <Label htmlFor="repeat-weekly" className="text-sm font-semibold cursor-pointer">
                            Book this slot every week
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Same teacher, same weekday & time. Uses 1 credit per week.
                            {trialAvailable && ' (Disabled while a free trial is available.)'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="repeat-weekly"
                        checked={repeatWeekly}
                        onCheckedChange={setRepeatWeekly}
                        disabled={trialAvailable}
                      />
                    </div>

                    {repeatWeekly && !trialAvailable && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 pl-12">
                        <span className="text-xs text-muted-foreground">For:</span>
                        {([4, 8, 12] as const).map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRepeatWeeks(n)}
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                              repeatWeeks === n
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:bg-muted"
                            )}
                          >
                            {n} weeks
                          </button>
                        ))}
                        <Badge variant="outline" className="ml-auto text-xs">
                          Needs {repeatWeeks} credits · you have {totalCredits}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <StudentBookingCalendar
                    availableSlots={displaySlots}
                    onBookLesson={handleBookSlot}
                    isLoading={booking}
                  />


                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchSlots}
                      disabled={loadingSlots}
                      className="text-muted-foreground text-xs"
                    >
                      Refresh availability
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
