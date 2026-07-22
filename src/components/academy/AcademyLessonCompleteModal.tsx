import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Sparkles } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

interface AcademyLessonCompleteModalProps {
  open: boolean;
  onClose: () => void;
  xpGained?: number;
  coinsEarned?: number;
  onContinue?: () => void;
}

/**
 * Sleek Academy "Lesson Complete" modal — no confetti, no mascot, no sound.
 * Big ProfileAvatar centered, XP gained row, coins-earned animated counter,
 * primary Continue button.
 */
export default function AcademyLessonCompleteModal({
  open,
  onClose,
  xpGained = 0,
  coinsEarned = 0,
  onContinue,
}: AcademyLessonCompleteModalProps) {
  const [displayCoins, setDisplayCoins] = useState(0);

  useEffect(() => {
    if (!open) {
      setDisplayCoins(0);
      return;
    }
    const duration = 800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayCoins(Math.round(coinsEarned * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, coinsEarned]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-hub="academy">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Lesson Complete</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5 py-2">
          <ProfileAvatar size="xl" clickable={false} />
          <div className="flex flex-col items-center gap-3">
            {xpGained > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-medium">+{xpGained} XP</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-base">
              <Coins className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="font-semibold tabular-nums text-primary">
                +{displayCoins} Coins
              </span>
            </div>
          </div>
          <Button
            className="mt-2 w-full"
            onClick={() => {
              onContinue?.();
              onClose();
            }}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
