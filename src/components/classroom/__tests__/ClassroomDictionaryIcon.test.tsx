// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClassroomDictionaryIcon } from '../ClassroomDictionaryIcon';

vi.mock('../oneonone/dictionary/FloatingDictionary', () => ({ FloatingDictionary: ({ isVisible }: { isVisible: boolean }) => (isVisible ? <div data-testid="dict-open">dictionary</div> : null) }));

describe('classroom dictionary icon', () => {
  it('is one icon button that opens and closes the dictionary', () => {
    render(<ClassroomDictionaryIcon />);
    const b = screen.getByTestId('classroom-dictionary-icon');
    expect(b.getAttribute('aria-label')).toBe('Dictionary');
    expect(screen.queryByTestId('dict-open')).toBeNull();
    fireEvent.click(b);
    expect(screen.getByTestId('dict-open')).toBeTruthy();
    fireEvent.click(b);
    expect(screen.queryByTestId('dict-open')).toBeNull();
  });
});
