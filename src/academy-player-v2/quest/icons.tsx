// Small line icons for the quest layer (one family, 24px grid, currentColor). Decorative: aria-hidden; the buttons that use them carry their own label.
import type { ReactElement } from 'react';

const P: Record<string, ReactElement> = {
  door: <><rect x="6" y="3" width="12" height="18" rx="2" /><circle cx="15" cy="12" r="1" /></>,
  bulb: <><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></>,
  book: <><path d="M4 5.5C6 4 9 4 12 6c3-2 6-2 8-.5V19c-2-1.5-5-1.5-8 .5-3-2-6-2-8-.5z M12 6v13.5" /></>,
  lens: <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5.5 5.5" /></>,
  bolt: <><path d="M13 2L5 13.5h6L10 22l8-11.5h-6z" /></>,
  flag: <><path d="M6 21V4M6 5h11l-2.5 4L17 13H6" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5c0 3 1.2 4.5 3.5 5M16 6h3.5c0 3-1.2 4.5-3.5 5M12 13v4M8.5 20h7M10 17h4" /></>,
  bag: <><path d="M6 8h12l1.5 12h-15zM9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  map: <><path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13" /></>,
  log: <><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" /></>,
  gem: <><path d="M6.5 4h11l4 5.5L12 21 2.5 9.5zM2.5 9.5h19M9 4l-2 5.5L12 21l5-11.5L15 4" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z" />,
  pin: <><path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0c0 5 6.5 11 6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  swords: <><path d="M5 5l9 9M14 5l-9 9M4 20l4-4M20 20l-4-4M14 14l5 5M5 14l5 5" /></>,
  anvil: <><path d="M4 8h13a3 3 0 0 1-3 3h-1l1.5 3.5H17V17H8v-2.5h1.5L10 11H8a4 4 0 0 1-4-3zM17 8h3" /></>,
  chat: <><path d="M4 5h16v11H11l-4.5 4v-4H4z" /></>,
  puzzle: <><path d="M5 9h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3H5v-4a2 2 0 1 0 0-4z" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

export type IconName = keyof typeof P;
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg className="avq-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}

/** icon of each of the 8 stages (run of show order) */
export const STAGE_ICONS: IconName[] = ['door', 'bulb', 'book', 'lens', 'bolt', 'flag', 'mic', 'trophy'];
