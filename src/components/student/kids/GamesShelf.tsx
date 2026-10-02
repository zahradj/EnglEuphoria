import { useNavigate } from 'react-router-dom';
import { GamesGrid } from '@/components/games/GamesGrid';

/**
 * "My Games" shelf on the Playground (kids) dashboard: the Alphabet Express
 * with the student's stars so far, and a button to jump back in.
 */
export function GamesShelf() {
  const navigate = useNavigate();
  return (
    <section dir="ltr" aria-label="My Games" className="rounded-3xl border border-orange-200/70 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-md sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-orange-900" style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>🎮 My Games</h2>
          <p className="text-xs font-semibold text-orange-700/70">Play and earn stars — they help you practise letters and sounds!</p>
        </div>
        <button onClick={() => navigate('/dashboard/games')} className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 transition hover:scale-105 active:scale-95">
          Open →
        </button>
      </div>
      <GamesGrid compact onPlay={(id) => navigate(`/dashboard/games/${id}`)} />
    </section>
  );
}

export default GamesShelf;
