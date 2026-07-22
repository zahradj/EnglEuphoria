import type { ComponentType } from 'react';
import SpinningWheelBlock, { type SpinningWheelConfig } from './SpinningWheelBlock';
import LogicMatrixBlock, { type LogicMatrixConfig } from './LogicMatrixBlock';
import ConjugationBlock, { type ConjugationConfig } from './ConjugationBlock';

export type CreatorBlockType = 'spinning_wheel' | 'logic_matrix' | 'conjugation';

export interface CreatorBlockEntry<TConfig = any> {
  type: CreatorBlockType;
  label: string;
  description: string;
  emoji: string;
  defaultConfig: TConfig;
  Component: ComponentType<{ config: TConfig; onChange?: (next: TConfig) => void; mode?: 'edit' | 'play' }>;
}

export const blockRegistry: Record<CreatorBlockType, CreatorBlockEntry> = {
  spinning_wheel: {
    type: 'spinning_wheel',
    label: 'Spinning Wheel',
    description: 'Random picker with 2–8 customizable segments.',
    emoji: '🎡',
    defaultConfig: { segments: ['Yes', 'No', 'Maybe', 'Try again'] } as SpinningWheelConfig,
    Component: SpinningWheelBlock,
  },
  logic_matrix: {
    type: 'logic_matrix',
    label: 'Logic Matrix',
    description: 'Toggleable grid with ✓ / ✗ for logic puzzles.',
    emoji: '🔲',
    defaultConfig: {
      rowHeaders: ['Anna', 'Ben', 'Carla'],
      colHeaders: ['Park', 'School', 'Library'],
      cells: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
    } as LogicMatrixConfig,
    Component: LogicMatrixBlock,
  },
  conjugation: {
    type: 'conjugation',
    label: 'Conjugation Match',
    description: 'Click-to-pair cards (e.g., I/He → was/were).',
    emoji: '🔗',
    defaultConfig: {
      prompt: 'Match each subject to its correct verb form.',
      pairs: [
        { left: 'I', right: 'was' },
        { left: 'You', right: 'were' },
        { left: 'She', right: 'was' },
      ],
    } as ConjugationConfig,
    Component: ConjugationBlock,
  },
};

export const blockList = Object.values(blockRegistry);
