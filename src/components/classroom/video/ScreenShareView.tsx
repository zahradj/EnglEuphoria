
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorOff, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ScreenShareViewProps {
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  participantName?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onStopScreenShare?: () => void;
  canControl?: boolean;
}

export function ScreenShareView({
  screenStream,
  isScreenSharing,
  participantName = "Unknown",
  isFullscreen = false,
  onToggleFullscreen,
  onStopScreenShare,
  canControl = false
}: ScreenShareViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  if (!isScreenSharing || !screenStream) {
    return (
      <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MonitorOff size={48} className="mx-auto mb-2" />
          <p>No screen sharing</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full'}`}>
      <div className="relative w-full aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          onLoadedMetadata={() => console.log('🖥️ Screen share video loaded')}
        />

        {/* Overlay controls */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Monitor size={16} />
            {participantName} is sharing
          </div>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          {onToggleFullscreen && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleFullscreen}
              className="bg-black/20 hover:bg-black/40 border-white/30"
            >
              {isFullscreen ? 
                <Minimize2 size={16} className="text-white" /> : 
                <Maximize2 size={16} className="text-white" />
              }
            </Button>
          )}

          {canControl && onStopScreenShare && (
            <Button
              variant="destructive"
              size="icon"
              onClick={onStopScreenShare}
              className="bg-red-500/80 hover:bg-red-500"
            >
              <MonitorOff size={16} />
            </Button>
          )}
        </div>

        {/* Live indicator */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>
    </Card>
  );
}
