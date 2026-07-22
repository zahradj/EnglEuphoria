/**
 * Region switcher dropdown. Drop into any header. Switches region, persists
 * choice, syncs i18n + <html dir/lang>, and rewrites the URL with the new
 * locale prefix (or removes the prefix for INTL).
 */
import { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { REGION_CONFIG, MarketRegion } from '@/lib/marketRegion';
import { cn } from '@/lib/utils';

const ORDER: MarketRegion[] = ['INTL', 'TR', 'ES', 'FR', 'AR', 'DZ'];

export const RegionSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { region, config, switchRegion } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-accent',
          compact && 'px-2 py-1',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change region"
      >
        <Globe className="h-4 w-4" />
        <span aria-hidden>{config.flag}</span>
        {!compact && <span>{config.label}</span>}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
          >
            {ORDER.map((code) => {
              const c = REGION_CONFIG[code];
              const active = code === region;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      switchRegion(code);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-accent',
                      active && 'bg-accent/60 font-semibold',
                    )}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden className="text-lg leading-none">{c.flag}</span>
                      <span>
                        <span className="block">{c.label}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {c.language.toUpperCase()} · {c.currency}
                        </span>
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
