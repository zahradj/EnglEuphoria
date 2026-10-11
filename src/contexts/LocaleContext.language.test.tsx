import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/lib/i18n';
import { LocaleProvider } from './LocaleContext';
import { markLanguagePicked, clearLanguagePicked, dirFor, hasPickedLanguage } from '@/lib/languageChoice';

// No network: the geo-IP lookup must not run (a saved region skips it).
const mount = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleProvider><div /></LocaleProvider>
    </MemoryRouter>,
  );

describe('language: a visitor\'s own choice beats the region default', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('eu_region', 'INTL'); // sticky region -> no geo-IP call
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    await i18n.changeLanguage('en');
    clearLanguagePicked();
  });

  it('with no choice, the region language is the default (/ar -> Arabic, right-to-left)', async () => {
    mount('/ar');
    await waitFor(() => expect(i18n.language.startsWith('ar')).toBe(true));
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('after the visitor picked English, a region page does NOT switch them back', async () => {
    markLanguagePicked();
    await i18n.changeLanguage('en');
    mount('/ar');
    await new Promise((r) => setTimeout(r, 50));
    expect(i18n.language.startsWith('en')).toBe(true);
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('direction follows the language, not the region', () => {
    expect(dirFor('ar')).toBe('rtl');
    expect(dirFor('ar-DZ')).toBe('rtl');
    expect(dirFor('fr')).toBe('ltr');
    expect(dirFor(undefined)).toBe('ltr');
    markLanguagePicked();
    expect(hasPickedLanguage()).toBe(true);
    clearLanguagePicked();
    expect(hasPickedLanguage()).toBe(false);
  });
});
