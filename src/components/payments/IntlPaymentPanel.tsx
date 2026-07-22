/**
 * International (INTL) checkout panel — Stripe / PayPal / cards.
 */
export const IntlPaymentPanel = ({ amountEur }: { amountEur: number }) => {
  return (
    <div className="rounded-2xl border border-purple-300/40 bg-purple-50/60 p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Pay in EUR</h3>
        <p className="text-sm text-muted-foreground">Cards, Stripe, PayPal</p>
      </div>
      <div className="text-3xl font-bold">€{amountEur}</div>
      <div className="space-y-2">
        <button className="w-full rounded-xl border border-purple-400 bg-white py-3 font-medium hover:bg-purple-50">
          Pay with card (Stripe)
        </button>
        <button className="w-full rounded-xl border border-purple-400 bg-white py-3 font-medium hover:bg-purple-50">
          PayPal
        </button>
      </div>
    </div>
  );
};
