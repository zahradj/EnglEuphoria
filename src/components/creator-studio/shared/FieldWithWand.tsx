import React from 'react';
import { WandFieldButton } from './WandFieldButton';
import type { LessonBlueprint } from './LessonBlueprintPanel';
import type { Hub } from './hubTheme';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  field: string;
  slideType?: string;
  hub: Hub;
  cefrLevel?: string;
  blueprint?: LessonBlueprint | null;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  inputClassName?: string;
}

const baseInput =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

export function FieldWithWand({
  label, value, onChange, field, slideType, hub, cefrLevel, blueprint,
  multiline, rows = 2, placeholder, inputClassName,
}: Props) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <WandFieldButton
          field={field}
          currentValue={value}
          slideType={slideType}
          hub={hub}
          cefrLevel={cefrLevel}
          blueprint={blueprint || undefined}
          onResult={onChange}
          title={`🔄 Rewrite ${label} with AI`}
        />
      </div>
      {multiline ? (
        <textarea
          className={`${baseInput} ${inputClassName || ''}`}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={`${baseInput} ${inputClassName || ''}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export default FieldWithWand;
