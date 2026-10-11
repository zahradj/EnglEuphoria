import { Minus, Plus, Calendar, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AuthField } from '@/components/auth/authUi';
import { supabase } from '@/integrations/supabase/client';
import { assignHubFromAge, calculateAgeFromDob, HUB_BRAND } from '@/lib/hubAssignment';
import { getCompanionsForHub, getDefaultCompanionForHub } from '@/constants/companions';

export const MAX_FAMILY_CHILDREN = 8;
export const MIN_CHILD_AGE = 4;
// Adults can be added too (a parent learning alongside their children): they get a Success Hub space.
export const MAX_CHILD_AGE = 90;

export interface ChildDraft {
  fullName: string;
  dateOfBirth: string;
  companionId: string | null;
}

export const emptyChild = (): ChildDraft => ({ fullName: '', dateOfBirth: '', companionId: null });

export function childAge(c: ChildDraft): number {
  return c.dateOfBirth ? calculateAgeFromDob(c.dateOfBirth) : 0;
}

export function isChildValid(c: ChildDraft): boolean {
  const age = childAge(c);
  return c.fullName.trim().length >= 1 && age >= MIN_CHILD_AGE && age <= MAX_CHILD_AGE;
}

/** Creates the managed child profiles on the server and links them, approved, to the signed-in parent. */
export async function createFamilyChildren(children: ChildDraft[], relationshipType = 'guardian') {
  const { data, error } = await supabase.functions.invoke('create-family-children', {
    body: {
      relationshipType,
      children: children.map((c) => {
        const age = childAge(c);
        return {
          fullName: c.fullName.trim(),
          dateOfBirth: c.dateOfBirth,
          // Default companion = first one for the child's hub, so the picker always has a face.
          // Adults have no cartoon buddy; their card shows their initial.
          companionId: age >= 18 ? null : (c.companionId ?? getDefaultCompanionForHub(assignHubFromAge(age).hub_type).id),
        };
      }),
    },
  });
  // supabase-js puts non-2xx bodies behind error.context; surface the function's own message.
  if (error) {
    let message = error.message;
    try {
      const body = await (error as any).context?.json?.();
      if (body?.error) message = body.error;
    } catch { /* keep generic message */ }
    return { error: new Error(message) };
  }
  if (data?.error) return { error: new Error(data.error) };
  return { error: null as Error | null, children: data?.children as { id: string; fullName: string }[] };
}

interface Props {
  value: ChildDraft[];
  onChange: (next: ChildDraft[]) => void;
  /** How many more children can be added (family cap minus existing). */
  maxCount?: number;
  disabled?: boolean;
}

export function FamilyChildrenForm({ value, onChange, maxCount = MAX_FAMILY_CHILDREN, disabled }: Props) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);

  const setCount = (n: number) => {
    const clamped = Math.max(1, Math.min(maxCount, n));
    if (clamped > value.length) onChange([...value, ...Array.from({ length: clamped - value.length }, emptyChild)]);
    else onChange(value.slice(0, clamped));
  };

  const patch = (i: number, p: Partial<ChildDraft>) =>
    onChange(value.map((c, idx) => (idx === i ? { ...c, ...p } : c)));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
        <p className="text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">{t('au.fam.howMany', 'How many people are learning?')} <span className="font-normal text-slate-500">{t('au.fam.childrenOrAdults', '(children or adults)')}</span></p>
        <div className="mt-3 flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full"
            onClick={() => setCount(value.length - 1)}
            disabled={disabled || value.length <= 1}
            aria-label={t('au.fam.fewer', 'Fewer people')}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-3xl font-bold tabular-nums" aria-live="polite">{value.length}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full"
            onClick={() => setCount(value.length + 1)}
            disabled={disabled || value.length >= maxCount}
            aria-label={t('au.fam.more', 'More people')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {value.map((child, i) => {
        const age = childAge(child);
        const inRange = age >= MIN_CHILD_AGE && age <= MAX_CHILD_AGE;
        const hub = inRange ? assignHubFromAge(age).hub_type : null;
        const companions = hub ? getCompanionsForHub(hub) : [];
        const selectedCompanion = child.companionId ?? (hub ? getDefaultCompanionForHub(hub).id : null);

        return (
          <div key={i} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{t('au.fam.learnerN', { n: i + 1, defaultValue: 'Learner {{n}}' })}</p>

            <AuthField
              label={t('au.fam.firstName', 'First name')}
              icon={UserIcon}
              value={child.fullName}
              onChange={(e) => patch(i, { fullName: e.target.value })}
              placeholder={t('au.fam.firstName', 'First name')}
              maxLength={80}
              disabled={disabled}
            />

            <div className="space-y-1.5">
              <AuthField
                label={t('au.dob', 'Date of birth')}
                icon={Calendar}
                type="date"
                value={child.dateOfBirth}
                max={today}
                onChange={(e) => patch(i, { dateOfBirth: e.target.value, companionId: null })}
                disabled={disabled}
                error={child.dateOfBirth && !inRange ? t('au.fam.ageRange', { min: MIN_CHILD_AGE, max: MAX_CHILD_AGE, defaultValue: 'Learners must be {{min}}–{{max}} years old.' }) : null}
              />
              {hub && (
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {HUB_BRAND[hub].emoji} {t('au.fam.joins', { hub: HUB_BRAND[hub].label, defaultValue: 'Joins the {{hub}}' })}
                </p>
              )}
              {hub === 'professional' && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('au.fam.adultNote', 'An adult learner. You manage this profile from your dashboard, so please make sure they are happy to be added.')}
                </p>
              )}
            </div>

            {companions.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">{t('au.fam.pickBuddy', 'Pick a learning buddy')}</p>
                <div className="flex flex-wrap gap-2">
                  {companions.map((c) => {
                    const active = selectedCompanion === c.id;
                    const hasArt = !c.avatar_url.includes('placeholder');
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => patch(i, { companionId: c.id })}
                        aria-pressed={active}
                        className={`flex min-h-[44px] items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-sm transition-colors ${
                          active ? 'border-[var(--auth-accent,#6366f1)] bg-[var(--auth-accent-soft,#6366f12e)] font-semibold' : 'border-slate-200 bg-slate-50/70 hover:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                        }`}
                      >
                        {hasArt && <img src={c.avatar_url} alt="" className="h-8 w-8" />}
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
