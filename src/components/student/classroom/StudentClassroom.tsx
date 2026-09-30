import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostClassFeedbackModal } from './PostClassFeedbackModal';
import { useToast } from '@/hooks/use-toast';
import { useClassroomSync } from '@/hooks/useClassroomSync';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useWebRTCConnection } from '@/hooks/useWebRTCConnection';
import { StudentClassroomHeader } from './StudentClassroomHeader';
import { StudentCommunicationSidebar } from './StudentCommunicationSidebar';
import { StudentMainStage } from './StudentMainStage';
import { StarCelebration } from '@/components/teacher/classroom/StarCelebration';
import { DiceRoller } from '@/components/teacher/classroom/DiceRoller';

import { LiveReactionBar, THUMBS_REACTIONS } from '@/components/classroom/engagement/LiveReactionBar';
import { XPStreakIndicator } from '@/components/classroom/engagement/XPStreakIndicator';
import { ZenModeOverlay } from '@/components/classroom/ZenModeOverlay';
import { PictureInPicture } from '@/components/classroom/PictureInPicture';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useIdleOpacity } from '@/hooks/useIdleOpacity';
import { whiteboardService } from '@/services/whiteboardService';
import { useHubClassroomTheme } from '@/components/classroom/shared/useHubClassroomTheme';
import { CountdownToStart } from '@/components/classroom/CountdownToStart';
import { useIsPortrait } from '@/hooks/useCompactVideoLayout';




type HubType = 'playground' | 'academy' | 'professional';

interface StudentClassroomProps {
  roomId: string;
  studentId: string;
  studentName: string;
  teacherName?: string;
  hubType?: HubType;
  /** Booking scheduled_at — used to anchor the lesson timer / gating. */
  scheduledAt?: string | Date | null;
  /** Optional fully-custom stage content (e.g. Success Hub Trail Lesson). */
  customStage?: React.ReactNode;
  /** True for interview/demo classrooms — see MainStage. */
  isInterview?: boolean;
}

export const StudentClassroom: React.FC<StudentClassroomProps> = ({
  roomId,
  studentId,
  studentName,
  teacherName = "Teacher",
  hubType = "academy",
  scheduledAt,
  customStage,
  isInterview = false,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const media = useLocalMedia();
  const [activeColor, setActiveColor] = useState('#FF6B6B');
  const [isZenMode, setIsZenMode] = useState(false);
  const [zenElapsed, setZenElapsed] = useState(0);
  const [videosFloating, setVideosFloating] = useState(false);
  const [mobileCommsOpen, setMobileCommsOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);


  // Instant broadcast-driven overlays (separate from slow DB-backed sync)
  const [liveStar, setLiveStar] = useState<{ count: number; isMilestone: boolean; key: number } | null>(null);
  const [liveSticker, setLiveSticker] = useState<{ emoji: string; key: number } | null>(null);

  const headerIdle = useIdleOpacity({ idleTimeout: 3000, idleOpacity: 0.4 });
  // Video sidebar intentionally has no idle-dim (per direct report: seeing
  // the teacher's face is critical throughout the lesson, not just while
  // the mouse is hovering over the tiles) — headerIdle above is unaffected.
  // Orientation-only, not width-gated — a portrait TABLET must stack video-
  // above-lesson exactly like a portrait phone does; only the phone-specific
  // compact video strip sizing (inside StudentCommunicationSidebar) still
  // keys off narrow width.
  const isPortrait = useIsPortrait();

  const {
    session,
    currentSlide,
    activeTool,
    studentCanDraw,
    lessonSlides,
    lessonTitle,
    isConnected,
    strokes,
    addStroke,
    quizActive,
    quizLocked,
    quizRevealAnswer,
    pollActive,
    pollShowResults,
    embeddedUrl,
    isScreenSharing,
    starCount,
    showStarCelebration,
    isMilestone,
    timerValue,
    timerRunning,
    sharedNotes,
    sessionContext,
    activeCanvasTab,
    stageMode,
    drawingEnabled,
    iframeUnlocked,
    activityUnlocked,
    setCurrentSlideIndex,
    updateSharedNotes,
    applyRemoteStageMode,
    applyRemoteDrawingEnabled,
    applyRemoteIframeUnlocked,
    applyRemoteActivityUnlocked,
    sessionEnded,
    sceneLessonIdx,
    sceneInteractionUnlocked,
  } = useClassroomSync({
    roomId,
    userId: studentId,
    userName: studentName,
    role: 'student'
  });

  // Slide completion reporting — broadcast to teacher when student finishes an interactive activity
  const handleSlideCompletion = useCallback((slideIndex: number, slideId: string, accuracy?: number, timeSpent?: number) => {
    whiteboardService.sendSlideCompletion(roomId, {
      slideIndex,
      slideId,
      accuracy,
      timeSpent,
      senderId: studentId,
      senderName: studentName,
    });
  }, [roomId, studentId, studentName]);

  const webrtcRoom = `engleuphoria-${roomId}`;
  const [channelStatus, setChannelStatus] = useState<'CONNECTING' | 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT'>('CONNECTING');
  const pageLoadTime = useRef(Date.now());

  // Slide navigation, stage mode, and Force Sync are all handled in-place by
  // the realtime broadcast listeners inside useClassroomSync. No page reload,
  // no DB polling — students stay locked to whatever the teacher broadcasts.


  useEffect(() => {
    if (!roomId || !studentId) return;

    const unsubStage = whiteboardService.subscribeToStageMode(roomId, ({ mode, senderId }) => {
      if (senderId === studentId || !mode) return;
      applyRemoteStageMode(mode);
    });
    const unsubDrawing = whiteboardService.subscribeToDrawingEnabled(roomId, ({ enabled, senderId }) => {
      if (senderId === studentId || typeof enabled !== 'boolean') return;
      applyRemoteDrawingEnabled(enabled);
    });
    const unsubIframeLock = whiteboardService.subscribeToIframeLockState(roomId, ({ isUnlocked, senderId }) => {
      if (senderId === studentId || typeof isUnlocked !== 'boolean') return;
      applyRemoteIframeUnlocked(isUnlocked);
      if (isUnlocked) {
        toast({
          title: '🔓 Web page unlocked',
          description: 'You can now interact with the web page!',
          duration: 2500,
        });
      }
    });
    const unsubActivityLock = whiteboardService.subscribeToSceneActivityLockState(roomId, ({ isUnlocked, senderId }) => {
      if (senderId === studentId || typeof isUnlocked !== 'boolean') return;
      applyRemoteActivityUnlocked(isUnlocked);
      if (isUnlocked) {
        toast({
          title: '🔓 Activity unlocked',
          description: 'You can play along now!',
          duration: 2500,
        });
      }
    });
    const unsubReward = whiteboardService.subscribeToRewards(roomId, (payload) => {
      if (payload.senderId === studentId) return;
      if (payload.rewardType === 'star') {
        setLiveStar({
          count: payload.starCount ?? 1,
          isMilestone: !!payload.isMilestone,
          key: Date.now(),
        });
      } else if (payload.rewardType === 'sticker') {
        setLiveSticker({ emoji: payload.sticker || '😊', key: Date.now() });
        setTimeout(() => setLiveSticker(null), 1000);
      }
    });
    const unsubStatus = whiteboardService.subscribeToStatus(roomId, (status) => {
      if (status === 'SUBSCRIBED' || status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CONNECTING') {
        setChannelStatus(status as 'CONNECTING' | 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT');
      }
    });
    // Teacher's "Force refresh" button — an actual reload, not an in-place
    // state patch, so it recovers from a stuck view even when the state
    // that's wrong (e.g. session_context.classStarted) isn't covered by any
    // of the other targeted sync channels above.
    const unsubForceReload = whiteboardService.subscribeToForceReload(roomId, () => {
      toast({ title: '🔄 Your teacher refreshed the class', description: 'Reloading…' });
      setTimeout(() => window.location.reload(), 300);
    });
    return () => {
      unsubStage();
      unsubDrawing();
      unsubIframeLock();
      unsubActivityLock();
      unsubReward();
      unsubStatus();
      unsubForceReload();
    };
  }, [roomId, studentId, applyRemoteStageMode, applyRemoteDrawingEnabled, applyRemoteIframeUnlocked, applyRemoteActivityUnlocked, setCurrentSlideIndex, toast]);

  // Slide sync is now fully handled by postgres_changes in useClassroomSync — no broadcast needed.

  // Auto-join local media after mount (post-PreFlightCheck)
  useEffect(() => { media.join(); return () => { media.leave(); }; }, []);

  // WebRTC peer connection
  const { participants, isConnected: rtcConnected, connect: rtcConnect, disconnect: rtcDisconnect } = useWebRTCConnection({
    roomId: webrtcRoom,
    userId: studentId,
    localStream: media.stream,
    enabled: media.isConnected
  });

  // Notify when teacher joins
  const prevParticipantCount = useRef(0);
  useEffect(() => {
    // Fire on the 0 → 1 transition too — that's the moment the student is
    // actually waiting for (the old `> 0` guard meant it never fired then).
    if (participants.length > prevParticipantCount.current) {
      toast({ title: "👋 Teacher Joined", description: `${teacherName} has joined the classroom`, className: "bg-green-900 border-green-700" });
    }
    prevParticipantCount.current = participants.length;
  }, [participants.length]);

  // Apply teacher's remote mic/camera control over the student
  const ctx = sessionContext as any;
  const remoteMicMuted = !!ctx?.studentMicMuted;
  const remoteCameraOff = !!ctx?.studentCameraOff;
  const prevRemoteMicRef = useRef<boolean | null>(null);
  const prevRemoteCamRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!media.isConnected) return;
    // Force the student's local tracks to match the teacher's request
    media.toggleMicrophone(remoteMicMuted);
    if (prevRemoteMicRef.current !== null && prevRemoteMicRef.current !== remoteMicMuted) {
      toast({
        title: remoteMicMuted ? "🔇 Microphone muted by teacher" : "🔊 Microphone unmuted by teacher",
        description: remoteMicMuted ? "Your teacher has muted your microphone" : "Your microphone is on again"
      });
    }
    prevRemoteMicRef.current = remoteMicMuted;
  }, [remoteMicMuted, media.isConnected]);

  useEffect(() => {
    if (!media.isConnected) return;
    media.toggleCamera(remoteCameraOff);
    if (prevRemoteCamRef.current !== null && prevRemoteCamRef.current !== remoteCameraOff) {
      toast({
        title: remoteCameraOff ? "📷 Camera turned off by teacher" : "📹 Camera turned on by teacher",
        description: remoteCameraOff ? "Your teacher has turned off your camera" : "Your camera is back on"
      });
    }
    prevRemoteCamRef.current = remoteCameraOff;
  }, [remoteCameraOff, media.isConnected]);

  // Zen mode keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Zen mode elapsed timer
  useEffect(() => {
    if (!isZenMode) return;
    const interval = setInterval(() => setZenElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isZenMode]);

  // Teacher ended the session → tear down media/WebRTC and route to the
  // shared Post-Lesson Summary page within milliseconds of the realtime UPDATE.
  const sessionEndedHandled = useRef(false);
  useEffect(() => {
    if (!sessionEnded || sessionEndedHandled.current) return;
    sessionEndedHandled.current = true;
    toast({
      title: 'Class ended',
      description: 'Your teacher has ended the session. Great work today!'
    });
    // Best-effort teardown — don't block navigation on these.
    try { void rtcDisconnect(); } catch (e) { /* noop */ }
    try { media.leave(); } catch (e) { /* noop */ }
    navigate(`/classroom/${roomId}/summary`, { replace: true });
  }, [sessionEnded, toast, roomId, navigate, rtcDisconnect, media]);

  const handleLeaveClass = () => {
    setShowFeedbackModal(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    toast({
      title: 'Left Classroom',
      description: 'You have left the classroom session.'
    });
    // Send each student back to their own hub's dashboard — this used to be
    // hardcoded to /playground, dropping Academy/Success students into the
    // kids' hub after every lesson.
    navigate(hubType === 'playground' ? '/playground' : hubType === 'professional' ? '/hub' : '/academy');
  };

  // "Leave" sits right next to the mic/camera buttons, so a mis-tap is easy.
  // Dismissing the leave dialog (Esc, click outside, "Stay in class") must
  // keep the student in the lesson rather than exit it.
  const handleStayInClass = () => {
    setShowFeedbackModal(false);
  };

  const handleReconnect = async () => {
    await rtcDisconnect();
    await rtcConnect();
    toast({ title: "🔄 Reconnecting...", description: "Attempting to reconnect video" });
  };

  const slides = lessonSlides.length > 0
    ? lessonSlides
    : [{ id: '__loading__', title: 'Lesson loading…', body: 'Your teacher is preparing the lesson. Slides will appear here in a moment.' }];

  // Hub-tinted classroom canvas — same palette family as the teacher view
  // (Playground=orange, Academy=purple, Success=emerald) so both sides match.
  const hubTheme = useHubClassroomTheme(hubType);
  const showDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

  const classStarted = !!(sessionContext as any)?.classStarted;

  return (
    <div
      className="h-dvh w-full text-gray-900 flex flex-col overflow-hidden relative"
      style={hubTheme.meshGradient}
    >
      {!classStarted && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="text-center max-w-sm px-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">⏳</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Waiting for your teacher…</h2>
            <p className="text-sm text-gray-600 mb-4">
              The class will start as soon as your teacher clicks <strong>Start Class</strong>.
            </p>
            <div className="flex justify-center">
              <CountdownToStart scheduledAt={scheduledAt ?? null} />
            </div>
          </div>
        </div>
      )}


      {/* (Connection status now lives inside StudentClassroomHeader's signal badge) */}
      {/* Debug Room ID Label */}
      {showDebug && (
        <div className="fixed bottom-2 left-2 z-[100] bg-black/50 text-white text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm">
          Room: {roomId} | WebRTC: {webrtcRoom}
        </div>
      )}
      {/* Star Celebration Overlay (DB-backed) */}
      <StarCelebration
        isVisible={showStarCelebration}
        starCount={starCount}
        studentName={studentName}
        isMilestone={isMilestone}
        onComplete={() => {}}
      />

      {/* Star Celebration Overlay (instant broadcast) */}
      {liveStar && (
        <StarCelebration
          key={liveStar.key}
          isVisible={true}
          starCount={liveStar.count}
          studentName={studentName}
          isMilestone={liveStar.isMilestone}
          onComplete={() => setLiveStar(null)}
        />
      )}

      {/* Sticker Overlay (instant broadcast) */}
      <AnimatePresence>
        {liveSticker && (
          <motion.div
            key={liveSticker.key}
            initial={{ opacity: 0, scale: 0.2, y: 80 }}
            animate={{ opacity: 1, scale: 1.2, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -40 }}
            transition={{ type: 'spring', stiffness: 220 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none text-[180px] drop-shadow-2xl"
          >
            {liveSticker.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Overlay */}
      <AnimatePresence>
        {timerRunning && timerValue !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-4 border border-blue-300 shadow-lg">
              <div className="flex items-center gap-4">
                <Timer className="w-8 h-8 text-blue-600" />
                <div className="text-5xl font-mono font-bold text-blue-600">
                  {Math.floor(timerValue / 60).toString().padStart(2, '0')}:
                  {(timerValue % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {isZenMode && (
          <>
            <ZenModeOverlay
              elapsed={zenElapsed}
              isMuted={media.isMuted}
              isCameraOff={media.isCameraOff}
              onToggleMute={() => media.toggleMicrophone()}
              onToggleCamera={() => media.toggleCamera()}
              onExitZen={() => setIsZenMode(false)}
            />
            <PictureInPicture
              name={teacherName}
              isConnected={rtcConnected}
              stream={participants[0]?.stream || null}
            />
          </>
        )}
      </AnimatePresence>

      {/* Video tiles floated out of the sidebar over the lesson content —
          desktop/landscape-tablet only. react-rnd positions these with
          fixed pixel coordinates (defaultPosition below) that were never
          adapted for narrow/portrait screens, where they can end up
          covering the lesson content with no way back short of finding
          the tiny dock icon on hover. The always-visible compact video
          strip (StudentCommunicationSidebar) already solves "see the
          video without losing the lesson" on narrow screens, so floating
          mode is desktop-only; the toggle to enter it is hidden below
          `md` there too. */}
      {!isZenMode && videosFloating && (
        <div className="hidden md:contents">
          <PictureInPicture
            name={teacherName}
            isConnected={rtcConnected}
            stream={participants[0]?.stream || null}
            defaultPosition={{ x: 240, y: 76 }}
            onDock={() => setVideosFloating(false)}
          />
          <PictureInPicture
            name={`${studentName} (You)`}
            isConnected={media.isConnected}
            stream={media.stream}
            mirrored
            isMuted={media.isMuted}
            isCameraOff={media.isCameraOff}
            defaultPosition={{ x: 240, y: 292 }}
            onDock={() => setVideosFloating(false)}
          />
        </div>
      )}

      {/* Media Permission Error Overlay */}
      {media.error && (
        // z-[130]: must sit above the "Waiting for your teacher" wall (z-[120]),
        // otherwise a student whose mic was blocked just waits forever with
        // no idea why the teacher can't start the class.
        <div className="fixed inset-0 z-[130] bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Camera & Microphone Required</h2>
            <p className="text-gray-600">{media.error}</p>
            <button
              onClick={() => media.join()}
              className={`px-6 py-2 rounded-lg transition-colors ${
                hubType === 'playground'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : hubType === 'professional'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header (hidden in Zen) */}
      {!isZenMode && (
        <div style={headerIdle.style} onMouseMove={headerIdle.onMouseMove} onMouseEnter={headerIdle.onMouseEnter}>
          <StudentClassroomHeader
            lessonTitle={lessonTitle}
            isConnected={isConnected}
            isMuted={media.isMuted}
            isCameraOff={media.isCameraOff}
            onToggleMute={() => media.toggleMicrophone()}
            onToggleCamera={() => media.toggleCamera()}
            onLeaveClass={handleLeaveClass}
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode(!isZenMode)}
            hubType={hubType}
            rtcConnected={rtcConnected}
            onReconnect={handleReconnect}
            studentStars={starCount}
            scheduledAt={scheduledAt ?? null}
            onToggleComms={() => setMobileCommsOpen(v => !v)}
            isPortrait={isPortrait}
          />
        </div>
      )}

      {/* Main Content — portrait phone/tablet stacks the video strip above
          the lesson (flex-col) instead of the desktop/landscape side-by-side
          row, per direct report that video frames should sit above the
          lesson, not float over/beside it, in portrait. Orientation-only
          (isPortrait), not narrow-width-gated — a portrait tablet must get
          this too, not just a portrait phone. */}
      <div className={`flex-1 flex overflow-hidden ${isPortrait ? 'flex-col' : ''}`}>
        {/* Communication — left sidebar on desktop/landscape, full-width bar above the stage in portrait */}
        {!isZenMode && (
          <div className={isPortrait ? 'w-full shrink-0' : undefined}>
            <StudentCommunicationSidebar
              studentName={studentName}
              teacherName={teacherName}
              isMuted={media.isMuted}
              isCameraOff={media.isCameraOff}
              onToggleMute={() => media.toggleMicrophone()}
              onToggleCamera={() => media.toggleCamera()}
              localStream={media.stream}
              remoteStream={participants[0]?.stream || null}
              isRemoteConnected={rtcConnected}
              hubType={hubType === 'professional' ? 'success' : hubType}
              roomId={roomId}
              userId={studentId}
              videosFloating={videosFloating}
              onToggleVideosFloating={() => setVideosFloating(v => !v)}
              mobileOpen={mobileCommsOpen}
              onMobileClose={() => setMobileCommsOpen(false)}
            />
          </div>
        )}

        {/* Main Stage */}
        <StudentMainStage
          slides={slides}
          currentSlideIndex={currentSlide}
          studentCanDraw={studentCanDraw}
          activeTool={activeTool}
          activeColor={activeColor}
          strokes={strokes}
          roomId={roomId}
          userId={studentId}
          userName={studentName}
          sessionId={session?.id}
          quizActive={quizActive}
          quizLocked={quizLocked}
          quizRevealAnswer={quizRevealAnswer}
          pollActive={pollActive}
          pollShowResults={pollShowResults}
          embeddedUrl={embeddedUrl}
          isScreenSharing={isScreenSharing}
          activeCanvasTab={activeCanvasTab}
          sessionContext={sessionContext}
          stageMode={stageMode}
          drawingEnabled={drawingEnabled}
          iframeUnlocked={iframeUnlocked}
          activityUnlocked={activityUnlocked}
          rawSlides={lessonSlides}
          hubType={hubType === 'professional' ? 'professional' : hubType}
          onAddStroke={addStroke}
          onSlideComplete={handleSlideCompletion}
          customStage={customStage}
          isInterview={isInterview}
          sceneLessonIdx={sceneLessonIdx}
          sceneInteractionUnlocked={sceneInteractionUnlocked}
        />
      </div>


      {/* Engagement layer: in-session XP pill + live reaction dock */}
      {!isZenMode && (
        <>
          <div className="fixed top-16 right-4 z-30 pointer-events-auto">
            <XPStreakIndicator
              xp={Math.max(0, starCount * 10)}
              streak={starCount}
              hubType={hubType}
            />
          </div>
          <LiveReactionBar
            roomId={roomId}
            userId={studentId}
            hubType={hubType}
            reactions={THUMBS_REACTIONS}
            canSend
          />
        </>
      )}

      {/* Post-Class Feedback Modal */}

      <PostClassFeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleFeedbackClose}
        onStay={sessionEnded ? undefined : handleStayInClass}
        teacherName={teacherName || (sessionContext as any)?.teacherName || 'Teacher'}
        teacherId={(sessionContext as any)?.teacherId || ''}
        lessonId={roomId}
        roomId={roomId}
      />
    </div>
  );
};
