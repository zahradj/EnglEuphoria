import React, { useState, useEffect, useCallback } from 'react';
import { PollSlideRenderer } from '@/components/classroom/shared/PollSlideRenderer';
import { pollService, PollResponse } from '@/services/pollService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Users, Eye, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StudentPollViewProps {
  sessionId: string;
  slideId: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  studentId: string;
  studentName: string;
  pollActive: boolean;
  pollShowResults: boolean;
}

export const StudentPollView: React.FC<StudentPollViewProps> = ({
  sessionId,
  slideId,
  question,
  options,
  studentId,
  studentName,
  pollActive,
  pollShowResults,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<PollResponse[]>([]);
  const [voteStartTime] = useState(Date.now());

  // Load existing votes and check if already voted
  useEffect(() => {
    const loadVotes = async () => {
      const existingVotes = await pollService.getVotesForSlide(sessionId, slideId);
      setResponses(existingVotes);

      const myVote = existingVotes.find((v) => v.studentId === studentId);
      if (myVote) {
        setSelectedOptionId(myVote.selectedOptionId);
        setHasVoted(true);
      }
    };

    loadVotes();
  }, [sessionId, slideId, studentId]);

  // Subscribe to real-time votes
  useEffect(() => {
    const unsubscribe = pollService.subscribeToVotes(sessionId, slideId, (newResponse) => {
      setResponses((prev) => {
        const exists = prev.some((r) => r.id === newResponse.id);
        if (exists) return prev;
        return [...prev, newResponse];
      });
    });

    return unsubscribe;
  }, [sessionId, slideId]);

  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (hasVoted || !pollActive || isSubmitting) return;

      setIsSubmitting(true);
      setSelectedOptionId(optionId);

      const responseTimeMs = Date.now() - voteStartTime;

      const response = await pollService.submitVote(
        sessionId,
        slideId,
        studentId,
        studentName,
        optionId,
        responseTimeMs
      );

      if (response) {
        setHasVoted(true);
        toast.success('Vote submitted!');
      } else {
        toast.error('Failed to submit vote');
        setSelectedOptionId(null);
      }

      setIsSubmitting(false);
    },
    [hasVoted, pollActive, isSubmitting, sessionId, slideId, studentId, studentName, voteStartTime]
  );

  const voteDistribution = pollService.getVoteDistribution(responses);

  return (
    <div className="relative w-full h-full">
      {/* Live status strip — mirrors teacher's PollControlPanel */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-border">
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <Users className="h-3 w-3" />
          {responses.length}
        </Badge>
        <Badge
          variant={pollActive ? 'default' : 'secondary'}
          className={cn('text-xs', pollActive && 'bg-emerald-500 hover:bg-emerald-600')}
        >
          {pollActive ? (
            <><span className="inline-block h-1.5 w-1.5 rounded-full bg-white mr-1 animate-pulse" /> Voting Open</>
          ) : (
            <><Lock className="h-3 w-3 mr-1" /> Closed</>
          )}
        </Badge>
        {pollShowResults && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" /> Results
          </Badge>
        )}
      </div>

      <PollSlideRenderer
        question={question}
        options={options}
        selectedOptionId={selectedOptionId}
        showResults={pollShowResults}
        disabled={hasVoted || !pollActive || isSubmitting}
        voteDistribution={voteDistribution}
        onSelectOption={handleSelectOption}
      />

      {/* Vote confirmation overlay */}
      <AnimatePresence>
        {hasVoted && !pollShowResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 bg-emerald-500/90 text-white px-4 py-2 rounded-full shadow-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Vote submitted</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Poll status indicator */}
      {!pollActive && !hasVoted && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card px-6 py-4 rounded-xl shadow-lg border border-border text-center">
            <p className="text-lg font-medium text-foreground">
              Waiting for teacher to start the poll...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
