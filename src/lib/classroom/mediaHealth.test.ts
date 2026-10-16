import { describe, it, expect } from 'vitest';
import {
  buildMediaStatus,
  cameraIssueFromError,
  classifyQuality,
  linkStatsFromReport,
  parsePeerMediaStatus,
  worstQuality,
} from './mediaHealth';

const report = (items: Record<string, unknown>[]) => ({ forEach: (cb: (r: Record<string, unknown>) => void) => items.forEach(cb) });

describe('camera problems are named', () => {
  it('maps browser errors to a reason the student can act on', () => {
    expect(cameraIssueFromError('NotAllowedError')).toBe('denied');
    expect(cameraIssueFromError('NotReadableError')).toBe('in_use');
    expect(cameraIssueFromError('AbortError')).toBe('in_use');
    expect(cameraIssueFromError('NotFoundError')).toBe('not_found');
    expect(cameraIssueFromError('OverconstrainedError')).toBe('not_found');
    expect(cameraIssueFromError('SomethingElse')).toBe('unknown');
    expect(cameraIssueFromError(undefined)).toBe('unknown');
  });
});

describe('connection quality', () => {
  it('good / fair / poor thresholds', () => {
    expect(classifyQuality({ lossPct: 0.5, rttMs: 80, jitterMs: 10 })).toBe('good');
    expect(classifyQuality({ lossPct: 4, rttMs: 80, jitterMs: 10 })).toBe('fair');
    expect(classifyQuality({ lossPct: 0.5, rttMs: 250, jitterMs: 10 })).toBe('fair');
    expect(classifyQuality({ lossPct: 12, rttMs: 80, jitterMs: 10 })).toBe('poor');
    expect(classifyQuality({ lossPct: 0.5, rttMs: 500, jitterMs: 10 })).toBe('poor');
  });

  it('reads loss, jitter and round-trip time from WebRTC stats', () => {
    const s = linkStatsFromReport(report([
      { type: 'inbound-rtp', kind: 'video', packetsLost: 5, packetsReceived: 95, jitter: 0.02 },
      { type: 'inbound-rtp', kind: 'audio', packetsLost: 0, packetsReceived: 100, jitter: 0.01 },
      { type: 'candidate-pair', state: 'succeeded', currentRoundTripTime: 0.12 },
    ]));
    expect(s).not.toBeNull();
    expect(s!.lossPct).toBeCloseTo(2.5, 1);
    expect(s!.jitterMs).toBeCloseTo(20, 0);
    expect(s!.rttMs).toBeCloseTo(120, 0);
  });

  it('no incoming media yet: nothing to judge', () => {
    expect(linkStatsFromReport(report([{ type: 'candidate-pair', state: 'succeeded', currentRoundTripTime: 0.1 }]))).toBeNull();
  });

  it('the worst link wins', () => {
    expect(worstQuality([])).toBeNull();
    expect(worstQuality(['good', 'fair'])).toBe('fair');
    expect(worstQuality(['good', 'poor', 'fair'])).toBe('poor');
  });
});

describe('what travels with the heartbeat, and what the other side is told', () => {
  it('a camera problem outranks link quality; otherwise the quality, else ok', () => {
    expect(buildMediaStatus({ cameraIssue: 'in_use', quality: 'good' })).toBe('cam:in_use');
    expect(buildMediaStatus({ cameraIssue: null, quality: 'poor' })).toBe('poor');
    expect(buildMediaStatus({ cameraIssue: null, quality: null })).toBe('ok');
  });
  it('the peer is told only about problems', () => {
    expect(parsePeerMediaStatus('cam:denied')).toEqual({ kind: 'no-camera', reason: 'denied' });
    expect(parsePeerMediaStatus('cam:weird')).toEqual({ kind: 'no-camera', reason: 'unknown' });
    expect(parsePeerMediaStatus('poor')).toEqual({ kind: 'poor-link' });
    for (const quiet of ['ok', 'good', 'fair', '', null, undefined]) expect(parsePeerMediaStatus(quiet as unknown as string)).toBeNull();
  });
});
