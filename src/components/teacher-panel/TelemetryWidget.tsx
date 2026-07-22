// TelemetryWidget — left sidebar. Decibel meter + anxiety status driven by
// WTC_TELEMETRY / WTC_EVENT broadcasts from the student's WTCMonitorProvider.
import { motion } from 'framer-motion';
import { Activity, Mic } from 'lucide-react';

export type AnxietyStatus = 'confident' | 'hesitant' | 'high_load' | 'unknown';

export interface TelemetryWidgetProps {
  avgDb: number | null;        // dBFS, negative
  lowConfidence: boolean;
  lastEventAt?: number | null;
  connected: boolean;
}

const STATUS_COPY: Record<AnxietyStatus, { label: string; cls: string }> = {
  confident: { label: 'Confident', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300' },
  hesitant: { label: 'Hesitant', cls: 'bg-amber-100 text-amber-800 ring-amber-300' },
  high_load: { label: 'High Cognitive Load', cls: 'bg-rose-100 text-rose-800 ring-rose-300' },
  unknown: { label: 'Listening…', cls: 'bg-muted text-muted-foreground ring-border' },
};

function dbToPct(db: number | null): number {
  if (db == null || !isFinite(db)) return 0;
  // -60 → 0%, 0 → 100%
  const pct = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
  return pct;
}

function statusFrom(db: number | null, lowConfidence: boolean): AnxietyStatus {
  if (db == null) return 'unknown';
  if (lowConfidence) return 'high_load';
  if (db < -45) return 'hesitant';
  return 'confident';
}

function meterColor(pct: number) {
  if (pct < 30) return 'bg-rose-500';
  if (pct < 60) return 'bg-amber-400';
  return 'bg-emerald-500';
}

export function TelemetryWidget({ avgDb, lowConfidence, lastEventAt, connected }: TelemetryWidgetProps) {
  const pct = dbToPct(avgDb);
  const status = statusFrom(avgDb, lowConfidence);
  const s = STATUS_COPY[status];

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur p-4 ring-1 ring-border shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Activity className="h-4 w-4 text-primary" />
        Live Telemetry
        <span className={`ml-auto h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> Voice level</span>
          <span className="tabular-nums">{avgDb == null ? '—' : `${avgDb.toFixed(0)} dB`}</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full ${meterColor(pct)}`}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          />
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-1">Anxiety status</div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ring-1 ${s.cls}`}>
          {s.label}
        </span>
      </div>

      {lastEventAt && (
        <div className="text-[11px] text-muted-foreground">
          last signal: {new Date(lastEventAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default TelemetryWidget;
