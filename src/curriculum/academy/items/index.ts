import type { SeasonItems } from '../itemTypes';
import { A1_ITEMS } from './a1';
import { A2_ITEMS } from './a2';
import { B1_ITEMS } from './b1';
import { B2_ITEMS } from './b2';
import { C1_ITEMS } from './c1';

export const ACADEMY_ITEMS: Record<string, SeasonItems> = { ...A1_ITEMS, ...A2_ITEMS, ...B1_ITEMS, ...B2_ITEMS, ...C1_ITEMS };
