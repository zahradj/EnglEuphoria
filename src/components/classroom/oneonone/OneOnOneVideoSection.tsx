
import React from "react";
import { Card } from "@/components/ui/card";
import { useMediaContext } from "./video/MediaContext";
import { LessonStartPrompt } from "./video/components/LessonStartPrompt";
import { LiveVideoPanels } from "./video/components/LiveVideoPanels";
import { VideoControlsOverlay } from "./video/components/VideoControlsOverlay";
import { XPProgressSection } from "./video/components/XPProgressSection";
import { SessionLog } from "./video/components/SessionLog";
import { MediaErrorDisplay } from "./video/components/MediaErrorDisplay";
import { QuickTeachingTools } from "./QuickTeachingTools";
import { StudentProgress } from "./StudentProgress";
import { useLessonState } from "./video/hooks/useLessonState";
import { useSessionLogging } from "./video/hooks/useSessionLogging";
import { useVideoRefs } from "./video/hooks/useVideoRefs";
import { useReportIssue } from "./video/hooks/useReportIssue";
import { OneOnOneVideoSectionProps } from "./video/types";

export function OneOnOneVideoSection({
  enhancedClassroom,
  currentUserId,
  currentUserName,
  isTeacher,
  studentXP = 1250,
  onAwardPoints,
  showRewardPopup = false,
  lessonStarted: externalLessonStarted
}: OneOnOneVideoSectionProps) {
  const media = useMediaContext();
  const { logMessages, logEvent } = useSessionLogging();
  const { lessonStarted, handleStartLesson } = useLessonState(externalLessonStarted, isTeacher, logEvent);
  const videoRefs = useVideoRefs(media, isTeacher);
  const { reportedIssue, handleReportIssue } = useReportIssue(logEvent);

  React.useEffect(() => {
    if (media.isConnected) {
      logEvent(`${isTeacher ? "Teacher" : "Student"} joined the session.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.isConnected, isTeacher]);

  const startLessonAndJoin = () => {
    handleStartLesson();
    logEvent("Lesson started by Teacher.");
    if (!media.isConnected) {
      media.join();
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      <Card className="flex-1 p-0 border border-border/40 bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        <div className="aspect-video relative flex items-center justify-center bg-muted/20">
          {!lessonStarted ? (
            <LessonStartPrompt isTeacher={isTeacher} onStartLesson={startLessonAndJoin} />
          ) : (
            <>
              <LiveVideoPanels isTeacher={isTeacher} media={media} lessonStarted={lessonStarted} videoRefs={videoRefs} />
              <VideoControlsOverlay media={media} lessonStarted={lessonStarted} onReportIssue={handleReportIssue} />
              {reportedIssue && (
                <div className="absolute bottom-16 right-3 z-10 glass-subtle px-4 py-2 rounded-xl text-warning font-medium animate-fade-in">
                  Reported: {reportedIssue}
                </div>
              )}
              {lessonStarted && media.isConnected && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-destructive text-destructive-foreground shadow-lg flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <XPProgressSection studentXP={studentXP} showRewardPopup={!!showRewardPopup} />
      </Card>

      {/* Teaching Tools and Progress - Side Panel for Teachers */}
      {isTeacher && (
        <div className="lg:w-80 flex-shrink-0 space-y-4 overflow-y-auto">
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/40">
            <QuickTeachingTools 
              currentUser={{
                role: isTeacher ? 'teacher' : 'student',
                name: currentUserName
              }}
            />
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/40">
            <StudentProgress
              studentXP={studentXP}
              studentName="Student"
              showRewardPopup={showRewardPopup}
              onAwardPoints={onAwardPoints}
            />
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/40">
            <SessionLog logMessages={logMessages} />
          </Card>
        </div>
      )}

      {!isTeacher && <SessionLog logMessages={logMessages} />}
      <MediaErrorDisplay error={media.error} />
    </div>
  );
}
