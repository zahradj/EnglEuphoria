// A/B test harness for engine selection.
// 10% of lessons get a randomised engine (logged) so we can measure retention impact.

import type { LanguageEngineSlotType } from './engineSlotInjector';
import { LANGUAGE_ENGINE_SLOT_TYPES } from './engineSlotInjector';

const AB_RATE = 0.1;
const LS_KEY = 'engleuphoria.engine.ab.v1';

export interface AbAssignment {
  variant: 'control' | 'random';
  engine?: LanguageEngineSlotType;
  lessonId: string;
  at: number;
}

/** Deterministic hash so a given lessonId maps to the same bucket across renders. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

export function assignEngineVariant(lessonId: string | undefined): AbAssignment {
  const id = lessonId || 'default';
  const bucket = hash(id);
  if (bucket >= AB_RATE) {
    return { variant: 'control', lessonId: id, at: Date.now() };
  }
  const engineBucket = Math.floor(hash(`${id}:engine`) * LANGUAGE_ENGINE_SLOT_TYPES.length);
  const engine = LANGUAGE_ENGINE_SLOT_TYPES[engineBucket] as LanguageEngineSlotType;
  const record: AbAssignment = { variant: 'random', engine, lessonId: id, at: Date.now() };
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(record);
    localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(-100)));
  } catch { /* quota */ }
  return record;
}

export function readAbAssignments(): AbAssignment[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
