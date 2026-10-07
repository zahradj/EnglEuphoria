import { Users } from 'lucide-react';

/** Small note for learners inside a family account: lessons are bought from the family dashboard. */
export function FamilyBuyNote({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-xs text-muted-foreground ${className}`} data-family-buy-note>
      <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>Part of a family account: your parent can buy lessons from the family dashboard.</span>
    </p>
  );
}
