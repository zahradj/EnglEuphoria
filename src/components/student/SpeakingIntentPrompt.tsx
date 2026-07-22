import { Mic, Ear } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SpeakingIntent } from '@/hooks/useSpeakingIntent';

interface SpeakingIntentPromptProps {
  onChoose: (intent: SpeakingIntent) => void;
}

/**
 * 2-second intent gate shown once per lesson session.
 * Default-action design: Bravery is primary, Listen-only is secondary.
 * Strict Flat 2.0 — no shadows, no 3D, semantic tokens only.
 */
export function SpeakingIntentPrompt({ onChoose }: SpeakingIntentPromptProps) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6 space-y-5 border-border bg-card">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold text-foreground">Speak today?</h2>
          <p className="text-sm text-muted-foreground">
            Brave attempts earn XP — even before they're perfect.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full justify-start gap-3"
            onClick={() => onChoose('bravery')}
          >
            <Mic className="h-5 w-5" />
            <span className="flex flex-col items-start leading-tight">
              <span className="font-semibold">Yes — I'll speak</span>
              <span className="text-xs opacity-80">Mic focuses automatically</span>
            </span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => onChoose('listen_only')}
          >
            <Ear className="h-5 w-5" />
            <span className="flex flex-col items-start leading-tight">
              <span className="font-semibold">Listen-only today</span>
              <span className="text-xs text-muted-foreground">Shadow & whisper, no scoring</span>
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
