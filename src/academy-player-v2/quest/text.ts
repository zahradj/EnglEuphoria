// Names and goals of the quest stages: the lesson's own `quest.stages` (English content) or the standard run of show (translated chrome).
import type { TFunction } from 'i18next';
import type { LessonScript } from '../types';
import type { LessonMeta } from '../shell/lessonMeta';

const TITLES = ['Check-in', 'Remember?', 'The Drop', 'Notice and Build', 'Energiser', 'Mission', 'Release', 'Wrap'];
const GOALS = [
  'Settle in and warm up your voice.',
  'Wake up what you already know.',
  'Meet the new story, the new words and the new language.',
  'Spot the pattern, learn the rule and build it.',
  'A quick burst to keep your energy up.',
  'Use it for real: the big speaking task.',
  'Show it off in your own words.',
  'Say the rule back and collect your rewards.',
];

export function stageText(t: TFunction, script: LessonScript, part: number): { title: string; goal: string } {
  const own = script.quest?.stages?.[part];
  return {
    title: own?.title ?? t(`ap.stT${part}`, TITLES[part] ?? `Stage ${part + 1}`),
    goal: own?.goal ?? t(`ap.stG${part}`, GOALS[part] ?? ''),
  };
}

/** the quest's name: the lesson's own, else the Season chapter title, else the lesson title */
export const questName = (script: LessonScript, meta: LessonMeta): string => script.quest?.name ?? meta.chapter?.title ?? script.title;

/** an objective sentence without its leading "I can ", so it reads as a goal in a small chip */
export const shortObjective = (text: string): string => text.replace(/^I can /i, '').replace(/^./, (c) => c.toUpperCase());
