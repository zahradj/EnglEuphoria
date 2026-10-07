import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

import { ReferralShareButtons } from './ReferralShareButtons';

const link = 'https://engleuphoria.com/parent-signup?ref=abc12345';
const message = `Join me! ${link}`;
let opened: string[] = [];

beforeEach(() => {
  opened = [];
  vi.stubGlobal('open', (url: string) => { opened.push(url); return null; });
});

describe('referral share buttons', () => {
  it('offers WhatsApp, Facebook, Instagram and LinkedIn', () => {
    render(<ReferralShareButtons link={link} message={message} />);
    for (const name of ['WhatsApp', 'Facebook', 'Instagram', 'LinkedIn']) {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
  });

  it('Facebook opens the sharer with the encoded link', () => {
    render(<ReferralShareButtons link={link} message={message} />);
    fireEvent.click(screen.getByRole('button', { name: 'Facebook' }));
    expect(opened[0]).toContain('facebook.com/sharer/sharer.php');
    expect(opened[0]).toContain(encodeURIComponent(link));
  });

  it('WhatsApp carries the message', () => {
    render(<ReferralShareButtons link={link} message={message} />);
    fireEvent.click(screen.getByRole('button', { name: 'WhatsApp' }));
    expect(opened[0]).toContain('wa.me/?text=');
    expect(decodeURIComponent(opened[0])).toContain('abc12345');
  });
});
