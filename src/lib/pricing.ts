import { MARKET_META, MarketRegion } from './marketRegion';

export interface TeacherRateRow {
  hourly_rate_dzd?: number | null;
  hourly_rate_eur?: number | null;
}

export function getTeacherRate(teacher: TeacherRateRow, region: MarketRegion): number | null {
  if (region === 'DZ') return teacher.hourly_rate_dzd ?? null;
  return teacher.hourly_rate_eur ?? null;
}

export function formatPrice(amount: number | null | undefined, region: MarketRegion): string {
  if (amount == null) return '—';
  const meta = MARKET_META[region];
  if (region === 'DZ') {
    return `${new Intl.NumberFormat(meta.locale).format(amount)} ${meta.symbol}`;
  }
  return `${meta.symbol}${amount}`;
}
