import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Daily10Banner } from '../Daily10Banner';
import { emptyPractice, recordDaily10, recordLesson, savePractice } from '../practiceStore';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
const nav = vi.fn();
vi.mock('react-router-dom', async (orig) => ({ ...(await orig<typeof import('react-router-dom')>()), useNavigate: () => nav }));

beforeEach(() => { window.localStorage.clear(); nav.mockClear(); });
afterEach(cleanup);
const show = (today: string) => render(<MemoryRouter><Daily10Banner today={today} /></MemoryRouter>);

describe('Daily10Banner', () => {
  it('is hidden before the first lesson', () => {
    show('2026-10-15');
    expect(screen.queryByLabelText('Daily 10')).toBeNull();
  });
  it('shows how many words are due and starts the Daily 10', () => {
    savePractice('device', recordLesson(emptyPractice(), 'x', ['pin', 'tin', 'map'], '2026-10-14', 3));
    show('2026-10-15');
    expect(screen.getByTestId('daily10-banner-text').textContent).toBe('3 words to practise today');
    fireEvent.click(screen.getByRole('button', { name: 'Start Daily 10' }));
    expect(nav).toHaveBeenCalledWith('/academy-daily-10');
  });
  it('says nothing is due on the day of the lesson, and "done" after a Daily 10', () => {
    savePractice('device', recordLesson(emptyPractice(), 'x', ['pin'], '2026-10-14', 3));
    show('2026-10-14');
    expect(screen.getByTestId('daily10-banner-text').textContent).toMatch(/Nothing is due today/);
    cleanup();
    savePractice('device', recordDaily10(recordLesson(emptyPractice(), 'x', ['pin'], '2026-10-14', 3), [{ item: 'pin', ok: true }], '2026-10-15'));
    show('2026-10-15');
    expect(screen.getByTestId('daily10-banner-text').textContent).toMatch(/Done for today/);
    expect(screen.queryByRole('button', { name: 'Start Daily 10' })).toBeNull();
  });
});
