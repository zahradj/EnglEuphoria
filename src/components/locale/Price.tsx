/**
 * <Price /> — render a USD-base amount in the user's active currency.
 *
 * Usage:  <Price usd={25} />
 *         <Price usd={25} showUsdHint />       → "3,500 DZD (~$25)"
 *         <Price usd={25} className="font-bold" />
 */
import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceProps {
  usd: number;
  showUsdHint?: boolean;
  className?: string;
}

export function Price({ usd, showUsdHint, className }: PriceProps) {
  const { format, formatWithUsdHint, currency } = useCurrency();
  const text = showUsdHint && currency !== 'USD' ? formatWithUsdHint(usd) : format(usd);
  return <span className={className} data-base-usd={usd} data-currency={currency}>{text}</span>;
}
