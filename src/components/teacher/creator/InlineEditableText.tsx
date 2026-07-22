import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface InlineEditableTextProps {
  value: string;
  onChange: (next: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  /** Optional label for screen readers / aria */
  ariaLabel?: string;
}

/**
 * Click-to-edit text. Renders as plain text until clicked,
 * then becomes an input / textarea. Blurs commit the change.
 * Used in the Notion-style block editor — no raw JSON exposed.
 */
export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onChange,
  multiline = false,
  placeholder = 'Click to edit…',
  className,
  ariaLabel,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      if ('select' in ref.current) ref.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={ariaLabel ?? 'Edit text'}
        className={cn(
          'block w-full text-left rounded-md px-2 py-1 -mx-2 transition-colors',
          'hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40',
          !value && 'text-muted-foreground italic',
          className,
        )}
      >
        {value || placeholder}
      </button>
    );
  }

  const shared = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraft(value);
        setEditing(false);
      } else if (e.key === 'Enter' && !multiline) {
        e.preventDefault();
        commit();
      }
    },
    className: cn(
      'w-full rounded-md border border-primary/40 bg-background px-2 py-1',
      'focus:outline-none focus:ring-2 focus:ring-primary/60',
      className,
    ),
    'aria-label': ariaLabel,
  };

  return multiline ? (
    <textarea ref={ref as React.RefObject<HTMLTextAreaElement>} rows={3} {...shared} />
  ) : (
    <input ref={ref as React.RefObject<HTMLInputElement>} type="text" {...shared} />
  );
};

export default InlineEditableText;
