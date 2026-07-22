import { useEffect, useState, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, Zap, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  listAssignments,
  recordPlay,
  recordCompletion,
  type StudentGameWithProgress,
} from '@/services/studentGames';

const GamePlayer = lazy(() => import('@/components/games/GamePlayer'));

interface Props {
  bookingId: string;
}

/**
 * Compact right-rail panel that lists games assigned to the current classroom
 * booking. Launches the same GamePlayer in a modal-style overlay.
 */
export function ClassroomGamesPanel({ bookingId }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<StudentGameWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<StudentGameWithProgress | null>(null);

  useEffect(() => {
    if (!user?.id || !bookingId) return;
    let cancel = false;
    setLoading(true);
    listAssignments({ userId: user.id, bookingId }).then((rows) => {
      if (cancel) return;
      setItems(rows);
      setLoading(false);
    });
    return () => { cancel = true; };
  }, [user?.id, bookingId]);

  async function startPlay(g: StudentGameWithProgress) {
    if (!user?.id) return;
    await recordPlay(user.id, g.id);
    setActive(g);
  }

  async function handleComplete() {
    if (!user?.id || !active) return;
    await recordCompletion(user.id, active);
  }

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10 p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
          <Gamepad2 className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-bold text-sm tracking-tight">Classroom Games</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto font-bold">{items.length}</Badge>
      </div>

      {loading ? (
        <div className="py-6 text-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline" /></div>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center italic">No games assigned yet ✨</p>
      ) : (
        <ul className="space-y-2">
          {items.map((g) => (
            <li key={g.id}>
              <button
                onClick={() => startPlay(g)}
                className="group w-full text-left rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 p-3 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">{g.title}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 shrink-0">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" /> {g.xp_reward}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">{g.level}</Badge>
                  {g.progress?.status === 'completed' && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500 hover:bg-emerald-500 text-white font-bold">✓ Done</Badge>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {active && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-3xl border-2 bg-card p-6 shadow-2xl animate-scale-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setActive(null)}
              aria-label="Close game"
            >
              <X className="w-5 h-5" />
            </Button>
            <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>}>
              <GamePlayer gameId={active.id} onComplete={handleComplete} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassroomGamesPanel;
