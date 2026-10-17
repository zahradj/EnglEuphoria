import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { TEACHER_ADVANCES, hideButtonsWithHandler, useHideTeacherOnlyButtons } from './teacherAdvancesOnly';

function Scene({ onNext, guided }: { onNext: () => void; guided: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useHideTeacherOnlyButtons(ref, guided, 's1');
  return (
    <div ref={ref}>
      <button onClick={onNext}>Next ⭐</button>
      <button onClick={() => undefined}>Turn the page</button>
    </div>
  );
}

describe('only the teacher changes the slide', () => {
  it('hides the buttons that carry the do-nothing onNext, and only those', () => {
    const host = document.createElement('div');
    const a = document.createElement('button');
    host.appendChild(a);
    expect(hideButtonsWithHandler(host, TEACHER_ADVANCES)).toBe(0); // not a React element: nothing to match
    render(<Scene onNext={TEACHER_ADVANCES} guided />);
    expect((screen.getByText('Next ⭐') as HTMLElement).style.display).toBe('none');
    expect((screen.getByText('Turn the page') as HTMLElement).style.display).not.toBe('none');
  });
  it('leaves the buttons alone for the teacher (real onNext) and for solo play', () => {
    const real = vi.fn();
    render(<Scene onNext={real} guided={false} />);
    expect((screen.getByText('Next ⭐') as HTMLElement).style.display).not.toBe('none');
  });
  it('the do-nothing onNext does nothing', () => {
    expect(TEACHER_ADVANCES()).toBeUndefined();
  });
});
