import React from "react";
import { VideoTile } from "./VideoTile";
import { WebRTCVideoConference } from "@/components/classroom/video/WebRTCVideoConference";
import { ToolButton } from "./ToolButton";
import { Gift, Clock, MessageSquare, Languages } from "lucide-react";

export type RailTool = "rewards" | "chat" | "translator";

interface RightRailProps {
  localStream: MediaStream | null;
  remoteStream?: MediaStream | null;
  isTeacher: boolean;
  isCameraOff?: boolean;
  teacherName: string;
  studentName: string;
  onOpenTool: (tool: RailTool) => void;
}

export function RightRail({
  localStream,
  remoteStream = null,
  isTeacher,
  isCameraOff = false,
  teacherName,
  studentName,
  onOpenTool,
}: RightRailProps) {
  const teacherLabel = teacherName || "Teacher";
  const studentLabel = studentName || "Student";

  // For the right rail, teacher video is always at top, student below
  const topStream = isTeacher ? localStream : remoteStream;
  const bottomStream = isTeacher ? remoteStream : localStream;
  const topIsCameraOff = isTeacher ? isCameraOff : false;
  const bottomIsCameraOff = isTeacher ? false : isCameraOff;

  return (
    <div className="h-full flex flex-col backdrop-blur-sm relative" style={{ 
      background: 'linear-gradient(180deg, rgba(232, 249, 255, 0.6) 0%, rgba(196, 217, 255, 0.4) 100%)',
      borderLeft: '1px solid rgba(196, 217, 255, 0.5)'
    }}>
      {/* Decorative side accent */}
      <div className="absolute left-0 top-1/4 w-1 h-1/2 rounded-r-full" style={{ background: 'linear-gradient(180deg, rgba(196, 217, 255, 0.8) 0%, rgba(197, 186, 255, 0.6) 50%, rgba(196, 217, 255, 0.8) 100%)' }}></div>
      
      {/* Teacher Video */}
      <div className="p-6 pb-4 relative" style={{ borderBottom: '1px solid rgba(196, 217, 255, 0.4)' }}>
        <div className="w-full relative" style={{ aspectRatio: '4/3' }}>
          {/* Video section label */}
          <div className="absolute -top-1 left-2 text-xs px-3 py-1 rounded-md z-10 font-medium" style={{ 
            backgroundColor: 'rgba(232, 249, 255, 0.9)', 
            backdropFilter: 'blur(4px)',
            color: '#1E40AF'
          }}>
            Teacher
          </div>
          <VideoTile
            stream={topStream}
            hasVideo={!!topStream}
            isTeacher={true}
            userLabel={teacherLabel}
            isCameraOff={topIsCameraOff}
          />
        </div>
      </div>

      {/* Student Video */}
      <div className="p-6 pt-4 pb-4 relative" style={{ borderBottom: '1px solid rgba(196, 217, 255, 0.4)' }}>
        <div className="w-full relative" style={{ aspectRatio: '4/3' }}>
          {/* Video section label */}
          <div className="absolute -top-1 left-2 text-xs px-3 py-1 rounded-md z-10 font-medium" style={{ 
            backgroundColor: 'rgba(197, 186, 255, 0.9)', 
            backdropFilter: 'blur(4px)',
            color: '#7C3AED'
          }}>
            Student
          </div>
          <VideoTile
            stream={bottomStream}
            hasVideo={!!bottomStream}
            isTeacher={false}
            userLabel={studentLabel}
            isCameraOff={bottomIsCameraOff}
          />
        </div>
      </div>

      {/* Tool Buttons */}
      <div className="flex-1 p-4 space-y-2 min-h-0 relative flex flex-col justify-center">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(196, 217, 255, 0.6) 50%, transparent 100%)' }}></div>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#4F46E5' }}>Tools</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(196, 217, 255, 0.6) 50%, transparent 100%)' }}></div>
        </div>
        
        {/* Floating decoration */}
        <div className="absolute top-8 right-6 w-1 h-1 rounded-full animate-pulse-subtle" style={{ backgroundColor: 'rgba(196, 217, 255, 0.6)' }}></div>
        <div className="absolute bottom-12 left-6 w-0.5 h-0.5 rounded-full animate-pulse-subtle animation-delay-500" style={{ backgroundColor: 'rgba(197, 186, 255, 0.7)' }}></div>
        
        <ToolButton
          icon={<Gift className="h-4 w-4" />}
          label="Rewards"
          onClick={() => onOpenTool("rewards")}
        />
        <ToolButton
          icon={<MessageSquare className="h-4 w-4" />}
          label="Chat"
          onClick={() => onOpenTool("chat")}
        />
        <ToolButton
          icon={<Languages className="h-4 w-4" />}
          label="Translator"
          onClick={() => onOpenTool("translator")}
        />
      </div>
    </div>
  );
}