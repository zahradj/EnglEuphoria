import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GamesGrid } from '@/components/games/GamesGrid';
import { GamePlayerView } from '@/components/games/GamePlayerView';

/**
 * The student's own games page.
 *   /dashboard/games            -> all Playground games
 *   /dashboard/games/:gameId    -> play one
 * Students reach it from the "My Games" shelf on the Playground dashboard.
 */
export default function StudentGamesPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  return (
    <div dir="ltr" className="min-h-dvh w-full" style={{ background: 'linear-gradient(180deg,#FFF8E7 0%,#FFF1D6 100%)' }}>
      {gameId ? (
        <GamePlayerView gameId={gameId} onBack={() => navigate('/dashboard/games')} onPlay={(id) => navigate(`/dashboard/games/${id}`)} />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 transition hover:scale-105 active:scale-95">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-black text-orange-900" style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>🎮 My Games</h1>
              <p className="text-sm font-semibold text-orange-700/70">Play, earn stars, and beat your best score!</p>
            </div>
          </div>
          <GamesGrid onPlay={(id) => navigate(`/dashboard/games/${id}`)} />
        </div>
      )}
    </div>
  );
}
