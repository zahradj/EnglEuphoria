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

import { LiveReactionBar } from '@/components/classroom/engagement/LiveReactionBar';
import { XPStreakIndicator } from '@/components/classroom/engagement/XPStreakIndicator';
import { ZenModeOverlay } from '@/components/classroom/ZenModeOverlay';
import { PictureInPicture } from '@/components/classroom/PictureInPicture';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Dice6 } from 'lucide-react';
import { useIdleOpacity } from '@/hooks/useIdleOpacity';
import { whiteboardService } from '@/services/whiteboardService';
import { useHubClassroomTheme } from '@/components/classroom/shared/useHubClassroomTheme';
import { ClassroomLibraryDrawer } from './ClassroomLibraryDrawer';
import { BookOpen } from 'lucide-react';
import { CountdownToStart } from '@/components/classroom/CountdownToStart';




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
}

export const StudentClassroom: React.FC<StudentClassroomProps> = ({
  roomId,
  studentId,
  studentName,
  teacherName = "Teacher",
  hubType = "academy",
  scheduledAt,
  customStage,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const media = useLocalMedia();
  const [activeColor, setActiveColor] = useState('#FF6B6B');
  const [isZenMode, setIsZenMode] = useState(false);
  const [zenElapsed, setZenElapsed] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);


  // Instant broadcast-driven overlays (separate from slow DB-backed sync)
  const [liveStar, setLiveStar] = useState<{ count: number; isMilestone: boolean; key: number } | null>(null);
  const [liveDice, setLiveDice] = useState<{ value: number; key: number } | null>(null);
  const [liveSticker, setLiveSticker] = useState<{ emoji: string; key: number } | null>(null);

  const headerIdle = useIdleOpacity({ idleTimeout: 3000, idleOpacity: 0.4 });
  const sidebarIdle = useIdleOpacity({ idleTimeout: 4000, idleOpacity: 0.3 });

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
    diceValue,
    sharedNotes,
    sessionContext,
    activeCanvasTab,
    stageMode,
    drawingEnabled,
    iframeUnlocked,
    setCurrentSlideIndex,
    updateSharedNotes,
    applyRemoteStageMode,
    applyRemoteDrawingEnabled,
    applyRemoteIframeUnlocked,
    sessionEnded
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
    const unsubTool = whiteboardService.subscribeToToolActions(roomId, (payload) => {
      if (payload.senderId === studentId || payload.tool !== 'dice') return;
      setLiveDice({ value: payload.result, key: Date.now() });
      setTimeout(() => setLiveDice(null), 1500);
    });
    const unsubStatus = whiteboardService.subscribeToStatus(roomId, (status) => {
      if (status === 'SUBSCRIBED' || status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CONNECTING') {
        setChannelStatus(status as 'CONNECTING' | 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT');
      }
    });
    return () => {
      unsubStage();
      unsubDrawing();
      unsubIframeLock();
      unsubReward();
      unsubTool();
      unsubStatus();
    };
  }, [roomId, studentId, applyRemoteStageMode, applyRemoteDrawingEnabled, applyRemoteIframeUnlocked, setCurrentSlideIndex, toast]);

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
    if (participants.length > prevParticipantCount.current && prevParticipantCount.current >= 0) {
      if (prevParticipantCount.current > 0) {
        toast({ title: "👋 Teacher Joined", description: "Your teacher has joined the classroom", className: "bg-green-900 border-green-700" });
      }
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
    navigate('/playground');
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

      {/* Dice Overlay (instant broadcast) */}
      <AnimatePresence>
        {liveDice && (
          <motion.div
            key={liveDice.key}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
          >
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <div className="flex flex-col items-center gap-4">
                <Dice6 className="w-12 h-12 text-white" />
                <div className="text-7xl font-bold text-white">{liveDice.value}</div>
              </div>
            </div>
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

      {/* Dice Result Overlay */}
      <AnimatePresence>
        {diceValue !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
              <div className="flex flex-col items-center gap-4">
                <Dice6 className="w-12 h-12 text-white" />
                <div className="text-7xl font-bold text-white">{diceValue}</div>
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
              name="Teacher"
              isConnected={rtcConnected}
              stream={participants[0]?.stream || null}
            />
          </>
        )}
      </AnimatePresence>

      {/* Media Permission Error Overlay */}
      {media.error && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center">
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
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Communication */}
        {!isZenMode && (
          <div style={sidebarIdle.style} onMouseMove={sidebarIdle.onMouseMove} onMouseEnter={sidebarIdle.onMouseEnter}>
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
          rawSlides={lessonSlides}
          hubType={hubType === 'professional' ? 'professional' : hubType}
          onAddStroke={addStroke}
          onSlideComplete={handleSlideCompletion}
          customStage={customStage}
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
            canSend
          />
        </>
      )}

      {/* In-classroom Library Drawer (Vocab / Sounds / Grammar / Stories) */}
      {!isZenMode && (
        <>
          <button
            onClick={() => setLibraryOpen(true)}
            className={`fixed bottom-6 right-24 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform ${
              hubType === 'playground'
                ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                : hubType === 'professional'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                : 'bg-gradient-to-br from-indigo-500 to-violet-500'
            }`}
            aria-label="Open library drawer"
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Library</span>
          </button>
          <ClassroomLibraryDrawer
            open={libraryOpen}
            onOpenChange={setLibraryOpen}
            hubType={hubType}
          />
        </>
      )}

      {/* Post-Class Feedback Modal */}

      <PostClassFeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleFeedbackClose}
        teacherName={teacherName || (sessionContext as any)?.teacherName || 'Teacher'}
        teacherId={(sessionContext as any)?.teacherId || ''}
        lessonId={roomId}
        roomId={roomId}
      />
    </div>
  );
};
