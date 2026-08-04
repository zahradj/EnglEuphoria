import { supabase } from '@/lib/supabase';

export interface WhiteboardStroke {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  strokeData: {
    points: Array<{ x: number; y: number }>;
    color: string;
    width: number;
    tool: 'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'line' | 'text';
    text?: string;
    fontSize?: number;
  };
  timestamp: number;
}

export interface WhiteboardState {
  strokes: WhiteboardStroke[];
  currentPage: number;
  totalPages: number;
  backgroundImage?: string;
}

export type StageMode =
  | 'slide'
  | 'web'
  | 'blank'
  | 'native_game_flashcards'
  | 'native_game_memory'
  | 'native_game_sentence'
  | 'native_game_blanks';

/** Worksheet shape returned by the `generate-smart-worksheet` edge function. */
export interface SmartWorksheet {
  flashcards: Array<{ word: string; definition: string; example_sentence: string }>;
  memory_match: Array<{ pair_1: string; pair_2: string }>;
  sentence_builder: Array<{ full_sentence: string; scrambled_words: string[] }>;
  fill_in_blanks: Array<{ sentence_with_blank: string; correct_answer: string; distractors: string[] }>;
}

export type NativeGameType = 'flashcards' | 'memory' | 'sentence' | 'blanks';

export interface WorksheetLoadPayload {
  worksheet: SmartWorksheet;
  gameType: NativeGameType;
  /** Stable per-launch nonce so receivers know whether they've already applied this worksheet. */
  launchId: string;
  senderId: string;
  timestamp: number;
}

export interface GameStatePayload {
  gameType: NativeGameType;
  /** Game-specific state (chip order, flipped indices, selection, etc.) */
  state: Record<string, any>;
  senderId: string;
  timestamp: number;
}

/** Live student interaction (button click, option select, drag drop, etc.) */
export interface StudentActionPayload {
  /** Stable slide id (or fallback to index). */
  slideId: string;
  slideIndex: number;
  /** Short, human-readable label of what the student did (e.g. "Selected: Apple"). */
  label: string;
  /** Optional structured payload — answer index, option text, etc. */
  data?: Record<string, any>;
  senderId: string;
  senderName?: string;
  timestamp: number;
}

export interface SlideCompletionPayload {
  slideIndex: number;
  slideId: string;
  /** Accuracy percentage 0-100 if applicable */
  accuracy?: number;
  /** Time spent on the slide in seconds */
  timeSpent?: number;
  senderId: string;
  senderName: string;
  timestamp: number;
}

export type RewardType = 'star' | 'sticker';
export interface RewardPayload {
  rewardType: RewardType;
  /** Optional emoji or sticker key (for 'sticker') */
  sticker?: string;
  /** Running star total when rewardType === 'star' (optional). */
  starCount?: number;
  /** True every 5th star — triggers the carnival celebration */
  isMilestone?: boolean;
  senderId: string;
  timestamp: number;
}

export type ToolName = 'dice' | 'timer' | 'wheel' | 'xo';
export interface ToolActionPayload {
  tool: ToolName;
  /** Numeric result of the action — e.g. dice value 1-6 (dice/wheel index) */
  result?: number;
  /** Timer: duration in seconds. */
  durationSec?: number;
  /** Timer: 'start' | 'stop' | 'reset'. */
  status?: 'start' | 'stop' | 'reset';
  /** Wheel: options to display. */
  options?: string[];
  /** Wheel: chosen option label. */
  winner?: string;
  /** XO (tic-tac-toe) action verb. */
  xoAction?: 'start' | 'move' | 'reset' | 'close';
  /** XO: 0-8 board cell index. */
  cell?: number;
  /** XO: player mark for this move. */
  mark?: 'X' | 'O';
  /** Unique id so the overlay can re-trigger animation. */
  actionId?: string;
  senderId: string;
  timestamp: number;
}


export interface ChatBroadcastPayload {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  text: string;
  timestamp: number;
}

type StrokeListener = (stroke: WhiteboardStroke) => void;
type ScrollListener = (payload: { scrollPercentage: number; senderId: string }) => void;
type StageModeListener = (payload: { mode: StageMode; senderId: string }) => void;
type DrawingEnabledListener = (payload: { enabled: boolean; senderId: string }) => void;
type IframeLockListener = (payload: { isUnlocked: boolean; senderId: string }) => void;
type RewardListener = (payload: RewardPayload) => void;
type ToolActionListener = (payload: ToolActionPayload) => void;
type ChatListener = (payload: ChatBroadcastPayload) => void;
type WorksheetLoadListener = (payload: WorksheetLoadPayload) => void;
type SlideCompletionListener = (payload: SlideCompletionPayload) => void;
type GameStateListener = (payload: GameStatePayload) => void;
type StudentActionListener = (payload: StudentActionPayload) => void;

/** Teacher → all clients leader/follower slide navigation. */
export interface SlideChangePayload {
  slideIndex: number;
  senderId: string;
  timestamp: number;
}
type SlideChangeListener = (payload: SlideChangePayload) => void;

/** Teacher → student: authoritative scene index inside an embedded Playground
 *  scene lesson (leader/follower — only the teacher can advance the class). */
export interface SceneLessonNavPayload {
  unitNumber: number;
  lessonNumber: number;
  sceneIdx: number;
  senderId: string;
  timestamp: number;
}
type SceneLessonNavListener = (payload: SceneLessonNavPayload) => void;

/** Whoever currently has the floor inside an embedded Playground scene lesson
 *  broadcasts every tap so the other side's identical scene mirrors it live —
 *  same scene, same data, so replaying a click at the same DOM position
 *  reproduces the same local state change (selection, reveal, drag-drop…)
 *  without needing per-scene-kind sync code. Purely a live mirror; it never
 *  drives page-level navigation — that stays on SceneLessonNavPayload. */
export interface SceneTapPayload {
  /** Child-index path from the scene wrapper root down to the tapped element. */
  path: number[];
  senderRole: 'teacher' | 'student';
  senderId: string;
  timestamp: number;
}
type SceneTapListener = (payload: SceneTapPayload) => void;

/** Teacher → student: grants/revokes the student's ability to interact with
 *  their own copy of the current embedded scene activity. Locked (default) =
 *  student's activity is view-only and mirrors the teacher's taps; unlocked =
 *  student can tap their own copy directly (and the teacher's mirrors theirs). */
export interface SceneInteractionPermissionPayload {
  unlocked: boolean;
  senderId: string;
  timestamp: number;
}
type SceneInteractionPermissionListener = (payload: SceneInteractionPermissionPayload) => void;

/** Student → teacher: "I finished this activity, please advance" — sent when
 *  an unlocked student's own action would normally trigger onNext. Keeps the
 *  teacher's scene index as the single source of truth: the teacher calls its
 *  own goNext() in response, which re-broadcasts via SceneLessonNavPayload as
 *  usual, closing the loop back to the student. */
export interface SceneAdvanceRequestPayload {
  senderId: string;
  timestamp: number;
}
type SceneAdvanceRequestListener = (payload: SceneAdvanceRequestPayload) => void;

/** Teacher's authoritative snapshot pushed on demand by the "Force Sync" button. */
export interface ForceSyncPayload {
  slideIndex: number;
  stageMode?: StageMode;
  drawingEnabled?: boolean;
  iframeUnlocked?: boolean;
  embeddedUrl?: string | null;
  activeCanvasTab?: string;
  senderId: string;
  timestamp: number;
}
type ForceSyncListener = (payload: ForceSyncPayload) => void;

interface RoomChannel {
  channel: ReturnType<typeof supabase.channel>;
  ready: Promise<void>;
  currentStatus: string;
  statusListeners: Set<(status: string) => void>;
  strokeListeners: Set<StrokeListener>;
  scrollListeners: Set<ScrollListener>;
  stageModeListeners: Set<StageModeListener>;
  drawingEnabledListeners: Set<DrawingEnabledListener>;
  iframeLockListeners: Set<IframeLockListener>;
  rewardListeners: Set<RewardListener>;
  toolActionListeners: Set<ToolActionListener>;
  chatListeners: Set<ChatListener>;
  worksheetListeners: Set<WorksheetLoadListener>;
  gameStateListeners: Set<GameStateListener>;
  slideCompletionListeners: Set<SlideCompletionListener>;
  slideChangeListeners: Set<SlideChangeListener>;
  forceSyncListeners: Set<ForceSyncListener>;
  studentActionListeners: Set<StudentActionListener>;
  sceneLessonNavListeners: Set<SceneLessonNavListener>;
  sceneTapListeners: Set<SceneTapListener>;
  sceneInteractionPermissionListeners: Set<SceneInteractionPermissionListener>;
  sceneAdvanceRequestListeners: Set<SceneAdvanceRequestListener>;
  refCount: number;
}

class WhiteboardService {
  private rooms: Map<string, RoomChannel> = new Map();

  /**
   * Get (or create) a single SUBSCRIBED realtime channel per room.
   * Critical: Supabase requires `.subscribe()` before `.send()` will deliver.
   */
  private getRoom(roomId: string): RoomChannel {
    const channelName = `classroom_${roomId}`;
    const existing = this.rooms.get(channelName);
    if (existing) return existing;


    const strokeListeners = new Set<StrokeListener>();
    const scrollListeners = new Set<ScrollListener>();
    const stageModeListeners = new Set<StageModeListener>();
    const drawingEnabledListeners = new Set<DrawingEnabledListener>();
    const iframeLockListeners = new Set<IframeLockListener>();
    const rewardListeners = new Set<RewardListener>();
    const toolActionListeners = new Set<ToolActionListener>();
    const chatListeners = new Set<ChatListener>();
    const worksheetListeners = new Set<WorksheetLoadListener>();
    const gameStateListeners = new Set<GameStateListener>();
    const slideCompletionListeners = new Set<SlideCompletionListener>();
    const slideChangeListeners = new Set<SlideChangeListener>();
    const forceSyncListeners = new Set<ForceSyncListener>();
    const studentActionListeners = new Set<StudentActionListener>();
    const sceneLessonNavListeners = new Set<SceneLessonNavListener>();
    const sceneTapListeners = new Set<SceneTapListener>();
    const sceneInteractionPermissionListeners = new Set<SceneInteractionPermissionListener>();
    const sceneAdvanceRequestListeners = new Set<SceneAdvanceRequestListener>();
    const statusListeners = new Set<(status: string) => void>();

    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'whiteboard_stroke' }, (payload) => {
        const stroke = payload.payload as WhiteboardStroke;
        strokeListeners.forEach((cb) => cb(stroke));
      })
      .on('broadcast', { event: 'whiteboard_clear' }, () => {
        strokeListeners.forEach((cb) =>
          cb({
            id: 'clear',
            roomId,
            userId: 'system',
            userName: 'System',
            strokeData: { points: [], color: 'transparent', width: 0, tool: 'eraser' },
            timestamp: Date.now(),
          })
        );
      })
      .on('broadcast', { event: 'web_scroll' }, (payload) => {
        scrollListeners.forEach((cb) => cb(payload.payload as any));
      })
      .on('broadcast', { event: 'stage_mode' }, (payload) => {
        stageModeListeners.forEach((cb) => cb(payload.payload as any));
      })
      .on('broadcast', { event: 'stage_change' }, (payload) => {
        stageModeListeners.forEach((cb) => cb(payload.payload as any));
      })
      .on('broadcast', { event: 'drawing_enabled' }, (payload) => {
        drawingEnabledListeners.forEach((cb) => cb(payload.payload as any));
      })
      .on('broadcast', { event: 'iframe_lock_state' }, (payload) => {
        iframeLockListeners.forEach((cb) => cb(payload.payload as any));
      })
      .on('broadcast', { event: 'reward' }, (payload) => {
        rewardListeners.forEach((cb) => cb(payload.payload as RewardPayload));
      })
      .on('broadcast', { event: 'give_star' }, (payload) => {
        rewardListeners.forEach((cb) => cb({
          rewardType: 'star',
          starCount: payload.payload?.starCount,
          isMilestone: payload.payload?.isMilestone,
          senderId: payload.payload?.senderId ?? 'unknown',
          timestamp: Date.now(),
        }));
      })
      .on('broadcast', { event: 'tool_action' }, (payload) => {
        toolActionListeners.forEach((cb) => cb(payload.payload as ToolActionPayload));
      })
      .on('broadcast', { event: 'chat_message' }, (payload) => {
        chatListeners.forEach((cb) => cb(payload.payload as ChatBroadcastPayload));
      })
      .on('broadcast', { event: 'worksheet_load' }, (payload) => {
        worksheetListeners.forEach((cb) => cb(payload.payload as WorksheetLoadPayload));
      })
      .on('broadcast', { event: 'game_state' }, (payload) => {
        gameStateListeners.forEach((cb) => cb(payload.payload as GameStatePayload));
      })
      .on('broadcast', { event: 'slide_completion' }, (payload) => {
        slideCompletionListeners.forEach((cb) => cb(payload.payload as SlideCompletionPayload));
      })
      .on('broadcast', { event: 'slide_change' }, (payload) => {
        slideChangeListeners.forEach((cb) => cb(payload.payload as SlideChangePayload));
      })
      .on('broadcast', { event: 'force_sync' }, (payload) => {
        forceSyncListeners.forEach((cb) => cb(payload.payload as ForceSyncPayload));
      })
      .on('broadcast', { event: 'student_action' }, (payload) => {
        studentActionListeners.forEach((cb) => cb(payload.payload as StudentActionPayload));
      })
      .on('broadcast', { event: 'scene_lesson_nav' }, (payload) => {
        sceneLessonNavListeners.forEach((cb) => cb(payload.payload as SceneLessonNavPayload));
      })
      .on('broadcast', { event: 'scene_tap' }, (payload) => {
        sceneTapListeners.forEach((cb) => cb(payload.payload as SceneTapPayload));
      })
      .on('broadcast', { event: 'scene_interaction_permission' }, (payload) => {
        sceneInteractionPermissionListeners.forEach((cb) => cb(payload.payload as SceneInteractionPermissionPayload));
      })
      .on('broadcast', { event: 'scene_advance_request' }, (payload) => {
        sceneAdvanceRequestListeners.forEach((cb) => cb(payload.payload as SceneAdvanceRequestPayload));
      });

    const ready = new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        room.currentStatus = status;
        statusListeners.forEach((cb) => cb(status));
        if (status === 'SUBSCRIBED') resolve();
      });
    });

    const room: RoomChannel = {
      channel,
      ready,
      currentStatus: 'CONNECTING',
      statusListeners,
      strokeListeners,
      scrollListeners,
      stageModeListeners,
      drawingEnabledListeners,
      iframeLockListeners,
      rewardListeners,
      toolActionListeners,
      chatListeners,
      worksheetListeners,
      gameStateListeners,
      slideCompletionListeners,
      slideChangeListeners,
      forceSyncListeners,
      studentActionListeners,
      sceneLessonNavListeners,
      sceneTapListeners,
      sceneInteractionPermissionListeners,
      sceneAdvanceRequestListeners,
      refCount: 0,
    };
    this.rooms.set(channelName, room);
    return room;
  }

  async saveStroke(roomId: string, stroke: Omit<WhiteboardStroke, 'id'>): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'whiteboard_stroke',
      payload: { ...stroke, id: `${Date.now()}-${Math.random()}` },
    });
  }

  async clearWhiteboard(roomId: string): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'whiteboard_clear',
      payload: { roomId, timestamp: Date.now() },
    });
  }

  /**
   * Sync the parent-wrapper scroll position of embedded web content.
   * Cross-origin iframes can't be scrolled directly — caller must wrap
   * the iframe in a scrollable div and broadcast that wrapper's scroll %.
   */
  async sendScroll(roomId: string, scrollPercentage: number, senderId: string): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'web_scroll',
      payload: { scrollPercentage, senderId },
    });
  }

  subscribeToStrokes(roomId: string, onStroke: StrokeListener): () => void {
    const room = this.getRoom(roomId);
    room.strokeListeners.add(onStroke);
    room.refCount += 1;
    return () => this.release(roomId, () => room.strokeListeners.delete(onStroke));
  }

  subscribeToScroll(roomId: string, onScroll: ScrollListener): () => void {
    const room = this.getRoom(roomId);
    room.scrollListeners.add(onScroll);
    room.refCount += 1;
    return () => this.release(roomId, () => room.scrollListeners.delete(onScroll));
  }

  /** Broadcast which mode the unified Main Stage is showing (slide / web / blank). */
  async sendStageMode(roomId: string, mode: StageMode, senderId: string): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'stage_mode',
      payload: { mode, senderId },
    });
  }

  subscribeToStageMode(roomId: string, onMode: StageModeListener): () => void {
    const room = this.getRoom(roomId);
    room.stageModeListeners.add(onMode);
    room.refCount += 1;
    return () => this.release(roomId, () => room.stageModeListeners.delete(onMode));
  }

  /** Broadcast whether the transparent annotation overlay captures pointer events. */
  async sendDrawingEnabled(roomId: string, enabled: boolean, senderId: string): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'drawing_enabled',
      payload: { enabled, senderId },
    });
  }

  subscribeToDrawingEnabled(roomId: string, onChange: DrawingEnabledListener): () => void {
    const room = this.getRoom(roomId);
    room.drawingEnabledListeners.add(onChange);
    room.refCount += 1;
    return () => this.release(roomId, () => room.drawingEnabledListeners.delete(onChange));
  }

  /** Broadcast whether the student is allowed to interact directly with the embedded iframe. */
  async sendIframeLockState(roomId: string, isUnlocked: boolean, senderId: string): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'iframe_lock_state',
      payload: { isUnlocked, senderId },
    });
  }

  subscribeToIframeLockState(roomId: string, onChange: IframeLockListener): () => void {
    const room = this.getRoom(roomId);
    room.iframeLockListeners.add(onChange);
    room.refCount += 1;
    return () => this.release(roomId, () => room.iframeLockListeners.delete(onChange));
  }

  /** Broadcast a teacher reward (star or sticker) so the student animates instantly. */
  async sendReward(
    roomId: string,
    reward: Omit<RewardPayload, 'timestamp'>
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'reward',
      payload: { ...reward, timestamp: Date.now() } satisfies RewardPayload,
    });
  }

  subscribeToRewards(roomId: string, onReward: RewardListener): () => void {
    const room = this.getRoom(roomId);
    room.rewardListeners.add(onReward);
    room.refCount += 1;
    return () => this.release(roomId, () => room.rewardListeners.delete(onReward));
  }

  /** Broadcast an interactive tool result (e.g. dice roll) — the result is computed
   *  by the sender so every receiver renders the SAME number. */
  async sendToolAction(
    roomId: string,
    action: Omit<ToolActionPayload, 'timestamp'>
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    const payload: ToolActionPayload = { ...action, timestamp: Date.now() };
    // Local echo — Supabase broadcast is created with `self: false`, so the
    // sender would otherwise never see their own dice/wheel/XO/timer events.
    // Fire listeners synchronously so the teacher's overlay updates instantly.
    try { room.toolActionListeners.forEach((cb) => cb(payload)); } catch { /* noop */ }
    await room.channel.send({
      type: 'broadcast',
      event: 'tool_action',
      payload,
    });
  }

  subscribeToToolActions(roomId: string, onAction: ToolActionListener): () => void {
    const room = this.getRoom(roomId);
    room.toolActionListeners.add(onAction);
    room.refCount += 1;
    return () => this.release(roomId, () => room.toolActionListeners.delete(onAction));
  }

  /** Broadcast a chat message instantly (in addition to DB persistence). */
  async sendChatMessage(
    roomId: string,
    message: Omit<ChatBroadcastPayload, 'timestamp'>
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: { ...message, timestamp: Date.now() } satisfies ChatBroadcastPayload,
    });
  }

  subscribeToChatMessages(roomId: string, onMessage: ChatListener): () => void {
    const room = this.getRoom(roomId);
    room.chatListeners.add(onMessage);
    room.refCount += 1;
    return () => this.release(roomId, () => room.chatListeners.delete(onMessage));
  }

  /** Broadcast a freshly-generated Smart Worksheet so the student loads the same data instantly. */
  async sendWorksheet(roomId: string, payload: Omit<WorksheetLoadPayload, 'timestamp'>): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'worksheet_load',
      payload: { ...payload, timestamp: Date.now() } satisfies WorksheetLoadPayload,
    });
  }

  subscribeToWorksheet(roomId: string, onLoad: WorksheetLoadListener): () => void {
    const room = this.getRoom(roomId);
    room.worksheetListeners.add(onLoad);
    room.refCount += 1;
    return () => this.release(roomId, () => room.worksheetListeners.delete(onLoad));
  }

  /** Broadcast incremental in-game state (e.g. flipped card, current sentence index). */
  async sendGameState(roomId: string, payload: Omit<GameStatePayload, 'timestamp'>): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'game_state',
      payload: { ...payload, timestamp: Date.now() } satisfies GameStatePayload,
    });
  }

  subscribeToGameState(roomId: string, onState: GameStateListener): () => void {
    const room = this.getRoom(roomId);
    room.gameStateListeners.add(onState);
    room.refCount += 1;
    return () => this.release(roomId, () => room.gameStateListeners.delete(onState));
  }

  /** Student broadcasts that they completed an interactive slide activity. */
  async sendSlideCompletion(
    roomId: string,
    payload: Omit<SlideCompletionPayload, 'timestamp'>
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'slide_completion',
      payload: { ...payload, timestamp: Date.now() } satisfies SlideCompletionPayload,
    });
  }

  subscribeToSlideCompletion(roomId: string, onComplete: SlideCompletionListener): () => void {
    const room = this.getRoom(roomId);
    room.slideCompletionListeners.add(onComplete);
    room.refCount += 1;
    return () => this.release(roomId, () => room.slideCompletionListeners.delete(onComplete));
  }

  /** Teacher → all clients: instant slide jump (Leader/Follower paradigm). */
  async sendSlideChange(roomId: string, slideIndex: number, senderId: string): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'slide_change',
      payload: { slideIndex, senderId, timestamp: Date.now() } satisfies SlideChangePayload,
    });
  }

  subscribeToSlideChange(roomId: string, onChange: SlideChangeListener): () => void {
    const room = this.getRoom(roomId);
    room.slideChangeListeners.add(onChange);
    room.refCount += 1;
    return () => this.release(roomId, () => room.slideChangeListeners.delete(onChange));
  }

  /** Teacher → all clients: full state snapshot from "Force Sync" button (no page reload). */
  async sendForceSync(roomId: string, payload: Omit<ForceSyncPayload, 'timestamp'>): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'force_sync',
      payload: { ...payload, timestamp: Date.now() } satisfies ForceSyncPayload,
    });
  }

  subscribeToForceSync(roomId: string, onSync: ForceSyncListener): () => void {
    const room = this.getRoom(roomId);
    room.forceSyncListeners.add(onSync);
    room.refCount += 1;
    return () => this.release(roomId, () => room.forceSyncListeners.delete(onSync));
  }

  /** Student → all clients: live action broadcast (option click, drag drop…) */
  async sendStudentAction(
    roomId: string,
    payload: Omit<StudentActionPayload, 'timestamp'>,
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'student_action',
      payload: { ...payload, timestamp: Date.now() } satisfies StudentActionPayload,
    });
  }

  subscribeToStudentActions(
    roomId: string,
    onAction: StudentActionListener,
  ): () => void {
    const room = this.getRoom(roomId);
    room.studentActionListeners.add(onAction);
    room.refCount += 1;
    return () => this.release(roomId, () => room.studentActionListeners.delete(onAction));
  }

  /** Teacher → student: broadcast the authoritative scene index inside an
   *  embedded Playground scene lesson. Students never call this — their
   *  local scene index is fully driven by whatever the teacher sends. */
  async sendSceneLessonNav(
    roomId: string,
    payload: Omit<SceneLessonNavPayload, 'timestamp'>,
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'scene_lesson_nav',
      payload: { ...payload, timestamp: Date.now() } satisfies SceneLessonNavPayload,
    });
  }

  subscribeToSceneLessonNav(roomId: string, onNav: SceneLessonNavListener): () => void {
    const room = this.getRoom(roomId);
    room.sceneLessonNavListeners.add(onNav);
    room.refCount += 1;
    return () => this.release(roomId, () => room.sceneLessonNavListeners.delete(onNav));
  }

  /** Whoever has the floor broadcasts a tap; the other side replays it onto
   *  its own identical scene. See SceneTapPayload for why this needs no
   *  per-scene-kind code. */
  async sendSceneTap(roomId: string, payload: Omit<SceneTapPayload, 'timestamp'>): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'scene_tap',
      payload: { ...payload, timestamp: Date.now() } satisfies SceneTapPayload,
    });
  }

  subscribeToSceneTap(roomId: string, onTap: SceneTapListener): () => void {
    const room = this.getRoom(roomId);
    room.sceneTapListeners.add(onTap);
    room.refCount += 1;
    return () => this.release(roomId, () => room.sceneTapListeners.delete(onTap));
  }

  async sendSceneInteractionPermission(
    roomId: string,
    payload: Omit<SceneInteractionPermissionPayload, 'timestamp'>,
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'scene_interaction_permission',
      payload: { ...payload, timestamp: Date.now() } satisfies SceneInteractionPermissionPayload,
    });
  }

  subscribeToSceneInteractionPermission(
    roomId: string,
    onPermission: SceneInteractionPermissionListener,
  ): () => void {
    const room = this.getRoom(roomId);
    room.sceneInteractionPermissionListeners.add(onPermission);
    room.refCount += 1;
    return () => this.release(roomId, () => room.sceneInteractionPermissionListeners.delete(onPermission));
  }

  async sendSceneAdvanceRequest(
    roomId: string,
    payload: Omit<SceneAdvanceRequestPayload, 'timestamp'>,
  ): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'scene_advance_request',
      payload: { ...payload, timestamp: Date.now() } satisfies SceneAdvanceRequestPayload,
    });
  }

  subscribeToSceneAdvanceRequest(roomId: string, onRequest: SceneAdvanceRequestListener): () => void {
    const room = this.getRoom(roomId);
    room.sceneAdvanceRequestListeners.add(onRequest);
    room.refCount += 1;
    return () => this.release(roomId, () => room.sceneAdvanceRequestListeners.delete(onRequest));
  }

  subscribeToStatus(roomId: string, onStatus: (status: string) => void): () => void {
    const room = this.getRoom(roomId);
    room.statusListeners.add(onStatus);
    onStatus(room.currentStatus);
    room.refCount += 1;
    return () => this.release(roomId, () => room.statusListeners.delete(onStatus));
  }

  private release(roomId: string, cleanup: () => void) {
    const channelName = `classroom_${roomId}`;
    const room = this.rooms.get(channelName);
    if (!room) return;
    cleanup();
    room.refCount = Math.max(0, room.refCount - 1);
    if (
      room.refCount === 0 &&
      room.strokeListeners.size === 0 &&
      room.scrollListeners.size === 0 &&
      room.stageModeListeners.size === 0 &&
      room.drawingEnabledListeners.size === 0 &&
      room.iframeLockListeners.size === 0 &&
      room.rewardListeners.size === 0 &&
      room.toolActionListeners.size === 0 &&
      room.chatListeners.size === 0 &&
      room.worksheetListeners.size === 0 &&
      room.gameStateListeners.size === 0 &&
      room.slideCompletionListeners.size === 0 &&
      room.slideChangeListeners.size === 0 &&
      room.forceSyncListeners.size === 0 &&
      room.studentActionListeners.size === 0 &&
      room.sceneLessonNavListeners.size === 0 &&
      room.statusListeners.size === 0
    ) {
      supabase.removeChannel(room.channel);
      this.rooms.delete(channelName);
    }
  }

  async changeBackground(roomId: string, backgroundImage: string): Promise<void> {
    const room = this.getRoom(roomId);
    await room.ready;
    await room.channel.send({
      type: 'broadcast',
      event: 'whiteboard_background',
      payload: { roomId, backgroundImage, timestamp: Date.now() },
    });
  }

  disconnect(roomId: string) {
    const channelName = `classroom_${roomId}`;
    const room = this.rooms.get(channelName);
    if (room) {
      supabase.removeChannel(room.channel);
      this.rooms.delete(channelName);
    }
  }
}

export const whiteboardService = new WhiteboardService();
