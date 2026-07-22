// TeacherControlPanel — asymmetric live classroom UI (role === 'teacher').
// 3-column dashboard: Telemetry (L) | Mirrored Stage (C) | Prompter+Overrides (R).
//
// Wires a Supabase Realtime broadcast channel keyed by lesson_session_id so:
//   • student → teacher: ACTIVITY_STATE, CURSOR, WTC_TELEMETRY, WTC_EVENT
//   • teacher → student: TRIGGER_REWARD, TRIGGER_FALLBACK, FORCE_NEXT_BLOCK
import { useCallback, useState } from 'react';
import { useClassroomChannel, type ClassroomEvent } from '@/hooks/useClassroomChannel';
import { TelemetryWidget } from './TelemetryWidget';
import { TeacherPrompter, type ActiveBlock } from './TeacherPrompter';
import { MirroredStage, type MirroredActivity } from './MirroredStage';

export interface TeacherControlPanelProps {
  sessionId: string;
  /** Optional preloaded current activity block (for prompter + mirror). */
  initialActivity?: MirroredActivity | null;
  initialBlock?: ActiveBlock | null;
}

export function TeacherControlPanel({
  sessionId,
  initialActivity = null,
  initialBlock = null,
}: TeacherControlPanelProps) {
  const [avgDb, setAvgDb] = useState<number | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [activity] = useState<MirroredActivity | null>(initialActivity);
  const [block] = useState<ActiveBlock | null>(initialBlock);
  const [studentState, setStudentState] = useState<Record<string, string> | null>(null);

  const handleEvent = useCallback((e: ClassroomEvent) => {
    setLastEventAt(e.at);
    switch (e.type) {
      case 'WTC_TELEMETRY':
        setAvgDb(e.avgDb);
        setLowConfidence(e.lowConfidence);
        break;
      case 'WTC_EVENT':
        if (e.event === 'LOW_CONFIDENCE') setLowConfidence(true);
        if (e.event === 'RECOVERED') setLowConfidence(false);
        break;
      case 'CURSOR':
        setCursor({ x: e.x, y: e.y });
        break;
      case 'ACTIVITY_STATE':
        if (e.state && typeof e.state === 'object') {
          setStudentState(e.state as Record<string, string>);
        }
        break;
      default:
        break;
    }
  }, []);

  const { connected, emit } = useClassroomChannel({
    sessionId,
    role: 'teacher',
    onEvent: handleEvent,
  });

  const send = (event: ClassroomEvent) => emit(event);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4">
      <div className="grid h-full grid-cols-[260px_minmax(0,1fr)_320px] gap-4">
        {/* LEFT — Telemetry */}
        <div className="flex flex-col gap-4 min-h-0 overflow-auto">
          <TelemetryWidget
            avgDb={avgDb}
            lowConfidence={lowConfidence}
            lastEventAt={lastEventAt}
            connected={connected}
          />
          <div className="rounded-2xl bg-white/70 backdrop-blur p-4 ring-1 ring-border text-xs text-muted-foreground">
            <div className="font-semibold text-foreground mb-1">Session</div>
            <div className="font-mono break-all">{sessionId}</div>
          </div>
        </div>

        {/* CENTER — Mirrored Stage */}
        <div className="min-h-0">
          <MirroredStage activity={activity} studentState={studentState} cursor={cursor} />
        </div>

        {/* RIGHT — Prompter + Overrides */}
        <div className="min-h-0 overflow-auto">
          <TeacherPrompter
            block={block}
            disabled={!connected}
            onTriggerReward={() => send({ type: 'TRIGGER_REWARD', at: Date.now() })}
            onTriggerFallback={() => send({ type: 'TRIGGER_FALLBACK', at: Date.now() })}
            onForceNextBlock={() => send({ type: 'FORCE_NEXT_BLOCK', at: Date.now() })}
          />
        </div>
      </div>
    </div>
  );
}

export default TeacherControlPanel;
