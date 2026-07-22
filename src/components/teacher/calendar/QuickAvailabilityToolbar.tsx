import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sunrise, Sun, Sunset, Calendar, Zap, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { batchAvailabilityService } from "@/services/batchAvailabilityService";
import { useToast } from "@/hooks/use-toast";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  timeRange: { start: string; end: string };
  colorClass: string;
  estimatedSlots: number;
}

interface QuickAvailabilityToolbarProps {
  teacherId: string;
  currentWeek: Date[];
  selectedDuration: 30 | 60;
  onSlotsCreated: () => void;
  onOpenQuickSetup: () => void;
}

export const QuickAvailabilityToolbar = ({
  teacherId,
  currentWeek,
  selectedDuration,
  onSlotsCreated,
  onOpenQuickSetup
}: QuickAvailabilityToolbarProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const quickActions: QuickAction[] = [
    {
      id: 'morning',
      label: 'Mornings',
      icon: <Sunrise className="h-4 w-4" />,
      timeRange: { start: '09:00', end: '12:00' },
      colorClass: 'from-amber-500 to-orange-500',
      estimatedSlots: calculateSlots('09:00', '12:00')
    },
    {
      id: 'afternoon',
      label: 'Afternoons',
      icon: <Sun className="h-4 w-4" />,
      timeRange: { start: '13:00', end: '17:00' },
      colorClass: 'from-yellow-500 to-amber-500',
      estimatedSlots: calculateSlots('13:00', '17:00')
    },
    {
      id: 'evening',
      label: 'Evenings',
      icon: <Sunset className="h-4 w-4" />,
      timeRange: { start: '18:00', end: '21:00' },
      colorClass: 'from-purple-500 to-pink-500',
      estimatedSlots: calculateSlots('18:00', '21:00')
    },
    {
      id: 'fullday',
      label: 'Full Day',
      icon: <Calendar className="h-4 w-4" />,
      timeRange: { start: '09:00', end: '17:00' },
      colorClass: 'from-blue-500 to-cyan-500',
      estimatedSlots: calculateSlots('09:00', '17:00')
    }
  ];

  function calculateSlots(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const slotsPerDay = Math.floor(totalMinutes / selectedDuration);
    return slotsPerDay * 7; // 7 days in a week
  }

  const handleQuickAction = (action: QuickAction) => {
    setSelectedAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirmCreate = async () => {
    if (!selectedAction) return;

    setIsCreating(true);
    try {
      const times = generateTimeSlots(
        selectedAction.timeRange.start,
        selectedAction.timeRange.end,
        selectedDuration
      );

      await batchAvailabilityService.createBatchSlots(
        teacherId,
        currentWeek,
        times,
        selectedDuration
      );

      toast({
        title: "✅ Slots Created Successfully",
        description: `Opened ${selectedAction.estimatedSlots} ${selectedDuration}-minute slots for ${selectedAction.label.toLowerCase()}`,
      });

      onSlotsCreated();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error creating quick slots:', error);
      toast({
        title: "Error Creating Slots",
        description: "Some slots may already exist or there was a database error.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  function generateTimeSlots(start: string, end: string, duration: number): string[] {
    const times: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + duration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      times.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      currentMinutes += duration;
    }

    return times;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Quick Actions:</span>
        </div>
        
        {quickActions.map((action) => (
          <Button
            key={action.id}
            onClick={() => handleQuickAction(action)}
            size="sm"
            variant="outline"
            className={`relative overflow-hidden border-2 hover:scale-105 transition-transform duration-200 group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${action.colorClass} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative flex items-center gap-2">
              {action.icon}
              <span className="font-medium">Open {action.label}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                ~{action.estimatedSlots}
              </Badge>
            </div>
          </Button>
        ))}

        <div className="ml-auto">
          <Button
            onClick={onOpenQuickSetup}
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Advanced Setup
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {selectedAction?.icon}
              Open {selectedAction?.label}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will create approximately <strong>{selectedAction?.estimatedSlots} slots</strong> for the current week:
              </p>
              <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Range:</span>
                  <span className="font-medium">{selectedAction?.timeRange.start} - {selectedAction?.timeRange.end}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slot Duration:</span>
                  <span className="font-medium">{selectedDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days:</span>
                  <span className="font-medium">7 days (current week)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ✨ These slots will be immediately visible to students for booking.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCreate}
              disabled={isCreating}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Slots'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};