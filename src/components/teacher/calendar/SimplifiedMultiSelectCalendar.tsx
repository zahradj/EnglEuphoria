import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Calendar, Check, Plus, Sunrise, Sun, Moon, Trash2, MousePointer } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, addDays, startOfWeek, isSameDay, isPast, parseISO } from "date-fns";
import { batchAvailabilityService } from "@/services/batchAvailabilityService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SimplifiedMultiSelectCalendarProps {
  teacherId: string;
}

interface SelectedSlot {
  date: Date;
  time: string;
  key: string;
}

interface SlotData {
  id: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  studentName?: string;
}

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30"
];

export const SimplifiedMultiSelectCalendar: React.FC<SimplifiedMultiSelectCalendarProps> = ({ teacherId }) => {
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(30);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastClickedSlot, setLastClickedSlot] = useState<SelectedSlot | null>(null);
  const [weeklySlots, setWeeklySlots] = useState<Record<string, SlotData[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadWeekData();
  }, [weekStart, teacherId]);

  const loadWeekData = async () => {
    setIsLoading(true);
    try {
      const startDate = weekStart.toISOString();
      const endDate = addDays(weekStart, 7).toISOString();

      const { data, error } = await supabase
        .from('teacher_availability')
        .select(`
          id,
          start_time,
          end_time,
          is_available,
          is_booked,
          lessons(student:users(full_name))
        `)
        .eq('teacher_id', teacherId)
        .gte('start_time', startDate)
        .lt('start_time', endDate);

      if (error) throw error;

      const slotsMap: Record<string, SlotData[]> = {};
      data?.forEach((slot: any) => {
        const date = format(parseISO(slot.start_time), 'yyyy-MM-dd');
        const time = format(parseISO(slot.start_time), 'HH:mm');
        
        if (!slotsMap[date]) slotsMap[date] = [];
        slotsMap[date].push({
          id: slot.id,
          time,
          isAvailable: slot.is_available,
          isBooked: slot.is_booked,
          studentName: slot.lessons?.[0]?.student?.full_name
        });
      });

      setWeeklySlots(slotsMap);
    } catch (error) {
      console.error('Error loading week data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSlotKey = (date: Date, time: string) => `${format(date, 'yyyy-MM-dd')}-${time}`;

  const isSlotSelected = (date: Date, time: string) => {
    return selectedSlots.some(s => s.key === getSlotKey(date, time));
  };

  const getSlotState = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slot = weeklySlots[dateStr]?.find(s => s.time === time);
    
    if (slot?.isBooked) return 'booked';
    if (slot?.isAvailable) return 'available';
    return 'empty';
  };

  const handleMouseDown = (date: Date, time: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isMultiSelectMode) return;
    
    const state = getSlotState(date, time);
    if (state !== 'empty' || isPast(date)) return;

    setIsDragging(true);
    toggleSlotSelection(date, time);
  };

  const handleMouseEnter = (date: Date, time: string) => {
    if (!isMultiSelectMode || !isDragging) return;
    
    const state = getSlotState(date, time);
    if (state !== 'empty' || isPast(date)) return;

    addSlotToSelection(date, time);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSlotSelection = (date: Date, time: string) => {
    const key = getSlotKey(date, time);
    setSelectedSlots(prev => {
      const exists = prev.some(s => s.key === key);
      if (exists) {
        return prev.filter(s => s.key !== key);
      } else {
        return [...prev, { date, time, key }];
      }
    });
  };

  const addSlotToSelection = (date: Date, time: string) => {
    const key = getSlotKey(date, time);
    setSelectedSlots(prev => {
      if (prev.some(s => s.key === key)) return prev;
      return [...prev, { date, time, key }];
    });
  };

  const selectTimeRange = (startHour: number, endHour: number) => {
    const slots: SelectedSlot[] = [];
    
    weekDays.forEach(day => {
      if (isPast(day) && !isSameDay(day, new Date())) return;
      
      TIME_SLOTS.forEach(time => {
        const hour = parseInt(time.split(':')[0]);
        if (hour >= startHour && hour < endHour) {
          const state = getSlotState(day, time);
          if (state === 'empty') {
            slots.push({
              date: day,
              time,
              key: getSlotKey(day, time)
            });
          }
        }
      });
    });
    
    setSelectedSlots(slots);
    toast({
      description: `Selected ${slots.length} empty slots`,
    });
  };

  const createSelectedSlots = async () => {
    if (selectedSlots.length === 0) return;

    setShowConfirmDialog(false);
    setIsLoading(true);
    
    try {
      const dates = selectedSlots.map(s => s.date);
      const times = [...new Set(selectedSlots.map(s => s.time))];

      await batchAvailabilityService.createBatchSlots(teacherId, dates, times, selectedDuration);

      toast({
        title: "✅ Success!",
        description: `Created ${selectedSlots.length} slots of ${selectedDuration} minutes`,
      });

      setSelectedSlots([]);
      setIsMultiSelectMode(false);
      await loadWeekData();
    } catch (error) {
      console.error('Error creating slots:', error);
      toast({
        title: "Error",
        description: "Failed to create some slots",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({ description: "Slot deleted successfully" });
      await loadWeekData();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive"
      });
    }
  };

  const renderSlot = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slot = weeklySlots[dateStr]?.find(s => s.time === time);
    const isSelected = isSlotSelected(date, time);
    const isPastSlot = isPast(date) && !isSameDay(date, new Date());
    const state = getSlotState(date, time);

    let bgColor = "bg-gradient-to-br from-background to-muted/30 hover:from-muted/50 hover:to-muted/70";
    let borderColor = "border-border/50";
    let content = <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />;
    let cursor = "cursor-pointer";
    let shadow = "";

    if (isPastSlot) {
      bgColor = "bg-muted/20";
      borderColor = "border-muted/30";
      content = null;
      cursor = "cursor-not-allowed";
    } else if (state === 'booked') {
      bgColor = "bg-gradient-to-br from-blue-500/20 to-blue-600/30";
      borderColor = "border-blue-500/50";
      shadow = "shadow-lg shadow-blue-500/20";
      content = (
        <div className="text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wide">
          BOOKED
        </div>
      );
      cursor = "cursor-default";
    } else if (state === 'available') {
      bgColor = "bg-gradient-to-br from-green-500/20 to-emerald-600/30";
      borderColor = "border-green-500/50";
      shadow = "shadow-lg shadow-green-500/20";
      content = (
        <div className="flex items-center justify-between w-full gap-1">
          <span className="text-xs font-bold text-green-700 dark:text-green-300 tracking-wide">OPEN</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hover:bg-destructive/20 hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              deleteSlot(slot!.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      );
      cursor = "cursor-default";
    } else if (isSelected && isMultiSelectMode) {
      bgColor = "bg-gradient-to-br from-primary/30 to-primary/40";
      borderColor = "border-primary";
      shadow = "shadow-lg shadow-primary/30";
      content = <Check className="w-4 h-4 text-primary drop-shadow-sm" />;
    }

    return (
      <div
        key={`${dateStr}-${time}`}
        className={`
          group relative h-14 border-2 rounded-xl flex items-center justify-center
          transition-all duration-200 select-none hover:scale-[1.02]
          ${bgColor} ${borderColor} ${cursor} ${shadow}
        `}
        onMouseDown={(e) => handleMouseDown(date, time, e)}
        onMouseEnter={() => handleMouseEnter(date, time)}
        onClick={(e) => {
          if (isMultiSelectMode && state === 'empty' && !isPastSlot) {
            e.preventDefault();
            toggleSlotSelection(date, time);
          }
        }}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-6" onMouseUp={handleMouseUp}>
      {/* Control Bar */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="relative p-6 space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                className="hover:scale-105 transition-transform shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                className="hover:scale-105 transition-transform shadow-sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="hover:scale-105 transition-transform shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-base font-semibold ml-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Duration & Multi-Select */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Duration:</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedDuration === 30 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDuration(30)}
                  className={`transition-all ${selectedDuration === 30 ? 'shadow-lg shadow-primary/30' : 'hover:scale-105'}`}
                >
                  30 min
                </Button>
                <Button
                  variant={selectedDuration === 60 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDuration(60)}
                  className={`transition-all ${selectedDuration === 60 ? 'shadow-lg shadow-primary/30' : 'hover:scale-105'}`}
                >
                  60 min
                </Button>
              </div>
            </div>

            <Button
              variant={isMultiSelectMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsMultiSelectMode(!isMultiSelectMode);
                if (isMultiSelectMode) setSelectedSlots([]);
              }}
              className={`transition-all ${isMultiSelectMode ? 'shadow-lg shadow-primary/30' : 'hover:scale-105'}`}
            >
              Multi-Select: {isMultiSelectMode ? "ON" : "OFF"}
            </Button>
          </div>

          {isMultiSelectMode && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl border border-primary/20 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <MousePointer className="h-4 w-4" />
                  <span>Click to select a slot, click again to unselect. Then use actions below.</span>
                </div>
              </div>
              {selectedSlots.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {selectedSlots.length} slot{selectedSlots.length>1?'s':''} selected
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedSlots([])}
                    className="hover:scale-105 transition-transform"
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {isMultiSelectMode && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Quick Select:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => selectTimeRange(9, 12)}
                className="hover:scale-105 transition-transform shadow-sm"
              >
                <Sunrise className="h-4 w-4 mr-2" />
                Morning (9-12)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => selectTimeRange(13, 17)}
                className="hover:scale-105 transition-transform shadow-sm"
              >
                <Sun className="h-4 w-4 mr-2" />
                Afternoon (13-17)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => selectTimeRange(18, 21)}
                className="hover:scale-105 transition-transform shadow-sm"
              >
                <Moon className="h-4 w-4 mr-2" />
                Evening (18-21)
              </Button>
            </div>
          )}

          {/* Create Button */}
          {selectedSlots.length > 0 && (
            <Button
              className="w-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-[1.02]"
              size="lg"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isLoading}
            >
              <Check className="h-5 w-5 mr-2" />
              Create {selectedSlots.length} Selected Slot{selectedSlots.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="relative overflow-hidden border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
        <div className="relative p-6 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 gap-3 mb-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Time</div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{format(day, 'EEE')}</div>
                  <div className={`text-lg font-bold mt-1 ${
                    isSameDay(day, new Date()) 
                      ? 'text-primary drop-shadow-sm' 
                      : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-3">
                  <div className="text-xs font-semibold text-muted-foreground py-3 flex items-center">{time}</div>
                  {weekDays.map((day) => renderSlot(day, time))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Availability Slots?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create {selectedSlots.length} slots of {selectedDuration} minutes each.
              These slots will be immediately visible to students for booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={createSelectedSlots}>
              Create Slots
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
