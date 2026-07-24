import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useClassroomSync } from "@/hooks/useClassroomSync";
import { useAuth } from "@/contexts/AuthContext";
import { useScreenShare } from "@/hooks/useScreenShare";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { useStudentContext } from "@/hooks/useStudentContext";
import { useWebRTCConnection } from "@/hooks/useWebRTCConnection";
import { ClassroomTopBar } from "./ClassroomTopBar";
import { CommunicationZone } from "./CommunicationZone";
import { MainStage } from "@/components/classroom/stage/MainStage";
import { TeacherControlDock } from "@/components/classroom/stage/TeacherControlDock";
import { SlideNavigator } from "./SlideNavigator";
import { getClassroomHubTheme } from "./hubClassroomTheme";
import { DiceRoller } from "./DiceRoller";
import { StarCelebration } from "./StarCelebration";
import { EmbedLinkDialog } from "./EmbedLinkDialog";
import { AIGameGeneratorModal } from "./AIGameGeneratorModal";

import { LiveReactionBar } from "@/components/classroom/engagement/LiveReactionBar";
import { ZenModeOverlay } from "@/components/classroom/ZenModeOverlay";
import { PictureInPicture } from "@/components/classroom/PictureInPicture";
import { LessonWrapUpDialog } from "@/components/classroom/LessonWrapUpDialog";
import { TeacherInstructionsSidebar } from "@/components/classroom/TeacherInstructionsSidebar";
import { ConnectionDebugPanel, type ConnectionHealthStatus } from "@/components/classroom/debug/ConnectionDebugPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";
import { Wand2, MousePointer2, Pencil, Highlighter, Type, Minus, ArrowUpRight, Square, Circle as CircleIcon, Eraser, Trash2, X, PenTool } from "lucide-react";
import LibraryDrawer from "@/components/lesson-player/LibraryDrawer";
import { CountdownToStart } from "@/components/classroom/CountdownToStart";
import { buildPreviewHomeworkPack } from "@/components/lesson-player/buildPreviewHomeworkPack";
import { useIdleOpacity } from "@/hooks/useIdleOpacity";
import { useClassroomTimer } from "@/hooks/classroom/useClassroomTimer";
import { useSmartTimer } from "@/hooks/classroom/useSmartTimer";
import { useLessonTimePolicy } from "@/hooks/classroom/useLessonTimePolicy";
import { whiteboardService, type SmartWorksheet, type NativeGameType, type StageMode } from "@/services/whiteboardService";
import { supabase } from "@/integrations/supabase/client";
import { LessonSwitcher } from "./LessonSwitcher";


type HubType = 'playground' | 'academy' | 'professional';

interface TeacherClassroomProps {
  classId?: string;
  studentName?: string;
  studentId?: string;
  lessonTitle?: string;
  lessonId?: string;
  teacherName?: string;
  hubType?: HubType;
  /** Pre-resolved Master Library slides (raw curriculum_lessons.content.slides) */
  initialSlides?: any[];
  /** Booking scheduled_at — anchors the lesson timer so re-entry resumes. */
  scheduledAt?: string | Date | null;
  /** Optional fully-custom stage content (e.g. Success Hub Trail Lesson). */
  customStage?: React.ReactNode;
  /** Demo interview classroom — 25min flat, no early-leave penalty. */
  isInterview?: boolean;
  /** Trial (student's first booking) — 25 mandatory + 5 optional across every hub. */
  isTrial?: boolean;
}


export const TeacherClassroom: React.FC<TeacherClassroomProps> = ({
  classId = "101",
  studentName = "Emma",
  studentId,
  lessonTitle = "Magic Forest: Lesson 1",
  lessonId,
  teacherName = "Teacher",
  hubType = "academy",
  initialSlides,
  scheduledAt,
  customStage,
  isInterview = false,
  isTrial = false,
}) => {

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const media = useLocalMedia();
  const [participantCount, setParticipantCount] = useState(2);
  const [activeTool, setActiveTool] = useState('pointer');
  const [activeColor, setActiveColor] = useState('#FF6B6B');
  const [penRailOpen, setPenRailOpen] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [diceDialogOpen, setDiceDialogOpen] = useState(false);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerValue, setTimerValue] = useState(60);
  const [wrapUpOpen, setWrapUpOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [zenElapsed, setZenElapsed] = useState(0);
  // (commsCollapsed removed — Live video sidebar is now a fixed dock.)
  const [slideNavOpen, setSlideNavOpen] = useState(false);

  // Star celebration state
  const [studentStars, setStudentStars] = useState(0);
  const [showStarCelebration, setShowStarCelebration] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);

  // Embed link state
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

  // AI Game Generator state
  const [gameGeneratorOpen, setGameGeneratorOpen] = useState(false);
  const [activeWorksheet, setActiveWorksheet] = useState<SmartWorksheet | null>(null);

  // Teacher instructions sidebar
  const [instructionsSidebarOpen, setInstructionsSidebarOpen] = useState(false);

  // Library drawer for live lesson injection
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  // Raw GeneratedSlide[] for premium rendering in the stage — seeded from the
  // resolved Master Library lesson when one is linked to this booking.
  const [rawSlides, setRawSlides] = useState<any[]>(() => {
    const src = initialSlides ?? [];
    // Mirror the slides() dedupe — collapse consecutive intros at the head
    // so the live stage doesn't render two intro slides back-to-back.
    const out: any[] = [];
    let lastWasIntro = false;
    for (const s of src) {
      const isIntro = (s as any)?.type === 'intro' || (s as any)?.slide_type === 'intro';
      if (isIntro && lastWasIntro && out.length === 1) continue;
      out.push(s);
      lastWasIntro = isIntro;
    }
    return out;
  });

  // Live student-action mirror — populated by the realtime broadcast so the
  // teacher instantly sees what the student selected on each slide.
  const [liveStudentAnswers, setLiveStudentAnswers] = useState<Record<string, { label: string; ts: number }>>({});
  const [latestStudentAction, setLatestStudentAction] = useState<{ label: string; ts: number } | null>(null);
  // Teacher can dismiss the full-screen pre-class gate to "prepare" inside the classroom.
  const [prepMode, setPrepMode] = useState(false);
  // Top-right popup that nudges the teacher to start once the student arrives.
  const [showStartNudge, setShowStartNudge] = useState(false);

  // Hub-aware lesson time policy (Playground = 25+5, Academy/Success = 55+5).
  const { classTime } = useClassroomTimer(scheduledAt ?? null);
  const timePolicy = useLessonTimePolicy(hubType, classTime, { isInterview, isTrial });
  const sessionDuration: 25 | 55 = isInterview ? 25 : (timePolicy.mandatoryMinutes as 25 | 55);
  const smartTimer = useSmartTimer(classTime, sessionDuration);

  const wrapUpAutoOpenedRef = React.useRef(false);

  // Auto-hide for top bar and sidebars
  const topBarIdle = useIdleOpacity({ idleTimeout: 3000, idleOpacity: 0.4 });
  const sidebarIdle = useIdleOpacity({ idleTimeout: 4000, idleOpacity: 0.3 });

  // Context Handshake
  const { context: studentContext } = useStudentContext(studentId);

  // Use classId directly as roomName so both teacher and student join the same room
  const roomName = classId;
  const webrtcRoom = `engleuphoria-${classId}`;
  

  const placeholderSlides = React.useMemo(() => ([
    { id: '1', title: 'Welcome to the Lesson' },
    { id: '2', title: 'Vocabulary: Animals' },
    { id: '3', title: 'Practice: Matching Game' },
    { id: '4', title: 'Sentence Building' },
    { id: '5', title: 'Speaking Practice' },
    { id: '6', title: 'Quiz Time!' },
    { id: '7', title: 'Great Job! Summary' },
  ]), []);

  // Prefer real Master Library slides when present.
  // Dedupe: if the AI generated an intro/cover slide AND a hardcoded intro
  // was prepended, collapse consecutive intros at the start of the deck so
  // we don't render Slide 1 + Slide 2 as two near-identical intros.
  const slides = React.useMemo(() => {
    if (initialSlides && initialSlides.length > 0) {
      const dedupedRaw: any[] = [];
      let lastWasIntro = false;
      for (const s of initialSlides) {
        const isIntro = (s as any)?.type === 'intro' || (s as any)?.slide_type === 'intro';
        // Only collapse the *leading* intro chain — keep mid-lesson section intros.
        if (isIntro && lastWasIntro && dedupedRaw.length === 1) continue;
        dedupedRaw.push(s);
        lastWasIntro = isIntro;
      }
      return dedupedRaw.map((s: any, i: number) => ({
        ...s,
        id: String(s?.id ?? i + 1),
        title: String(s?.title || s?.content?.title || `Slide ${i + 1}`),
        imageUrl: s?.imageUrl || s?.image_url || s?.generated_image_url || s?.media_url || s?.content?.imageUrl,
      }));
    }
    return placeholderSlides;
  }, [initialSlides, placeholderSlides]);

  const lessonData = React.useMemo(
    () => ({ title: lessonTitle, slides }),
    [lessonTitle, slides]
  );

  const {
    session,
    currentSlide,
    lessonSlides: syncedLessonSlides,
    lessonTitle: syncedLessonTitle,
    studentCanDraw,
    isConnected,
    strokes,
    sharedNotes,
    sessionContext,
    activeCanvasTab,
    embeddedUrl,
    stageMode,
    drawingEnabled,
    iframeUnlocked,
    setCurrentSlideIndex,
    setIframeUnlocked,
    updateSlide,
    updateTool,
    setStudentCanDraw,
    endSession,
    addStroke,
    clearCanvas,
    updateSharedDisplay,
    updateSharedNotes,
    updateSessionContext,
    updateCanvasTab,
    setStageMode,
    setDrawingEnabled,
    applyRemoteStageMode,
    applyRemoteDrawingEnabled,
    forceSync,
  } = useClassroomSync({
    roomId: roomName,
    userId: user?.id || (() => {
      const stored = sessionStorage.getItem('demo-teacher-id');
      if (stored) return stored;
      const id = crypto.randomUUID();
      sessionStorage.setItem('demo-teacher-id', id);
      return id;
    })(),
    userName: teacherName,
    role: 'teacher',
    lessonData
  });

  // Save student context to session when available
  useEffect(() => {
    if (studentContext && isConnected) {
      updateSessionContext({
        studentName: studentContext.studentName,
        level: studentContext.level,
        cefrLevel: studentContext.cefrLevel,
        lastMistake: studentContext.lastMistake,
        interests: studentContext.interests,
        mistakeHistory: studentContext.mistakeHistory,
        summary: studentContext.summary
      });
    }
  }, [studentContext, isConnected]);

  // When the booking has a linked Master Library lesson, push the real slides
  // into the shared session once on connect — replacing any stale placeholder
  // (e.g. "Magic Forest: Lesson 1") that earlier sessions wrote.
  const pushedLibraryRef = React.useRef(false);
  useEffect(() => {
    if (pushedLibraryRef.current) return;
    if (!isConnected) return;
    if (!initialSlides || initialSlides.length === 0) return;
    pushedLibraryRef.current = true;
    const mapped = initialSlides.map((s: any, i: number) => ({
      ...s,
      id: String(s?.id ?? i + 1),
      title: String(s?.title || s?.content?.title || `Slide ${i + 1}`),
      imageUrl: s?.imageUrl || s?.image_url || s?.generated_image_url || s?.media_url || s?.content?.imageUrl,
    }));
    setRawSlides(mapped);
    void updateSharedDisplay({
      lessonSlides: mapped,
      lessonTitle: lessonTitle,
      embeddedUrl: null,
    });
  }, [isConnected, initialSlides, lessonTitle, updateSharedDisplay]);

  const teacherUserId = user?.id || sessionStorage.getItem('demo-teacher-id') || 'teacher';
  const [channelStatus, setChannelStatus] = useState<'CONNECTING' | 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT'>('CONNECTING');
  const pageLoadTime = useRef(Date.now());

  // Force Sync: broadcast a full state snapshot to all clients (in-place, no reload).
  const handleForceSync = useCallback(async () => {
    try {
      await forceSync();
      toast({ title: '🔄 Force Sync sent', description: 'Student is now mirroring your screen.' });
    } catch (error: any) {
      console.error('Force sync failed:', error);
      toast({ title: '❌ Force Sync failed', description: error?.message ?? 'Unknown error', variant: 'destructive' });
    }
  }, [forceSync, toast]);

  useEffect(() => {
    if (!roomName || !teacherUserId) return;

    const unsubStage = whiteboardService.subscribeToStageMode(roomName, ({ mode, senderId }) => {
      if (senderId === teacherUserId || !mode) return;
      applyRemoteStageMode(mode);
    });
    const unsubDrawing = whiteboardService.subscribeToDrawingEnabled(roomName, ({ enabled, senderId }) => {
      if (senderId === teacherUserId || typeof enabled !== 'boolean') return;
      applyRemoteDrawingEnabled(enabled);
    });
    const unsubReward = whiteboardService.subscribeToRewards(roomName, (payload) => {
      if (payload.senderId === teacherUserId || payload.rewardType !== 'star') return;
      setStudentStars(payload.starCount ?? 1);
      setIsMilestone(!!payload.isMilestone);
      setShowStarCelebration(true);
    });
    const unsubStatus = whiteboardService.subscribeToStatus(roomName, (status) => {
      if (status === 'SUBSCRIBED' || status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CONNECTING') {
        setChannelStatus(status as 'CONNECTING' | 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT');
      }
    });
    const unsubSlideComplete = whiteboardService.subscribeToSlideCompletion(roomName, (payload) => {
      if (payload.senderId === teacherUserId) return;
      console.log(`[SlideCompletion] ${payload.senderName} completed slide ${payload.slideIndex}`, {
        slideId: payload.slideId,
        accuracy: payload.accuracy,
        timeSpent: payload.timeSpent,
      });
      toast({
        title: `✅ ${payload.senderName} completed activity`,
        description: payload.accuracy != null
          ? `Accuracy: ${payload.accuracy}% • Slide ${payload.slideIndex + 1}`
          : `Slide ${payload.slideIndex + 1} finished`,
        duration: 3000,
      });
    });
    const unsubStudentAction = whiteboardService.subscribeToStudentActions(roomName, (payload) => {
      if (payload.senderId === teacherUserId) return;
      setLiveStudentAnswers((prev) => ({
        ...prev,
        [payload.slideId]: { label: payload.label, ts: payload.timestamp },
      }));
      setLatestStudentAction({ label: payload.label, ts: payload.timestamp });
    });
    return () => {
      unsubStage();
      unsubDrawing();
      unsubReward();
      unsubStatus();
      unsubSlideComplete();
      unsubStudentAction();
    };
  }, [roomName, teacherUserId, applyRemoteStageMode, applyRemoteDrawingEnabled, setCurrentSlideIndex]);




  // Screen share hook
  const {
    isSharing: isScreenSharing,
    stream: screenShareStream,
    startScreenShare,
    stopScreenShare
  } = useScreenShare({
    onStreamStart: () => toast({ title: "Screen Sharing Started", description: "Your screen is now visible to students", className: "bg-indigo-900 border-indigo-700" }),
    onStreamEnd: () => toast({ title: "Screen Sharing Stopped", description: "Screen sharing has ended" }),
    onError: (error) => toast({ title: "Screen Share Error", description: error.message, variant: "destructive" })
  });

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

  // Auto-open wrap-up dialog at urgent phase
  useEffect(() => {
    if (smartTimer.shouldPulseWrapUp && !wrapUpAutoOpenedRef.current && !wrapUpOpen) {
      wrapUpAutoOpenedRef.current = true;
      setWrapUpOpen(true);
    }
  }, [smartTimer.shouldPulseWrapUp, wrapUpOpen]);

  // Zen mode elapsed timer
  useEffect(() => {
    if (!isZenMode) return;
    const interval = setInterval(() => setZenElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isZenMode]);

  const [hasEndedClass, setHasEndedClass] = useState(false);
  const [leftEarly, setLeftEarly] = useState(false);

  const handleEndClass = useCallback(async () => {
    // If the lesson never actually started (teacher is just prepping / leaving
    // before clicking Start Class), this is a plain "leave" — not an early-exit
    // penalty. The mandatory-core timer only applies once the class is live.
    const lessonHasStarted = !!(sessionContext as any)?.classStarted;
    if (lessonHasStarted) {
      // Hub policy: leaving before the mandatory core time marks the session as "left early".
      if (timePolicy.wouldBeLeftEarly) {
        const mm = String(Math.floor(timePolicy.secondsUntilMandatoryEnd / 60)).padStart(2, '0');
        const ss = String(timePolicy.secondsUntilMandatoryEnd % 60).padStart(2, '0');
        const confirmed = window.confirm(
          `You still have ${mm}:${ss} of the mandatory ${timePolicy.mandatoryMinutes}-minute core lesson.\n\n` +
          `Ending now will mark this session as LEFT EARLY for both the teacher and the student.\n\n` +
          `End the class anyway?`,
        );
        if (!confirmed) return;
        setLeftEarly(true);
        toast({
          title: '⚠️ Marked as Left Early',
          description: `Core lesson (${timePolicy.mandatoryMinutes} min) was not completed.`,
          variant: 'destructive',
        });
      } else if (timePolicy.phase === 'bonus') {
        toast({
          title: '✅ Core lesson complete',
          description: `You ended during the optional bonus window (${timePolicy.mandatoryMinutes}–${timePolicy.totalMinutes} min). Counts as a full session.`,
        });
      }
    }
    // Pacing telemetry — log the exact end-minute so ops can see rushers vs
    // teachers who use the optional bonus window. Emits `trial_ended` for
    // first-booking trials and `class_ended` for standard Academy/Success/PG
    // sessions. Best-effort; never blocks the end flow.
    if (lessonHasStarted) {
      try {
        const endedAtMinutes = Math.round(classTime / 60);
        const { data: authData } = await supabase.auth.getUser();
        // Tab-independent handoff: fire the audit-row insert through an edge
        // function with `keepalive: true` so it still lands even if the
        // teacher's tab freezes or is closed the instant they hit End Class.
        // The edge function is idempotent and uses service_role so the refund
        // + rusher-alert triggers reliably fire downstream.
        const payload = JSON.stringify({
          bookingId: classId,
          isTrial,
          endedAtMinutes,
          mandatoryMinutes: timePolicy.mandatoryMinutes,
          totalMinutes: timePolicy.totalMinutes,
          phase: timePolicy.phase,
          leftEarly: timePolicy.wouldBeLeftEarly,
          hubType,
          studentId: studentId ?? null,
          teacherId: authData?.user?.id ?? null,
        });
        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/finalize-class-end`;
        const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        void fetch(url, {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            apikey: anon,
            Authorization: `Bearer ${anon}`,
          },
          body: payload,
        }).catch((e) => console.warn('[TeacherClassroom] finalize-class-end failed', e));
      } catch (e) {
        console.warn('[TeacherClassroom] pacing telemetry failed', e);
      }
    }

    await endSession();
    setHasEndedClass(true);
    // Skip the wrap-up feedback panel when the session was cut short before
    // the mandatory core completed — there's no meaningful session to wrap up,
    // and asking the teacher for feedback on a partial class is noise. The
    // summary page still opens (handled below after media teardown).
    const skipWrapUp = lessonHasStarted && timePolicy.wouldBeLeftEarly;
    if (!skipWrapUp) setWrapUpOpen(true);
    // Tear down media + WebRTC immediately for the teacher.
    try { await rtcDisconnect(); } catch (e) { /* noop */ }
    try { media.leave(); } catch (e) { /* noop */ }
    // If we skipped the wrap-up (left-early), go straight to the summary.
    if (skipWrapUp) {
      navigate(`/classroom/${classId}/summary`, {
        replace: true,
        state: { hub: hubType, isInterview, viewerRole: 'teacher', leftEarly: true },
      });
    }
    // Otherwise the teacher stays on this view with the Wrap-Up panel open;
    // navigation happens when the panel closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, endSession, timePolicy, isTrial, classTime, classId, hubType, studentId, navigate, isInterview]);

  // Listen for End Class requests fired by the floating SafeToLeaveButton
  // overlay so the wrap-up flow runs even when the teacher uses that button.
  useEffect(() => {
    const onRequest = (e: Event) => {
      (e as CustomEvent).preventDefault?.();
      void handleEndClass();
    };
    window.addEventListener('classroom:request-end-class', onRequest as EventListener);
    return () => window.removeEventListener('classroom:request-end-class', onRequest as EventListener);
  }, [handleEndClass]);

  const handleWrapUpChange = useCallback((open: boolean) => {
    setWrapUpOpen(open);
    if (!open && hasEndedClass) {
      // Pass hub via navigation state so the summary page brands correctly
      // even when DB lookups are blocked by RLS for guest/applicant sessions.
      navigate(`/classroom/${classId}/summary`, { replace: true, state: { hub: hubType, isInterview, viewerRole: 'teacher' } });
    }
  }, [hasEndedClass, navigate, classId, hubType]);

  useEffect(() => { media.join(); return () => { media.leave(); }; }, []);

  // WebRTC peer connection
  const { participants, isConnected: rtcConnected, connect: rtcConnect, disconnect: rtcDisconnect } = useWebRTCConnection({
    roomId: webrtcRoom,
    userId: user?.id || sessionStorage.getItem('demo-teacher-id') || '',
    localStream: media.stream,
    enabled: media.isConnected
  });

  // Notify when student joins
  const prevParticipantCount = React.useRef(0);
  useEffect(() => {
    if (participants.length > prevParticipantCount.current && prevParticipantCount.current >= 0) {
      if (prevParticipantCount.current > 0) {
        toast({ title: "👋 Student Joined", description: "A student has joined the classroom", className: "bg-green-900 border-green-700" });
      }
    }
    prevParticipantCount.current = participants.length;
  }, [participants.length]);

  const toggleMute = useCallback(() => { media.toggleMicrophone(); }, [media]);
  const toggleCamera = useCallback(() => { media.toggleCamera(); }, [media]);

  const handleGiveStar = useCallback(async () => {
    const newStarCount = studentStars + 1;
    setStudentStars(newStarCount);
    const milestone = newStarCount % 5 === 0;
    setIsMilestone(milestone);
    setShowStarCelebration(true);
    // Instant broadcast to student via the unified classroom channel
    void whiteboardService.sendReward(roomName, {
      rewardType: 'star',
      starCount: newStarCount,
      isMilestone: milestone,
      senderId: teacherUserId,
    }).catch((e) => console.error('Star broadcast failed:', e));
    await updateSharedDisplay({ starCount: newStarCount, showStarCelebration: true, isMilestone: milestone });
    setTimeout(async () => { await updateSharedDisplay({ showStarCelebration: false }); }, 1000);

    // Persist to student's XP / learning_currency so it survives the session.
    if (studentId && session?.id) {
      const { error } = await supabase.rpc('award_classroom_star', {
        p_student: studentId,
        p_session: session.id,
        p_amount: 1,
      });
      if (error) {
        console.error('award_classroom_star failed:', error);
        // Non-blocking — UI already updated; surface only on dev consoles.
      }
    }
  }, [studentStars, updateSharedDisplay, roomName, teacherUserId, studentId, session?.id]);


  const handleOpenTimer = useCallback(() => { setTimerDialogOpen(true); }, []);
  const handleRollDice = useCallback(() => {
    const result = Math.floor(Math.random() * 6) + 1;
    void whiteboardService.sendToolAction(roomName, {
      tool: 'dice',
      result,
      actionId: `${Date.now()}`,
      senderId: teacherUserId,
    }).catch((e) => console.error('Dice broadcast failed:', e));
  }, [roomName, teacherUserId]);
  const handleSpinWheel = useCallback(() => {
    const raw = window.prompt(
      'Enter wheel options (comma-separated):',
      'Sara,Tom,Mia,Leo,Ana,Max'
    );
    if (!raw) return;
    const options = raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8);
    if (options.length < 2) return;
    const winner = options[Math.floor(Math.random() * options.length)];
    void whiteboardService.sendToolAction(roomName, {
      tool: 'wheel',
      options,
      winner,
      actionId: `${Date.now()}`,
      senderId: teacherUserId,
    }).catch((e) => console.error('Wheel broadcast failed:', e));
  }, [roomName, teacherUserId]);
  const handleStartXO = useCallback(() => {
    void whiteboardService.sendToolAction(roomName, {
      tool: 'xo',
      xoAction: 'start',
      actionId: `${Date.now()}`,
      senderId: teacherUserId,
    }).catch((e) => console.error('XO broadcast failed:', e));
    toast({ title: '❌⭕ Tic-Tac-Toe', description: 'You play X · the student plays O.' });
  }, [roomName, teacherUserId, toast]);
  const handleSendSticker = useCallback((emoji: string = '😊') => {
    void whiteboardService.sendReward(roomName, {
      rewardType: 'sticker',
      sticker: emoji,
      senderId: teacherUserId,
    }).catch((e) => console.error('Sticker broadcast failed:', e));
    toast({ title: `${emoji} Sticker Sent!`, description: "Sticker sent to the student's screen" });
  }, [toast, roomName, teacherUserId]);

  const handleToggleStudentDrawing = useCallback(async () => {
    await setStudentCanDraw(!studentCanDraw);
    toast({
      title: studentCanDraw ? "Drawing Disabled" : "Drawing Enabled",
      description: studentCanDraw ? "Students can no longer draw on the canvas" : "Students can now draw on the shared canvas!",
      className: studentCanDraw ? "" : "bg-green-900 border-green-700",
    });
  }, [studentCanDraw, setStudentCanDraw, toast]);

  const handleShareScreen = useCallback(async () => { await startScreenShare('screen'); await updateSharedDisplay({ isScreenSharing: true }); }, [startScreenShare, updateSharedDisplay]);
  const handleStopScreenShare = useCallback(async () => { stopScreenShare(); await updateSharedDisplay({ isScreenSharing: false }); }, [stopScreenShare, updateSharedDisplay]);
  const handleEmbedLink = useCallback(() => { setEmbedDialogOpen(true); }, []);

  const handleEmbed = useCallback(async (url: string) => {
    await updateSharedDisplay({ embeddedUrl: url });
    await setStageMode('web');
    await updateCanvasTab('web');
    toast({ title: "Content Embedded", description: "External content is now visible to students", className: "bg-teal-900 border-teal-700" });
  }, [toast, updateSharedDisplay, updateCanvasTab, setStageMode]);

  const handleCloseEmbed = useCallback(async () => {
    await updateSharedDisplay({ embeddedUrl: null });
    await setStageMode('slide');
    await updateCanvasTab('slides');
  }, [updateSharedDisplay, updateCanvasTab, setStageMode]);

  // Always include homework slides from the resolved lesson, even when the
  // shared session was previously seeded without them. This keeps the
  // "Bonus / Homework" section visible on the timeline so teachers can hop
  // into it if the student finishes early.
  const displayedSlides = React.useMemo(() => {
    const base = syncedLessonSlides.length > 0 ? syncedLessonSlides : slides;
    const isHw = (s: any) =>
      s?.type === 'homework_task' || s?.slide_type === 'homework_task';
    const hasHw = base.some(isHw);
    if (hasHw) return base;
    const hwFromInitial = (initialSlides ?? []).filter(isHw);
    if (hwFromInitial.length) return [...base, ...hwFromInitial];
    if (!base.length) return base;
    const previewHub = hubType === 'professional' ? 'success' : hubType;
    const pack = buildPreviewHomeworkPack(hubType, syncedLessonTitle || lessonTitle, base);
    const homeworkSlides = (pack.tasks ?? []).map((task, idx) => ({
      id: `homework-${idx + 1}`,
      type: 'homework_task',
      slide_type: 'homework_task',
      title: `Homework ${idx + 1}: ${task.prompt.slice(0, 60)}${task.prompt.length > 60 ? '…' : ''}`,
      hub: previewHub,
      homeworkTask: task,
      homeworkIndex: idx + 1,
      homeworkTotal: pack.tasks.length,
    }));
    return homeworkSlides.length ? [...base, ...homeworkSlides] : base;
  }, [syncedLessonSlides, slides, initialSlides, hubType, syncedLessonTitle, lessonTitle]);
  const activeLessonTitle = syncedLessonTitle || lessonTitle;

  const homeworkTimelineSyncedRef = React.useRef(false);
  useEffect(() => {
    if (homeworkTimelineSyncedRef.current || !isConnected) return;
    const isHw = (s: any) => s?.type === 'homework_task' || s?.slide_type === 'homework_task';
    if (!displayedSlides.some(isHw)) return;
    if (syncedLessonSlides.some(isHw)) {
      homeworkTimelineSyncedRef.current = true;
      return;
    }
    homeworkTimelineSyncedRef.current = true;
    void updateSharedDisplay({
      lessonSlides: displayedSlides as any,
      lessonTitle: activeLessonTitle,
      embeddedUrl: null,
    });
  }, [isConnected, displayedSlides, syncedLessonSlides, updateSharedDisplay, activeLessonTitle]);

  const handlePrevSlide = useCallback(async () => {
    const newIndex = Math.max(0, currentSlide - 1);
    await updateSlide(newIndex);
  }, [currentSlide, updateSlide]);

  const handleNextSlide = useCallback(async () => {
    const newIndex = Math.min(displayedSlides.length - 1, currentSlide + 1);
    await updateSlide(newIndex);
  }, [currentSlide, displayedSlides.length, updateSlide]);

  const handleSlideSelect = useCallback(async (index: number) => {
    await updateSlide(index);
  }, [updateSlide]);

  const handleToolChange = useCallback(async (tool: string) => {
    setActiveTool(tool);
    await updateTool(tool);
  }, [updateTool]);

  const handleClearCanvas = useCallback(async () => {
    await clearCanvas();
    toast({ title: "Canvas Cleared", description: "The whiteboard has been cleared." });
  }, [clearCanvas, toast]);

  const handleCanvasTabChange = useCallback(async (tab: string) => {
    await updateCanvasTab(tab);
  }, [updateCanvasTab]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerValue > 0) {
      interval = setInterval(() => {
        setTimerValue(prev => {
          if (prev <= 1) { setTimerRunning(false); toast({ title: "⏰ Time's Up!", description: "The timer has finished." }); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerValue, toast]);

  const startTimer = () => {
    setTimerValue(timerSeconds);
    setTimerRunning(true);
    void whiteboardService.sendToolAction(roomName, {
      tool: 'timer',
      status: 'start',
      durationSec: timerSeconds,
      actionId: `${Date.now()}`,
      senderId: teacherUserId,
    }).catch((e) => console.error('Timer broadcast failed:', e));
    setTimerDialogOpen(false);
  };
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerValue(timerSeconds);
    void whiteboardService.sendToolAction(roomName, {
      tool: 'timer',
      status: 'reset',
      senderId: teacherUserId,
    }).catch((e) => console.error('Timer reset broadcast failed:', e));
  };

  const hubTheme = getClassroomHubTheme(hubType);
  const hubBg = hubTheme.pageBg;

  const showDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

  const realtimeHealth: ConnectionHealthStatus =
    channelStatus === 'SUBSCRIBED'
      ? 'connected'
      : channelStatus === 'CONNECTING'
      ? 'connecting'
      : 'disconnected';

  const classStarted = !!(sessionContext as any)?.classStarted;
  // Only count *remote* peers — the teacher's own WebRTC `isConnected` must not
  // be mistaken for a student arrival.
  const remotePeerCount = (participants ?? []).filter(
    (p: any) => p?.id && p.id !== teacherUserId,
  ).length;
  const studentPresent = remotePeerCount > 0;

  // Late status: scheduled time has passed and student still hasn't joined
  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    if (classStarted || studentPresent) return;
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [classStarted, studentPresent]);
  const scheduledMs = scheduledAt ? new Date(scheduledAt).getTime() : null;
  const studentLate = !!scheduledMs && !studentPresent && nowTs >= scheduledMs;

  // Ring a bell + notify the teacher the moment the student joins
  const studentJoinedFiredRef = useRef(false);
  useEffect(() => {
    if (!studentPresent || classStarted || studentJoinedFiredRef.current) return;
    studentJoinedFiredRef.current = true;
    try {
      const AC: typeof AudioContext | undefined =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        [[0, 880], [0.35, 1175], [0.7, 880]].forEach(([when, freq]) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq as number, ctx.currentTime + (when as number));
          g.gain.setValueAtTime(0.0001, ctx.currentTime + (when as number));
          g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + (when as number) + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (when as number) + 0.6);
          o.connect(g).connect(ctx.destination);
          o.start(ctx.currentTime + (when as number));
          o.stop(ctx.currentTime + (when as number) + 0.65);
        });
      }
    } catch { /* ignore */ }
    toast({ title: '🔔 Student has joined', description: `${studentName} is in the classroom. You can start the lesson.` });
    // If teacher is already prepping inside the classroom, surface the top-right "Start lesson" nudge.
    setShowStartNudge(true);
  }, [studentPresent, classStarted, toast, studentName]);

  const handleStartClass = useCallback(async () => {
    if (!studentPresent) {
      toast({ title: 'Waiting for student', description: 'You can start the lesson once the student joins.', variant: 'destructive' });
      return;
    }
    await updateSessionContext({ ...(sessionContext || {}), classStarted: true, startedAt: new Date().toISOString() });
    toast({ title: '🎬 Class started', description: 'Your student can now see the lesson.' });
  }, [studentPresent, sessionContext, updateSessionContext, toast]);

  return (
    <div className={`h-dvh w-full ${hubBg} text-gray-900 flex flex-col overflow-hidden relative`}>
      {!classStarted && !prepMode && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none">
          <div className="pointer-events-auto text-center max-w-sm w-[90%] px-6 py-6 bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl">{studentPresent ? '🎬' : studentLate ? '⌛' : '👋'}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {studentPresent ? 'Ready when you are' : studentLate ? 'Student is late' : 'Waiting for your student…'}
            </h2>
            <p className="text-xs text-gray-600 mb-3">
              {studentPresent
                ? <>Click <strong>Start Class</strong> when you're ready.</>
                : studentLate
                ? <>Scheduled time passed. <strong>{studentName}</strong> hasn't joined yet.</>
                : <>We'll ring a bell when <strong>{studentName}</strong> joins.</>}
            </p>
            <div className="mb-4 flex flex-col items-center gap-2">
              <CountdownToStart scheduledAt={scheduledAt ?? null} accent={hubTheme.accentHex ?? '#F59E0B'} ring={false} />
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: studentPresent ? '#DCFCE7' : studentLate ? '#FEE2E2' : '#F3F4F6',
                  color: studentPresent ? '#15803D' : studentLate ? '#B91C1C' : '#4B5563',
                }}
              >
                <span className={`w-2 h-2 rounded-full ${studentPresent ? 'bg-green-500' : studentLate ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                {studentPresent ? 'Student joined' : studentLate ? 'Student is late' : 'Not joined yet'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                onClick={handleStartClass}
                disabled={!studentPresent}
                className="px-6 py-5 text-sm font-bold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full"
                style={studentPresent ? { background: hubTheme.hexGradient, color: '#fff' } : { background: '#E5E7EB', color: '#6B7280' }}
              >
                ▶  Start Class
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setPrepMode(true)}
                className="px-6 py-3 text-sm font-semibold rounded-full w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                📝  Prepare for class
              </Button>
              <p className="text-[11px] text-gray-500 mt-1">
                Set up materials inside the classroom. We'll ping you when the student arrives.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top-right nudge shown when teacher is prepping and student has joined (or any time pre-start while prepping) */}
      {!classStarted && prepMode && (studentPresent || showStartNudge) && (
        <div className="absolute top-4 right-4 z-[120] pointer-events-auto animate-in slide-in-from-right-2 fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 px-4 py-3 w-[300px]">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl leading-none">🔔</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">
                  {studentPresent ? 'Your student is here!' : 'Waiting for student…'}
                </div>
                <div className="text-[11px] text-gray-600">
                  {studentPresent ? 'The lesson can start now.' : `We'll alert you the moment ${studentName} joins.`}
                </div>
              </div>
              <button
                onClick={() => setShowStartNudge(false)}
                className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <Button
              size="sm"
              onClick={handleStartClass}
              disabled={!studentPresent}
              className="w-full rounded-full text-sm font-bold disabled:opacity-50"
              style={studentPresent ? { background: hubTheme.hexGradient, color: '#fff' } : { background: '#E5E7EB', color: '#6B7280' }}
            >
              ▶  Start lesson
            </Button>
          </div>
        </div>
      )}


      {/* Teacher-only: live diagnostics for realtime + WebRTC */}
      <ConnectionDebugPanel
        realtimeStatus={realtimeHealth}
        signalingReady={channelStatus === 'SUBSCRIBED'}
        peerConnected={rtcConnected}
        roomId={roomName}
        hubType={hubType}
      />


      {/* Debug Room ID Label */}
      {showDebug && (
        <div className="fixed bottom-2 left-2 z-[100] bg-black/50 text-white text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm">
          Room: {roomName} | WebRTC: {webrtcRoom}
        </div>
      )}
      {/* Star Celebration Overlay */}
      <StarCelebration
        isVisible={showStarCelebration}
        starCount={studentStars}
        studentName={studentName}
        isMilestone={isMilestone}
        onComplete={() => setShowStarCelebration(false)}
      />

      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {isZenMode && (
          <>
            <ZenModeOverlay
              elapsed={zenElapsed}
              isMuted={media.isMuted}
              isCameraOff={media.isCameraOff}
              onToggleMute={toggleMute}
              onToggleCamera={toggleCamera}
              onExitZen={() => setIsZenMode(false)}
            />
            <PictureInPicture
              name={studentName || 'Student'}
              isConnected={rtcConnected}
              stream={participants[0]?.stream || null}
            />
          </>
        )}
      </AnimatePresence>

      {/* Top Control Bar (hidden in Zen) */}
      {!isZenMode && (
        <div style={topBarIdle.style} onMouseMove={topBarIdle.onMouseMove} onMouseEnter={topBarIdle.onMouseEnter}>
          <ClassroomTopBar
            lessonTitle={activeLessonTitle}
            roomName={roomName}
            participantCount={participantCount}
            isMuted={media.isMuted}
            isCameraOff={media.isCameraOff}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onEndClass={handleEndClass}
            onOpenWrapUp={() => setWrapUpOpen(true)}
            studentStars={studentStars}
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode(!isZenMode)}
            shouldPulseWrapUp={smartTimer.shouldPulseWrapUp}
            elapsedSeconds={classTime}
            sessionDuration={sessionDuration}
            lessonPhase={timePolicy.phase}
            lessonPhaseLabel={timePolicy.phaseLabel}
            bonusSecondsRemaining={timePolicy.bonusSecondsRemaining}
            wouldBeLeftEarly={timePolicy.wouldBeLeftEarly}
            secondsUntilMandatoryEnd={timePolicy.secondsUntilMandatoryEnd}
            totalMinutes={timePolicy.totalMinutes as 30 | 60}
            hubType={hubType}
            rtcConnected={rtcConnected}
            localStream={media.stream}
            onSwitchCamera={media.switchCamera}
            onSwitchMicrophone={media.switchMicrophone}
            onToggleSlideNav={() => setSlideNavOpen(v => !v)}
            slideNavOpen={slideNavOpen}
            onForceSync={handleForceSync}
            realtimeConnected={channelStatus === 'SUBSCRIBED'}
            classStarted={classStarted}
            onStartClass={!classStarted ? handleStartClass : undefined}
            canStartClass={studentPresent}
            onReconnect={async () => {
              await rtcDisconnect();
              await rtcConnect();
              toast({ title: "🔄 Reconnecting...", description: "Attempting to reconnect video" });
            }}
          />
        </div>
      )}

      {/* Master Library lesson switcher — teacher-only mid-lesson swap */}
      {!isZenMode && classId && (
        <div className="absolute top-14 left-4 z-40">
          <LessonSwitcher
            bookingId={classId}
            studentId={studentId}
            hubType={hubType}
            currentLessonId={lessonId ?? null}
            currentLessonTitle={activeLessonTitle}
            classStarted={classStarted}
          />
        </div>
      )}



      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Communication Zone */}
        {!isZenMode && (
          <div style={sidebarIdle.style} onMouseMove={sidebarIdle.onMouseMove} onMouseEnter={sidebarIdle.onMouseEnter}>
          <CommunicationZone
              hubType={hubType}
              roomId={roomName}
              userId={user?.id || sessionStorage.getItem('demo-teacher-id') || ''}
              studentName={studentName}
              teacherName={teacherName}
              onGiveStar={handleGiveStar}
              onOpenTimer={handleOpenTimer}
              onRollDice={handleRollDice}
              onSendSticker={handleSendSticker}
              studentCanDraw={studentCanDraw}
              onToggleStudentDrawing={handleToggleStudentDrawing}
              onShareScreen={handleShareScreen}
              onEmbedLink={handleEmbedLink}
              isScreenSharing={isScreenSharing}
              onStopScreenShare={handleStopScreenShare}
              screenShareStream={screenShareStream}
              localStream={media.stream}
              remoteStream={participants[0]?.stream || null}
              isVideoConnected={media.isConnected}
              isLocalCameraOff={media.isCameraOff}
              isLocalMicMuted={media.isMuted}
              onToggleLocalMic={toggleMute}
              onToggleLocalCamera={toggleCamera}
              isRemoteConnected={rtcConnected}
              studentMicMuted={!!(sessionContext as any)?.studentMicMuted}
              studentCameraOff={!!(sessionContext as any)?.studentCameraOff}
              onToggleStudentMic={async () => {
                const next = !((sessionContext as any)?.studentMicMuted);
                await updateSessionContext({ ...(sessionContext || {}), studentMicMuted: next });
                toast({ title: next ? "🔇 Student muted" : "🔊 Student unmuted", description: next ? "The student's microphone has been muted" : "The student can speak again" });
              }}
              onToggleStudentCamera={async () => {
                const next = !((sessionContext as any)?.studentCameraOff);
                await updateSessionContext({ ...(sessionContext || {}), studentCameraOff: next });
                toast({ title: next ? "📷 Student camera off" : "📹 Student camera on", description: next ? "The student's camera has been turned off" : "The student's camera is back on" });
              }}
            />
          </div>
        )}

        {/* Center: Unified Main Stage */}
        <div className="flex-1 relative min-h-0 overflow-hidden">
          {/* Floating Pen Tool Rail — left side of learning content */}
          {classStarted && penRailOpen && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 pointer-events-auto animate-in slide-in-from-left-2 fade-in duration-150">
              <button
                onClick={async () => {
                  if (drawingEnabled) await setDrawingEnabled(false);
                  await setStudentCanDraw(false);
                  setPenRailOpen(false);
                }}
                title="Hide pen tools"
                aria-label="Hide pen tools"
                className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="h-px w-8 bg-gray-100" />
              {([
                { id: 'pointer', Icon: MousePointer2, label: 'Pointer' },
                { id: 'pen', Icon: Pencil, label: 'Pen' },
                { id: 'highlighter', Icon: Highlighter, label: 'Highlighter' },
                { id: 'text', Icon: Type, label: 'Text' },
                { id: 'line', Icon: Minus, label: 'Line' },
                { id: 'arrow', Icon: ArrowUpRight, label: 'Arrow' },
                { id: 'rect', Icon: Square, label: 'Rectangle' },
                { id: 'circle', Icon: CircleIcon, label: 'Circle' },
                { id: 'eraser', Icon: Eraser, label: 'Eraser' },
              ] as const).map((t) => {
                const active = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={async () => {
                      if (t.id === 'pointer') {
                        if (drawingEnabled) await setDrawingEnabled(false);
                        await setStudentCanDraw(false);
                      } else if (!drawingEnabled) {
                        await setDrawingEnabled(true);
                        await setStudentCanDraw(true);
                      }
                      await handleToolChange(t.id);
                    }}
                    title={t.label}
                    aria-label={t.label}
                    className={`h-9 w-9 rounded-xl transition flex items-center justify-center ${
                      active ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={active ? { background: hubTheme.hexGradient } : undefined}
                  >
                    <t.Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  </button>
                );
              })}
              <div className="h-px w-8 bg-gray-100" />
              <label
                className="relative h-9 w-9 rounded-xl cursor-pointer flex items-center justify-center hover:bg-gray-100"
                title="Pen color"
              >
                <span
                  className="h-5 w-5 rounded-full ring-2 ring-white shadow"
                  style={{ background: activeColor }}
                />
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => setActiveColor(e.target.value)}
                  aria-label="Pen color"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <button
                onClick={handleClearCanvas}
                title="Clear canvas"
                aria-label="Clear canvas"
                className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 flex items-center justify-center"
              >
                <Trash2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </button>
            </div>
          )}

          {/* Pen tools launcher moved into the bottom TeacherControlDock */}



          {/* Give-Star moved to the bottom toolbar (TeacherControlDock) — hub-branded. */}




          {/* Live Student Action Indicator — bi-directional sync feedback */}
          {(() => {
            const slideKey = String(displayedSlides[currentSlide]?.id ?? currentSlide);
            const live = liveStudentAnswers[slideKey];
            if (!live) return null;
            return (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="flex items-center gap-2 rounded-full bg-primary/95 text-primary-foreground px-4 py-1.5 shadow-lg ring-1 ring-primary/40 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-semibold">{studentName}:</span>
                  <span className="text-xs">{live.label}</span>
                </div>
              </div>
            );
          })()}
          <MainStage
            mode={stageMode}
            slides={displayedSlides}
            currentSlideIndex={currentSlide}
            embeddedUrl={embeddedUrl}
            drawingEnabled={drawingEnabled}
            activeTool={(['pen','eraser','highlighter','pointer','text','rect','circle','arrow','line'].includes(activeTool) ? activeTool : 'pen') as any}
            activeColor={activeColor}
            strokes={strokes}
            roomId={roomName}
            userId={user?.id || sessionStorage.getItem('demo-teacher-id') || ''}
            userName={teacherName}
            role="teacher"
            iframeUnlocked={iframeUnlocked}
            rawSlides={displayedSlides}
            hubType={hubType}
            customStage={customStage}
            onAddStroke={addStroke}
          />
          <TeacherControlDock
            mode={stageMode}
            onModeChange={async (m) => {
              await setStageMode(m);
              if (m === 'web') {
                await updateCanvasTab('web');
              } else if (m === 'slide') {
                await updateCanvasTab('slides');
              } else {
                await updateCanvasTab('whiteboard');
              }
            }}
            embeddedUrl={embeddedUrl}
            onEmbedUrl={async (url) => {
              await updateSharedDisplay({ embeddedUrl: url });
              await setStageMode('web');
              await updateCanvasTab('web');
            }}
            drawingEnabled={drawingEnabled}
            onToggleDrawing={async (enabled) => {
              await setDrawingEnabled(enabled);
              await setStudentCanDraw(enabled); // keep legacy flag in sync
            }}
            activeTool={(activeTool === 'pen' || activeTool === 'eraser' || activeTool === 'highlighter' || activeTool === 'pointer') ? activeTool : 'pen'}
            onToolChange={(t) => handleToolChange(t)}
            activeColor={activeColor}
            onColorChange={setActiveColor}
            currentSlideIndex={currentSlide}
            totalSlides={displayedSlides.length}
            onPrevSlide={handlePrevSlide}
            onNextSlide={handleNextSlide}
            onClearCanvas={handleClearCanvas}
            iframeUnlocked={iframeUnlocked}
            onToggleIframeUnlock={setIframeUnlocked}
            onGiveStar={handleGiveStar}
            starCount={studentStars}

            onOpenTimer={handleOpenTimer}
            onRollDice={handleRollDice}
            onSpinWheel={handleSpinWheel}
            onStartXO={handleStartXO}
            onSendSticker={handleSendSticker}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            onTogglePenTools={() => setPenRailOpen((v) => !v)}
            penToolsOpen={penRailOpen}
            hubType={hubType}
          />
        </div>

        {/* Right: Slide Navigator — toggled via header button */}
        {!isZenMode && slideNavOpen && (
          <SlideNavigator
            hubType={hubType}
            slides={displayedSlides as any}
            currentSlideIndex={currentSlide}
            onSlideSelect={handleSlideSelect}
            lessonTitle={activeLessonTitle}
            isCollapsed={false}
            onToggleCollapse={() => setSlideNavOpen(false)}
          />
        )}
      </div>

      {/* Teacher Instructions Sidebar (hidden in Zen) */}
      {!isZenMode && (
        <TeacherInstructionsSidebar
          lessonTitle={lessonTitle}
          isOpen={instructionsSidebarOpen}
          onToggle={() => setInstructionsSidebarOpen(!instructionsSidebarOpen)}
        />
      )}


      {/* Engagement: see student reactions + send 👏 */}
      {!isZenMode && (
        <LiveReactionBar
          roomId={classId}
          userId={user?.id || ''}
          hubType={hubType}
          canSend
        />
      )}

      {/* Lesson Wrap-Up Dialog */}
      <LessonWrapUpDialog
        open={wrapUpOpen}
        onOpenChange={handleWrapUpChange}
        lessonId={lessonId}
        studentId={studentId}
        teacherId={user?.id}
        sharedNotes={sharedNotes}
        hubType={hubType}
      />

      {/* Dice Roller Dialog */}
      <DiceRoller open={diceDialogOpen} onOpenChange={setDiceDialogOpen} roomId={roomName} senderId={teacherUserId} hubType={hubType} />

      {/* Embed Link Dialog */}
      <EmbedLinkDialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen} onEmbed={handleEmbed} />

      {/* Timer Dialog */}
      <Dialog open={timerDialogOpen} onOpenChange={setTimerDialogOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">Activity Timer</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4 gap-4">
            <div className="text-6xl font-mono font-bold text-blue-600">
              {Math.floor(timerValue / 60).toString().padStart(2, '0')}:
              {(timerValue % 60).toString().padStart(2, '0')}
            </div>
            {!timerRunning && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Set time (seconds):</span>
                <Input
                  type="number"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Math.max(1, parseInt(e.target.value) || 60))}
                  className="w-20 bg-gray-50 border-gray-200 text-center"
                  min={1}
                />
              </div>
            )}
            <div className="flex gap-2">
              {!timerRunning ? (
                <Button onClick={startTimer} className={hubTheme.buttonPrimary}>Start Timer</Button>
              ) : (
                <>
                  <Button onClick={() => setTimerRunning(false)} variant="outline" className="border-gray-200">Pause</Button>
                  <Button onClick={resetTimer} variant="destructive">Reset</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Library Drawer for live lesson injection */}
      <LibraryDrawer
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        slideFormat="raw"
        hubFilter={hubType}
        onSelectLesson={async (selectedSlides, title, sceneMeta) => {
          setIsLibraryOpen(false);

          if (sceneMeta) {
            // Scene-based (e.g. Little Explorers Phonics) lesson — its real
            // content lives in code, not content.slides. Stamp the same
            // sceneLessonRef shape classroomLessonResolver.ts produces so
            // MainStage renders it via the embedded scene player instead of
            // treating it as a normal (and here, empty/stale) slide deck.
            const sceneSlides = [{
              id: `scene-lesson-${sceneMeta.unitNumber}-${sceneMeta.lessonNumber}`,
              type: 'playground_scene',
              sceneLessonRef: { unitNumber: sceneMeta.unitNumber, lessonNumber: sceneMeta.lessonNumber },
            }];
            setRawSlides(sceneSlides);
            await updateSharedDisplay({ lessonSlides: sceneSlides, lessonTitle: title, embeddedUrl: null });
            await updateSlide(0);
            await setStageMode('slide');
            await updateCanvasTab('slides');
            toast({
              title: "📚 Lesson Loaded!",
              description: `"${title}" is now on screen.`,
              className: "bg-indigo-900 border-indigo-700",
            });
            return;
          }

          const mapped = selectedSlides.map((s: any, i: number) => ({
            ...s,
            id: String(s?.id ?? i + 1),
            title: String(s?.title || `Slide ${i + 1}`),
            imageUrl: s?.imageUrl || s?.image_url || s?.generated_image_url || undefined,
          }));
          // Auto-prepend a branded front page (Engleuphoria logo + hub badge + level + unit/lesson title)
          // unless the lesson already ships one.
          const first: any = mapped[0];
          const meta: any = (selectedSlides as any)?.[0] || {};
          const hasFront = first && (
            first.slide_type === 'front_page' ||
            first.slide_type === 'title_page' ||
            first.type === 'front_page'
          );
          const liveSlides = hasFront ? mapped : [
            {
              id: 'front-page',
              slide_type: 'front_page',
              type: 'front_page',
              title,
              topic: meta?.topic,
              subtitle: meta?.subtitle,
              level: meta?.level || meta?.cefr_level || meta?.difficulty_level,
              hub: hubType,
              unitNumber: meta?.unit_number ?? meta?.unitNumber,
              unitTitle: meta?.unit_title ?? meta?.unitTitle,
              coverImageUrl: first?.imageUrl,
            },
            ...mapped,
          ];
          setRawSlides(liveSlides);
          await updateSharedDisplay({ lessonSlides: liveSlides, lessonTitle: title, embeddedUrl: null });
          await updateSlide(0);
          await setStageMode('slide');
          await updateCanvasTab('slides');
          toast({
            title: "📚 Lesson Loaded!",
            description: `"${title}" is now on screen.`,
            className: "bg-indigo-900 border-indigo-700",
          });
        }}
      />
    </div>
  );
};
