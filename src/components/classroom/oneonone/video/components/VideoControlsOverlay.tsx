
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Sparkles } from "lucide-react";
import { ReportIssueDropdown } from "../../ReportIssueDropdown";
import { IssueType } from "../types";

interface Props {
  media: any;
  lessonStarted: boolean;
  onReportIssue: (issue: IssueType) => void;
}

export function VideoControlsOverlay({ media, lessonStarted, onReportIssue }: Props) {
  if (!lessonStarted) return null;
  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 glass-enhanced p-2 rounded-2xl backdrop-blur-lg animate-fade-in">
      <Button
        variant={media.isMuted ? "destructive" : "outline"}
        size="icon"
        onClick={media.toggleMicrophone}
        className={`rounded-xl transition-all duration-200 hover:scale-105 ${
          media.isMuted 
            ? 'bg-red-500/90 hover:bg-red-600/90 border-red-400/50' 
            : 'glass-subtle hover:bg-white/20 border-white/30'
        }`}
      >
        {media.isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </Button>
      <Button
        variant={media.isCameraOff ? "destructive" : "outline"}
        size="icon"
        onClick={media.toggleCamera}
        className={`rounded-xl transition-all duration-200 hover:scale-105 ${
          media.isCameraOff 
            ? 'bg-red-500/90 hover:bg-red-600/90 border-red-400/50' 
            : 'glass-subtle hover:bg-white/20 border-white/30'
        }`}
      >
        {media.isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
      </Button>
      <Button
        variant={media.isConnected ? "destructive" : "outline"}
        size="icon"
        onClick={media.isConnected ? media.leave : media.join}
        className={`rounded-xl transition-all duration-200 hover:scale-105 ${
          media.isConnected 
            ? 'bg-red-500/90 hover:bg-red-600/90 border-red-400/50' 
            : 'bg-emerald-500/90 hover:bg-emerald-600/90 border-emerald-400/50 text-white'
        }`}
      >
        {media.isConnected ? (
          <span className="text-xs" title="Disconnect">⏻</span>
        ) : (
          <span className="text-xs" title="Connect">▶️</span>
        )}
      </Button>
      <div className="glass-subtle rounded-xl">
        <ReportIssueDropdown onReport={onReportIssue} />
      </div>
    </div>
  );
}
