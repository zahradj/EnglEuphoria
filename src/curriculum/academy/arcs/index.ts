import { A1_ARCS } from './a1';
import { A2_ARCS } from './a2';
import { B1_ARCS } from './b1';
import { B2_ARCS } from './b2';
import { C1_ARCS } from './c1';
import type { SeasonArc } from './types';

export type { SeasonArc } from './types';
/** Hand-written Season arcs by Season id; a Season without one falls back to the derived default in ../seasonArc.ts. */
export const SEASON_ARCS: Record<string, SeasonArc> = { ...A1_ARCS, ...A2_ARCS, ...B1_ARCS, ...B2_ARCS, ...C1_ARCS };
