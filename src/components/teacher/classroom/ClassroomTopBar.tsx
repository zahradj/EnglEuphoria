import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Clock,
  Phone,
  Settings,
  Star,
  ClipboardCheck,
  Maximize2,
  Minimize2,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import { useSmartTimer, type TimerPhase } from '@/hooks/classroom/useSmartTimer';
import { DeviceSelector } from '@/components/classroom/DeviceSelector';
import { getClassroomHubTheme } from './hubClassroomTheme';
import logoWhite from '@/assets/logo-white.png';

type HubType = 'playground' | 'academy' | 'professional';
type LessonPhase = 'mandatory' | 'bonus' | 'overtime';

interface ClassroomTopBarProps {
  lessonTitle: string;
  roomName: string;
  participantCount: number;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndClass: () => void;
  onOpenSettings?: () => void;
  onOpenWrapUp?: () => void;
  studentStars?: number;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  shouldPulseWrapUp?: boolean;
  elapsedSeconds?: number;
  sessionDuration?: 25 | 55;
  /** Hub-aware time-policy phase derived from elapsedSeconds. */
  lessonPhase?: LessonPhase;
  lessonPhaseLabel?: string;
  /** Remaining seconds in the optional bonus window (after mandatory ends). */
  bonusSecondsRemaining?: number;
  /** True while elapsed < mandatory — leaving now marks the session as left-early. */
  wouldBeLeftEarly?: boolean;
  /** Seconds until the mandatory portion completes (for the "left early" pill). */
  secondsUntilMandatoryEnd?: number;
  /** Full booked duration including bonus (30 or 60). */
  totalMinutes?: 30 | 60;
  hubType?: HubType;
  rtcConnected?: boolean;
  onReconnect?: () => void;
  /** Live local stream — required to show device selector. */
  localStream?: MediaStream | null;
  /** Hot-swap helpers from useLocalMedia. */
  onSwitchCamera?: (deviceId: string) => Promise<boolean>;
  onSwitchMicrophone?: (deviceId: string) => Promise<boolean>;
  onToggleSlideNav?: () => void;
  slideNavOpen?: boolean;
  onForceSync?: () => void;
  realtimeConnected?: boolean;
  /** Whether the lesson has actually started; controls End/Leave button styling + label. */
  classStarted?: boolean;
  /** Optional: render a green "Start Lesson" button before End/Leave when provided. */
  onStartClass?: () => void;
  /** Disable Start Lesson until the student is present. */
  canStartClass?: boolean;
}

export const ClassroomTopBar: React.FC<ClassroomTopBarProps> = ({
  lessonTitle,
  roomName,
  participantCount,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndClass,
  onOpenSettings,
  onOpenWrapUp,
  studentStars = 0,
  isZenMode = false,
  onToggleZenMode,
  shouldPulseWrapUp = false,
  elapsedSeconds = 0,
  sessionDuration = 25,
  lessonPhase = 'mandatory',
  lessonPhaseLabel: _lessonPhaseLabel,
  bonusSecondsRemaining = 0,
  wouldBeLeftEarly = false,
  secondsUntilMandatoryEnd = 0,
  totalMinutes,
  hubType = 'academy',
  rtcConnected = false,
  onReconnect,
  localStream = null,
  onSwitchCamera,
  onSwitchMicrophone,
  onToggleSlideNav,
  slideNavOpen = false,
  onForceSync,
  realtimeConnected = false,
  classStarted = true,
  onStartClass,
  canStartClass = true
}) => {
  const smartTimer = useSmartTimer(elapsedSeconds, sessionDuration);
  const earnedStars = Math.min(Math.max(studentStars, 0), 10);

  const totalSec = sessionDuration * 60;
  const remaining = Math.max(0, totalSec - elapsedSeconds);
  const isOvertime = elapsedSeconds > totalSec;
  const overtimeSec = isOvertime ? elapsedSeconds - totalSec : 0;

  // Buffer time: last 5 min for 55-min, last 2 min for 25-min
  const bufferSec = sessionDuration === 55 ? 5 * 60 : 2 * 60;
  const inBuffer = remaining <= bufferSec && !isOvertime;

  const fmt = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const fmtFull = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Timer color classes based on phase
  const timerColorClass = (() => {
    switch (smartTimer.phase) {
      case 'overtime': return 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]';
      case 'urgent': return 'text-red-500 animate-pulse';
      case 'warning': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  })();

  const timerBgClass = (() => {
    switch (smartTimer.phase) {
      case 'overtime': return 'bg-red-500/20 border border-red-500/40';
      case 'urgent': return 'bg-red-500/15 border border-red-500/30';
      case 'warning': return 'bg-amber-500/15 border border-amber-500/30';
      default: return '';
    }
  })();

  const theme = getClassroomHubTheme(hubType);
  const hubGradient = theme.hexGradient;

  return (
    <div className={`h-14 ${theme.headerGradient} backdrop-blur-md border-b ${theme.panelBorder} flex items-center justify-between px-4 shrink-0 shadow-sm`}>

      <div className="flex items-center gap-4">
        {/* Hub-Branded Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: hubGradient }}
          >
            <img src={logoWhite} alt="EnglEuphoria" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-sm font-bold bg-clip-text text-transparent" style={{ backgroundImage: hubGradient }}>
            EnglEuphoria
          </span>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-500">LIVE</span>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{participantCount} in room</span>
        </div>
        <Badge variant="secondary" className={`${theme.chipBg} ${theme.chipText} border ${theme.panelBorder}`}>
          {lessonTitle}
        </Badge>
      </div>

      {/* Centered: Star Count + Timer */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-background/85 border border-[hsl(var(--classroom-reward)/0.45)] px-4 py-1.5 rounded-full shadow-[0_0_12px_hsl(var(--classroom-reward)/0.24)]">
          {Array.from({ length: 10 }).map((_, index) => {
            const isEarned = index < earnedStars;
            return (
              <Star
                key={index}
                className={`h-7 w-7 transition-all ${
                  isEarned
                    ? 'fill-[hsl(var(--classroom-reward))] text-[hsl(var(--classroom-reward))] drop-shadow-[0_0_4px_hsl(var(--classroom-reward)/0.6)] scale-110'
                    : 'fill-muted text-muted-foreground/30'
                }`}
              />
            );
          })}
        </div>

        {/* Smart Timer Display */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timerBgClass}`}>
          <Clock className={`h-4 w-4 ${timerColorClass}`} />
          <div className="flex flex-col items-center leading-none">
            <span className={`font-mono text-sm font-bold ${timerColorClass}`}>
              {isOvertime ? `+${fmt(overtimeSec)}` : fmt(remaining)}
            </span>
            {smartTimer.phase !== 'normal' && (
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${timerColorClass}`}>
                {smartTimer.phaseLabel}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            {fmtFull(elapsedSeconds)}
          </span>
        </div>

        {/* Hub time-policy phase chip — Core / Bonus / Overtime + "left early" warning */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
            lessonPhase === 'mandatory'
              ? wouldBeLeftEarly
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-gray-50 border-gray-200 text-gray-600'
              : lessonPhase === 'bonus'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-red-50 border-red-300 text-red-700'
          }`}
          title={
            lessonPhase === 'mandatory'
              ? `Core ${sessionDuration}-min lesson — leaving now marks the session as Left Early. ${Math.ceil(secondsUntilMandatoryEnd / 60)} min left in core.`
              : lessonPhase === 'bonus'
                ? `Core lesson complete. Optional ${Math.ceil(bonusSecondsRemaining / 60)}-min bonus window — end whenever you're ready.`
                : `Past the full ${totalMinutes ?? sessionDuration + 5}-min booked duration.`
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              lessonPhase === 'mandatory'
                ? wouldBeLeftEarly
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-gray-400'
                : lessonPhase === 'bonus'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-red-500 animate-pulse'
            }`}
          />
          {lessonPhase === 'mandatory'
            ? `Core · ${fmt(secondsUntilMandatoryEnd)} left`
            : lessonPhase === 'bonus'
              ? `Bonus · ${fmt(bonusSecondsRemaining)}`
              : 'Overtime'}
        </div>

        {/* Legacy buffer indicator (kept for the urgent visual cue) */}
        {inBuffer && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Buffer</span>
          </div>
        )}
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">

        {/* Mic & Camera buttons moved onto the teacher's video frame
            in the left CommunicationZone — single source of truth. */}
        {onToggleZenMode && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100 text-gray-700"
            onClick={onToggleZenMode}
            title="Zen Mode (F11)"
          >
            {isZenMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        )}
        {onSwitchCamera && onSwitchMicrophone ? (
          <DeviceSelector
            stream={localStream}
            onSwitchCamera={onSwitchCamera}
            onSwitchMicrophone={onSwitchMicrophone}
          />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100 text-gray-700"
            onClick={onOpenSettings}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
        {/* Wrap-Up button removed — the wrap-up panel now opens
            automatically when the teacher clicks "End Class". */}
        {/* Reconnect button */}
        {onReconnect && !rtcConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </Button>
        )}
        {onToggleSlideNav && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSlideNav}
            title={slideNavOpen ? 'Hide slides' : 'Browse slides'}
            aria-label="Toggle slide navigator"
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        )}
        {onForceSync && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onForceSync}
            title="Force sync"
            aria-label="Force sync"
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {(onToggleSlideNav || onForceSync) && (
          <span
            className={`h-2 w-2 rounded-full ${realtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
            title={realtimeConnected ? 'Realtime connected' : 'Realtime disconnected'}
          />
        )}
        {!classStarted && onStartClass && (
          <Button
            size="sm"
            onClick={onStartClass}
            disabled={!canStartClass}
            className={`rounded-full text-white font-semibold px-4 ml-1 ${
              canStartClass
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            title={canStartClass ? 'Start the lesson' : 'Waiting for the student to join'}
          >
            ▶ Start Lesson
          </Button>
        )}
        {onEndClass && (
          <Button
            size="sm"
            variant={classStarted ? 'default' : 'ghost'}
            onClick={onEndClass}
            className={`rounded-full font-semibold px-4 ml-1 ${
              classStarted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={classStarted ? 'End the lesson' : 'Leave the classroom (lesson not started)'}
          >
            {classStarted ? '■ End Lesson' : '← Leave'}
          </Button>
        )}
      </div>
    </div>
  );
};
