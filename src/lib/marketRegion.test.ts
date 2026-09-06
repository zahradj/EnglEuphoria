// Regression test for a real production bug: users.market_region is a
// Postgres enum with only 'DZ' | 'INTL', but MarketRegion (this file) has
// six values — TR/ES/AR/FR were added later for the adaptive
// globalization layer and never migrated into the DB enum. Writing
// detectMarketRegion()'s raw result straight into a market_region column
// silently failed the insert for any TR/ES/AR/FR-resolved user, breaking
// account creation with no visible error anywhere. toDbMarketRegion()
// exists specifically to prevent that regressing.
import { describe, test, expect } from 'vitest';
import { toDbMarketRegion, type MarketRegion } from './marketRegion';

describe('toDbMarketRegion', () => {
  test('passes DZ through unchanged', () => {
    expect(toDbMarketRegion('DZ')).toBe('DZ');
  });

  test('passes INTL through unchanged', () => {
    expect(toDbMarketRegion('INTL')).toBe('INTL');
  });

  test.each<MarketRegion>(['TR', 'ES', 'AR', 'FR'])(
    'clamps %s (not a valid DB enum value) down to INTL',
    (region) => {
      expect(toDbMarketRegion(region)).toBe('INTL');
    },
  );

  test('every possible MarketRegion value maps to a value the DB enum actually accepts', () => {
    const allRegions: MarketRegion[] = ['INTL', 'DZ', 'TR', 'ES', 'AR', 'FR'];
    const dbAcceptedValues = new Set(['DZ', 'INTL']);
    for (const region of allRegions) {
      expect(dbAcceptedValues.has(toDbMarketRegion(region))).toBe(true);
    }
  });
});
