// Storybook reading session tracker + observer.
// Emits events to the intelligence-observer edge function so reading data
// feeds mastery / memory / speaking engines.

import { supabase } from '@/integrations/supabase/client';
import type { PageEvent, ReadingSessionInput, ReadingSessionMode } from '@/storybook/types';
import { updateReadingProgress } from '@/services/storybookLibrary';

export class StorybookReadingSession {
  readonly bookId: string;
  readonly studentId: string;
  readonly mode: ReadingSessionMode;
  private sessionId: string | null = null;
  private pagesRead = 0;
  private wordsRead = 0;
  private vocabAttempts: any[] = [];
  private speakingAttempts: any[] = [];
  private comprehensionScores: number[] = [];

  constructor(input: ReadingSessionInput) {
    this.bookId = input.bookId;
    this.studentId = input.studentId;
    this.mode = input.mode;
  }

  async start(): Promise<void> {
    const { data, error } = await (supabase as any)
      .from('storybook_reading_sessions')
      .insert({
        student_id: this.studentId,
        book_id: this.bookId,
        mode: this.mode,
      })
      .select('id')
      .single();
    if (error) throw error;
    this.sessionId = (data as { id: string }).id;
  }

  async emit(event: PageEvent, words = 0): Promise<void> {
    if (event.type === 'page_complete') {
      this.pagesRead += 1;
      this.wordsRead += words;
    }
    if (event.type === 'vocab_lookup') this.vocabAttempts.push(event.payload ?? {});
    if (event.type === 'speaking_attempt') this.speakingAttempts.push(event.payload ?? {});
    if (event.type === 'comprehension_attempt') {
      const correct = !!(event.payload as any)?.correct;
      this.comprehensionScores.push(correct ? 1 : 0);
    }

    // Fire-and-forget — never block reading
    void this.forwardToIntelligence(event);
  }

  async end(totalPagesInBook: number, lastPageId?: string): Promise<void> {
    if (!this.sessionId) return;
    const comprehension = this.comprehensionScores.length
      ? this.comprehensionScores.reduce((a, b) => a + b, 0) / this.comprehensionScores.length
      : null;

    await (supabase as any)
      .from('storybook_reading_sessions')
      .update({
        ended_at: new Date().toISOString(),
        pages_read: this.pagesRead,
        words_read: this.wordsRead,
        comprehension_score: comprehension,
        vocab_attempts: this.vocabAttempts,
        speaking_attempts: this.speakingAttempts,
      })
      .eq('id', this.sessionId);

    if (lastPageId && totalPagesInBook > 0) {
      const progress = Math.min(1, this.pagesRead / totalPagesInBook);
      await updateReadingProgress(this.bookId, lastPageId, progress);
    }
  }

  private async forwardToIntelligence(event: PageEvent): Promise<void> {
    try {
      await supabase.functions.invoke('intelligence-observer', {
        body: {
          studentId: this.studentId,
          event: `story_${event.type}`,
          payload: { bookId: this.bookId, ...event.payload },
        },
      });
    } catch {
      // best-effort — telemetry never blocks UX
    }
  }
}
