import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn() } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'U' } }) }));

import { pickNextLesson } from './useResumeTarget';

const L = (id: string, order: number | null) => ({ id, title: id, target_system: 'kids', sequence_order: order });

describe('the next lesson follows the curriculum order', () => {
  it('is the first lesson, in order, the student has not completed', () => {
    const lessons = [L('c', 3), L('a', 1), L('b', 2), L('d', 4)];
    expect(pickNextLesson(lessons, new Set())?.id).toBe('a');
    expect(pickNextLesson(lessons, new Set(['a']))?.id).toBe('b');
    expect(pickNextLesson(lessons, new Set(['a', 'b']))?.id).toBe('c');
  });
  it('an unfinished lesson stays next until it is completed (a later one never jumps ahead)', () => {
    expect(pickNextLesson([L('a', 1), L('b', 2)], new Set(['b']))?.id).toBe('a');
  });
  it('lessons without an order come last; nothing left means no next lesson', () => {
    expect(pickNextLesson([L('x', null), L('a', 1)], new Set(['a']))?.id).toBe('x');
    expect(pickNextLesson([L('a', 1)], new Set(['a']))).toBeNull();
  });
});
