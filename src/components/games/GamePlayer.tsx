import { lazy, Suspense, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const SentenceBuilderGame = lazy(() => import('./SentenceBuilderGame'));
const VerbMatchingGame = lazy(() => import('./VerbMatchingGame'));
const InterviewGame = lazy(() => import('./InterviewGame'));
const GrammarSortingGame = lazy(() => import('./GrammarSortingGame'));
const AlphabetBlocksGame = lazy(() => import('./AlphabetBlocksGame'));
const BossRoundGame = lazy(() => import('./BossRoundGame'));
const GenericArcadeGame = lazy(() => import('./GenericArcadeGame'));

interface Props {
  gameId: string;
  onComplete?: () => void;
}

interface GameRow {
  id: string;
  game_type: string;
  catalog_game_id: string | null;
  level: string;
  title: string;
  description: string | null;
  content_json: any;
}

export default function GamePlayer({ gameId, onComplete }: Props) {
  const [game, setGame] = useState<GameRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    supabase
      .from('learning_games')
      .select('id, game_type, catalog_game_id, level, title, description, content_json')
      .eq('id', gameId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancel) return;
        if (error || !data) setError(error?.message || 'Game not found');
        else setGame(data as any as GameRow);
        setLoading(false);
      });
    return () => { cancel = true; };
  }, [gameId]);

  async function handleComplete() {
    if (finished) return;
    setFinished(true);
    onComplete?.();
    try {
      await supabase.functions.invoke('award-xp', {
        body: { event_type: 'game_complete', metadata: { game_id: gameId, level: game?.level, catalog_game_id: game?.catalog_game_id } },
      });
    } catch (e) {
      console.warn('[award-xp] failed', e);
    }
  }

  if (loading) return <div className="flex items-center justify-center p-10 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (error) return <div className="p-6 text-rose-600">Couldn't load this game: {error}</div>;
  if (!game) return null;

  const key = game.catalog_game_id || game.game_type;
  const isAlphabetBlocks =
    key === 'alphabet_blocks_order' || key === 'letter_sounds_blocks' ||
    key === 'phonics_word_blocks' || game.game_type === 'alphabet_blocks';
  const isBossRound = key === 'vocab_boss_round' || game.game_type === 'boss_round';
  const hasDedicated =
    key === 'sentence_builder' || key === 'verb_trio' || key === 'interview' ||
    key === 'sorting' || isAlphabetBlocks || isBossRound;

  const theme =
    (game.content_json?.scene_phrase as string | undefined) ||
    (game.content_json?.unit_theme as string | undefined) ||
    null;

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">{game.title}</h2>
        {game.description && <p className="text-slate-600">{game.description}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{game.level}</span>
          {theme && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
              title="Same world as your lesson"
            >
              <span aria-hidden>🌍</span>
              {theme}
            </span>
          )}
        </div>
      </header>

      <Suspense fallback={<div className="flex items-center justify-center p-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>}>
        {key === 'sentence_builder' && <SentenceBuilderGame content={game.content_json} onComplete={handleComplete} />}
        {key === 'verb_trio' && <VerbMatchingGame content={game.content_json} onComplete={handleComplete} />}
        {key === 'interview' && <InterviewGame content={game.content_json} onComplete={handleComplete} />}
        {key === 'sorting' && <GrammarSortingGame content={game.content_json} onComplete={handleComplete} />}
        {isAlphabetBlocks && <AlphabetBlocksGame content={game.content_json} onComplete={handleComplete} />}
        {isBossRound && <BossRoundGame content={game.content_json} catalogId={game.catalog_game_id} onComplete={handleComplete} />}
        {!hasDedicated && (
          <GenericArcadeGame gameType={game.game_type} catalogId={game.catalog_game_id} content={game.content_json} onComplete={handleComplete} />
        )}
      </Suspense>
    </div>
  );
}
