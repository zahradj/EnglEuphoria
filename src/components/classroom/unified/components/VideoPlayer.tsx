
import React, { useRef, useEffect } from "react";

interface VideoPlayerProps {
  stream: MediaStream | null;
  hasVideo: boolean;
  isTeacher: boolean;
  userLabel: string;
  isCameraOff: boolean;
}

export function VideoPlayer({ stream, hasVideo, isTeacher, userLabel, isCameraOff }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const gradientColors = isTeacher ? "from-blue-500 to-blue-600" : "from-purple-500 to-purple-600";

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, userLabel]);

  if (hasVideo) {
    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        onLoadedMetadata={() => console.log(`🎥 ${userLabel} video metadata loaded`)}
        onError={e => console.error(`🎥 ${userLabel} video error`, e)}
      />
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradientColors} flex items-center justify-center relative`}>
      <div className="text-center">
        <div className={`w-24 h-24 rounded-full ${isTeacher ? 'bg-blue-400' : 'bg-purple-400'} flex items-center justify-center shadow-xl mb-3 mx-auto`}>
          <span className="text-4xl font-bold text-white">
            {isTeacher ? 'T' : 'S'}
          </span>
        </div>
        <p className="text-white font-semibold">{userLabel}</p>
      </div>
      {isCameraOff && (
        <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
          Camera Off
        </div>
      )}
    </div>
  );
}
