import { supabase } from '@/integrations/supabase/client';
import type { SmartWorksheet } from './whiteboardService';

export interface SavedGame {
  id: string;
  teacher_id: string;
  title: string;
  topic: string;
  age_level: string | null;
  game_data: SmartWorksheet;
  created_at: string;
  updated_at: string;
}

export const savedGamesService = {
  async list(teacherId: string): Promise<SavedGame[]> {
    const { data, error } = await supabase
      .from('saved_games')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as unknown as SavedGame[];
  },

  async create(input: {
    teacherId: string;
    title: string;
    topic: string;
    ageLevel?: string | null;
    gameData: SmartWorksheet;
  }): Promise<SavedGame> {
    const { data, error } = await supabase
      .from('saved_games')
      .insert({
        teacher_id: input.teacherId,
        title: input.title,
        topic: input.topic,
        age_level: input.ageLevel ?? null,
        game_data: input.gameData as any,
      })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as SavedGame;
  },

  async rename(id: string, title: string): Promise<void> {
    const { error } = await supabase.from('saved_games').update({ title }).eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('saved_games').delete().eq('id', id);
    if (error) throw error;
  },
};
