
import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Hand, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface FunctionalVideoFeedProps {
  stream: MediaStream | null;
  name: string;
  isTeacher: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised?: boolean;
  isCurrentUser: boolean;
  isSmall?: boolean;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onRaiseHand?: () => void;
}

export function FunctionalVideoFeed({
  stream,
  name,
  isTeacher,
  isMuted,
  isCameraOff,
  isHandRaised,
  isCurrentUser,
  isSmall = false,
  onToggleMute,
  onToggleCamera,
  onRaiseHand,
}: FunctionalVideoFeedProps) {
  const { languageText } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* Video Element */}
      {stream && !isCameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isCurrentUser}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <UserCircle2 className={`${isSmall ? 'h-12 w-12' : 'h-20 w-20'} text-gray-400 mb-2`} />
          <span className={`${isSmall ? 'text-sm' : 'text-lg'} text-white font-medium`}>{name}</span>
          {isCameraOff && (
            <span className="text-gray-400 text-xs mt-1">Camera off</span>
          )}
        </div>
      )}
      
      {/* Status badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {isTeacher && (
          <span className="bg-teal-500 px-2 py-0.5 rounded-full text-xs text-white font-medium">
            {languageText.teacher}
          </span>
        )}
        {isCurrentUser && (
          <span className="bg-purple-500 px-2 py-0.5 rounded-full text-xs text-white font-medium">
            {languageText.you}
          </span>
        )}
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-1">
          {isMuted && (
            <div className="bg-red-500 rounded-full p-1">
              <MicOff size={isSmall ? 12 : 16} className="text-white" />
            </div>
          )}
          
          {isHandRaised && (
            <div className="bg-yellow-500 rounded-full p-1">
              <Hand size={isSmall ? 12 : 16} className="text-yellow-900" />
            </div>
          )}
        </div>

        {/* Only show control buttons for current user and not in small view */}
        {isCurrentUser && !isSmall && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full size-8 ${
                isMuted ? "bg-red-500 text-white border-transparent hover:bg-red-600" : "bg-black/30 text-white border-white/20 hover:bg-black/50"
              }`}
              onClick={onToggleMute}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full size-8 ${
                isCameraOff ? "bg-red-500 text-white border-transparent hover:bg-red-600" : "bg-black/30 text-white border-white/20 hover:bg-black/50"
              }`}
              onClick={onToggleCamera}
            >
              {isCameraOff ? <VideoOff size={14} /> : <Video size={14} />}
            </Button>
            
            {onRaiseHand && (
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full size-8 ${
                  isHandRaised ? "bg-yellow-500 text-yellow-900 border-transparent hover:bg-yellow-600" : "bg-black/30 text-white border-white/20 hover:bg-black/50"
                }`}
                onClick={onRaiseHand}
              >
                <Hand size={14} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Name overlay */}
      <div className="absolute bottom-2 left-2 z-10">
        <span className="text-white text-sm font-medium bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
          {name}
        </span>
      </div>
    </div>
  );
}
