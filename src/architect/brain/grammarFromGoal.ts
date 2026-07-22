// Grammar From Communication Goal — deterministic mapping.
// The Architect MUST pick grammar frames from this table, not invent them.

export type CommunicationGoalFamily =
  | 'identify'
  | 'describe'
  | 'preference'
  | 'location'
  | 'possession'
  | 'ability'
  | 'routine';

export interface GrammarFrameSpec {
  family: CommunicationGoalFamily;
  frames: string[];
  questions: string[];
  shortAnswers?: string[];
  notes?: string;
}

export const GRAMMAR_FROM_GOAL: Record<CommunicationGoalFamily, GrammarFrameSpec> = {
  identify: {
    family: 'identify',
    frames: ['It is ___.', 'This is ___.'],
    questions: ['What is it?', 'What color is it?'],
    shortAnswers: ['Yes, it is.', 'No, it is not.'],
  },
  describe: {
    family: 'describe',
    frames: ['It is ___.', 'The ___ is ___.'],
    questions: ['What is it like?', 'How is it?'],
  },
  preference: {
    family: 'preference',
    frames: ['I like ___.', 'I do not like ___.'],
    questions: ['Do you like ___?'],
    shortAnswers: ['Yes, I do.', 'No, I do not.'],
  },
  location: {
    family: 'location',
    frames: ['It is on ___.', 'It is under ___.', 'It is in ___.'],
    questions: ['Where is ___?'],
  },
  possession: {
    family: 'possession',
    frames: ['I have ___.', 'She has ___.', 'He has ___.'],
    questions: ['Do you have ___?'],
    shortAnswers: ['Yes, I do.', 'No, I do not.'],
  },
  ability: {
    family: 'ability',
    frames: ['I can ___.', 'I cannot ___.'],
    questions: ['Can you ___?'],
    shortAnswers: ['Yes, I can.', 'No, I cannot.'],
  },
  routine: {
    family: 'routine',
    frames: ['I ___ every day.', 'She ___ in the morning.'],
    questions: ['What do you do?', 'When do you ___?'],
  },
};

export function inferGoalFamily(goal?: string): CommunicationGoalFamily | null {
  if (!goal) return null;
  const g = goal.toLowerCase();
  if (/\b(like|prefer|favou?rite)\b/.test(g)) return 'preference';
  if (/\b(where|on|under|next to|between|in the)\b/.test(g)) return 'location';
  if (/\b(have|got|owns?)\b/.test(g)) return 'possession';
  if (/\b(can|able)\b/.test(g)) return 'ability';
  if (/\b(every day|routine|morning|night|usually)\b/.test(g)) return 'routine';
  if (/\b(describe|big|small|tall|short|color|colou?r)\b/.test(g)) return 'describe';
  if (/\b(name|identify|what is|it is)\b/.test(g)) return 'identify';
  return null;
}

export function buildGrammarFromGoalPrompt(goal?: string): string {
  const family = inferGoalFamily(goal);
  const lines = [
    '## GRAMMAR FROM COMMUNICATION GOAL (binding)',
    'You MUST pick your grammar frame from the table below based on the communication goal. Do not invent parallel frames.',
    '',
  ];
  for (const spec of Object.values(GRAMMAR_FROM_GOAL)) {
    lines.push(`- **${spec.family}** → frames: [${spec.frames.join(' | ')}] · questions: [${spec.questions.join(' | ')}]`);
  }
  if (family) {
    const chosen = GRAMMAR_FROM_GOAL[family];
    lines.push('');
    lines.push(`Detected goal family for this lesson: **${family}**.`);
    lines.push(`Use ONLY these frames: ${chosen.frames.join(' | ')}`);
    lines.push(`Use ONLY these questions: ${chosen.questions.join(' | ')}`);
    if (chosen.shortAnswers) {
      lines.push(`Short answers: ${chosen.shortAnswers.join(' | ')}`);
    }
  }
  return lines.join('\n');
}
