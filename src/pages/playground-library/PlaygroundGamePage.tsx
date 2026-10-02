import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GamePlayerView } from '@/components/games/GamePlayerView';

/**
 * One Playground game, full page. Public (no account needed) like the public
 * library mirror: the games hold no student data, and progress is stored only
 * in the visitor's own browser.
 * Route: /library/playground/games/:gameId
 */
export default function PlaygroundGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/library/playground?section=games';
  return (
    <div dir="ltr" className="min-h-screen w-full" style={{ background: 'linear-gradient(180deg,#FFF8E7 0%,#FFF1D6 100%)' }}>
      <GamePlayerView
        gameId={gameId}
        onBack={() => navigate(from)}
        onPlay={(id) => navigate(`/library/playground/games/${id}`, { state: { from } })}
      />
    </div>
  );
}
