import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Camera, CameraOff, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIdleOpacity } from '@/hooks/useIdleOpacity';

interface ZenModeOverlayProps {
  elapsed: number;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onExitZen: () => void;
}

export const ZenModeOverlay: React.FC<ZenModeOverlayProps> = ({
  elapsed,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onExitZen
}) => {
  const { style, onMouseMove, onMouseEnter } = useIdleOpacity({
    idleTimeout: 3000,
    activeOpacity: 1,
    idleOpacity: 0
  });

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      style={style}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-center gap-3 glass-panel rounded-full px-4 py-2 shadow-xl">
        {/* LIVE dot */}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500">LIVE</span>
        </div>

        <div className="h-4 w-px bg-gray-300" />

        {/* Timer */}
        <span className="text-xs font-mono text-gray-600">{formatTime(elapsed)}</span>

        <div className="h-4 w-px bg-gray-300" />

        {/* Controls */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMute}
          className={`h-7 w-7 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCamera}
          className={`h-7 w-7 rounded-full ${isCameraOff ? 'bg-red-500/20 text-red-500' : 'text-gray-500 hover:text-gray-900'}`}
        >
          {isCameraOff ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
        </Button>

        <div className="h-4 w-px bg-gray-300" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onExitZen}
          className="h-7 text-xs text-gray-500 hover:text-gray-900 px-2"
        >
          <Minimize2 className="h-3 w-3 mr-1" />
          Exit Zen
        </Button>
      </div>
    </motion.div>
  );
};