// Synthetic lesson runner — invokes the master orchestrator in test mode.
// Test mode = generate + validate, NEVER persist to curriculum_lessons.
import { runLessonGeneration } from '@/orchestrator';
import type { OrchestrationInput, OrchestrationResult } from '@/orchestrator/types';
import { browserGeminiAiClient } from '@/services/contentCreator/aiClient';
import type { TestCase } from './types';

export interface SyntheticGenerationResult {
  orchestration?: OrchestrationResult;
  error?: string;
}

export async function generateSyntheticLesson(tc: TestCase): Promise<SyntheticGenerationResult> {
  const input: OrchestrationInput = {
    hub: tc.hub as OrchestrationInput['hub'],
    cefr: tc.cefr as OrchestrationInput['cefr'],
    unitId: tc.unitId ?? `test-unit-${tc.hub}-${tc.cefr}`,
    lessonId: tc.lessonId ?? `test-lesson-${tc.kind}-${Date.now()}`,
    ai: browserGeminiAiClient,
    blueprintOverrides: {
      theme: tc.theme,
      lesson_title: `[TEST] ${tc.kind} • ${tc.hub} • ${tc.cefr}`,
    },
  };

  try {
    const orchestration = await runLessonGeneration(input);
    return { orchestration };
  } catch (e: any) {
    return { error: e?.message ?? String(e) };
  }
}
