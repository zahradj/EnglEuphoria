/**
 * Backwards-compat shim: lifts legacy single-item activity slides
 * (error_detection / correction / fill_blank) into the new `items[]` shape.
 *
 * Old:  { type: 'error_detection', sentence, wrongIndex }
 * New:  { type: 'error_detection', items: [{ sentence, wrongIndex }] }
 */

export interface ErrorDetectionItem { sentence: string; wrongIndex: number }
export interface CorrectionItem { wrong: string; answer: string }
export interface FillBlankItem { before: string; answer: string; after: string }

export function getErrorDetectionItems(slide: any): ErrorDetectionItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      sentence: String(it.sentence ?? ''),
      wrongIndex: Number(it.wrongIndex ?? 0),
    }));
  }
  if (slide?.sentence != null) {
    return [{ sentence: String(slide.sentence), wrongIndex: Number(slide.wrongIndex ?? 0) }];
  }
  return [];
}

export function getCorrectionItems(slide: any): CorrectionItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      wrong: String(it.wrong ?? ''),
      answer: String(it.answer ?? ''),
    }));
  }
  if (slide?.wrong != null || slide?.answer != null) {
    return [{ wrong: String(slide.wrong ?? ''), answer: String(slide.answer ?? '') }];
  }
  return [];
}

export function getFillBlankItems(slide: any): FillBlankItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      before: String(it.before ?? ''),
      answer: String(it.answer ?? ''),
      after: String(it.after ?? ''),
    }));
  }
  if (slide?.before != null || slide?.answer != null || slide?.after != null) {
    return [{
      before: String(slide.before ?? ''),
      answer: String(slide.answer ?? ''),
      after: String(slide.after ?? ''),
    }];
  }
  return [];
}

export interface MultipleItem { question: string; options: string[]; answer: string }
export interface TrueFalseItem { statement: string; answer: boolean }
export interface SentenceBuilderItem { words: string[]; answer: string[] }

export function getMultipleItems(slide: any): MultipleItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      question: String(it.question ?? ''),
      options: Array.isArray(it.options) ? it.options.map((o: any) => String(o)) : [],
      answer: String(it.answer ?? ''),
    }));
  }
  if (slide?.question != null || Array.isArray(slide?.options)) {
    return [{
      question: String(slide.question ?? ''),
      options: Array.isArray(slide.options) ? slide.options.map((o: any) => String(o)) : [],
      answer: String(slide.answer ?? ''),
    }];
  }
  return [];
}

export function getTrueFalseItems(slide: any): TrueFalseItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      statement: String(it.statement ?? ''),
      answer: Boolean(it.answer),
    }));
  }
  if (slide?.statement != null || slide?.answer != null) {
    return [{ statement: String(slide.statement ?? ''), answer: Boolean(slide.answer) }];
  }
  return [];
}

export function getSentenceBuilderItems(slide: any): SentenceBuilderItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      words: Array.isArray(it.words) ? it.words.map((w: any) => String(w)) : [],
      answer: Array.isArray(it.answer) ? it.answer.map((w: any) => String(w)) : [],
    }));
  }
  if (Array.isArray(slide?.words) || Array.isArray(slide?.answer)) {
    return [{
      words: Array.isArray(slide.words) ? slide.words.map((w: any) => String(w)) : [],
      answer: Array.isArray(slide.answer) ? slide.answer.map((w: any) => String(w)) : [],
    }];
  }
  return [];
}
