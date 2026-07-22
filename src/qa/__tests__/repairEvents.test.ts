// Unit test: repair telemetry logger is silent + non-throwing.

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => {
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ insert }));
  return { supabase: { from }, __mock: { from, insert } };
});

import { logRepairEvents } from '../telemetry/repairEvents';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as client from '@/integrations/supabase/client';

const mock = (client as any).__mock;

describe('logRepairEvents', () => {
  it('is a no-op when repairs are empty', async () => {
    await logRepairEvents({ lessonId: 'l1' }, []);
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('inserts one row per repair bucket', async () => {
    mock.from.mockClear();
    mock.insert.mockClear();
    await logRepairEvents(
      { lessonId: 'l1', hub: 'Playground', cefr: 'Pre-A1', lessonKind: 'discovery', verdict: 'repair' },
      [
        { target: 'activity_repair', issue_codes: ['PREA1_FORBIDDEN_ACTIVITY'], locators: [] },
        { target: 'json_regenerate', issue_codes: ['JSON_TRUNCATED_VALUE'], locators: [] },
      ] as any,
    );
    expect(mock.from).toHaveBeenCalledWith('qa_repair_events');
    const rows = mock.insert.mock.calls[0][0];
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      lesson_id: 'l1',
      hub: 'Playground',
      cefr: 'Pre-A1',
      target: 'activity_repair',
      issue_codes: ['PREA1_FORBIDDEN_ACTIVITY'],
      verdict: 'repair',
    });
  });

  it('swallows insert errors silently', async () => {
    mock.insert.mockRejectedValueOnce(new Error('boom'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(
      logRepairEvents({ lessonId: 'l2' }, [
        { target: 'activity_repair', issue_codes: ['X'], locators: [] } as any,
      ]),
    ).resolves.toBeUndefined();
    warn.mockRestore();
  });
});
