import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CALENDAR_PALETTES, calendarHub, resolveCalendarColor } from '@/lib/calendarColors';
import { cn } from '@/lib/utils';

interface CalendarColorPickerProps {
  /** Which palette to offer — only the hub's own colours. */
  hub: string | null | undefined;
  value: string | null | undefined;
  onChange: (key: string) => void | Promise<void>;
  label?: string;
  disabled?: boolean;
}

/** A small "pick your colour" button: the child chooses from their hub's palette only. */
export const CalendarColorPicker: React.FC<CalendarColorPickerProps> = ({ hub, value, onChange, label = 'My colour', disabled }) => {
  const [open, setOpen] = useState(false);
  const palette = CALENDAR_PALETTES[calendarHub(hub)];
  const current = resolveCalendarColor(hub, value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 disabled:opacity-50"
          aria-label={`${label}: ${current.label}. Change colour`}
        >
          <span className={cn('h-4 w-4 rounded-full ring-2 ring-white shadow', current.card)} />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <p className="mb-2 text-xs font-bold text-muted-foreground">Pick a colour</p>
        <div className="flex gap-2">
          {palette.map((c) => {
            const on = c.key === current.key;
            return (
              <button
                key={c.key}
                type="button"
                title={c.label}
                aria-label={c.label}
                aria-pressed={on}
                onClick={async () => { await onChange(c.key); setOpen(false); }}
                className={cn('grid h-9 w-9 place-items-center rounded-full text-white shadow transition hover:scale-110', c.card, on && 'ring-2 ring-offset-2 ring-foreground/70')}
              >
                {on && <Check className="h-4 w-4" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
