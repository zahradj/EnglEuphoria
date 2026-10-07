/**
 * Referral link plumbing. A student shares /student-signup?ref=<code>. The code is remembered in the
 * browser for 30 days (so it survives the email-confirmation step), sent with the sign-up, and
 * claimed once the new student is signed in (the claim_referral database function checks it).
 */
const KEY = 'engl_ref_code';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const CODE_RE = /^[a-z0-9]{4,16}$/i;

export function isValidReferralCode(code: string | null | undefined): code is string {
  return !!code && CODE_RE.test(code.trim());
}

/** Saves ?ref=<code> from the address bar, if there is a valid one. */
export function captureReferralCode(search: string = window.location.search): void {
  try {
    const code = new URLSearchParams(search).get('ref')?.trim();
    if (!isValidReferralCode(code)) return;
    localStorage.setItem(KEY, JSON.stringify({ code: code.toLowerCase(), at: Date.now() }));
  } catch { /* storage can be unavailable */ }
}

export function getStoredReferralCode(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { code, at } = JSON.parse(raw) as { code?: string; at?: number };
    if (!isValidReferralCode(code) || !at || Date.now() - at > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return code;
  } catch {
    return null;
  }
}

export function clearStoredReferralCode(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
