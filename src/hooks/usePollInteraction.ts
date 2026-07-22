import { useState, useEffect, useCallback } from 'react';
import { pollService, PollResponse, PollState } from '@/services/pollService';
import { classroomSyncService } from '@/services/classroomSyncService';

interface UsePollInteractionOptions {
  sessionId?: string;
  slideId?: string;
  roomId: string;
  isTeacher: boolean;
}

interface UsePollInteractionReturn {
  responses: PollResponse[];
  pollActive: boolean;
  pollShowResults: boolean;
  voteDistribution: Record<string, number>;
  startPoll: () => Promise<void>;
  closePoll: () => Promise<void>;
  toggleResults: () => Promise<void>;
  resetPoll: () => Promise<void>;
}

export const usePollInteraction = ({
  sessionId,
  slideId,
  roomId,
  isTeacher,
}: UsePollInteractionOptions): UsePollInteractionReturn => {
  const [responses, setResponses] = useState<PollResponse[]>([]);
  const [pollActive, setPollActive] = useState(false);
  const [pollShowResults, setPollShowResults] = useState(false);

  // Load existing responses
  useEffect(() => {
    if (!sessionId || !slideId) return;

    const loadResponses = async () => {
      const existingResponses = await pollService.getVotesForSlide(sessionId, slideId);
      setResponses(existingResponses);
    };

    loadResponses();
  }, [sessionId, slideId]);

  // Subscribe to real-time responses
  useEffect(() => {
    if (!sessionId || !slideId) return;

    const unsubscribe = pollService.subscribeToVotes(sessionId, slideId, (newResponse) => {
      setResponses((prev) => {
        const exists = prev.some((r) => r.id === newResponse.id);
        if (exists) return prev;
        return [...prev, newResponse];
      });
    });

    return unsubscribe;
  }, [sessionId, slideId]);

  const startPoll = useCallback(async () => {
    if (!isTeacher) return;
    try {
      await pollService.updatePollState(roomId, {
        pollActive: true,
        pollShowResults: false,
        currentPollSlideId: slideId || null,
      });
      setPollActive(true);
      setPollShowResults(false);
    } catch (error) {
      console.error('Failed to start poll:', error);
    }
  }, [isTeacher, roomId, slideId]);

  const closePoll = useCallback(async () => {
    if (!isTeacher) return;
    try {
      await pollService.updatePollState(roomId, {
        pollActive: false,
      });
      setPollActive(false);
    } catch (error) {
      console.error('Failed to close poll:', error);
    }
  }, [isTeacher, roomId]);

  const toggleResults = useCallback(async () => {
    if (!isTeacher) return;
    try {
      const newShowResults = !pollShowResults;
      await pollService.updatePollState(roomId, {
        pollShowResults: newShowResults,
      });
      setPollShowResults(newShowResults);
    } catch (error) {
      console.error('Failed to toggle results:', error);
    }
  }, [isTeacher, roomId, pollShowResults]);

  const resetPoll = useCallback(async () => {
    if (!isTeacher || !sessionId || !slideId) return;
    try {
      await pollService.clearVotes(sessionId, slideId);
      await pollService.updatePollState(roomId, {
        pollActive: false,
        pollShowResults: false,
      });
      setResponses([]);
      setPollActive(false);
      setPollShowResults(false);
    } catch (error) {
      console.error('Failed to reset poll:', error);
    }
  }, [isTeacher, sessionId, slideId, roomId]);

  const voteDistribution = pollService.getVoteDistribution(responses);

  return {
    responses,
    pollActive,
    pollShowResults,
    voteDistribution,
    startPoll,
    closePoll,
    toggleResults,
    resetPoll,
  };
};
