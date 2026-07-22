// Real-Time Adaptation Loop.
// In-lesson signals → bounded LessonContextPatch (CEFR-cap safe).

import type {
  AdaptationSignal,
  LessonContext,
  LessonContextPatch,
} from './types';

const MAX_DIFFICULTY_DELTA = 2; // per lesson, matches adaptive engine
const MAX_SCAFFOLDING_BOOST = 2;

interface LoopState {
  difficultyDelta: number;
  scaffoldingBoost: number;
  vocabRepeatBoost: number;
  mistakes: number;
  speakingAttempts: number;
  successes: number;
  idleStreak: number;
  notes: string[];
}

function newLoopState(): LoopState {
  return {
    difficultyDelta: 0,
    scaffoldingBoost: 0,
    vocabRepeatBoost: 0,
    mistakes: 0,
    speakingAttempts: 0,
    successes: 0,
    idleStreak: 0,
    notes: [],
  };
}

export function createAdaptationLoop(ctx: LessonContext) {
  const state = newLoopState();
  const cefrCap = ctx.adaptive.difficulty.challenge_tier; // current tier; cap delta around it

  function consume(signal: AdaptationSignal): LessonContextPatch {
    switch (signal.type) {
      case 'mistake':
        state.mistakes += 1;
        if (state.mistakes >= 3 && state.scaffoldingBoost < MAX_SCAFFOLDING_BOOST) {
          state.scaffoldingBoost += 1;
          state.notes.push('scaffolding +1 after 3 mistakes');
        }
        if (state.mistakes >= 4 && state.difficultyDelta > -MAX_DIFFICULTY_DELTA) {
          state.difficultyDelta -= 1;
          state.notes.push('difficulty -1 after sustained mistakes');
        }
        break;

      case 'speaking_attempt':
        state.speakingAttempts += 1;
        // Speaking bravery is independent of accuracy — reward attempt via pacing.
        break;

      case 'activity_complete': {
        const correct = Boolean(signal.payload?.correct);
        if (correct) {
          state.successes += 1;
          state.idleStreak = 0;
          if (
            state.successes >= 3 &&
            state.difficultyDelta < MAX_DIFFICULTY_DELTA &&
            cefrCap < 4
          ) {
            state.difficultyDelta += 1;
            state.successes = 0;
            state.notes.push('difficulty +1 after 3 successes (CEFR cap respected)');
          }
        }
        break;
      }

      case 'idle':
        state.idleStreak += 1;
        if (state.idleStreak >= 2) {
          state.notes.push('pacing hint: slow_down');
        }
        break;

      case 'request_help':
        if (state.scaffoldingBoost < MAX_SCAFFOLDING_BOOST) {
          state.scaffoldingBoost += 1;
          state.notes.push('scaffolding +1 (help requested)');
        }
        state.vocabRepeatBoost += 1;
        break;
    }

    return {
      difficultyDelta: state.difficultyDelta,
      scaffoldingBoost: state.scaffoldingBoost,
      vocabRepeatBoost: state.vocabRepeatBoost,
      pacingHint:
        state.idleStreak >= 2
          ? 'slow_down'
          : state.successes >= 3
            ? 'accelerate'
            : 'maintain',
      notes: [...state.notes],
    };
  }

  function snapshot() {
    return { ...state };
  }

  return { consume, snapshot };
}
