import { supabase } from '@/lib/supabase';

export interface ClassroomSession {
  id: string;
  roomId: string;
  teacherId: string;
  currentSlideIndex: number;
  lessonTitle: string;
  lessonSlides: Array<Record<string, any> & { id: string; title: string; imageUrl?: string; content?: any; type?: string; quizQuestion?: string; quizOptions?: Array<{ id: string; text: string; isCorrect: boolean }>; pollQuestion?: string; pollOptions?: Array<{ id: string; text: string }> }>;
  activeTool: string;
  studentCanDraw: boolean;
  sessionStatus: string;
  quizActive: boolean;
  quizLocked: boolean;
  quizRevealAnswer: boolean;
  currentQuizSlideId: string | null;
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
  force_refresh_timestamp: number;
  sessionContext: Record<string, any>;
  // Phase 8: Canvas tab sync
  activeCanvasTab: string;
}

export interface SessionUpdate {
  currentSlideIndex?: number;
  activeTool?: string;
  studentCanDraw?: boolean;
  lessonSlides?: Array<Record<string, any> & { id: string; title: string; imageUrl?: string; content?: any }>;
  lessonTitle?: string;
  quizActive?: boolean;
  quizLocked?: boolean;
  quizRevealAnswer?: boolean;
  currentQuizSlideId?: string | null;
  pollActive?: boolean;
  pollShowResults?: boolean;
  currentPollSlideId?: string | null;
  // Shared display state
  embeddedUrl?: string | null;
  isScreenSharing?: boolean;
  starCount?: number;
  showStarCelebration?: boolean;
  isMilestone?: boolean;
  timerValue?: number | null;
  timerRunning?: boolean;
  diceValue?: number | null;
  // Phase 7: Shared notes & context
  sharedNotes?: string;
  sessionContext?: Record<string, any>;
  // Phase 8: Canvas tab sync
  activeCanvasTab?: string;
}

class ClassroomSyncService {
  private channels: Map<string, any> = new Map();
  private presenceCallbacks: Map<string, (state: Record<string, any[]>) => void> = new Map();

  async cleanupStaleSessions(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_stale_classroom_sessions');
      if (error) throw error;
      const count = data || 0;
      if (count > 0) {
      }
      return count;
    } catch (error) {
      console.error('Failed to cleanup stale sessions:', error);
      return 0;
    }
  }

  async createOrUpdateSession(
    roomId: string,
    teacherId: string,
    lessonData: {
      title: string;
      slides: Array<Record<string, any> & { id: string; title: string; imageUrl?: string; content?: any }>;
    }
  ): Promise<ClassroomSession | null> {
    try {
      // Clean up stale sessions before any room lookup
      await this.cleanupStaleSessions();

      // If a session already exists for this room, KEEP its lesson_slides /
      // lesson_title / current_slide_index intact — otherwise loading a lesson
      // from the Library and then re-mounting the classroom would overwrite
      // the real slides with the placeholder seed and they'd "disappear".
      const { data: existing } = await supabase
        .from('classroom_sessions')
        .select('*')
        .eq('room_id', roomId)
        .maybeSingle();

      const hasExistingSlides =
        Array.isArray((existing as any)?.lesson_slides) &&
        (existing as any).lesson_slides.length > 0;

      const upsertPayload: Record<string, any> = {
        room_id: roomId,
        teacher_id: teacherId,
        session_status: 'active',
        ended_at: null,
        updated_at: new Date().toISOString(),
      };

      if (!existing) {
        upsertPayload.lesson_title = lessonData.title;
        upsertPayload.lesson_slides = lessonData.slides;
        upsertPayload.current_slide_index = 0;
        upsertPayload.active_tool = 'pointer';
        upsertPayload.student_can_draw = false;
      } else if (!hasExistingSlides) {
        // Existing row but no slides yet → safe to seed.
        upsertPayload.lesson_title = lessonData.title;
        upsertPayload.lesson_slides = lessonData.slides;
      }

      const { data, error } = await supabase
        .from('classroom_sessions')
        .upsert(upsertPayload, { onConflict: 'room_id' })
        .select()
        .single();

      if (error) throw error;
      return this.mapToSession(data);
    } catch (error) {
      console.error('Failed to create/update session:', error);
      return null;
    }
  }

  async getActiveSession(roomId: string): Promise<ClassroomSession | null> {
    try {
      const { data, error } = await supabase
        .from('classroom_sessions')
        .select('*')
        .eq('room_id', roomId)
        .eq('session_status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      return this.mapToSession(data);
    } catch (error) {
      console.error('Failed to get active session:', error);
      return null;
    }
  }

  async updateSession(roomId: string, updates: SessionUpdate): Promise<void> {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (updates.currentSlideIndex !== undefined) {
        updateData.current_slide_index = updates.currentSlideIndex;
      }
      if (updates.activeTool !== undefined) {
        updateData.active_tool = updates.activeTool;
      }
      if (updates.studentCanDraw !== undefined) {
        updateData.student_can_draw = updates.studentCanDraw;
      }
      if (updates.lessonSlides !== undefined) {
        updateData.lesson_slides = updates.lessonSlides;
      }
      if (updates.lessonTitle !== undefined) {
        updateData.lesson_title = updates.lessonTitle;
      }
      if (updates.quizActive !== undefined) {
        updateData.quiz_active = updates.quizActive;
      }
      if (updates.quizLocked !== undefined) {
        updateData.quiz_locked = updates.quizLocked;
      }
      if (updates.quizRevealAnswer !== undefined) {
        updateData.quiz_reveal_answer = updates.quizRevealAnswer;
      }
      if (updates.currentQuizSlideId !== undefined) {
        updateData.current_quiz_slide_id = updates.currentQuizSlideId;
      }
      if (updates.pollActive !== undefined) {
        updateData.poll_active = updates.pollActive;
      }
      if (updates.pollShowResults !== undefined) {
        updateData.poll_show_results = updates.pollShowResults;
      }
      if (updates.currentPollSlideId !== undefined) {
        updateData.current_poll_slide_id = updates.currentPollSlideId;
      }
      // Shared display state updates
      if (updates.embeddedUrl !== undefined) {
        updateData.embedded_url = updates.embeddedUrl;
      }
      if (updates.isScreenSharing !== undefined) {
        updateData.is_screen_sharing = updates.isScreenSharing;
      }
      if (updates.starCount !== undefined) {
        updateData.star_count = updates.starCount;
      }
      if (updates.showStarCelebration !== undefined) {
        updateData.show_star_celebration = updates.showStarCelebration;
      }
      if (updates.isMilestone !== undefined) {
        updateData.is_milestone = updates.isMilestone;
      }
      if (updates.timerValue !== undefined) {
        updateData.timer_value = updates.timerValue;
      }
      if (updates.timerRunning !== undefined) {
        updateData.timer_running = updates.timerRunning;
      }
      if (updates.diceValue !== undefined) {
        updateData.dice_value = updates.diceValue;
      }
      if (updates.sharedNotes !== undefined) {
        updateData.shared_notes = updates.sharedNotes;
      }
      if (updates.sessionContext !== undefined) {
        updateData.session_context = updates.sessionContext;
      }
      if (updates.activeCanvasTab !== undefined) {
        updateData.active_canvas_tab = updates.activeCanvasTab;
      }

      const { error } = await supabase
        .from('classroom_sessions')
        .update(updateData)
        .eq('room_id', roomId)
        .eq('session_status', 'active');

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }

  async endSession(roomId: string): Promise<void> {
    try {
      const endedAt = new Date().toISOString();
      const { error } = await supabase
        .from('classroom_sessions')
        .update({
          session_status: 'ended',
          ended_at: endedAt
        })
        .eq('room_id', roomId)
        .eq('session_status', 'active');

      if (error) throw error;

      // Record a timeline event so students see when the teacher ended class
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('classroom_timeline_events').insert({
          room_id: roomId,
          event_type: 'session_ended',
          actor_id: user?.id ?? null,
          actor_role: 'teacher',
          occurred_at: endedAt,
          event_payload: { reason: 'teacher_ended' }
        });
      } catch (timelineError) {
        console.warn('Failed to record session_ended timeline event:', timelineError);
      }
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }

  subscribeToSession(
    roomId: string,
    onUpdate: (session: ClassroomSession) => void
  ): () => void {
    const channelName = `classroom_session_${roomId}`;

    // Clean up existing channel
    if (this.channels.has(channelName)) {
      supabase.removeChannel(this.channels.get(channelName));
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'classroom_sessions',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('🔄 SYNC EVENT received:', payload);
          const session = this.mapToSession(payload.new);
          if (session) {
            console.log('🔄 Mapped session – slideIndex:', session.currentSlideIndex, 'forceRefresh:', (payload.new as any)?.force_refresh_timestamp);
            onUpdate(session);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      if (this.channels.has(channelName)) {
        supabase.removeChannel(this.channels.get(channelName));
        this.channels.delete(channelName);
      }
    };
  }

  // Presence: track typing state
  trackPresence(
    roomId: string,
    userId: string,
    userName: string,
    onPresenceChange: (state: Record<string, any[]>) => void
  ): () => void {
    const channelName = `presence_${roomId}`;

    if (this.channels.has(channelName)) {
      supabase.removeChannel(this.channels.get(channelName));
    }

    this.presenceCallbacks.set(channelName, onPresenceChange);

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const cb = this.presenceCallbacks.get(channelName);
        if (cb) cb(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId, userName, isTyping: false });
        }
      });

    this.channels.set(channelName, channel);

    return () => {
      if (this.channels.has(channelName)) {
        supabase.removeChannel(this.channels.get(channelName));
        this.channels.delete(channelName);
        this.presenceCallbacks.delete(channelName);
      }
    };
  }

  async updatePresence(roomId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    const channelName = `presence_${roomId}`;
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.track({ userId, userName, isTyping });
    }
  }

  private mapToSession(data: any): ClassroomSession {
    return {
      id: data.id,
      roomId: data.room_id,
      teacherId: data.teacher_id,
      currentSlideIndex: data.current_slide_index || 0,
      lessonTitle: data.lesson_title || 'Untitled Lesson',
      lessonSlides: data.lesson_slides || [],
      activeTool: data.active_tool || 'pointer',
      studentCanDraw: data.student_can_draw || false,
      sessionStatus: data.session_status,
      quizActive: data.quiz_active || false,
      quizLocked: data.quiz_locked || false,
      quizRevealAnswer: data.quiz_reveal_answer || false,
      currentQuizSlideId: data.current_quiz_slide_id || null,
      pollActive: data.poll_active || false,
      pollShowResults: data.poll_show_results || false,
      currentPollSlideId: data.current_poll_slide_id || null,
      // Shared display state
      embeddedUrl: data.embedded_url || null,
      isScreenSharing: data.is_screen_sharing || false,
      starCount: data.star_count || 0,
      showStarCelebration: data.show_star_celebration || false,
      isMilestone: data.is_milestone || false,
      timerValue: data.timer_value || null,
      timerRunning: data.timer_running || false,
      diceValue: data.dice_value || null,
      sharedNotes: data.shared_notes || '',
      sessionContext: data.session_context || {},
      activeCanvasTab: data.active_canvas_tab || 'slides',
      force_refresh_timestamp: data.force_refresh_timestamp || 0
    };
  }

  disconnect(roomId: string) {
    const channelName = `classroom_session_${roomId}`;
    if (this.channels.has(channelName)) {
      supabase.removeChannel(this.channels.get(channelName));
      this.channels.delete(channelName);
    }
  }
}

export const classroomSyncService = new ClassroomSyncService();
