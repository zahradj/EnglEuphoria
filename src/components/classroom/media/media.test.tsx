import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@/lib/i18n';
import { CameraIssueBanner } from './CameraIssueBanner';
import { PeerMediaNotice } from './PeerMediaNotice';
import { mediaStatusStore } from '@/lib/classroom/mediaStatusStore';

beforeEach(() => mediaStatusStore.reset());

describe('CameraIssueBanner', () => {
  it('shows nothing when the camera is fine', () => {
    const { container } = render(<CameraIssueBanner issue={null} onRetry={async () => true} />);
    expect(container.textContent).toBe('');
  });

  it('names the problem and offers Try again', () => {
    render(<CameraIssueBanner issue="in_use" onRetry={async () => true} />);
    expect(screen.getByRole('alert').textContent).toMatch(/another app or tab is using your camera/i);
    expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
  });

  it('Try again calls back, and says so when the camera is back', async () => {
    const onRetry = vi.fn().mockResolvedValue(true);
    const { rerender } = render(<CameraIssueBanner issue="denied" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(onRetry).toHaveBeenCalledTimes(1));
    rerender(<CameraIssueBanner issue={null} onRetry={onRetry} />);
    expect(await screen.findByText(/your camera is back/i)).toBeTruthy();
  });

  it('keeps the banner and says so when the camera is still not available', async () => {
    render(<CameraIssueBanner issue="not_found" onRetry={async () => false} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText(/still no camera/i)).toBeTruthy();
  });
});

describe('PeerMediaNotice', () => {
  it('stays quiet while the other side is fine', () => {
    mediaStatusStore.setPeer('good');
    const { container } = render(<PeerMediaNotice peerRole="student" />);
    expect(container.textContent).toBe('');
  });

  it("tells the teacher the student's camera problem and why (so they can help)", () => {
    render(<PeerMediaNotice peerRole="student" />);
    act(() => mediaStatusStore.setPeer('cam:in_use'));
    expect(screen.getByRole('status').textContent).toMatch(/the student's camera isn't working: another app is using it/i);
  });

  it('warns about a weak connection (not blaming the camera)', () => {
    render(<PeerMediaNotice peerRole="teacher" />);
    act(() => mediaStatusStore.setPeer('poor'));
    expect(screen.getByRole('status').textContent).toMatch(/your teacher's internet connection is weak/i);
  });
});
