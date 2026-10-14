import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const signIn = vi.fn();
const updateUser = vi.fn();
const toast = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { signInWithPassword: (a: unknown) => signIn(a), updateUser: (a: unknown) => updateUser(a) } },
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', email: 'kid@example.com', role: 'teacher' } }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
vi.mock('@/hooks/useStudentLevel', () => ({ useStudentLevel: () => ({ studentLevel: 'playground' }) }));

import '@/lib/i18n';
import { SettingsTab } from '../SettingsTab';

const fill = (cur: string, next: string, conf: string) => {
  fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: cur } });
  fireEvent.change(screen.getByLabelText('New Password'), { target: { value: next } });
  fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: conf } });
  fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
};

describe('Settings: change password', () => {
  beforeEach(() => { signIn.mockReset(); updateUser.mockReset(); toast.mockReset(); });

  it('does not call the server when the new passwords differ', async () => {
    render(<SettingsTab />);
    fill('old-pass-1', 'new-password-1', 'new-password-2');
    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toast.mock.calls[0][0].description).toBe("The new passwords don't match.");
    expect(signIn).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('rejects a short new password', async () => {
    render(<SettingsTab />);
    fill('old-pass-1', 'short', 'short');
    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toast.mock.calls[0][0].description).toMatch(/at least 8/);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('keeps the old password when the current one is wrong', async () => {
    signIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    render(<SettingsTab />);
    fill('wrong-pass', 'new-password-1', 'new-password-1');
    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(signIn).toHaveBeenCalledWith({ email: 'kid@example.com', password: 'wrong-pass' });
    expect(toast.mock.calls[0][0].description).toBe('Your current password is not correct.');
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('verifies the current password, then changes it and clears the form', async () => {
    signIn.mockResolvedValue({ error: null });
    updateUser.mockResolvedValue({ error: null });
    render(<SettingsTab />);
    fill('old-pass-1', 'new-password-1', 'new-password-1');
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ password: 'new-password-1' }));
    await waitFor(() => expect(toast.mock.calls.at(-1)![0].title).toBe('Password updated'));
    expect((screen.getByLabelText('New Password') as HTMLInputElement).value).toBe('');
    expect(signIn.mock.invocationCallOrder[0]).toBeLessThan(updateUser.mock.invocationCallOrder[0]);
  });
});
