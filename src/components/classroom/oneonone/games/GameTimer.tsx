
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

export function GameTimer() {
  const [gameTimer, setGameTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setGameTimer(0);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setGameTimer(0);
    setIsTimerRunning(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
        <Timer size={16} className="text-blue-600" />
        <span className="font-mono text-blue-700">{formatTime(gameTimer)}</span>
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={startTimer}>
          Start
        </Button>
        <Button variant="outline" size="sm" onClick={stopTimer}>
          Stop
        </Button>
        <Button variant="outline" size="sm" onClick={resetTimer}>
          Reset
        </Button>
      </div>
    </>
  );
}
