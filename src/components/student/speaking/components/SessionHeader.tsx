
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SpeakingScenario } from '@/types/speaking';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';

interface SessionHeaderProps {
  scenario: SpeakingScenario;
  elapsedTime: number;
  isAudioEnabled: boolean;
  onEndSession: () => void;
  onToggleAudio: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  scenario,
  elapsedTime,
  isAudioEnabled,
  onEndSession,
  onToggleAudio
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onEndSession}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          End Session
        </Button>
        <Badge variant="outline">{scenario.cefr_level}</Badge>
        <span className="text-lg font-medium">{scenario.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAudio}
        >
          {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <div className="text-lg font-mono">{formatTime(elapsedTime)}</div>
        <Progress value={(elapsedTime / scenario.expected_duration) * 100} className="w-32" />
      </div>
    </div>
  );
};
