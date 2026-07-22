import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SyncStatusBadgeProps {
  teacherId: string;
  refreshTrigger?: number;
}

export const SyncStatusBadge = ({ teacherId, refreshTrigger }: SyncStatusBadgeProps) => {
  const [availableSlots, setAvailableSlots] = useState(0);
  const [nextAvailable, setNextAvailable] = useState<Date | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [syncTimeAgo, setSyncTimeAgo] = useState("just now");

  const fetchSyncStatus = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();

      // Count available slots
      const { count, error: countError } = await supabase
        .from('teacher_availability')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('is_available', true)
        .eq('is_booked', false)
        .gte('start_time', now);

      if (countError) throw countError;

      // Get next available slot
      const { data: nextSlot, error: nextError } = await supabase
        .from('teacher_availability')
        .select('start_time')
        .eq('teacher_id', teacherId)
        .eq('is_available', true)
        .eq('is_booked', false)
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

      if (nextError && nextError.code !== 'PGRST116') throw nextError;

      setAvailableSlots(count || 0);
      setNextAvailable(nextSlot ? new Date(nextSlot.start_time) : null);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching sync status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, [teacherId]);

  // Update "time since sync" every 10 seconds
  useEffect(() => {
    const updateTimeSinceSync = () => {
      const seconds = Math.floor((new Date().getTime() - lastSync.getTime()) / 1000);
      if (seconds < 10) setSyncTimeAgo("just now");
      else if (seconds < 60) setSyncTimeAgo(`${seconds}s ago`);
      else setSyncTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    };

    updateTimeSinceSync();
    const interval = setInterval(updateTimeSinceSync, 10000);
    return () => clearInterval(interval);
  }, [lastSync]);

  const getStatusColor = () => {
    if (availableSlots === 0) return "bg-destructive/10 text-destructive border-destructive/20";
    if (availableSlots < 5) return "bg-warning/10 text-warning border-warning/20";
    return "bg-success/10 text-success border-success/20";
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (availableSlots === 0) return <Calendar className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (availableSlots === 0) return "No availability set";
    if (availableSlots < 5) return "Limited availability";
    return "Available for booking";
  };

  const formatNextAvailable = () => {
    if (!nextAvailable) return "No upcoming slots";
    const today = new Date();
    const isToday = nextAvailable.toDateString() === today.toDateString();
    const isTomorrow = nextAvailable.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString();

    if (isToday) {
      return `Today at ${format(nextAvailable, 'h:mm a')}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${format(nextAvailable, 'h:mm a')}`;
    } else {
      return format(nextAvailable, 'MMM d at h:mm a');
    }
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-background via-background/95 to-background rounded-xl border shadow-lg backdrop-blur-sm">
      <Badge variant="outline" className={`${getStatusColor()} px-4 py-2 text-sm font-semibold flex items-center gap-2`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{availableSlots} open slots</span>
        </div>

        {nextAvailable && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="text-muted-foreground">
              Next: <span className="font-medium text-foreground">{formatNextAvailable()}</span>
            </div>
          </>
        )}

        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <RefreshCw className="h-3 w-3" />
          <span>Synced {syncTimeAgo}</span>
        </div>
      </div>

      {availableSlots > 0 && (
        <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20">
          ✅ Visible to students
        </Badge>
      )}
    </div>
  );
};