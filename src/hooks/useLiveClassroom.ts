import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Struggle {
  skill_tag: string;          // 'grammar:present_perfect' | 'vocab:although' | 'pronunciation:th'
  vocab_word?: string;
  activity_id?: string;
  ts: number;
  count?: number;
}

export interface SupplementalRef {
  kind: 'game' | 'storybook' | 'extra_practice';
  refId: string;
  title: string;
}

export interface ClassroomState {
  id: string;
  session_id: string;
  lesson_id: string | null;
  teacher_id: string;
  current_slide_index: number;
  active_media_state: { playing: boolean; position: number };
  active_game_state: Record<string, any>;
  student_cursor_position: { x: number; y: number; t: number } | null;
  student_rewards: number;
  session_struggles: Struggle[];
  supplemental_ref: SupplementalRef | null;
  correct_count: number;
  attempt_count: number;
  started_at?: string | null;
}

export interface StrokePayload {
  prevX: number; prevY: number; x: number; y: number;
  color: string; width: number; senderId: string;
}
export interface LaserPayload { x: number; y: number; senderId: string }
export interface HintPayload { slideIndex: number; senderId: string }
export interface RewardPayload { xp: number; senderId: string }
export interface CursorPayload { x: number; y: number; senderId: string }
export interface StrugglePayload { struggle: Struggle; senderId: string }
export interface SupplementalPayload { supplemental: SupplementalRef | null; senderId: string }

interface Options {
  sessionId: string;
  userId: string;
  role: 'teacher' | 'student';
  // When teacher and the row doesn't exist yet, we'll auto-create with these defaults.
  bootstrapLessonId?: string | null;
}

interface Peer { userId: string; role: 'teacher' | 'student' }

export function useLiveClassroom({ sessionId, userId, role, bootstrapLessonId }: Options) {
  const [state, setState] = useState<ClassroomState | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef<{
    stroke: ((p: StrokePayload) => void)[];
    clear: (() => void)[];
    laser: ((p: LaserPayload) => void)[];
    reward: ((p: RewardPayload) => void)[];
    hint: ((p: HintPayload) => void)[];
    cursor: ((p: CursorPayload) => void)[];
    gameState: ((patch: Record<string, any>) => void)[];
    struggle: ((p: StrugglePayload) => void)[];
    supplemental: ((p: SupplementalPayload) => void)[];
  }>({ stroke: [], clear: [], laser: [], reward: [], hint: [], cursor: [], gameState: [], struggle: [], supplemental: [] });

  // Bootstrap: ensure row exists (teacher creates), fetch initial state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: existing } = await supabase
        .from('classroom_states')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();
      if (cancelled) return;
      if (existing) {
        setState(existing as any);
      } else if (role === 'teacher') {
        const { data: created, error } = await supabase
          .from('classroom_states')
          .insert({
            session_id: sessionId,
            teacher_id: userId,
            lesson_id: bootstrapLessonId ?? null,
            current_slide_index: 0,
          })
          .select('*')
          .single();
        if (!cancelled && created && !error) setState(created as any);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, role, userId, bootstrapLessonId]);

  // Realtime channel
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase.channel(`live-classroom:${sessionId}`, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'classroom_states',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const next = (payload.new as any) ?? null;
        if (next) setState(next);
      })
      .on('broadcast', { event: 'stroke' }, ({ payload }) => {
        handlersRef.current.stroke.forEach(h => h(payload as StrokePayload));
      })
      .on('broadcast', { event: 'clear' }, () => {
        handlersRef.current.clear.forEach(h => h());
      })
      .on('broadcast', { event: 'laser' }, ({ payload }) => {
        handlersRef.current.laser.forEach(h => h(payload as LaserPayload));
      })
      .on('broadcast', { event: 'reward' }, ({ payload }) => {
        handlersRef.current.reward.forEach(h => h(payload as RewardPayload));
      })
      .on('broadcast', { event: 'hint' }, ({ payload }) => {
        handlersRef.current.hint.forEach(h => h(payload as HintPayload));
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        handlersRef.current.cursor.forEach(h => h(payload as CursorPayload));
      })
      .on('broadcast', { event: 'game_state' }, ({ payload }) => {
        const patch = (payload as any)?.patch ?? {};
        handlersRef.current.gameState.forEach(h => h(patch));
        setState(s => s ? { ...s, active_game_state: { ...(s.active_game_state ?? {}), ...patch } } : s);
      })
      .on('broadcast', { event: 'struggle' }, ({ payload }) => {
        handlersRef.current.struggle.forEach(h => h(payload as StrugglePayload));
        const incoming = (payload as StrugglePayload)?.struggle;
        if (!incoming) return;
        setState(s => {
          if (!s) return s;
          const list = Array.isArray(s.session_struggles) ? [...s.session_struggles] : [];
          const key = (st: Struggle) => `${st.skill_tag}|${st.vocab_word ?? ''}`;
          const k = key(incoming);
          const idx = list.findIndex(x => key(x) === k);
          if (idx >= 0) list[idx] = { ...list[idx], count: (list[idx].count ?? 1) + 1, ts: incoming.ts };
          else list.push({ ...incoming, count: 1 });
          return { ...s, session_struggles: list };
        });
      })
      .on('broadcast', { event: 'supplemental' }, ({ payload }) => {
        handlersRef.current.supplemental.forEach(h => h(payload as SupplementalPayload));
        const ref = (payload as SupplementalPayload)?.supplemental ?? null;
        setState(s => s ? { ...s, supplemental_ref: ref } : s);
      })
      .on('presence', { event: 'sync' }, () => {
        const st = channel.presenceState() as Record<string, Array<{ role: 'teacher' | 'student' }>>;
        const list: Peer[] = [];
        Object.entries(st).forEach(([uid, metas]) => {
          metas.forEach(m => list.push({ userId: uid, role: m.role }));
        });
        setPeers(list);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({ role });
        }
      });

    return () => {
      setIsConnected(false);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [sessionId, userId, role]);

  const setSlideIndex = useCallback(async (index: number) => {
    if (role !== 'teacher' || !state) return;
    setState(s => s ? { ...s, current_slide_index: index } : s);
    await supabase
      .from('classroom_states')
      .update({ current_slide_index: index })
      .eq('session_id', sessionId);
  }, [role, sessionId, state]);

  const startClass = useCallback(async () => {
    if (role !== 'teacher' || !state || state.started_at) return;
    const startedAt = new Date().toISOString();
    setState(s => s ? { ...s, started_at: startedAt } : s);
    await supabase
      .from('classroom_states')
      .update({ started_at: startedAt })
      .eq('session_id', sessionId);
  }, [role, sessionId, state]);

  const sendStroke = useCallback((p: Omit<StrokePayload, 'senderId'>) => {
    channelRef.current?.send({ type: 'broadcast', event: 'stroke', payload: { ...p, senderId: userId } });
  }, [userId]);

  const sendLaser = useCallback((p: Omit<LaserPayload, 'senderId'>) => {
    channelRef.current?.send({ type: 'broadcast', event: 'laser', payload: { ...p, senderId: userId } });
  }, [userId]);

  const clearStrokes = useCallback(() => {
    channelRef.current?.send({ type: 'broadcast', event: 'clear', payload: {} });
    handlersRef.current.clear.forEach(h => h());
  }, []);

  const sendReward = useCallback(async (xp = 5) => {
    if (role !== 'teacher' || !state) return;
    const payload: RewardPayload = { xp, senderId: userId };
    channelRef.current?.send({ type: 'broadcast', event: 'reward', payload });
    handlersRef.current.reward.forEach(h => h(payload));
    const next = (state.student_rewards ?? 0) + xp;
    setState(s => s ? { ...s, student_rewards: next } : s);
    await supabase
      .from('classroom_states')
      .update({ student_rewards: next })
      .eq('session_id', sessionId);
  }, [role, state, sessionId, userId]);

  const sendHint = useCallback(() => {
    if (role !== 'teacher' || !state) return;
    const payload: HintPayload = { slideIndex: state.current_slide_index, senderId: userId };
    channelRef.current?.send({ type: 'broadcast', event: 'hint', payload });
  }, [role, state, userId]);

  // Cursor broadcast (throttled by caller). Persists last position to DB at ~1Hz max.
  const lastCursorPersistRef = useRef(0);
  const broadcastCursor = useCallback((x: number, y: number) => {
    if (role !== 'student') return;
    const payload: CursorPayload = { x, y, senderId: userId };
    channelRef.current?.send({ type: 'broadcast', event: 'cursor', payload });
    const now = Date.now();
    if (now - lastCursorPersistRef.current > 1000) {
      lastCursorPersistRef.current = now;
      void supabase
        .from('classroom_states')
        .update({ student_cursor_position: { x, y, t: now } })
        .eq('session_id', sessionId);
    }
  }, [role, userId, sessionId]);

  // Game state: anyone can patch; debounced DB persist so late joiners hydrate.
  const gameStateDebounceRef = useRef<number | null>(null);
  const pendingGameStateRef = useRef<Record<string, any>>({});
  const updateGameState = useCallback((patch: Record<string, any>) => {
    channelRef.current?.send({ type: 'broadcast', event: 'game_state', payload: { patch } });
    setState(s => s ? { ...s, active_game_state: { ...(s.active_game_state ?? {}), ...patch } } : s);
    pendingGameStateRef.current = { ...pendingGameStateRef.current, ...patch };
    if (gameStateDebounceRef.current) window.clearTimeout(gameStateDebounceRef.current);
    gameStateDebounceRef.current = window.setTimeout(() => {
      const merged = pendingGameStateRef.current;
      pendingGameStateRef.current = {};
      void supabase
        .from('classroom_states')
        .update({ active_game_state: { ...(state?.active_game_state ?? {}), ...merged } })
        .eq('session_id', sessionId);
    }, 250);
  }, [sessionId, state]);

  const onStroke = useCallback((h: (p: StrokePayload) => void) => {
    handlersRef.current.stroke.push(h);
    return () => { handlersRef.current.stroke = handlersRef.current.stroke.filter(x => x !== h); };
  }, []);
  const onClear = useCallback((h: () => void) => {
    handlersRef.current.clear.push(h);
    return () => { handlersRef.current.clear = handlersRef.current.clear.filter(x => x !== h); };
  }, []);
  const onLaser = useCallback((h: (p: LaserPayload) => void) => {
    handlersRef.current.laser.push(h);
    return () => { handlersRef.current.laser = handlersRef.current.laser.filter(x => x !== h); };
  }, []);
  const onReward = useCallback((h: (p: RewardPayload) => void) => {
    handlersRef.current.reward.push(h);
    return () => { handlersRef.current.reward = handlersRef.current.reward.filter(x => x !== h); };
  }, []);
  const onHint = useCallback((h: (p: HintPayload) => void) => {
    handlersRef.current.hint.push(h);
    return () => { handlersRef.current.hint = handlersRef.current.hint.filter(x => x !== h); };
  }, []);
  const onCursor = useCallback((h: (p: CursorPayload) => void) => {
    handlersRef.current.cursor.push(h);
    return () => { handlersRef.current.cursor = handlersRef.current.cursor.filter(x => x !== h); };
  }, []);
  const onGameState = useCallback((h: (patch: Record<string, any>) => void) => {
    handlersRef.current.gameState.push(h);
    return () => { handlersRef.current.gameState = handlersRef.current.gameState.filter(x => x !== h); };
  }, []);
  const onStruggle = useCallback((h: (p: StrugglePayload) => void) => {
    handlersRef.current.struggle.push(h);
    return () => { handlersRef.current.struggle = handlersRef.current.struggle.filter(x => x !== h); };
  }, []);

  // Struggle: anyone can emit; broadcast + debounced DB persist so it survives reconnects.
  const struggleDebounceRef = useRef<number | null>(null);
  const reportStruggle = useCallback((s: Omit<Struggle, 'ts'>) => {
    const struggle: Struggle = { ...s, ts: Date.now() };
    channelRef.current?.send({ type: 'broadcast', event: 'struggle', payload: { struggle, senderId: userId } });
    setState(prev => {
      if (!prev) return prev;
      const list = Array.isArray(prev.session_struggles) ? [...prev.session_struggles] : [];
      const key = `${struggle.skill_tag}|${struggle.vocab_word ?? ''}`;
      const idx = list.findIndex(x => `${x.skill_tag}|${x.vocab_word ?? ''}` === key);
      if (idx >= 0) list[idx] = { ...list[idx], count: (list[idx].count ?? 1) + 1, ts: struggle.ts };
      else list.push({ ...struggle, count: 1 });
      if (struggleDebounceRef.current) window.clearTimeout(struggleDebounceRef.current);
      struggleDebounceRef.current = window.setTimeout(() => {
        void supabase.from('classroom_states').update({ session_struggles: list }).eq('session_id', sessionId);
      }, 500);
      return { ...prev, session_struggles: list };
    });
  }, [sessionId, userId]);

  // Teacher: push a new lesson_id into shared state and reset slide index.
  const setLessonId = useCallback(async (lessonId: string) => {
    if (role !== 'teacher') return;
    setState(s => s ? { ...s, lesson_id: lessonId, current_slide_index: 0 } : s);
    await supabase
      .from('classroom_states')
      .update({ lesson_id: lessonId, current_slide_index: 0 })
      .eq('session_id', sessionId);
  }, [role, sessionId]);

  // Teacher: load (or clear) a supplemental item onto the shared canvas.
  // Core lesson_id is preserved so we can resume after.
  const loadSupplemental = useCallback(async (ref: SupplementalRef | null) => {
    if (role !== 'teacher') return;
    channelRef.current?.send({
      type: 'broadcast', event: 'supplemental',
      payload: { supplemental: ref, senderId: userId } satisfies SupplementalPayload,
    });
    setState(s => s ? { ...s, supplemental_ref: ref } : s);
    await supabase
      .from('classroom_states')
      .update({ supplemental_ref: ref })
      .eq('session_id', sessionId);
  }, [role, sessionId, userId]);

  // Anyone (student answer handlers): record an attempt for the 70% gate.
  const recordAnswer = useCallback(async ({ correct }: { correct: boolean }) => {
    setState(s => s ? {
      ...s,
      correct_count: (s.correct_count ?? 0) + (correct ? 1 : 0),
      attempt_count: (s.attempt_count ?? 0) + 1,
    } : s);
    // Read-modify-write (no RPC available; fine at low frequency).
    const { data: row } = await supabase
      .from('classroom_states')
      .select('correct_count, attempt_count')
      .eq('session_id', sessionId)
      .maybeSingle();
    await supabase
      .from('classroom_states')
      .update({
        correct_count: (row?.correct_count ?? 0) + (correct ? 1 : 0),
        attempt_count: (row?.attempt_count ?? 0) + 1,
      })
      .eq('session_id', sessionId);
  }, [sessionId]);

  // Teacher: end the class. Calls the edge function that computes the
  // 70% verdict and updates progression tables. Returns the verdict so
  // the UI can toast.
  const endClass = useCallback(async (studentId: string | null) => {
    if (role !== 'teacher' || !state?.lesson_id || !studentId) return null;
    const { data, error } = await supabase.functions.invoke('finalize-lesson-progress', {
      body: { sessionId, lessonId: state.lesson_id, studentId },
    });
    if (error) return { error: error.message };
    return data as { ok: boolean; final_score: number; passed: boolean; verdict: 'completed' | 'redo'; next_lesson_id: string | null };
  }, [role, sessionId, state?.lesson_id]);

  const onSupplemental = useCallback((h: (p: SupplementalPayload) => void) => {
    handlersRef.current.supplemental.push(h);
    return () => { handlersRef.current.supplemental = handlersRef.current.supplemental.filter(x => x !== h); };
  }, []);

  const isTeacher = role === 'teacher' && state?.teacher_id === userId;
  const peerOnline = peers.some(p => p.role !== role);
  const studentPeer = peers.find(p => p.role === 'student');

  return {
    state, peers, isConnected, isTeacher, peerOnline, studentPeer,
    setSlideIndex, setLessonId, sendStroke, sendLaser, clearStrokes, sendReward, sendHint,
    broadcastCursor, updateGameState, reportStruggle,
    loadSupplemental, recordAnswer, endClass, startClass,
    onStroke, onClear, onLaser, onReward, onHint, onCursor, onGameState, onStruggle, onSupplemental,
  };
}
