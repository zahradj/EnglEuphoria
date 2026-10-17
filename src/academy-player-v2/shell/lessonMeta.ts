// What the shell shows about a lesson, read from the curriculum blueprint (never copied into the script).
import { ACADEMY_LESSON_BLUEPRINTS } from '../../curriculum/academy';
import { chapterOfLesson } from '../../curriculum/academy/arcs';
import type { LessonScript } from '../types';

export interface LessonMeta {
  /** 'B1 · Season 1 · Episode 3' */
  where: string;
  /** 'B1·S1·E3' */
  short: string;
  chapter?: { no: number; title: string; question: string; essentialQuestion?: string };
}

export function lessonMeta(script: LessonScript): LessonMeta {
  const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === script.blueprintId);
  const m = /^(PA1|[A-C][12])-S(\d+)-E(\d)$/.exec(script.blueprintId);
  const level = m ? (m[1] === 'PA1' ? 'Pre-A1' : m[1]) : '';
  const season = m ? Number(m[2]) : 0;
  const ep = m ? Number(m[3]) : 0;
  const chapter = bp?.chapter ?? chapterOfLesson(script.blueprintId);
  return {
    where: m ? `${level} · Season ${season} · Episode ${ep}` : script.title,
    short: m ? `${level === 'Pre-A1' ? 'PA1' : level}·S${season}·E${ep}` : script.blueprintId,
    chapter: chapter ? { no: chapter.no, title: chapter.title, question: chapter.question, essentialQuestion: chapter.essentialQuestion } : undefined,
  };
}
