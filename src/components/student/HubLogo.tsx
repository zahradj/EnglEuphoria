import React from 'react';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';
import { useThemeMode } from '@/hooks/useThemeMode';

interface HubLogoProps {
  hubId: 'playground' | 'academy' | 'professional';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** When true, render only the circular icon (no wordmark / hub badge). */
  compact?: boolean;
}

const HUB_GRADIENTS: Record<string, { from: string; to: string }> = {
  playground: { from: '#FF9800', to: '#FFC107' },
  academy: { from: '#6B21A8', to: '#A855F7' },
  professional: { from: '#1B5E20', to: '#009688' },
};

const HUB_LABELS: Record<string, string> = {
  playground: 'Playground',
  academy: 'Academy',
  professional: 'Success Hub',
};

const SIZE_MAP = {
  sm: { box: 'w-8 h-8', img: 'w-8 h-8 p-0.5', text: 'text-lg', badge: 'text-[10px] px-1.5 py-0.5' },
  md: { box: 'w-9 h-9', img: 'w-9 h-9 p-0.5', text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
  lg: { box: 'w-11 h-11', img: 'w-11 h-11 p-1', text: 'text-2xl', badge: 'text-xs px-2 py-0.5' },
};

export const HubLogo: React.FC<HubLogoProps> = ({ hubId, size = 'md', className = '', compact = false }) => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const gradient = HUB_GRADIENTS[hubId];
  const s = SIZE_MAP[size];

  // Light mode → white logo (visible on colored gradient). Dark mode → black logo.
  const logoSrc = isDark ? logoBlack : logoWhite;
  const gradientCss = `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo icon with hub gradient background — matches homepage NavHeader pattern */}
      <div className={`relative ${s.box}`}>
        <div
          className="absolute inset-0 rounded-full opacity-90 blur-[1px]"
          style={{ background: gradientCss }}
        />
        <img
          src={logoSrc}
          alt="EnglEuphoria"
          className={`relative ${s.img} object-contain rounded-full`}
        />
      </div>

      {/* Brand text + hub badge — hidden in compact (collapsed-sidebar) mode */}
      {!compact && (
        <div className="flex flex-col">
          <span
            className={`${s.text} font-bold bg-clip-text text-transparent leading-tight`}
            style={{ backgroundImage: `linear-gradient(to right, ${gradient.from}, ${gradient.to})` }}
          >
            EnglEuphoria
          </span>
          <span
            className={`${s.badge} rounded-full font-semibold leading-none w-fit`}
            style={{
              background: isDark ? `${gradient.from}22` : `${gradient.from}18`,
              color: isDark ? gradient.to : gradient.from,
            }}
          >
            {HUB_LABELS[hubId]}
          </span>
        </div>
      )}
    </div>
  );
};
