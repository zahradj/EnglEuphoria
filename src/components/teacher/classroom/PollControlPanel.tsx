import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, EyeOff, Lock, RotateCcw, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollControlPanelProps {
  pollActive: boolean;
  pollShowResults: boolean;
  responsesCount: number;
  onStartPoll: () => void;
  onToggleResults: () => void;
  onClosePoll: () => void;
  onResetPoll: () => void;
}

export const PollControlPanel: React.FC<PollControlPanelProps> = ({
  pollActive,
  pollShowResults,
  responsesCount,
  onStartPoll,
  onToggleResults,
  onClosePoll,
  onResetPoll,
}) => {
  return (
    <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border">
      {/* Response Count */}
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {responsesCount}
      </Badge>

      {/* Status Indicator */}
      <Badge
        variant={pollActive ? 'default' : 'secondary'}
        className={cn(
          pollActive && 'bg-emerald-500 hover:bg-emerald-600'
        )}
      >
        {pollActive ? 'Voting Open' : 'Closed'}
      </Badge>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Control Buttons */}
      {!pollActive ? (
        <Button
          size="sm"
          onClick={onStartPoll}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Play className="h-4 w-4 mr-1" />
          Start Poll
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          onClick={onClosePoll}
        >
          <Lock className="h-4 w-4 mr-1" />
          Close Poll
        </Button>
      )}

      <Button
        size="sm"
        variant={pollShowResults ? 'default' : 'outline'}
        onClick={onToggleResults}
      >
        {pollShowResults ? (
          <>
            <EyeOff className="h-4 w-4 mr-1" />
            Hide Results
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Show Results
          </>
        )}
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={onResetPoll}
        title="Reset Poll"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
