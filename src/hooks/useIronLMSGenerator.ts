import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  IronLMSGame, 
  GameGenerationRequest,
  MechanicGame,
  ContextGame,
  ApplicationGame
} from '@/types/ironLMS';
import { toast } from 'sonner';

export function useIronLMSGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedGame, setGeneratedGame] = useState<IronLMSGame | null>(null);

  const generateGame = async (request: GameGenerationRequest): Promise<IronLMSGame | null> => {
    setIsGenerating(true);
    setError(null);
    setGeneratedGame(null);

    try {

      const { data, error: fnError } = await supabase.functions.invoke('generate-iron-game', {
        body: request
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate game');
      }

      if (!data || !data.game) {
        throw new Error('No game data returned from generator');
      }

      const game = data.game as IronLMSGame;
      
      // Validate the game structure
      if (!validateGame(game)) {
        throw new Error('Invalid game structure returned');
      }

      setGeneratedGame(game);
      toast.success(`${game.type.charAt(0).toUpperCase() + game.type.slice(1)} game generated!`);
      
      return game;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error generating game';
      console.error('[IronLMS] Generation error:', message);
      setError(message);
      toast.error('Failed to generate game: ' + message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const validateGame = (game: IronLMSGame): boolean => {
    if (!game || !game.type || !game.title) {
      return false;
    }

    switch (game.type) {
      case 'mechanic':
        const mechanic = game as MechanicGame;
        return Array.isArray(mechanic.questions) && mechanic.questions.length > 0;
      
      case 'context':
        const context = game as ContextGame;
        return typeof context.storyText === 'string' && 
               Array.isArray(context.clickableWords) && 
               context.clickableWords.length > 0;
      
      case 'application':
        const application = game as ApplicationGame;
        return typeof application.scenario === 'string' && 
               Array.isArray(application.choices) && 
               application.choices.length > 0;
      
      default:
        return false;
    }
  };

  const clearGame = () => {
    setGeneratedGame(null);
    setError(null);
  };

  return {
    generateGame,
    isGenerating,
    error,
    generatedGame,
    clearGame,
    validateGame
  };
}
