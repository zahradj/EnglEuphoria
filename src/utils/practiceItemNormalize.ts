/**
 * Backwards-compat shim: lifts legacy single-item activity slides
 * (error_detection / correction / fill_blank) into the new `items[]` shape.
 *
 * Old:  { type: 'error_detection', sentence, wrongIndex }
 * New:  { type: 'error_detection', items: [{ sentence, wrongIndex }] }
 */

export interface ErrorDetectionItem { sentence: string; wrongIndex: number; skillTag?: string }
export interface CorrectionItem { wrong: string; answer: string; skillTag?: string }
export interface FillBlankItem { before: string; answer: string; after: string; skillTag?: string }

export function getErrorDetectionItems(slide: any): ErrorDetectionItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      sentence: String(it.sentence ?? ''),
      wrongIndex: Number(it.wrongIndex ?? 0),
      skillTag: it.skillTag ?? undefined,
    }));
  }
  if (slide?.sentence != null) {
    return [{ sentence: String(slide.sentence), wrongIndex: Number(slide.wrongIndex ?? 0), skillTag: slide.skillTag ?? undefined }];
  }
  return [];
}

export function getCorrectionItems(slide: any): CorrectionItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      wrong: String(it.wrong ?? ''),
      answer: String(it.answer ?? ''),
      skillTag: it.skillTag ?? undefined,
    }));
  }
  if (slide?.wrong != null || slide?.answer != null) {
    return [{ wrong: String(slide.wrong ?? ''), answer: String(slide.answer ?? ''), skillTag: slide.skillTag ?? undefined }];
  }
  return [];
}

export function getFillBlankItems(slide: any): FillBlankItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      before: String(it.before ?? ''),
      answer: String(it.answer ?? ''),
      after: String(it.after ?? ''),
      skillTag: it.skillTag ?? undefined,
    }));
  }
  if (slide?.before != null || slide?.answer != null || slide?.after != null) {
    return [{
      before: String(slide.before ?? ''),
      answer: String(slide.answer ?? ''),
      after: String(slide.after ?? ''),
      skillTag: slide.skillTag ?? undefined,
    }];
  }
  return [];
}

export interface MultipleItem { question: string; options: string[]; answer: string; skillTag?: string }
export interface TrueFalseItem { statement: string; answer: boolean; skillTag?: string }
export interface SentenceBuilderItem { words: string[]; answer: string[]; skillTag?: string }

export function getMultipleItems(slide: any): MultipleItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      question: String(it.question ?? ''),
      options: Array.isArray(it.options) ? it.options.map((o: any) => String(o)) : [],
      answer: String(it.answer ?? ''),
      skillTag: it.skillTag ?? undefined,
    }));
  }
  if (slide?.question != null || Array.isArray(slide?.options)) {
    return [{
      question: String(slide.question ?? ''),
      options: Array.isArray(slide.options) ? slide.options.map((o: any) => String(o)) : [],
      answer: String(slide.answer ?? ''),
      skillTag: slide.skillTag ?? undefined,
    }];
  }
  return [];
}

export function getTrueFalseItems(slide: any): TrueFalseItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      statement: String(it.statement ?? ''),
      answer: Boolean(it.answer),
      skillTag: it.skillTag ?? undefined,
    }));
  }
  if (slide?.statement != null || slide?.answer != null) {
    return [{ statement: String(slide.statement ?? ''), answer: Boolean(slide.answer), skillTag: slide.skillTag ?? undefined }];
  }
  return [];
}

export function getSentenceBuilderItems(slide: any): SentenceBuilderItem[] {
  if (Array.isArray(slide?.items) && slide.items.length) {
    return slide.items.map((it: any) => ({
      words: Array.isArray(it.words) ? it.words.map((w: any) => String(w)) : [],
      answer: Array.isArray(it.answer) ? it.answer.map((w: any) => String(w)) : [],
      skillTag: it.skillTag ?? undefined,
    }));
  }
  if (Array.isArray(slide?.words) || Array.isArray(slide?.answer)) {
    return [{
      words: Array.isArray(slide.words) ? slide.words.map((w: any) => String(w)) : [],
      answer: Array.isArray(slide.answer) ? slide.answer.map((w: any) => String(w)) : [],
      skillTag: slide.skillTag ?? undefined,
    }];
  }
  return [];
}
