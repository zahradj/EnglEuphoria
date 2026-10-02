import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import EscapeRoomSlot from '../EscapeRoomSlot';
import type { EscapeRoom } from '../types';

/**
 * Regression guard: the Academy "quest" restyle of the escape room must NEVER leak into Playground or
 * Success, which render the same component through their own players (PlaygroundLessonPlayer, SuccessDemo).
 */
const room = (hub: 'playground' | 'academy' | 'success'): EscapeRoom => ({
  hub, cefr: 'A1', title: 'Test room', target_skill: 'x', target_ref_ids: [],
  doors: [{
    id: 'd1', kind: 'unscramble', target_ref: 'cat', door_label: 'Door 1', door_narration: 'Narration', hint: 'hint',
    solve_feedback: 'ok', image_prompt: '', image_url: null, scrambled: 'tac', answer: 'cat',
  }],
  final_reward: { message: 'done', image_prompt: '', image_url: null },
});

describe('EscapeRoomSlot hub scoping', () => {
  it.each(['playground', 'success'] as const)('%s keeps the original shadcn theme classes', (hub) => {
    const { container } = render(<EscapeRoomSlot hub={hub} cefr="A1" room={room(hub)} />);
    const html = container.innerHTML;
    expect(html).toContain('bg-card');
    expect(html).toContain('bg-primary text-primary-foreground');
    expect(html).not.toContain('emerald');
  });
  it('academy gets the high-contrast themed card', () => {
    const { container } = render(<EscapeRoomSlot hub="academy" cefr="B1" room={room('academy')} />);
    const html = container.innerHTML;
    expect(html).toContain('border-emerald-700');
    expect(html).toContain('bg-emerald-700');
    expect(html).not.toContain('bg-card');
  });
});
