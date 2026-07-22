import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Repeat2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  openSingleSlot,
  openWeeklyRecurring,
  type HubKind,
} from "@/services/recurringSlotsService";

interface OpenSlotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  /** Hub the teacher belongs to — drives durations and brand color. */
  hub: HubKind;
  /** Pre-selected date for the "Single" tab. Defaults to today. */
  defaultDate?: Date;
  /** Pre-selected time for the "Single" tab, e.g. "15:00". */
  defaultTime?: string;
  /** Called after successful creation so callers can refresh their calendar. */
  onCreated?: (count: number) => void;
}

const WEEKDAYS = [
  { idx: 0, short: "Sun", long: "Sunday" },
  { idx: 1, short: "Mon", long: "Monday" },
  { idx: 2, short: "Tue", long: "Tuesday" },
  { idx: 3, short: "Wed", long: "Wednesday" },
  { idx: 4, short: "Thu", long: "Thursday" },
  { idx: 5, short: "Fri", long: "Friday" },
  { idx: 6, short: "Sat", long: "Saturday" },
];

const HUB_META: Record<HubKind, { label: string; emoji: string; classes: string }> = {
  playground: {
    label: "Playground",
    emoji: "🎪",
    classes: "bg-orange-500/15 text-orange-600 border-orange-500/40",
  },
  academy: {
    label: "Academy",
    emoji: "📘",
    classes: "bg-purple-500/15 text-purple-700 border-purple-500/40",
  },
  success: {
    label: "Success",
    emoji: "🏆",
    classes: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40",
  },
};

const allowedDurationsForHub = (hub: HubKind): (30 | 60)[] =>
  hub === "playground" ? [30] : [60];

const todayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD for <input type=date>
};

export const OpenSlotsDialog: React.FC<OpenSlotsDialogProps> = ({
  open,
  onOpenChange,
  teacherId,
  hub,
  defaultDate,
  defaultTime,
  onCreated,
}) => {
  const allowedDurations = useMemo(() => allowedDurationsForHub(hub), [hub]);
  const defaultDuration: 30 | 60 = allowedDurations[0];
  const meta = HUB_META[hub];

  // Single-slot state
  const [singleDate, setSingleDate] = useState<string>(
    defaultDate ? defaultDate.toISOString().slice(0, 10) : todayIso(),
  );
  const [singleTime, setSingleTime] = useState<string>(defaultTime ?? "09:00");
  const [singleDuration, setSingleDuration] = useState<30 | 60>(defaultDuration);

  // Weekly state
  const [weekdays, setWeekdays] = useState<number[]>([new Date().getDay()]);
  const [times, setTimes] = useState<string[]>(["09:00"]);
  const [weeklyDuration, setWeeklyDuration] = useState<30 | 60>(defaultDuration);

  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"single" | "weekly">("single");

  const toggleWeekday = (idx: number) => {
    setWeekdays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort(),
    );
  };

  const updateTime = (i: number, value: string) =>
    setTimes((prev) => prev.map((t, idx) => (idx === i ? value : t)));

  const addTime = () => setTimes((prev) => [...prev, "09:00"]);
  const removeTime = (i: number) =>
    setTimes((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const handleCreateSingle = async () => {
    setBusy(true);
    try {
      const [y, m, d] = singleDate.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const created = await openSingleSlot({
        teacherId,
        date,
        time: singleTime,
        duration: singleDuration,
        hub,
      });
      toast({
        title: "✅ Slot opened",
        description: `${singleDuration}-minute slot on ${date.toLocaleDateString()} at ${singleTime}.`,
      });
      onCreated?.(created);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Could not open slot",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCreateWeekly = async () => {
    if (weekdays.length === 0) {
      toast({ title: "Pick at least one weekday", variant: "destructive" });
      return;
    }
    if (times.length === 0) {
      toast({ title: "Pick at least one time", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const created = await openWeeklyRecurring({
        teacherId,
        weekdays,
        times,
        duration: weeklyDuration,
        weeksAhead: 12,
        hub,
      });
      toast({
        title: "✅ Weekly slots opened",
        description: `Created ${created} slot${created === 1 ? "" : "s"} across the next 12 weeks.`,
      });
      onCreated?.(created);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Could not open weekly slots",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Open availability slots
            <Badge variant="outline" className={cn("border", meta.classes)}>
              {meta.emoji} {meta.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Open a single slot for today, or repeat a slot every week — both modes
            work the same way across all hubs.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "single" | "weekly")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">
              <CalendarDays className="w-4 h-4 mr-1.5" /> Single slot
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <Repeat2 className="w-4 h-4 mr-1.5" /> Every week
            </TabsTrigger>
          </TabsList>

          {/* Single slot */}
          <TabsContent value="single" className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="single-date">Date</Label>
                <Input
                  id="single-date"
                  type="date"
                  min={todayIso()}
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="single-time">Time</Label>
                <Input
                  id="single-time"
                  type="time"
                  value={singleTime}
                  onChange={(e) => setSingleTime(e.target.value)}
                />
              </div>
            </div>

            <DurationPicker
              value={singleDuration}
              onChange={setSingleDuration}
              allowed={allowedDurations}
            />
          </TabsContent>

          {/* Weekly recurring */}
          <TabsContent value="weekly" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d) => {
                  const active = weekdays.includes(d.idx);
                  return (
                    <button
                      key={d.idx}
                      type="button"
                      onClick={() => toggleWeekday(d.idx)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground border-border hover:bg-muted",
                      )}
                      aria-pressed={active}
                    >
                      {d.short}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Repeats every week for the next 12 weeks.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Times each day</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addTime}
                  className="h-7 px-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add time
                </Button>
              </div>
              <div className="space-y-1.5">
                {times.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={t}
                      onChange={(e) => updateTime(i, e.target.value)}
                      className="flex-1"
                    />
                    {times.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTime(i)}
                        aria-label="Remove time"
                        className="h-9 w-9"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DurationPicker
              value={weeklyDuration}
              onChange={setWeeklyDuration}
              allowed={allowedDurations}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          {tab === "single" ? (
            <Button onClick={handleCreateSingle} disabled={busy}>
              {busy ? "Opening…" : "Open slot"}
            </Button>
          ) : (
            <Button onClick={handleCreateWeekly} disabled={busy}>
              {busy ? "Opening…" : "Open weekly slots"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DurationPickerProps {
  value: 30 | 60;
  onChange: (v: 30 | 60) => void;
  allowed: (30 | 60)[];
}

const DurationPicker: React.FC<DurationPickerProps> = ({ value, onChange, allowed }) => {
  if (allowed.length === 1) {
    return (
      <p className="text-xs text-muted-foreground">
        Your hub uses <span className="font-semibold">{allowed[0]}-minute</span> lessons only.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <Label>Lesson duration</Label>
      <RadioGroup
        value={String(value)}
        onValueChange={(v) => onChange(Number(v) as 30 | 60)}
        className="flex gap-2"
      >
        {allowed.map((d) => (
          <label
            key={d}
            className={cn(
              "flex-1 flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-accent",
              value === d && "border-primary bg-primary/5",
            )}
          >
            <RadioGroupItem value={String(d)} id={`dur-${d}`} />
            <span className="text-sm font-medium">{d} min</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};
