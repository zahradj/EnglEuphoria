/**
 * Teacher pay currency. Two kinds of teachers:
 *  - LOCAL teachers are paid in Algerian dinar (DZD)
 *  - INTERNATIONAL teachers are paid in euros (EUR)
 * Source of truth: teacher_profiles.payout_currency (admin-set in Teacher
 * Management > Compensation); every teacher_earnings row carries its own
 * `currency`. per_class_rate is in the teacher's payout currency.
 */
export type PayoutCurrency = 'DZD' | 'EUR';

export const TEACHER_KIND_LABEL: Record<PayoutCurrency, string> = {
  DZD: 'Local teacher (paid in DZD)',
  EUR: 'International teacher (paid in EUR)',
};

export function asPayoutCurrency(v: unknown): PayoutCurrency {
  return v === 'DZD' ? 'DZD' : 'EUR';
}

export function currencySymbol(c: PayoutCurrency): string {
  return c === 'DZD' ? 'DA' : '€';
}

/** "€4.00" / "1,250 DA" */
export function formatPay(amount: number | string | null | undefined, currency: PayoutCurrency): string {
  const n = Number(amount ?? 0);
  if (currency === 'DZD') {
    return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} DA`;
  }
  return `€${n.toFixed(2)}`;
}
