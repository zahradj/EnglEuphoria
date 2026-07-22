import React from 'react';
import { Button } from '@/components/ui/button';
import englePhoriaLogo from '@/assets/englephoria-logo.png';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, LogOut, Signal, SignalMedium, SignalLow, WifiOff, Maximize2, Minimize2, RefreshCw, Star, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useConnectionHealth } from '@/hooks/useConnectionHealth';
import CoinBalance from '@/components/academy/CoinBalance';
import ProfileAvatar from '@/components/academy/ProfileAvatar';
import { getClassroomHubTheme } from '@/components/teacher/classroom/hubClassroomTheme';
import { useClassroomTimer } from '@/hooks/classroom/useClassroomTimer';
import { useLessonTimePolicy } from '@/hooks/classroom/useLessonTimePolicy';

type HubType = 'playground' | 'academy' | 'professional';

interface StudentClassroomHeaderProps {
  lessonTitle: string;
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeaveClass: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  hubType?: HubType;
  rtcConnected?: boolean;
  onReconnect?: () => void;
  studentStars?: number;
  /** Booking scheduled_at — drives the read-only countdown that mirrors the teacher's smart timer. */
  scheduledAt?: string | Date | null;
}

export const StudentClassroomHeader: React.FC<StudentClassroomHeaderProps> = ({
  lessonTitle,
  isConnected,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onLeaveClass,
  isZenMode = false,
  onToggleZenMode,
  hubType = 'academy',
  rtcConnected = false,
  onReconnect,
  studentStars = 0,
  scheduledAt = null,
}) => {
  const { quality, latencyMs, suggestion } = useConnectionHealth();
  const earnedStars = Math.min(Math.max(studentStars, 0), 10);

  // Read-only timer mirror — same clock as the teacher's ClassroomTopBar.
  const policyHub = hubType === 'professional' ? 'success' : hubType;
  const { classTime } = useClassroomTimer(scheduledAt);
  const policy = useLessonTimePolicy(policyHub as any, classTime);
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };
  const totalSec = policy.totalSeconds;
  const remaining = Math.max(0, totalSec - classTime);
  const isOvertime = classTime > totalSec;
  const overtimeSec = isOvertime ? classTime - totalSec : 0;
  const timerColor = isOvertime
    ? 'text-red-500 animate-pulse'
    : policy.phase === 'bonus'
      ? 'text-emerald-600'
      : remaining <= 300
        ? 'text-amber-500'
        : 'text-gray-600';

  const SignalIcon = quality === 'good' ? Signal : quality === 'fair' ? SignalMedium : SignalLow;
  const signalColor = quality === 'good' ? 'bg-green-600' : quality === 'fair' ? 'bg-yellow-600' : 'bg-red-600';
  const signalLabel = quality === 'good' ? 'Strong' : quality === 'fair' ? 'Unstable' : 'Weak';

  // Shared classroom hub theme — same source as teacher ClassroomTopBar.
  const theme = getClassroomHubTheme(hubType);
  const hubGradient = theme.hexGradient;

  return (
    <div className="relative">
      <div className={`h-14 ${theme.headerGradient} backdrop-blur-md border-b ${theme.panelBorder} px-4 flex items-center justify-between shadow-sm`}>
        {/* Left: Logo + Live Indicator + Lesson Title */}
        <div className="flex items-center gap-4">
          {/* Hub-Branded Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: hubGradient }}
            >
              <img src={englePhoriaLogo} alt="EnglEuphoria" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-sm font-bold bg-clip-text text-transparent" style={{ backgroundImage: hubGradient }}>
              EnglEuphoria
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          {isConnected && (
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-500">LIVE</span>
            </div>
          )}
          <div className="h-6 w-px bg-gray-200" />
          <Badge variant="secondary" className={`${theme.chipBg} ${theme.chipText} border ${theme.panelBorder}`}>
            {lessonTitle}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={isConnected ? 'default' : 'destructive'}
                  className={`flex items-center gap-1 cursor-default ${isConnected ? signalColor : 'bg-red-600'}`}
                >
                  {isConnected ? <SignalIcon className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isConnected ? signalLabel : 'Disconnected'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Latency: {latencyMs}ms</p>
                {suggestion && <p className="text-xs mt-1">{suggestion}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

      {/* Center: Star progress (matches teacher) — in-flow so it never overlaps the connection badge */}
      <div className="flex items-center gap-1 bg-background/85 border border-[hsl(var(--classroom-reward)/0.45)] px-3 py-1 rounded-full shadow-[0_0_12px_hsl(var(--classroom-reward)/0.24)] shrink-0">
        {Array.from({ length: 10 }).map((_, index) => {
          const isEarned = index < earnedStars;
          return (
            <Star
              key={index}
              className={`h-5 w-5 transition-all ${
                isEarned
                  ? 'fill-[hsl(var(--classroom-reward))] text-[hsl(var(--classroom-reward))] drop-shadow-[0_0_4px_hsl(var(--classroom-reward)/0.6)] scale-110'
                  : 'fill-muted text-muted-foreground/30'
              }`}
            />
          );
        })}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Read-only smart timer mirror (matches teacher) */}
        {scheduledAt && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${theme.panelBorder} bg-background/70`}>
                  <Clock className={`h-3.5 w-3.5 ${timerColor}`} />
                  <span className={`font-mono text-xs font-bold ${timerColor}`}>
                    {isOvertime ? `+${fmt(overtimeSec)}` : fmt(remaining)}
                  </span>
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                    policy.phase === 'bonus' ? 'text-emerald-600' : policy.phase === 'overtime' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {policy.phase === 'bonus' ? 'Bonus' : policy.phase === 'overtime' ? 'Over' : 'Core'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lesson time remaining</p>
                <p className="text-xs mt-1">{policy.phaseLabel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {hubType === 'academy' && (
          <>
            <CoinBalance />
            <ProfileAvatar size="sm" />
            <div className="h-6 w-px bg-gray-200 mx-1" />
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMute}
          className={`h-9 w-9 rounded-full ${isMuted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCamera}
          className={`h-9 w-9 rounded-full ${isCameraOff ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {isCameraOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>
        {onToggleZenMode && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleZenMode}
            className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            title="Zen Mode (F11)"
          >
            {isZenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
        {/* Reconnect button - shown when RTC is disconnected */}
        {onReconnect && !rtcConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            className="h-9 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </Button>
        )}
        <div className="h-6 w-px bg-gray-200 mx-2" />
        <Button
          variant="destructive"
          size="sm"
          onClick={onLeaveClass}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Leave
        </Button>
      </div>
    </div>

    {/* Connection warning banner */}
    {quality === 'poor' && suggestion && (
      <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 text-center">
        <p className="text-xs text-yellow-300">⚠️ {suggestion}</p>
      </div>
    )}
    </div>
  );
};
