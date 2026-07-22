import { Sparkles, Lightbulb, Award, ChevronLeft, ChevronRight, Mic, MicOff, Lock, LockOpen, X, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Props {
  slideIndex: number;
  slideCount: number;
  onPrev: () => void;
  onNext: () => void;
  onSendHint: () => void;
  onSendReward: (xp: number) => void;
  onOpenWrapUp?: () => void;
  wrapUpBadge?: number;
  onMuteStudent?: () => void;
  onFreezeInput?: () => void;
  onEndClass?: () => void;
  studentMuted?: boolean;
  inputFrozen?: boolean;
}

/**
 * Teacher 'God Mode' floating action bar. Renders only on the teacher
 * screen — caller is responsible for the role gate.
 */
export function TeacherControlsBar({
  slideIndex,
  slideCount,
  onPrev,
  onNext,
  onSendHint,
  onSendReward,
  onOpenWrapUp,
  wrapUpBadge,
  onMuteStudent,
  onFreezeInput,
  onEndClass,
  studentMuted,
  inputFrozen,
}: Props) {
  const [rewardOpen, setRewardOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl">
        <Button
          size="sm"
          variant="ghost"
          onClick={onPrev}
          disabled={slideIndex === 0}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-mono text-muted-foreground px-1 tabular-nums">
          {slideIndex + 1}/{slideCount}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onNext}
          disabled={slideIndex >= slideCount - 1}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button size="sm" variant="outline" onClick={onSendHint} className="gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Send Hint
        </Button>

        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRewardOpen(o => !o)}
            className="gap-1.5"
          >
            <Award className="h-4 w-4 text-emerald-500" />
            Send Reward
          </Button>
          {rewardOpen && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1 p-1 rounded-xl border border-border bg-popover shadow-lg">
              {[5, 10, 25].map(xp => (
                <button
                  key={xp}
                  className="px-2 py-1 rounded-lg text-xs font-bold hover:bg-emerald-500/15 text-emerald-600 inline-flex items-center gap-1"
                  onClick={() => { onSendReward(xp); setRewardOpen(false); }}
                >
                  <Sparkles className="h-3 w-3" /> +{xp} XP
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {onOpenWrapUp && (
          <Button size="sm" variant="outline" onClick={onOpenWrapUp} className="gap-1.5 relative">
            <ClipboardList className="h-4 w-4 text-primary" />
            Wrap Up
            {!!wrapUpBadge && wrapUpBadge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {wrapUpBadge}
              </span>
            )}
          </Button>
        )}

        {onMuteStudent && (
          <Button size="sm" variant="ghost" onClick={onMuteStudent} aria-label="Toggle student mic">
            {studentMuted ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
        {onFreezeInput && (
          <Button size="sm" variant="ghost" onClick={onFreezeInput} aria-label="Toggle freeze input">
            {inputFrozen ? <Lock className="h-4 w-4 text-destructive" /> : <LockOpen className="h-4 w-4" />}
          </Button>
        )}
        {onEndClass && (
          <Button size="sm" variant="destructive" onClick={onEndClass} className="gap-1.5">
            <X className="h-4 w-4" />
            End
          </Button>
        )}
      </div>
    </div>
  );
}
