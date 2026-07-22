import React from 'react';
import { Logo } from '@/components/Logo';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import type { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';

interface SlideBrandHeaderProps {
  hub: HubType;
  /** Override label. Defaults to "<Hub> Topic Card". */
  label?: string;
}

const HUB_LABEL: Record<HubType, string> = {
  playground: 'Playground',
  academy: 'Academy',
  professional: 'Success Hub',
};

/**
 * Branded strip rendered at the top of classroom slides.
 * Left: hub-coloured pill badge identifying the slide context.
 * Right: Engleuphoria wordmark.
 */
export const SlideBrandHeader: React.FC<SlideBrandHeaderProps> = ({ hub, label }) => {
  const config = HUB_CONFIGS[hub];
  const resolvedLabel = label || `${HUB_LABEL[hub]} Topic Card`;
  return (
    <div className="w-full flex items-center justify-between px-2 pt-1 pb-3">
      <span
        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm"
        style={{ backgroundColor: config.colorPalette.primary }}
      >
        {resolvedLabel}
      </span>
      <Logo size="small" className="pointer-events-none" />
    </div>
  );
};

export default SlideBrandHeader;
