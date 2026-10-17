// @vitest-environment jsdom
// The lesson player is English only and left-to-right (owner 2026-10-17), even when the app is set to another language.
import i18n from '@/lib/i18n';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LessonPlayer } from '../LessonPlayer';
import type { LessonScript } from '../types';

vi.mock('../services/voice', () => ({ sayLine: vi.fn(async () => false), saySequence: vi.fn(async () => undefined), setMuted: vi.fn(), stopVoice: vi.fn() }));
afterEach(() => { cleanup(); void i18n.changeLanguage('en'); });

const script = { blueprintId: 'B1-S01-E4', title: 't', criteria: ['I can'], cast: ['Vee'], partMinutes: [3, 5, 9, 20, 4, 10, 5, 4], scenes: [{ id: 'lobby', part: 0, kind: 'lobby', heading: 'Ask and React' }, { id: 'x', part: 1, kind: 'lobby', heading: 'Two' }] } as unknown as LessonScript;

describe('English-only lesson player', () => {
  it('shows English chrome and stays left-to-right while the app language is Arabic', async () => {
    await i18n.changeLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
    render(<LessonPlayer script={script} ephemeral role="teacher" index={0} />);
    expect(screen.getByText(/Start the mission/)).toBeTruthy();
    expect(screen.getByTestId('av-root').getAttribute('dir')).toBe('ltr');
    expect(screen.queryByText(/ابدأ/)).toBeNull();
  });
  it('has no player dictionary in any other language', () => {
    for (const l of ['spanish', 'french', 'arabic', 'turkish', 'italian']) expect(fs.existsSync(path.resolve(__dirname, `../../translations/${l}/academyPlayer.ts`)), l).toBe(false);
  });
  it('the full-screen lesson page has no translated text and is left-to-right', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../pages/AcademyPlayerLessonPage.tsx'), 'utf8');
    expect(src).not.toMatch(/useTranslation|\bt\(/);
    expect(src).toMatch(/dir="ltr" lang="en"/);
  });
});
