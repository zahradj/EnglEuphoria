import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyPractice, loadPractice, mergePractice, recordDaily10, recordLesson, savePractice } from '@/academy-deck/practiceStore';

const rows: { data: unknown } = { data: null };
let failTable = false;
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => (failTable ? { data: null, error: new Error('no table') } : { data: rows.data ? { data: rows.data, updated_at: 'x' } : null, error: null }) }) }),
      upsert: async (row: { data: unknown }) => { if (failTable) return { error: new Error('no table') }; rows.data = row.data; return { error: null }; },
    }),
  },
}));
import { syncPractice } from '../academyPracticeService';

beforeEach(() => { window.localStorage.clear(); rows.data = null; failTable = false; });

describe('mergePractice', () => {
  it('keeps the later practice of each item, the later play of each lesson and all Daily 10 days', () => {
    const a = recordDaily10(recordLesson(emptyPractice(), 'L1', ['pin', 'tin'], '2026-10-14', 5), [{ item: 'pin', ok: true }], '2026-10-15');
    const b = recordDaily10(recordLesson(emptyPractice(), 'L1', ['pin', 'tin'], '2026-10-14', 9), [{ item: 'tin', ok: true }, { item: 'pin', ok: true }, { item: 'pin', ok: true }], '2026-10-16');
    const m = mergePractice(a, b);
    expect(m.items.find((i) => i.item === 'pin')!.lastOn).toBe('2026-10-16');
    expect(m.items.find((i) => i.item === 'tin')!.box).toBe(1);
    expect(m.lessons).toEqual([{ id: 'L1', on: '2026-10-14', spoken: 9 }]);
    expect(m.daily10Days).toEqual(['2026-10-15', '2026-10-16']);
  });
});

describe('syncPractice', () => {
  it('uploads the device record when the database has none, and merges both ways when it has one', async () => {
    savePractice('u1', recordLesson(emptyPractice(), 'L1', ['pin'], '2026-10-14', 4));
    const first = await syncPractice('u1');
    expect(first.items.length).toBe(1);
    expect(rows.data).toBeTruthy(); // no remote copy => the first call stores the local one
    window.localStorage.clear();
    savePractice('u1', recordLesson(emptyPractice(), 'L2', ['tin'], '2026-10-15', 2));
    const merged = await syncPractice('u1');
    expect(merged.items.map((i) => i.item).sort()).toEqual(['pin', 'tin']);
    expect(loadPractice('u1').lessons.map((l) => l.id).sort()).toEqual(['L1', 'L2']);
  });
  it('fails soft: with no table the browser record is returned unchanged', async () => {
    failTable = true;
    savePractice('u1', recordLesson(emptyPractice(), 'L1', ['pin'], '2026-10-14', 4));
    const r = await syncPractice('u1');
    expect(r.items.map((i) => i.item)).toEqual(['pin']);
  });
});
