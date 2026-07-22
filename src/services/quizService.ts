import { supabase } from '@/lib/supabase';

export interface QuizResponse {
  id: string;
  sessionId: string;
  slideId: string;
  studentId: string;
  studentName: string;
  selectedOptionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  createdAt: string;
}

export interface QuizState {
  quizActive: boolean;
  quizLocked: boolean;
  quizRevealAnswer: boolean;
  currentQuizSlideId: string | null;
}

class QuizService {
  private channels: Map<string, any> = new Map();

  async submitAnswer(
    sessionId: string,
    slideId: string,
    studentId: string,
    studentName: string,
    selectedOptionId: string,
    isCorrect: boolean,
    responseTimeMs: number
  ): Promise<QuizResponse | null> {
    try {
      // Check if student already answered this question
      const { data: existing } = await supabase
        .from('quiz_responses')
        .select('id')
        .eq('session_id', sessionId)
        .eq('slide_id', slideId)
        .eq('student_id', studentId)
        .single();

      if (existing) {
        console.warn('Student already answered this question');
        return null;
      }

      const { data, error } = await supabase
        .from('quiz_responses')
        .insert({
          session_id: sessionId,
          slide_id: slideId,
          student_id: studentId,
          student_name: studentName,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect,
          response_time_ms: responseTimeMs
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToQuizResponse(data);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return null;
    }
  }

  async getResponsesForSlide(sessionId: string, slideId: string): Promise<QuizResponse[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('slide_id', slideId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(this.mapToQuizResponse);
    } catch (error) {
      console.error('Failed to get responses:', error);
      return [];
    }
  }

  async clearResponses(sessionId: string, slideId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .delete()
        .eq('session_id', sessionId)
        .eq('slide_id', slideId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to clear responses:', error);
    }
  }

  async updateQuizState(roomId: string, state: Partial<QuizState>): Promise<void> {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (state.quizActive !== undefined) {
        updateData.quiz_active = state.quizActive;
      }
      if (state.quizLocked !== undefined) {
        updateData.quiz_locked = state.quizLocked;
      }
      if (state.quizRevealAnswer !== undefined) {
        updateData.quiz_reveal_answer = state.quizRevealAnswer;
      }
      if (state.currentQuizSlideId !== undefined) {
        updateData.current_quiz_slide_id = state.currentQuizSlideId;
      }

      const { error } = await supabase
        .from('classroom_sessions')
        .update(updateData)
        .eq('room_id', roomId)
        .eq('session_status', 'active');

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update quiz state:', error);
      throw error;
    }
  }

  subscribeToResponses(
    sessionId: string,
    slideId: string,
    onNewResponse: (response: QuizResponse) => void
  ): () => void {
    const channelName = `quiz_responses_${sessionId}_${slideId}`;

    if (this.channels.has(channelName)) {
      supabase.removeChannel(this.channels.get(channelName));
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_responses',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new.slide_id === slideId) {
            onNewResponse(this.mapToQuizResponse(payload.new));
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

  private mapToQuizResponse(data: any): QuizResponse {
    return {
      id: data.id,
      sessionId: data.session_id,
      slideId: data.slide_id,
      studentId: data.student_id,
      studentName: data.student_name,
      selectedOptionId: data.selected_option_id,
      isCorrect: data.is_correct,
      responseTimeMs: data.response_time_ms,
      createdAt: data.created_at
    };
  }

  disconnect(sessionId: string, slideId: string) {
    const channelName = `quiz_responses_${sessionId}_${slideId}`;
    if (this.channels.has(channelName)) {
      supabase.removeChannel(this.channels.get(channelName));
      this.channels.delete(channelName);
    }
  }
}

export const quizService = new QuizService();
