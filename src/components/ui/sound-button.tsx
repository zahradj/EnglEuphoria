import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { audioService } from "@/services/audioService";

export type SoundButtonType =
  | 'click'
  | 'success'
  | 'error'
  | 'reward'
  | 'star'
  | 'badge'
  | 'sticker'
  | 'dice'
  | 'timer'
  | 'celebration';

interface SoundButtonProps extends ButtonProps {
  soundType?: SoundButtonType;
  rewardPoints?: number;
  children: React.ReactNode;
}

export function SoundButton({
  soundType = 'click',
  rewardPoints = 10,
  onClick,
  children,
  ...props
}: SoundButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    switch (soundType) {
      case 'click':
        audioService.playButtonClick();
        break;
      case 'success':
        audioService.playSuccessSound();
        break;
      case 'error':
        audioService.playErrorSound();
        break;
      case 'reward':
        audioService.playRewardSound(rewardPoints);
        break;
      case 'star':
        audioService.playStarSound();
        break;
      case 'badge':
      case 'sticker':
        audioService.playStickerSound();
        break;
      case 'dice':
        audioService.playDiceSound();
        break;
      case 'timer':
        audioService.playTimerWarningSound();
        break;
      case 'celebration':
        audioService.playCelebrationSound();
        break;
    }

    if (onClick) onClick(e);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
