import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isTeacher: boolean;
  onToggleMicrophone: () => void;
  onToggleCamera: () => void;
  onLeaveVideo: () => void;
}

export function VideoControls({
  isMuted,
  isCameraOff,
  isTeacher,
  onToggleMicrophone,
  onToggleCamera,
  onLeaveVideo
}: VideoControlsProps) {
  // Wrap handlers to prevent the SyntheticEvent from being forwarded as
  // a "force" argument to the underlying media-toggle hooks.
  const handleMic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleMicrophone();
  };

  const handleCam = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleCamera();
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLeaveVideo();
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleMic}
        aria-pressed={isMuted}
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
        className={cn(
          "w-10 h-10 rounded-full transition-all",
          isMuted
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-white/15 text-white hover:bg-white/25"
        )}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCam}
        aria-pressed={isCameraOff}
        aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
        title={isCameraOff ? "Turn camera on" : "Turn camera off"}
        className={cn(
          "w-10 h-10 rounded-full transition-all",
          isCameraOff
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-white/15 text-white hover:bg-white/25"
        )}
      >
        {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
      </Button>

      <div className="w-px h-6 bg-white/20 mx-1" aria-hidden />

      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={handleLeave}
        aria-label={isTeacher ? "End session" : "Leave video"}
        title={isTeacher ? "End Session" : "Leave Video"}
        className="w-10 h-10 rounded-full"
      >
        <Phone size={18} />
      </Button>
    </div>
  );
}
