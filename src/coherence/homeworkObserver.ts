// Homework observer — posts homework task events to the intelligence-observer
// edge function so mastery / streaks / memory update when the learner plays
// a teacher-authored home mission game.
import { supabase } from '@/integrations/supabase/client';

export type HomeworkEventType = 'homework_task_attempt' | 'homework_completed';

export interface HomeworkEvent {
  type: HomeworkEventType;
  studentId: string;
  hub: 'playground' | 'academy' | 'success';
  lessonId?: string;
  payload?: Record<string, unknown>;
  at?: string;
}

export async function emitHomeworkEvents(events: HomeworkEvent[]) {
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
