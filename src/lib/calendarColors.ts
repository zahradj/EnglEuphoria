/**
 * Calendar colours. A child can pick the colour their lessons show in on the
 * calendar, but ONLY from their own hub's palette — Playground stays warm,
 * Academy stays violet/blue, Success stays green/teal — so the hubs keep their
 * identity. The first option in each palette is the hub's own colour (the
 * default, and what the teacher's calendar uses).
 *
 * Class names are written out in full (never built from strings) so Tailwind
 * keeps them.
 */
export type CalendarHub = 'playground' | 'academy' | 'professional';

export interface CalendarColor {
  key: string;
  label: string;
  /** Gradient for a lesson card (white text on top). */
  card: string;
}

export const CALENDAR_PALETTES: Record<CalendarHub, CalendarColor[]> = {
  playground: [
    { key: 'orange', label: 'Orange', card: 'bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500' },
    { key: 'amber', label: 'Sunshine', card: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500' },
    { key: 'rose', label: 'Rose', card: 'bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500' },
    { key: 'pink', label: 'Candy', card: 'bg-gradient-to-br from-pink-400 via-pink-500 to-fuchsia-500' },
    { key: 'coral', label: 'Coral', card: 'bg-gradient-to-br from-red-400 via-red-500 to-orange-500' },
  ],
  academy: [
    { key: 'violet', label: 'Violet', card: 'bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600' },
    { key: 'indigo', label: 'Indigo', card: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600' },
    { key: 'blue', label: 'Blue', card: 'bg-gradient-to-br from-blue-500 via-blue-600 to-sky-600' },
    { key: 'purple', label: 'Orchid', card: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-violet-600' },
    { key: 'sky', label: 'Sky', card: 'bg-gradient-to-br from-sky-500 via-cyan-600 to-blue-600' },
  ],
  professional: [
    { key: 'emerald', label: 'Emerald', card: 'bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-600' },
    { key: 'teal', label: 'Teal', card: 'bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700' },
    { key: 'cyan', label: 'Lagoon', card: 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-sky-600' },
    { key: 'green', label: 'Green', card: 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700' },
    { key: 'forest', label: 'Forest', card: 'bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800' },
  ],
};

/** Any hub spelling the app uses → one of the three calendar hubs. */
export function calendarHub(value?: string | null): CalendarHub {
  const v = String(value ?? '').toLowerCase();
  if (v === 'playground' || v === 'kids') return 'playground';
  if (v === 'success' || v === 'professional' || v === 'adult' || v === 'adults') return 'professional';
  return 'academy';
}

/** The chosen colour if it belongs to this hub's palette, else the hub's own colour. */
export function resolveCalendarColor(hub: string | null | undefined, key?: string | null): CalendarColor {
  const palette = CALENDAR_PALETTES[calendarHub(hub)];
  return palette.find((c) => c.key === key) ?? palette[0];
}
