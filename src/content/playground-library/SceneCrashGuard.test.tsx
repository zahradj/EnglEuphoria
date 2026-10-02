import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { SceneCrashGuard } from './SceneCrashGuard';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) }, from: () => ({ insert: vi.fn(async () => ({})) }) },
}));

const flush = async (steps = 6) => { for (let i = 0; i < steps; i++) await act(async () => { await vi.advanceTimersByTimeAsync(500); }); };
const baseProps = { sceneId: 's1', sceneKind: 'sound-model', side: 'student mirror', canSkip: false, onSkip: () => {} };

describe('SceneCrashGuard: one broken activity never ends the lesson', () => {
  afterEach(() => vi.useRealTimers());

  it('a crash caused by live sync heals itself: retry, then safe mode (sync off) — no card ever shown', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const modes: boolean[] = [];
    // Crashes whenever it is handed the teacher's live state, like the real mirror crash.
    const MirrorOnlyBug = ({ live }: { live: boolean }) => { if (live) throw new Error('bad snapshot'); return <div>activity running</div>; };
    render(
      <SceneCrashGuard {...baseProps}>
        {({ safeMode }) => { modes.push(safeMode); return <MirrorOnlyBug live={!safeMode} />; }}
      </SceneCrashGuard>,
    );
    await flush();
    expect(screen.getByText('activity running')).toBeTruthy();
    expect(screen.queryByText('This activity hit a snag')).toBeNull();
    expect(modes.at(-1)).toBe(true); // ended in safe mode
  });

  it('a one-off glitch is remounted quietly and stays in normal (synced) mode', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let crashes = 1;
    const modes: boolean[] = [];
    const Flaky = () => { if (crashes-- > 0) throw new Error('once'); return <div>fine now</div>; };
    render(<SceneCrashGuard {...baseProps}>{({ safeMode }) => { modes.push(safeMode); return <Flaky />; }}</SceneCrashGuard>);
    await flush();
    expect(screen.getByText('fine now')).toBeTruthy();
    expect(modes.at(-1)).toBe(false);
  });

  it('a scene that is broken for everyone ends on the card — and the teacher can skip it', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onSkip = vi.fn();
    const Broken = () => { throw new Error('always'); };
    render(<SceneCrashGuard {...baseProps} canSkip onSkip={onSkip}>{() => <Broken />}</SceneCrashGuard>);
    await flush();
    expect(screen.getByText('This activity hit a snag')).toBeTruthy();
    fireEvent.click(screen.getByText('Skip this activity'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('a student cannot skip (the teacher drives navigation) but can reload', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => { throw new Error('always'); };
    render(<SceneCrashGuard {...baseProps} canSkip={false}>{() => <Broken />}</SceneCrashGuard>);
    await flush();
    expect(screen.queryByText('Skip this activity')).toBeNull();
    expect(screen.getByText('Reload this activity')).toBeTruthy();
  });
});
