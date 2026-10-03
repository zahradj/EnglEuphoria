import { format } from 'date-fns';

/** "4:30 – 5:30 PM", or "11:30 AM – 12:30 PM" when the two ends fall on different sides of noon. */
export function formatTimeRange(start: Date, end: Date): string {
  const sameHalf = format(start, 'a') === format(end, 'a');
  return `${format(start, sameHalf ? 'h:mm' : 'h:mm a')} – ${format(end, 'h:mm a')}`;
}
