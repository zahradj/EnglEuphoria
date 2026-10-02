import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useState } from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: () => ({ insert: vi.fn().mockResolvedValue({}) }),
  },
}));

import { SlideErrorBoundary, RenderGuard } from '../PlayerSafety';

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('boom');
  return <div>healthy slide</div>;
}

describe('SlideErrorBoundary', () => {
  it('shows a friendly card with Try again + Skip instead of crashing the lesson, and Skip calls back', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onSkip = vi.fn();
    render(
      <SlideErrorBoundary resetKey={1} slide={{ type: 'matching' }} canSkip onSkip={onSkip}>
        <Bomb explode />
      </SlideErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent("didn't load");
    fireEvent.click(screen.getByText('Skip ▶'));
    expect(onSkip).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('recovers automatically when the student moves to a different slide', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Harness() {
      const [k, setK] = useState(1);
      return (
        <>
          <button onClick={() => setK(2)}>next</button>
          <SlideErrorBoundary resetKey={k} slide={{ type: 'x' }} canSkip onSkip={() => {}}>
            <Bomb explode={k === 1} />
          </SlideErrorBoundary>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByText('next'));
    expect(screen.getByText('healthy slide')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('does not offer Skip on the last slide', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <SlideErrorBoundary resetKey={1} slide={{ type: 'x' }} canSkip={false} onSkip={() => {}}>
        <Bomb explode />
      </SlideErrorBoundary>,
    );
    expect(screen.queryByText('Skip ▶')).toBeNull();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    spy.mockRestore();
  });
});

describe('RenderGuard', () => {
  it('offers a skip when a slide renders nothing (unsupported slide type)', async () => {
    vi.useFakeTimers();
    const onSkip = vi.fn();
    render(
      <RenderGuard resetKey={1} slide={{ type: 'future_type' }} canSkip onSkip={onSkip}>
        {null}
      </RenderGuard>,
    );
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(screen.getByRole('alert')).toHaveTextContent("isn't available here yet");
    fireEvent.click(screen.getByText('Skip ▶'));
    expect(onSkip).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('leaves a normal slide untouched', async () => {
    vi.useFakeTimers();
    render(
      <RenderGuard resetKey={1} slide={{ type: 'ok' }} canSkip onSkip={() => {}}>
        <p>normal content</p>
      </RenderGuard>,
    );
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(screen.getByText('normal content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    vi.useRealTimers();
  });
});
