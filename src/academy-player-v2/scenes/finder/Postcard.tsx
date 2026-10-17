/** @jsxRuntime automatic */
/** @jsxImportSource react */
// One lookalike postcard (CSS/SVG only, no picture files): a little painted photo scene, the things on it as line icons, and the sender's line.
// Used by the Postcard Finder. The photo uses the same painted tones as the desk games (.av-photo).
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { tagsOf, type FinderCard } from './finderLogic';

const G: Record<string, ReactElement> = {
  tent: <path d="M3 19 12 5l9 14zM12 5v14M9 19l3-5 3 5" />,
  lake: <path d="M3 10c3-2 5 2 9 0s6 2 9 0M3 15c3-2 5 2 9 0s6 2 9 0" />,
  fire: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
  tower: <path d="M9 21V9l3-5 3 5v12M7 21h10M11 12h2" />,
  flag: <path d="M6 21V4M6 5h11l-2.5 4L17 13H6" />,
  bridge: <path d="M2 17h20M4 17v-5a8 8 0 0 1 16 0v5M8 17v-4M12 17v-6M16 17v-4" />,
  bus: <><rect x="4" y="5" width="16" height="12" rx="2" /><path d="M4 11h16" /><circle cx="8" cy="19" r="1.4" /><circle cx="16" cy="19" r="1.4" /></>,
  boat: <path d="M3 15h18l-3 5H6zM12 3v12M12 4l6 9h-6" />,
  bike: <><circle cx="6" cy="16" r="3.5" /><circle cx="18" cy="16" r="3.5" /><path d="M6 16l4-8h5l3 8M10 8l3 8" /></>,
  tree: <path d="M12 21v-6M12 3l6 8h-3l4 6H5l4-6H6z" />,
  cafe: <path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 10h2a2 2 0 0 1 0 4h-2M8 4v2M12 4v2" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
};

export function DetailIcon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg className="av-fd-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {G[name.toLowerCase()] ?? <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}

export type CardState = 'idle' | 'dim' | 'secret' | 'asked' | 'found';

export function Postcard({ card, state, disabled, onClick, innerRef, hot }: { card: FinderCard; state: CardState; disabled?: boolean; onClick?: () => void; innerRef?: (el: HTMLElement | null) => void; hot?: boolean }) {
  const { t } = useTranslation();
  const label = tagsOf(card).join(', ');
  return (
    <button type="button" ref={innerRef} className="av-fd-card" data-state={state} data-hot={hot || undefined} data-id={card.id} disabled={disabled} aria-label={label} onClick={onClick}>
      <span className="av-fd-flip">
        <span className="av-fd-face av-fd-front">
          <figure className="av-photo" data-tone={card.tone}>
            <span className="av-photo-sun" /><span className="av-photo-hill" data-k="1" /><span className="av-photo-hill" data-k="2" /><span className="av-photo-ground" />
          </figure>
          <span className="av-fd-things">
            {card.details.map((d) => <i key={d}><DetailIcon name={d} /><b>{d}</b></i>)}
          </span>
          <span className="av-fd-note"><b>{card.place}</b><span>{card.feeling}{card.chunk ? ` · ${card.chunk}` : ''}</span></span>
          {state === 'secret' && <span className="av-fd-badge">{t('ap.fdSecret', 'Your secret postcard')}</span>}
          {state === 'asked' && <span className="av-fd-badge" data-tone="ask">?</span>}
        </span>
        <span className="av-fd-face av-fd-back" aria-hidden="true">
          <span className="av-fd-stamp"><b>{t('ap.fdFound', 'FOUND')}</b><small>{card.place}</small></span>
          <span className="av-fd-stampline">{card.feeling}{card.chunk ? ` · ${card.chunk}` : ''}</span>
        </span>
      </span>
    </button>
  );
}
