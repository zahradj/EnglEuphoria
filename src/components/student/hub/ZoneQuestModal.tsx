/**
 * ZoneQuestModal — opens above the dashboard when the student clicks a zone
 * (or their companion) on the Academy Galaxy. Shows zone progress, recent
 * "loot" from lessons, and any pending homework cards bound to the zone. The
 * student can play a homework game inline without leaving the dashboard.
 */
import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Loader2, Sparkles, Zap, ArrowLeft, ExternalLink, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZoneIcon } from './AcademyQuestMap';
import { useAuth } from '@/contexts/AuthContext';
import {
  listAssignments,
  recordPlay,
  recordCompletion,
  type StudentGameWithProgress,
} from '@/services/studentGames';
import { zoneForTags, type AcademyZone } from '@/hooks/academy/useAcademyZones';
import { openStudentTab } from '@/lib/studentTabRouter';

const GamePlayer = lazy(() => import('@/components/games/GamePlayer'));

interface Props {
  open: boolean;
  onClose: () => void;
  zone: AcademyZone | null;
  /** Visual theme for the zone — supplied by the map */
  theme: { gradient: string; ring: string };
}

export const ZoneQuestModal: React.FC<Props> = ({ open, onClose, zone, theme }) => {
  const { user } = useAuth();
  const [homework, setHomework] = useState<StudentGameWithProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<StudentGameWithProgress | null>(null);

  useEffect(() => {
    if (!open || !user?.id || !zone) return;
    let cancel = false;
    setLoading(true);
    setActive(null);
    listAssignments({ userId: user.id })
      .then((rows) => {
        if (cancel) return;
        const mine = rows.filter((g) => zoneForTags(g.tags, g.game_type) === zone.id);
        setHomework(mine);
      })
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, [open, user?.id, zone?.id]);

  const pending = useMemo(
    () => homework.filter((g) => g.progress?.status !== 'completed'),
    [homework],
  );

  if (!zone) return null;
  const pct = Math.round(zone.progress * 100);

  async function play(g: StudentGameWithProgress) {
    if (!user?.id) return;
    await recordPlay(user.id, g.id);
    setActive(g);
  }
  async function finish() {
    if (!user?.id || !active) return;
    await recordCompletion(user.id, active);
    const rows = await listAssignments({ userId: user.id });
    setHomework(rows.filter((g) => zoneForTags(g.tags, g.game_type) === zone!.id));
    setActive(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="rounded-3xl overflow-hidden bg-card border border-border/60 shadow-2xl">
          {/* Banner */}
          <div className={cn('relative px-6 py-5 text-white bg-gradient-to-br', theme.gradient)}>
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5), transparent 60%)' }} />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center p-3 text-white">
                <ZoneIcon id={zone.id} color="#FFFFFF" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-widest opacity-80 font-bold">Academy Zone</div>
                <h2 className="text-2xl font-black leading-tight">{zone.name}</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tabular-nums drop-shadow">{pct}%</div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">Mastery</div>
              </div>
            </div>
            {/* progress bar */}
            <div className="relative mt-4 h-2 rounded-full bg-black/25 overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-white/90 transition-all"
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {active ? (
              <div className="space-y-3">
                <Button variant="ghost" size="sm" onClick={() => setActive(null)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to {zone.short}
                </Button>
                <div className="rounded-2xl border bg-card p-3 sm:p-4">
                  <Suspense fallback={
                    <div className="p-10 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin inline" />
                    </div>
                  }>
                    <GamePlayer gameId={active.id} onComplete={finish} />
                  </Suspense>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Loot */}
                <section>
                  <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> From your last lessons
                  </div>
                  {zone.recentItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {zone.recentItems.map((it, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-sm font-medium">
                          🎁 {it}
                        </span>
                      ))}
                      {zone.recentCount > zone.recentItems.length && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{zone.recentCount - zone.recentItems.length} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Complete a lesson to unlock new items in {zone.short}.
                    </p>
                  )}
                </section>

                {/* Homework quests */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                      <Trophy className="w-3.5 h-3.5" /> Active quests
                    </div>
                    {pending.length > 0 && (
                      <Badge variant="secondary" className="font-bold">{pending.length} pending</Badge>
                    )}
                  </div>
                  {loading ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
                    </div>
                  ) : homework.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No quests assigned for this zone yet. Keep training!
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {homework.map((g) => {
                        const done = g.progress?.status === 'completed';
                        return (
                          <button
                            key={g.id}
                            onClick={() => play(g)}
                            className={cn(
                              'group text-left rounded-2xl border bg-card p-3 ring-1 ring-border/60 hover:-translate-y-0.5 hover:shadow-md transition',
                              done && 'opacity-70',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn('w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 bg-gradient-to-br', theme.gradient)}>
                                <Gamepad2 className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm leading-tight truncate">{g.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                  {g.description || g.game_type}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{g.level}</Badge>
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                    <Zap className="w-3 h-3" /> {g.xp_reward}
                                  </span>
                                  {done && (
                                    <Badge className="text-[10px] px-1.5 py-0 bg-emerald-600 text-white">Done</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Footer actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                  <Button
                    size="sm"
                    className={cn('text-white gap-2 bg-gradient-to-r', theme.gradient)}
                    onClick={() => {
                      openStudentTab({
                        tab: zone.tab,
                        params: zone.tab === 'homework' ? { zone: zone.id } : {},
                      });
                      onClose();
                    }}
                  >
                    Open full {zone.short} <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZoneQuestModal;
