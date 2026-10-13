import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCancelReschedule, CANCEL_POLICY_HOURS } from '../useCancelReschedule';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: vi.fn() } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
// Each key's English default, so the policy messages can be read without i18n set up.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, def?: string) => def ?? _key }),
}));

const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

describe('student cancellation policy: 8 hours', () => {
  it('uses 8 hours for cancelling', () => {
    expect(CANCEL_POLICY_HOURS).toBe(8);
  });

  it('lets a student cancel 9 hours before, but not 7 hours before', () => {
    const { result } = renderHook(() => useCancelReschedule());
    expect(result.current.canCancel(inHours(9))).toBe(true);
    expect(result.current.canCancel(inHours(7))).toBe(false);
  });

  it('refunds the credit at 9 hours and not at 7 hours', () => {
    const { result } = renderHook(() => useCancelReschedule());
    expect(result.current.getRefundInfo(inHours(9), 1).refundAmount).toBe(1);
    expect(result.current.getRefundInfo(inHours(7), 1).refundAmount).toBe(0);
    expect(result.current.getRefundInfo(inHours(7), 1).policyMessage).toMatch(/8 hours/);
  });

  it('trial lessons can always be cancelled', () => {
    const { result } = renderHook(() => useCancelReschedule());
    expect(result.current.canCancel(inHours(1), true)).toBe(true);
  });

  it('rescheduling still needs 5 days', () => {
    const { result } = renderHook(() => useCancelReschedule());
    expect(result.current.canReschedule(inHours(24))).toBe(false);
    expect(result.current.canReschedule(inHours(121))).toBe(true);
  });
});
