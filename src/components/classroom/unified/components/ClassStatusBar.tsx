import React from "react";
import { Progress } from "@/components/ui/progress";
import { useSmartTimer } from "@/hooks/classroom/useSmartTimer";

interface ClassStatusBarProps {
  elapsedSec: number;
  totalSec?: number;
  participantsCount?: number;
  sessionDuration?: 25 | 55;
}

export function ClassStatusBar({ elapsedSec, totalSec, participantsCount = 0, sessionDuration = 25 }: ClassStatusBarProps) {
  const effectiveTotal = totalSec ?? sessionDuration * 60;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const pct = clamp((elapsedSec / effectiveTotal) * 100);
  const remaining = Math.max(0, effectiveTotal - elapsedSec);
  const isOvertime = elapsedSec > effectiveTotal;
  const smartTimer = useSmartTimer(elapsedSec, sessionDuration);

  // Buffer: last 2 min for 25-min, last 5 min for 55-min
  const bufferSec = sessionDuration === 55 ? 5 * 60 : 2 * 60;
  const inBuffer = remaining <= bufferSec && !isOvertime;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const progressColor = (() => {
    switch (smartTimer.phase) {
      case 'overtime': return 'bg-red-500';
      case 'urgent': return 'bg-red-500';
      case 'warning': return 'bg-amber-400';
      default: return '';
    }
  })();

  const timeColor = (() => {
    switch (smartTimer.phase) {
      case 'overtime': return '#EF4444';
      case 'urgent': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#374151';
    }
  })();

  return (
    <footer className="backdrop-blur supports-[backdrop-filter]:backdrop-blur" style={{ 
      borderTop: '1px solid rgba(196, 217, 255, 0.4)', 
      backgroundColor: 'rgba(251, 251, 251, 0.9)'
    }}>
      <div className="container mx-auto px-4 py-2 flex items-center gap-4">
        <div className="flex-1">
          <Progress value={isOvertime ? 100 : pct} className={`h-2 ${progressColor ? `[&>div]:${progressColor}` : ''}`} />
        </div>
        <div className="text-xs" style={{ color: '#6B7280' }}>
          Elapsed: <span className="font-mono" style={{ color: timeColor }}>{fmt(elapsedSec)}</span>
        </div>
        <div className="text-xs" style={{ color: '#6B7280' }}>
          Time left: <span className={`font-mono ${smartTimer.phase === 'urgent' ? 'animate-pulse' : ''}`} style={{ color: timeColor }}>
            {isOvertime ? `+${fmt(elapsedSec - effectiveTotal)}` : fmt(remaining)}
          </span>
        </div>
        {inBuffer && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Buffer</span>
          </div>
        )}
        {smartTimer.phase !== 'normal' && (
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: timeColor }}>
            {smartTimer.phaseLabel}
          </span>
        )}
        <div className="text-xs" style={{ color: '#6B7280' }}>Participants: <span style={{ color: '#374151' }}>{participantsCount}</span></div>
      </div>
    </footer>
  );
}
