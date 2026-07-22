import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuickSetupModalProps {
  teacherId: string;
  onSlotsCreated: () => void;
  children: React.ReactNode;
}

export const QuickSetupModal = ({ teacherId, onSlotsCreated, children }: QuickSetupModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState<30 | 60>(30);
  const [isCreating, setIsCreating] = useState(false);
  const [estimatedSlots, setEstimatedSlots] = useState(0);
  const { toast } = useToast();

  const daysOfWeek = [
    { id: 1, label: "Monday" },
    { id: 2, label: "Tuesday" },
    { id: 3, label: "Wednesday" },
    { id: 4, label: "Thursday" },
    { id: 5, label: "Friday" },
    { id: 6, label: "Saturday" },
    { id: 0, label: "Sunday" }
  ];

  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };
  
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'weekday-morning':
        setSelectedDays([1, 2, 3, 4, 5]);
        setStartTime("08:00");
        setEndTime("12:00");
        break;
      case 'weekday-evening':
        setSelectedDays([1, 2, 3, 4, 5]);
        setStartTime("17:00");
        setEndTime("21:00");
        break;
      case 'weekend':
        setSelectedDays([6, 0]);
        setStartTime("09:00");
        setEndTime("18:00");
        break;
      case 'business-hours':
        setSelectedDays([1, 2, 3, 4, 5]);
        setStartTime("09:00");
        setEndTime("17:00");
        break;
    }
  };
  
  // Calculate estimated slots
  useEffect(() => {
    if (selectedDays.length === 0) {
      setEstimatedSlots(0);
      return;
    }
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes;
    
    if (totalMinutes <= 0) {
      setEstimatedSlots(0);
      return;
    }
    
    // Calculate slots per day (30-minute intervals, accounting for duration)
    const slotsPerDay = Math.floor(totalMinutes / 30);
    // 4 weeks * selected days * slots per day
    const total = 4 * selectedDays.length * slotsPerDay;
    setEstimatedSlots(total);
  }, [selectedDays, startTime, endTime, duration]);

  const createBulkSlots = async () => {
    if (selectedDays.length === 0) {
      toast({
        title: "Select Days",
        description: "Please select at least one day of the week.",
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
      setIsOpen(false);
      return;
    }

    if (currentSession.user.id !== teacherId) {
      toast({
        title: "⚠️ ID Mismatch",
        description: `Session mismatch detected. Please refresh the page and try again.`,
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
        description: `You must have a teacher role. Current role: ${roleData?.role || 'none'}`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      let slots = [];
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Create slots for the next 4 weeks
      for (let week = 0; week < 4; week++) {
        const weekStart = new Date(nextWeek.getTime() + week * 7 * 24 * 60 * 60 * 1000);
        const mondayOfWeek = new Date(weekStart);
        mondayOfWeek.setDate(mondayOfWeek.getDate() - mondayOfWeek.getDay() + 1);

        selectedDays.forEach(dayOfWeek => {
          const slotDate = new Date(mondayOfWeek);
          slotDate.setDate(mondayOfWeek.getDate() + (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

          // Generate time slots between start and end time
          const [startHour, startMin] = startTime.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);
          
          let currentTime = new Date(slotDate);
          currentTime.setHours(startHour, startMin, 0, 0);
          
          const endDateTime = new Date(slotDate);
          endDateTime.setHours(endHour, endMin, 0, 0);

          while (currentTime < endDateTime) {
            const slotEnd = new Date(currentTime);
            slotEnd.setMinutes(slotEnd.getMinutes() + duration);

            if (slotEnd <= endDateTime) {
              slots.push({
                teacher_id: teacherId,
                start_time: currentTime.toISOString(),
                end_time: slotEnd.toISOString(),
                duration: duration,
                lesson_type: 'free_slot',
                is_available: true,
                is_booked: false
              });
            }

            currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
          }
        });
      }

      // Pre-filter duplicates
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
            setIsOpen(false);
            onSlotsCreated();
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

        toast({
          title: "✅ Slots Created",
          description: `Successfully created ${slots.length} availability slots for the next 4 weeks.`,
        });
      }

      setIsOpen(false);
      onSlotsCreated();
      
      // Reset form
      setSelectedDays([]);
      setStartTime("09:00");
      setEndTime("17:00");
      setDuration(30);
      
    } catch (error: any) {
      console.error('❌ Bulk slot creation failed:', error);
      
      let errorTitle = "Error Creating Slots";
      let errorDescription = "Failed to create availability slots.";
      
      // Detailed error categorization
      if (error?.code === '42501' || error?.code === 'PGRST301') {
        errorTitle = "🔒 Permission Denied";
        errorDescription = `Database rejected your request. This usually means:

1. You're not logged in as a teacher
2. Your session expired  
3. Role mismatch in database

Please log out and log back in.`;
      } else if (error?.message?.includes('duplicate')) {
        errorTitle = "⚠️ Duplicate Slots";
        errorDescription = "Some of these time slots already exist.";
      } else if (error?.message?.includes('foreign key')) {
        errorTitle = "❌ Invalid Teacher ID";
        errorDescription = `Your teacher ID is not valid in the database. Please contact support.`;
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Availability Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Select Days</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {daysOfWeek.map(day => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={`day-${day.id}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-time" className="text-sm font-medium">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="end-time" className="text-sm font-medium">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('weekday-morning')}
              >
                🌅 Weekday Mornings
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('weekday-evening')}
              >
                🌆 Weekday Evenings
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('weekend')}
              >
                🎉 Weekends
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('business-hours')}
              >
                💼 Business Hours
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Lesson Duration</Label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value) as 30 | 60)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Preview Section */}
          {estimatedSlots > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This will create approximately <strong className="text-primary">{estimatedSlots}</strong> slot{estimatedSlots !== 1 ? 's' : ''} 
                {' '}across <strong>{selectedDays.length}</strong> day{selectedDays.length !== 1 ? 's' : ''} for the next 4 weeks.
              </p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {selectedDays.map(dayId => {
                  const day = daysOfWeek.find(d => d.id === dayId);
                  return day ? (
                    <Badge key={dayId} variant="secondary" className="text-xs">
                      {day.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                onClick={createBulkSlots} 
                disabled={isCreating || selectedDays.length === 0}
                className="flex-1"
              >
                <Clock className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create Slots"}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};