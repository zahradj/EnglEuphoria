import React from 'react';
import { getSlideTypeMeta } from './slideTypeMeta';

interface Props {
  slideType?: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Pill-shaped badge that visually identifies a slide_type in the
 * Lesson Blueprint preview so teachers can see at-a-glance what
 * gamified activity the AI queued up.
 */
export const SlideTypeBadge: React.FC<Props> = ({ slideType, className = '', compact = false }) => {
  const meta = getSlideTypeMeta(slideType);
  const Icon = meta.icon;
  return (
    <span
      title={slideType ?? undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${meta.tone} ${className}`}
    >
      <Icon className="w-3 h-3" aria-hidden />
      {!compact && meta.label}
    </span>
  );
};
