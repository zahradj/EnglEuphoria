/**
 * Camera / connection health for the live classroom — pure helpers (no browser APIs), so they are unit-tested.
 *
 * Why: "the student's video is missing" used to be a mystery. The student joined with audio only (camera blocked, busy or
 * unplugged) and nobody was told; the teacher could not tell a camera problem from a bad connection. Now the camera problem is
 * named for the student (with a Try again button) and a short status string travels with the heartbeat so the teacher sees it too.
 */

export type CameraIssueCode = 'denied' | 'in_use' | 'not_found' | 'lost' | 'unknown';

/** Map a getUserMedia error name to a camera issue. */
export function cameraIssueFromError(errorName: string | undefined | null): CameraIssueCode {
  switch (errorName) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied';
    case 'NotReadableError':
    case 'AbortError':
    case 'TrackStartError':
      return 'in_use';
    case 'NotFoundError':
    case 'OverconstrainedError':
    case 'DevicesNotFoundError':
      return 'not_found';
    default:
      return 'unknown';
  }
}

export type LinkQuality = 'good' | 'fair' | 'poor';

export interface LinkStats {
  /** Percent of packets lost (0-100). */
  lossPct: number;
  /** Round-trip time in ms. */
  rttMs: number;
  /** Jitter in ms. */
  jitterMs: number;
}

/** Rule of thumb used by most WebRTC dashboards: >8% loss or >400 ms RTT = poor, >3% / >200 ms / >50 ms jitter = fair. */
export function classifyQuality(s: LinkStats): LinkQuality {
  if (s.lossPct > 8 || s.rttMs > 400 || s.jitterMs > 100) return 'poor';
  if (s.lossPct > 3 || s.rttMs > 200 || s.jitterMs > 50) return 'fair';
  return 'good';
}

/** Read loss / rtt / jitter out of an RTCStatsReport (inbound audio+video and the active candidate pair). */
export function linkStatsFromReport(report: { forEach: (cb: (r: Record<string, unknown>) => void) => void }): LinkStats | null {
  let lost = 0;
  let received = 0;
  let jitterMs = 0;
  let rttMs = 0;
  let sawMedia = false;
  report.forEach((r) => {
    if (r.type === 'inbound-rtp' && (r.kind === 'video' || r.kind === 'audio')) {
      sawMedia = true;
      lost += Number(r.packetsLost ?? 0);
      received += Number(r.packetsReceived ?? 0);
      if (typeof r.jitter === 'number') jitterMs = Math.max(jitterMs, r.jitter * 1000);
    }
    if (r.type === 'candidate-pair' && (r.state === 'succeeded' || r.nominated) && typeof r.currentRoundTripTime === 'number') {
      rttMs = Math.max(rttMs, r.currentRoundTripTime * 1000);
    }
  });
  if (!sawMedia) return null;
  const total = lost + received;
  return { lossPct: total > 0 ? (Math.max(0, lost) / total) * 100 : 0, rttMs, jitterMs };
}

/** The worst quality across several peer connections. */
export function worstQuality(list: LinkQuality[]): LinkQuality | null {
  if (list.length === 0) return null;
  if (list.includes('poor')) return 'poor';
  if (list.includes('fair')) return 'fair';
  return 'good';
}

/** What travels with the heartbeat: 'good' | 'fair' | 'poor' | 'cam:<code>' | 'ok'. A camera problem outranks link quality. */
export function buildMediaStatus(opts: { cameraIssue: CameraIssueCode | null; quality: LinkQuality | null }): string {
  if (opts.cameraIssue) return `cam:${opts.cameraIssue}`;
  return opts.quality ?? 'ok';
}

export interface PeerMediaNotice {
  kind: 'no-camera' | 'poor-link';
  /** For a camera problem: why, so the other person can help. */
  reason?: CameraIssueCode;
}

/** Turn the peer's status string into something to show, or null when there is nothing to say. */
export function parsePeerMediaStatus(status: string | null | undefined): PeerMediaNotice | null {
  if (!status) return null;
  if (status.startsWith('cam:')) {
    const code = status.slice(4) as CameraIssueCode;
    return { kind: 'no-camera', reason: (['denied', 'in_use', 'not_found', 'lost', 'unknown'] as const).includes(code) ? code : 'unknown' };
  }
  if (status === 'poor') return { kind: 'poor-link' };
  return null; // ok / good / fair: stay quiet
}
