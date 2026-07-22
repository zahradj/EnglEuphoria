import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { IronLMSGame, TargetGroup, GameMode } from "@/types/ironLMS";
import { toast } from "sonner";

export interface SavedGame {
  id: string;
  title: string;
  topic: string;
  game_mode: GameMode;
  target_group: TargetGroup;
  cefr_level: string;
  game_data: IronLMSGame;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface SaveGameParams {
  game: IronLMSGame;
  topic: string;
  targetGroup: TargetGroup;
  cefrLevel: string;
}

export function useIronGameSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveGame = async (params: SaveGameParams): Promise<SavedGame | null> => {
    setIsSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to save games");
      }

      const { data, error: saveError } = await supabase
        .from("iron_games")
        .insert({
          title: params.game.title,
          topic: params.topic,
          game_mode: params.game.type,
          target_group: params.targetGroup,
          cefr_level: params.cefrLevel,
          game_data: params.game as unknown as Record<string, unknown>,
          created_by: user.id,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      toast.success("Game saved successfully!");
      return data as unknown as SavedGame;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save game";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteGame = async (gameId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from("iron_games")
        .delete()
        .eq("id", gameId);

      if (deleteError) throw deleteError;

      toast.success("Game deleted");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete game";
      toast.error(message);
      return false;
    }
  };

  return { saveGame, deleteGame, isSaving, error };
}
