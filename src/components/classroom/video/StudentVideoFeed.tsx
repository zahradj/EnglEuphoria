
import React, { useRef, useEffect } from 'react';
import { UserCircle2, Mic, MicOff } from 'lucide-react';

interface StudentVideoFeedProps {
  stream: MediaStream | null;
  isConnected: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  studentName: string;
}

export function StudentVideoFeed({
  stream,
  isConnected,
  isMuted = false,
  isCameraOff = false,
  studentName
}: StudentVideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && !isCameraOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOff]);

  return (
    <div className="aspect-video bg-gray-900 rounded-md overflow-hidden relative max-h-24">
      {stream && !isCameraOff && isConnected ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mb-1">
            <span className="text-purple-700 font-semibold text-xs">
              {studentName.charAt(0)}
            </span>
          </div>
          <span className="text-purple-700 font-medium text-xs">{studentName}</span>
          {isCameraOff && isConnected && (
            <span className="text-purple-600 text-xs mt-0.5">Camera off</span>
          )}
        </div>
      )}

      {/* Connection status indicator */}
      <div className="absolute top-1 right-1">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      {/* Muted indicator */}
      {isMuted && isConnected && (
        <div className="absolute top-1 left-1">
          <div className="bg-red-500 rounded-full p-0.5">
            <MicOff size={10} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
