import { describe, expect, it, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn() }, auth: {} },
  supabaseUrl: 'http://localhost',
  supabaseAnonKey: 'anon',
}));
vi.mock('@/hooks/usePWA', () => ({ usePWA: () => ({ capabilities: { isInstalled: false, isInstallable: false }, installApp: vi.fn() }) }));
vi.mock('@/components/Logo', () => ({ Logo: () => null }));
vi.mock('@/components/ui/AnimatedLogo', () => ({ default: () => null }));

import i18n from '@/lib/i18n';
import UnsubscribePage from '../UnsubscribePage';
import ParentNotifications from '../parent/ParentNotifications';
import InstallPage from '../InstallPage';

// Account / parent / visitor pages follow the chosen language; English stays the default.
describe('account pages are translated', () => {
  afterEach(async () => { await i18n.changeLanguage('en'); });

  it('unsubscribe page: invalid link in Arabic, English by default', async () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/unsubscribe']}><UnsubscribePage /></MemoryRouter>);
    expect(await screen.findByText('Invalid Link')).toBeTruthy();
    unmount();
    await i18n.changeLanguage('ar');
    render(<MemoryRouter initialEntries={['/unsubscribe']}><UnsubscribePage /></MemoryRouter>);
    expect(await screen.findByText('رابط غير صالح')).toBeTruthy();
  });

  it('parent preferences page: missing token in French', async () => {
    await i18n.changeLanguage('fr');
    render(<MemoryRouter initialEntries={['/parent/notifications']}><ParentNotifications /></MemoryRouter>);
    expect(await screen.findByText('Le jeton est absent du lien.')).toBeTruthy();
    expect(screen.getByText('Préférences e-mail')).toBeTruthy();
  });

  it('install page keeps the bold words inside translated steps', async () => {
    await i18n.changeLanguage('es');
    const { container } = render(<MemoryRouter><InstallPage /></MemoryRouter>);
    expect(screen.getByText('Descarga la app')).toBeTruthy();
    const bold = Array.from(container.querySelectorAll('strong')).map((n) => n.textContent);
    expect(bold).toContain('Safari');
    expect(bold).toContain('Compartir');
    expect(bold).toContain('Añadir a pantalla de inicio');
  });
});
