import { describe, expect, it, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/Logo', () => ({ Logo: () => null }));

import i18n from '@/lib/i18n';
import StudentApplication from '../StudentApplication';

const open = () => render(<MemoryRouter><StudentApplication /></MemoryRouter>);

describe('student application (onboarding) is translated', () => {
  afterEach(async () => { await i18n.changeLanguage('en'); });

  it('English by default', () => {
    open();
    expect(screen.getByText('Tell us about yourself! 👋')).toBeTruthy();
    expect(screen.getByText('Step 1 of 6')).toBeTruthy();
  });

  it('shows Spanish labels, and the goal list too after two steps', async () => {
    await i18n.changeLanguage('es');
    open();
    expect(screen.getByText('¡Cuéntanos sobre ti! 👋')).toBeTruthy();
    expect(screen.getByText('Paso 1 de 6')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(screen.getByText('Mejores notas en el colegio')).toBeTruthy();
    expect(screen.queryByText('Better grades in school')).toBeNull();
  });
});
