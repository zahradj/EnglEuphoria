import React from 'react';
import { Button } from '@/components/ui/button';
import { AvailabilitySlot, DAYS } from './types';
import { Clock, Save, Trash2, Calendar, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotControlPanelProps {
  slotDuration: 30 | 60;
  setSlotDuration: (duration: 30 | 60) => void;
  allowedDurations?: (30 | 60)[];
  hubSpecialty?: 'Playground' | 'Academy' | 'Professional';
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  slotsForDay: AvailabilitySlot[];
  onSaveSchedule: () => void;
  onOpenWeeklySlots: () => void;
  onClearSlots: () => void;
  isSaving?: boolean;
}

const HUB_LABEL: Record<NonNullable<SlotControlPanelProps['hubSpecialty']>, { emoji: string; name: string }> = {
  Playground: { emoji: '🎪', name: 'Playground' },
  Academy: { emoji: '📘', name: 'Academy' },
  Professional: { emoji: '💼', name: 'Success Hub' },
};

export const SlotControlPanel: React.FC<SlotControlPanelProps> = ({
  slotDuration,
  setSlotDuration,
  allowedDurations = [30, 60],
  hubSpecialty = 'Academy',
  selectedDay,
  setSelectedDay,
  slotsForDay,
  onSaveSchedule,
  onOpenWeeklySlots,
  onClearSlots,
  isSaving = false,
}) => {
  const selectedSlots = slotsForDay.filter((s) => s.status === 'selected');
  const openSlots = slotsForDay.filter((s) => s.status === 'open');
  const bookedSlots = slotsForDay.filter((s) => s.status === 'booked');
  const locked = allowedDurations.length === 1;
  const hub = HUB_LABEL[hubSpecialty];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-6">
      {/* Duration */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Slot Duration</label>

        {locked ? (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-foreground">
                {hub.emoji} {hub.name}
              </span>
              <span className="text-muted-foreground"> · {allowedDurations[0]}-min slots only</span>
            </div>
          </div>
        ) : (
          <div className="flex rounded-lg bg-muted p-1">
            {allowedDurations.includes(30) && (
              <button
                onClick={() => setSlotDuration(30)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
                  slotDuration === 30
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                30 Minutes
              </button>
            )}
            {allowedDurations.includes(60) && (
              <button
                onClick={() => setSlotDuration(60)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
                  slotDuration === 60
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                1 Hour
              </button>
            )}
          </div>
        )}
      </div>

      {/* Day Selector */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">View Day</label>
        <div className="grid grid-cols-4 gap-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'py-1.5 px-2 rounded text-xs font-medium transition-all',
                selectedDay === day
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Slots Summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">{selectedDay} Slots</h3>
        </div>

        {slotsForDay.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
            No slots created for {selectedDay}
          </p>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {selectedSlots.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary">
                  Selected ({selectedSlots.length})
                </p>
                {selectedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-primary" />
                      <span className="text-sm text-primary font-medium">{slot.time}</span>
                    </div>
                    <span className="text-xs text-primary">{slot.duration}min</span>
                  </div>
                ))}
              </div>
            )}

            {openSlots.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Available ({openSlots.length})
                </p>
                {openSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-300">{slot.time}</span>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">{slot.duration}min</span>
                  </div>
                ))}
              </div>
            )}

            {bookedSlots.length > 0 && (
              <div className="space-y-1 mt-3">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Booked ({bookedSlots.length})
                </p>
                {bookedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col gap-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{slot.time}</span>
                      </div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">{slot.duration}min</span>
                    </div>
                    <div className="pl-5">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 truncate">
                        {slot.studentName || 'Student'}
                      </p>
                      {slot.studentEmail && (
                        <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 truncate">
                          {slot.studentEmail}
                        </p>
                      )}
                      {slot.lessonTitle && (
                        <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 truncate italic">
                          {slot.lessonTitle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs text-muted-foreground">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted opacity-50" />
            <span className="text-xs text-muted-foreground">Past/Unavailable</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <Button onClick={onSaveSchedule} className="w-full bg-primary hover:bg-primary/90" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Opening...' : 'Open selected once'}
        </Button>
        <Button onClick={onOpenWeeklySlots} variant="outline" className="w-full" disabled={isSaving}>
          <Calendar className="h-4 w-4 mr-2" />
          Open selected every week
        </Button>
        <Button
          onClick={onClearSlots}
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Open Slots
        </Button>
      </div>
    </div>
  );
};
