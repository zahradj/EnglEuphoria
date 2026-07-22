import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, Repeat, CalendarPlus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlotActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  time: string;
  teacherId: string;
  selectedDuration: 30 | 60;
  onSlotCreated: () => void;
}

export const TimeSlotActionModal = ({
  isOpen,
  onClose,
  date,
  time,
  teacherId,
  selectedDuration,
  onSlotCreated
}: TimeSlotActionModalProps) => {
  const [slotType, setSlotType] = useState<'single' | 'weekly'>('single');
  const [numWeeks, setNumWeeks] = useState<number>(4);
  const [localDuration, setLocalDuration] = useState<30 | 60>(selectedDuration);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Sync local duration with prop when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalDuration(selectedDuration);
    }
  }, [isOpen, selectedDuration]);

  const formatTime12Hour = (time24: string) => {
    if (!time24 || typeof time24 !== 'string') {
      return '12:00 AM'; // Default fallback
    }
    
    const timeParts = time24.split(':');
    if (timeParts.length < 2) {
      return '12:00 AM'; // Default fallback for invalid format
    }
    
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const createSlots = async () => {
    if (!time || typeof time !== 'string') {
      toast({
        title: "Invalid Time",
        description: "Please select a valid time slot.",
        variant: "destructive"
      });
      return;
    }

    // SECURITY: Pre-flight authentication check
    if (!teacherId || teacherId === '') {
      toast({
        title: "⚠️ Authentication Error",
        description: "Invalid teacher ID. Please log out and log back in.",
        variant: "destructive"
      });
      return;
    }

    // Verify current user session
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) {
      toast({
        title: "⚠️ Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    if (currentSession.user.id !== teacherId) {
      toast({
        title: "⚠️ ID Mismatch",
        description: `Session user (${currentSession.user.id.slice(0,8)}...) doesn't match teacher ID (${teacherId.slice(0,8)}...). Please refresh the page.`,
        variant: "destructive"
      });
      return;
    }

    // Verify teacher role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', teacherId)
      .maybeSingle();

    if (!roleData || roleData.role !== 'teacher') {
      toast({
        title: "⚠️ Permission Denied",
        description: `You must have a teacher role to create availability slots. Current role: ${roleData?.role || 'none'}`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const timeParts = time.split(':');
      if (timeParts.length < 2) {
        throw new Error('Invalid time format');
      }
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid time values');
      }
      
      let slots = [];

      if (slotType === 'single') {
        // Create single slot
        const startDateTime = new Date(date);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + localDuration);

        slots.push({
          teacher_id: teacherId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          duration: localDuration,
          lesson_type: 'free_slot',
          is_available: true,
          is_booked: false
        });
      } else {
        // Create weekly recurring slots for the specified number of weeks
        const today = new Date();
        
        for (let week = 0; week < numWeeks; week++) {
          const slotDate = new Date(date);
          slotDate.setDate(date.getDate() + (week * 7));
          
          // Skip past dates
          if (slotDate < today) continue;
          
          const startDateTime = new Date(slotDate);
          startDateTime.setHours(hours, minutes, 0, 0);
          
          const endDateTime = new Date(startDateTime);
          endDateTime.setMinutes(endDateTime.getMinutes() + localDuration);

          slots.push({
            teacher_id: teacherId,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            duration: localDuration,
            lesson_type: 'free_slot',
            is_available: true,
            is_booked: false
          });
        }
      }

      // Pre-filter duplicates: check existing slots to prevent insert errors
      if (slots.length > 0) {
        const startTimes = slots.map(s => s.start_time);
        const { data: existingSlots, error: fetchError } = await supabase
          .from('teacher_availability')
          .select('start_time')
          .eq('teacher_id', teacherId)
          .in('start_time', startTimes);

        if (fetchError) {
          console.warn('Could not check for duplicate slots:', fetchError);
        } else if (existingSlots && existingSlots.length > 0) {
          const existingStartTimes = new Set(existingSlots.map(s => s.start_time));
          const originalCount = slots.length;
          slots = slots.filter(s => !existingStartTimes.has(s.start_time));
          const skippedCount = originalCount - slots.length;

          if (slots.length === 0) {
            toast({
              title: "No New Slots",
              description: "All selected times are already open for booking.",
            });
            onSlotCreated();
            onClose();
            setIsCreating(false);
            return;
          }

          if (skippedCount > 0) {
            toast({
              title: "⚠️ Some Duplicates Skipped",
              description: `${skippedCount} slot(s) already exist. Created ${slots.length} new slot(s).`,
            });
          }
        }
      }

      if (slots.length > 0) {
        const { insertAvailabilitySlotsWithFallback } = await import("@/services/availabilityInsert");
        await insertAvailabilitySlotsWithFallback(supabase as any, slots);

        const slotCount = slots.length;
        const typeText = slotType === 'single' ? 'slot' : `weekly slots (${slotCount} total)`;
        
        toast({
          title: "✅ Availability Created!",
          description: `${typeText.charAt(0).toUpperCase() + typeText.slice(1)} created at ${formatTime12Hour(time)} for ${localDuration} minutes.`,
        });
      }

      onSlotCreated();
      onClose();
    } catch (error: any) {
      console.error('❌ Slot creation failed:', error);
      
      let errorTitle = "Error Creating Slot";
      let errorDescription = "Failed to create availability slot.";
      
      // Detailed error categorization
      if (error?.code === '42501' || error?.code === 'PGRST301') {
        errorTitle = "🔒 Permission Denied";
        errorDescription = `Database rejected your request. This usually means:

1. You're not logged in as a teacher
2. Your session expired
3. Role mismatch in database

Please log out and log back in.`;
      } else if (error?.message?.includes('duplicate')) {
        errorTitle = "⚠️ Duplicate Slot";
        errorDescription = "This time slot already exists. Try a different time or delete the existing slot first.";
      } else if (error?.message?.includes('foreign key')) {
        errorTitle = "❌ Invalid Teacher ID";
        errorDescription = `Your teacher ID (${teacherId?.slice(0, 8)}...) is not valid in the database. Please contact support.`;
      } else if (error?.message?.includes('violates check constraint')) {
        errorTitle = "⚠️ Validation Error";
        errorDescription = error.message;
      } else if (error?.message) {
        errorDescription = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 7000
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
      setSlotType('single');
      setNumWeeks(4);
      setLocalDuration(selectedDuration);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-6 py-4">
          {/* Date/Time Display */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              {format(date, 'EEE, dd.MM yyyy')} {formatTime12Hour(time)}
            </h3>
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
              <p className="text-sm text-primary font-medium flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Visible to students immediately</span>
              </p>
            </div>
          </div>

          {/* Duration Selector - Compact */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={localDuration === 30 ? "default" : "outline"}
                onClick={() => setLocalDuration(30)}
              >
                25-min Focused Session
              </Button>
              <Button
                type="button"
                size="sm"
                variant={localDuration === 60 ? "default" : "outline"}
                onClick={() => setLocalDuration(60)}
              >
                55-min Deep Dive
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Includes 5-min teacher buffer</p>
          </div>

          {/* Main Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setSlotType('single');
                createSlots();
              }} 
              disabled={isCreating}
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isCreating && slotType === 'single' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create single slot'
              )}
            </Button>
            
            <Button 
              onClick={() => {
                setSlotType('weekly');
                createSlots();
              }} 
              disabled={isCreating}
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isCreating && slotType === 'weekly' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create weekly slot'
              )}
            </Button>
          </div>

          {/* Weekly Options (shown when creating weekly) */}
          {slotType === 'weekly' && !isCreating && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Repeat for:</Label>
              <Select value={numWeeks.toString()} onValueChange={(val) => setNumWeeks(parseInt(val))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 week</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bottom Notice */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-primary flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              Just in time class
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};