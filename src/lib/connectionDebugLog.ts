/**
 * In-memory ring buffer for live classroom connection diagnostics.
 *
 * Captures Supabase Realtime channel status changes, WebRTC signaling
 * lifecycle events, and any errors thrown along the way. The buffer is
 * shared across hooks and consumed by the teacher's ConnectionDebugPanel.
 */

export type ConnectionLogLevel = 'info' | 'warn' | 'error';
export type ConnectionLogSource = 'realtime' | 'webrtc' | 'peer' | 'system';

export interface ConnectionLogEntry {
  id: string;
  ts: number;
  level: ConnectionLogLevel;
  source: ConnectionLogSource;
  message: string;
  /** Optional structured payload (status code, channel name, error stack…) */
  data?: Record<string, unknown>;
}

const MAX_ENTRIES = 50;

class ConnectionDebugLogStore {
  private entries: ConnectionLogEntry[] = [];
  private listeners = new Set<(entries: ConnectionLogEntry[]) => void>();

  push(entry: Omit<ConnectionLogEntry, 'id' | 'ts'>) {
    const full: ConnectionLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
    };
    this.entries = [...this.entries, full].slice(-MAX_ENTRIES);
    this.emit();
  }

  clear() {
    this.entries = [];
    this.emit();
  }

  getAll(): ConnectionLogEntry[] {
    return this.entries;
  }

  subscribe(listener: (entries: ConnectionLogEntry[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.entries);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snapshot = this.entries;
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const connectionDebugLog = new ConnectionDebugLogStore();

/** Tiny helpers so call sites stay readable. */
export const logRealtime = (
  level: ConnectionLogLevel,
  message: string,
  data?: Record<string, unknown>,
) => connectionDebugLog.push({ level, source: 'realtime', message, data });

export const logWebRTC = (
  level: ConnectionLogLevel,
  message: string,
  data?: Record<string, unknown>,
) => connectionDebugLog.push({ level, source: 'webrtc', message, data });

export const logPeer = (
  level: ConnectionLogLevel,
  message: string,
  data?: Record<string, unknown>,
) => connectionDebugLog.push({ level, source: 'peer', message, data });

const SOURCE_LABEL: Record<ConnectionLogSource, string> = {
  realtime: 'Sync',
  webrtc: 'Signaling',
  peer: 'Peer',
  system: 'System',
};

/**
 * Plain-text snapshot of the most recent connection events, for pasting into
 * a support ticket from outside the classroom (e.g. the dashboard's
 * Technical Support tab). Unlike ConnectionDebugPanel's buildCopyPayload,
 * there's no live realtime/signaling/peer status to report here — only
 * whatever the in-memory log still holds from the last class.
 */
export function formatDiagnosticsSnapshot(): string {
  const entries = connectionDebugLog.getAll();
  if (entries.length === 0) {
    return '(no connection events captured yet — join a class first, then come back here)';
  }
  const header = [
    '=== EnglEuphoria Connection Log (from last class) ===',
    `Captured: ${new Date().toISOString()}`,
    `User-Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a'}`,
    '--- Events (newest first) ---',
  ].join('\n');
  const body = [...entries]
    .reverse()
    .map((e) => {
      const d = new Date(e.ts);
      const ts = d.toLocaleTimeString([], { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
      const dataStr = e.data && Object.keys(e.data).length ? ' ' + JSON.stringify(e.data) : '';
      return `[${ts}] ${e.level.toUpperCase().padEnd(5)} ${SOURCE_LABEL[e.source] ?? e.source} — ${e.message}${dataStr}`;
    })
    .join('\n');
  return `${header}\n${body}\n`;
}
