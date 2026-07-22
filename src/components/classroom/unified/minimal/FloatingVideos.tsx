import React from "react";
import { VideoPlayer } from "@/components/classroom/unified/components/VideoPlayer";

interface FloatingVideosProps {
  localStream: MediaStream | null;
  remoteStream?: MediaStream | null;
  isTeacher: boolean;
  isCameraOff?: boolean;
  teacherName: string;
  studentName: string;
}

export function FloatingVideos({
  localStream,
  remoteStream = null,
  isTeacher,
  isCameraOff = false,
  teacherName,
  studentName,
}: FloatingVideosProps) {
  const teacherLabel = teacherName || "Teacher";
  const studentLabel = studentName || "Student";

  // Determine which stream is "mine" vs "other"
  const myLabel = isTeacher ? teacherLabel : studentLabel;
  const otherLabel = isTeacher ? studentLabel : teacherLabel;

  return (
    <>
      {/* Top-left: current user */}
      <div className="pointer-events-auto fixed top-4 left-4 z-30">
        <div className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full overflow-hidden ring-2 ring-primary/40 shadow-xl bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          {localStream ? (
            <VideoPlayer
              stream={localStream}
              hasVideo={true}
              isTeacher={isTeacher}
              userLabel={myLabel}
              isCameraOff={!!isCameraOff}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs sm:text-sm text-muted-foreground">{myLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top-right: other user */}
      <div className="pointer-events-auto fixed top-4 right-4 z-30">
        <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full overflow-hidden ring-2 ring-primary/20 shadow-lg bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          {remoteStream ? (
            <VideoPlayer
              stream={remoteStream}
              hasVideo={true}
              isTeacher={!isTeacher}
              userLabel={otherLabel}
              isCameraOff={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] sm:text-xs text-muted-foreground">{otherLabel}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
