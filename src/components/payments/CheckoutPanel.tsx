import { useMarketRegion } from '@/contexts/MarketRegionContext';
import { LocalPaymentPanel } from './LocalPaymentPanel';
import { IntlPaymentPanel } from './IntlPaymentPanel';

interface Props {
  amountDzd?: number | null;
  amountEur?: number | null;
}

/**
 * Renders the correct payment UI for the user's market.
 * DZ users only see local methods; INTL users only see Stripe/PayPal.
 */
export const CheckoutPanel = ({ amountDzd, amountEur }: Props) => {
  const { region } = useMarketRegion();
  if (region === 'DZ') return <LocalPaymentPanel amountDzd={amountDzd ?? 0} />;
  return <IntlPaymentPanel amountEur={amountEur ?? 0} />;
};
