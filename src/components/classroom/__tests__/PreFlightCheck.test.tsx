import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreFlightCheck } from '../PreFlightCheck';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
// Return each key's English default (with {{placeholders}} filled) so the screen can be tested without i18n set up.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, arg?: string | { defaultValue?: string; [k: string]: unknown }) => {
      const text = typeof arg === 'string' ? arg : arg?.defaultValue ?? _key;
      const vars = typeof arg === 'object' ? arg : {};
      return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => String(vars[k] ?? ''));
    },
  }),
}));
vi.mock('@/hooks/usePreFlightCheck', () => ({ usePreFlightCheck: () => hook.state }));

const base = () => ({
  cameraStatus: 'passed', micStatus: 'passed', speakerStatus: 'idle',
  videoStream: null, audioLevel: 0, micHeard: false, micTestPhase: 'idle', micTestSeconds: 3,
  micError: null, runMicRecordTest: vi.fn(), runCameraCheck: vi.fn(), runMicCheck: vi.fn(),
  playSpeakerTest: vi.fn(), confirmSpeaker: vi.fn(), cleanup: vi.fn(),
  videoDevices: [], audioInputDevices: [], audioOutputDevices: [],
  selectedVideoDevice: '', selectedAudioInput: '', selectedAudioOutput: '',
  setSelectedVideoDevice: vi.fn(), setSelectedAudioInput: vi.fn(), setSelectedAudioOutput: vi.fn(),
});

describe('PreFlightCheck', () => {
  beforeEach(() => { hook.state = base(); });

  it('keeps Join disabled until camera, microphone (heard) and speaker pass', () => {
    render(<PreFlightCheck onComplete={vi.fn()} />);
    expect((screen.getByRole('button', { name: 'Join lesson' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables Join when everything has been tested', () => {
    hook.state = { ...base(), micHeard: true, speakerStatus: 'passed' };
    const onComplete = vi.fn();
    render(<PreFlightCheck onComplete={onComplete} />);
    const join = screen.getByRole('button', { name: 'Join lesson' }) as HTMLButtonElement;
    expect(join.disabled).toBe(false);
    fireEvent.click(join);
    expect(onComplete).toHaveBeenCalled();
  });

  it('has no way to skip the check: Join stays off until every device is tested', () => {
    render(<PreFlightCheck onComplete={vi.fn()} />);
    expect(screen.queryByText(/skip/i)).toBeNull();
    expect(screen.getByText('Test your camera, microphone and speaker to join.')).toBeTruthy();
  });

  it('starts the record-and-play-back mic test', () => {
    const s = base();
    hook.state = s;
    render(<PreFlightCheck onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText(/Record 3 seconds and play it back/));
    expect(s.runMicRecordTest).toHaveBeenCalled();
  });
});
