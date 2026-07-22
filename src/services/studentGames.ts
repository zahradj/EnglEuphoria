import { supabase } from '@/integrations/supabase/client';

export type GameHub = 'playground' | 'academy' | 'success';

export interface StudentGame {
  id: string;
  title: string;
  description: string | null;
  level: string;
  game_type: string;
  catalog_game_id: string | null;
  hub: GameHub;
  tags: string[] | null;
  thumbnail_url: string | null;
  xp_reward: number;
  published_at: string | null;
  created_at: string;
}

export interface StudentGameProgress {
  game_id: string;
  status: 'in_progress' | 'completed';
  best_score: number;
  xp_earned: number;
  last_played_at: string;
  completed_at: string | null;
}

export interface StudentGameWithProgress extends StudentGame {
  progress?: StudentGameProgress;
}

const GAME_COLS =
  'id, title, description, level, game_type, catalog_game_id, hub, tags, thumbnail_url, xp_reward, published_at, created_at';

/** Map student level to game hub. Strict — no fallback. */
export function studentLevelToHub(level: string | null | undefined): GameHub | null {
  if (level === 'playground') return 'playground';
  if (level === 'academy') return 'academy';
  if (level === 'professional' || level === 'success') return 'success';
  return null;
}

/** All published games for a hub (optionally a CEFR level). */
export async function listPublishedGames(params: {
  hub: GameHub;
  level?: string | null;
  limit?: number;
}): Promise<StudentGame[]> {
  let q = supabase
    .from('learning_games')
    .select(GAME_COLS)
    .eq('is_published', true)
    .eq('hub', params.hub)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(params.limit ?? 100);
  if (params.level) q = q.eq('level', params.level);
  const { data, error } = await q;
  if (error) {
    console.warn('[studentGames] listPublishedGames', error);
    return [];
  }
  return (data as any as StudentGame[]) || [];
}

/** Progress map for the current student, keyed by game_id. */
export async function getProgressMap(userId: string): Promise<Record<string, StudentGameProgress>> {
  const { data, error } = await supabase
    .from('student_game_progress')
    .select('game_id, status, best_score, xp_earned, last_played_at, completed_at')
    .eq('user_id', userId);
  if (error) {
    console.warn('[studentGames] getProgressMap', error);
    return {};
  }
  const map: Record<string, StudentGameProgress> = {};
  for (const r of (data as any as StudentGameProgress[]) || []) map[r.game_id] = r;
  return map;
}

/** Hydrate published games for a hub with the student's progress. */
export async function listLibrary(params: {
  userId: string;
  hub: GameHub;
  level?: string | null;
}): Promise<StudentGameWithProgress[]> {
  const [games, progress] = await Promise.all([
    listPublishedGames({ hub: params.hub, level: params.level ?? undefined }),
    getProgressMap(params.userId),
  ]);
  return games.map((g) => ({ ...g, progress: progress[g.id] }));
}

/** Direct teacher → student / classroom assignments. */
export async function listAssignments(params: {
  userId: string;
  bookingId?: string | null;
}): Promise<StudentGameWithProgress[]> {
  let q = supabase
    .from('game_assignments')
    .select(`id, booking_id, created_at, game:learning_games(${GAME_COLS})`)
    .order('created_at', { ascending: false });
  if (params.bookingId) q = q.eq('booking_id', params.bookingId);
  else q = q.eq('student_id', params.userId);
  const { data, error } = await q;
  if (error) {
    console.warn('[studentGames] listAssignments', error);
    return [];
  }
  const games = ((data as any[]) || [])
    .map((r) => r.game as StudentGame | null)
    .filter(Boolean) as StudentGame[];
  const progress = await getProgressMap(params.userId);
  return games.map((g) => ({ ...g, progress: progress[g.id] }));
}

/** Upsert in_progress on play start. */
export async function recordPlay(userId: string, gameId: string): Promise<void> {
  const { error } = await supabase
    .from('student_game_progress')
    .upsert(
      {
        user_id: userId,
        game_id: gameId,
        status: 'in_progress',
        last_played_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,game_id', ignoreDuplicates: false },
    );
  if (error) console.warn('[studentGames] recordPlay', error);
}

/** Mark completed, store best_score, award XP (idempotent on first completion). */
export async function recordCompletion(
  userId: string,
  game: Pick<StudentGame, 'id' | 'xp_reward'>,
  score = 100,
): Promise<{ xpAwarded: number }> {
  const { data: existing } = await supabase
    .from('student_game_progress')
    .select('status, best_score, xp_earned, completed_at')
    .eq('user_id', userId)
    .eq('game_id', game.id)
    .maybeSingle();

  const firstCompletion = !existing || existing.status !== 'completed';
  const xpAwarded = firstCompletion ? Math.max(0, game.xp_reward || 0) : 0;
  const bestScore = Math.max(Number(existing?.best_score ?? 0), score);
  const xpEarned = Number(existing?.xp_earned ?? 0) + xpAwarded;

  const { error } = await supabase.from('student_game_progress').upsert(
    {
      user_id: userId,
      game_id: game.id,
      status: 'completed',
      best_score: bestScore,
      xp_earned: xpEarned,
      last_played_at: new Date().toISOString(),
      completed_at: existing?.completed_at ? undefined : new Date().toISOString(),
    },
    { onConflict: 'user_id,game_id', ignoreDuplicates: false },
  );
  if (error) console.warn('[studentGames] recordCompletion', error);

  if (firstCompletion) {
    try {
      await supabase.functions.invoke('award-xp', {
        body: {
          event_type: 'game_complete',
          metadata: { game_id: game.id, xp_reward: xpAwarded, score },
        },
      });
    } catch (e) {
      console.warn('[studentGames] award-xp invoke failed', e);
    }
  }
  return { xpAwarded };
}
