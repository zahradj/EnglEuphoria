import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Trash2,
  X,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  connectionDebugLog,
  type ConnectionLogEntry,
  type ConnectionLogLevel,
} from '@/lib/connectionDebugLog';
import { cn } from '@/lib/utils';
import { getClassroomHubTheme, type ClassroomHubKey } from '@/components/teacher/classroom/hubClassroomTheme';

export type ConnectionHealthStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected';

interface ConnectionDebugPanelProps {
  /** Realtime sync channel status. */
  realtimeStatus: ConnectionHealthStatus;
  /** Whether WebRTC signaling is SUBSCRIBED. */
  signalingReady: boolean;
  /** Whether the peer connection has produced a remote stream (student visible). */
  peerConnected: boolean;
  /** Optional room/classroom id for the copy payload. */
  roomId?: string;
  /** Hide the panel entirely (e.g. for non-teachers). */
  disabled?: boolean;
  /** Hub for brand coloring. */
  hubType?: ClassroomHubKey | 'professional' | string;
}


const LEVEL_STYLES: Record<ConnectionLogLevel, string> = {
  info: 'text-emerald-400',
  warn: 'text-amber-400',
  error: 'text-rose-400',
};

const SOURCE_LABEL: Record<string, string> = {
  realtime: 'Sync',
  webrtc: 'Signaling',
  peer: 'Peer',
  system: 'System',
};

function useConnectionLog(): ConnectionLogEntry[] {
  const [entries, setEntries] = useState<ConnectionLogEntry[]>(() =>
    connectionDebugLog.getAll(),
  );
  useEffect(() => connectionDebugLog.subscribe(setEntries), []);
  return entries;
}

function formatTimestamp(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour12: false }) +
    '.' + String(d.getMilliseconds()).padStart(3, '0');
}

function buildCopyPayload(opts: {
  entries: ConnectionLogEntry[];
  realtimeStatus: ConnectionHealthStatus;
  signalingReady: boolean;
  peerConnected: boolean;
  roomId?: string;
}): string {
  const { entries, realtimeStatus, signalingReady, peerConnected, roomId } = opts;
  const header = [
    '=== EnglEuphoria Classroom Diagnostics ===',
    `Captured: ${new Date().toISOString()}`,
    roomId ? `Room: ${roomId}` : null,
    `User-Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a'}`,
    '--- Snapshot ---',
    `Realtime sync : ${realtimeStatus}`,
    `Signaling     : ${signalingReady ? 'SUBSCRIBED' : 'NOT READY'}`,
    `Peer (video)  : ${peerConnected ? 'CONNECTED' : 'NOT CONNECTED'}`,
    '--- Last events (newest first) ---',
  ].filter(Boolean).join('\n');

  const body = entries.length === 0
    ? '(no events captured yet)'
    : [...entries].reverse().map((e) => {
        const dataStr = e.data && Object.keys(e.data).length
          ? ' ' + JSON.stringify(e.data)
          : '';
        return `[${formatTimestamp(e.ts)}] ${e.level.toUpperCase().padEnd(5)} ${SOURCE_LABEL[e.source] ?? e.source} — ${e.message}${dataStr}`;
      }).join('\n');

  return `${header}\n${body}\n`;
}

/**
 * Teacher-only floating diagnostic panel that surfaces the latest
 * Supabase Realtime + WebRTC events. Auto-opens when the student is
 * stuck on Disconnected or "Waiting for student", and offers a one-click
 * copy of the full diagnostic payload for support.
 */
export const ConnectionDebugPanel: React.FC<ConnectionDebugPanelProps> = ({
  realtimeStatus,
  signalingReady,
  peerConnected,
  roomId,
  disabled,
  hubType = 'academy',
}) => {
  const hubTheme = getClassroomHubTheme(hubType);
  const accentHex = hubTheme.accentHex;
  const entries = useConnectionLog();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const isUnhealthy = useMemo(() => {
    if (realtimeStatus !== 'connected') return true;
    if (!signalingReady) return true;
    if (!peerConnected) return true;
    return false;
  }, [realtimeStatus, signalingReady, peerConnected]);

  const errorCount = useMemo(
    () => entries.filter((e) => e.level === 'error').length,
    [entries],
  );

  // Auto-open when unhealthy for >8s; auto-dismiss the dismissal once healthy again
  useEffect(() => {
    if (disabled) return;
    if (!isUnhealthy) {
      setUserDismissed(false);
      return;
    }
    if (open || userDismissed) return;
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, [isUnhealthy, open, userDismissed, disabled]);

  if (disabled) return null;

  const handleCopy = async () => {
    const payload = buildCopyPayload({
      entries,
      realtimeStatus,
      signalingReady,
      peerConnected,
      roomId,
    });
    try {
      await navigator.clipboard.writeText(payload);
      toast({
        title: 'Diagnostics copied',
        description: 'Paste into Slack, an email, or a bug report.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Your browser blocked clipboard access.',
        variant: 'destructive',
      });
    }
  };

  // Floating launcher button (always available to teachers)
  if (!open) {
    return (
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        style={
          isUnhealthy
            ? undefined
            : { borderColor: `${accentHex}66`, color: accentHex, backgroundColor: `${accentHex}1A` }
        }
        className={cn(
          'fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-xl transition-colors',
          isUnhealthy && 'border-rose-400/50 bg-rose-500/15 text-rose-100 shadow-rose-900/30',
        )}
        aria-label="Open connection diagnostics"
      >
        {isUnhealthy ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
        <span>{isUnhealthy ? 'Connection issue' : 'Connection OK'}</span>
        {errorCount > 0 && (
          <Badge variant="destructive" className="h-4 px-1.5 text-[10px] leading-none">
            {errorCount}
          </Badge>
        )}
        <Bug className="h-3.5 w-3.5 opacity-70" />
      </motion.button>

    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="debug-panel"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          borderColor: `${accentHex}55`,
          boxShadow: `0 24px 60px -15px ${accentHex}55`,
          backgroundColor: 'rgba(15,23,42,0.55)',
        }}
        className="fixed bottom-4 right-4 z-[60] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border text-slate-100 backdrop-blur-2xl"
        role="dialog"
        aria-label="Classroom connection diagnostics"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3"
          style={{ backgroundColor: `${accentHex}26` }}
        >
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4" style={{ color: accentHex }} />

            <span className="text-sm font-semibold">Connection Diagnostics</span>
            {isUnhealthy && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Unhealthy
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-white"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand log' : 'Collapse log'}
            >
              {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-white"
              onClick={() => { setOpen(false); setUserDismissed(true); }}
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-3 gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs">
          <StatusPill label="Sync" value={realtimeStatus} />
          <StatusPill
            label="Signaling"
            value={signalingReady ? 'ready' : 'pending'}
            tone={signalingReady ? 'good' : 'warn'}
          />
          <StatusPill
            label="Video peer"
            value={peerConnected ? 'connected' : 'waiting'}
            tone={peerConnected ? 'good' : 'warn'}
          />
        </div>

        {/* Log */}
        {!collapsed && (
          <div className="max-h-72 overflow-y-auto px-3 py-2 text-[11px] font-mono leading-relaxed">
            {entries.length === 0 ? (
              <div className="flex items-center gap-2 px-1 py-3 text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Waiting for events…
              </div>
            ) : (
              <ul className="space-y-1">
                {[...entries].reverse().map((e) => (
                  <li key={e.id} className="flex gap-2">
                    <span className="shrink-0 text-slate-500">{formatTimestamp(e.ts)}</span>
                    <span className={cn('shrink-0 uppercase', LEVEL_STYLES[e.level])}>
                      {e.level === 'error' ? 'ERR' : e.level === 'warn' ? 'WRN' : 'INF'}
                    </span>
                    <span className="shrink-0 opacity-80" style={{ color: accentHex }}>{SOURCE_LABEL[e.source] ?? e.source}</span>
                    <span className="break-words text-slate-200">{e.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-white/5 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-[11px] text-slate-300 hover:text-white"
            onClick={() => connectionDebugLog.clear()}
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
          <Button
            size="sm"
            style={{ backgroundColor: accentHex }}
            className="h-7 gap-1 text-[11px] text-white hover:opacity-90"
            onClick={handleCopy}
          >
            <ClipboardCopy className="h-3.5 w-3.5" /> Copy details
          </Button>
        </div>

      </motion.div>
    </AnimatePresence>
  );
};

interface StatusPillProps {
  label: string;
  value: string;
  tone?: 'good' | 'warn' | 'auto';
}

const StatusPill: React.FC<StatusPillProps> = ({ label, value, tone = 'auto' }) => {
  const resolvedTone =
    tone === 'auto'
      ? value === 'connected'
        ? 'good'
        : value === 'reconnecting' || value === 'connecting'
        ? 'warn'
        : 'bad'
      : tone === 'good'
      ? 'good'
      : tone === 'warn'
      ? 'warn'
      : 'bad';

  const toneClass =
    resolvedTone === 'good'
      ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
      : resolvedTone === 'warn'
      ? 'border-amber-500/40 text-amber-300 bg-amber-500/10'
      : 'border-rose-500/40 text-rose-300 bg-rose-500/10';

  return (
    <div className={cn('rounded-lg border px-2 py-1.5', toneClass)}>
      <div className="text-[10px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-xs font-semibold capitalize">{value}</div>
    </div>
  );
};
