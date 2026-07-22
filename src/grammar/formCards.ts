// Form-card generator — emits Positive / Negative / Question / Short-Answer examples.
// Deterministic templates per common grammar target; AI is used downstream to enrich examples.

import { highlightSentence } from './highlighter';
import type { ExampleLine, FormCard, GrammarTarget } from './types';

function line(text: string): ExampleLine {
  return { text, highlights: highlightSentence(text) };
}

interface Template {
  positive: string[];
  negative: string[];
  question: string[];
  shortAnswers?: string[];
}

const TEMPLATES: Record<string, Template> = {
  past_simple: {
    positive: ['I played football yesterday.', 'She watched TV last night.'],
    negative: ['I did not play football yesterday.', "She didn't watch TV last night."],
    question: ['Did you play football yesterday?', 'Did she watch TV last night?'],
    shortAnswers: ['Yes, I did.', "No, she didn't."],
  },
  present_simple: {
    positive: ['I work in an office.', 'She lives in Madrid.'],
    negative: ['I do not work on Sundays.', "She doesn't live alone."],
    question: ['Do you work here?', 'Does she live nearby?'],
    shortAnswers: ['Yes, I do.', "No, she doesn't."],
  },
  present_continuous: {
    positive: ['I am studying right now.', 'They are eating lunch.'],
    negative: ['I am not studying right now.', "They aren't eating lunch."],
    question: ['Are you studying right now?', 'Are they eating lunch?'],
    shortAnswers: ['Yes, I am.', "No, they aren't."],
  },
  present_perfect: {
    positive: ['I have finished the report.', 'She has already arrived.'],
    negative: ['I have not finished the report.', "She hasn't arrived yet."],
    question: ['Have you finished the report?', 'Has she arrived yet?'],
    shortAnswers: ['Yes, I have.', "No, she hasn't."],
  },
  can_cant: {
    positive: ['I can swim.', 'She can ride a bike.'],
    negative: ["I can't swim.", "She cannot ride a bike."],
    question: ['Can you swim?', 'Can she ride a bike?'],
    shortAnswers: ['Yes, I can.', "No, she can't."],
  },
  future_will: {
    positive: ['I will call you tomorrow.', "She'll join the meeting."],
    negative: ["I will not call you.", "She won't join the meeting."],
    question: ['Will you call me?', 'Will she join the meeting?'],
    shortAnswers: ['Yes, I will.', "No, she won't."],
  },
  reported_speech: {
    positive: ['He said he was tired.', 'She told me she had finished.'],
    negative: ["He said he wasn't tired.", "She told me she hadn't finished."],
    question: ['Did he say he was tired?', 'Did she tell you she had finished?'],
  },
};

function normalizeKey(label: string): string | null {
  const l = label.toLowerCase();
  if (l.includes('past simple')) return 'past_simple';
  if (l.includes('present simple')) return 'present_simple';
  if (l.includes('present continuous') || l.includes('present progressive')) return 'present_continuous';
  if (l.includes('present perfect')) return 'present_perfect';
  if (l.includes('can')) return 'can_cant';
  if (l.includes('will') || l.includes('future')) return 'future_will';
  if (l.includes('reported')) return 'reported_speech';
  return null;
}

/** Build a FormCard from a known target. Falls back to label-based generic frames. */
export function buildFormCard(target: GrammarTarget): FormCard {
  const key = normalizeKey(target.label);
  const tpl = key ? TEMPLATES[key] : null;
  if (tpl) {
    return {
      positive: tpl.positive.map(line),
      negative: tpl.negative.map(line),
      question: tpl.question.map(line),
      shortAnswers: tpl.shortAnswers?.map(line),
    };
  }
  // Generic fallback — AI layer should later refine.
  return {
    positive: [line(`Example positive sentence using ${target.label}.`)],
    negative: [line(`Example negative sentence using ${target.label}.`)],
    question: [line(`Example question using ${target.label}?`)],
  };
}
