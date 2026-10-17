import { A1_STRUCTURE_GSE, type StructureGseEntry } from '../structureGse';
import { A2_STRUCTURE_GSE } from './a2';
import { B1_STRUCTURE_GSE } from './b1';
import { B2_STRUCTURE_GSE } from './b2';
import { C1_STRUCTURE_GSE } from './c1';

export const STRUCTURE_GSE: Record<string, StructureGseEntry> = { ...A1_STRUCTURE_GSE, ...A2_STRUCTURE_GSE, ...B1_STRUCTURE_GSE, ...B2_STRUCTURE_GSE, ...C1_STRUCTURE_GSE };
