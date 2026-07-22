import { useState } from 'react';
import type { PageRendererProps } from '../PageRenderer';
import type { SpeakingCheckpointContent } from '@/storybook/types';
import { Mic, MicOff } from 'lucide-react';

export function SpeakingCheckpointPage({ page, onSpeakingAttempt }: PageRendererProps) {
  const data = (page.content as { type: 'speaking_checkpoint'; data: SpeakingCheckpointContent }).data;
  const [recording, setRecording] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const toggle = () => {
    if (!recording) {
      setRecording(true);
      // Simplified — real impl wires MediaRecorder + speech_attempts table.
      setTimeout(() => {
        setRecording(false);
        setAttempted(true);
        onSpeakingAttempt?.({ rung: data.rung, target_phrase: data.target_phrase });
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center text-center gap-6 px-6">
      <span className="text-xs uppercase tracking-widest text-primary font-semibold">Your turn to speak</span>
      <h3 className="text-2xl md:text-3xl font-semibold text-foreground max-w-xl">{data.prompt}</h3>
      {data.target_phrase && (
        <p className="text-xl italic text-muted-foreground">"{data.target_phrase}"</p>
      )}
      <button
        type="button"
        onClick={toggle}
        className={`h-24 w-24 rounded-full grid place-items-center text-primary-foreground transition-transform
          ${recording ? 'bg-destructive animate-pulse' : 'bg-primary hover:scale-105'}`}
        aria-label="Record speaking attempt"
      >
        {recording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
      </button>
      <p className="text-sm text-muted-foreground">
        {recording ? 'Listening…' : attempted ? 'Great bravery! Continue when ready.' : 'Tap to record'}
      </p>
    </div>
  );
}
