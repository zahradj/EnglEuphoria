import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/elevenLabsAudio', () => ({ playElevenLabs: vi.fn(), stopElevenLabs: vi.fn() }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import { LivingCanvas } from '../LivingCanvas';

// jsdom has no ResizeObserver; the canvas only uses it to measure its box.
(globalThis as any).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

/**
 * Regression guard: the Academy student-comfort sizing of the canvas Reset / instruction buttons must stay
 * Academy-only — Playground and Success render this same component and must keep their original look.
 */
const slide: any = {
  type: 'canvas_game', title: 'T', instruction: 'Drag it', elements: [],
};

describe('LivingCanvas hub scoping', () => {
  it.each(['playground', 'success'] as const)('%s keeps the original small Reset button', (hub) => {
    render(<LivingCanvas slide={slide} hub={hub} fullBleed />);
    const reset = screen.getByTitle('Reset game');
    expect(reset.className).toContain('text-xs');
    expect(reset.className).not.toContain('min-h-[40px]');
    expect(screen.getByText('Drag it').className).toBe('text-sm');
  });
  it('academy gets the larger touch-friendly controls', () => {
    render(<LivingCanvas slide={slide} hub="academy" fullBleed />);
    expect(screen.getByTitle('Reset game').className).toContain('min-h-[40px]');
    expect(screen.getByText('Drag it').className).toContain('text-base');
  });
});
