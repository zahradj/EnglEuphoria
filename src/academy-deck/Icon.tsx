// Drawn icons for the deck UI (owner 2026-10-10: NEVER emoji, never 3D-looking pictures). Flat two-tone line icons in the deck's purple/gold,
// each with a calm CSS animation where it helps (a glowing bulb, a bobbing pin, a popping star). Pure SVG, inherits the text colour.
const P: Record<string, JSX.Element> = {
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" className="ico-fill" /></>,
  pause: <><rect x="6" y="5" width="4" height="14" rx="1.5" className="ico-fill" /><rect x="14" y="5" width="4" height="14" rx="1.5" className="ico-fill" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="6.2" /></>,
  skip: <><path d="M5 5l9 7-9 7z" className="ico-fill" /><path d="M18 5v14" /></>,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2.5" className="ico-fill" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  unlock: <><rect x="5" y="11" width="14" height="10" rx="2.5" className="ico-fill" /><path d="M8 11V8a4 4 0 0 1 7.5-2" /></>,
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.9 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" className="ico-fill" />,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" className="ico-fill" /><circle cx="12" cy="10" r="2.4" /></>,
  phone: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" className="ico-fill" /><path d="M10.5 5.5h3M11 18.5h2" /></>,
  idcard: <><rect x="3" y="5" width="18" height="14" rx="2.5" className="ico-fill" /><circle cx="9" cy="11" r="2" /><path d="M6.5 16c.6-1.6 4.4-1.6 5 0M14 10h4M14 13h3" /></>,
  printer: <><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" className="ico-fill" /><rect x="7" y="14" width="10" height="7" rx="1" /></>,
  note: <><rect x="4" y="3" width="16" height="18" rx="2.5" className="ico-fill" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6" className="ico-fill" /><path d="M15 15l5.5 5.5" /></>,
  user: <><circle cx="12" cy="8" r="4" className="ico-fill" /><path d="M4 21c.8-4.5 4-6 8-6s7.2 1.5 8 6" /></>,
  eyes: <><ellipse cx="8" cy="12" rx="4" ry="5" className="ico-fill" /><ellipse cx="16.5" cy="12" rx="4" ry="5" className="ico-fill" /><circle cx="9" cy="13" r="1.3" /><circle cx="17.5" cy="13" r="1.3" /></>,
  leaf: <><path d="M5 19C5 10 10 5 20 4c0 9-4 15-13 15" className="ico-fill" /><path d="M5 19c3-5 6-7 10-9" /></>,
  bolt: <path d="M13 2L5 13.5h6L10 22l9-12.5h-6z" className="ico-fill" />,
  rocket: <><path d="M12 2c4 2.5 5.5 7 4.5 12h-9C6.5 9 8 4.5 12 2z" className="ico-fill" /><circle cx="12" cy="9" r="1.8" /><path d="M7.5 14l-3 3 .5 3 3-1.5M16.5 14l3 3-.5 3-3-1.5M10.5 17.5h3l-1.5 4z" /></>,
  abc: <><rect x="2.5" y="4.5" width="19" height="15" rx="3" className="ico-fill" /><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor" stroke="none" fontFamily="system-ui, sans-serif">Aa</text></>,
  numbers: <><rect x="2.5" y="4.5" width="19" height="15" rx="3" className="ico-fill" /><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor" stroke="none" fontFamily="system-ui, sans-serif">123</text></>,
  passport: <><rect x="5" y="2.5" width="14" height="19" rx="2" className="ico-fill" /><circle cx="12" cy="10.5" r="3.6" /><path d="M8.4 10.5h7.2M12 6.9c-1.6 2-1.6 5.2 0 7.2M12 6.9c1.6 2 1.6 5.2 0 7.2M8.5 18h7" /></>,
  chat: <><path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 16h-8l-5 4v-4H4A1.5 1.5 0 0 1 2.5 14.5v-8A1.5 1.5 0 0 1 4 5z" className="ico-fill" /></>,
  frame: <><rect x="3" y="4" width="18" height="16" rx="2.5" className="ico-fill" /><circle cx="9" cy="10" r="1.8" /><path d="M4 18l5-5 4 4 3-3 4 4" /></>,
  sparkle: <path d="M12 2l2 7 7 3-7 3-2 7-2-7-7-3 7-3z" className="ico-fill" />,
};

export type IconName = keyof typeof P;
export function Icon({ name, className = '', title }: { name: string; className?: string; title?: string }) {
  return (
    <svg className={`ad-icon ad-icon-${name} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {P[name] ?? P.sparkle}
    </svg>
  );
}
