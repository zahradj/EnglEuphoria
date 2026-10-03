import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { HUB_BRAND, type HubType } from '@/lib/hubAssignment';
import { getCompanionById, getDefaultCompanionForHub } from '@/constants/companions';
import { FamilyError, listFamily, setFamilyPin, switchProfile, type FamilyProfile } from '@/lib/familyProfiles';
import { PinDialog } from './PinDialog';

function Avatar({ profile }: { profile: FamilyProfile }) {
  const hub = (profile.hub === 'academy' ? 'academy' : 'playground') as 'playground' | 'academy';
  const companion = getCompanionById(profile.companionId) ?? getDefaultCompanionForHub(hub);
  const hasArt = !companion.avatar_url.includes('placeholder');
  const brand = HUB_BRAND[profile.hub as HubType] ?? HUB_BRAND.playground;

  return hasArt ? (
    <img src={companion.avatar_url} alt="" className="h-20 w-20 object-contain" />
  ) : (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
      style={{ background: brand.primary }}
      aria-hidden
    >
      {profile.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

/**
 * "Who's learning today?" - every managed child in the family plus, when a child is signed in, a
 * PIN-protected way back to the parent. Used by the full-page picker and the in-lesson switch dialog.
 */
export function FamilyProfilePicker() {
  const { toast } = useToast();
  const [switching, setSwitching] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pendingChild, setPendingChild] = useState<FamilyProfile | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['family-profiles'],
    queryFn: listFamily,
    staleTime: 0,
  });

  const go = (route: string) => window.location.assign(route);

  const pickChild = async (profile: FamilyProfile, pinJustSet = false) => {
    if (switching) return;
    if (data?.role === 'parent' && !data.hasPin && !pinJustSet) {
      setPendingChild(profile);
      return;
    }
    setSwitching(profile.id);
    try {
      go(await switchProfile(profile.id));
    } catch (e: any) {
      toast({ title: 'Couldn’t switch profile', description: e?.message, variant: 'destructive' });
      setSwitching(null);
    }
  };

  const unlockParent = async (pin: string) => {
    try {
      go(await switchProfile('parent', pin));
    } catch (e) {
      // PinDialog shows the message; add the tries hint when the server sent one.
      if (e instanceof FamilyError && e.triesLeft !== undefined && e.triesLeft > 0) {
        throw new FamilyError(`${e.message} ${e.triesLeft} ${e.triesLeft === 1 ? 'try' : 'tries'} left.`);
      }
      throw e;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-center text-sm text-destructive">{(error as Error)?.message ?? 'Couldn’t load your family.'}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {data.profiles.map((p) => {
          const brand = HUB_BRAND[p.hub as HubType] ?? HUB_BRAND.playground;
          const isSelf = p.id === data.selfId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => (isSelf ? go('/dashboard') : pickChild(p))}
              disabled={!!switching}
              className="relative flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
              style={{ borderColor: `${brand.primary}55` }}
            >
              <Avatar profile={p} />
              <span className="text-lg font-semibold">{p.name}</span>
              <span className="text-xs text-muted-foreground">{brand.emoji} {brand.label}{isSelf ? ' · you' : ''}</span>
              {switching === p.id && (
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </span>
              )}
            </button>
          );
        })}

        {data.role === 'child' && (
          <button
            type="button"
            onClick={() => setPinOpen(true)}
            disabled={!!switching}
            className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/30 p-4 transition hover:bg-muted/60"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-muted"><Lock className="h-8 w-8" /></span>
            <span className="text-lg font-semibold">Parent</span>
            <span className="text-xs text-muted-foreground">Needs the family PIN</span>
          </button>
        )}
      </div>

      {data.profiles.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">No children yet. Add one from your dashboard.</p>
      )}

      {/* A parent must have a PIN before entering a child's space, or the child could never hand back. */}
      <PinDialog
        open={!!pendingChild}
        onOpenChange={(o) => !o && setPendingChild(null)}
        title="Create a family PIN"
        description="Choose a 4-digit PIN. Your children will need it to get back to your parent account."
        submitLabel="Save PIN and continue"
        onSubmit={async (pin) => {
          await setFamilyPin(pin);
          const child = pendingChild;
          setPendingChild(null);
          if (child) await pickChild(child, true);
        }}
      />

      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        title="Parent PIN"
        description="Ask a grown-up to enter the 4-digit family PIN."
        submitLabel="Unlock"
        onSubmit={unlockParent}
      />
    </>
  );
}
