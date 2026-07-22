// Arcade observer — posts events to the intelligence-observer edge function.
import { supabase } from '@/integrations/supabase/client';

export type ArcadeEventType =
  | 'arcade_round_played'
  | 'arcade_speaking_attempt'
  | 'arcade_completed';

export interface ArcadeEvent {
  type: ArcadeEventType;
  studentId: string;
  hub: 'playground' | 'academy' | 'success';
  lessonId?: string;
  payload?: Record<string, unknown>;
  at?: string;
}

export async function emitArcadeEvents(events: ArcadeEvent[]) {
  if (!events || events.length === 0) return;
  try {
    await supabase.functions.invoke('intelligence-observer', {
      body: {
        events: events.map((e) => ({ ...e, at: e.at ?? new Date().toISOString() })),
      },
    });
  } catch {
    // Best-effort; never block UI.
  }
}
