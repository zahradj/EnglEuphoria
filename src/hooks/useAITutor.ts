import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AITutoringSession {
  id: string;
  student_id: string;
  conversation_id: string;
  session_type: 'voice' | 'text' | 'mixed';
  topic?: string;
  cefr_level: string;
  duration_seconds: number;
  messages_count: number;
  ai_model: string;
  voice_model?: string;
  session_data: any;
  learning_objectives: string[];
  completed_objectives: string[];
  session_rating?: number;
  feedback_notes?: string;
  started_at: string;
  ended_at?: string;
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  message_type: 'user_text' | 'user_audio' | 'ai_text' | 'ai_audio';
  content?: string;
  audio_url?: string;
  audio_duration?: number;
  metadata: any;
  processing_time_ms?: number;
  tokens_used?: number;
  created_at: string;
}

export const useAITutor = () => {
  const [currentSession, setCurrentSession] = useState<AITutoringSession | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startSession = async (
    studentId: string,
    cefrLevel: string,
    sessionType: 'voice' | 'text' | 'mixed' = 'text',
    topic?: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_tutoring_sessions')
        .insert({
          student_id: studentId,
          conversation_id: crypto.randomUUID(),
          session_type: sessionType,
          topic,
          cefr_level: cefrLevel,
          ai_model: 'gemini-3-flash-preview',
          voice_model: sessionType !== 'text' ? 'alloy' : null,
          learning_objectives: ['conversational_practice', 'grammar_improvement', 'vocabulary_expansion']
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      setIsConnected(true);
      setMessages([]);

      toast({ title: "AI Tutor Started", description: `Started ${sessionType} session for ${cefrLevel} level` });
      return data;
    } catch (error) {
      console.error('Error starting session:', error);
      toast({ title: "Error", description: "Failed to start AI tutoring session", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async (rating?: number, feedback?: string) => {
    if (!currentSession) return;
    try {
      const endTime = new Date().toISOString();
      const duration = Math.floor((new Date(endTime).getTime() - new Date(currentSession.started_at).getTime()) / 1000);
      const { error } = await supabase
        .from('ai_tutoring_sessions')
        .update({ ended_at: endTime, duration_seconds: duration, session_rating: rating, feedback_notes: feedback })
        .eq('id', currentSession.id);
      if (error) throw error;
      setCurrentSession(null);
      setIsConnected(false);
      setMessages([]);
      toast({ title: "Session Ended", description: "AI tutoring session completed successfully" });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({ title: "Error", description: "Failed to end session properly", variant: "destructive" });
    }
  };

  const sendMessage = async (message: string) => {
    if (!currentSession) throw new Error('No active session');

    setIsProcessing(true);
    setStreamingContent('');

    // Optimistically add user message
    const tempUserMsg: ConversationMessage = {
      id: `temp-user-${Date.now()}`,
      session_id: currentSession.id,
      message_type: 'user_text',
      content: message,
      metadata: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message,
          sessionId: currentSession.id,
          studentId: currentSession.student_id,
          cefrLevel: currentSession.cefr_level,
          sessionType: currentSession.session_type,
          stream: true,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Unknown error' }));
        if (resp.status === 429) {
          toast({ title: "Rate Limited", description: errData.error || "Please try again later.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "Credits Exhausted", description: errData.error || "Please add funds.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: errData.error || "Failed to get AI response", variant: "destructive" });
        }
        throw new Error(errData.error);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';
      let hasContext = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Finalize: replace streaming content with a proper message
      setStreamingContent('');
      
      // Reload messages from DB to get persisted versions
      await loadMessages(currentSession.id);

      return { hasContext };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setStreamingContent('');
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_conversation_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const getTutoringSessions = async (studentId: string, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('ai_tutoring_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('started_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  };

  const resumeSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_tutoring_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error) throw error;
      if (!data.ended_at) {
        setCurrentSession(data);
        setIsConnected(true);
        await loadMessages(sessionId);
        toast({ title: "Session Resumed", description: "Continued your AI tutoring session" });
      } else {
        toast({ title: "Session Ended", description: "This session has already been completed", variant: "destructive" });
      }
      return data;
    } catch (error) {
      console.error('Error resuming session:', error);
      toast({ title: "Error", description: "Failed to resume session", variant: "destructive" });
    }
  };

  const markObjectiveCompleted = async (objective: string) => {
    if (!currentSession) return;
    try {
      const updatedObjectives = [...(currentSession.completed_objectives || []), objective];
      const { error } = await supabase
        .from('ai_tutoring_sessions')
        .update({ completed_objectives: updatedObjectives })
        .eq('id', currentSession.id);
      if (error) throw error;
      setCurrentSession({ ...currentSession, completed_objectives: updatedObjectives });
    } catch (error) {
      console.error('Error marking objective completed:', error);
    }
  };

  const getSessionAnalytics = async (studentId: string, days = 30) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const { data, error } = await supabase
        .from('ai_tutoring_sessions')
        .select('*')
        .eq('student_id', studentId)
        .gte('started_at', startDate.toISOString())
        .not('ended_at', 'is', null);
      if (error) throw error;
      const totalSessions = data.length;
      const totalTime = data.reduce((sum, session) => sum + (session.duration_seconds || 0), 0);
      const averageRating = data.filter(s => s.session_rating).reduce((sum, s) => sum + s.session_rating, 0) / data.filter(s => s.session_rating).length || 0;
      const sessionTypes = data.reduce((acc, session) => {
        acc[session.session_type] = (acc[session.session_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return {
        totalSessions,
        totalTimeMinutes: Math.floor(totalTime / 60),
        averageRating: Math.round(averageRating * 100) / 100,
        sessionTypes,
        recentSessions: data.slice(-5)
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  };

  return {
    currentSession,
    messages,
    streamingContent,
    isConnected,
    isLoading,
    isProcessing,
    startSession,
    endSession,
    sendMessage,
    loadMessages,
    getTutoringSessions,
    resumeSession,
    markObjectiveCompleted,
    getSessionAnalytics
  };
};
