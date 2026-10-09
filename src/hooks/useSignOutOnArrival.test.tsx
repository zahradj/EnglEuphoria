import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const signOut = vi.hoisted(() => vi.fn(() => Promise.resolve({ error: null })));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { signOut } } }));

import { useSignOutOnArrival } from './useSignOutOnArrival';

type P = { user: unknown; loading: boolean };

describe('sign-up pages start clean, but never sign out the account they just created', () => {
  beforeEach(() => signOut.mockClear());

  it('signs out someone who ARRIVES signed in (once auth has loaded)', () => {
    const { rerender } = renderHook(({ user, loading }: P) => useSignOutOnArrival(user, loading), {
      initialProps: { user: { id: 'old' }, loading: true } as P,
    });
    expect(signOut).not.toHaveBeenCalled(); // still loading: wait
    rerender({ user: { id: 'old' }, loading: false });
    expect(signOut).toHaveBeenCalledTimes(1);
    rerender({ user: { id: 'old' }, loading: false });
    expect(signOut).toHaveBeenCalledTimes(1); // only once
  });

  it('REGRESSION: the parent account created on this page is NOT signed out (children could not be added: "Invalid session")', () => {
    const { rerender } = renderHook(({ user, loading }: P) => useSignOutOnArrival(user, loading), {
      initialProps: { user: null, loading: true } as P,
    });
    rerender({ user: null, loading: false });          // arrived signed out
    rerender({ user: { id: 'new-parent' }, loading: false }); // sign-up succeeded -> user appears
    expect(signOut).not.toHaveBeenCalled();
  });
});
