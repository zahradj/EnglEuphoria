import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnhancedVideoService } from '../enhancedVideoService';
import type { EnhancedVideoConfig } from '../types';

// Mock window.JitsiMeetExternalAPI
const mockJitsiApi = {
  dispose: vi.fn(),
  executeCommand: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

global.window.JitsiMeetExternalAPI = vi.fn(() => mockJitsiApi) as any;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{
        stop: vi.fn(),
        kind: 'video',
        enabled: true
      }],
      getVideoTracks: () => [{ stop: vi.fn(), enabled: true }],
      getAudioTracks: () => [{ stop: vi.fn(), enabled: true }],
    }),
    getDisplayMedia: vi.fn(),
  },
  configurable: true,
});

describe('EnhancedVideoService - Lifecycle & Race Conditions', () => {
  let service: EnhancedVideoService;
  let config: EnhancedVideoConfig;
  let connectionCallback: (connected: boolean) => void;

  beforeEach(() => {
    vi.useFakeTimers();
    connectionCallback = vi.fn() as (connected: boolean) => void;
    
    config = {
      roomName: 'test-room',
      displayName: 'Test User',
      domain: 'meet.jit.si',
      enableRecording: false,
      enableScreenShare: false,
    };

    service = new EnhancedVideoService(config, {
      onConnectionStatusChanged: connectionCallback,
    });
  });

  afterEach(async () => {
    await service.dispose();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should prevent connection callback after leaveRoom during join timeout', async () => {
    // Initialize service
    await service.initialize();

    // Start join (which sets 2s timeout for connection callback)
    const joinPromise = service.joinRoom();
    
    // Immediately leave before timeout fires
    await service.leaveRoom();

    // Advance timers past the connection timeout
    vi.advanceTimersByTime(3000);

    // Wait for any pending promises
    await vi.runAllTimersAsync();

    // Connection callback should NOT have been called because leave() cleared the timeout
    expect(connectionCallback).not.toHaveBeenCalledWith(true);
  });

  it('should handle dispose() idempotently', async () => {
    await service.initialize();
    await service.joinRoom();

    // Dispose twice
    await service.dispose();
    await service.dispose();

    // leaveRoom should only be called once (inside first dispose)
    // Verify by checking that mediaDevices.getUserMedia was only called once during join
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('should not invoke callbacks after dispose', async () => {
    await service.initialize();
    await service.joinRoom();

    // Dispose the service
    await service.dispose();

    // Try to advance timers (connection timeout would fire here)
    vi.advanceTimersByTime(5000);
    await vi.runAllTimersAsync();

    // Connection callback should not be called after dispose
    expect(connectionCallback).not.toHaveBeenCalledWith(true);
  });

  it('should cleanup media tracks on leaveRoom', async () => {
    await service.initialize();
    await service.joinRoom();

    const stream = service.getLocalStream();
    const stopSpy = vi.spyOn(stream!.getTracks()[0], 'stop');

    await service.leaveRoom();

    expect(stopSpy).toHaveBeenCalled();
    expect(service.getLocalStream()).toBeNull();
  });

  it('should clear connection timeout when leaving during join', async () => {
    await service.initialize();
    
    // Start join
    service.joinRoom();
    
    // Leave immediately (should clear the 2s timeout)
    await service.leaveRoom();
    
    // Advance past timeout period
    vi.advanceTimersByTime(3000);
    
    // Connection callback should never fire
    expect(connectionCallback).not.toHaveBeenCalled();
  });
});
