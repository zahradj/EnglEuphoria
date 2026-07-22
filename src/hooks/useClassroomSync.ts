import { useState, useEffect, useCallback, useRef } from 'react';
import { classroomSyncService, ClassroomSession } from '@/services/classroomSyncService';
import { whiteboardService, WhiteboardStroke, StageMode } from '@/services/whiteboardService';

interface UseClassroomSyncOptions {
  roomId: string;
  userId: string;
  userName: string;
  role: 'teacher' | 'student';
  lessonData?: {
    title: string;
    slides: Array<Record<string, any> & { id: string; title: string; imageUrl?: string; content?: any }>;
  };
}

type SyncedLessonSlide = Record<string, any> & {
  id: string;
  title: string;
  imageUrl?: string;
  content?: any;
  type?: string;
  quizQuestion?: string;
  quizOptions?: Array<{ id: string; text: string; isCorrect: boolean }>;
  pollQuestion?: string;
  pollOptions?: Array<{ id: string; text: string }>;
};

interface UseClassroomSyncReturn {
  // Session state
  session: ClassroomSession | null;
  currentSlide: number;
  setCurrentSlideIndex: (index: number) => void;
  activeTool: string;
  studentCanDraw: boolean;
  lessonSlides: SyncedLessonSlide[];
  lessonTitle: string;
  isConnected: boolean;
  
  // Quiz state
  quizActive: boolean;
  quizLocked: boolean;
  quizRevealAnswer: boolean;
  currentQuizSlideId: string | null;
  
  // Poll state
  pollActive: boolean;
  pollShowResults: boolean;
  currentPollSlideId: string | null;
  
  // Shared display state for students
  embeddedUrl: string | null;
  isScreenSharing: boolean;
  starCount: number;
  showStarCelebration: boolean;
  isMilestone: boolean;
  timerValue: number | null;
  timerRunning: boolean;
  diceValue: number | null;
  // Phase 7: Shared notes & context
  sharedNotes: string;
  sessionContext: Record<string, any>;
  // Phase 8: Canvas tab sync
  activeCanvasTab: string;
  // Unified Main Stage sync
  stageMode: StageMode;
  drawingEnabled: boolean;
  // Whiteboard state
  strokes: WhiteboardStroke[];
  // Session lifecycle
  sessionStatus: string;
  sessionEnded: boolean;
  
  // Teacher actions
  updateSlide: (index: number) => Promise<void>;
  updateTool: (tool: string) => Promise<void>;
  setStudentCanDraw: (canDraw: boolean) => Promise<void>;
  endSession: () => Promise<void>;
  
  // Whiteboard actions
  addStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => Promise<void>;
  clearCanvas: () => Promise<void>;
  
  // Shared display update (teacher only)
  updateSharedDisplay: (updates: {
    lessonSlides?: SyncedLessonSlide[];
    lessonTitle?: string;
    embeddedUrl?: string | null;
    isScreenSharing?: boolean;
    starCount?: number;
    showStarCelebration?: boolean;
    isMilestone?: boolean;
    timerValue?: number | null;
    timerRunning?: boolean;
    diceValue?: number | null;
  }) => Promise<void>;

  // Phase 7: Shared notes & context actions
  updateSharedNotes: (notes: string) => Promise<void>;
  updateSessionContext: (context: Record<string, any>) => Promise<void>;
  // Phase 8: Canvas tab
  updateCanvasTab: (tab: string) => Promise<void>;
  // Unified Main Stage actions (teacher)
  setStageMode: (mode: StageMode) => Promise<void>;
  setDrawingEnabled: (enabled: boolean) => Promise<void>;
  applyRemoteStageMode: (mode: StageMode) => void;
  applyRemoteDrawingEnabled: (enabled: boolean) => void;
  iframeUnlocked: boolean;
  setIframeUnlocked: (unlocked: boolean) => Promise<void>;
  applyRemoteIframeUnlocked: (unlocked: boolean) => void;
  /** Teacher-only: broadcast a full state snapshot to all clients (no reload). */
  forceSync: () => Promise<void>;
}

const deriveStageModeFromSession = (session: ClassroomSession, fallback: StageMode): StageMode => {
  if (session.activeCanvasTab === 'web') return 'web';
  if (session.activeCanvasTab === 'slides') return 'slide';
  if (session.activeCanvasTab === 'whiteboard') return 'blank';
  return session.embeddedUrl ? 'web' : fallback;
};

export const useClassroomSync = ({
  roomId,
  userId,
  userName,
  role,
  lessonData
}: UseClassroomSyncOptions): UseClassroomSyncReturn => {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stageMode, setStageModeState] = useState<StageMode>('slide');
  const [drawingEnabled, setDrawingEnabledState] = useState<boolean>(false);
  const [iframeUnlocked, setIframeUnlockedState] = useState<boolean>(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const strokeCleanupRef = useRef<(() => void) | null>(null);

  // Keep latest lessonData in a ref so it can be used at init time without
  // forcing the init effect to re-run on every parent render. Re-initializing
  // would call createOrUpdateSession again, resetting fields like current_slide_index
  // back to 0 and racing with in-flight teacher updates (e.g. embedded_url).
  const lessonDataRef = useRef(lessonData);
  useEffect(() => { lessonDataRef.current = lessonData; }, [lessonData]);
  const initializedRef = useRef(false);

  // Initialize session — runs once per (roomId, role)
  useEffect(() => {
    if (!roomId) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initSession = async () => {
      if (role === 'teacher' && lessonDataRef.current) {
        const newSession = await classroomSyncService.createOrUpdateSession(
          roomId,
          userId,
          lessonDataRef.current
        );
        if (newSession) {
          setSession(newSession);
          setCurrentSlideIndex(newSession.currentSlideIndex ?? 0);
          setStageModeState(prev => deriveStageModeFromSession(newSession, prev));
          setIsConnected(true);
        }
      } else {
        const existingSession = await classroomSyncService.getActiveSession(roomId);
        if (existingSession) {
          setSession(existingSession);
          setCurrentSlideIndex(existingSession.currentSlideIndex ?? 0);
          setStageModeState(prev => deriveStageModeFromSession(existingSession, prev));
          setIsConnected(true);
        }
      }
    };

    initSession();
  }, [roomId, userId, role]);

  // Subscribe to session updates
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = classroomSyncService.subscribeToSession(
      roomId,
      (updatedSession) => {
        setSession(updatedSession);
        setCurrentSlideIndex(updatedSession.currentSlideIndex ?? 0);
        setStageModeState(prev => deriveStageModeFromSession(updatedSession, prev));
      }
    );

    cleanupRef.current = unsubscribe;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [roomId]);

  // Subscribe to whiteboard strokes
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = whiteboardService.subscribeToStrokes(
      roomId,
      (stroke) => {
        if (stroke.id === 'clear') {
          setStrokes([]);
        } else {
          setStrokes(prev => [...prev, stroke]);
        }
      }
    );

    strokeCleanupRef.current = unsubscribe;

    return () => {
      if (strokeCleanupRef.current) {
        strokeCleanupRef.current();
      }
    };
  }, [roomId]);

  // Subscribe to instant slide_change broadcasts (Leader/Follower navigation).
  useEffect(() => {
    if (!roomId) return;
    const unsub = whiteboardService.subscribeToSlideChange(roomId, ({ slideIndex, senderId }) => {
      if (senderId === userId) return; // ignore our own broadcast
      setCurrentSlideIndex(slideIndex);
      setSession(prev => prev ? { ...prev, currentSlideIndex: slideIndex } : prev);
    });
    return unsub;
  }, [roomId, userId]);

  // Subscribe to teacher's "Force Sync" snapshot — applied in-place, no reload.
  useEffect(() => {
    if (!roomId) return;
    const unsub = whiteboardService.subscribeToForceSync(roomId, (snap) => {
      if (snap.senderId === userId) return;
      setCurrentSlideIndex(snap.slideIndex);
      if (snap.stageMode) setStageModeState(snap.stageMode);
      if (typeof snap.drawingEnabled === 'boolean') setDrawingEnabledState(snap.drawingEnabled);
      if (typeof snap.iframeUnlocked === 'boolean') setIframeUnlockedState(snap.iframeUnlocked);
      setSession(prev => prev ? {
        ...prev,
        currentSlideIndex: snap.slideIndex,
        embeddedUrl: snap.embeddedUrl !== undefined ? snap.embeddedUrl : prev.embeddedUrl,
        activeCanvasTab: snap.activeCanvasTab ?? prev.activeCanvasTab,
      } : prev);
    });
    return unsub;
  }, [roomId, userId]);

  const applyRemoteStageMode = useCallback((mode: StageMode) => {
    setStageModeState(mode);
  }, []);

  const applyRemoteDrawingEnabled = useCallback((enabled: boolean) => {
    setDrawingEnabledState(enabled);
  }, []);

  // Teacher: broadcast stage mode and drawing toggle
  const setStageMode = useCallback(async (mode: StageMode) => {
    setStageModeState(mode);
    // Defensive: leaving 'web' mode auto-locks the iframe again.
    if (mode !== 'web') {
      setIframeUnlockedState(false);
      if (role === 'teacher') {
        try { await whiteboardService.sendIframeLockState(roomId, false, userId); }
        catch (error) { console.error('Failed to reset iframe lock:', error); }
      }
    }
    if (role !== 'teacher') return;
    try { await whiteboardService.sendStageMode(roomId, mode, userId); }
    catch (error) { console.error('Failed to send stage mode:', error); }
  }, [roomId, role, userId]);

  const setDrawingEnabled = useCallback(async (enabled: boolean) => {
    setDrawingEnabledState(enabled);
    if (role !== 'teacher') return;
    try { await whiteboardService.sendDrawingEnabled(roomId, enabled, userId); }
    catch (error) { console.error('Failed to send drawing enabled:', error); }
  }, [roomId, role, userId]);

  const applyRemoteIframeUnlocked = useCallback((unlocked: boolean) => {
    setIframeUnlockedState(unlocked);
  }, []);

  const setIframeUnlocked = useCallback(async (unlocked: boolean) => {
    setIframeUnlockedState(unlocked);
    if (role !== 'teacher') return;
    try { await whiteboardService.sendIframeLockState(roomId, unlocked, userId); }
    catch (error) { console.error('Failed to send iframe lock state:', error); }
  }, [roomId, role, userId]);

  // Teacher actions
  const updateSlide = useCallback(async (index: number) => {
    if (role !== 'teacher') return;
    setCurrentSlideIndex(index);
    // 1) Instant broadcast (Leader/Follower) — student updates within ~150ms.
    try { await whiteboardService.sendSlideChange(roomId, index, userId); }
    catch (error) { console.error('Failed to broadcast slide_change:', error); }
    // 2) Persist to DB so late joiners hydrate from the row.
    try {
      await classroomSyncService.updateSession(roomId, { currentSlideIndex: index });
      setSession(prev => prev ? { ...prev, currentSlideIndex: index } : null);
    } catch (error) {
      console.error('Failed to update slide:', error);
    }
  }, [roomId, role, userId]);

  const updateTool = useCallback(async (tool: string) => {
    if (role !== 'teacher') return;
    try {
      await classroomSyncService.updateSession(roomId, { activeTool: tool });
      setSession(prev => prev ? { ...prev, activeTool: tool } : null);
    } catch (error) {
      console.error('Failed to update tool:', error);
    }
  }, [roomId, role]);

  const setStudentCanDraw = useCallback(async (canDraw: boolean) => {
    if (role !== 'teacher') return;
    try {
      await classroomSyncService.updateSession(roomId, { studentCanDraw: canDraw });
      setSession(prev => prev ? { ...prev, studentCanDraw: canDraw } : null);
    } catch (error) {
      console.error('Failed to update drawing permission:', error);
    }
  }, [roomId, role]);

  const endSession = useCallback(async () => {
    if (role !== 'teacher') return;
    try {
      await classroomSyncService.endSession(roomId);
      setSession(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [roomId, role]);

  // Whiteboard actions
  const addStroke = useCallback(async (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => {
    // Check if user can draw
    const canDraw = role === 'teacher' || (session?.studentCanDraw ?? false);
    if (!canDraw) {
      console.warn('Drawing not permitted');
      return;
    }

    try {
      await whiteboardService.saveStroke(roomId, {
        ...stroke,
        roomId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to add stroke:', error);
    }
  }, [roomId, role, session?.studentCanDraw]);

  const clearCanvas = useCallback(async () => {
    try {
      await whiteboardService.clearWhiteboard(roomId);
      setStrokes([]);
    } catch (error) {
      console.error('Failed to clear canvas:', error);
    }
  }, [roomId]);

  const updateSharedDisplay = useCallback(async (updates: {
    lessonSlides?: SyncedLessonSlide[];
    lessonTitle?: string;
    embeddedUrl?: string | null;
    isScreenSharing?: boolean;
    starCount?: number;
    showStarCelebration?: boolean;
    isMilestone?: boolean;
    timerValue?: number | null;
    timerRunning?: boolean;
    diceValue?: number | null;
  }) => {
    if (role !== 'teacher') return;
    try {
      await classroomSyncService.updateSession(roomId, updates);
      setSession(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Failed to update shared display:', error);
    }
  }, [roomId, role]);

  const updateSharedNotes = useCallback(async (notes: string) => {
    try {
      await classroomSyncService.updateSession(roomId, { sharedNotes: notes });
      setSession(prev => prev ? { ...prev, sharedNotes: notes } : null);
    } catch (error) {
      console.error('Failed to update shared notes:', error);
    }
  }, [roomId]);

  const updateSessionContext = useCallback(async (context: Record<string, any>) => {
    try {
      await classroomSyncService.updateSession(roomId, { sessionContext: context });
      setSession(prev => prev ? { ...prev, sessionContext: context } : null);
    } catch (error) {
      console.error('Failed to update session context:', error);
    }
  }, [roomId]);

  const updateCanvasTab = useCallback(async (tab: string) => {
    if (role !== 'teacher') return;
    try {
      await classroomSyncService.updateSession(roomId, { activeCanvasTab: tab });
      setSession(prev => prev ? { ...prev, activeCanvasTab: tab } : null);
    } catch (error) {
      console.error('Failed to update canvas tab:', error);
    }
  }, [roomId, role]);

  // Teacher: push a full state snapshot to all clients (no page reload).
  const forceSync = useCallback(async () => {
    if (role !== 'teacher') return;
    try {
      await whiteboardService.sendForceSync(roomId, {
        slideIndex: currentSlideIndex,
        stageMode,
        drawingEnabled,
        iframeUnlocked,
        embeddedUrl: session?.embeddedUrl ?? null,
        activeCanvasTab: session?.activeCanvasTab,
        senderId: userId,
      });
    } catch (error) {
      console.error('Failed to broadcast force_sync:', error);
      throw error;
    }
  }, [role, roomId, userId, currentSlideIndex, stageMode, drawingEnabled, iframeUnlocked, session?.embeddedUrl, session?.activeCanvasTab]);

  return {
    session,
    currentSlide: currentSlideIndex,
    setCurrentSlideIndex,
    activeTool: session?.activeTool ?? 'pointer',
    studentCanDraw: session?.studentCanDraw ?? false,
    lessonSlides: session?.lessonSlides ?? [],
    lessonTitle: session?.lessonTitle ?? 'Untitled Lesson',
    isConnected,
    quizActive: session?.quizActive ?? false,
    quizLocked: session?.quizLocked ?? false,
    quizRevealAnswer: session?.quizRevealAnswer ?? false,
    currentQuizSlideId: session?.currentQuizSlideId ?? null,
    pollActive: session?.pollActive ?? false,
    pollShowResults: session?.pollShowResults ?? false,
    currentPollSlideId: session?.currentPollSlideId ?? null,
    embeddedUrl: session?.embeddedUrl ?? null,
    isScreenSharing: session?.isScreenSharing ?? false,
    starCount: session?.starCount ?? 0,
    showStarCelebration: session?.showStarCelebration ?? false,
    isMilestone: session?.isMilestone ?? false,
    timerValue: session?.timerValue ?? null,
    timerRunning: session?.timerRunning ?? false,
    diceValue: session?.diceValue ?? null,
    sharedNotes: session?.sharedNotes ?? '',
    sessionContext: session?.sessionContext ?? {},
    activeCanvasTab: session?.activeCanvasTab ?? 'slides',
    stageMode,
    drawingEnabled,
    strokes,
    sessionStatus: session?.sessionStatus ?? 'waiting',
    sessionEnded: session?.sessionStatus === 'ended',
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
    iframeUnlocked,
    setIframeUnlocked,
    applyRemoteIframeUnlocked,
    forceSync,
  };
};
