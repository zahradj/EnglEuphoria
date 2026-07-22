import { Sparkles } from 'lucide-react';

/**
 * "Bonus Quest" chip shown on auto-assigned remedial rows in the
 * student's learning queue. Reuses the supportive emerald/amber framing
 * from ExtraPracticeCard — never reads as punishment.
 */
export default function BonusQuestBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-100 to-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-300/60 ${className}`}
    >
      <Sparkles className="h-3 w-3" />
      Bonus Quest
    </span>
  );
}
