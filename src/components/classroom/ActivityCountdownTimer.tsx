import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { audioService } from "@/services/audioService";

interface ActivityCountdownTimerProps {
  className?: string;
}

export function ActivityCountdownTimer({ className = "" }: ActivityCountdownTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(300); // Default 5 minutes
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingTime, setIsSettingTime] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);

  // Track which audio cues we've already fired this run so we don't spam them.
  const warnedRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          const next = prev - 1;
          // Friendly warning chime at the 10-second mark.
          if (next === 10 && !warnedRef.current) {
            warnedRef.current = true;
            audioService.playTimerWarningSound();
          }
          if (next <= 0) {
            setIsRunning(false);
            if (!doneRef.current) {
              doneRef.current = true;
              audioService.playTimerDoneSound();
            }
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    // New run — re-arm the audio cues.
    if (remainingSeconds > 10) warnedRef.current = false;
    doneRef.current = false;
    setIsRunning(true);
    setIsSettingTime(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    warnedRef.current = false;
    doneRef.current = false;
    setRemainingSeconds(totalSeconds);
  };

  const setNewTime = () => {
    const newSeconds = inputMinutes * 60;
    setTotalSeconds(newSeconds);
    setRemainingSeconds(newSeconds);
    warnedRef.current = false;
    doneRef.current = false;
    setIsRunning(false);
    setIsSettingTime(false);
  };

  const getTimerColor = () => {
    const percentage = remainingSeconds / totalSeconds;
    if (percentage <= 0.1) return "text-error";
    if (percentage <= 0.2) return "text-warning";
    return "text-primary-600";
  };

  if (isSettingTime) {
    return (
      <div className={`flex items-center gap-2 bg-primary-50/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-neutral-200 ${className}`}>
        <Timer size={16} className="text-primary-600" />
        <Input
          type="number"
          value={inputMinutes}
          onChange={(e) => setInputMinutes(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 h-6 text-sm border-neutral-300 focus:border-primary-500"
          min="1"
          max="60"
        />
        <span className="text-sm text-primary-600">min</span>
        <Button size="sm" variant="outline" onClick={setNewTime} className="h-6 px-2 text-xs border-neutral-300 text-primary-600 hover:bg-primary-100">
          Set
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsSettingTime(false)} className="h-6 px-2 text-xs text-primary-600 hover:bg-primary-100">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 bg-primary-50/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-neutral-200 shadow-sm ${className}`}>
      <Timer size={16} className="text-primary-600" />
      <span 
        className={`font-mono text-lg font-semibold cursor-pointer ${getTimerColor()}`}
        onClick={() => setIsSettingTime(true)}
        title="Click to set time"
      >
        {formatTime(remainingSeconds)}
      </span>
      <div className="flex gap-1">
        {!isRunning ? (
          <Button variant="ghost" size="sm" onClick={startTimer} className="h-6 w-6 p-0 text-primary-600 hover:bg-primary-100">
            <Play size={12} />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={pauseTimer} className="h-6 w-6 p-0 text-primary-600 hover:bg-primary-100">
            <Pause size={12} />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={resetTimer} className="h-6 w-6 p-0 text-primary-600 hover:bg-primary-100">
          <RotateCcw size={12} />
        </Button>
      </div>
    </div>
  );
}