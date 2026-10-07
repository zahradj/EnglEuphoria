import { describe, it, expect, beforeEach } from 'vitest';
import { captureReferralCode, clearStoredReferralCode, getStoredReferralCode, isValidReferralCode } from './referralCode';

beforeEach(() => { localStorage.clear(); });

describe('referral link code', () => {
  it('keeps a valid ?ref= code (lower-cased)', () => {
    captureReferralCode('?ref=AbC12345');
    expect(getStoredReferralCode()).toBe('abc12345');
  });

  it('ignores junk and keeps the earlier code', () => {
    captureReferralCode('?ref=abc12345');
    captureReferralCode('?ref=<script>');
    captureReferralCode('?other=1');
    expect(getStoredReferralCode()).toBe('abc12345');
  });

  it('forgets an expired code', () => {
    localStorage.setItem('engl_ref_code', JSON.stringify({ code: 'abc12345', at: Date.now() - 31 * 24 * 60 * 60 * 1000 }));
    expect(getStoredReferralCode()).toBeNull();
  });

  it('can be cleared; short codes are not valid', () => {
    captureReferralCode('?ref=abc12345');
    clearStoredReferralCode();
    expect(getStoredReferralCode()).toBeNull();
    expect(isValidReferralCode('ab')).toBe(false);
    expect(isValidReferralCode('a1b2c3d4')).toBe(true);
  });
});
