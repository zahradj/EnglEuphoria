/**
 * CurrencySwitcher — compact dropdown letting any user override the
 * auto-detected display currency. Persisted across sessions.
 */
import { useCurrency } from '@/contexts/CurrencyContext';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

const ORDER: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'TRY', 'AED', 'SAR', 'DZD', 'MAD', 'EGP'];

export function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const meta = CURRENCIES[currency];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? 'sm' : 'default'} className="gap-2">
          <Coins className="w-4 h-4 opacity-70" />
          <span className="font-semibold">{meta.code}</span>
          <span className="opacity-60">{meta.symbol}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Display currency</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ORDER.map((code) => {
          const m = CURRENCIES[code];
          return (
            <DropdownMenuItem
              key={code}
              onSelect={() => setCurrency(code)}
              className={code === currency ? 'bg-accent' : ''}
            >
              <span className="mr-2">{m.flag}</span>
              <span className="font-medium mr-1">{m.code}</span>
              <span className="text-muted-foreground text-xs">{m.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
