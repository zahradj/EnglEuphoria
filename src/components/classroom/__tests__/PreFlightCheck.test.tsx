import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreFlightCheck } from '../PreFlightCheck';

const hook = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
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

  it('lets someone skip the check so a missing device never locks them out', () => {
    const onComplete = vi.fn();
    render(<PreFlightCheck onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Skip the check and join anyway'));
    expect(onComplete).toHaveBeenCalled();
  });

  it('starts the record-and-play-back mic test', () => {
    const s = base();
    hook.state = s;
    render(<PreFlightCheck onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText(/Record 3 seconds and play it back/));
    expect(s.runMicRecordTest).toHaveBeenCalled();
  });
});
