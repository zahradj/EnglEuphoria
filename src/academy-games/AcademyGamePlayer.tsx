import { Suspense, lazy, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import { getAcademyGame } from './academyGamesCatalog';

/** One lazy component per Academy game id (the data lives in academyGamesCatalog.ts). */
const PLAYERS: Record<string, ComponentType<{ onBack?: () => void }>> = {
  'verb-forge': lazy(() => import('./verbForge/VerbForgeGame')),
};

export function AcademyGamePlayer({ gameId, onBack }: { gameId: string; onBack?: () => void }) {
  const game = getAcademyGame(gameId);
  const Player = PLAYERS[gameId];
  if (!game || !Player) return <p className="p-6 text-center font-bold">This game isn’t available.</p>;
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <Player onBack={onBack} />
    </Suspense>
  );
}
