import { supabase } from '@/lib/supabase';

export interface PollResponse {
  id: string;
  sessionId: string;
  slideId: string;
  studentId: string;
  studentName: string;
  selectedOptionId: string;
  responseTimeMs?: number;
  createdAt: string;
}

export interface PollState {
  pollActive: boolean;
  pollShowResults: boolean;
  currentPollSlideId: string | null;
}

class PollService {
  private channels: Map<string, any> = new Map();

  async submitVote(
    sessionId: string,
    slideId: string,
    studentId: string,
    studentName: string,
    optionId: string,
    responseTimeMs?: number
  ): Promise<PollResponse | null> {
    try {
      // Check if already voted
      const { data: existing } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('slide_id', slideId)
        .eq('student_id', studentId)
        .single();

      if (existing) {
        return this.mapToResponse(existing);
      }

      const { data, error } = await supabase
        .from('poll_responses')
        .insert({
          session_id: sessionId,
          slide_id: slideId,
          student_id: studentId,
          student_name: studentName,
          selected_option_id: optionId,
          response_time_ms: responseTimeMs
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapToResponse(data);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      return null;
    }
  }

  async getVotesForSlide(sessionId: string, slideId: string): Promise<PollResponse[]> {
    try {
      const { data, error } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('slide_id', slideId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(this.mapToResponse);
    } catch (error) {
      console.error('Failed to get votes:', error);
      return [];
    }
  }

  async clearVotes(sessionId: string, slideId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('poll_responses')
        .delete()
        .eq('session_id', sessionId)
        .eq('slide_id', slideId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to clear votes:', error);
      throw error;
    }
  }

  async updatePollState(roomId: string, state: Partial<PollState>): Promise<void> {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (state.pollActive !== undefined) {
        updateData.poll_active = state.pollActive;
      }
      if (state.pollShowResults !== undefined) {
        updateData.poll_show_results = state.pollShowResults;
      }
      if (state.currentPollSlideId !== undefined) {
        updateData.current_poll_slide_id = state.currentPollSlideId;
      }

      const { error } = await supabase
        .from('classroom_sessions')
        .update(updateData)
        .eq('room_id', roomId)
        .eq('session_status', 'active');

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update poll state:', error);
      throw error;
    }
  }

  getVoteDistribution(responses: PollResponse[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    responses.forEach((response) => {
      distribution[response.selectedOptionId] = (distribution[response.selectedOptionId] || 0) + 1;
    });
    return distribution;
  }

  subscribeToVotes(
    sessionId: string,
    slideId: string,
    callback: (response: PollResponse) => void
  ): () => void {
    const channelName = `poll_votes_${sessionId}_${slideId}`;

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
          table: 'poll_responses',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).slide_id === slideId) {
            callback(this.mapToResponse(payload.new));
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

  private mapToResponse(data: any): PollResponse {
    return {
      id: data.id,
      sessionId: data.session_id,
      slideId: data.slide_id,
      studentId: data.student_id,
      studentName: data.student_name,
      selectedOptionId: data.selected_option_id,
      responseTimeMs: data.response_time_ms,
      createdAt: data.created_at
    };
  }
}

export const pollService = new PollService();
