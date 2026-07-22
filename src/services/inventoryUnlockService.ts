/**
 * Inventory Unlock Service
 * 
 * Handles the "database handshake" when a student completes a lesson:
 * 1. Identifies the level's accessory for the student's hub
 * 2. Inserts into student_inventory (idempotent via UNIQUE constraint)
 * 3. Returns the unlocked accessory data for the AccessoryUnlock animation
 */

import { supabase } from '@/integrations/supabase/client';

export interface UnlockedAccessoryResult {
  accessoryId: string;
  name: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  levelName: string;
  alreadyOwned: boolean;
}

/**
 * Called when a student completes a lesson. Checks the lesson's level for
 * an accessory matching their hub and awards it if not already owned.
 */
export async function unlockAccessoryOnCompletion(
  studentId: string,
  lessonId: string,
  hub: 'playground' | 'academy' | 'professional',
): Promise<UnlockedAccessoryResult | null> {
  try {
    // 1. Get the lesson's level_id
    const { data: lesson } = await supabase
      .from('curriculum_lessons')
      .select('level_id')
      .eq('id', lessonId)
      .maybeSingle();

    if (!lesson?.level_id) return null;

    // 2. Find the accessory for this level + hub
    const { data: accessory } = await supabase
      .from('accessories')
      .select('id, name, type, description, image_url, level_id')
      .eq('level_id', lesson.level_id)
      .eq('hub_requirement', hub)
      .maybeSingle();

    if (!accessory) return null;

    // 3. Get level name
    const { data: level } = await supabase
      .from('curriculum_levels')
      .select('name')
      .eq('id', lesson.level_id)
      .maybeSingle();

    // 4. Check if already owned
    const { data: existing } = await supabase
      .from('student_inventory')
      .select('id')
      .eq('student_id', studentId)
      .eq('accessory_id', accessory.id)
      .maybeSingle();

    if (existing) {
      return {
        accessoryId: accessory.id,
        name: accessory.name,
        type: accessory.type,
        description: accessory.description,
        imageUrl: accessory.image_url,
        levelName: level?.name || 'Unknown',
        alreadyOwned: true,
      };
    }

    // 5. Insert into inventory
    const { error } = await supabase
      .from('student_inventory')
      .insert({
        student_id: studentId,
        accessory_id: accessory.id,
      });

    if (error) {
      // UNIQUE constraint violation = already owned (race condition safe)
      if (error.code === '23505') {
        return {
          accessoryId: accessory.id,
          name: accessory.name,
          type: accessory.type,
          description: accessory.description,
          imageUrl: accessory.image_url,
          levelName: level?.name || 'Unknown',
          alreadyOwned: true,
        };
      }
      throw error;
    }

    return {
      accessoryId: accessory.id,
      name: accessory.name,
      type: accessory.type,
      description: accessory.description,
      imageUrl: accessory.image_url,
      levelName: level?.name || 'Unknown',
      alreadyOwned: false,
    };
  } catch (err) {
    console.error('Failed to unlock accessory:', err);
    return null;
  }
}
