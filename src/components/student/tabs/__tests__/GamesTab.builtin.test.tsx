import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// A Playground student whose database game library is EMPTY (the real-world case that
// showed "No games yet"). The built-in Alphabet Express must still be in the tab.
let hub: 'playground' | 'academy' | 'success' = 'playground';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'student-1' } }) }));
vi.mock('@/hooks/useStudentLevel', () => ({
  useStudentLevel: () => ({ studentLevel: hub === 'playground' ? 'playground' : hub === 'academy' ? 'academy' : 'professional', hubReady: true }),
}));
vi.mock('@/hooks/useCEFRProgress', () => ({ useCEFRProgress: () => ({ data: { level: 'Pre-A1' } }) }));
vi.mock('@/services/studentGames', () => ({
  studentLevelToHub: (l: string) => (l === 'playground' ? 'playground' : l === 'academy' ? 'academy' : 'success'),
  listLibrary: vi.fn().mockResolvedValue([]),
  recordPlay: vi.fn().mockResolvedValue(undefined),
  recordCompletion: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/components/games/GamePlayer', () => ({ default: () => null }));
// The player itself (scenes + audio) is covered elsewhere; here we only check the tab opens it.
vi.mock('@/components/games/GamePlayerView', () => ({
  GamePlayerView: ({ gameId }: { gameId: string }) => <div>Player open for {gameId}</div>,
}));

import '@/lib/i18n';
import { GamesTab } from '../GamesTab';
import { LIBRARY_GAMES } from '@/content/playground-library/gamesCatalog';

describe('Student Game Library tab: built-in Playground games', () => {
  beforeEach(() => {
    hub = 'playground';
    window.localStorage.clear();
  });

  it('shows Alphabet Express (not "No games yet") for a Playground student with an empty library', async () => {
    render(<GamesTab />);
    expect(await screen.findByText('Alphabet Express')).toBeTruthy();
    expect(screen.queryByText('No games yet')).toBeNull();
    // Every built-in Playground game counts, even with an empty database library.
    expect(LIBRARY_GAMES.length).toBeGreaterThan(0);
    expect(screen.getByText(`Games available: ${LIBRARY_GAMES.length}`)).toBeTruthy();
  });

  it('opens the game inside the tab and can go back to the library', async () => {
    render(<GamesTab />);
    fireEvent.click(await screen.findByRole('button', { name: /Play Alphabet Express/i }));
    expect(await screen.findByText('Player open for alphabet-express')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Back to library/i }));
    expect(await screen.findByText('Featured game')).toBeTruthy();
  });

  it('does not show Playground games to other hubs', async () => {
    // The Academy has its own built-in games now (Verb Forge...), so it never shows an empty "No games yet" any more;
    // it must still never show a Playground game.
    hub = 'academy';
    render(<GamesTab />);
    await waitFor(() => expect(screen.getByText(/games available/)).toBeTruthy());
    expect(screen.queryByText('Alphabet Express')).toBeNull();
  });

  it('shows the empty state to a hub with no built-in games, and no Playground games', async () => {
    hub = 'success';
    render(<GamesTab />);
    await waitFor(() => expect(screen.getByText('No games yet')).toBeTruthy());
    expect(screen.queryByText('Alphabet Express')).toBeNull();
  });
});
