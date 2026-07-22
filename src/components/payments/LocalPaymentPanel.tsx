/**
 * Algerian (DZ) checkout panel — local payment methods only.
 * Provider integrations (CIB, Edahabia, BaridiMob) are wired in a follow-up.
 */
export const LocalPaymentPanel = ({ amountDzd }: { amountDzd: number }) => {
  return (
    <div className="rounded-2xl border border-orange-300/40 bg-orange-50/60 p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Pay in DZD</h3>
        <p className="text-sm text-muted-foreground">Local Algerian payment methods</p>
      </div>
      <div className="text-3xl font-bold">{new Intl.NumberFormat('fr-DZ').format(amountDzd)} DA</div>
      <div className="space-y-2">
        <button className="w-full rounded-xl border border-orange-400 bg-white py-3 font-medium hover:bg-orange-50">
          CIB / Edahabia card
        </button>
        <button className="w-full rounded-xl border border-orange-400 bg-white py-3 font-medium hover:bg-orange-50">
          BaridiMob
        </button>
        <button className="w-full rounded-xl border border-orange-400 bg-white py-3 font-medium hover:bg-orange-50">
          Bank transfer (CCP)
        </button>
      </div>
    </div>
  );
};
