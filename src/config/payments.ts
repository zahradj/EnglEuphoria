/**
 * How students pay for lessons — one switch for the whole app.
 *
 * Today (owner, 2026-10-07) parents pay the school DIRECTLY (bank/transfer/cash). The admin then
 * sets the student's credits in Admin → Students, and the balance shows on the student's
 * dashboard right away. Stripe checkout (create-pack-checkout → stripe-webhook → credit_purchases
 * → credits added automatically by pack size) is on by default (owner, 2026-10-07: "Buy online or
 * contact us to buy"), so every pack offers both. Set VITE_ONLINE_PAYMENTS=false to hide the online
 * button again and show only "Contact us to buy".
 */
export const ONLINE_PAYMENTS_ENABLED = import.meta.env.VITE_ONLINE_PAYMENTS !== 'false';

export const PAYMENT_CONTACT_EMAIL = 'support@engleuphoria.com';

/** mailto link a student/parent uses to ask for credits (pack name optional). */
export function contactToBuyHref(opts: { packName?: string; credits?: number; studentEmail?: string | null } = {}): string {
  const what = opts.packName
    ? `the ${opts.packName}${opts.credits ? ` (${opts.credits} credits)` : ''}`
    : 'more lesson credits';
  const subject = `I would like to buy ${what}`;
  const body = `Hello,\n\nI would like to buy ${what} for my lessons.${opts.studentEmail ? `\nStudent account: ${opts.studentEmail}` : ''}\n\nThank you!`;
  return `mailto:${PAYMENT_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
